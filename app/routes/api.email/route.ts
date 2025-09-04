import { type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { EmailConfig } from "app/server/models/EmailConfig";
import { authenticate } from "app/shopify.server";


const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    const config = await EmailConfig.findOne({ shop });

    return new Response(JSON.stringify({
      success: true,
      config: config || {
        shop,
        cc: [],
        template: "",
        templateType: "default",
        subject: "Donation Receipt" 
      }
    }));
  } catch (error) {
    console.error("Email config loader error:", error);
    return new Response(JSON.stringify({ success: false, error: "Failed to load configuration" }), { status: 500 });
  }
};


interface EmailConfigFormData {
  cc?: string[];
  template?: string;
  subject?: string; 
}

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    const formData: EmailConfigFormData = await request.json();

    // Validate CC emails if provided
    let ccEmails: string[] = [];
    if (formData.cc && Array.isArray(formData.cc)) {
      const validCcEmails = formData.cc.filter((email: string) => {
        if (typeof email === 'string' && email.trim() !== '') {
          const trimmedEmail = email.trim();
          if (!isValidEmail(trimmedEmail)) {
            return false; // Invalid email format
          }
          return true;
        }
        return false;
      });

      // Check if any invalid emails were provided
      const invalidEmails = formData.cc.filter((email: string) =>
        typeof email === 'string' && email.trim() !== '' && !isValidEmail(email.trim())
      );

      if (invalidEmails.length > 0) {
        return new Response(JSON.stringify({
          success: false,
          error: `Invalid email format(s): ${invalidEmails.join(', ')}`
        }), { status: 400 });
      }

      ccEmails = validCcEmails.map((email: string) => email.trim());
    }

    // Handle template and templateType
    const template: string | null = formData.template && typeof formData.template === 'string'
      ? formData.template.trim()
      : null;

    const templateType: "custom" | "default" = template !== null ? "custom" : "default";

    const subject: string = formData.subject && typeof formData.subject === 'string' 
      ? formData.subject.trim()
      : 'Donation Receipt';

    const updateData = {
      shop,
      cc: ccEmails,
      template,
      templateType,
      subject, 
      updatedAt: new Date()
    };

    const config = await EmailConfig.findOneAndUpdate(
      { shop },
      updateData,
      { upsert: true, new: true, runValidators: true }
    );

    return new Response(JSON.stringify({
      success: true,
      config,
      message: "Email configuration saved successfully"
    }));
  } catch (error) {
    console.error("Email config action error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Failed to save configuration"
    }), { status: 500 });
  }
};