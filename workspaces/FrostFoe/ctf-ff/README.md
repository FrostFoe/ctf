# Frostfall CTF Platform

Welcome to Frostfall, a modern, full-featured Capture The Flag (CTF) platform built for the global cybersecurity community. Designed with performance, aesthetics, and user experience in mind, Frostfall provides a comprehensive environment for hosting, participating in, and managing CTF challenges.

## ✨ Features

- **Framework**: [Next.js 15](https://nextjs.org/) using the App Router for optimal performance and structure.
- **UI**: Built with [React 19](https://react.dev/), ensuring a fast and modern user experience.
- **Language**: Fully written in [TypeScript](https://www.typescriptlang.org/) for robust, type-safe code.
- **Backend & Database**: Powered by [Supabase](https://supabase.io/) for authentication, a PostgreSQL database, and real-time capabilities.
- **Styling**: Styled with [Tailwind CSS](https://tailwindcss.com/) for a utility-first, highly customizable design.
- **UI Components**: A rich set of accessible and beautiful components from [ShadCN UI](https://ui.shadcn.com/).
- **Personalized Dashboard**: A user-centric dashboard displaying key stats like solved challenges, spendable points, total points, and current rank.
- **Hall of Fame**: A dedicated leaderboard to honor top individual players and teams, showcasing their ranks and points.
- **Team Competitions**: Users can create or join teams, chat with members, and compete collectively. Private teams are supported with a token-based invitation system.
- **Public User Profiles**: Shareable public profiles where users can display their rank, points, and recently solved challenges.
- **Practice Arena**: A non-competitive zone where users can hone their skills on practice-oriented challenges without affecting their official rank.
- **Secure Admin Panel**: A protected area for administrators (identified by `frostfoe@gmail.com`) to add, edit, and delete challenges, manage users, and oversee teams.
- **Secure Authentication**: Robust and secure login and signup system with both email/password and GitHub OAuth options.

## 🚀 Getting Started

Follow these steps to get your local development environment up and running smoothly.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd frostfall-ctf-platform
```

### 2. Install Dependencies

This project uses `pnpm` as the package manager for fast and efficient dependency management.

```bash
pnpm install
```

### 3. Set Up Supabase

A Supabase project is required to run the backend, database, and authentication.

1.  Go to [supabase.com](https://supabase.com) and create a new project or use an existing one.
2.  In your Supabase project, navigate to the **SQL Editor**.
3.  Click **New query** and paste the entire content of the `supabase/schema.sql` file from this repository. This script will create all the necessary tables, views, functions, and row-level security policies. **Execute the query to set up your database schema.**
4.  Navigate to **Project Settings** > **API**.
5.  Find your `Project URL` and `anon` `public` key.
6.  Create a `.env.local` file by copying the existing `.env` file:
    ```bash
    cp .env .env.local
    ```
7.  Add your Supabase credentials to the newly created `.env.local` file:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

### 4. (Optional) Set up GitHub OAuth

To enable logging in with GitHub, you need to configure an OAuth app in your GitHub account.

1.  In your Supabase project, go to **Authentication** > **Providers** and enable **GitHub**.
2.  You will see a **Redirect URL**. Copy this URL.
3.  Go to your GitHub account, navigate to **Settings** > **Developer settings** > **OAuth Apps**, and create a **New OAuth App**.
4.  Fill in the application details. For the **Authorization callback URL**, paste the URL you copied from Supabase.
5.  Generate a **Client secret** and copy both the **Client ID** and the **Client Secret**.
6.  Return to your Supabase project settings and paste the Client ID and Secret into the GitHub provider configuration.
7.  Save the provider settings.

### 5. Run the Development Server

You are now ready to start the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application. To access the admin panel, you can sign up or log in with the email `frostfoe@gmail.com`.

## 🛠️ Available Scripts

- `pnpm dev`: Starts the development server.
- `pnpm build`: Creates a production-ready build of the application.
- `pnpm start`: Starts the production server.
- `pnpm lint`: Lints the codebase to check for errors.

## 🗄️ Database Schema

The complete database schema is defined in `supabase/schema.sql`. It includes:

- **`profiles` table**: Stores public user data, including username, full name, and spendable points.
- **`challenges` table**: Contains all CTF challenges, their descriptions, points, difficulty, and associated resources.
- **`teams` & `team_members` tables**: Manages team information, roles (admin/member), and relationships between users and teams.
- **`solved_challenges` table**: Tracks which users have solved which challenges and when.
- **`user_leaderboard` & `team_leaderboard_table` views**: Dynamically calculated views that rank individual users and teams based on points.
- **Row Level Security (RLS)**: Comprehensive security policies are in place to ensure users can only access and modify the data they are permitted to.
- **Triggers and Functions**: Automated database logic, such as creating a user profile on signup and handling point awards.

## Folder Structure

The project follows a standard Next.js App Router structure, organizing code by feature and domain.

```
src
├── app/                  # Application routes and pages
│   ├── admin/            # Secure admin panel for managing the platform
│   ├── challenges/       # Challenge listing and individual challenge pages
│   ├── dashboard/        # Personalized user dashboard
│   ├── hall-of-fame/     # Public leaderboard for users and teams
│   ├── p/                # Public user profiles
│   ├── practice/         # Practice area for non-competitive challenges
│   ├── teams/            # Team creation, management, and collaboration
│   └── ...
├── components/           # Reusable React components, organized by feature
├── constants/            # Application-wide constants
├── hooks/                # Custom React hooks
├── lib/                  # Core types, utilities, and database definitions
└── utils/                # Supabase client and server helpers
```

## 🌐 Deployment

This application is ready for deployment on any platform that supports Next.js, such as [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/). Ensure that you set the same environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in your deployment provider's settings. The included `netlify.toml` provides a basic configuration for deploying to Netlify.
