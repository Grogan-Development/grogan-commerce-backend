import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createCollectionsWorkflow,
  createProductsWorkflow,
  createProductVariantsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

// Types matching the actual CSV structure from Grogan.Engrave
interface ProductVariantRow {
  SKU: string;
  Name: string;
  Size: string;
  Color: string;
  Description: string;
  Price_Each: string;
  Price_Break_1: string;
  Price_Break_2: string;
  Price_Break_3: string;
  Price_Break_4: string;
  Price_Break_5: string;
  Case_Qty: string;
  Template_Path: string;
  Main_Image_Path: string;
  Blank_Image_Path: string;
  Gallery_Image_Paths: string;
  Main_Image_URL: string;
  Category: string;
  Product_Family: string;
}

interface ParsedVariant {
  sku: string;
  name: string;
  size: string;
  color: string;
  description: string;
  priceEach: number;
  priceBreaks: {
    break1: number;
    break2: number;
    break3: number;
    break4: number;
    break5: number;
  };
  caseQty: number;
  templatePath: string;
  mainImagePath: string;
  blankImagePath: string;
  galleryImagePaths: string[];
  mainImageUrl: string;
  category: string;
  productFamily: string;
}

interface ProductGroup {
  productFamily: string;
  productName: string;
  handle: string;
  description?: string;
  variants: ParsedVariant[];
  options: {
    title: string;
    values: string[];
  }[];
}

// Helper functions
function normalizePath(filePath: string, baseDir: string): string {
  if (!filePath) return '';
  
  const trimmed = filePath.trim();
  if (!trimmed) return '';

  // If path is already absolute, return as-is
  if (path.isAbsolute(trimmed)) {
    return trimmed;
  }

  // Resolve relative to base directory
  return path.resolve(baseDir, trimmed);
}

function discoverCsvFiles(directory: string): string[] {
  const files: string[] = [];
  try {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        files.push(...discoverCsvFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith(".csv")) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
  }
  return files;
}

function parseCsvFile(filePath: string): ParsedVariant[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as ProductVariantRow[];
  return records.map((row) => parseVariantRow(row, filePath));
}

function parseVariantRow(row: ProductVariantRow, csvFilePath: string): ParsedVariant {
  const baseDir = path.dirname(csvFilePath);

  // Parse price breaks
  const priceBreaks = {
    break1: parseFloat(row.Price_Break_1) || 0,
    break2: parseFloat(row.Price_Break_2) || 0,
    break3: parseFloat(row.Price_Break_3) || 0,
    break4: parseFloat(row.Price_Break_4) || 0,
    break5: parseFloat(row.Price_Break_5) || 0,
  };

  // Parse gallery image paths (comma-separated string)
  const galleryPaths = row.Gallery_Image_Paths
    ? row.Gallery_Image_Paths.split(',').map((p) => p.trim()).filter(Boolean)
    : [];

  return {
    sku: row.SKU.trim(),
    name: row.Name.trim(),
    size: row.Size.trim(),
    color: row.Color.trim(),
    description: row.Description.trim(),
    priceEach: parseFloat(row.Price_Each) || 0,
    priceBreaks,
    caseQty: parseInt(row.Case_Qty, 10) || 0,
    templatePath: normalizePath(row.Template_Path, baseDir),
    mainImagePath: normalizePath(row.Main_Image_Path, baseDir),
    blankImagePath: normalizePath(row.Blank_Image_Path, baseDir),
    galleryImagePaths: galleryPaths.map((p) => normalizePath(p, baseDir)),
    mainImageUrl: row.Main_Image_URL.trim(),
    category: row.Category.trim(),
    productFamily: row.Product_Family.trim(),
  };
}

