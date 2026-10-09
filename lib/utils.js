const fs = require('fs');

// Simple logger
const logger = {
    info: (msg, data) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data || '');
    },
    warn: (msg, data) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, data || '');
    },
    error: (msg, data) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, data || '');
    }
};

// Validate required environment variables
function validateEnv() {
    const required = ['JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD', 'KITCHEN_USERNAME', 'KITCHEN_PASSWORD'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        logger.warn(`Missing environment variables: ${missing.join(', ')}. Using defaults (NOT SECURE FOR PRODUCTION)`);
    }
    
    if (process.env.NODE_ENV === 'production') {
        if (process.env.JWT_SECRET === 'dev-secret' || !process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET must be set in production');
        }
        if (process.env.ADMIN_PASSWORD === 'change-this-default-password' || !process.env.ADMIN_PASSWORD) {
            throw new Error('ADMIN_PASSWORD must be changed in production');
        }
    }
}

module.exports = {
    logger,
    validateEnv
};
