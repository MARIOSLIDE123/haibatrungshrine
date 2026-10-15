import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  Volume2,
  BookOpen,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { readingContent, VocabularyItem } from '../data/readingContent';
import { speechController, soundEffects } from '../utils/audio';
import { StudentStorage } from '../utils/studentStorage';

interface HistoricalReadingProps {
  onStartQuiz: () => void;
}

export interface ShrinePhoto {
  id: string;
  src: string;
  title: string;
  titleVi: string;
  caption: string;
  captionVi: string;
}

const SHRINE_PHOTOS: ShrinePhoto[] = [
  {
    id: 'photo-1',
    src: '/images/shrine-gate-tamquan.jpg',
    title: 'Three-Gate Entrance (Tam Quan Gate)',
    titleVi: 'Cổng Tam Quan Đền Hai Bà Trưng',
    caption: 'The historical three-gate entrance facing Bach Dang Street with traditional festival flags and ancient Chinese couplets.',
    captionVi: 'Cổng tam quan cổ kính hướng ra đường Bạch Đằng với cờ hội truyền thống và đôi câu đối chữ Hán ca ngợi công đức Hai Bà.',
  },
  {
    id: 'photo-2',
    src: '/images/shrine-ancient-courtyard.jpg',
    title: 'Ancient Courtyard & Banyan Trees',
    titleVi: 'Khuôn viên Sân đền & Cây cổ thụ',
    caption: 'The spacious brick courtyard shaded by ancient trees and stone lanterns leading to the front worship hall.',
    captionVi: 'Sân gạch rộng rãi rợp bóng cây cổ thụ và những trụ đèn đá nghìn năm dẫn vào tòa tiền tế uy nghiêm.',
  },
  {
    id: 'photo-3',
    src: '/images/shrine-front-hall.jpg',
    title: 'Front Worship Hall & Incense Burner',
    titleVi: 'Tòa Tiền tế & Lư hương đá thiêng',
    caption: 'Sacred stone incense burner and ceremonial stone pillars in front of the worship hall with golden lacquered woodworks.',
    captionVi: 'Lư hương đá chạm rồng và các cột đèn đá trước tiền đường với hệ thống hoành phi câu đối sơn son thếp vàng.',
  },
  {
    id: 'photo-4',
    src: '/images/shrine-sisters-altar.jpg',
    title: 'Altar of the Trung Sisters',
    titleVi: 'Ban thờ Hai Bà Trưng (Trưng Trắc & Trưng Nhị)',
    caption: 'The solemn altar dedicated to national heroines Trung Trac and Trung Nhi adorned with golden dragons and offerings.',
    captionVi: 'Ban thờ phụng hai vị nữ anh hùng dân tộc Trưng Trắc và Trưng Nhị với tượng ngọc và khám thờ dát vàng lộng lẫy.',
  },
  {
    id: 'photo-5',
    src: '/images/shrine-inner-sanctuary.jpg',
    title: 'Inner Sanctuary & Sacred Golden Cranes',
    titleVi: 'Chính điện Nội tự Đình làng Đổng Nhân',
    caption: 'Sacred pair of bronze cranes and exquisite gilded dragon-phoenix wood carvings preserving Le-Nguyen dynasty heritage.',
    captionVi: 'Đôi hạc đồng chầu linh thiêng và hương án chạm khắc rồng phượng thếp vàng tinh xảo thời Lê - Nguyễn.',
  },
];

