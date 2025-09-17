export interface Tier {
  name: string;
  id: 'starter' | 'pro' | 'advanced';
  icon: string;
  description: string;
  features: string[];
  featured: boolean;
  priceId: Record<string, string>;
}

export const PricingTier: Tier[] = [
  {
    name: 'স্টার্টার',
    id: 'starter',
    icon: '/assets/icons/price-tiers/free-icon.svg',
    description: 'যারা সাধারণ ডিজাইনের কাজ শুরু করতে চান তাদের জন্য আদর্শ।',
    features: ['১টি ওয়ার্কস্পেস', 'সীমিত সহযোগিতা', 'PNG এবং SVG তে এক্সপোর্ট করুন'],
    featured: false,
    priceId: { month: 'pri_01hsxyh9txq4rzbrhbyngkhy46', year: 'pri_01hsxyh9txq4rzbrhbyngkhy46' },
  },
  {
    name: 'প্রো',
    id: 'pro',
    icon: '/assets/icons/price-tiers/basic-icon.svg',
    description: 'স্কেলিং টিমের জন্য উন্নত ডিজাইন সরঞ্জাম যাদের আরও নমনীয়তা প্রয়োজন।',
    features: ['ইন্টিগ্রেশন', 'সীমাহীন ওয়ার্কস্পেস', 'উন্নত সম্পাদনা সরঞ্জাম', 'স্টার্টার-এর সবকিছু'],
    featured: true,
    priceId: { month: 'pri_01hsxycme6m95sejkz7sbz5e9g', year: 'pri_01hsxyeb2bmrg618bzwcwvdd6q' },
  },
  {
    name: 'অ্যাডভান্সড',
    id: 'advanced',
    icon: '/assets/icons/price-tiers/pro-icon.svg',
    description: 'ব্যাপক সহযোগিতা এবং কাস্টমাইজেশনের জন্য ডিজাইন করা শক্তিশালী সরঞ্জাম।',
    features: [
      'একক সাইন অন (SSO)',
      'উন্নত সংস্করণ নিয়ন্ত্রণ',
      'সম্পদ লাইব্রেরি',
      'অতিথি অ্যাকাউন্ট',
      'প্রো-এর সবকিছু',
    ],
    featured: false,
    priceId: { month: 'pri_01hsxyff091kyc9rjzx7zm6yqh', year: 'pri_01hsxyfysbzf90tkh2wqbfxwa5' },
  },
];
