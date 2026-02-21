/**
 * Generate a secure random JWT_SECRET for use in .env
 * Run: node scripts/generate-jwt-secret.js
 * Or:  npm run generate:jwt-secret
 */
const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');
console.log('\nAdd this to your .env file:\n');
console.log('JWT_SECRET="' + secret + '"\n');
