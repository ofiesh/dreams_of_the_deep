param(
    [ValidateSet("production", "staging")]
    [string]$Stage = "production",
    [switch]$SkipBuild
)

$env:AWS_PROFILE = "dotd"

# Export SSO credentials as env vars so CDK's bundled SDK can use them
Write-Host "Resolving AWS credentials..." -ForegroundColor Cyan
$creds = aws configure export-credentials --profile dotd --format env-no-export 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "SSO session expired. Run: aws sso login --profile dotd" -ForegroundColor Red
    exit 1
}
foreach ($line in $creds) {
    if ($line -match '^(\w+)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], "Process")
    }
}

Write-Host "Deploying [$Stage]..." -ForegroundColor Cyan

try {
    if (-not $SkipBuild) {
        Write-Host "Building Astro site..." -ForegroundColor Cyan
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "Build failed" }
    } else {
        Write-Host "Skipping build (using existing dist/)..." -ForegroundColor Yellow
    }

    Write-Host "Installing CDK dependencies..." -ForegroundColor Cyan
    Push-Location infra

    npm install
    if ($LASTEXITCODE -ne 0) { throw "CDK install failed" }

    Write-Host "Bootstrapping CDK..." -ForegroundColor Cyan
    npx cdk bootstrap --profile dotd
    if ($LASTEXITCODE -ne 0) { throw "Bootstrap failed" }

    Write-Host "Deploying to $Stage..." -ForegroundColor Cyan
    npx cdk deploy --context stage=$Stage --require-approval never --profile dotd
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
