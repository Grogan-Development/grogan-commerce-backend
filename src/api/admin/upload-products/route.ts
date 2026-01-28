import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import uploadProducts from "../../../scripts/upload-products";

interface UploadProductsRequestBody {
    dryRun?: boolean;
}

export async function POST(
  req: MedusaRequest<UploadProductsRequestBody>,
  res: MedusaResponse
): Promise<void> {
  try {
    const { dryRun = false } = req.body;

    // Set dry run mode if requested
    if (dryRun) {
      process.env.DRY_RUN = "true";
    } else {
      delete process.env.DRY_RUN;
    }

    // Execute the upload script in the backend context
    await uploadProducts({
      container: req.scope,
      args: [],
    });

    res.json({
      success: true,
      message: dryRun ? "Dry run completed successfully" : "Products uploaded successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to upload products",
    });
  }
}
