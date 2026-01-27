# Product Upload Script

This script uploads products from CSV files to Medusa using Medusa workflows directly. It runs in the backend context, so no authentication is required.

## Prerequisites

1. Ensure your Medusa backend is running or can be executed
2. CSV files should be located in `C:\REPOS\Grogan.Engrave\data\product_variants` (or set `PRODUCT_DATA_PATH` environment variable)

## Usage

### Dry Run (Test without uploading)

```bash
npm run upload-products:dry-run
```

or

```bash
cross-env DRY_RUN=true npm run upload-products
```

### Full Upload

```bash
npm run upload-products
```

### Custom CSV Directory

```bash
cross-env PRODUCT_DATA_PATH="C:\path\to\csv\files" npm run upload-products
```

## What It Does

1. **Discovers CSV files** recursively in the specified directory
2. **Parses CSV files** matching the Grogan.Engrave structure:
   - SKU, Name, Size, Color, Description
   - Price_Each, Price_Break_1-5
   - Main_Image_Path, Gallery_Image_Paths
   - Product_Family, Category
3. **Groups variants by Product Family** (each family becomes a product)
4. **Creates/updates Collections** based on Product Family
5. **Uploads images** to Medusa File Module (converts to base64)
6. **Creates/updates Products** with:
   - Options (Size, Color)
   - Variants with prices
   - Images
   - Collection assignment
7. **Generates a summary** report

## CSV Structure

The script expects CSV files with the following columns:

- `SKU` - Product variant SKU
- `Name` - Variant name
- `Size` - Size option value
- `Color` - Color option value
- `Description` - Product description
- `Price_Each` - Base price per unit
- `Price_Break_1` through `Price_Break_5` - Quantity break pricing
- `Case_Qty` - Case quantity
- `Template_Path` - Path to engraving template
- `Main_Image_Path` - Path to main product image
- `Blank_Image_Path` - Path to blank product image
- `Gallery_Image_Paths` - Comma-separated paths to gallery images
- `Main_Image_URL` - URL to main image (if available)
- `Category` - Product category
- `Product_Family` - Product family (used for grouping)

## Notes

- Products are grouped by `Product_Family` - each family becomes one product
- Variants are created with Size and Color options
- Images are uploaded to Medusa's File Module (S3 in production, local in development)
- The script checks for existing products by handle and updates them if found
- New variants are added to existing products

## Troubleshooting

### Images not found
- Check that image paths in CSV are relative to the CSV file location or absolute paths
- Ensure image files exist at the specified paths

### Products not created
- Check Medusa logs for errors
- Verify CSV structure matches expected format
- Ensure Product_Family values are consistent for variants that should be grouped together
