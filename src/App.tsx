/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, TabType } from './components/Header';
import { HistoricalReading } from './components/HistoricalReading';
import { InteractiveQuiz } from './components/InteractiveQuiz';
import { BrainArena } from './components/BrainArena';
import { Shrine360Tour } from './components/Shrine360Tour';
import { NationalLeaderboard } from './components/NationalLeaderboard';
import { StudentRegisterModal } from './components/StudentRegisterModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { soundEffects } from './utils/audio';
import { StudentStorage } from './utils/studentStorage';
import { StudentProfile } from './types/student';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('reading');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundEffects.isEnabled());
  const [student, setStudent] = useState<StudentProfile | null>(null);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Font scale (feature 3: 100%, 115%, 130%)
  const [fontScale, setFontScale] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hbt_font_scale');
      if (saved) return parseFloat(saved);
    }
    return 1.05; // Slightly larger default for 16:9 monitors
  });

  // Load student profile & apply font scale on mount
  useEffect(() => {
    const existing = StudentStorage.getProfile();
    if (existing && existing.fullName) {
      setStudent(existing);
      setIsRegisterModalOpen(false);
    } else {
      setIsRegisterModalOpen(true);
    }

    const unsubscribe = StudentStorage.subscribe((updated) => {
      setStudent(updated ? { ...updated } : null);
    });

    return () => unsubscribe();
  }, []);

  // Update CSS root variable when fontScale changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--app-font-scale', String(fontScale));
      localStorage.setItem('hbt_font_scale', String(fontScale));
    }
  }, [fontScale]);

  // Real-time study timer: count seconds when user is actively using app
  useEffect(() => {
    const timer = setInterval(() => {
      StudentStorage.incrementTime(1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRegisterComplete = (data: { fullName: string; school: string; className: string }) => {
    let updated: StudentProfile;
    if (student && isEditingProfile) {
      updated = StudentStorage.updateProfile(data) || student;
    } else {
      updated = StudentStorage.createProfile(data);
    }
    setStudent(updated);
    setIsRegisterModalOpen(false);
    setIsEditingProfile(false);
  };

  const handleStartEditing = () => {
    setIsProfileModalOpen(false);
    setIsEditingProfile(true);
    setIsRegisterModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-slate-800 w-full overflow-x-hidden selection:bg-amber-200 selection:text-slate-900">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        student={student}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        fontScale={fontScale}
        onFontScaleChange={setFontScale}
      />

      {/* Main Content Area - Full-width 16:9 responsive layout */}
      <main className="flex-1 pb-16 w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6">
        {activeTab === 'reading' && (
          <HistoricalReading onStartQuiz={() => setActiveTab('quiz')} />
        )}

        {activeTab === 'quiz' && (
          <InteractiveQuiz
            onBackToReading={() => setActiveTab('reading')}
            onGoToArena={() => setActiveTab('arena')}
          />
        )}

        {activeTab === 'arena' && (
          <BrainArena
            onBackToLearning={() => setActiveTab('reading')}
            onGoToLeaderboard={() => setActiveTab('leaderboard')}
          />
        )}

        {activeTab === 'tour360' && <Shrine360Tour />}

        {activeTab === 'leaderboard' && (
          <NationalLeaderboard
            currentStudent={student}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        )}
      </main>

      {/* Student Registration Modal (Feature 1: Bắt buộc điền trước khi học) */}
      <StudentRegisterModal
        isOpen={isRegisterModalOpen}
        onComplete={handleRegisterComplete}
        initialData={student ? { fullName: student.fullName, school: student.school, className: student.className } : null}
        isEditing={isEditingProfile}
        onClose={isEditingProfile ? () => setIsRegisterModalOpen(false) : undefined}
      />

      {/* Student Profile & National Leaderboard Modal (Feature 2 & 6) */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onEditProfile={handleStartEditing}
        student={student}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t-2 border-amber-500 text-slate-400 py-6 text-xs text-center px-4 w-full">
        <div className="w-full max-w-5xl mx-auto space-y-2">
          <div className="font-bold text-amber-300 text-sm">
            Hai Ba Trung Shrine – Dong Nhan Shrine, Hanoi (Special National Relic Site)
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm">
            Preserving Vietnamese national cultural heritage and empowering Grade 6 English learners through interactive quizzes, the Brain Arena challenge, 360° virtual shrine exploration, and the nationwide student leaderboard.
          </p>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-center gap-2">
            <span>16:9 Adaptive Display</span>
            <span>•</span>
            <span>Realtime Nationwide Ranking</span>
            <span>•</span>
            <span>Google Apps Script Synchronized</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
