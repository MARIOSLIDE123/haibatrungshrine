import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Flame,
  Clock,
  User,
  School,
  RefreshCw,
  Search,
  Sparkles,
  Award,
  FileSpreadsheet,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Info,
} from 'lucide-react';
import { LeaderboardEntry, StudentProfile } from '../types/student';
import { GoogleSheetService } from '../utils/googleSheetService';
import { soundEffects } from '../utils/audio';

interface NationalLeaderboardProps {
  currentStudent: StudentProfile | null;
  onOpenProfile: () => void;
}

export const NationalLeaderboard: React.FC<NationalLeaderboardProps> = ({
  currentStudent,
  onOpenProfile,
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [studentRank, setStudentRank] = useState<number>(1);
  const [totalStudents, setTotalStudents] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFromSheet, setIsFromSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'top10' | 'mySchool'>('all');

  const fetchRankings = async () => {
    setIsLoading(true);
    try {
      const res = await GoogleSheetService.fetchLeaderboard(currentStudent);
      setLeaderboard(res.leaderboard);
      setStudentRank(res.studentRank);
      setTotalStudents(res.totalStudents);
      setIsFromSheet(res.isFromSheet);
    } catch (e) {
      console.warn('Error fetching leaderboard', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [currentStudent]);

  const formatDuration = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  // Top 3 Podium
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  // Filtering
  const filteredList = leaderboard.filter((item) => {
    const matchesSearch =
      item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.className.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'top10') {
      return item.rank <= 10;
    }
    if (selectedFilter === 'mySchool' && currentStudent) {
      return item.school.toLowerCase().includes(currentStudent.school.toLowerCase());
    }
    return true;
  });

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-8 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-red-800 via-amber-500 to-red-800" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Nationwide Realtime Arena</span>
              </span>
              <span className="text-xs text-amber-200/70 hidden sm:inline">
                • Realtime score & rank updates
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              NATIONAL LEADERBOARD
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-slate-300 mt-1 max-w-2xl">
              Honouring outstanding students across Vietnam exploring history, reading English, and mastering the Hai Ba Trung Shrine arena.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start lg:self-auto">
            <button
              onClick={() => {
                soundEffects.playClick();
                fetchRankings();
              }}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl btn-3d-blue font-black text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Loading...' : 'Refresh Leaderboard 🔄'}</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenProfile();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl btn-3d-yellow font-black text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              <User className="w-4 h-4 text-amber-950" />
              <span>My Profile 👤</span>
            </button>
          </div>
        </div>

        {/* Live sync connection badge */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2 font-bold">
            <span className={`w-3 h-3 rounded-full ${isFromSheet ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span>
              {isFromSheet
                ? 'Synced directly with Google Sheet'
                : 'Connected to National Cloud Database'}
            </span>
          </div>
          <span className="font-black text-amber-300 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-600/40">Total: {totalStudents} students</span>
        </div>
      </div>

      {/* Your Current Rank Card - Solid high-contrast dark card (Fixes washed-out background) */}
      {currentStudent && (
        <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-2xl text-white relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-amber-200 shrink-0">
                #{studentRank}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {currentStudent.fullName}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black uppercase tracking-wider shadow-xs">
                    YOU
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-400/50 font-bold">
                    Class {currentStudent.className}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  {currentStudent.school}
                </p>
                <div className="text-xs text-amber-300 font-bold flex items-center gap-1.5 pt-0.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>National Rank: <strong className="text-white">#{studentRank}</strong> out of <strong className="text-white">{totalStudents}</strong> students nationwide</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-700 shadow-inner">
              <div className="text-center sm:text-right">
                <div className="text-[11px] text-slate-400 uppercase font-black tracking-wider">Total Score</div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400">
                  {currentStudent.score} pts
                </div>
              </div>
              <div className="text-center sm:text-right border-l border-slate-700 pl-4 sm:pl-6">
                <div className="text-[11px] text-slate-400 uppercase font-black tracking-wider">Time Studied</div>
                <div className="text-xl sm:text-2xl font-black text-sky-400 flex items-center gap-1 justify-center sm:justify-end">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>{formatDuration(currentStudent.learningTimeSeconds)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Podium Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Top 2: Silver */}
        {top2 && (
          <div className="order-2 md:order-1 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-400/50 rounded-3xl p-5 text-center shadow-lg relative flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-slate-300 text-slate-950 font-black text-xs rounded-full uppercase tracking-wider shadow">
              2nd Place (Silver)
            </div>
            <div className="pt-2">
              <div className="w-14 h-14 rounded-full bg-slate-400/20 border-2 border-slate-300 flex items-center justify-center mx-auto mb-3">
                <Medal className="w-7 h-7 text-slate-300" />
              </div>
              <h4 className="font-extrabold text-base sm:text-lg text-white">
                {top2.fullName}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{top2.school}</p>
              <div className="text-xs text-slate-400">Class {top2.className}</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300 text-sm">{top2.score} pts</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration(top2.learningTimeSeconds)}</span>
              </span>
            </div>
          </div>
        )}

        {/* Top 1: Gold */}
        {top1 && (
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-900 border-3 border-amber-400 rounded-3xl p-6 text-center shadow-2xl relative transform md:-translate-y-2 flex flex-col justify-between">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-slate-950 font-black text-xs rounded-full uppercase tracking-widest shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1st Place • Champion</span>
            </div>
            <div className="pt-2">
              <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-400/20">
                <Trophy className="w-9 h-9 text-amber-400" />
              </div>
              <h4 className="font-extrabold text-lg sm:text-xl text-amber-300">
                {top1.fullName}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 truncate">{top1.school}</p>
              <div className="text-xs text-amber-200/70 font-mono">Class {top1.className}</div>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-500/40 flex items-center justify-between">
              <span className="font-black text-amber-400 text-base sm:text-lg">{top1.score} pts</span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{formatDuration(top1.learningTimeSeconds)}</span>
              </span>
            </div>
          </div>
        )}

        {/* Top 3: Bronze */}
        {top3 && (
          <div className="order-3 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-amber-700/60 rounded-3xl p-5 text-center shadow-lg relative flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-amber-700 text-white font-black text-xs rounded-full uppercase tracking-wider shadow">
              3rd Place (Bronze)
            </div>
            <div className="pt-2">
              <div className="w-14 h-14 rounded-full bg-amber-800/20 border-2 border-amber-700 flex items-center justify-center mx-auto mb-3">
                <Award className="w-7 h-7 text-amber-500" />
              </div>
              <h4 className="font-extrabold text-base sm:text-lg text-white">
                {top3.fullName}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{top3.school}</p>
              <div className="text-xs text-slate-400">Class {top3.className}</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300 text-sm">{top3.score} pts</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration(top3.learningTimeSeconds)}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, school, or class..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-xs sm:text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              selectedFilter === 'all'
                ? 'bg-red-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Students
          </button>
          <button
            onClick={() => setSelectedFilter('top10')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              selectedFilter === 'top10'
                ? 'bg-red-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Top 10
          </button>
          {currentStudent && (
            <button
              onClick={() => setSelectedFilter('mySchool')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                selectedFilter === 'mySchool'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              My School
            </button>
          )}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[11px] tracking-wider font-bold">
                <th className="py-3.5 px-4 text-center w-16">Rank</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">School</th>
                <th className="py-3.5 px-4 text-center w-24">Class</th>
                <th className="py-3.5 px-4 text-right w-32">Total Score</th>
                <th className="py-3.5 px-4 text-right w-36">Study Time</th>
                <th className="py-3.5 px-4 text-center w-32">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((item) => {
                const isUser = item.isCurrentUser;
                const isTop1 = item.rank === 1;
                const isTop2 = item.rank === 2;
                const isTop3 = item.rank === 3;

                return (
                  <tr
                    key={item.id + item.rank}
                    className={`transition ${
                      isUser
                        ? 'bg-amber-100/70 font-semibold ring-2 ring-amber-500/50'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                          isTop1
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : isTop2
                            ? 'bg-slate-300 text-slate-950'
                            : isTop3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.rank}
                      </span>
                    </td>

                    {/* Student Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isUser ? 'text-red-900' : 'text-slate-900'}`}>
                          {item.fullName}
                        </span>
                        {isUser && (
                          <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-extrabold uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>

                    {/* School */}
                    <td className="py-3 px-4 text-slate-600">
                      {item.school}
                    </td>

                    {/* Class */}
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-xs border border-slate-200">
                        {item.className}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="py-3 px-4 text-right">
                      <span className="font-extrabold text-red-900 sm:text-base">
                        {item.score} pts
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-3 px-4 text-right text-slate-600 font-mono text-xs">
                      {formatDuration(item.learningTimeSeconds)}
                    </td>

                    {/* Last active */}
                    <td className="py-3 px-4 text-center text-xs text-slate-500">
                      {item.lastActive || 'Today'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
