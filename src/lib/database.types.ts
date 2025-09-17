export interface Challenge {
  name: string;
  id: string;
  icon: string;
  description: string;
  features: string[];
  featured: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'beginner' | 'hacker';
  flag?: string;
  url?: string;
}