export const HistoricalReading: React.FC<HistoricalReadingProps> = ({ onStartQuiz }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(0.85); // friendly Grade 6 slow speed
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [selectedVocab, setSelectedVocab] = useState<VocabularyItem | null>(null);
  const [hasClaimedReadingPoints, setHasClaimedReadingPoints] = useState(false);

  // Gallery & Zoom states (Feature 1)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // 1, 1.5, 2, 2.5

  // Voice Selection states (Feature 2)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(speechController.getSelectedVoiceURI());
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const activePhoto = SHRINE_PHOTOS[activePhotoIdx];

  const handleClaimReadingBonus = () => {
    if (hasClaimedReadingPoints) return;
    soundEffects.playCorrect();
    setHasClaimedReadingPoints(true);
    StudentStorage.addScore(10, {
      title: 'Historical Reading Exploration',
      activityType: 'reading',
      durationSeconds: 180,
      details: 'Đã hoàn thành tìm hiểu bài đọc lịch sử Đền Hai Bà Trưng (+10 điểm)',
    });
  };

  // Load voices
  useEffect(() => {
    const updateVoiceList = () => {
      const voices = speechController.getEnglishVoices();
      setAvailableVoices(voices);
      if (!selectedVoiceURI && voices.length > 0) {
        setSelectedVoiceURI(voices[0].voiceURI);
      }
    };

    updateVoiceList();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoiceList;
    }

    const unsubscribe = speechController.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setIsPaused(state.isPaused);
      if (!state.isPlaying) {
        setActiveSectionId(null);
      }
    });

    return () => {
      unsubscribe();
      speechController.stop();
    };
  }, []);

  const handleVoiceChange = (uri: string) => {
    soundEffects.playClick();
    setSelectedVoiceURI(uri);
    speechController.setSelectedVoiceURI(uri);
  };

  const handleTestVoice = () => {
    soundEffects.playClick();
    speechController.speak('Welcome to Hai Ba Trung Shrine in Hanoi, Vietnam.', {
      rate: readingSpeed,
      voiceURI: selectedVoiceURI,
    });
  };

  const handlePlayFullArticle = () => {
    soundEffects.playClick();
    if (isPlaying && isPaused) {
      speechController.resume();
      return;
    }

    const fullText = [
      readingContent.title,
      readingContent.subtitle,
      `Location: ${readingContent.location}`,
      ...readingContent.sections.flatMap((sec) => [sec.title, ...sec.paragraphs]),
    ].join('. ');

    setActiveSectionId('all');
    speechController.speak(fullText, {
      rate: readingSpeed,
      voiceURI: selectedVoiceURI,
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveSectionId(null);
      },
    });
  };

  const handlePlaySection = (sectionId: string) => {
    soundEffects.playClick();
    const section = readingContent.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const sectionText = [section.title, ...section.paragraphs].join('. ');
    setActiveSectionId(sectionId);
    speechController.speak(sectionText, {
      rate: readingSpeed,
      voiceURI: selectedVoiceURI,
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveSectionId(null);
      },
    });
  };

  const handlePause = () => {
    soundEffects.playClick();
    speechController.pause();
  };

  const handleStop = () => {
    soundEffects.playClick();
    speechController.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSectionId(null);
  };

  const handleSpeedChange = (speed: number) => {
    soundEffects.playClick();
    setReadingSpeed(speed);
    speechController.setRate(speed);
    if (isPlaying) {
      handleStop();
    }
  };

  const handlePronounceWord = (word: string) => {
    soundEffects.playClick();
    speechController.speak(word, { rate: 0.8, voiceURI: selectedVoiceURI });
  };

  // Zoom modal navigation
  const openZoomModal = (idx?: number) => {
    soundEffects.playClick();
    if (typeof idx === 'number') {
      setActivePhotoIdx(idx);
    }
    setZoomLevel(1);
    setIsZoomModalOpen(true);
  };

  const closeZoomModal = () => {
    soundEffects.playClick();
    setIsZoomModalOpen(false);
    setZoomLevel(1);
  };

  const handleNextPhoto = () => {
    soundEffects.playClick();
    setActivePhotoIdx((prev) => (prev + 1) % SHRINE_PHOTOS.length);
    setZoomLevel(1);
  };

  const handlePrevPhoto = () => {
    soundEffects.playClick();
    setActivePhotoIdx((prev) => (prev - 1 + SHRINE_PHOTOS.length) % SHRINE_PHOTOS.length);
    setZoomLevel(1);
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* Article Header Card */}
      <section className="bg-white border-2 border-amber-600/50 rounded-2xl p-5 sm:p-8 lg:p-10 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-800 via-amber-500 to-red-800 rounded-t-2xl" />

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs sm:text-sm uppercase tracking-wider font-bold px-3 py-1 bg-red-100 text-red-900 border border-red-300 rounded-full">
            Grade 6 Reading & Audio
          </span>
          <span className="text-xs sm:text-sm font-semibold px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-700" />
            680 Bach Dang Street, Hanoi
          </span>
          <span className="text-xs sm:text-sm font-semibold px-3 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-full flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Built 1160 • Relocated 1819
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
          {readingContent.title}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 mt-2 font-medium">
          {readingContent.subtitle}
        </p>

        {/* Text-To-Speech Player Controls with Voice Switcher (Feature 2) */}
        <div className="mt-6 pt-5 border-t border-slate-200 bg-amber-50/70 rounded-xl p-4 sm:p-5 border border-amber-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-800 text-amber-200 flex items-center justify-center font-bold shadow shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Audio Read-Aloud Feature</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-semibold">
                    English Voice Selector
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Luyện nghe phát âm tiếng Anh chuẩn sư phạm cho học sinh lớp 6
                </div>
              </div>
            </div>

            {/* Playback Controls & Voice Selector */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {!hasClaimedReadingPoints ? (
                <button
                  onClick={handleClaimReadingBonus}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl btn-3d-yellow font-black text-xs sm:text-sm shadow-md transition cursor-pointer"
                  title="Nhận điểm khi đọc bài"
                >
                  <Sparkles className="w-4 h-4 text-amber-950" />
                  <span>Nhận +10 Điểm Đọc ⭐</span>
                </button>
              ) : (
                <span className="text-xs font-black text-emerald-900 bg-emerald-100 border-2 border-emerald-300 px-3.5 py-2 rounded-2xl flex items-center gap-1 shadow-xs">
                  ✓ Đã nhận +10 điểm đọc bài! 🎉
                </span>
              )}

              {/* Toggle Voice Settings Button */}
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setShowVoiceSettings((prev) => !prev);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl btn-3d-blue font-black text-xs sm:text-sm shadow-md transition cursor-pointer"
                title="Thay đổi giọng đọc tiếng Anh"
              >
                <Sliders className="w-4 h-4 text-white" />
                <span>Đổi giọng đọc 🗣️</span>
              </button>

              {!isPlaying || isPaused ? (
                <button
                  onClick={handlePlayFullArticle}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl btn-3d-green text-white text-xs sm:text-sm font-black shadow-lg transition cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isPaused ? 'Tiếp tục nghe 🎧' : 'Đọc Toàn Bài (Storytelling) 🎙️'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl btn-3d-orange text-white text-xs sm:text-sm font-black shadow-lg transition cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Tạm dừng ⏸️</span>
                </button>
              )}

              {isPlaying && (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl btn-3d-red text-white text-xs font-black shadow-md transition cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Dừng ⏹️</span>
                </button>
              )}

              {/* Speed Buttons */}
              <div className="flex rounded-xl overflow-hidden border border-slate-300 bg-white text-xs font-semibold shadow-xs">
                <button
                  onClick={() => handleSpeedChange(0.8)}
                  className={`px-2.5 py-1.5 transition ${
                    readingSpeed === 0.8
                      ? 'bg-red-800 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Slow reading (0.8x)"
                >
                  0.8x
                </button>
                <button
                  onClick={() => handleSpeedChange(1.0)}
                  className={`px-2.5 py-1.5 border-l border-r border-slate-300 transition ${
                    readingSpeed === 1.0
                      ? 'bg-red-800 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Normal reading speed"
                >
                  1.0x
                </button>
                <button
                  onClick={() => handleSpeedChange(1.2)}
                  className={`px-2.5 py-1.5 transition ${
                    readingSpeed === 1.2
                      ? 'bg-red-800 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Faster reading speed"
                >
                  1.2x
                </button>
              </div>
            </div>
          </div>

          {/* Voice Selector Settings Drawer */}
          {showVoiceSettings && (
            <div className="mt-4 pt-4 border-t border-amber-200/80 bg-white/80 rounded-xl p-4 animate-in fade-in space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Chọn giọng đọc tiếng Anh (Select English Voice):
                  </label>
                  <select
                    value={selectedVoiceURI}
                    onChange={(e) => handleVoiceChange(e.target.value)}
                    className="w-full sm:max-w-md px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 font-medium outline-none focus:border-amber-500"
                  >
                    {availableVoices.length > 0 ? (
                      availableVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))
                    ) : (
                      <option value="">Default English Voice (Trình duyệt mặc định)</option>
                    )}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestVoice}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-900 border border-red-300 text-xs font-bold transition cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Thử giọng mẫu (Test Voice)</span>
                  </button>
                  <button
                    onClick={() => setShowVoiceSettings(false)}
                    className="px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}

          {isPlaying && (
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-red-900 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span>
                {isPaused
                  ? 'Audio paused'
                  : `Currently reading aloud ${
                      activeSectionId === 'all' ? 'the full article' : 'section'
                    }...`}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 2-Column Split: LEFT COLUMN (Photo Gallery with Zoom) + RIGHT COLUMN (Reading Text) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: 5 Photos with Zoom Feature (Feature 1) */}
        <aside className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border-2 border-amber-500/60 shadow-lg p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                  Hình ảnh Di tích (Shrine Gallery)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-bold">
                {activePhotoIdx + 1} / {SHRINE_PHOTOS.length}
              </span>
            </div>

            {/* Featured Photo with Zoom Overlay Button */}
            <div className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 shadow-md border border-slate-200">
              <img
                src={activePhoto.src}
                alt={activePhoto.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                onClick={() => openZoomModal()}
              />

              {/* Zoom Trigger Button Overlay */}
              <button
                onClick={() => openZoomModal()}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-red-800 text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-lg transition transform active:scale-95 cursor-pointer"
                title="Nhấn để phóng to ảnh quan sát chi tiết"
              >
                <ZoomIn className="w-4 h-4 text-amber-300" />
                <span>Phóng to (Zoom)</span>
              </button>

              {/* Prev / Next overlay arrows */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevPhoto();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white transition backdrop-blur-sm cursor-pointer"
                title="Ảnh trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextPhoto();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white transition backdrop-blur-sm cursor-pointer"
                title="Ảnh sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Caption */}
            <div className="mt-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1">
              <div className="font-extrabold text-sm text-red-900 flex items-center gap-1.5">
                <span>{activePhoto.titleVi}</span>
                <span className="text-xs font-normal text-slate-500">({activePhoto.title})</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activePhoto.captionVi}
              </p>
              <p className="text-[11px] text-slate-500 italic">
                "{activePhoto.caption}"
              </p>
            </div>

            {/* 5 Thumbnails Grid */}
            <div className="mt-3 grid grid-cols-5 gap-2">
              {SHRINE_PHOTOS.map((photo, idx) => {
                const isActive = activePhotoIdx === idx;
                return (
                  <button
                    key={photo.id}
                    onClick={() => {
                      soundEffects.playClick();
                      setActivePhotoIdx(idx);
                    }}
                    className={`relative rounded-lg overflow-hidden aspect-[4/3] border-2 transition cursor-pointer ${
                      isActive
                        ? 'border-red-700 ring-2 ring-amber-400 shadow-md scale-105'
                        : 'border-slate-300 opacity-70 hover:opacity-100 hover:border-amber-400'
                    }`}
                  >
                    <img src={photo.src} alt={photo.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 bg-slate-950/80 text-white text-[9px] font-bold px-1 rounded-tl">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Reading Text Sections */}
        <div className="lg:col-span-7 space-y-6">
          {readingContent.sections.map((section, idx) => {
            const isSectionActive = activeSectionId === section.id;
            return (
              <article
                key={section.id}
                className={`bg-white rounded-2xl border transition-all p-5 sm:p-7 lg:p-8 shadow-sm ${
                  isSectionActive
                    ? 'border-2 border-red-600 ring-4 ring-red-100'
                    : 'border-slate-200 hover:border-amber-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-red-800 text-amber-300 text-xs sm:text-sm flex items-center justify-center font-bold shadow-xs">
                      {idx + 1}
                    </span>
                    <span>{section.title}</span>
                  </h3>

                  <button
                    onClick={() => handlePlaySection(section.id)}
                    className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Listen to Section</span>
                  </button>
                </div>

                <div className="space-y-4 text-slate-800 text-base sm:text-lg lg:text-xl leading-relaxed font-normal">
                  {section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="indent-3 sm:indent-6">
                      {p}
                    </p>
                  ))}
                </div>
              </article>
            );
          })}

          {/* Grade 6 Vocabulary Bank */}
          <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border-2 border-amber-500 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg sm:text-xl font-bold text-amber-300">
                  Grade 6 Vocabulary Helper
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Click any word to hear pronunciation & definition
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {readingContent.vocabulary.map((vocab) => {
                const isSelected = selectedVocab?.id === vocab.id;
                return (
                  <button
                    key={vocab.id}
                    onClick={() => {
                      setSelectedVocab(vocab);
                      handlePronounceWord(vocab.word);
                    }}
                    className={`p-3 rounded-xl text-left transition border cursor-pointer ${
                      isSelected
                        ? 'bg-red-900 border-amber-400 text-white'
                        : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-amber-300">
                        {vocab.word}
                      </span>
                      <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-[11px] text-slate-400 italic">
                      {vocab.partOfSpeech}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedVocab && (
              <div className="mt-4 p-4 rounded-xl bg-slate-800 border border-amber-500/50 text-xs sm:text-sm animate-in fade-in">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-amber-300 text-base">
                    {selectedVocab.word}
                  </span>
                  <span className="text-slate-400 italic">
                    ({selectedVocab.partOfSpeech})
                  </span>
                </div>
                <p className="text-slate-200 mt-1">
                  <strong className="text-amber-200">Meaning: </strong>
                  {selectedVocab.definition}
                </p>
                <p className="text-slate-300 mt-1 italic">
                  <span className="text-slate-400 not-italic font-bold">Example: </span>
                  "{selectedVocab.example}"
                </p>
              </div>
            )}
          </section>

          {/* Attribution & Source */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Source Attribution: </span>
              {readingContent.sourceAttribution}
            </div>
          </div>

          {/* Transition to Interactive Quiz (Module 1) */}
          <div className="bg-gradient-to-r from-red-900 via-slate-900 to-red-900 text-white rounded-2xl p-6 sm:p-8 text-center border-2 border-amber-500 shadow-md">
            <h4 className="text-xl sm:text-2xl font-extrabold text-amber-300">
              Ready to Check Your Understanding?
            </h4>
            <p className="text-sm text-slate-200 max-w-xl mx-auto mt-2">
              Test what you learned in the reading with our 5-question comprehension quiz.
              You get one retry for each question!
            </p>
            <button
              onClick={() => {
                soundEffects.playClick();
                onStartQuiz();
              }}
              className="mt-5 inline-flex items-center gap-2 px-8 py-3.5 btn-3d-yellow text-amber-950 font-black text-sm sm:text-base rounded-2xl shadow-xl transition cursor-pointer"
            >
              <span>Vào Làm Bài Đố Vui (Interactive Quiz) 🎯</span>
              <ArrowRight className="w-5 h-5 text-amber-950" />
            </button>
          </div>
        </div>
      </div>

      {/* FULLSCREEN IMAGE ZOOM MODAL (Feature 1: Chế độ Zoom quan sát) */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl max-h-[96vh] flex flex-col bg-slate-900 border-2 border-amber-500/70 rounded-2xl shadow-2xl overflow-hidden text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/90">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  {activePhotoIdx + 1} / {SHRINE_PHOTOS.length}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-md">
                  {activePhoto.titleVi}
                </h3>
              </div>

              {/* Zoom and Close Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                  disabled={zoomLevel <= 1}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white"
                  title="Thu nhỏ (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-amber-300 w-12 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                  disabled={zoomLevel >= 3}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white"
                  title="Phóng to (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
                  title="Đặt lại kích thước (100%)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={closeZoomModal}
                  className="p-1.5 rounded-lg bg-red-900 hover:bg-red-800 text-white ml-2"
                  title="Đóng (Close)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Viewport */}
            <div className="relative flex-1 overflow-auto flex items-center justify-center p-4 bg-black/60 min-h-[400px]">
              <img
                src={activePhoto.src}
                alt={activePhoto.title}
                style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
                className="max-h-[70vh] max-w-full object-contain shadow-2xl rounded-lg origin-center"
              />

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-red-900 text-white border border-slate-700 shadow-xl transition cursor-pointer"
                title="Ảnh trước"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-red-900 text-white border border-slate-700 shadow-xl transition cursor-pointer"
                title="Ảnh sau"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Caption Footer */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/90 text-xs sm:text-sm">
              <div className="font-bold text-amber-300">
                {activePhoto.titleVi} - <span className="font-normal text-slate-300">{activePhoto.title}</span>
              </div>
              <p className="text-slate-300 mt-0.5">{activePhoto.captionVi}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
