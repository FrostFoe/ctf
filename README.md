# Next.js Starter Kit

This is a feature-rich starter kit for building modern, scalable, and high-performance web applications. It comes pre-configured with a powerful stack including Next.js, Supabase for backend services, ShadCN UI for beautiful and accessible components, and Tailwind CSS for styling.

## ✨ Features

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Supabase](https://supabase.io/) for authentication, database, and storage.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/) for a set of high-quality, accessible components.
- **Linting & Formatting**: [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for maintaining code quality and consistency.
- **Deployment**: Ready for deployment on platforms like Netlify.

## 🚀 Getting Started

Follow these steps to get your local development environment up and running.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd nextjs-starter-kit
```

### 2. Install Dependencies

This project uses `pnpm` as the package manager.

```bash
pnpm install
```

### 3. Set Up Environment Variables

You'll need to connect to a Supabase project.

1.  Go to [supabase.com](https://supabase.com) and create a new project.
2.  Navigate to **Project Settings** > **API**.
3.  Find your `Project URL` and `anon` `public` key.
4.  Create a `.env.local` file in the root of your project by copying the `.env` file:
    ```bash
    cp .env .env.local
    ```
5.  Add your Supabase URL and anon key to the `.env.local` file:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

### 4. Run the Development Server

Start the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🛠️ Available Scripts

- `pnpm dev`: Starts the development server.
- `pnpm build`: Creates a production-ready build of the application.
- `pnpm start`: Starts the production server.
- `pnpm lint`: Lints the codebase using ESLint.
- `pnpm lint:fix`: Lints and automatically fixes issues.
- `pnpm prettier`: Formats the code using Prettier.
- `pnpm prettier:check`: Checks for formatting issues.
- `pnpm test`: Runs both linting and Prettier checks.

## Folder Structure

The project follows a standard Next.js App Router structure:

```
src
├── app/                  # Main application routes and pages
│   ├── auth/             # Authentication related routes
│   ├── dashboard/        # Protected dashboard routes
│   └── ...
├── components/           # Reusable UI components
│   ├── authentication/
│   ├── dashboard/
│   ├── home/
│   └── ui/               # ShadCN UI components
├── constants/            # Application-wide constants
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and libraries
├── styles/               # Global CSS files
└── utils/                # Utility helpers (e.g., Supabase clients)
```

## 🌐 Deployment

This starter kit is ready to be deployed on any platform that supports Next.js, such as [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/). The included `netlify.toml` provides a basic configuration for deploying to Netlify.
