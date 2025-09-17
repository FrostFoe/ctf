import { Hind_Siliguri } from 'next/font/google';
import '../styles/globals.css';
import '../styles/home-page.css';
import '../styles/login.css';
import '../styles/dashboard.css';
import '../styles/layout.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://frostfall.app'),
  title: 'ফ্রস্টফল CTF',
  description:
    'ফ্রস্টফল একটি আধুনিক ক্যাপচার দ্য ফ্ল্যাগ (CTF) প্ল্যাটফর্ম যা সাইবার নিরাপত্তা উত্সাহীদের জন্য ডিজাইন করা হয়েছে। রিয়েল-টাইম লিডারবোর্ড, বিভিন্ন ধরণের চ্যালেঞ্জ এবং একটি সুরক্ষিত অ্যাডমিন প্যানেল উপভোগ করুন।',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="bn" className={'min-h-full dark'} suppressHydrationWarning={true}>
      <body className={hindSiliguri.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
