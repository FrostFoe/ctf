# AeroEdit - CTF Challenge Platform

AeroEdit is a Capture The Flag (CTF) platform built with Next.js, Supabase, and Tailwind CSS. It provides a fun and engaging environment for users to solve various cybersecurity challenges, from beginner to expert levels.

## ✨ Features

- **User Authentication:** Secure sign-up and login with Supabase Auth, including GitHub OAuth and guest access.
- **CTF Challenges:** A variety of challenges categorized by difficulty (Newbie, Hacker).
- **Interactive UI:** A sleek and modern interface built with ShadCN UI and Tailwind CSS.
- **Dashboard:** A user dashboard to track usage, manage team members, and access tutorials.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Authentication & Database:** [Supabase](https://supabase.io/)
- **Deployment:** [Netlify](https://www.netlify.com/)

## 🏁 Getting Started

### Prerequisites

Make sure you have Node.js (v20 or higher) and pnpm installed on your machine.

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/aeroedit.git
    cd aeroedit
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root of your project and add your Supabase credentials. You can find these in your Supabase project settings.

    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Deployment

This template is configured for deployment on [Netlify](https://www.netlify.com/). Simply connect your Git repository to a new Netlify site, and it will be deployed automatically. The `netlify.toml` file contains the necessary build configurations.
