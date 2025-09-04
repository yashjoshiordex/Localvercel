module.exports = {
  apps: [{
    name: 'shopify-donateme',
    script: 'npm',
    args: 'run start',
    cwd: '/var/www/shopify-donateme/shopifyDonateMe',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'mongodb+srv://admin:admin@cluster0.fb6fq.mongodb.net/Donate-Me?retryWrites=true&w=majority',
      SHOPIFY_API_KEY: 'a0b25aa84eb97a0a0c689abf5a6673aa',
      SHOPIFY_API_SECRET: 'a1060a4a5173b87727e8b2b540faa143',
      SCOPES: 'read_customers,read_fulfillments,read_merchant_managed_fulfillment_orders,read_orders,read_products,read_publications,write_assigned_fulfillment_orders,write_fulfillments,write_inventory,write_merchant_managed_fulfillment_orders,write_orders,write_products,write_publications,write_third_party_fulfillment_orders',
      SHOPIFY_APP_URL: 'http://34.221.168.86'
    }
  }]
}
