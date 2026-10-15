import React, { useState } from 'react';
import { User, School, BookOpen, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface StudentRegisterModalProps {
  isOpen: boolean;
  onComplete: (data: { fullName: string; school: string; className: string }) => void;
  initialData?: { fullName: string; school: string; className: string } | null;
  isEditing?: boolean;
  onClose?: () => void;
}

export const StudentRegisterModal: React.FC<StudentRegisterModalProps> = ({
  isOpen,
  onComplete,
  initialData,
  isEditing = false,
  onClose,
}) => {
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [school, setSchool] = useState(initialData?.school || '');
  const [className, setClassName] = useState(initialData?.className || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full name (Vui lòng nhập Họ và tên)');
      soundEffects.playIncorrect();
      return;
    }
    if (!school.trim()) {
      setError('Please enter your school (Vui lòng nhập Trường học)');
      soundEffects.playIncorrect();
      return;
    }
    if (!className.trim()) {
      setError('Please enter your class (Vui lòng nhập Lớp học)');
      soundEffects.playIncorrect();
      return;
    }

    soundEffects.playCorrect();
    setError('');
    onComplete({
      fullName: fullName.trim(),
      school: school.trim(),
      className: className.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-50 via-white to-orange-50 border-4 border-amber-400 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-900 overflow-hidden">
        {/* Playful Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/50 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-200/40 rounded-full blur-xl pointer-events-none" />

        {/* Decorative Badge */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-900 text-xs sm:text-sm font-extrabold tracking-wide uppercase mb-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
            <span>🌟 Hai Ba Trung Shrine Adventure 🐘</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-rose-950 tracking-tight flex items-center justify-center gap-2">
            <span>{isEditing ? '✏️ Update Profile' : '🎒 Chào Mừng Bạn Nhỏ!'}</span>
          </h2>
          <p className="text-amber-800 font-bold text-xs sm:text-sm mt-1">
            {isEditing ? 'Cập nhật thông tin học sinh' : 'Bé hãy điền thông tin để cùng khám phá & thi đấu nhé! 🎉'}
          </p>
          <div className="w-20 h-1.5 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 mx-auto mt-3 rounded-full"></div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-100 border-2 border-rose-400 text-rose-900 text-sm font-bold rounded-2xl flex items-center gap-2.5 animate-shake shadow-xs">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4.5 relative">
          {/* Full Name */}
          <div className="bg-white/80 p-3 sm:p-3.5 rounded-2xl border-2 border-amber-200 shadow-xs">
            <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
              <span className="text-lg">👤</span>
              <span className="text-rose-900 font-extrabold">Full Name</span>
              <span className="text-amber-800 font-bold">(Họ và tên)</span>
              <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Trần Hồng Ngọc"
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-amber-50/50 border-2 border-amber-300 focus:border-rose-500 focus:bg-white text-slate-900 font-bold placeholder-slate-400 text-sm sm:text-base outline-none transition shadow-inner"
              autoFocus
            />
          </div>

          {/* School */}
          <div className="bg-white/80 p-3 sm:p-3.5 rounded-2xl border-2 border-amber-200 shadow-xs">
            <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
              <span className="text-lg">🏫</span>
              <span className="text-sky-900 font-extrabold">School</span>
              <span className="text-amber-800 font-bold">(Trường học)</span>
              <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="e.g. Tiểu học Hai Bà Trưng"
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-sky-50/50 border-2 border-sky-300 focus:border-sky-500 focus:bg-white text-slate-900 font-bold placeholder-slate-400 text-sm sm:text-base outline-none transition shadow-inner"
            />
          </div>

          {/* Class */}
          <div className="bg-white/80 p-3 sm:p-3.5 rounded-2xl border-2 border-amber-200 shadow-xs">
            <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
              <span className="text-lg">🎒</span>
              <span className="text-emerald-900 font-extrabold">Class</span>
              <span className="text-amber-800 font-bold">(Lớp học)</span>
              <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. 5A1, 4B, Lá 2..."
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-emerald-50/50 border-2 border-emerald-300 focus:border-emerald-500 focus:bg-white text-slate-900 font-bold placeholder-slate-400 text-sm sm:text-base outline-none transition shadow-inner"
            />
          </div>

          {/* Cheerful Notice */}
          <div className="p-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl border-2 border-amber-300 text-xs font-bold text-amber-950 flex items-start gap-2 shadow-xs">
            <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <span>
              ⭐ Điểm thi đua và cúp thành tích sẽ được lưu trực tiếp lên <strong>Bảng Xếp Hạng Toàn Quốc</strong>!
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center gap-3">
            {isEditing && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-black text-sm transition cursor-pointer"
              >
                Hủy bỏ
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3.5 px-6 rounded-2xl btn-3d-yellow font-black text-base sm:text-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-6 h-6 text-amber-950" />
              <span>{isEditing ? 'Lưu Thay Đổi' : 'Bắt Đầu Vào Học 🚀'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
