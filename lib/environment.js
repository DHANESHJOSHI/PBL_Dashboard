export const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  IS_PROD: process.env.NODE_ENV === 'production',

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || '',

  // Google Cloud Service Account
GOOGLE_SERVICE_ACCOUNT_PATH: process.env.GOOGLE_SERVICE_ACCOUNT_PATH || '',

  // App URLs
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
}
