export type Experience = {
  id: string;
  name: string;
  state: string;
  category: string;
  description: string;
  duration: string;
  mediaLabel: string;
  highlight: string;
  vibe: string;
  badge: string;
  story: string;
  location: string;
};

export type WalletEntry = {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  outfit: string;
  language: string;
  interests: string[];
  coins: number;
  streak: number;
  achievements: string[];
  completedExperiences: string[];
  profileComplete: boolean;
};

export type Session = {
  token: string;
  user: User;
};
