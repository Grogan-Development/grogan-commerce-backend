# Cloud Build Testing

This directory contains tools to test builds in an environment that closely matches Medusa Cloud's build process.

## Why Test Cloud Builds Locally?

Local builds can pass while cloud builds fail due to:
- Different Node.js versions
- Different base images (Alpine vs Debian)
- Different build environments
- Missing dependencies
- Environment variable differences

## Quick Test

Run the PowerShell script:

```powershell
.\test-cloud-build.ps1
```

Or manually:

```bash
docker build -f Dockerfile.cloud-test -t medusa-cloud-test .
docker run --rm medusa-cloud-test
```

## What It Tests

The `Dockerfile.cloud-test` simulates Medusa Cloud's build environment:

1. **Base Image**: `node:20.20.0-slim` (Debian-based, same as Medusa Cloud)
2. **Dependencies**: Installs `curl`, `procps`, `jq` (same as cloud)
3. **Install**: Runs `npm ci --no-audit` (clean install)
4. **Build**: Runs `NODE_ENV=production npm run build`

## When to Run

- Before pushing to main branch
- After making TypeScript changes
- After adding new dependencies
- When local builds pass but cloud builds fail

## CI Integration

A GitHub Actions workflow (`.github/workflows/test-cloud-build.yml`) can automatically test builds on pull requests.

## Troubleshooting

If the cloud build test fails but local build passes:

1. Check Node.js version differences
2. Verify all dependencies are in `package.json` (not just `package-lock.json`)
3. Check for platform-specific code
4. Ensure environment variables are properly handled
5. Look for missing system dependencies
