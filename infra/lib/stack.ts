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
    const projectRoot = path.join(__dirname, '..', '..');
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

    // ---- S3 Bucket for static assets (/_astro/* hashed CSS/JS) ----
    const staticBucket = new s3.Bucket(this, 'StaticAssets', {
      bucketName: `dreams-of-the-deep-static-${stage}`,
      removalPolicy: stage === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: stage !== 'production',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // ---- Lambda Function (Astro SSR via Lambda Web Adapter) ----
    const webAdapterLayer = lambda.LayerVersion.fromLayerVersionArn(
      this, 'WebAdapterLayer',
      // AWS Lambda Web Adapter v0.8.4 for x86_64 in us-east-2
      'arn:aws:lambda:us-east-2:753240598075:layer:LambdaAdapterLayerX86:24'
    );

    const ssrFunction = new lambda.Function(this, 'SsrFunction', {
      functionName: `dotd-ssr-${stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'run.handler',
      code: lambda.Code.fromAsset(path.join(projectRoot, 'lambda-bundle')),
      layers: [webAdapterLayer],
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      environment: {
        CONTENT_BUCKET: contentBucket.bucketName,
        JWT_SECRET: process.env.JWT_SECRET || 'change-me-in-production',
        PREVIEW_TOKEN: process.env.PREVIEW_TOKEN || 'change-me-in-production',
        RUST_LOG: 'info',
        PORT: '4321',
        HOST: '0.0.0.0',
        READINESS_CHECK_PATH: '/',
      },
    });

    // Grant Lambda read access to content bucket
    contentBucket.grantRead(ssrFunction);

    // Lambda Function URL (no API Gateway needed)
    const functionUrl = ssrFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    // ---- CloudFront Origins ----
    const s3Origin = origins.S3BucketOrigin.withOriginAccessControl(staticBucket);
    const contentOrigin = origins.S3BucketOrigin.withOriginAccessControl(contentBucket);

    // Lambda Function URL origin
    // Extract hostname from function URL (https://xxx.lambda-url.us-east-2.on.aws/)
    const lambdaOrigin = new origins.FunctionUrlOrigin(functionUrl);

    // ---- Cache Policies ----

    // Immutable hashed assets (/_astro/*)
    const assetCachePolicy = new cloudfront.CachePolicy(this, 'AssetCachePolicy', {
      cachePolicyName: `dreams-assets-${stage}`,
      defaultTtl: cdk.Duration.days(365),
      maxTtl: cdk.Duration.days(365),
      minTtl: cdk.Duration.days(1),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    // Images (24 hour cache)
    const imageCachePolicy = new cloudfront.CachePolicy(this, 'ImageCachePolicy', {
      cachePolicyName: `dreams-images-${stage}`,
      defaultTtl: cdk.Duration.hours(24),
      maxTtl: cdk.Duration.days(7),
      minTtl: cdk.Duration.seconds(0),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    // Public pages (1 hour TTL, invalidated on content change)
    const pageCachePolicy = new cloudfront.CachePolicy(this, 'PageCachePolicy', {
      cachePolicyName: `dreams-pages-${stage}`,
      defaultTtl: cdk.Duration.hours(1),
      maxTtl: cdk.Duration.days(1),
      minTtl: cdk.Duration.seconds(0),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    // Preview pages: no cache (cookies forwarded via origin request policy)
    const noCachePolicy = cloudfront.CachePolicy.CACHING_DISABLED;

    // ---- CloudFront Distribution ----
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      domainNames: stage === 'production' ? [domainName, `www.${domainName}`] : [],
      certificate: stage === 'production' ? certificate : undefined,
      // No defaultRootObject — Lambda handles /
      defaultBehavior: {
        origin: lambdaOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: pageCachePolicy,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      },
      additionalBehaviors: {
        '/_astro/*': {
          origin: s3Origin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: assetCachePolicy,
        },
        '/images/*': {
          origin: contentOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: imageCachePolicy,
        },
        '/preview/*': {
          origin: lambdaOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: noCachePolicy,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
      },
    });

    // ---- Deploy static assets to S3 ----
    new s3deploy.BucketDeployment(this, 'DeployStaticAssets', {
      sources: [s3deploy.Source.asset(path.join(projectRoot, 'dist', 'client'))],
      destinationBucket: staticBucket,
      cacheControl: [
        s3deploy.CacheControl.setPublic(),
        s3deploy.CacheControl.maxAge(cdk.Duration.minutes(5)),
      ],
      distribution,
      distributionPaths: ['/_astro/*'],
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

    new cdk.CfnOutput(this, 'FunctionUrl', {
      value: functionUrl.url,
      description: 'Lambda Function URL',
    });
  }
}
