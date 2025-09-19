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
  points: number;
  url: string | null;
  resources: ChallengeResource[] | null;
}

export interface ChallengeResource {
  name: string;
  url: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string | null;
  total_points: number;
  rank: number;
  email?: string;
}

export interface UserStats {
  user_id: string;
  username: string | null;
  total_points: number;
  solved_challenges: number;
  rank: number;
  spendable_points: number;
  full_name: string | null;
}

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  spendable_points: number;
}

export interface PublicProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  total_points: number;
  rank: number;
  solved_challenges_count: number;
}

export interface SolvedChallenge {
  id: string;
  name: string;
  description: string;
  category: 'beginner' | 'hacker';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  solved_at: string;
}

export interface AdminData {
  challenges: Challenge[];
  users: LeaderboardEntry[];
}
