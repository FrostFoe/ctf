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
- **Hall of Fame**: A dedicated page to honor top individual players and teams.
- **Team Competitions**: Form teams and compete against others.
- **Public Profiles**: Shareable public profiles for users to showcase their achievements.
- **Practice Arena**: A non-competitive space for users to practice and hone their skills.
- **Admin Panel**: A secure area for administrators (`frostfoe@gmail.com`) to add, edit, and delete challenges.
- **Authentication**: Secure login and signup with email/password and GitHub OAuth.

## 🚀 Getting Started

Follow these steps to get your local development environment up and running.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd frostfall-ctf-platform
```

### 2. Install Dependencies

This project uses `pnpm` as the package manager.

```bash
pnpm install
```

### 3. Set Up Supabase

You'll need a Supabase project to run the backend.

1.  Go to [supabase.com](https://supabase.com), create a new project, or use an existing one.
2.  In your Supabase project, navigate to the **SQL Editor**.
3.  Create a **New query** and paste the entire content of the `supabase/schema.sql` file from this project. This will create the necessary tables, views, and row-level security policies.
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

### 4. (Optional) Set up GitHub OAuth

To enable GitHub login, you need to configure an OAuth app in GitHub.

1.  In your Supabase project, go to **Authentication** > **Providers** and enable **GitHub**.
2.  You will see a **Redirect URL**. Copy it.
3.  Go to your GitHub account, navigate to **Settings** > **Developer settings** > **OAuth Apps**, and create a **New OAuth App**.
4.  Fill in the application details. For the **Authorization callback URL**, paste the URL you copied from Supabase.
5.  Generate a **Client secret** and copy both the **Client ID** and **Client Secret**.
6.  Go back to Supabase and paste the Client ID and Secret into the GitHub provider settings.
7.  Save the provider settings.

### 5. Run the Development Server

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

## 🗄️ Database Schema

The database schema is defined in `supabase/schema.sql` and includes the following:

-   **`profiles` table**: Stores public user data like username and full name.
-   **`challenges` table**: Stores all CTF challenges.
-   **`teams` table**: Stores team information.
-   **`team_members` table**: Manages the relationship between users and teams.
-   **`solved_challenges` table**: Tracks which users have solved which challenges.
-   **`leaderboard` view**: A dynamically calculated view that ranks individual users.
-   **`team_leaderboard` view**: A dynamically calculated view that ranks teams.
-   **Row Level Security (RLS)**: Policies are in place to ensure that users can only access the data they are permitted to see.
-   **Triggers and Functions**: A trigger automatically creates a user profile upon signup.


## Folder Structure

The project follows a standard Next.js App Router structure:

```
src
├── app/                  # Application routes (pages)
│   ├── admin/            # Secure admin panel
│   ├── challenges/       # Challenge listing and individual challenge pages
│   ├── dashboard/        # User dashboard
│   ├── hall-of-fame/     # Public leaderboard
│   ├── p/                # Public user profiles
│   ├── practice/         # Practice area for challenges
│   ├── teams/            # Team creation and management
│   └── ...
├── components/           # Reusable React components
├── constants/            # Application-wide constants
├── hooks/                # Custom React hooks
├── lib/                  # Core types and utility functions
└── utils/                # Supabase client and server helpers
```

## 🌐 Deployment

This application is ready to be deployed on any platform that supports Next.js, such as [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/). Ensure you set the same environment variables in your deployment provider's settings. The included `netlify.toml` provides a basic configuration for deploying to Netlify.
