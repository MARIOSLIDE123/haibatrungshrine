import { StudentProfile, ActivityLog, LeaderboardEntry } from '../types/student';
import { GoogleSheetService } from './googleSheetService';

const STUDENT_PROFILE_KEY = 'hbt_student_profile';
const ACTIVITY_HISTORY_KEY = 'hbt_activity_history';

export class StudentStorage {
  private static profile: StudentProfile | null = null;
  private static listeners: Array<(profile: StudentProfile | null) => void> = [];

  public static getProfile(): StudentProfile | null {
    if (this.profile) return this.profile;
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(STUDENT_PROFILE_KEY);
      if (stored) {
        this.profile = JSON.parse(stored);
        return this.profile;
      }
    } catch (e) {
      console.warn('Error reading student profile from localStorage', e);
    }
    return null;
  }

  public static saveProfile(profile: StudentProfile): void {
    this.profile = profile;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(profile));
    }
    this.notifyListeners();
  }

  public static createProfile(data: { fullName: string; school: string; className: string }): StudentProfile {
    const id = 'HBT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newProfile: StudentProfile = {
      id,
      fullName: data.fullName.trim(),
      school: data.school.trim(),
      className: data.className.trim(),
      score: 0,
      learningTimeSeconds: 0,
      registeredAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    this.saveProfile(newProfile);

    // Register to Google Sheet in background
    GoogleSheetService.registerStudent(newProfile).catch(console.error);

    return newProfile;
  }

  public static updateProfile(updates: Partial<StudentProfile>): StudentProfile | null {
    const current = this.getProfile();
    if (!current) return null;

    const updated: StudentProfile = {
      ...current,
      ...updates,
      lastActiveAt: new Date().toISOString(),
    };

    this.saveProfile(updated);
    return updated;
  }

  /**
   * Add score and log activity, sync with Google Sheet
   */
  public static addScore(points: number, activity: {
    title: string;
    activityType: 'quiz' | 'arena' | 'reading' | 'tour360' | 'tutor';
    durationSeconds?: number;
    details?: string;
  }): StudentProfile | null {
    const current = this.getProfile();
    if (!current) return null;

    const newScore = Math.max(0, current.score + points);
    const updated = this.updateProfile({ score: newScore });

    const log: ActivityLog = {
      id: 'act-' + Date.now(),
      timestamp: new Date().toISOString(),
      title: activity.title,
      activityType: activity.activityType,
      scoreEarned: points,
      durationSeconds: activity.durationSeconds || 0,
      details: activity.details || `Đạt ${points} điểm`,
    };

    this.addActivityLog(log);

    // Sync to Google Sheet
    if (updated) {
      GoogleSheetService.updateScore(updated, log).catch(console.error);
    }

    return updated;
  }

  /**
   * Increment learning time
   */
  public static incrementTime(seconds: number = 1): void {
    const current = this.getProfile();
    if (!current) return;

    current.learningTimeSeconds += seconds;
    current.lastActiveAt = new Date().toISOString();
    // Do not notify on every single second to avoid re-renders, save directly
    if (typeof window !== 'undefined') {
      localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(current));
    }
  }

  /**
   * Activity history
   */
  public static getActivityHistory(): ActivityLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(ACTIVITY_HISTORY_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  }

  public static addActivityLog(log: ActivityLog): void {
    const history = this.getActivityHistory();
    const updated = [log, ...history].slice(0, 50); // keep last 50
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVITY_HISTORY_KEY, JSON.stringify(updated));
    }
  }

  /**
   * Subscriptions
   */
  public static subscribe(listener: (profile: StudentProfile | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners(): void {
    const p = this.getProfile();
    this.listeners.forEach((listener) => listener(p));
  }
}
