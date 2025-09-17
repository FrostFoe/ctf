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
  points: number;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string | null;
  total_points: number;
  rank: number;
}

export interface UserStats {
  user_id: string;
  username: string | null;
  total_points: number;
  solved_challenges: number;
  rank: number;
}
