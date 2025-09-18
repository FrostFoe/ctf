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
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── challenges/
│   │   ├── dashboard/
│   │   ├── error/
│   │   ├── hall-of-fame/
│   │   ├── login/
│   │   ├── p/
│   │   ├── practice/
│   │   ├── profile/
│   │   ├── signup/
│   │   ├── teams/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── admin/
│   │   ├── authentication/
│   │   ├── challenges/
│   │   ├── dashboard/
│   │   ├── gradients/
│   │   ├── home/
│   │   ├── profile/
│   │   ├── shared/
│   │   ├── teams/
│   │   └── ui/
│   ├── constants/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   └── utils/
│       └── supabase/
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
আপনার Supabase প্রজেক্টের SQL Editor-এ `supabase/schema.sql` ফাইলে থাকা সম্পূর্ণ স্কিমাটি রান করুন। এটি সমস্ত প্রয়োজনীয় টেবিল, ফাংশন এবং পলিসি তৈরি করবে।

**৫. লোকাল সার্ভার চালান:**

```bash
pnpm dev
```

এখন আপনার ব্রাউজারে [http://localhost:3000](http://localhost:3000) ভিজিট করে অ্যাপ্লিকেশনটি দেখতে পারবেন।

## 🤝 অবদান (Contributing)

এই প্রজেক্টে অবদান রাখতে চাইলে, অনুগ্রহ করে একটি নতুন Pull Request তৈরি করুন। আমরা আপনার অবদানকে স্বাগত জানাই!
