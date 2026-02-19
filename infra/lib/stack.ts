import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path';

interface DreamsOfTheDeepStackProps extends cdk.StackProps {
  stage: string;
}

export class DreamsOfTheDeepStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DreamsOfTheDeepStackProps) {
    super(scope, id, props);

    const { stage } = props;
    const distPath = path.join(__dirname, '..', '..', 'dist');
    const domainName = 'dreamsofthedeep.com';

    // ---- Domain + Certificate ----
    const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate',
      'arn:aws:acm:us-east-1:015809852967:certificate/8148ef17-ae0b-4d11-8868-6d38421131d9'
    );

    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName,
    });

    // ---- S3 Bucket for book content (markdown + images, synced from book repos) ----
    const contentBucket = new s3.Bucket(this, 'BookContent', {
      bucketName: `dotd-content-${stage}`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
    });

    // ---- S3 Bucket for static assets ----
    const staticBucket = new s3.Bucket(this, 'StaticAssets', {
      bucketName: `dreams-of-the-deep-static-${stage}`,
      removalPolicy: stage === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: stage !== 'production',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // ---- Lambda Function for server-side routes (API endpoints) ----
    const ssrFunction = new lambda.Function(this, 'SsrFunction', {
      functionName: `dreams-ssr-${stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'entry.handler',
      code: lambda.Code.fromAsset(path.join(distPath, 'server')),
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      environment: {
        NODE_ENV: 'production',
        ASTRO_NODE_AUTOSTART: 'false',
        HOST: '0.0.0.0',
        PORT: '4321',
        // Runtime secrets passed via CDK context or env vars at deploy time
        DATABASE_URL: process.env.DATABASE_URL || '',
        JWT_SECRET: process.env.JWT_SECRET || '',
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
        STRIPE_PRICE_PREMIUM: process.env.STRIPE_PRICE_PREMIUM || '',
      },
    });

    // Lambda Function URL (HTTPS endpoint for CloudFront)
    const functionUrl = ssrFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      invokeMode: lambda.InvokeMode.RESPONSE_STREAM,
    });

    // ---- CloudFront Function: rewrite URIs to index.html ----
    // defaultRootObject only works for "/", not subdirectories.
    // This rewrites /the-outer-tokens → /the-outer-tokens/index.html
    const urlRewrite = new cloudfront.Function(this, 'UrlRewrite', {
      functionName: `dreams-url-rewrite-${stage}`,
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri.startsWith('/api/')) {
    return request;
  }
  if (uri.endsWith('/')) {
    request.uri += 'index.html';
  } else if (!uri.includes('.')) {
    request.uri += '/index.html';
  }
  return request;
}
      `.trim()),
    });

    // ---- CloudFront Distribution ----
    const s3Origin = origins.S3BucketOrigin.withOriginAccessControl(staticBucket);

    // Lambda origin for /api/* routes
    const lambdaOrigin = new origins.FunctionUrlOrigin(functionUrl);

    // Cache policy for static pages (moderate caching, allows fast redeploy)
    const pageCachePolicy = new cloudfront.CachePolicy(this, 'PageCachePolicy', {
      cachePolicyName: `dreams-pages-${stage}`,
      defaultTtl: cdk.Duration.hours(1),
      maxTtl: cdk.Duration.days(1),
      minTtl: cdk.Duration.seconds(0),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    // Cache policy for hashed assets (aggressive, immutable)
    const assetCachePolicy = new cloudfront.CachePolicy(this, 'AssetCachePolicy', {
      cachePolicyName: `dreams-assets-${stage}`,
      defaultTtl: cdk.Duration.days(365),
      maxTtl: cdk.Duration.days(365),
      minTtl: cdk.Duration.days(1),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    // Origin request policy for API routes — forward all needed headers & body
    const apiOriginRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'ApiOriginRequestPolicy', {
      originRequestPolicyName: `dreams-api-origin-${stage}`,
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList(
        'content-type',
        'cookie',
        'stripe-signature',
      ),
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
    });

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      domainNames: stage === 'production' ? [domainName, `www.${domainName}`] : [],
      certificate: stage === 'production' ? certificate : undefined,
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 404,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: pageCachePolicy,
        functionAssociations: [{
          function: urlRewrite,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        }],
      },
      additionalBehaviors: {
        '/api/*': {
          origin: lambdaOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: apiOriginRequestPolicy,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        },
        '/_astro/*': {
          origin: s3Origin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: assetCachePolicy,
        },
        '/images/*': {
          origin: s3Origin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: assetCachePolicy,
        },
      },
    });

    // ---- Deploy static assets to S3 ----
    new s3deploy.BucketDeployment(this, 'DeployStaticAssets', {
      sources: [s3deploy.Source.asset(path.join(distPath, 'client'))],
      destinationBucket: staticBucket,
      cacheControl: [
        s3deploy.CacheControl.setPublic(),
        s3deploy.CacheControl.maxAge(cdk.Duration.minutes(5)),
      ],
      distribution,
      distributionPaths: ['/*'],
    });

    // ---- Route 53 Records ----
    if (stage === 'production') {
      new route53.ARecord(this, 'AliasRecord', {
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(
          new route53Targets.CloudFrontTarget(distribution)
        ),
      });

      new route53.AaaaRecord(this, 'AliasRecordIPv6', {
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(
          new route53Targets.CloudFrontTarget(distribution)
        ),
      });

      new route53.ARecord(this, 'WwwAliasRecord', {
        zone: hostedZone,
        recordName: 'www',
        target: route53.RecordTarget.fromAlias(
          new route53Targets.CloudFrontTarget(distribution)
        ),
      });

      new route53.AaaaRecord(this, 'WwwAliasRecordIPv6', {
        zone: hostedZone,
        recordName: 'www',
        target: route53.RecordTarget.fromAlias(
          new route53Targets.CloudFrontTarget(distribution)
        ),
      });
    }

    // ---- Outputs ----
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID',
    });

    new cdk.CfnOutput(this, 'StaticBucketName', {
      value: staticBucket.bucketName,
      description: 'S3 bucket for static assets',
    });

    new cdk.CfnOutput(this, 'ContentBucketName', {
      value: contentBucket.bucketName,
      description: 'S3 bucket for book content',
    });

    new cdk.CfnOutput(this, 'SsrFunctionName', {
      value: ssrFunction.functionName,
      description: 'Lambda function for SSR API routes',
    });

    new cdk.CfnOutput(this, 'SsrFunctionUrl', {
      value: functionUrl.url,
      description: 'Lambda function URL',
    });
  }
}
