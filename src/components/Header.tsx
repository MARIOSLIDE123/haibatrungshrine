import React from 'react';
import {
  Volume2,
  VolumeX,
  BookOpen,
  HelpCircle,
  Trophy,
  Compass,
  GraduationCap,
  ZoomIn,
  ZoomOut,
  Type,
  Sparkles,
  Star,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';
import { StudentProfile } from '../types/student';

export type TabType = 'reading' | 'quiz' | 'arena' | 'tour360' | 'leaderboard';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  student: StudentProfile | null;
  onOpenProfile: () => void;
  fontScale: number;
  onFontScaleChange: (scale: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  soundEnabled,
  setSoundEnabled,
  student,
  onOpenProfile,
  fontScale,
  onFontScaleChange,
}) => {
  const toggleSound = () => {
    const next = soundEffects.toggle();
    setSoundEnabled(next);
  };

  const navItems = [
    {
      id: 'reading' as TabType,
      label: 'Reading & Audio',
      icon: BookOpen,
      emoji: '📖',
      badge: 'Bài Đọc',
      colorActive: 'btn-3d-blue',
      colorInactive: 'hover:bg-sky-50 text-sky-900 border-sky-300',
    },
    {
      id: 'quiz' as TabType,
      label: 'INTERACTIVE QUIZ',
      icon: HelpCircle,
      emoji: '🎯',
      badge: '5 Câu Hỏi',
      colorActive: 'btn-3d-yellow',
      colorInactive: 'hover:bg-amber-50 text-amber-900 border-amber-300',
    },
    {
      id: 'arena' as TabType,
      label: 'BRAIN ARENA',
      icon: Trophy,
      emoji: '🔥',
      badge: '15 Thử Thách',
      colorActive: 'btn-3d-red',
      colorInactive: 'hover:bg-rose-50 text-rose-900 border-rose-300',
    },
    {
      id: 'tour360' as TabType,
      label: '360° SHRINE TOUR',
      icon: Compass,
      emoji: '🏰',
      badge: 'Thực Tế Ảo',
      colorActive: 'btn-3d-green',
      colorInactive: 'hover:bg-emerald-50 text-emerald-900 border-emerald-300',
    },
    {
      id: 'leaderboard' as TabType,
      label: 'NATIONAL RANKING',
      icon: Trophy,
      emoji: '🏆',
      badge: 'Top Toàn Quốc',
      colorActive: 'btn-3d-purple',
      colorInactive: 'hover:bg-purple-50 text-purple-900 border-purple-300',
    },
  ];

  const handleDecreaseFont = () => {
    soundEffects.playClick();
    const next = Math.max(0.9, Number((fontScale - 0.1).toFixed(1)));
    onFontScaleChange(next);
  };

  const handleIncreaseFont = () => {
    soundEffects.playClick();
    const next = Math.min(1.35, Number((fontScale + 0.1).toFixed(1)));
    onFontScaleChange(next);
  };

  const handleResetFont = () => {
    soundEffects.playClick();
    onFontScaleChange(1.0);
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 shadow-xl w-full border-b-4 border-amber-400">
      {/* Top Banner - Cheerful Kids Theme */}
      <div className="bg-amber-300 text-amber-950 text-xs px-4 lg:px-8 py-1.5 flex justify-between items-center tracking-wide font-extrabold shadow-inner">
        <div className="flex items-center gap-2">
          <span className="text-sm">🐘</span>
          <span>ĐỀN HAI BÀ TRƯNG • ĐỒNG NHÂN, HÀ NỘI</span>
          <span className="hidden sm:inline bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
            DI TÍCH QUỐC GIA ĐẶC BIỆT
          </span>
        </div>
        <div className="flex items-center gap-2 text-amber-950 text-xs font-bold">
          <span className="hidden md:inline">🌟 English Fun Learning Journey</span>
          <span>•</span>
          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-black text-[11px]">
            Lớp 6 / Tiểu Học & Mầm Non
          </span>
        </div>
      </div>

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-2xl border-2 border-amber-300 shrink-0 transform hover:rotate-6 transition">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-black tracking-wider text-amber-200 bg-black/20 px-2.5 py-0.5 rounded-full">
                  Vietnamese National Heritage
                </span>
                <span className="text-xs text-white/90 font-semibold hidden sm:inline">Hanoi, Vietnam</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight drop-shadow-md">
                HAI BA TRUNG SHRINE
              </h1>
              <p className="text-xs sm:text-sm text-amber-100 font-semibold drop-shadow-xs">
                Khám phá Lịch sử • Bài đọc Tiếng Anh • Đố vui Brain Arena • Xếp hạng Toàn quốc
              </p>
            </div>
          </div>

          {/* Action Toolbar: Student Profile Badge + Font Zoom + Sound */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-end lg:self-auto">
            {/* Student Profile Button (3D Button Style) */}
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenProfile();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-amber-50 text-slate-800 border-2 border-amber-300 shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
              title="Nhấn để xem thông tin học sinh và bảng xếp hạng"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow">
                🎓
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="text-xs sm:text-sm font-black text-slate-900 max-w-[130px] truncate">
                    {student ? student.fullName : 'Học sinh'}
                  </span>
                  {student && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-black border border-rose-200">
                      {student.className}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-600 font-black">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{student ? student.score : 0} điểm</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-semibold text-[11px]">Hồ sơ & BXH</span>
                </div>
              </div>
            </button>

            {/* Font Size Scaling Controls (Kids Pill) */}
            <div className="flex items-center bg-white/90 border-2 border-amber-300 rounded-2xl px-2 py-1 gap-1 text-slate-800 text-xs shadow-md">
              <button
                onClick={handleDecreaseFont}
                disabled={fontScale <= 0.9}
                className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold disabled:opacity-40"
                title="Giảm cỡ chữ (A-)"
              >
                <ZoomOut className="w-4 h-4 text-slate-700" />
              </button>
              <button
                onClick={handleResetFont}
                className="px-2 py-1 font-black text-xs hover:text-rose-600 rounded-lg"
                title="Cỡ chữ mặc định"
              >
                <span>{Math.round(fontScale * 100)}%</span>
              </button>
              <button
                onClick={handleIncreaseFont}
                disabled={fontScale >= 1.35}
                className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold disabled:opacity-40"
                title="Tăng cỡ chữ (A+)"
              >
                <ZoomIn className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            {/* Sound Toggle (Bright 3D Button) */}
            <button
              onClick={toggleSound}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition border-2 shadow-md cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-300 text-amber-950 border-amber-400 hover:bg-amber-200'
                  : 'bg-white/80 text-slate-600 border-white hover:bg-white'
              }`}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-amber-900" />
                  <span className="hidden sm:inline">Loa: BẬT 🎵</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">Loa: TẮT 🔇</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Playful 3D Buttons for Kids */}
        <nav className="flex items-center gap-2 sm:gap-3 mt-3 pt-3 border-t-2 border-white/30 overflow-x-auto no-scrollbar pb-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundEffects.playClick();
                  setActiveTab(item.id);
                }}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? `${item.colorActive} shadow-lg scale-105 ring-2 ring-white`
                    : 'bg-white/90 hover:bg-white text-slate-800 border-b-4 border-slate-300 hover:border-slate-400'
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                <span>{item.label}</span>
                <span
                  className={`hidden sm:inline-block text-[10px] uppercase px-2 py-0.5 rounded-full font-black ${
                    isActive
                      ? 'bg-black/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
