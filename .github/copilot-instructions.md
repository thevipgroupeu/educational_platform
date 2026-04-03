# Project-Specific Copilot Instructions

## Project Overview
Next.js application with TypeScript, React, and Supabase integration.

## Tech Stack
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **UI**: React with Tailwind CSS
- **Database/Auth**: Supabase
- **Package Manager**: npm

## Project Structure
- `/app`: Next.js App Router pages and API routes
- `/components`: Reusable React components
- `/lib`: Utility functions and Supabase client
- `/types`: TypeScript type definitions
- `/public`: Static assets

## Supabase Setup
1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Copy your project URL and anonymous key
4. Create `.env.local` file in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
5. Update `types/database.ts` with your Supabase schema types

## Key Commands
- `npm run dev`: Start development server (http://localhost:3000)
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm test`: Run tests

## Created Files
- `lib/supabase/client.ts`: Supabase client factory
- `types/database.ts`: Database type definitions (update with your schema)
- `.env.local.example`: Environment variables template

## Development Workflow
1. Install dependencies: `npm install`
2. Create `.env.local` with Supabase credentials
3. Start dev server: `npm run dev`
4. Build your components in `/components`
5. Create pages in `/app`

## Notes
- Configured with App Router
- Includes TypeScript for type safety
- Tailwind CSS for styling
- Ready for Supabase integration
