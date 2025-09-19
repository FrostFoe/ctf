'use client';

import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { LocalizationBanner } from '@/components/home/header/localization-banner';
import Header from '@/components/home/header/header';
import { HeroSection } from '@/components/home/hero-section/hero-section';
import { HomePageBackground } from '@/components/gradients/home-page-background';
import type { Challenge } from '@/lib/database.types';
import dynamic from 'next/dynamic';

const Pricing = dynamic(() => import('@/components/home/pricing/pricing').then((mod) => mod.Pricing));
const Footer = dynamic(() => import('@/components/home/footer/footer').then((mod) => mod.Footer));

interface Props {
  user: User | null;
  challenges: Challenge[];
}

export function HomePage({ user, challenges }: Props) {
  const [country, setCountry] = useState('US');

  return (
    <>
      <LocalizationBanner country={country} onCountryChange={setCountry} />
      <div>
        <HomePageBackground />
        <Header user={user} />
        <HeroSection />
        <Pricing challenges={challenges} />
        <Footer />
      </div>
    </>
  );
}
