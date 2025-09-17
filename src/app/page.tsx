import { HomePage } from '@/components/home/home-page';
import { createClient } from '@/utils/supabase/server';
import type { Challenge } from '@/lib/database.types';

const hardcodedChallenges: Challenge[] = [
  {
    id: 'goyenda',
    name: 'গোয়েন্দা',
    icon: '/assets/icons/ctf-tiers/detective-icon.svg',
    description: 'সাধারণ গোয়েন্দাগিরি - ক্লু খুঁজে বের করুন এবং রহস্য সমাধান করুন।',
    features: ['বেসিক ক্লু হান্টিং', 'লজিকাল থিংকিং', 'স্টোরি বেসড চ্যালেঞ্জ', '১০-১৫ মিনিট সময় লাগে'],
    featured: false,
    difficulty: 'easy',
    category: 'beginner',
    points: 10,
  },
  {
    id: 'riddle',
    name: 'রিডল',
    icon: '/assets/icons/ctf-tiers/riddle-icon.svg',
    description: 'বুদ্ধিমত্তার পরীক্ষা - ধাঁধাঁ সমাধান করে অগ্রসর হোন।',
    features: ['ক্রিয়েটিভ রিডলস', 'প্যাটার্ন রেকগনিশন', 'ব্রেইন টিউজার', '১৫-২০ মিনিট সময় লাগে'],
    featured: true,
    difficulty: 'easy',
    category: 'beginner',
    points: 20,
  },
  {
    id: 'spy-mission',
    name: 'স্পাই মিশন',
    icon: '/assets/icons/ctf-tiers/spy-icon.svg',
    description: 'গোপন মিশন - তথ্য সংগ্রহ করে লক্ষ্য অর্জন করুন।',
    features: ['ইনফরমেশন গ্যাদারিং', 'স্টেলথ অপারেশন', 'মিশন কমপ্লিট', '২০-২৫ মিনিট সময় লাগে'],
    featured: false,
    difficulty: 'easy',
    category: 'beginner',
    points: 30,
  },
  {
    id: 'crypto',
    name: 'ক্রিপ্টো',
    icon: '/assets/icons/ctf-tiers/crypto-icon.svg',
    description: 'এনক্রিপশনের জগত - কোড ভেঙে তথ্য উদ্ধার করুন।',
    features: [
      'এডভান্সড এনক্রিপশন',
      'ক্রিপ্টোগ্রাফিক অ্যাটাক',
      'কী ব্রেকিং',
      'ম্যাথমেটিক্যাল থিংকিং',
      '২৫-৩৫ মিনিট সময় লাগে',
    ],
    featured: false,
    difficulty: 'medium',
    category: 'hacker',
    points: 50,
  },
  {
    id: 'web-security',
    name: 'ওয়েব সিকিউরিটি',
    icon: '/assets/icons/ctf-tiers/web-icon.svg',
    description: 'ওয়েব অ্যাপ্লিকেশন ভালনারেবিলিটি - সিকিউরিটি ফ্লস খুঁজে বের করুন।',
    features: [
      'এসকিউএল ইনজেকশন',
      'ক্রস-সাইট স্ক্রিপ্টিং',
      'ওয়েব ভালনারেবিলিটি',
      'পেন্টেস্টিং',
      '৩০-৪০ মিনিট সময় লাগে',
    ],
    featured: true,
    difficulty: 'medium',
    category: 'hacker',
    points: 75,
  },
  {
    id: 'binary-exploit',
    name: 'বাইনারি এক্সপ্লয়েট',
    icon: '/assets/icons/ctf-tiers/binary-icon.svg',
    description: 'এক্সপার্ট লেভেল - বাইনারি কোড অ্যানালাইসিস এবং এক্সপ্লয়েট।',
    features: [
      'রিভার্স ইঞ্জিনিয়ারিং',
      'বাফার ওভারফ্লো',
      'মেমরি করাপশন',
      'এডভান্সড এক্সপ্লয়েট',
      '৪৫+ মিনিট সময় লাগে',
    ],
    featured: false,
    difficulty: 'hard',
    category: 'hacker',
    points: 100,
  },
];

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <HomePage user={user} challenges={hardcodedChallenges} />;
}
