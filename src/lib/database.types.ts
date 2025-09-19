export interface Challenge {
  name: string;
  id: string;
  icon: string;
  description: string;
  features: string[];
  featured: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'beginner' | 'hacker' | 'practice';
  flag?: string;
  url?: string;
  points: number;
  resources?: ChallengeResource[];
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

export interface Team {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  points: number;
  is_private: boolean;
  join_token?: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  username: string | null;
  role: 'admin' | 'member';
}

export interface TeamDetails extends Team {
  members: TeamMember[];
}

export interface TeamLeaderboardEntry {
  team_id: string;
  team_name: string;
  total_points: number;
  member_count: number;
  rank: number;
}

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  spendable_points: number;
}

export interface TeamMarketplaceItem {
  id: number;
  name: string;
  description: string;
  cost: number;
  item_type: 'global_hint';
  item_metadata: { challenge_id: string };
}

export interface TeamChatMessage {
  id: number;
  team_id: string;
  user_id: string;
  message: string;
  created_at: string;
  profile: { username: string | null } | { username: string | null }[] | null;
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
  category: 'beginner' | 'hacker' | 'practice';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  solved_at: string;
}

export interface AdminData {
  challenges: Challenge[];
  users: LeaderboardEntry[];
  teams: TeamLeaderboardEntry[];
}
