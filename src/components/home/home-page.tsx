'use client';

import Header from '@/components/home/header/header';
import { HeroSection } from '@/components/home/hero-section/hero-section';
import { HomePageBackground } from '@/components/gradients/home-page-background';
import type { Challenge } from '@/lib/database.types';
import dynamic from 'next/dynamic';
import type { User } from '@supabase/supabase-js';

const ChallengesSection = dynamic(
  () => import('@/components/home/challenges-section/challenges-section').then((mod) => mod.ChallengesSection),
  {
    ssr: false,
  },
);
const Footer = dynamic(() => import('@/components/home/footer/footer').then((mod) => mod.Footer));

interface Props {
  challenges: Challenge[];
  user: User | null;
}

export function HomePage({ challenges, user }: Props) {
  return (
    <>
      <div>
        <HomePageBackground />
        <Header user={user} />
        <HeroSection />
        <ChallengesSection challenges={challenges} />
        <Footer />
      </div>
    </>
  );
}
