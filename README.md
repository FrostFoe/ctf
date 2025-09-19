# 🧊 ফ্রস্টফল CTF - একটি আধুনিক ক্যাপচার দ্য ফ্ল্যাগ প্ল্যাটফর্ম

ফ্রস্টফল একটি আধুনিক, সম্পূর্ণ কার্যকরী এবং আকর্ষণীয় ডিজাইনের ক্যাপচার দ্য ফ্ল্যাগ (CTF) প্ল্যাটফর্ম, যা সাইবার নিরাপত্তা উত্সাহীদের জন্য বিশেষভাবে তৈরি করা হয়েছে। এটি একটি সম্পূর্ণ ওয়েব অ্যাপ্লিকেশন যা Next.js, Supabase, এবং Tailwind CSS ব্যবহার করে নির্মিত হয়েছে। ব্যবহারকারীরা এখানে বিভিন্ন ধরণের চ্যালেঞ্জ সমাধান করতে, পয়েন্ট অর্জন করতে এবং লিডারবোর্ডে শীর্ষস্থানের জন্য প্রতিযোগিতা করতে পারে।

![ফ্রস্টফল হোমপেজ](https://raw.githubusercontent.com/google-gemini-pro/prompt-generator-for-developers/main/assets/sample-output.png)

## ✨ মূল বৈশিষ্ট্য (Key Features)

- **ডাইনামিক চ্যালেঞ্জ সিস্টেম:** অ্যাডমিন প্যানেল থেকে সহজেই নতুন চ্যালেঞ্জ (সহজ, মাঝারি, কঠিন) যোগ, সম্পাদনা এবং মুছে ফেলার সুবিধা।
- **রিয়েল-টাইম লিডারবোর্ড:** ব্যক্তিগত এবং দলীয় উভয় লিডারবোর্ড, যা রিয়েল-টাইমে আপডেট হয়।
- **ব্যবহারকারী এবং দল ব্যবস্থাপনা:** ব্যবহারকারীরা সাইন আপ করতে, প্রোফাইল তৈরি করতে এবং দলে যোগ দিতে বা দল তৈরি করতে পারে।
- **পয়েন্ট এবং ইঙ্গিত সিস্টেম:** প্রতিটি চ্যালেঞ্জ সমাধানের জন্য পয়েন্ট অর্জন এবং প্রয়োজনে পয়েন্ট খরচ করে ইঙ্গিত কেনার সুবিধা।
- **সুরক্ষিত অ্যাডমিন প্যানেল:** চ্যালেঞ্জ, ব্যবহারকারী এবং দল ব্যবস্থাপনার জন্য একটি শক্তিশালী এবং সুরক্ষিত অ্যাডমিন ড্যাশবোর্ড।
- **পাবলিক প্রোফাইল:** প্রতিটি ব্যবহারকারীর জন্য একটি সুন্দর পাবলিক প্রোফাইল পৃষ্ঠা, যেখানে তাদের র‍্যাঙ্ক, পয়েন্ট এবং সমাধান করা চ্যালেঞ্জগুলো দেখানো হয়।
- **আধুনিক এবং আকর্ষণীয় UI:** ShadCN UI এবং Tailwind CSS ব্যবহার করে নির্মিত একটি সুন্দর এবং প্রতিক্রিয়াশীল ইউজার ইন্টারফেস।
- **নিরাপদ প্রমাণীকরণ (Authentication):** ইমেইল/পাসওয়ার্ড এবং গিটহাব OAuth ব্যবহার করে নিরাপদ লগইন এবং সাইন আপ ব্যবস্থা।

## 🚀 ব্যবহৃত প্রযুক্তি (Tech Stack)

- **ফ্রন্টএন্ড:** [Next.js](https://nextjs.org/) (React Framework)
- **ব্যাকএন্ড এবং ডাটাবেস:** [Supabase](https://supabase.io/) (PostgreSQL)
- **স্টাইলিং:** [Tailwind CSS](https://tailwindcss.com/) এবং [ShadCN UI](https://ui.shadcn.com/)
- **ভাষা:** [TypeScript](https://www.typescriptlang.org/)
- **আইকন:** [Lucide React](https://lucide.dev/)

## 📂 ফোল্ডার কাঠামো (Folder Structure)

আপনার প্রজেক্টের মূল ফাইল এবং ফোল্ডারগুলো নিচে একটি কাঠামো আকারে দেওয়া হলো:

```
.
├── .prettierrc
├── components.json
├── eslint.config.mjs
├── next.config.mjs
├── package.json
├── postcss.config.js
├── README.md
├── src
│   ├── app
│   │   ├── admin
│   │   │   ├── actions.ts
│   │   │   ├── challenge-form-dialog.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── auth
│   │   │   ├── auth-code-error
│   │   │   │   └── page.tsx
│   │   │   ├── callback
│   │   │   │   └── route.ts
│   │   │   └── logout
│   │   │       └── route.ts
│   │   ├── challenges
│   │   │   ├── [id]
│   │   │   │   └── page.tsx
│   │   │   ├── actions.ts
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── dashboard
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── error
│   │   │   └── page.tsx
│   │   ├── hall-of-fame
│   │   │   ├── layout.tsx
│   │   │   ├── page-new.tsx
│   │   │   └── page.tsx
│   │   ├── login
│   │   │   ├── actions.ts
│   │   │   └── page.tsx
│   │   ├── p
│   │   │   └── [slug]
│   │   │       └── page.tsx
│   │   ├── practice
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── profile
│   │   │   ├── actions.ts
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── signup
│   │   │   ├── actions.ts
│   │   │   └── page.tsx
│   │   ├── teams
│   │   │   ├── [id]
│   │   │   │   └── page.tsx
│   │   │   ├── actions.ts
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── admin
│   │   │   ├── admin-challenges-table.tsx
│   │   │   ├── admin-teams-table.tsx
│   │   │   ├── admin-users-table.tsx
│   │   │   └── challenge-form-dialog.tsx
│   │   ├── authentication
│   │   │   ├── authentication-form.tsx
│   │   │   ├── gh-login-button.tsx
│   │   │   ├── login-form.tsx
│   │   │   └── sign-up-form.tsx
│   │   ├── challenges
│   │   │   ├── challenge-submission-form.tsx
│   │   │   ├── challenges-list.tsx
│   │   │   └── hint-display.tsx
│   │   ├── dashboard
│   │   │   ├── landing
│   │   │   │   ├── components
│   │   │   │   │   ├── dashboard-team-members-card-old.tsx
│   │   │   │   │   ├── dashboard-team-members-card.tsx
│   │   │   │   │   ├── dashboard-tutorial-card.tsx
│   │   │   │   │   ├── dashboard-usage-card-group.tsx
│   │   │   │   │   └── dashboard-welcome-hero.tsx
│   │   │   │   └── dashboard-landing-page.tsx
│   │   │   └── layout
│   │   │       ├── dashboard-layout.tsx
│   │   │       ├── dashboard-page-header.tsx
│   │   │       ├── loading-screen.tsx
│   │   │       ├── mobile-sidebar.tsx
│   │   │       ├── sidebar-user-info.tsx
│   │   │       └── sidebar.tsx
│   │   ├── gradients
│   │   │   ├── dashboard-gradient.tsx
│   │   │   ├── featured-card-gradient.tsx
│   │   │   ├── home-page-background.tsx
│   │   │   ├── login-card-gradient.tsx
│   │   │   └── login-gradient.tsx
│   │   ├── home
│   │   │   ├── ctf
│   │   │   │   ├── challenge-title.tsx
│   │   │   │   └── ctf-cards.tsx
│   │   │   ├── footer
│   │   │   │   ├── built-using-tools.tsx
│   │   │   │   ├── footer-links.tsx
│   │   │   │   └── footer.tsx
│   │   │   ├── header
│   │   │   │   ├── country-dropdown.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   └── localization-banner.tsx
│   │   │   ├── hero-section
│   │   │   │   └── hero-section.tsx
│   │   │   ├── home-page.tsx
│   │   │   └── pricing
│   │   │       ├── features-list.tsx
│   │   │       └── pricing.tsx
│   │   ├── profile
│   │   │   └── profile-form.tsx
│   │   ├── shared
│   │   │   ├── bcoin-icon.tsx
│   │   │   ├── confirmation
│   │   │   │   └── confirmation.tsx
│   │   │   ├── select
│   │   │   │   └── select.tsx
│   │   │   ├── status
│   │   │   │   └── status.tsx
│   │   │   └── toggle
│   │   │       └── toggle.tsx
│   │   ├── teams
│   │   │   ├── create-team-card.tsx
│   │   │   ├── team-base.tsx
│   │   │   ├── team-chat.tsx
│   │   │   ├── team-marketplace.tsx
│   │   │   ├── team-view.tsx
│   │   │   └── teams-list.tsx
│   │   └── ui
│   │       ├── accordion.tsx
│   │       ├── alert.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── modern-card.tsx
│   │       ├── podium.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── skeleton.tsx
│   │       ├── stat-card.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       └── use-toast.ts
│   ├── constants
│   │   ├── billing-frequency.ts
│   │   └── index.ts
│   ├── hooks
│   │   ├── usePagination.ts
│   │   └── useUserInfo.ts
│   ├── lib
│   │   ├── database.types.ts
│   │   └── utils.ts
│   ├── styles
│   │   ├── dashboard.css
│   │   ├── globals.css
│   │   ├── home-page.css
│   │   ├── layout.css
│   │   └── login.css
│   └── utils
│       └── supabase
│           ├── client.ts
│           ├── middleware.ts
│           └── server.ts
└── tsconfig.json
```

## 🏁 শুরু করুন (Getting Started)

আপনার লোকাল মেশিনে এই প্রজেক্টটি চালানোর জন্য নিচের ধাপগুলো অনুসরণ করুন:

**১. প্রজেক্ট ক্লোন করুন:**

```bash
git clone <your-repository-url>
cd <repository-name>
```

**২. নির্ভরতা ইনস্টল করুন (Install Dependencies):**

```bash
pnpm install
```

**৩. পরিবেশ ভেরিয়েবল সেটআপ করুন (Setup Environment Variables):**
`.env` ফাইলটি `.env.local` নামে কপি করুন এবং আপনার Supabase প্রজেক্টের URL এবং Anon Key যোগ করুন:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**৪. Supabase ডাটাবেস সেটআপ করুন:**
আপনার Supabase প্রজেক্টের SQL Editor-এ এখন শুধু একটিই ফাইল চালাতে হবে: `supabase/database_setup.sql`।

```sql
-- Supabase SQL Editor বা psql থেকে রান করুন
\i supabase/database_setup.sql
```

এটি একবারেই সমস্ত টেবিল, ভিউ, ফাংশন, পলিসি, ট্রিগার, রিয়েলটাইম পাবলিকেশন, স্টোরেজ বাকেট এবং সিড ডাটা তৈরি করবে। পুনরায় চালালে কোনো ডুপ্লিকেট এরর হবে না (Idempotent design)।

**৫. লোকাল সার্ভার চালান:**

```bash
pnpm dev
```

এখন আপনার ব্রাউজারে [http://localhost:3000](http://localhost:3000) ভিজিট করে অ্যাপ্লিকেশনটি দেখতে পারবেন।

## 🤝 অবদান (Contributing)

এই প্রজেক্টে অবদান রাখতে চাইলে, অনুগ্রহ করে একটি নতুন Pull Request তৈরি করুন। আমরা আপনার অবদানকে স্বাগত জানাই!
