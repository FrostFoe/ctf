import { HomePage } from '@/components/home/home-page';
import { createClient } from '@/utils/supabase/server';
import type { Challenge } from '@/lib/database.types';

const hardcodedChallenges: Challenge[] = [
  {
    id: 'web-exploitation-101',
    name: 'Web Exploitation 101',
    icon: '/assets/icons/ctf-tiers/default-icon.svg',
    description: 'Learn the basics of web security and find vulnerabilities in a simple web application.',
    features: ['HTML/CSS', 'JavaScript', 'SQL Injection Basics'],
    featured: true,
    difficulty: 'easy',
    category: 'beginner',
    points: 10,
  },
  {
    id: 'crypto-intro',
    name: 'Crypto Intro',
    icon: '/assets/icons/ctf-tiers/default-icon.svg',
    description: 'An introduction to cryptographic principles. Decrypt a message to find the flag.',
    features: ['Caesar Cipher', 'Base64 Encoding', 'Frequency Analysis'],
    featured: false,
    difficulty: 'easy',
    category: 'beginner',
    points: 15,
  },
  {
    id: 'forensics-fun',
    name: 'Forensics Fun',
    icon: '/assets/icons/ctf-tiers/default-icon.svg',
    description: 'Analyze a captured network traffic file to uncover hidden information and find the flag.',
    features: ['Wireshark', 'Packet Analysis', 'File Carving'],
    featured: false,
    difficulty: 'medium',
    category: 'hacker',
    points: 50,
  },
];

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <HomePage user={user} challenges={hardcodedChallenges} />;
}
