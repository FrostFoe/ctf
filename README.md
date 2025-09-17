# Frostfall CTF Platform

Welcome to Frostfall, a modern Capture The Flag (CTF) platform designed for cybersecurity enthusiasts. This application provides a full-featured environment for hosting, participating in, and managing CTF challenges.

## ✨ Features

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Supabase](https://supabase.io/) for authentication, database, and user management.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/) for a set of high-quality, accessible components.
- **User Dashboard**: Personalized dashboard showing user stats like solved challenges, points, and rank.
- **Leaderboard**: See how you stack up against other players.
- **Admin Panel**: A secure area for administrators (`frostfoe@gmail.com`) to add, edit, and delete challenges.
- **Authentication**: Secure login and signup with email/password and GitHub.

## 🚀 Getting Started

Follow these steps to get your local development environment up and running.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd frostfall-ctf
```

### 2. Install Dependencies

This project uses `pnpm` as the package manager.

```bash
pnpm install
```

### 3. Set Up Supabase

You'll need to connect to a Supabase project.

1.  Go to [supabase.com](https://supabase.com), create a new project, or use an existing one.
2.  In the Supabase Studio, navigate to the **SQL Editor**.
3.  Open the `supabase/migrations/20240917072944_add_challenges_table.sql` file from this project and run the SQL queries to create the `challenges` and `solved_challenges` tables and set up Row Level Security (RLS) policies.
4.  Navigate to **Project Settings** > **API**.
5.  Find your `Project URL` and `anon` `public` key.
6.  Create a `.env.local` file by copying the `.env` file:
    ```bash
    cp .env .env.local
    ```
7.  Add your Supabase credentials to the `.env.local` file:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

### 4. Run the Development Server

Start the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application. To access the admin panel, sign up or log in with the email `frostfoe@gmail.com`.

## 🛠️ Available Scripts

- `pnpm dev`: Starts the development server.
- `pnpm build`: Creates a production-ready build.
- `pnpm start`: Starts the production server.
- `pnpm lint`: Lints the codebase.

## Folder Structure

The project follows a standard Next.js App Router structure:

```
src
├── app/                  # Application routes (pages)
│   ├── admin/            # Secure admin panel
│   ├── challenges/       # Challenge listing and submission
│   ├── dashboard/        # User dashboard
│   └── ...
├── components/           # Reusable React components
├── constants/            # Application-wide constants
├── hooks/                # Custom React hooks
├── lib/                  # Core types and utility functions
└── utils/                # Supabase client and server helpers
```

## 🌐 Deployment

This application is ready to be deployed on any platform that supports Next.js, such as [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/). Ensure you set the same environment variables in your deployment provider's settings. The included `netlify.toml` provides a basic configuration for deploying to Netlify.
