param(
    [ValidateSet("production", "staging")]
    [string]$Stage = "production"
)

$env:AWS_PROFILE = "dotd"

Write-Host "Deploying [$Stage]..." -ForegroundColor Cyan

try {
    Write-Host "Building Astro site..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }

    Write-Host "Installing CDK dependencies..." -ForegroundColor Cyan
    Push-Location infra

    npm install
    if ($LASTEXITCODE -ne 0) { throw "CDK install failed" }

    Write-Host "Bootstrapping CDK..." -ForegroundColor Cyan
    npx cdk bootstrap
    if ($LASTEXITCODE -ne 0) { throw "Bootstrap failed" }

    Write-Host "Deploying to $Stage..." -ForegroundColor Cyan
    npx cdk deploy --context stage=$Stage --require-approval never
    if ($LASTEXITCODE -ne 0) { throw "Deploy failed" }

    Write-Host "Invalidating CloudFront cache..." -ForegroundColor Cyan
    $distId = (npx cdk context --json 2>$null | ConvertFrom-Json)."distribution-id" 2>$null
    if (-not $distId) {
        $stackName = "DreamsOfTheDeep-$Stage"
        $distId = aws cloudformation describe-stacks --stack-name $stackName --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text
    }
    if ($distId) {
        aws cloudfront create-invalidation --distribution-id $distId --paths "/*"
        if ($LASTEXITCODE -ne 0) { Write-Host "Cache invalidation failed" -ForegroundColor Yellow }
        else { Write-Host "Cache invalidated" -ForegroundColor Green }
    } else {
        Write-Host "Could not find distribution ID, skipping invalidation" -ForegroundColor Yellow
    }

    Write-Host "$Stage deploy complete!" -ForegroundColor Green
}
catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}
