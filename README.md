# Workflow Designer

A modern, full-stack workflow management application with a visual designer for creating, configuring, and deploying workflows.

## Features

- **Visual Workflow Designer**: Drag-and-drop interface for creating workflows
- **Multiple Task Types**: File Upload, Download, Update, Consolidate Files, and Decision tasks
- **Multi-Environment Support**: Local, Development, UAT, and Production configurations
- **Multiple Themes**: Light, Dark, Ocean Blue, Forest Green, Royal Purple, and Sunset Orange
- **Real-time Collaboration**: User management and role-based access
- **Responsive Design**: Works on desktop and mobile devices

## Environment Setup

The application supports multiple environments with different configurations:

### Environment Files

- `.env.local` - Local development
- `.env.dev` - Development environment
- `.env.uat` - User Acceptance Testing
- `.env.prod` - Production environment

### Available Scripts

```bash
# Development
npm run dev              # Run with default environment
npm run dev:local        # Run with local environment
npm run dev:dev          # Run with dev environment

# Building
npm run build            # Build with default environment
npm run build:dev        # Build for development
npm run build:uat        # Build for UAT
npm run build:prod       # Build for production

# Production
npm run start            # Start with default environment
npm run start:dev        # Start with dev environment
npm run start:uat        # Start with UAT environment
npm run start:prod       # Start with production environment

# Environment Management
npm run env:local        # Switch to local environment
npm run env:dev          # Switch to dev environment
npm run env:uat          # Switch to UAT environment
npm run env:prod         # Switch to production environment
```

## Configuration

### Environment Variables

#### Required Variables
- `NEXT_PUBLIC_USER_INFO_SERVICE_URL` - URL for user information service
- `NEXT_PUBLIC_API_BASE_URL` - Base URL for API endpoints

#### Optional Variables
- `NEXT_PUBLIC_ENABLE_DEBUG` - Enable debug logging (true/false)
- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Enable analytics (true/false)
- `NEXT_PUBLIC_DEFAULT_THEME` - Default theme (light/dark/blue/green/purple/orange)

### Theme Configuration

The application supports 6 built-in themes:
- **Light** - Clean white background with blue accents
- **Dark** - Dark background with blue accents
- **Ocean Blue** - Blue-themed interface
- **Forest Green** - Green-themed interface
- **Royal Purple** - Purple-themed interface
- **Sunset Orange** - Orange-themed interface

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workflow-designer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   # Copy the appropriate environment file
   cp .env.local .env
   
   # Or use the npm script
   npm run env:local
   ```

4. **Configure environment variables**
   Edit the `.env` file with your specific configuration:
   ```env
   NEXT_PUBLIC_USER_INFO_SERVICE_URL=http://localhost:3001/api/user
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
   NEXT_PUBLIC_ENABLE_DEBUG=true
   NEXT_PUBLIC_DEFAULT_THEME=light
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Deployment

### Development Deployment
```bash
npm run build:dev
npm run start:dev
```

### UAT Deployment
```bash
npm run build:uat
npm run start:uat
```

### Production Deployment
```bash
npm run build:prod
npm run start:prod
```

## Architecture

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **ReactFlow** - Node-based UI library
- **Radix UI** - Accessible component primitives

### State Management
- **React Context** - User state management
- **React Hooks** - Local state management

### API Integration
- **Axios** - HTTP client with interceptors
- **Environment-based configuration** - Different endpoints per environment

## Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   └── workflow/       # Workflow-specific components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Next.js pages
├── styles/             # Global styles and themes
└── util/               # Utility functions
```

### Adding New Themes

1. Add theme colors to `src/styles/globals.css`:
   ```css
   .theme-newtheme {
     --background: /* your colors */;
     --foreground: /* your colors */;
     /* ... other color variables */
   }
   ```

2. Update `src/components/ThemeSwitcher.tsx`:
   ```typescript
   const themes = [
     // ... existing themes
     { id: 'newtheme' as Theme, name: 'New Theme', icon: YourIcon },
   ];
   ```

### Environment-Specific Features

The application automatically adapts based on the environment:
- **Debug logging** - Enabled in local/dev environments
- **Mock data** - Falls back to mock user data in development
- **API timeouts** - Different timeouts per environment
- **Error handling** - Environment-appropriate error levels

## Troubleshooting

### Common Issues

1. **User service unavailable**
   - The app will show a "Mock" badge and use development user data
   - Check the `NEXT_PUBLIC_USER_INFO_SERVICE_URL` configuration

2. **Theme not applying**
   - Ensure the theme name matches exactly in the ThemeSwitcher
   - Check browser localStorage for saved theme preference

3. **API connection issues**
   - Verify `NEXT_PUBLIC_API_BASE_URL` is correct for your environment
   - Check network connectivity and CORS settings

### Debug Mode

Enable debug mode by setting `NEXT_PUBLIC_ENABLE_DEBUG=true` in your environment file. This will:
- Show environment badge in the header
- Enable detailed API request/response logging
- Provide additional error information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across different environments
5. Submit a pull request

## License

This project is licensed under the MIT License.