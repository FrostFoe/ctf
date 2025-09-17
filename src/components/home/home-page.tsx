'use client';

import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import '../../styles/home-page.css';
import { LocalizationBanner } from '@/components/home/header/localization-banner';
import Header from '@/components/home/header/header';
import { HeroSection } from '@/components/home/hero-section/hero-section';
import { Pricing } from '@/components/home/pricing/pricing';
import { HomePageBackground } from '@/components/gradients/home-page-background';
import { Footer } from '@/components/home/footer/footer';
import type { Challenge } from '@/lib/database.types';

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
