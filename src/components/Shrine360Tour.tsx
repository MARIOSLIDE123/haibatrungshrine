import React, { useState, useRef } from 'react';
import {
  Compass,
  Maximize2,
  Minimize2,
  ExternalLink,
  RotateCw,
  Sparkles,
  Info,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { StudentStorage } from '../utils/studentStorage';
import { soundEffects } from '../utils/audio';

const TOUR_URL =
  'https://haibatrung.hanoi.vietnaminfo.net/vi/vtour/details/di-tich-kien-truc-nghe-thuat-den-chua-dinh-hai-ba-trung-2';

export const Shrine360Tour: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [hasClaimedPoints, setHasClaimedPoints] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    soundEffects.playClick();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const reloadTour = () => {
    soundEffects.playClick();
    setIframeKey((prev) => prev + 1);
  };

  const handleClaimExploreBonus = () => {
    if (hasClaimedPoints) return;
    soundEffects.playCorrect();
    setHasClaimedPoints(true);
    StudentStorage.addScore(15, {
      title: '360° Virtual Shrine Exploration',
      activityType: 'tour360',
      durationSeconds: 120,
      details: 'Khám phá toàn cảnh 360 độ Di tích Quốc gia Đền Hai Bà Trưng',
    });
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4">
      {/* Header bar of 360 Tour */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-6 shadow-xl text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>Interactive 360° Virtual Tour</span>
            </span>
            <span className="text-xs text-amber-200/70 hidden sm:inline">• Di tích Kiến trúc Nghệ thuật Quốc gia</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            KHÁM PHÁ ĐỀN HAI BÀ TRƯNG 360°
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Trải nghiệm thực tế ảo toàn cảnh 360 độ: Tam quan, Chính điện, Đền thờ, Tượng Hai Bà Trưng và không gian di tích linh thiêng tại Đổng Nhân, Hà Nội.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {!hasClaimedPoints && (
            <button
              onClick={handleClaimExploreBonus}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl btn-3d-yellow font-black text-xs sm:text-sm shadow-lg transition cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-950" />
              <span>Nhận +15 Điểm Khám Phá ⭐</span>
            </button>
          )}

          {hasClaimedPoints && (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-500 text-white text-xs font-black shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Đã nhận +15 điểm! 🎉</span>
            </div>
          )}

          <button
            onClick={reloadTour}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition"
            title="Làm mới tour 360"
          >
            <RotateCw className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-amber-400" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
          </button>

          <a
            href={TOUR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-900/60 hover:bg-red-800 text-amber-200 border border-red-700/60 text-xs sm:text-sm font-semibold transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Mở tab mới</span>
          </a>
        </div>
      </div>

      {/* 360 iframe Container - 16:9 cinema ratio */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/9] min-h-[480px] sm:min-h-[580px] lg:min-h-[680px] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/40"
      >
        <iframe
          key={iframeKey}
          src={TOUR_URL}
          title="Hai Ba Trung Shrine 360 Tour"
          className="w-full h-full border-0"
          allow="accelerometer; gyroscope; magnetometer; vr; fullscreen; autoplay"
          allowFullScreen
          loading="lazy"
        />

        {/* Floating guidance overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 text-white text-xs hidden sm:flex items-center gap-2 pointer-events-none">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Nhấn và giữ chuột kéo để xoay góc nhìn 360°, cuộn chuột để phóng to / thu nhỏ di tích.</span>
        </div>
      </div>
    </div>
  );
};
