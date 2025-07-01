# RentXotic Fleet Management System

## Overview
RentXotic is a comprehensive fleet management system designed for a luxury car rental company in La Jolla, California. The system manages 23 exotic vehicles (Ferraris, Lamborghinis, McLarens, etc.) with features for fleet tracking, task management, and fuel record management. The application is built with modern web technologies and follows an enterprise-grade architecture with a sophisticated navy/gold design system.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Design System**: Custom CSS properties with a professional navy/gold color scheme

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with proper error handling
- **Session Management**: PostgreSQL session store with connect-pg-simple

### Build and Development Tools
- **Bundler**: Vite for client, esbuild for server
- **Type Checking**: TypeScript with strict configuration
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer
- **Development**: Hot module replacement and runtime error overlay

## Key Components

### Vehicle Management
- Real-time vehicle status tracking (available, rented, maintenance)
- Fuel level monitoring with visual indicators
- Vehicle condition and mileage tracking
- Location management
- Issue tracking and reporting

### Task Management System
- Comprehensive task creation and assignment
- Task types: Wash & Detail, Delivery, Pickup, Service, Fuel, Inspection, Photos, Other
- Priority system: Normal, High Priority, URGENT with visual indicators
- Task completion tracking with timestamps
- CSV export functionality

### Fuel Management
- Fuel station database with current pricing
- Fuel record tracking with cost calculations
- Station ratings and notes
- Integration with vehicle mileage tracking

### Dashboard
- Real-time statistics and metrics
- Live clock with automatic updates
- Fleet overview with status cards
- Tabbed interface for different management areas

## Data Flow

### Client-Server Communication
1. **API Requests**: Client makes RESTful API calls to Express server
2. **Data Validation**: Server validates incoming data using Zod schemas
3. **Database Operations**: Drizzle ORM handles PostgreSQL operations
4. **Response Handling**: Server returns JSON responses with proper error codes
5. **Client Updates**: TanStack Query manages cache invalidation and UI updates

### Database Schema
- **Users**: Authentication and user management
- **Vehicles**: Fleet inventory with status and metrics
- **Tasks**: Work orders and assignments
- **Fuel Stations**: Station information and pricing
- **Fuel Records**: Fuel purchase tracking and costs

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui**: Headless UI components
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type validation

### UI Components
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built accessible components
- **Radix UI**: Primitive components for complex UI patterns
- **Lucide React**: Icon library

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler
- **vite**: Build tool and development server
- **drizzle-kit**: Database migrations and introspection

## Deployment Strategy

### Production Build
1. **Client Build**: Vite builds optimized React application
2. **Server Build**: esbuild bundles Express server with external dependencies
3. **Static Assets**: Client build outputs to `dist/public`
4. **Server Output**: Bundled server outputs to `dist/index.js`

### Environment Configuration
- **Database**: Requires `DATABASE_URL` environment variable
- **Session Storage**: PostgreSQL-based session management
- **Development**: Automatic database schema synchronization

### File Structure
```
├── client/          # React frontend application
├── server/          # Express backend server
├── shared/          # Shared types and schemas
├── migrations/      # Database migration files
└── dist/           # Production build output
```

## Changelog
- June 30, 2025: Initial setup with comprehensive fleet management system
- June 30, 2025: Added vehicle wash status tracking with washed boolean field, lastWash timestamp, wash statistics on dashboard, wash button for vehicles, and "Needs Wash" issue alerts
- June 30, 2025: Migrated from in-memory storage to PostgreSQL database with persistent data storage
- June 30, 2025: Removed fuel management functionality to simplify system and reduce resource usage

## Recent Changes
✓ Fuel management system removed (stations, records, forms, and related UI components)
✓ Database schema simplified to focus on core vehicle and task management
✓ Dashboard streamlined with vehicle fleet overview and task management only
✓ In-memory storage with 23 sample vehicles for development
✓ Vehicle wash status tracking preserved
✓ Task management system maintained with full CRUD operations
✓ Clean, focused UI without fuel-related complexity

## User Preferences
Preferred communication style: Simple, everyday language.