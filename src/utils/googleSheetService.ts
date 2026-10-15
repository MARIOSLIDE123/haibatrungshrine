import { StudentProfile, LeaderboardEntry, ActivityLog } from '../types/student';

// Default mock students across nationwide schools to simulate live ranking if Google Sheet URL is not yet connected
const NATIONWIDE_SAMPLE_STUDENTS: Omit<LeaderboardEntry, 'rank' | 'isCurrentUser'>[] = [
  { id: 'hbt-vn-01', fullName: 'Nguyễn Minh Anh', school: 'THCS Trưng Vương - Hà Nội', className: '6A1', score: 180, learningTimeSeconds: 1540, lastActive: 'Vừa xong' },
  { id: 'hbt-vn-02', fullName: 'Lê Hoàng Nam', school: 'THCS Lê Lợi - TP. Hồ Chí Minh', className: '6B3', score: 165, learningTimeSeconds: 1420, lastActive: '5 phút trước' },
  { id: 'hbt-vn-03', fullName: 'Phạm Quỳnh Chi', school: 'THCS Hai Bà Trưng - Hà Nội', className: '6A2', score: 155, learningTimeSeconds: 1680, lastActive: '12 phút trước' },
  { id: 'hbt-vn-04', fullName: 'Trần Gia Bảo', school: 'THCS Phan Châu Trinh - Đà Nẵng', className: '6/1', score: 140, learningTimeSeconds: 1250, lastActive: '20 phút trước' },
  { id: 'hbt-vn-05', fullName: 'Đặng Tuấn Kiệt', school: 'THCS Ngô Sĩ Liên - Hà Nội', className: '6C2', score: 130, learningTimeSeconds: 1100, lastActive: '35 phút trước' },
  { id: 'hbt-vn-06', fullName: 'Vũ Thảo Nguyên', school: 'THCS Đoàn Thị Điểm - Cần Thơ', className: '6A4', score: 120, learningTimeSeconds: 980, lastActive: '45 phút trước' },
  { id: 'hbt-vn-07', fullName: 'Hoàng Quốc Việt', school: 'THCS Chu Văn An - Hải Phòng', className: '6B1', score: 110, learningTimeSeconds: 890, lastActive: '1 giờ trước' },
  { id: 'hbt-vn-08', fullName: 'Bùi Phương Linh', school: 'THCS Nguyễn Tri Phương - Thừa Thiên Huế', className: '6/2', score: 100, learningTimeSeconds: 850, lastActive: '1 giờ trước' },
  { id: 'hbt-vn-09', fullName: 'Đỗ Hải Đăng', school: 'THCS Trần Phú - Quảng Ninh', className: '6A5', score: 90, learningTimeSeconds: 760, lastActive: '2 giờ trước' },
  { id: 'hbt-vn-10', fullName: 'Ngô Khánh Vy', school: 'THCS Giảng Võ - Hà Nội', className: '6D1', score: 85, learningTimeSeconds: 720, lastActive: '2 giờ trước' },
  { id: 'hbt-vn-11', fullName: 'Dương Thành Long', school: 'THCS Lương Thế Vinh - Đồng Nai', className: '6A3', score: 75, learningTimeSeconds: 610, lastActive: '3 giờ trước' },
  { id: 'hbt-vn-12', fullName: 'Phan Bảo Ngọc', school: 'THCS Kim Đồng - Quảng Nam', className: '6B2', score: 60, learningTimeSeconds: 520, lastActive: '3 giờ trước' },
];

export const FIXED_GOOGLE_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzV01LHtZkVQ_PY9OHJeWGphdMXJAeF_PYJW7-cw5yTgHsRmqh2DUJ3kc1LNZDm9dJG/exec';

export class GoogleSheetService {
  public static getScriptUrl(): string {
    return FIXED_GOOGLE_APPS_SCRIPT_URL;
  }

  public static setScriptUrl(_url: string): void {
    // URL is permanently fixed
  }

