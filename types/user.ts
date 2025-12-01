export interface User {
  id: string;
  email: string;
  name?: string;
  age?: number;
  xp: number;
  level: number;
  streak: number;
  lastActivityDate?: string;
  createdAt: string;
}

export interface UserProfile extends User {
  totalSessions: number;
  averageScore: number;
  badges: string[];
}


