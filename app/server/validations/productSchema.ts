// productSchema.ts
export function validateProductInput(input: { title: string; description: string; sku: string; goalAmount:number }):
    | { success: true; data: { title: string, description: string, sku: string ,goalAmount:number} }
    | { success: false; error: Record<string, string> } {

    const errors: Record<string, string> = {};
    const { title, description, sku,goalAmount } = input;

    if (!title || typeof title !== "string") {
        errors.title = "Title is required and must be a string";
    }

    if (!description || typeof description !== "string") {
        errors.description = "Description is required and must be a string";
    }

    if (Object?.keys(errors)?.length > 0) {
        return { success: false, error: errors };
    }

    return { success: true, data: { title, description, sku,goalAmount } };
}
