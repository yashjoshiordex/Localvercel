import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { EmailConfig } from '../models/EmailConfig';
import { logger } from '../utils/logger';
import { env } from 'env.server';

// Email transport configuration
let transporter: nodemailer.Transporter;

// Initialize the email transport
const initializeTransport = () => {
  // For production, use your SMTP credentials
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { 
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    },
  });
};

// Compile the email template with handlebars
const compileTemplate = (templateSource: string, data: any) => {
  const template = handlebars.compile(templateSource);
  return template(data);
};

// Register a Handlebars helper to safely render HTML content
handlebars.registerHelper('safeHtml', function(text) {
  return new handlebars.SafeString(text || '');
});

const templateTypes = {
  DONATION: 'donation',
  ORDER: 'order',
  RECEIPT: 'receipt'
};

// Get the base template that contains the structure and styling
async function getBaseTemplate() {
  const basePath = path.join(
    process.cwd(), 
    'app', 
    'server', 
    'templates', 
    'order-confirmation.hbs'
  );
  
  try {
    return fs.readFileSync(basePath, 'utf8');
  } catch (error) {
    logger.error(`Error reading base template: ${error}`);
    // Return a simple fallback template
    return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Donation Receipt</title>
      <style>
        body { font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .footer { text-align: center; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Thank You for Your Donation!</h1>
        <p>Receipt {{orderNumber}}</p>
      </div>
      
      <div class="content">
        {{{customMessage}}}
      </div>
      
      <div class="details">
        <h3>Donation Details:</h3>
        {{{donor_details}}}
        <p><strong>Total: {{total}}</strong></p>
      </div>
      
      <div class="footer">
        <p>&copy; {{shopName}} - {{date}}</p>
      </div>
    </body>
    </html>`;
  }
}

// Read template from file
const getEmailTemplate = async (shop: string) => {
  try {
    // Always start with the base template
    const baseTemplate = await getBaseTemplate();
    
    // Check if shop has custom message content
    const emailConfig = await EmailConfig.findOne({ shop });
    
    // Extract other configuration values
    const config = {
      cc: emailConfig?.cc || [],
      isActive: emailConfig?.isActive !== false,
      fromEmail: emailConfig?.fromEmail,
      subject: emailConfig?.subject || 'Donation Receipt', 
      customMessage: ''
    };
    
    // If the shop has a custom template, use it as the custom message
    if (emailConfig?.templateType === 'custom' && emailConfig?.template) {
      config.customMessage = emailConfig.template;
    } else {
      // Default message if no custom template is set
      config.customMessage = `
        <p>Dear {{donor_name}},</p>
        <p>Thank you for your donation. Your generosity is appreciated! Below are your donation details</p>
      `;
    }
    
    // Return the base template and configuration
    return {
      template: baseTemplate,
      customMessage: config.customMessage,
      cc: config.cc,
      isActive: config.isActive,
      fromEmail: config.fromEmail,
      subject: config.subject 
    };
  } catch (error) {
    logger.error(`Error getting email template: ${error}`);
    // Fallback to a simple template and message
    return {
      template: await getBaseTemplate(),
      customMessage: `<p>Thank you for your donation!</p>`,
      cc: [],
      isActive: true,
      fromEmail: undefined,
      subject: 'Donation Receipt' 
    };
  }
};

// Format currency with proper symbol
const formatCurrency = (amount: string | number, currencyCode: string = 'USD') => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle specific currency formatting
  switch(currencyCode) {
    case 'INR':
      return `₹${numAmount.toFixed(2)}`;
    case 'USD':
      return `$${numAmount.toFixed(2)}`;
    case 'EUR':
      return `€${numAmount.toFixed(2)}`;
    case 'GBP':
      return `£${numAmount.toFixed(2)}`;
    default:
      return `${numAmount.toFixed(2)} ${currencyCode}`;
  }
};

// Format donor details
function formatDonorDetails(lineItems: any[]) {
  if (!lineItems || !lineItems.length) {
    return '<p>No details available</p>';
  }
  
  return lineItems.map(item => 
    `<div>
      <p><strong>${item.name || item.title}</strong> x ${item.quantity} - ${formatCurrency(item.price, item.price_set?.shop_money?.currency_code)}</p>
      <p>Vendor: ${item.vendor || 'N/A'}</p>
    </div>`
  ).join('');
}

// Send order confirmation email
export const sendOrderConfirmationEmail = async (
  shop: string,
  order: any,
  customer: any
) => {
  try {
    if (!transporter) {
      initializeTransport();
    }

    // ✅ Filter only donateme products
    const donationItems = order.line_items?.filter(
      (item: any) => (item.vendor || '').toLowerCase() === 'donateme'
    ) || [];

    // If no donateme products, skip sending
    if (!donationItems.length) {
      logger.info(`Order ${order.name || order.id} skipped — no 'donateme' vendor found.`);
      return;
    }

    const { template, customMessage, cc, isActive, fromEmail, subject } =
      await getEmailTemplate(shop);

    if (!isActive) {
      logger.info(`Email notifications disabled for shop: ${shop}`);
      return;
    }

    const orderData = {
      orderNumber: order.name || `#${order.order_number}`,
      orderDate: new Date(order.created_at).toLocaleDateString(),
      date: new Date(order.created_at).toLocaleDateString(),
      customerName: customer?.first_name
        ? `${customer.first_name} ${customer.last_name || ''}`.trim()
        : order.billing_address?.name || 'Valued Customer',
      customerEmail: customer?.email || order.email,

      // ✅ Only include donateme products here
      items: donationItems.map((item: any) => ({
        name: item.title || item.name,
        quantity: item.quantity,
        price: formatCurrency(item.price, order.currency),
        total: formatCurrency(parseFloat(item.price) * item.quantity, order.currency),
        vendor: item.vendor || 'N/A',
        sku: item.sku || 'N/A'
      })),

      // ✅ Total is sum of donateme products only
      total: formatCurrency(
        donationItems.reduce((sum: number, item: any) => sum + (parseFloat(item.price) * item.quantity), 0),
        order.currency
      ),

      currency: order.currency,
      shopName: shop.split('.')[0] || 'Our Store',
      paymentStatus: order.financial_status,
      donor_name: customer?.first_name
        ? `${customer.first_name} ${customer.last_name || ''}`.trim()
        : order.billing_address?.name || 'Valued Donor',
      donation_purpose: order.note || 'General donation',

      // ✅ Donor details only for donateme products
      donor_details: formatDonorDetails(donationItems),

      customMessage: compileTemplate(customMessage, {
        donor_name: customer?.first_name
          ? `${customer.first_name} ${customer.last_name || ''}`.trim()
          : order.billing_address?.name || 'Valued Donor',
        date: new Date(order.created_at).toLocaleDateString(),
        total: formatCurrency(
          donationItems.reduce((sum: number, item: any) => sum + (parseFloat(item.price) * item.quantity), 0),
          order.currency
        ),
        donor_details: formatDonorDetails(donationItems)
      })
    };

    const html = compileTemplate(template, orderData);
    const from = fromEmail
        ? `<${fromEmail}>`
      :  `${orderData.shopName} <noreply@example.com>`;

    const mailOptions = {
      from,
      to: orderData.customerEmail,
      cc: cc,
      subject: `${subject ? subject : "Donation Receipt"} ${orderData.orderNumber}`,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Donation receipt email sent: ${info.messageId}`);
    return info;

  } catch (error) {
    logger.error(`Error sending donation receipt email: ${error}`);
    throw error;
  }
};
