import React, { useState } from 'react';
import {
  Compass,
  ExternalLink,
  Sparkles,
  Info,
  CheckCircle2,
  Award,
  MapPin,
  Eye,
  Camera,
  Navigation,
} from 'lucide-react';
import { StudentStorage } from '../utils/studentStorage';
import { soundEffects } from '../utils/audio';

const TOUR_URL =
  'https://haibatrung.hanoi.vietnaminfo.net/vi/vtour/details/di-tich-kien-truc-nghe-thuat-den-chua-dinh-hai-ba-trung-2';

export const Shrine360Tour: React.FC = () => {
  const [hasClaimedPoints, setHasClaimedPoints] = useState(false);

  const openVirtualTour = () => {
    soundEffects.playClick();
    window.open(TOUR_URL, '_blank', 'noopener,noreferrer');
  };

  const handleClaimExploreBonus = () => {
    if (hasClaimedPoints) return;
    soundEffects.playCorrect();
    setHasClaimedPoints(true);
    StudentStorage.addScore(15, {
      title: '360° Virtual Shrine Exploration',
      activityType: 'tour360',
      durationSeconds: 120,
      details: 'Completed 360° Virtual Tour of Hai Ba Trung National Shrine',
    });
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-800 via-amber-500 to-red-800" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span>Special National Relic Site</span>
              </span>
              <span className="text-xs text-amber-200/70 hidden sm:inline">
                • 360° Panoramic Virtual Reality
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              EXPLORE HAI BA TRUNG SHRINE 360°
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-slate-300 mt-2 max-w-2xl">
              Experience the ancient temple grounds in Dong Nhan, Hanoi. Look around in 360 degrees, step inside the sacred main hall, and admire the majestic statues of the Trung Sisters.
            </p>
          </div>

          {/* Points Claim Badge */}
          <div className="flex items-center gap-3">
            {!hasClaimedPoints ? (
              <button
                onClick={handleClaimExploreBonus}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl btn-3d-yellow font-black text-xs sm:text-sm shadow-xl transition cursor-pointer"
              >
                <Award className="w-5 h-5 text-amber-950" />
                <span>Claim +15 Exploration Points ⭐</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-black shadow-lg">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>+15 Points Added! 🎉</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Launch Card */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-4 border-amber-400/80 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl text-center relative overflow-hidden">
        {/* Background Decorative Rings */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-500 to-red-600 shadow-xl shadow-amber-500/30 mb-2">
            <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-spin-slow" />
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-300">
            Ready to Step Inside the Temple?
          </h3>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
            Click the button below to open the official high-resolution 360° virtual tour in a new window. You can look up, down, and rotate all around as if you are standing right in the shrine!
          </p>

          {/* Giant Launch Button */}
          <div className="pt-2">
            <button
              onClick={openVirtualTour}
              className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl btn-3d-red text-white font-black text-base sm:text-xl shadow-2xl transition transform hover:scale-105 cursor-pointer"
            >
              <span>Launch 360° Virtual Tour</span>
              <ExternalLink className="w-6 h-6 text-amber-300" />
            </button>
          </div>

          <p className="text-xs text-amber-200/70">
            🌐 Opens the official Ministry of Culture 360° VR experience in full screen.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-800 text-left">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-400 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">360° Panoramas</h4>
              <p className="text-xs text-slate-400 mt-1">
                Drag with your mouse or finger to view every corner of the shrine courtyards and architecture.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-red-400/20 text-red-400 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">Ancient Artifacts</h4>
              <p className="text-xs text-slate-400 mt-1">
                Zoom in closely on the sacred Trung Sisters statues, red palanquins, and royal stone steles.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-400/20 text-emerald-400 shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">Interactive Hotspots</h4>
              <p className="text-xs text-slate-400 mt-1">
                Click on the shining portal arrows inside the virtual tour to walk from room to room smoothly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
