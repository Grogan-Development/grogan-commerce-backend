# Product Upload Instructions

## Option 1: Run via API Route (Recommended)

Once your Medusa backend is deployed and running, you can trigger the upload via an API call:

```bash
# Dry run
curl -X POST https://your-backend-url.com/admin/upload-products \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'

# Full upload
curl -X POST https://your-backend-url.com/admin/upload-products \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}'
```

## Option 2: Run Locally (If Backend is Running)

If you have the backend running locally with database access:

```bash
cd C:\REPOS\gdg-commerce-backend

# Dry run
set DRY_RUN=true && npm run upload-products

# Full upload
npm run upload-products
```

## Option 3: Deploy and Run on Medusa Cloud

1. Deploy your backend to Medusa Cloud
2. Set environment variable `PRODUCT_DATA_PATH` if CSV location differs
3. Use Option 1 to trigger via API

## CSV Location

Default CSV directory: `C:\REPOS\Grogan.Engrave\data\product_variants`

To use a different location, set the `PRODUCT_DATA_PATH` environment variable.

## What Gets Uploaded

- **Collections**: Created based on Product Family
- **Products**: Grouped by Product Family, with Size and Color options
- **Variants**: Each CSV row becomes a variant
- **Images**: Uploaded to Medusa File Module (S3 in production)

## Notes

- The script checks for existing products by handle and updates them
- New variants are added to existing products
- Images are uploaded from local file paths specified in CSV
