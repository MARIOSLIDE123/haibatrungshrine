export interface StudentProfile {
  id: string;
  fullName: string;
  school: string;
  className: string;
  score: number;
  learningTimeSeconds: number;
  registeredAt: string;
  lastActiveAt: string;
  rank?: number;
  totalStudents?: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  title: string;
  activityType: 'quiz' | 'arena' | 'reading' | 'tour360' | 'tutor';
  scoreEarned: number;
  durationSeconds: number;
  details: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  fullName: string;
  school: string;
  className: string;
  score: number;
  learningTimeSeconds: number;
  isCurrentUser?: boolean;
  lastActive: string;
}
