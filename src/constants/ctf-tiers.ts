export interface CTFTier {
  name: string;
  id: 'beginner-detective' | 'beginner-riddle' | 'beginner-spy' | 'intermediate-crypto' | 'intermediate-web' | 'advanced-binary';
  icon: string;
  description: string;
  features: string[];
  featured: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'beginner' | 'hacker';
}

export const CTFTiers: CTFTier[] = [
  {
    name: 'গোয়েন্দা',
    id: 'beginner-detective',
    icon: '/assets/icons/ctf-tiers/detective-icon.svg',
    description: 'সাধারণ গোয়েন্দাগিরি - ক্লু খুঁজে বের করুন এবং রহস্য সমাধান করুন।',
    features: [
      'বেসিক ক্লু হান্টিং',
      'লজিকাল থিংকিং',
      'স্টোরি বেসড চ্যালেঞ্জ',
      '১০-১৫ মিনিট সময় লাগে'
    ],
    featured: false,
    difficulty: 'easy',
    category: 'beginner',
  },
  {
    name: 'রিডল',
    id: 'beginner-riddle',
    icon: '/assets/icons/ctf-tiers/riddle-icon.svg',
    description: 'বুদ্ধিমত্তার পরীক্ষা - ধাঁধাঁ সমাধান করে অগ্রসর হোন।',
    features: [
      'ক্রিয়েটিভ রিডলস',
      'প্যাটার্ন রেকগনিশন',
      'ব্রেইন টিউজার',
      '১৫-২০ মিনিট সময় লাগে'
    ],
    featured: true,
    difficulty: 'easy',
    category: 'beginner',
  },
  {
    name: 'স্পাই মিশন',
    id: 'beginner-spy',
    icon: '/assets/icons/ctf-tiers/spy-icon.svg',
    description: 'গোপন মিশন - তথ্য সংগ্রহ করে লক্ষ্য অর্জন করুন।',
    features: [
      'ইনফরমেশন গ্যাদারিং',
      'স্টেলথ অপারেশন',
      'মিশন কমপ্লিট',
      '২০-২৫ মিনিট সময় লাগে'
    ],
    featured: false,
    difficulty: 'easy',
    category: 'beginner',
  },
  {
    name: 'ক্রিপ্টো',
    id: 'intermediate-crypto',
    icon: '/assets/icons/ctf-tiers/crypto-icon.svg',
    description: 'এনক্রিপশনের জগত - কোড ভেঙে তথ্য উদ্ধার করুন।',
    features: [
      'এডভান্সড এনক্রিপশন',
      'ক্রিপ্টোগ্রাফিক অ্যাটাক',
      'কী ব্রেকিং',
      'ম্যাথমেটিক্যাল থিংকিং',
      '২৫-৩৫ মিনিট সময় লাগে'
    ],
    featured: false,
    difficulty: 'medium',
    category: 'hacker',
  },
  {
    name: 'ওয়েব সিকিউরিটি',
    id: 'intermediate-web',
    icon: '/assets/icons/ctf-tiers/web-icon.svg',
    description: 'ওয়েব অ্যাপ্লিকেশন ভালনারেবিলিটি - সিকিউরিটি ফ্লস খুঁজে বের করুন।',
    features: [
      'এসকিউএল ইনজেকশন',
      'ক্রস-সাইট স্ক্রিপ্টিং',
      'ওয়েব ভালনারেবিলিটি',
      'পেন্টেস্টিং',
      '৩০-৪০ মিনিট সময় লাগে'
    ],
    featured: true,
    difficulty: 'medium',
    category: 'hacker',
  },
  {
    name: 'বাইনারি এক্সপ্লয়েট',
    id: 'advanced-binary',
    icon: '/assets/icons/ctf-tiers/binary-icon.svg',
    description: 'এক্সপার্ট লেভেল - বাইনারি কোড অ্যানালাইসিস এবং এক্সপ্লয়েট।',
    features: [
      'রিভার্স ইঞ্জিনিয়ারিং',
      'বাফার ওভারফ্লো',
      'মেমরি করাপশন',
      'এডভান্সড এক্সপ্লয়েট',
      '৪৫+ মিনিট সময় লাগে'
    ],
    featured: false,
    difficulty: 'hard',
    category: 'hacker',
  },
];