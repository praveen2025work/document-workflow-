// Environment configuration
export const config = {
  app: {
    env: process.env.NEXT_PUBLIC_APP_ENV || 'local',
    name: 'Workflow Designer',
    version: '1.0.0',
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    userServiceUrl: process.env.NEXT_PUBLIC_USER_INFO_SERVICE_URL || 'http://localhost:3001/api/user',
  },
  features: {
    debug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },
  theme: {
    default: process.env.NEXT_PUBLIC_DEFAULT_THEME || 'light',
  },
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  const env = config.app.env;
  
  const configs = {
    local: {
      apiTimeout: 30000,
      retryAttempts: 3,
      logLevel: 'debug',
    },
    dev: {
      apiTimeout: 15000,
      retryAttempts: 3,
      logLevel: 'info',
    },
    uat: {
      apiTimeout: 10000,
      retryAttempts: 2,
      logLevel: 'warn',
    },
    prod: {
      apiTimeout: 8000,
      retryAttempts: 2,
      logLevel: 'error',
    },
  };

  return configs[env as keyof typeof configs] || configs.local;
};

// Utility functions
export const isLocal = () => config.app.env === 'local';
export const isDev = () => config.app.env === 'dev';
export const isUAT = () => config.app.env === 'uat';
export const isProd = () => config.app.env === 'prod';

// Debug logging utility
export const debugLog = (...args: any[]) => {
  if (config.features.debug) {
    console.log('[DEBUG]', ...args);
  }
};