// productSchema.ts
export function validateProductInput(input: any):
    | { success: true; data: { title: string; } }
    | { success: false; error: Record<string, string> } {

    const errors: Record<string, string> = {};
    const { title } = input;

    if (!title || typeof title !== "string") {
        errors.title = "Title is required and must be a string";
    }

    // if (!sku || typeof sku !== "string") {
    //     errors.sku = "SKU is required and must be a string";
    // }

    if (Object?.keys(errors)?.length > 0) {
        return { success: false, error: errors };
    }

    return { success: true, data: { title } };
}
