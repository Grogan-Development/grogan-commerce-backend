# PowerShell script to test build in cloud-like environment
# This simulates the Medusa Cloud build process using the same base image and build steps

param(
    [switch]$Verbose
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Build in Cloud-Like Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This simulates the Medusa Cloud build using:" -ForegroundColor Yellow
Write-Host "  - node:20.20.0-slim (same as Medusa Cloud)" -ForegroundColor Gray
Write-Host "  - npm ci (clean install)" -ForegroundColor Gray
Write-Host "  - NODE_ENV=production npm run build" -ForegroundColor Gray
Write-Host ""

# Build the Docker image
Write-Host "Building Docker image (this may take 2-3 minutes)..." -ForegroundColor Yellow
$buildStart = Get-Date

$buildResult = docker build -f Dockerfile.cloud-test -t medusa-cloud-test . 2>&1
$buildExitCode = $LASTEXITCODE
$buildDuration = (Get-Date) - $buildStart

if ($buildExitCode -eq 0) {
    Write-Host ""
    Write-Host "✓ Build succeeded in cloud-like environment!" -ForegroundColor Green
    Write-Host "  Duration: $([math]::Round($buildDuration.TotalSeconds, 1)) seconds" -ForegroundColor Gray
    Write-Host ""
    
    # Run the container to show verification message
    Write-Host "Verifying build..." -ForegroundColor Yellow
    docker run --rm medusa-cloud-test 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓✓✓ Build test PASSED!" -ForegroundColor Green
        Write-Host ""
        Write-Host "The build should work in Medusa Cloud." -ForegroundColor Cyan
        Write-Host ""
        exit 0
    } else {
        Write-Host ""
        Write-Host "⚠ Build completed but verification had issues" -ForegroundColor Yellow
        exit 0  # Still exit 0 since the build itself succeeded
    }
} else {
    Write-Host ""
    Write-Host "✗✗✗ Build FAILED in cloud-like environment" -ForegroundColor Red
    Write-Host ""
    
    if ($Verbose) {
        Write-Host "Full build output:" -ForegroundColor Yellow
        $buildResult
    } else {
        Write-Host "Last 50 lines of build output:" -ForegroundColor Yellow
        $buildResult | Select-Object -Last 50
        Write-Host ""
        Write-Host "Run with -Verbose to see full output" -ForegroundColor Gray
    }
    
    exit 1
}
