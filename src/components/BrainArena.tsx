import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Timer,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  brainArenaQuestions,
  ArenaQuestion,
  ArenaSingleChoiceQuestion,
  ArenaFillInTheBlankQuestion,
  ArenaTrueFalseQuestion,
  ArenaMultipleSelectQuestion,
  ArenaMatchingQuestion,
  ArenaWordOrderQuestion,
} from '../data/brainArenaQuestions';
import { soundEffects } from '../utils/audio';
import { StudentStorage } from '../utils/studentStorage';

interface QuestionSessionState {
  question: ArenaQuestion;
  shuffledOptions?: string[];
  attempts: number; // 0, 1, or 2
  isLocked: boolean; // locked against further scoring
  isCorrect: boolean;
  scoreAwarded: number; // 10, 5, or 0
  userAnswerSummary: string;
  userAnswerData: any;
  feedbackMessage: string;
}

interface BrainArenaProps {
  onBackToLearning: () => void;
  onGoToLeaderboard: () => void;
}

export const BrainArena: React.FC<BrainArenaProps> = ({
  onBackToLearning,
  onGoToLeaderboard,
}) => {
  const [sessionQuestions, setSessionQuestions] = useState<QuestionSessionState[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [pastAttempts, setPastAttempts] = useState<any[]>([]);
  const [shakeTrigger, setShakeTrigger] = useState(false);

  // Input states for active question
  const [selectedSingleChoice, setSelectedSingleChoice] = useState<string>('');
  const [fillValue, setFillValue] = useState<string>('');
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [matchingConnections, setMatchingConnections] = useState<Record<string, string>>({}); // colA id -> colB id
  const [activeColAId, setActiveColAId] = useState<string | null>(null);
  const [orderedChips, setOrderedChips] = useState<string[]>([]);
  const [remainingChips, setRemainingChips] = useState<string[]>([]);
  const isSubmittingRef = useRef(false);

  // Initialize randomized game session
  const initializeGame = () => {
    // Shuffle the 15 questions
    const shuffledQ = [...brainArenaQuestions].sort(() => Math.random() - 0.5);

    const states: QuestionSessionState[] = shuffledQ.map((q) => {
      let shuffledOpts: string[] | undefined;
      if (q.type === 'single-choice' || q.type === 'multiple-select') {
        shuffledOpts = [...(q as any).options].sort(() => Math.random() - 0.5);
      }
      return {
        question: q,
        shuffledOptions: shuffledOpts,
        attempts: 0,
        isLocked: false,
        isCorrect: false,
        scoreAwarded: 0,
        userAnswerSummary: '',
        userAnswerData: null,
        feedbackMessage: '',
      };
    });

    setSessionQuestions(states);
    setCurrentIdx(0);
    setElapsedSeconds(0);
    setIsGameOver(false);
    setShowReview(false);
    isSubmittingRef.current = false;
  };

  // Run on mount
  useEffect(() => {
    initializeGame();
    // Load local history
    try {
      const stored = localStorage.getItem('hbt_arena_history');
      if (stored) {
        setPastAttempts(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Timer
  useEffect(() => {
    if (isGameOver || sessionQuestions.length === 0) return;
    const interval = setInterval(() => {
      setElapsedSeconds((sec) => sec + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver, sessionQuestions.length]);

  // Sync inputs when changing question
  const currentSlot = sessionQuestions[currentIdx];
  const q = currentSlot?.question;

  useEffect(() => {
    if (!q) return;

    if (currentSlot.isLocked) {
      // populate submitted answer
      if (q.type === 'single-choice') setSelectedSingleChoice(currentSlot.userAnswerData || '');
      if (q.type === 'fill-in-the-blank') setFillValue(currentSlot.userAnswerData || '');
      if (q.type === 'multiple-select') setSelectedMultiple(currentSlot.userAnswerData || []);
      if (q.type === 'matching-columns') setMatchingConnections(currentSlot.userAnswerData || {});
      if (q.type === 'word-order') {
        setOrderedChips(currentSlot.userAnswerData || []);
        setRemainingChips([]);
      }
    } else {
      setSelectedSingleChoice('');
      setFillValue('');
      setSelectedMultiple([]);
      setMatchingConnections({});
      setActiveColAId(null);
      if (q.type === 'word-order') {
        const shuffled = [...q.wordBank].sort(() => Math.random() - 0.5);
        setRemainingChips(shuffled);
        setOrderedChips([]);
      }
    }
  }, [currentIdx, q?.id, currentSlot?.isLocked]);

  if (!currentSlot || !q) {
    return <div className="text-center p-12 text-slate-600">Preparing Brain Arena...</div>;
  }

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Submit Evaluation and Scoring Logic
  const handleEvaluateAnswer = (isCorrect: boolean, summaryText: string, rawData: any) => {
    if (isSubmittingRef.current || currentSlot.isLocked) return;
    isSubmittingRef.current = true;

    const prevAttempts = currentSlot.attempts;
    const nextAttempts = prevAttempts + 1;

    let pointsEarned = 0;
    let locked = false;
    let feedback = '';

    if (isCorrect) {
      soundEffects.playCorrect();
      pointsEarned = prevAttempts === 0 ? 10 : 5;
      locked = true;
      feedback = prevAttempts === 0
        ? '🎉 Excellent! That is correct! (+10 pts) (Chính xác! Xuất sắc!)'
        : '✨ Correct on second attempt! (+5 pts) (Chính xác ở lần thử 2!)';

      StudentStorage.addScore(pointsEarned, {
        title: `Brain Arena - Question ${currentIdx + 1}`,
        activityType: 'arena',
        durationSeconds: elapsedSeconds,
        details: `Trả lời đúng (${pointsEarned} điểm)`,
      });
    } else {
      setShakeTrigger(true);
      setTimeout(() => setShakeTrigger(false), 500);

      if (nextAttempts === 1) {
        // One retry allowed
        soundEffects.playIncorrect();
        pointsEarned = 0;
        locked = false;
        feedback = '❌ Not quite! You have 1 more retry (5 pts). (Chưa chính xác! Bạn còn 1 cơ hội thử lại.)';
      } else {
        // Second attempt failed: reveal answer & lock
        soundEffects.playReveal();
        pointsEarned = 0;
        locked = true;
        feedback = '⚠️ Second attempt incorrect (0 pts). Here is the correct answer: (Đã hết 2 lượt thử. Hãy xem đáp án chính xác bên dưới:)';
      }
    }

    setSessionQuestions((prev) => {
      const updated = [...prev];
      updated[currentIdx] = {
        ...updated[currentIdx],
        attempts: nextAttempts,
        isLocked: locked,
        isCorrect: isCorrect,
        scoreAwarded: pointsEarned,
        userAnswerSummary: summaryText,
        userAnswerData: rawData,
        feedbackMessage: feedback,
      };
      return updated;
    });

    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 250);
  };

  // Type-specific submit helpers
  const submitSingleChoice = () => {
    if (!selectedSingleChoice) return;
    const targetQ = q as ArenaSingleChoiceQuestion;
    const isCorrect = selectedSingleChoice === targetQ.correctAnswer;
    handleEvaluateAnswer(isCorrect, selectedSingleChoice, selectedSingleChoice);
  };

  const submitTrueFalse = (userBool: boolean) => {
    const targetQ = q as ArenaTrueFalseQuestion;
    const isCorrect = userBool === targetQ.correctAnswer;
    handleEvaluateAnswer(isCorrect, userBool ? 'True' : 'False', userBool);
  };

  const submitFillInBlank = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fillValue.trim()) return;
    const targetQ = q as ArenaFillInTheBlankQuestion;
    const cleaned = fillValue.trim().toLowerCase();
    const isCorrect = targetQ.acceptedAnswers.some(
      (ans) => ans.trim().toLowerCase() === cleaned
    );
    handleEvaluateAnswer(isCorrect, fillValue.trim(), fillValue.trim());
  };

  const toggleMultipleSelect = (option: string) => {
    if (currentSlot.isLocked) return;
    soundEffects.playClick();
    setSelectedMultiple((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const submitMultipleSelect = () => {
    const targetQ = q as ArenaMultipleSelectQuestion;
    if (selectedMultiple.length === 0) return;

    // Both correct selections and NO incorrect selections for full credit
    const correctSet = new Set(targetQ.correctAnswers);
    const userSet = new Set(selectedMultiple);

    const isCorrect =
      userSet.size === correctSet.size &&
      [...userSet].every((item) => correctSet.has(item));

    handleEvaluateAnswer(
      isCorrect,
      selectedMultiple.join(', '),
      selectedMultiple
    );
  };

  const handleConnectMatching = (colBId: string) => {
    if (currentSlot.isLocked || !activeColAId) return;
    soundEffects.playClick();
    setMatchingConnections((prev) => ({
      ...prev,
      [activeColAId]: colBId,
    }));
    setActiveColAId(null);
  };

  const submitMatching = () => {
    const targetQ = q as ArenaMatchingQuestion;
    const totalRequired = targetQ.columnA.length;
    if (Object.keys(matchingConnections).length !== totalRequired) return;

    const isAllCorrect = Object.entries(targetQ.correctPairs).every(
      ([aId, bId]) => matchingConnections[aId] === bId
    );

    const summary = Object.entries(matchingConnections)
      .map(([a, b]) => `${a}–${b}`)
      .join(', ');

    handleEvaluateAnswer(isAllCorrect, summary, matchingConnections);
  };

  const addChipToSentence = (word: string, index: number) => {
    if (currentSlot.isLocked) return;
    soundEffects.playClick();
    setOrderedChips((prev) => [...prev, word]);
    setRemainingChips((prev) => prev.filter((_, i) => i !== index));
  };

  const removeChipFromSentence = (word: string, index: number) => {
    if (currentSlot.isLocked) return;
    soundEffects.playClick();
    setRemainingChips((prev) => [...prev, word]);
    setOrderedChips((prev) => prev.filter((_, i) => i !== index));
  };

  const submitWordOrder = () => {
    const targetQ = q as ArenaWordOrderQuestion;
    if (remainingChips.length > 0 || orderedChips.length === 0) return;

    const sentence = orderedChips.join(' ').trim();
    // Accept standard sentence with or without trailing period
    const isCorrect = targetQ.acceptedSentences.some(
      (accepted) =>
        accepted.replace('.', '').toLowerCase() === sentence.replace('.', '').toLowerCase()
    );

    handleEvaluateAnswer(isCorrect, sentence, orderedChips);
  };

  // Next Question / Finish Game
  const handleNextQuestion = () => {
    soundEffects.playClick();
    if (currentIdx < sessionQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    soundEffects.playCelebration();
    setIsGameOver(true);

    const totalScore = sessionQuestions.reduce(
      (sum, s) => sum + s.scoreAwarded,
      0
    );
    const correctCount = sessionQuestions.filter((s) => s.isCorrect).length;
    const accuracy = Math.round((correctCount / sessionQuestions.length) * 100);

    const record = {
      date: new Date().toLocaleDateString(),
      timeString: formatTime(elapsedSeconds),
      score: totalScore,
      correct: correctCount,
      accuracy,
    };

    try {
      const existing = localStorage.getItem('hbt_arena_history');
      const parsed = existing ? JSON.parse(existing) : [];
      const updated = [record, ...parsed].slice(0, 5);
      localStorage.setItem('hbt_arena_history', JSON.stringify(updated));
      setPastAttempts(updated);
    } catch {
      // ignore
    }
  };

  // Computed summary metrics
  const totalScore = sessionQuestions.reduce((sum, s) => sum + s.scoreAwarded, 0);
  const correctCount = sessionQuestions.filter((s) => s.isCorrect).length;
  const incorrectCount = sessionQuestions.filter(
    (s) => s.isLocked && !s.isCorrect
  ).length;
  const accuracyPercentage =
    sessionQuestions.length > 0
      ? Math.round((correctCount / sessionQuestions.length) * 100)
      : 0;

  let encouragingMsg = 'Great effort! Keep practising!';
  if (accuracyPercentage >= 90) {
    encouragingMsg = 'Outstanding! You are a Hai Ba Trung Shrine Master Historian!';
  } else if (accuracyPercentage >= 70) {
    encouragingMsg = 'Excellent job! You know Vietnamese heritage very well!';
  } else if (accuracyPercentage >= 50) {
    encouragingMsg = 'Good effort! Review the reading to boost your score even higher!';
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {!isGameOver ? (
        <div className={`bg-white rounded-3xl border-4 border-amber-400 shadow-2xl p-5 sm:p-8 lg:p-10 relative transition-transform ${shakeTrigger ? 'animate-shake' : ''}`}>
          {/* Rainbow top accent */}
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 via-sky-400 to-purple-500 rounded-t-3xl" />

          {/* Arena Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-amber-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 bg-amber-400 border-2 border-amber-500 px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-900" />
                  <span>⚔️ BRAIN ARENA • ĐẤU TRƯỜNG LỊCH SỬ</span>
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                  15 Câu Hỏi
                </span>
              </div>
              <div className="text-xs sm:text-sm font-black text-rose-900 mt-2 flex items-center gap-1.5">
                <span>🎯</span>
                <span>{q.title}</span>
              </div>
            </div>

            {/* Timer & Live Score */}
            <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-2xl border-2 border-slate-200 shadow-xs">
                <Timer className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-950 bg-amber-300 px-4 py-1.5 rounded-2xl border-2 border-amber-500 shadow-xs">
                <Trophy className="w-4 h-4 text-amber-800" />
                <span>{totalScore} / 150 pts</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 flex items-center justify-between text-xs sm:text-sm font-black text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span>⭐ Câu hỏi</span>
              <span className="text-rose-600 text-base">{currentIdx + 1}</span>
              <span>/ {sessionQuestions.length}</span>
            </span>
            <span className="text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 font-extrabold">
              {Math.round(((currentIdx + 1) / sessionQuestions.length) * 100)}% hoàn thành
            </span>
          </div>
          <div className="w-full bg-amber-100 h-4 rounded-full overflow-hidden border-2 border-amber-300 shadow-inner p-0.5">
            <div
              className="bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{
                width: `${((currentIdx + 1) / sessionQuestions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Text */}
          <div className="my-6 sm:my-8 bg-amber-50/70 p-4 sm:p-6 rounded-3xl border-2 border-amber-200">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-snug">
              {q.question}
            </h3>
          </div>

          {/* Question Interactive Content */}
          <div className="space-y-4">
            {/* TYPE 1: Single Choice */}
            {q.type === 'single-choice' && (
              <div className="space-y-3">
                {(currentSlot.shuffledOptions || q.options).map((option, optIdx) => {
                  const isSelected = selectedSingleChoice === option;
                  const isCorrectAns = option === q.correctAnswer;
                  const isLocked = currentSlot.isLocked;

                  const badgeColors = [
                    'bg-rose-500 text-white border-rose-600',
                    'bg-sky-500 text-white border-sky-600',
                    'bg-amber-500 text-white border-amber-600',
                    'bg-emerald-500 text-white border-emerald-600',
                  ];

                  let cardStyle =
                    'border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/50 text-slate-800 shadow-xs hover:translate-y-[-2px]';

                  if (isLocked) {
                    if (isCorrectAns) {
                      cardStyle =
                        'border-emerald-500 bg-emerald-50 text-emerald-950 font-black ring-4 ring-emerald-300 shadow-md';
                    } else if (isSelected && !currentSlot.isCorrect) {
                      cardStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-bold';
                    }
                  } else if (isSelected) {
                    cardStyle =
                      'border-amber-500 bg-amber-50 text-amber-950 font-black ring-4 ring-amber-300 shadow-md translate-y-[-2px]';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isLocked}
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedSingleChoice(option);
                      }}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border-3 text-base sm:text-lg transition-all flex items-center justify-between cursor-pointer ${cardStyle}`}
                    >
                      <span className="font-bold leading-relaxed">{option}</span>
                      <span className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center text-sm font-black shrink-0 ml-4 shadow-xs ${badgeColors[optIdx % 4]}`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                    </button>
                  );
                })}

                {!currentSlot.isLocked && (
                  <button
                    onClick={submitSingleChoice}
                    disabled={!selectedSingleChoice}
                    className="w-full mt-4 py-3.5 sm:py-4 rounded-2xl btn-3d-yellow disabled:opacity-40 font-black text-base sm:text-lg shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{currentSlot.attempts === 1 ? '🔄 Thử Lại Lần 2 (+5 điểm)' : '🚀 Xác Nhận Đáp Án (+10 điểm)'}</span>
                  </button>
                )}
              </div>
            )}

            {/* TYPE 2: True or False */}
            {q.type === 'true-false' && (
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {[true, false].map((boolVal) => {
                  const isCorrect = q.correctAnswer === boolVal;
                  const isLocked = currentSlot.isLocked;
                  const isUserSelection = currentSlot.userAnswerData === boolVal;

                  let btnClass = boolVal ? 'btn-3d-green' : 'btn-3d-red';

                  if (isLocked) {
                    if (isCorrect) {
                      btnClass = 'btn-3d-green ring-4 ring-emerald-300 scale-102';
                    } else if (isUserSelection) {
                      btnClass = 'opacity-60 grayscale-[30%]';
                    } else {
                      btnClass = 'opacity-40';
                    }
                  }

                  return (
                    <button
                      key={String(boolVal)}
                      disabled={isLocked}
                      onClick={() => submitTrueFalse(boolVal)}
                      className={`py-8 sm:py-10 rounded-3xl text-center text-xl sm:text-2xl font-black transition-all shadow-lg cursor-pointer ${btnClass}`}
                    >
                      <div className="text-3xl sm:text-4xl mb-1">{boolVal ? '👍' : '👎'}</div>
                      <div>{boolVal ? 'TRUE (ĐÚNG)' : 'FALSE (SAI)'}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TYPE 3: Fill in the Blank */}
            {q.type === 'fill-in-the-blank' && (
              <form onSubmit={submitFillInBlank} className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 text-sm sm:text-base text-slate-800 shadow-xs">
                  <span className="font-black text-amber-900 flex items-center gap-1.5 mb-1">
                    <span>💡</span> Gợi ý câu (Sentence Prompt):
                  </span>
                  <div className="font-semibold text-slate-800">{q.sentencePrompt}</div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={fillValue}
                    disabled={currentSlot.isLocked}
                    onChange={(e) => setFillValue(e.target.value)}
                    placeholder={q.placeholder || 'Bé hãy nhập đáp án vào đây...'}
                    className="flex-1 px-4 py-3.5 rounded-2xl border-3 border-amber-300 focus:border-rose-500 bg-white outline-none text-slate-900 text-base sm:text-lg font-bold disabled:bg-slate-100 shadow-inner"
                  />
                  {!currentSlot.isLocked && (
                    <button
                      type="submit"
                      disabled={!fillValue.trim()}
                      className="px-6 py-3.5 rounded-2xl btn-3d-yellow disabled:opacity-40 font-black text-base shadow-md transition cursor-pointer"
                    >
                      {currentSlot.attempts === 1 ? '🔄 Thử lại (+5 pts)' : '🚀 Gửi đáp án (+10 pts)'}
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* TYPE 4: Multiple Select */}
            {q.type === 'multiple-select' && (
              <div className="space-y-3">
                <div className="text-xs sm:text-sm text-amber-900 font-bold bg-amber-100 px-4 py-2 rounded-2xl border-2 border-amber-300 flex items-center gap-2 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>
                    👉 Bé hãy chọn <strong>TẤT CẢ các phương án đúng</strong> (có thể chọn nhiều hơn 1 đáp án nhé)!
                  </span>
                </div>

                {(currentSlot.shuffledOptions || q.options).map((option, idx) => {
                  const isChecked = selectedMultiple.includes(option);
                  const isCorrect = q.correctAnswers.includes(option);
                  const isLocked = currentSlot.isLocked;

                  let itemStyle = 'border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/50 shadow-xs';

                  if (isLocked) {
                    if (isCorrect) {
                      itemStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-black ring-2 ring-emerald-300';
                    } else if (isChecked && !isCorrect) {
                      itemStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-bold';
                    }
                  } else if (isChecked) {
                    itemStyle = 'border-amber-500 bg-amber-50 text-amber-950 font-black ring-2 ring-amber-300';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isLocked}
                      onClick={() => toggleMultipleSelect(option)}
                      className={`w-full text-left p-4 rounded-2xl border-3 text-base sm:text-lg transition-all flex items-center justify-between cursor-pointer ${itemStyle}`}
                    >
                      <span className="font-bold leading-relaxed">{option}</span>
                      <div
                        className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center shrink-0 ml-4 shadow-xs transition ${
                          isChecked
                            ? 'bg-rose-500 border-rose-600 text-white'
                            : 'border-slate-300 bg-slate-50'
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}

                {!currentSlot.isLocked && (
                  <button
                    onClick={submitMultipleSelect}
                    disabled={selectedMultiple.length === 0}
                    className="w-full mt-4 py-3.5 sm:py-4 rounded-2xl btn-3d-yellow disabled:opacity-40 font-black text-base sm:text-lg shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{currentSlot.attempts === 1 ? '🔄 Thử Lại (+5 pts)' : '🚀 Xác Nhận Các Lựa Chọn (+10 pts)'}</span>
                  </button>
                )}
              </div>
            )}

            {/* TYPE 5: Matching Columns */}
            {q.type === 'matching-columns' && (
              <div className="space-y-4">
                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-xs sm:text-sm font-bold text-sky-950 flex items-center gap-2">
                  <span className="text-lg">👉</span>
                  <span>Bé hãy bấm vào Cột A rồi bấm tiếp vào giải thích tương ứng ở Cột B nhé!</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Column A */}
                  <div className="space-y-2.5">
                    <div className="text-xs sm:text-sm font-black text-purple-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span>🏷️</span> Cột A: Từ khóa (Words)
                    </div>
                    {q.columnA.map((item) => {
                      const isConnected = Boolean(matchingConnections[item.id]);
                      const isActive = activeColAId === item.id;
                      return (
                        <button
                          key={item.id}
                          disabled={currentSlot.isLocked}
                          onClick={() => {
                            soundEffects.playClick();
                            setActiveColAId(item.id);
                          }}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-3 text-sm sm:text-base font-black transition-all cursor-pointer shadow-xs ${
                            isActive
                              ? 'bg-amber-100 border-amber-500 text-amber-950 ring-4 ring-amber-300'
                              : isConnected
                              ? 'bg-slate-100 border-slate-300 text-slate-700'
                              : 'bg-white border-purple-200 text-slate-800 hover:border-purple-400 hover:bg-purple-50/50'
                          }`}
                        >
                          {item.text}
                          {isConnected && (
                            <span className="block text-xs font-bold text-emerald-700 truncate mt-1">
                              ✅ Nối với: {matchingConnections[item.id]}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Column B */}
                  <div className="space-y-2.5">
                    <div className="text-xs sm:text-sm font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span>📝</span> Cột B: Giải thích (Definitions)
                    </div>
                    {q.columnB.map((item) => {
                      return (
                        <button
                          key={item.id}
                          disabled={currentSlot.isLocked}
                          onClick={() => handleConnectMatching(item.id)}
                          className="w-full text-left p-3.5 sm:p-4 rounded-2xl border-3 border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50/50 text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer shadow-xs"
                        >
                          {item.text}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {!currentSlot.isLocked && (
                  <button
                    onClick={submitMatching}
                    disabled={
                      Object.keys(matchingConnections).length !== q.columnA.length
                    }
                    className="w-full py-3.5 sm:py-4 rounded-2xl btn-3d-yellow disabled:opacity-40 font-black text-base sm:text-lg shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{currentSlot.attempts === 1 ? '🔄 Kiểm Tra Lại Cặp Nối (+5 pts)' : '✨ Kiểm Tra 4 Cặp Nối (+10 pts)'}</span>
                  </button>
                )}
              </div>
            )}

            {/* TYPE 6: Word Order */}
            {q.type === 'word-order' && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <span>🧩</span> Bấm vào các từ bên dưới để xếp thành câu tiếng Anh hoàn chỉnh nhé:
                </p>

                {/* Drop Zone */}
                <div className="min-h-24 p-4 rounded-3xl border-3 border-dashed border-amber-400 bg-amber-50/70 flex flex-wrap gap-2.5 items-center shadow-inner">
                  {orderedChips.length === 0 ? (
                    <span className="text-sm font-bold text-amber-800/60 italic flex items-center gap-2 mx-auto">
                      <span>👇</span> Bấm chọn từ bên dưới để xếp câu vào đây...
                    </span>
                  ) : (
                    orderedChips.map((word, idx) => (
                      <button
                        key={idx}
                        disabled={currentSlot.isLocked}
                        onClick={() => removeChipFromSentence(word, idx)}
                        className="px-4 py-2.5 rounded-2xl btn-3d-blue font-black text-sm sm:text-base transition shadow-sm cursor-pointer"
                      >
                        {word} ✕
                      </button>
                    ))
                  )}
                </div>

                {/* Available Chips */}
                <div className="flex flex-wrap gap-2.5">
                  {remainingChips.map((word, idx) => (
                    <button
                      key={idx}
                      disabled={currentSlot.isLocked}
                      onClick={() => addChipToSentence(word, idx)}
                      className="px-4 py-2.5 rounded-2xl btn-3d-yellow font-black text-sm sm:text-base transition cursor-pointer shadow-sm"
                    >
                      {word}
                    </button>
                  ))}
                </div>

                {!currentSlot.isLocked && (
                  <button
                    onClick={submitWordOrder}
                    disabled={remainingChips.length > 0}
                    className="w-full py-3.5 sm:py-4 rounded-2xl btn-3d-yellow disabled:opacity-40 font-black text-base sm:text-lg shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{currentSlot.attempts === 1 ? '🔄 Kiểm Tra Lại Câu (+5 pts)' : '🚀 Kiểm Tra Câu Đã Ghép (+10 pts)'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Feedback & Explanation Card */}
          {currentSlot.feedbackMessage && (
            <div
              className={`mt-6 p-4 sm:p-6 rounded-3xl border-3 transition-all ${
                currentSlot.isCorrect
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 animate-correct-glow'
                  : currentSlot.isLocked
                  ? 'bg-amber-50 border-amber-400 text-slate-900'
                  : 'bg-rose-50 border-rose-400 text-rose-950 animate-shake'
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {currentSlot.isCorrect ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
                ) : currentSlot.isLocked ? (
                  <HelpCircle className="w-8 h-8 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1.5 flex-1">
                  <div className="font-black text-base sm:text-xl">
                    {currentSlot.feedbackMessage}
                  </div>
                  {currentSlot.isLocked && (
                    <div className="text-sm sm:text-base text-slate-800 mt-2 p-3.5 bg-white/90 rounded-2xl border-2 border-amber-200 shadow-xs">
                      <div className="font-black text-amber-900 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Giải Thích Chi Tiết & Đáp Án Chuẩn:</span>
                      </div>
                      <div className="leading-relaxed font-semibold">{q.explanation}</div>
                    </div>
                  )}
                  {currentSlot.isLocked && (
                    <div className="text-xs sm:text-sm font-black text-emerald-800 mt-1">
                      ⭐ Điểm đạt được ở câu này: +{currentSlot.scoreAwarded} / 10 pts
                    </div>
                  )}
                  {!currentSlot.isLocked && currentSlot.attempts === 1 && (
                    <div className="text-xs sm:text-sm text-rose-800 font-black mt-1">
                      ⚠️ Bé còn 1 lần thử lại (đạt 5 điểm nếu đúng). Hãy đọc kỹ lại câu hỏi nhé!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Next Question Control */}
          <div className="mt-8 pt-5 border-t-2 border-amber-100 flex justify-end">
            <button
              onClick={handleNextQuestion}
              disabled={!currentSlot.isLocked}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl btn-3d-green disabled:opacity-35 font-black text-sm sm:text-base shadow-lg transition cursor-pointer"
            >
              <span>
                {currentIdx < sessionQuestions.length - 1 ? 'Câu Tiếp Theo 🚀' : 'Hoàn Thành Đấu Trường 🏆'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        /* End Game Screen */
        <div className="bg-white rounded-3xl border-4 border-amber-400 shadow-2xl p-6 sm:p-10 space-y-6 text-center relative overflow-hidden">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 mx-auto flex items-center justify-center font-black shadow-lg border-4 border-amber-200">
            <Trophy className="w-14 h-14 text-amber-950 animate-bounce" />
          </div>

          <div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-800 bg-rose-100 border-2 border-rose-300 px-4 py-1.5 rounded-full shadow-xs inline-flex items-center gap-1.5">
              <span>🎉 HOÀN THÀNH BRAIN ARENA CHALLENGE 🎉</span>
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-rose-950 mt-3">
              {encouragingMsg}
            </h3>
            <p className="text-sm sm:text-base text-amber-900 font-bold mt-1">
              Bé đã chinh phục toàn bộ 15 câu hỏi đấu trường về Di tích Đền Hai Bà Trưng!
            </p>
          </div>

          {/* Detailed Results Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-amber-50 border-3 border-amber-300 rounded-3xl shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-amber-900">
                {totalScore}
              </div>
              <div className="text-xs text-amber-800 font-extrabold mt-1">
                Tổng Điểm (/150) ⭐
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border-3 border-emerald-300 rounded-3xl shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-emerald-900">
                {correctCount}
              </div>
              <div className="text-xs text-emerald-800 font-extrabold mt-1">
                Số Câu Đúng ✅
              </div>
            </div>

            <div className="p-4 bg-rose-50 border-3 border-rose-300 rounded-3xl shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-rose-900">
                {incorrectCount}
              </div>
              <div className="text-xs text-rose-800 font-extrabold mt-1">
                Số Câu Sai ❌
              </div>
            </div>

            <div className="p-4 bg-sky-50 border-3 border-sky-300 rounded-3xl shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-sky-900">
                {accuracyPercentage}%
              </div>
              <div className="text-xs text-sky-800 font-extrabold mt-1">
                Độ Chính Xác 🎯
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-200 text-xs sm:text-sm text-amber-950 font-bold inline-flex items-center justify-center gap-2 shadow-xs">
            <Timer className="w-4 h-4 text-amber-700" />
            <span>Thời Gian Thi Đấu: {formatTime(elapsedSeconds)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => {
                soundEffects.playClick();
                initializeGame();
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl btn-3d-green font-black text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thi Đấu Lại 🔄</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setShowReview(!showReview);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-black text-xs sm:text-sm transition cursor-pointer shadow-xs"
            >
              <span>Xem Lại Đáp Án Chi Tiết</span>
              {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                onBackToLearning();
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-black text-xs sm:text-sm transition cursor-pointer shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              <span>Về Trang Bài Học 📖</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                onGoToLeaderboard();
              }}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl btn-3d-yellow font-black text-xs sm:text-base shadow-lg transition cursor-pointer"
            >
              <Trophy className="w-5 h-5 text-amber-950" />
              <span>Xem Bảng Xếp Hạng Toàn Quốc 🏆</span>
            </button>
          </div>

          {/* Review Expandable Section */}
          {showReview && (
            <div className="mt-6 text-left border-t border-slate-200 pt-6 space-y-4">
              <h4 className="text-base font-extrabold text-slate-900">
                Detailed Answer Review (15 Questions):
              </h4>
              <div className="space-y-3">
                {sessionQuestions.map((s, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border text-xs sm:text-sm space-y-1.5 ${
                      s.isCorrect
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-rose-50/70 border-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900">
                        {idx + 1}. {s.question.question}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                          s.isCorrect
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-rose-200 text-rose-900'
                        }`}
                      >
                        +{s.scoreAwarded} pts
                      </span>
                    </div>

                    <div className="text-slate-700">
                      <span className="font-semibold">Your Answer: </span>
                      {s.userAnswerSummary || 'None'}
                    </div>

                    <div className="text-slate-600">
                      <span className="font-semibold">Explanation: </span>
                      {s.question.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past History */}
          {pastAttempts.length > 1 && (
            <div className="mt-6 text-left border-t border-slate-200 pt-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Recent Challenge Attempts
              </div>
              <div className="space-y-1.5">
                {pastAttempts.slice(0, 3).map((rec, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded border border-slate-200"
                  >
                    <span>Attempt {i + 1} ({rec.date})</span>
                    <span className="font-bold text-red-900">{rec.score} pts • {rec.accuracy}% acc • {rec.timeString}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
