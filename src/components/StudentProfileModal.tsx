import React, { useState, useEffect } from 'react';
import {
  User,
  School,
  BookOpen,
  Trophy,
  Clock,
  History,
  RefreshCw,
  Edit3,
  X,
  Flame,
} from 'lucide-react';
import { StudentProfile, ActivityLog, LeaderboardEntry } from '../types/student';
import { StudentStorage } from '../utils/studentStorage';
import { GoogleSheetService } from '../utils/googleSheetService';
import { soundEffects } from '../utils/audio';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProfile: () => void;
  student: StudentProfile | null;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  onEditProfile,
  student,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'leaderboard' | 'history'>('profile');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [studentRank, setStudentRank] = useState<number>(1);
  const [totalStudents, setTotalStudents] = useState<number>(1);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [isFromSheet, setIsFromSheet] = useState(false);
  const [history, setHistory] = useState<ActivityLog[]>([]);
  const [syncStatus, setSyncStatus] = useState<string>('');

  const loadData = async () => {
    setIsLoadingLeaderboard(true);
    setHistory(StudentStorage.getActivityHistory());
    try {
      const res = await GoogleSheetService.fetchLeaderboard(student);
      setLeaderboard(res.leaderboard);
      setStudentRank(res.studentRank);
      setTotalStudents(res.totalStudents);
      setIsFromSheet(res.isFromSheet);
    } catch (e) {
      console.warn('Leaderboard fetch error', e);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, student]);

  if (!isOpen) return null;

  const formatDuration = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const handleManualSync = async () => {
    if (!student) return;
    soundEffects.playClick();
    setSyncStatus('Synchronizing...');
    const res = await GoogleSheetService.updateScore(student);
    setSyncStatus(res.success ? 'Synced to Google Sheet!' : res.message);
    loadData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{student?.fullName || 'Student Profile'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {student?.className || 'Grade 6'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">{student?.school || 'Vietnam Heritage Education'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 text-xs sm:text-sm font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('profile');
            }}
            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 whitespace-nowrap transition ${
              activeTab === 'profile'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Stats</span>
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('leaderboard');
            }}
            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 whitespace-nowrap transition ${
              activeTab === 'leaderboard'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>National Ranking</span>
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('history');
            }}
            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 whitespace-nowrap transition ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Activity History</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-slate-200 text-sm">
          {/* TAB 1: PROFILE & STATS */}
          {activeTab === 'profile' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Score */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-950/40 border border-amber-500/40 text-center relative overflow-hidden">
                  <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                    <Trophy className="w-4 h-4" />
                    <span>Total Score</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-amber-300">
                    {student?.score || 0}
                  </div>
                  <div className="text-[11px] text-amber-200/70 mt-1">Points Earned</div>
                </div>

                {/* Rank */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/20 to-red-950/40 border border-red-500/40 text-center relative overflow-hidden">
                  <div className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4" />
                    <span>National Rank</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-red-300">
                    #{studentRank}
                  </div>
                  <div className="text-[11px] text-red-200/70 mt-1">
                    out of {totalStudents} students nationwide
                  </div>
                </div>

                {/* Study Time */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-950/40 border border-blue-500/40 text-center relative overflow-hidden">
                  <div className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Learning Time</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-blue-300 pt-1">
                    {formatDuration(student?.learningTimeSeconds || 0)}
                  </div>
                  <div className="text-[11px] text-blue-200/70 mt-1">Total Time Studied</div>
                </div>
              </div>

              {/* Student Details Card */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="font-bold text-white text-sm">Detailed Information</span>
                  <button
                    onClick={() => {
                      onEditProfile();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-400">Full Name:</span>
                    <div className="font-semibold text-white mt-0.5">{student?.fullName}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Student ID:</span>
                    <div className="font-mono font-semibold text-amber-300 mt-0.5">{student?.id}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">School:</span>
                    <div className="font-semibold text-white mt-0.5">{student?.school}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Class:</span>
                    <div className="font-semibold text-white mt-0.5">{student?.className}</div>
                  </div>
                </div>
              </div>

              {/* Live sync badge */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs shadow-xs">
                <div className="flex items-center gap-2 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-slate-300">
                    {isFromSheet ? 'Synced directly with Google Sheet' : 'Connected to National Cloud Database'}
                  </span>
                </div>
                <button
                  onClick={handleManualSync}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl btn-3d-yellow font-black text-xs text-amber-950 shadow transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Now 🚀</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: NATIONAL LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>Realtime Nationwide Rankings</span>
                <button
                  onClick={loadData}
                  disabled={isLoadingLeaderboard}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLeaderboard ? 'animate-spin' : ''}`} />
                  <span>Reload</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {leaderboard.map((item) => {
                  const isTop1 = item.rank === 1;
                  const isTop2 = item.rank === 2;
                  const isTop3 = item.rank === 3;
                  const isUser = item.isCurrentUser;

                  return (
                    <div
                      key={item.id + item.rank}
                      className={`flex items-center justify-between p-3 rounded-xl border transition ${
                        isUser
                          ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-400 shadow-md shadow-amber-900/20'
                          : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Rank Badge */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isTop1
                              ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-400/50'
                              : isTop2
                              ? 'bg-slate-300 text-slate-900'
                              : isTop3
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {item.rank}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${isUser ? 'text-amber-300' : 'text-white'}`}>
                              {item.fullName}
                            </span>
                            {isUser && (
                              <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-bold uppercase">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.school} • Class {item.className}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-amber-400 text-sm sm:text-base">
                          {item.score} pts
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(item.learningTimeSeconds)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="text-xs text-slate-400">
                Your learning and quiz completion logs
              </div>

              {history.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No activities recorded yet. Complete quizzes or challenges to build your history!
                </div>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {history.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <span>{log.title}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-amber-300 uppercase font-semibold">
                            {log.activityType}
                          </span>
                        </div>
                        <div className="text-slate-400">{log.details}</div>
                        <div className="text-[11px] text-slate-500">
                          {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 font-bold text-amber-300 text-xs">
                          +{log.scoreEarned} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Student ID: <span className="font-mono text-amber-400">{student?.id}</span></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