  /**
   * Register a new student or record profile to Google Sheet
   */
  public static async registerStudent(student: StudentProfile): Promise<{ success: boolean; message: string }> {
    const url = this.getScriptUrl();
    if (!url) {
      // Local fallback
      return { success: true, message: 'Saved locally. Connect Google Sheet URL to sync online.' };
    }

    try {
      const payload = {
        action: 'register',
        id: student.id,
        fullName: student.fullName,
        school: student.school,
        className: student.className,
        score: student.score,
        learningTimeSeconds: student.learningTimeSeconds,
        timestamp: new Date().toISOString(),
      };

      // Use mode: 'no-cors' or jsonp/post for Google Apps Script Web App
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      });

      return { success: true, message: 'Synchronized with Google Sheet successfully!' };
    } catch (err: any) {
      console.warn('Google Sheet register error:', err);
      return { success: false, message: err?.message || 'Connection error' };
    }
  }

  /**
   * Update student score, learning time, and activity to Google Sheet in real-time
   */
  public static async updateScore(
    student: StudentProfile,
    latestActivity?: ActivityLog
  ): Promise<{ success: boolean; message: string }> {
    const url = this.getScriptUrl();
    if (!url) {
      return { success: true, message: 'Updated locally.' };
    }

    try {
      const payload = {
        action: 'update_score',
        id: student.id,
        fullName: student.fullName,
        school: student.school,
        className: student.className,
        score: student.score,
        learningTimeSeconds: student.learningTimeSeconds,
        latestActivity: latestActivity ? `${latestActivity.title} (+${latestActivity.scoreEarned} pts)` : 'App interaction',
        timestamp: new Date().toISOString(),
      };

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      });

      return { success: true, message: 'Score updated to Google Sheet!' };
    } catch (err: any) {
      console.warn('Google Sheet update score error:', err);
      return { success: false, message: err?.message || 'Connection error' };
    }
  }

  /**
   * Fetch live national leaderboard and calculate rank
   */
  public static async fetchLeaderboard(currentStudent?: StudentProfile | null): Promise<{
    leaderboard: LeaderboardEntry[];
    studentRank: number;
    totalStudents: number;
    isFromSheet: boolean;
  }> {
    const url = this.getScriptUrl();

    let list: Omit<LeaderboardEntry, 'rank' | 'isCurrentUser'>[] = [];
    let isFromSheet = false;

    if (url) {
      try {
        const fetchUrl = `${url}${url.includes('?') ? '&' : '?'}action=get_leaderboard&t=${Date.now()}`;
        const response = await fetch(fetchUrl);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.leaderboard)) {
            list = data.leaderboard;
            isFromSheet = true;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch Google Sheet leaderboard, falling back to cached/mock list:', err);
      }
    }

    if (!isFromSheet || list.length === 0) {
      // Use nationwide sample students
      list = [...NATIONWIDE_SAMPLE_STUDENTS];
    }

    // Merge or update current student
    if (currentStudent && currentStudent.fullName) {
      const existingIdx = list.findIndex(
        (item) => item.id === currentStudent.id || (item.fullName.toLowerCase() === currentStudent.fullName.toLowerCase() && item.school.toLowerCase() === currentStudent.school.toLowerCase())
      );

      const currentUserItem: Omit<LeaderboardEntry, 'rank' | 'isCurrentUser'> = {
        id: currentStudent.id,
        fullName: currentStudent.fullName,
        school: currentStudent.school,
        className: currentStudent.className,
        score: currentStudent.score,
        learningTimeSeconds: currentStudent.learningTimeSeconds,
        lastActive: 'Vừa xong',
      };

      if (existingIdx >= 0) {
        list[existingIdx] = currentUserItem;
      } else {
        list.push(currentUserItem);
      }
    }

    // Sort descending by score, then ascending by learning time (faster is better tie-breaker)
    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.learningTimeSeconds - b.learningTimeSeconds;
    });

    // Assign rank
    let studentRank = 1;
    const rankedList: LeaderboardEntry[] = list.map((item, index) => {
      const rank = index + 1;
      const isCurrentUser = Boolean(
        currentStudent &&
        (item.id === currentStudent.id ||
          (item.fullName.toLowerCase() === currentStudent.fullName.toLowerCase() &&
            item.school.toLowerCase() === currentStudent.school.toLowerCase()))
      );
      if (isCurrentUser) {
        studentRank = rank;
      }
      return {
        ...item,
        rank,
        isCurrentUser,
      };
    });

    return {
      leaderboard: rankedList,
      studentRank,
      totalStudents: rankedList.length,
      isFromSheet,
    };
  }
}
