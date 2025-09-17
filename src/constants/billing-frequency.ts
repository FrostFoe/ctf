export interface IChallengeDifficulty {
  value: string;
  label: string;
  description: string;
}

export const ChallengeDifficulty: IChallengeDifficulty[] = [
  { value: 'beginner', label: 'শিক্ষানবিস', description: 'শুরু করার জন্য সহজ চ্যালেঞ্জ' },
  { value: 'hacker', label: 'হ্যাকার', description: 'এক্সপার্ট লেভেল চ্যালেঞ্জ' },
];
