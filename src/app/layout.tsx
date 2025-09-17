import { Hind_Siliguri } from 'next/font/google';
import '../styles/globals.css';
import '../styles/layout.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://paddle-billing.vercel.app'),
  title: 'এরোএডিট',
  description:
    'এরোএডিট একটি শক্তিশালী টিম ডিজাইন সহযোগিতা অ্যাপ এবং ইমেজ এডিটর। সমস্ত আকারের ব্যবসার জন্য পরিকল্পনা সহ, রিয়েল-টাইম সহযোগিতা, উন্নত সম্পাদনা সরঞ্জাম এবং নির্বিঘ্ন প্রকল্প পরিচালনার মাধ্যমে আপনার কর্মপ্রবাহকে স্ট্রিমলাইন করুন।',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="bn" className={'min-h-full dark'}>
      <body className={hindSiliguri.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
