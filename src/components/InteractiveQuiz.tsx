import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Award,
  Sparkles,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';
import {
  interactiveQuizQuestions,
  QuizQuestion,
  SingleChoiceQuestion,
  TrueFalseQuestion,
  FillInTheBlankQuestion,
  MatchingQuestion,
  SentenceOrderQuestion,
} from '../data/interactiveQuizQuestions';
import { soundEffects } from '../utils/audio';
import { StudentStorage } from '../utils/studentStorage';

interface QuestionState {
  attempts: number; // 0, 1, or 2
  isCompleted: boolean;
  isCorrect: boolean;
  firstAttemptCorrect: boolean;
  userAnswer: any;
  feedbackMessage: string;
}

interface InteractiveQuizProps {
  onBackToReading: () => void;
  onGoToArena: () => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  onBackToReading,
  onGoToArena,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<Record<number, QuestionState>>({});
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(false);

  // Form input states for current question
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedBool, setSelectedBool] = useState<boolean | null>(null);
  const [fillInput, setFillInput] = useState<string>('');
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({}); // term -> def
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [orderedWords, setOrderedWords] = useState<string[]>([]);
  const [remainingWords, setRemainingWords] = useState<string[]>([]);

  const currentQ: QuizQuestion = interactiveQuizQuestions[currentIndex];
  const currentState: QuestionState = questionStates[currentQ.id] || {
    attempts: 0,
    isCompleted: false,
    isCorrect: false,
    firstAttemptCorrect: false,
    userAnswer: null,
    feedbackMessage: '',
  };

  // Reset or load input states when navigating between questions
  useEffect(() => {
    const state = questionStates[currentQ.id];
    if (state && state.isCompleted) {
      if (currentQ.type === 'single-choice') setSelectedOption(state.userAnswer || '');
      if (currentQ.type === 'true-false') setSelectedBool(state.userAnswer);
      if (currentQ.type === 'fill-in-the-blank') setFillInput(state.userAnswer || '');
      if (currentQ.type === 'matching') setMatchedPairs(state.userAnswer || {});
      if (currentQ.type === 'sentence-order') {
        setOrderedWords(state.userAnswer || []);
        setRemainingWords([]);
      }
    } else {
      // Clear inputs for fresh question
      setSelectedOption('');
      setSelectedBool(null);
      setFillInput('');
      setMatchedPairs({});
      setActiveTerm(null);
      if (currentQ.type === 'sentence-order') {
        const shuffled = [...currentQ.words].sort(() => Math.random() - 0.5);
        setRemainingWords(shuffled);
        setOrderedWords([]);
      }
    }
  }, [currentIndex, currentQ.id]);

  const triggerShake = () => {
    setShakeTrigger(true);
    setTimeout(() => setShakeTrigger(false), 500);
  };

  const recordAnswer = (isCorrect: boolean, answerData: any) => {
    const prevAttempts = currentState.attempts;
    const newAttempts = prevAttempts + 1;

    if (isCorrect) {
      soundEffects.playCorrect();
      const points = prevAttempts === 0 ? 10 : 5;
      StudentStorage.addScore(points, {
        title: `Interactive Quiz - Question ${currentIndex + 1}`,
        activityType: 'quiz',
        details: `Trả lời đúng (${points} điểm)`,
      });

      setQuestionStates((prev) => ({
        ...prev,
        [currentQ.id]: {
          attempts: newAttempts,
          isCompleted: true,
          isCorrect: true,
          firstAttemptCorrect: prevAttempts === 0,
          userAnswer: answerData,
          feedbackMessage: prevAttempts === 0
            ? '🎉 Excellent! That is correct! (+10 pts) (Chính xác! Xuất sắc!)'
            : '✨ Correct on second attempt! (+5 pts) (Chính xác ở lần thử thứ 2!)',
        },
      }));
    } else {
      triggerShake();
      if (newAttempts === 1) {
        // First incorrect attempt: allow one retry
        soundEffects.playIncorrect();
        setQuestionStates((prev) => ({
          ...prev,
          [currentQ.id]: {
            attempts: newAttempts,
            isCompleted: false,
            isCorrect: false,
            firstAttemptCorrect: false,
            userAnswer: answerData,
            feedbackMessage: '❌ Not quite! You have 1 more chance to try again. (Chưa chính xác! Bạn còn 1 cơ hội thử lại.)',
          },
        }));
      } else {
        // Second incorrect attempt: reveal answer & lock
        soundEffects.playReveal();
        setQuestionStates((prev) => ({
          ...prev,
          [currentQ.id]: {
            attempts: newAttempts,
            isCompleted: true,
            isCorrect: false,
            firstAttemptCorrect: false,
            userAnswer: answerData,
            feedbackMessage: '⚠️ Second attempt incorrect (0 pts). Here is the correct answer: (Đã hết 2 lượt thử. Hãy xem đáp án chính xác bên dưới:)',
          },
        }));
      }
    }
  };

  // Submit handlers for each question type
  const handleSubmitSingleChoice = () => {
    if (!selectedOption || currentState.isCompleted) return;
    const q = currentQ as SingleChoiceQuestion;
    const isCorrect = selectedOption === q.correctAnswer;
    recordAnswer(isCorrect, selectedOption);
  };

  const handleSubmitTrueFalse = (boolVal: boolean) => {
    if (currentState.isCompleted) return;
    setSelectedBool(boolVal);
    const q = currentQ as TrueFalseQuestion;
    const isCorrect = boolVal === q.correctAnswer;
    recordAnswer(isCorrect, boolVal);
  };

  const handleSubmitFill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fillInput.trim() || currentState.isCompleted) return;
    const q = currentQ as FillInTheBlankQuestion;
    const cleanUser = fillInput.trim().toLowerCase();
    const isCorrect = q.acceptedAnswers.some(
      (ans) => ans.trim().toLowerCase() === cleanUser
    );
    recordAnswer(isCorrect, fillInput.trim());
  };

  const handleMatchSelect = (type: 'term' | 'def', value: string) => {
    if (currentState.isCompleted) return;
    soundEffects.playClick();
    if (type === 'term') {
      setActiveTerm(value);
    } else if (type === 'def' && activeTerm) {
      setMatchedPairs((prev) => ({
        ...prev,
        [activeTerm]: value,
      }));
      setActiveTerm(null);
    }
  };

  const handleCheckMatching = () => {
    if (currentState.isCompleted) return;
    const q = currentQ as MatchingQuestion;
    if (Object.keys(matchedPairs).length !== q.pairs.length) return;

    const allCorrect = q.pairs.every((pair) => matchedPairs[pair.term] === pair.definition);
    recordAnswer(allCorrect, matchedPairs);
  };

  const handleAddWordToSentence = (word: string, index: number) => {
    if (currentState.isCompleted) return;
    soundEffects.playClick();
    setOrderedWords((prev) => [...prev, word]);
    setRemainingWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveWordFromSentence = (word: string, index: number) => {
    if (currentState.isCompleted) return;
    soundEffects.playClick();
    setRemainingWords((prev) => [...prev, word]);
    setOrderedWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckSentenceOrder = () => {
    if (currentState.isCompleted || remainingWords.length > 0) return;
    const q = currentQ as SentenceOrderQuestion;
    const formedSentence = orderedWords.join(' ');
    const isCorrect =
      formedSentence.trim().toLowerCase() === q.correctSentence.trim().toLowerCase();
    recordAnswer(isCorrect, orderedWords);
  };

  // Quiz summary calculations
  const totalQuestions = interactiveQuizQuestions.length;
  const completedCount = Object.values(questionStates).filter((s) => s.isCompleted).length;
  const correctCount = Object.values(questionStates).filter(
    (s) => s.isCompleted && s.isCorrect
  ).length;
  const accuracyPercentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const handleRestartQuiz = () => {
    soundEffects.playClick();
    setQuestionStates({});
    setCurrentIndex(0);
    setIsQuizFinished(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Quiz Card */}
      {!isQuizFinished ? (
        <div
          className={`bg-white rounded-3xl border-4 border-amber-400 shadow-2xl p-5 sm:p-8 lg:p-10 relative transition-transform ${
            shakeTrigger ? 'animate-shake' : ''
          }`}
        >
          {/* Rainbow top line */}
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 via-sky-400 to-purple-500 rounded-t-3xl" />

          {/* Progress & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-amber-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-800 bg-rose-100 border-2 border-rose-300 px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  <span>🎯 Đố Vui Di Tích • Lớp 6</span>
                </span>
                <span className="text-xs text-amber-700 font-bold bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                  📱 Chuẩn 16:9
                </span>
              </div>
              <div className="text-xs sm:text-sm text-slate-700 mt-2 font-bold flex items-center gap-1.5">
                <span>📚 Chủ đề:</span>
                <span className="text-sky-800 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                  {currentQ.topic}
                </span>
              </div>
            </div>

            <div className="text-right sm:self-end">
              <span className="text-sm sm:text-base font-black text-rose-950 flex items-center justify-end gap-1.5">
                <span>⭐ Câu</span>
                <span className="text-rose-600 text-lg">{currentIndex + 1}</span>
                <span>/ {totalQuestions}</span>
              </span>
              <div className="w-44 sm:w-56 bg-amber-100 h-4 rounded-full overflow-hidden mt-1.5 p-0.5 border-2 border-amber-300 shadow-inner">
                <div
                  className="bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-500 h-full transition-all duration-400 rounded-full"
                  style={{
                    width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="my-6 sm:my-8 bg-amber-50/60 p-4 sm:p-5 rounded-2xl border-2 border-amber-200">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Question Body Depending on Type */}
          <div className="space-y-4 sm:space-y-5">
            {/* TYPE 1: Single Choice */}
            {currentQ.type === 'single-choice' && (
              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isAnswerChecked = currentState.isCompleted;
                  const isCorrectAnswer = option === currentQ.correctAnswer;

                  const badgeColors = [
                    'bg-rose-500 text-white border-rose-600',
                    'bg-sky-500 text-white border-sky-600',
                    'bg-amber-500 text-white border-amber-600',
                    'bg-emerald-500 text-white border-emerald-600',
                  ];

                  let borderClass = 'border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 shadow-xs hover:translate-y-[-2px]';
                  let bgClass = 'bg-white';

                  if (isAnswerChecked) {
                    if (isCorrectAnswer) {
                      borderClass = 'border-emerald-500 ring-4 ring-emerald-300 shadow-md';
                      bgClass = 'bg-emerald-50 text-emerald-950 font-black';
                    } else if (isSelected && !currentState.isCorrect) {
                      borderClass = 'border-rose-500 ring-2 ring-rose-200';
                      bgClass = 'bg-rose-50 text-rose-950';
                    }
                  } else if (isSelected) {
                    borderClass = 'border-amber-500 ring-4 ring-amber-300 shadow-md translate-y-[-2px]';
                    bgClass = 'bg-amber-50 text-amber-950 font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={currentState.isCompleted}
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedOption(option);
                      }}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border-3 text-base sm:text-lg transition-all flex items-center justify-between cursor-pointer ${borderClass} ${bgClass}`}
                    >
                      <span className="leading-relaxed font-bold">{option}</span>
                      <span
                        className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center text-sm font-black shrink-0 ml-4 shadow-xs ${badgeColors[idx % 4]}`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                    </button>
                  );
                })}

                {!currentState.isCompleted && (
                  <button
                    onClick={handleSubmitSingleChoice}
                    disabled={!selectedOption}
                    className="w-full mt-4 py-3.5 sm:py-4 rounded-2xl btn-3d-yellow disabled:opacity-40 font-black text-base sm:text-lg shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{currentState.attempts === 1 ? '🔄 Thử Lại Lần 2 (Submit Retry)' : '🚀 Xác Nhận Câu Trả Lời (Submit Answer)'}</span>
                  </button>
                )}
              </div>
            )}

            {/* TYPE 2: True or False */}
            {currentQ.type === 'true-false' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  {[true, false].map((boolVal) => {
                    const isSelected = selectedBool === boolVal;
                    const isCorrectAnswer = currentQ.correctAnswer === boolVal;
                    const isCompleted = currentState.isCompleted;

                    let btnClass = boolVal ? 'btn-3d-green' : 'btn-3d-red';

                    if (isCompleted) {
                      if (isCorrectAnswer) {
                        btnClass = 'btn-3d-green ring-4 ring-emerald-300 scale-102';
                      } else if (isSelected) {
                        btnClass = 'opacity-60 grayscale-[30%]';
                      } else {
                        btnClass = 'opacity-40';
                      }
                    } else if (isSelected) {
                      btnClass += ' ring-4 ring-amber-300';
                    }

                    return (
                      <button
                        key={String(boolVal)}
                        disabled={currentState.isCompleted}
                        onClick={() => handleSubmitTrueFalse(boolVal)}
                        className={`py-8 sm:py-10 rounded-3xl text-center text-xl sm:text-2xl font-black transition-all shadow-lg cursor-pointer ${btnClass}`}
                      >
                        <div className="text-3xl sm:text-4xl mb-1">{boolVal ? '👍' : '👎'}</div>
                        <div>{boolVal ? 'TRUE (ĐÚNG)' : 'FALSE (SAI)'}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TYPE 3: Fill in the Blank */}
            {currentQ.type === 'fill-in-the-blank' && (
              <form onSubmit={handleSubmitFill} className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 text-sm sm:text-base text-slate-800 shadow-xs">
                  <span className="font-black text-amber-900 flex items-center gap-1.5 mb-1">
                    <span>💡</span> Gợi ý (Hint):
                  </span>
                  <div className="font-semibold text-slate-800">{currentQ.sentencePrompt}</div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={fillInput}
                    disabled={currentState.isCompleted}
                    onChange={(e) => setFillInput(e.target.value)}
                    placeholder={currentQ.placeholder || 'Bé hãy nhập từ còn thiếu vào đây...'}
                    className="flex-1 px-4 py-3.5 rounded-2xl border-3 border-amber-300 focus:border-rose-500 bg-white outline-none text-slate-900 text-base sm:text-lg font-bold disabled:bg-slate-100 shadow-inner"
                  />
                  {!currentState.isCompleted && (
                    <button
                      type="submit"
                      disabled={!fillInput.trim()}
                      className="px-6 py-3.5 rounded-2xl btn-3d-yellow disabled:opacity-40 font-black text-base shadow-md transition cursor-pointer"
                    >
                      {currentState.attempts === 1 ? '🔄 Thử Lại (Retry)' : '🚀 Gửi Đáp Án (Submit)'}
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* TYPE 4: Matching */}
            {currentQ.type === 'matching' && (
              <div className="space-y-4">
                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-xs sm:text-sm font-bold text-sky-950 flex items-center gap-2">
                  <span className="text-lg">👉</span>
                  <span>Bước 1: Chọn đặc điểm ở Cột A. Bước 2: Nhấn vào mô tả tương ứng ở Cột B nhé!</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Column A (Terms) */}
                  <div className="space-y-2.5">
                    <div className="text-xs sm:text-sm font-black text-purple-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span>🏷️</span> Cột A: Đặc điểm (Features)
                    </div>
                    {currentQ.pairs.map((p) => {
                      const isMatched = Boolean(matchedPairs[p.term]);
                      const isActive = activeTerm === p.term;
                      return (
                        <button
                          key={p.term}
                          disabled={currentState.isCompleted}
                          onClick={() => handleMatchSelect('term', p.term)}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-3 text-sm sm:text-base font-black transition-all cursor-pointer shadow-xs ${
                            isActive
                              ? 'bg-amber-100 border-amber-500 text-amber-950 ring-4 ring-amber-300'
                              : isMatched
                              ? 'bg-slate-100 border-slate-300 text-slate-700'
                              : 'bg-white border-purple-200 text-slate-800 hover:border-purple-400 hover:bg-purple-50/50'
                          }`}
                        >
                          {p.term}
                          {isMatched && (
                            <span className="block text-xs font-bold text-emerald-700 truncate mt-1">
                              ✅ Nối với: {matchedPairs[p.term]}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Column B (Definitions) */}
                  <div className="space-y-2.5">
                    <div className="text-xs sm:text-sm font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span>📝</span> Cột B: Mô tả (Descriptions)
                    </div>
                    {currentQ.pairs.map((p) => {
                      return (
                        <button
                          key={p.definition}
                          disabled={currentState.isCompleted}
                          onClick={() => handleMatchSelect('def', p.definition)}
                          className="w-full text-left p-3.5 sm:p-4 rounded-2xl border-3 border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50/50 text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer shadow-xs"
                        >
                          {p.definition}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {!currentState.isCompleted && (
                  <button
                    onClick={handleCheckMatching}
                    disabled={Object.keys(matchedPairs).length !== currentQ.pairs.length}
                    className="w-full py-3.5 sm:py-4 rounded-2xl btn-3d-yellow disabled:opacity-40 font-black text-base sm:text-lg shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{currentState.attempts === 1 ? '🔄 Kiểm Tra Lại Cặp Nối' : '✨ Kiểm Tra Kết Quả Nối Cột'}</span>
                  </button>
                )}
              </div>
            )}

            {/* TYPE 5: Sentence Ordering */}
            {currentQ.type === 'sentence-order' && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <span>🧩</span> Nhấn vào các khối từ bên dưới để ghép thành câu đúng thứ tự nhé:
                </p>

                {/* Sentence Drop Zone */}
                <div className="min-h-24 p-4 rounded-3xl border-3 border-dashed border-amber-400 bg-amber-50/70 flex flex-wrap gap-2.5 items-center shadow-inner">
                  {orderedWords.length === 0 ? (
                    <span className="text-sm font-bold text-amber-800/60 italic flex items-center gap-2 mx-auto">
                      <span>👇</span> Bấm chọn các từ bên dưới để xếp vào đây...
                    </span>
                  ) : (
                    orderedWords.map((word, idx) => (
                      <button
                        key={idx}
                        disabled={currentState.isCompleted}
                        onClick={() => handleRemoveWordFromSentence(word, idx)}
                        className="px-4 py-2.5 rounded-2xl btn-3d-blue font-black text-sm sm:text-base transition shadow-sm cursor-pointer"
                      >
                        {word} ✕
                      </button>
                    ))
                  )}
                </div>

                {/* Word Bank */}
                <div className="flex flex-wrap gap-2.5">
                  {remainingWords.map((word, idx) => (
                    <button
                      key={idx}
                      disabled={currentState.isCompleted}
                      onClick={() => handleAddWordToSentence(word, idx)}
                      className="px-4 py-2.5 rounded-2xl btn-3d-yellow font-black text-sm sm:text-base transition cursor-pointer shadow-sm"
                    >
                      {word}
                    </button>
                  ))}
                </div>

                {!currentState.isCompleted && (
                  <button
                    onClick={handleCheckSentenceOrder}
                    disabled={remainingWords.length > 0}
                    className="w-full py-3.5 sm:py-4 rounded-2xl btn-3d-yellow disabled:opacity-40 font-black text-base sm:text-lg shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{currentState.attempts === 1 ? '🔄 Kiểm Tra Lại Câu' : '🚀 Kiểm Tra Câu Đã Ghép'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Feedback & Explanation Card */}
          {currentState.feedbackMessage && (
            <div
              className={`mt-6 p-4 sm:p-6 rounded-3xl border-3 transition-all ${
                currentState.isCorrect
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 animate-correct-glow'
                  : currentState.isCompleted
                  ? 'bg-amber-50 border-amber-400 text-slate-900'
                  : 'bg-rose-50 border-rose-400 text-rose-950 animate-shake'
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {currentState.isCorrect ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
                ) : currentState.isCompleted ? (
                  <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1.5 flex-1">
                  <div className="font-black text-base sm:text-xl">
                    {currentState.feedbackMessage}
                  </div>

                  {/* If completed, always show correct answer & explanation */}
                  {currentState.isCompleted && (
                    <div className="text-sm sm:text-base text-slate-800 mt-2 p-3.5 bg-white/90 rounded-2xl border-2 border-amber-200 shadow-xs">
                      <div className="font-black text-amber-900 flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Giải Thích Chi Tiết & Đáp Án Chuẩn:</span>
                      </div>
                      <div className="leading-relaxed font-semibold">{currentQ.explanation}</div>
                    </div>
                  )}

                  {!currentState.isCompleted && currentState.attempts === 1 && (
                    <div className="text-xs sm:text-sm text-rose-800 font-black mt-1">
                      ⚠️ Bé còn 1 lần thử lại câu hỏi này. Đọc kỹ lại rồi chọn đáp án đúng nhé!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls: Previous / Next / Finish */}
          <div className="mt-8 pt-5 border-t-2 border-amber-100 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                soundEffects.playClick();
                setCurrentIndex((prev) => Math.max(0, prev - 1));
              }}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-slate-300 disabled:opacity-30 text-slate-700 bg-white hover:bg-slate-100 text-xs sm:text-sm font-black transition cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Câu Trước</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
                }}
                disabled={!currentState.isCompleted}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl btn-3d-green disabled:opacity-35 font-black text-xs sm:text-base transition shadow-md cursor-pointer"
              >
                <span>Câu Tiếp Theo 🚀</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  soundEffects.playCelebration();
                  setIsQuizFinished(true);
                }}
                disabled={!currentState.isCompleted}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl btn-3d-yellow disabled:opacity-35 font-black text-xs sm:text-base shadow-lg transition cursor-pointer"
              >
                <span>Hoàn Thành Đố Vui 🎉</span>
                <Award className="w-5 h-5 text-amber-950" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Finished Summary Screen */
        <div className="bg-white rounded-3xl border-4 border-amber-400 shadow-2xl p-6 sm:p-10 space-y-6 text-center relative overflow-hidden">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 mx-auto flex items-center justify-center font-black shadow-lg border-4 border-amber-200">
            <Award className="w-14 h-14 text-amber-950 animate-bounce" />
          </div>

          <div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-800 bg-rose-100 border-2 border-rose-300 px-4 py-1.5 rounded-full shadow-xs inline-flex items-center gap-1.5">
              <span>🎉 HOÀN THÀNH XUẤT SẮC! 🎉</span>
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-rose-950 mt-3">
              Bé đã làm rất tuyệt vời! 🌟
            </h3>
            <p className="text-sm sm:text-base text-amber-900 font-bold mt-1">
              Bé đã vượt qua bài Đố Vui Tìm Hiểu Di Tích Đền Hai Bà Trưng!
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto">
            <div className="p-4 bg-sky-50 border-3 border-sky-300 rounded-3xl shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-sky-900">
                {correctCount}/{totalQuestions}
              </div>
              <div className="text-xs text-sky-700 font-extrabold mt-1">
                Số Câu Đúng
              </div>
            </div>

            <div className="p-4 bg-amber-50 border-3 border-amber-300 rounded-3xl shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-amber-900">
                {accuracyPercentage}%
              </div>
              <div className="text-xs text-amber-700 font-extrabold mt-1">
                Độ Chính Xác
              </div>
            </div>

            <div className="p-4 bg-rose-50 border-3 border-rose-300 rounded-3xl shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-rose-900">
                +{correctCount * 10}
              </div>
              <div className="text-xs text-rose-700 font-extrabold mt-1">
                Điểm Thưởng ⭐
              </div>
            </div>
          </div>

          {/* Suggestions for Further Study */}
          <div className="text-left bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 rounded-3xl p-5 sm:p-6 border-3 border-amber-300 space-y-3">
            <div className="flex items-center gap-2 text-rose-950 font-black text-base sm:text-lg">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Gợi ý chặng tiếp theo cho bé:</span>
            </div>
            <ul className="text-xs sm:text-sm text-slate-800 font-bold space-y-2 list-disc list-inside">
              <li>
                Khám phá <strong className="text-rose-900">Tour 360° Đền Hai Bà Trưng</strong> để dạo bước trong không gian di tích thực tế ảo 3D.
              </li>
              <li>
                Tham gia <strong className="text-rose-900">15 Câu Hỏi Brain Arena</strong> thử thách tranh tài đỉnh cao để nhận cúp vàng toàn quốc!
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={handleRestartQuiz}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-black text-xs sm:text-sm transition cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm Lại Bài Đố 🔄</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                onBackToReading();
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-black text-xs sm:text-sm transition cursor-pointer shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              <span>Đọc Lại Bài Học 📖</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                onGoToArena();
              }}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl btn-3d-yellow font-black text-xs sm:text-base shadow-lg transition cursor-pointer"
            >
              <span>Vào Đấu Trường Brain Arena (15 Câu) ⚔️</span>
              <ArrowRight className="w-5 h-5 text-amber-950" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
