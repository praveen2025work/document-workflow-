# API Integration Guide

This guide explains how to switch between mock data and real API calls in the workflow management application.

## Environment Configuration

The application uses environment variables to determine whether to use mock data or make real API calls.

### Environment Variables

The key environment variable is `NEXT_PUBLIC_CO_DEV_ENV`:

- `mock` - Forces the application to use mock data
- `dev` - Uses real API calls to development environment
- `local` - Uses real API calls to local environment  
- `uat` - Uses real API calls to UAT environment
- `prod` - Uses real API calls to production environment

### Environment Files

The application includes several environment files:

- `.env.mock` - Mock environment (uses mock data)
- `.env.local` - Local development environment
- `.env.dev` - Development environment
- `.env.uat` - UAT environment  
- `.env.prod` - Production environment

## Switching Between Mock and Real APIs

### To Use Real APIs:

1. **Set the environment variable:**
   ```bash
   NEXT_PUBLIC_CO_DEV_ENV=dev  # or local, uat, prod
   ```

2. **Configure API endpoints:**
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://your-api-server.com/api
   NEXT_PUBLIC_USER_INFO_SERVICE_URL=https://your-api-server.com/api/user
   ```

3. **Restart the application** to pick up the new environment variables.

### To Use Mock Data:

1. **Set the environment variable:**
   ```bash
   NEXT_PUBLIC_CO_DEV_ENV=mock
   ```

2. **Restart the application.**

## API Files Updated

The following API files have been updated to use the centralized configuration:

- `src/lib/dashboardApi.ts` - Dashboard and task management APIs
- `src/lib/queryApi.ts` - Query management APIs  
- `src/lib/workflowApi.ts` - Workflow management APIs
- `src/lib/userApi.ts` - User management APIs

## Configuration Logic

The mock/real API decision is made in each API file using:

```typescript
const shouldUseMock = config.app.isMock || config.app.env === 'mock';

if (shouldUseMock) {
  // Use mock data
  return Promise.resolve(mockData);
}

// Make real API call
const response = await api.get('/endpoint');
return response.data;
```

## Testing the Integration

1. **Check the browser console** - The application logs which environment it's using:
   ```
   Dashboard API - Environment check: {
     isMock: false,
     env: "dev", 
     shouldUseMock: false
   }
   ```

2. **Check the Network tab** - When using real APIs, you should see HTTP requests being made to your API endpoints.

3. **Verify API calls** - Look for actual HTTP requests in the browser's Network tab when `NEXT_PUBLIC_CO_DEV_ENV` is set to `dev`, `local`, `uat`, or `prod`.

## Troubleshooting

### Still seeing mock data?

1. **Check environment variables** - Ensure `NEXT_PUBLIC_CO_DEV_ENV` is set correctly
2. **Restart the application** - Environment variable changes require a restart
3. **Clear browser cache** - Sometimes cached JavaScript can cause issues
4. **Check the console logs** - Look for environment configuration logs

### API calls failing?

1. **Verify API endpoints** - Ensure `NEXT_PUBLIC_API_BASE_URL` points to your running API server
2. **Check CORS settings** - Ensure your API server allows requests from your frontend domain
3. **Verify API server is running** - Ensure your backend API is accessible
4. **Check network connectivity** - Verify you can reach the API endpoints

## API Endpoints Expected

When using real APIs, the application expects these endpoints to be available:

### Dashboard APIs
- `GET /dashboard/user?userId={id}` - Get user dashboard
- `GET /dashboard/tasks?userId={id}` - Get assignable tasks
- `POST /dashboard/tasks/{taskId}/assign` - Assign task to user

### Query APIs  
- `GET /queries/assigned-to/{userId}` - Get queries assigned to user
- `GET /queries/raised-by/{userId}` - Get queries raised by user
- `POST /queries` - Create new query
- `PUT /queries/{id}/status` - Update query status

### Workflow APIs
- `GET /workflows` - Get all workflows
- `GET /workflows/{id}` - Get workflow by ID
- `POST /workflows` - Create new workflow
- `PUT /workflows/{id}` - Update workflow

### User APIs
- `GET /users` - Get all users
- `GET /users/{id}` - Get user by ID  
- `POST /users` - Create new user
- `PUT /users/{id}` - Update user

## Next Steps

1. **Set up your API server** with the expected endpoints
2. **Configure the environment variables** to point to your API server
3. **Test the integration** by switching between mock and real environments
4. **Implement authentication** if required by your API server
5. **Add error handling** for production use cases