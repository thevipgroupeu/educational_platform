# Next.js + TypeScript + Supabase Application

A modern full-stack web application template built with **Next.js 14**, **TypeScript**, **React**, **Tailwind CSS**, and **Supabase**.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm installed
- Supabase account (free tier available at https://supabase.com)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials:
     ```bash
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
.
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Home page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   └── SupabaseDemo.tsx     # Example Supabase integration
├── lib/                     # Utility functions
│   └── supabase/
│       └── client.ts        # Supabase client configuration
├── types/                   # TypeScript type definitions
│   └── database.ts          # Supabase database types
├── public/                  # Static assets
├── .github/
│   └── copilot-instructions.md  # Copilot configuration
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── tailwind.config.ts       # Tailwind CSS configuration
```

## 🛠️ Available Scripts

- **`npm run dev`** - Start development server (hot reload)
- **`npm run build`** - Build for production
- **`npm start`** - Start production server (requires build first)
- **`npm run lint`** - Run ESLint checks
- **`npm test`** - Run tests

## 🔗 Supabase Integration

### Setting Up Your Database

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Create your database tables in the Supabase dashboard
3. Update `types/database.ts` with your table types
4. Import and use the Supabase client in your components

### Example: Using Supabase in a Component

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('your_table_name')
        .select()
      
      if (!error) setData(data)
    }

    fetchData()
  }, [])

  return <div>{/* Your JSX */}</div>
}
```

## 🎨 Styling

This project uses **Tailwind CSS** for styling. Configuration can be found in `tailwind.config.ts`.

## 📦 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | React framework with server/client components |
| **TypeScript** | Type-safe JavaScript |
| **React 19** | UI library |
| **Tailwind CSS** | Utility-first CSS framework |
| **Supabase** | Backend-as-a-Service (PostgreSQL + Auth) |
| **ESLint** | Code quality & linting |

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment

```bash
npm run build
npm start
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

## 📝 Development Workflow

1. Create components in `/components`
2. Create pages in `/app` using App Router
3. Use hooks for state management
4. Connect to Supabase through the client in `/lib/supabase`
5. Update TypeScript types in `/types`

## 🔐 Security Notes

- Keep `.env.local` in `.gitignore` - never commit secrets
- Use Supabase Row Level Security (RLS) policies
- Validate all user input
- Never expose private Supabase keys in client code

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Happy coding! 🎉**