function generateProductHandle(productFamily: string): string {
  return productFamily
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateProductTitle(variants: ParsedVariant[]): string {
  if (variants.length === 0) return '';
  
  // Use the first variant's name and remove size/color specifics
  const firstVariant = variants[0];
  let title = firstVariant.name;
  
  // Remove size and color from name to get base product name
  title = title.replace(/\s+\d+\s*oz\.?\s*/gi, ''); // Remove "12 oz.", "20 oz.", etc.
  title = title.replace(/\s+(Stainless Steel|Black|Red|Royal Blue|Pink|Teal|Light Blue|Light Purple|Purple|Dark Gray|Navy Blue|Orange|Maroon|White|Green|Yellow|Coral|Olive Green|Gray|Green).*$/i, ''); // Remove color
  title = title.replace(/\s+Water Bottle.*$/i, 'Water Bottle'); // Normalize "Water Bottle"
  title = title.trim();
  
  return title || firstVariant.name;
}

function groupVariantsByFamily(
  variants: ParsedVariant[]
): Map<string, ProductGroup> {
  const groups = new Map<string, ProductGroup>();

  for (const variant of variants) {
    // Group by Product Family (each family is a product)
    const key = variant.productFamily;
    if (!groups.has(key)) {
      groups.set(key, {
        productFamily: variant.productFamily,
        productName: generateProductTitle([variant]),
        handle: generateProductHandle(variant.productFamily),
        description: variant.description || variant.productFamily,
        variants: [],
        options: [],
      });
    }

    const group = groups.get(key)!;
    group.variants.push(variant);

    // Collect options
    if (variant.size) {
      const sizeOpt = group.options.find((o) => o.title === "Size");
      if (sizeOpt) {
        if (!sizeOpt.values.includes(variant.size)) {
          sizeOpt.values.push(variant.size);
        }
      } else {
        group.options.push({ title: "Size", values: [variant.size] });
      }
    }

    if (variant.color) {
      const colorOpt = group.options.find((o) => o.title === "Color");
      if (colorOpt) {
        if (!colorOpt.values.includes(variant.color)) {
          colorOpt.values.push(variant.color);
        }
      } else {
        group.options.push({ title: "Color", values: [variant.color] });
      }
    }
  }

  return groups;
}

async function uploadImageToMedusa(
  container: any,
  logger: any,
  imagePath: string
): Promise<string | null> {
  try {
    const fileService = container.resolve(Modules.FILE);
    const fullPath = path.isAbsolute(imagePath)
      ? imagePath
      : path.join(process.cwd(), imagePath);

    if (!fs.existsSync(fullPath)) {
      logger.warn(`⚠️  Image not found: ${fullPath}`);
      return null;
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const fileName = path.basename(fullPath);
    const ext = path.extname(fullPath).slice(1).toLowerCase();
    const mimeTypeMap: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
    };
    const mimeType = mimeTypeMap[ext] || "image/png";

    // Convert buffer to base64 string
    const base64Content = fileBuffer.toString("base64");

    // Upload using file service (expects base64 content)
    const files = await fileService.createFiles([
      {
        filename: fileName,
        mimeType,
        content: base64Content,
        access: "public",
      },
    ]);

    return files[0]?.url || null;
  } catch (error) {
    logger.error(`Error uploading image ${imagePath}:`, error);
    return null;
  }
}

export default async function uploadProducts({
  container,
}: ExecArgs): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const productService = container.resolve(Modules.PRODUCT);

  // Get CSV directory from environment or use default
  const csvDirectory =
    process.env.PRODUCT_DATA_PATH ||
    "C:\\REPOS\\Grogan.Engrave\\data\\product_variants";

  const dryRun = process.env.DRY_RUN === "true";

  logger.info(`📦 Starting product upload${dryRun ? " (DRY RUN)" : ""}...`);
  logger.info(`   CSV Directory: ${csvDirectory}`);

  // Discover CSV files
  const csvFiles = discoverCsvFiles(csvDirectory);
  logger.info(`   Found ${csvFiles.length} CSV file(s)`);

  if (csvFiles.length === 0) {
    logger.error("❌ No CSV files found!");
    return;
  }

  // Parse all CSV files
  const allVariants: ParsedVariant[] = [];
  for (const csvFile of csvFiles) {
    logger.info(`   Parsing: ${path.basename(csvFile)}`);
    const variants = parseCsvFile(csvFile);
    allVariants.push(...variants);
  }

  logger.info(`   Parsed ${allVariants.length} variant(s)`);

  // Group variants by product
  const productGroups = groupVariantsByFamily(allVariants);
  logger.info(`   Grouped into ${productGroups.size} product(s)`);

  // Get or create collections
  const collectionMap = new Map<string, string>();
  const uniqueFamilies = new Set(
    Array.from(productGroups.values()).map((g) => g.productFamily)
  );

  logger.info(`   Processing ${uniqueFamilies.size} collection(s)...`);

  for (const family of uniqueFamilies) {
    if (dryRun) {
      logger.info(`   [DRY RUN] Would create collection: ${family}`);
      collectionMap.set(family, "dry-run-collection-id");
      continue;
    }

    try {
      // Check if collection exists
      const existingCollectionsResult = await query.graph({
        entity: "product_collection",
        fields: ["id", "title", "handle"],
        filters: {
          handle: generateProductHandle(family),
        },
      });

      if (existingCollectionsResult.data.length > 0) {
        collectionMap.set(family, existingCollections[0].id);
        logger.info(`   ✓ Collection exists: ${family}`);
      } else {
        // Create collection
        const { result } = await createCollectionsWorkflow(container).run({
          input: {
            collections: [
              {
                title: family,
                handle: generateProductHandle(family),
              },
            ],
          },
        });
        collectionMap.set(family, result[0].id);
        logger.info(`   ✓ Created collection: ${family}`);
      }
    } catch (error) {
      logger.error(`   ✗ Failed to create collection ${family}:`, error);
    }
  }

  // Process each product group
  const stats = {
    created: 0,
    updated: 0,
    errors: [] as string[],
  };

  for (const [key, group] of productGroups.entries()) {
    try {
      logger.info(`\n📦 Processing product: ${group.productName}`);

      // Check if product exists
      const existingProductsResult = await query.graph({
        entity: "product",
        fields: ["id", "title", "handle"],
        filters: {
          handle: group.handle,
        },
      });

      const existingProduct = existingProductsResult.data.length > 0 ? existingProductsResult.data[0] : null;

      // Upload images (use main image from first variant, or gallery images)
      const imageUrls: string[] = [];
      const imagePaths = new Set<string>();
      
      for (const variant of group.variants) {
        if (variant.mainImagePath && !imagePaths.has(variant.mainImagePath)) {
          imagePaths.add(variant.mainImagePath);
          const url = await uploadImageToMedusa(container, logger, variant.mainImagePath);
          if (url) {
            imageUrls.push(url);
          }
        }
        // Also add gallery images
        for (const galleryPath of variant.galleryImagePaths) {
          if (galleryPath && !imagePaths.has(galleryPath)) {
            imagePaths.add(galleryPath);
            const url = await uploadImageToMedusa(container, logger, galleryPath);
            if (url) {
              imageUrls.push(url);
            }
          }
        }
      }

      if (dryRun) {
        logger.info(`   [DRY RUN] Would ${existingProduct ? "update" : "create"} product`);
        logger.info(`   Variants: ${group.variants.length}`);
        logger.info(`   Options: ${group.options.map((o) => `${o.title}(${o.values.join(", ")})`).join(", ")}`);
        if (existingProduct) {
          stats.updated++;
        } else {
          stats.created++;
        }
        continue;
      }

      // Prepare variants for Medusa
      const medusaVariants = group.variants.map((v) => {
        const options: Record<string, string> = {};
        if (v.size) options.Size = v.size;
        if (v.color) options.Color = v.color;

        // Use variant name or construct from size/color
        const variantTitle = v.name || `${v.size || ''} ${v.color || ''}`.trim() || v.sku;

        return {
          title: variantTitle,
          sku: v.sku,
          options,
          prices: [
            {
              amount: Math.round(v.priceEach * 100), // Convert to cents
              currency_code: "usd",
            },
          ],
          manage_inventory: true,
        };
      });

      if (existingProduct) {
        // Update existing product
        await updateProductsWorkflow(container).run({
          input: {
            selector: { id: existingProduct.id },
            update: {
              title: group.productName,
              description: group.description,
              images: imageUrls.map((url) => ({ url })),
            },
          },
        });

        // Add new variants
        await createProductVariantsWorkflow(container).run({
          input: {
            product_variants: medusaVariants.map((v) => ({
              ...v,
              product_id: existingProduct.id,
            })),
          },
        });

        stats.updated++;
        logger.info(`   ✓ Updated product: ${group.productName}`);
      } else {
        // Create new product
        const { result } = await createProductsWorkflow(container).run({
          input: {
            products: [
              {
                title: generateProductTitle(group.variants),
                handle: group.handle,
                description: group.description,
                status: ProductStatus.PUBLISHED,
                options: group.options,
                variants: medusaVariants,
                images: imageUrls.map((url) => ({ url })),
                collection_id: collectionMap.get(group.productFamily),
              },
            ],
          },
        });

        stats.created++;
        logger.info(`   ✓ Created product: ${group.productName}`);
      }
    } catch (error) {
      const errorMsg = `Failed to process ${group.productName}: ${error}`;
      logger.error(`   ✗ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }

  // Summary
  logger.info(`\n📊 Upload Summary:`);
  logger.info(`   Created: ${stats.created}`);
  logger.info(`   Updated: ${stats.updated}`);
  logger.info(`   Errors: ${stats.errors.length}`);
  if (stats.errors.length > 0) {
    logger.error(`\n❌ Errors:`);
    stats.errors.forEach((err) => logger.error(`   - ${err}`));
  }
}
