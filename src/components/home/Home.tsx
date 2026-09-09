import { useEffect, useState, useRef, useMemo } from 'react';
import { getDailyContent } from '../../lib/content';
import { AyahEntry, GemEntry } from '../../types/content';
import { Link } from 'react-router-dom';
import { Settings, Share2, ChevronDown, Download, Image as ImageIcon, Type, Bookmark, Play, Pause, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../lib/store';
import { toBlob } from 'html-to-image';

export function Home() {
  const [ayah, setAyah] = useState<AyahEntry | null>(null);
  const [gem, setGem] = useState<GemEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [tadabburExpanded, setTadabburExpanded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const completedSessions = useAppStore(state => state.completedSessions);
  const frequency = useAppStore(state => state.frequency);
  const toggleBookmark = useAppStore(state => state.toggleBookmark);
  const bookmarks = useAppStore(state => state.bookmarks);
  const isBookmarked = ayah ? bookmarks.some(b => b.ayahId === ayah.id) : false;
  const todayStr = new Date().toISOString().split('T')[0];
  const isCompletedToday = ayah && completedSessions[todayStr] === ayah.id;

  const streak = useMemo(() => {
    const dates = Object.keys(completedSessions).sort().reverse();
    if (dates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const format = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const todayFormatted = format(today);
    const yesterdayFormatted = format(yesterday);

    let currentStreak = 0;
    let currentDate = new Date(today);

    if (!completedSessions[todayFormatted] && !completedSessions[yesterdayFormatted]) {
      return 0;
    }

    if (!completedSessions[todayFormatted]) {
      currentDate = yesterday;
    }

    while (true) {
      const dateStr = format(currentDate);
      if (completedSessions[dateStr]) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  }, [completedSessions]);

  const ayahRef = useRef<HTMLDivElement>(null);
  const [showAyahShareMenu, setShowAyahShareMenu] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [showGuidedReflection, setShowGuidedReflection] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    getDailyContent().then((data) => {
      setAyah(data.ayah);
      setGem(data.gem);
      setLoading(false);
    });
  }, [frequency]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [ayah]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  if (!ayah) return <div className="p-4 text-center">لا توجد آيات متوفرة اليوم.</div>;

  const handleShareAyahText = async () => {
    if (!ayah || isSharing) return;
    setIsSharing(true);
    setShowAyahShareMenu(false);
    const text = `${ayah.ayah.textUthmani}\n\n— سورة ${ayah.ayah.surahName}: ${ayah.ayah.ayahNumber}\nتطبيق «تدبُّر»`;
    
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        alert('تم نسخ النص');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError' && (error as Error).message !== 'Share canceled') {
        console.error(error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareAyahImage = async () => {
    if (!ayah || !ayahRef.current || isSharing) return;
    setIsSharing(true);
    setShowAyahShareMenu(false);
    
    try {
      // Temporarily hide any share buttons in the ref if they exist
      const blob = await toBlob(ayahRef.current, { 
        quality: 1, 
        pixelRatio: 2,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0a100d' : '#F1EDE0',
        filter: (node) => {
          if (node instanceof HTMLElement && node.dataset.hideOnShare === 'true') {
            return false;
          }
          return true;
        }
      });
      if (!blob) throw new Error('Failed to generate image');

      const file = new File([blob], `ayah-${ayah.ayah.surahName}-${ayah.ayah.ayahNumber}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `سورة ${ayah.ayah.surahName}`,
          text: 'آية اليوم من تطبيق «تدبُّر»'
        });
      } else {
        // Fallback for browsers that don't support file sharing
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ayah-${ayah.ayah.surahName}-${ayah.ayah.ayahNumber}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      alert('عذراً، حدث خطأ أثناء إنشاء الصورة.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareGem = async () => {
    if (!gem || isSharing) return;
    setIsSharing(true);
    const authorText = gem.attribution.author ? `${gem.attribution.author} — ` : '';
    const text = `${gem.text}\n\n— المصدر: ${authorText}${gem.attribution.source}\nتطبيق «تدبُّر»`;
    
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        alert('تم نسخ النص');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError' && (error as Error).message !== 'Share canceled') {
        console.error(error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareShahid = async (shahid: any) => {
    if (isSharing) return;
    setIsSharing(true);
    const authorText = shahid.author ? `${shahid.author} — ` : '';
    const text = `${shahid.text}\n\n— المصدر: ${authorText}${shahid.source}\nتطبيق «تدبُّر»`;
    
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        alert('تم نسخ النص');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError' && (error as Error).message !== 'Share canceled') {
        console.error(error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Date formatting (Gregorian and placeholder for Hijri)
  const today = new Date();
  const dateStr = today.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }) + 'م';
  const hijriStr = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(today);

  // Rendering guards for Gem (Rule 8)
  const isGemValid = gem && gem.text && gem.attribution?.source && !gem.text.includes('[') && !gem.text.includes('…');

  const validGharib = ayah?.gharib?.filter(g => g.meaning && g.source && !g.meaning.includes('[') && !g.meaning.includes('…')) || [];
  const validTafsir = ayah?.tafsir?.text && ayah.tafsir.source && !ayah.tafsir.text.includes('[') && !ayah.tafsir.text.includes('…');
  const validShawahid = ayah?.shawahid?.filter(s => s.text && s.source && !s.text.includes('[') && !s.text.includes('…')) || [];
  const hasTadabburContent = validGharib.length > 0 || validTafsir || validShawahid.length > 0;

  const surahStr = String(ayah.ayah.surahNumber).padStart(3, '0');
  const ayahStr = String(ayah.ayah.ayahNumber).padStart(3, '0');
  const audioUrl = ayah.audio?.asset || `https://everyayah.com/data/Alafasy_128kbps/${surahStr}${ayahStr}.mp3`;

  return (
    <div className="flex flex-col p-4 max-w-xl mx-auto gap-4">
      <audio ref={audioRef} src={audioUrl} preload="none" />
      
      {/* 1) Header card */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-primary">السلام عليكم</h1>
          <p className="text-[13px] text-textSecondary">{hijriStr} — {dateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-quranBg rounded-full text-textSecondary font-medium text-sm">
            <Flame size={16} className={streak > 0 ? 'text-accent fill-accent/20' : ''} />
            <span className={streak > 0 ? 'text-primary font-bold' : ''} dir="ltr">{streak}</span>
          </div>
          <Link to="/settings" className="w-11 h-11 rounded-full bg-quranBg flex items-center justify-center text-primary hover:bg-accent/10 transition-colors">
            <Settings size={20} />
          </Link>
        </div>
      </div>

      {/* 2) Pinned Ma'aisha card (if completed) */}
      {isCompletedToday && ayah.live && (
        <div className="bg-surface rounded-[24px] p-5 shadow-sm border border-accent/20">
          <h3 className="text-primary font-semibold text-lg mb-2">عايِش الآية اليوم</h3>
          <p className="text-textPrimary">{ayah.live.action}</p>
          <div className="mt-4 flex items-center gap-2 text-success">
            <span className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center text-xs">✓</span>
            <span className="text-sm font-medium">تمت المعايشة اليوم</span>
          </div>
        </div>
      )}

      {/* 3) Ilham al-Yawm */}
      {isGemValid && gem && (
        <div className="bg-surface rounded-[24px] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
              <span className="text-[14px] font-semibold text-primary">إلهام اليوم</span>
            </div>
            <button onClick={handleShareGem} className="w-10 h-10 rounded-full bg-quranBg flex items-center justify-center text-textSecondary hover:text-primary transition-colors">
              <Share2 size={18} />
            </button>
          </div>
          
          <div className="text-center">
            <div className="inline-block px-3 py-1 bg-quranBg rounded-full text-[12px] text-primary mb-4">
              {gem.type === 'ayah' ? 'آية كريمة' : gem.type === 'hadith' ? 'حديث شريف' : gem.type === 'athar' ? 'أثر' : 'من أقوال العلماء'}
            </div>
            
            {gem.type === 'ayah' ? (
              <div className="bg-quranBg rounded-[20px] p-4 md:p-6 mb-4">
                <p className="font-quran text-[20px] md:text-[22px] leading-[2] md:leading-loose text-primary text-center">
                  {gem.text}
                </p>
              </div>
            ) : (
              <p className="font-semibold text-[17px] md:text-[19px] leading-[1.8] md:leading-[1.9] text-primary mb-4 text-center">
                {gem.text}
              </p>
            )}
            
            <p className="text-[13px] text-textSecondary text-center">
              {gem.attribution.author ? `${gem.attribution.author} — ` : ''}{gem.attribution.source}
            </p>
          </div>
        </div>
      )}

      {/* 4) Divider */}
      <div className="flex items-center gap-4 my-2">
        <div className="flex-1 h-px bg-accent/30"></div>
        <span className="text-accent text-[14px] font-semibold">آية اليوم</span>
        <div className="flex-1 h-px bg-accent/30"></div>
      </div>

      {/* 5) Ayah Hero Card */}
      <div className="bg-surface rounded-[24px] shadow-sm relative group overflow-visible">
        {/* The captured area */}
        <div ref={ayahRef} className="p-5 text-center bg-surface rounded-[24px]">
          <div className="inline-block px-3 py-1 bg-quranBg rounded-full text-[13px] text-primary mb-6">
            {ayah.themeLabel}
          </div>
          
          <div className="bg-quranBg rounded-[20px] p-4 md:p-6 mb-4">
            <p className="font-quran text-[24px] md:text-[28px] leading-[2] md:leading-loose text-primary text-center" dir="rtl">
              {ayah.ayah.textUthmani}
            </p>
          </div>
          
          <p className="text-[13px] text-textSecondary text-center">
            سورة {ayah.ayah.surahName}: {ayah.ayah.ayahNumber}
          </p>

          {validTafsir && (
            <div className="mt-4 flex flex-col items-center">
              <button 
                onClick={() => setShowTafsir(!showTafsir)}
                className="text-[13px] text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                data-hide-on-share="true"
              >
                {showTafsir ? 'إخفاء التفسير' : 'إظهار التفسير'}
                <ChevronDown className={cn("w-4 h-4 transition-transform", showTafsir && "rotate-180")} />
              </button>
              
              <AnimatePresence>
                {showTafsir && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-3"
                  >
                    <p className="text-[15px] leading-[1.8] text-textPrimary">{ayah.tafsir.text}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Actions (Share & Bookmark & Audio) */}
        <div className="absolute top-4 left-4 flex gap-2" dir="ltr" data-hide-on-share="true">
          <button 
            onClick={toggleAudio}
            className="w-8 h-8 rounded-full bg-quranBg flex items-center justify-center text-textSecondary hover:text-primary hover:bg-accent/10 transition-colors"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowAyahShareMenu(!showAyahShareMenu)}
              className="w-8 h-8 rounded-full bg-quranBg flex items-center justify-center text-textSecondary hover:text-primary hover:bg-accent/10 transition-colors"
            >
              <Share2 size={16} />
            </button>
            
            <AnimatePresence>
              {showAyahShareMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-10 left-0 bg-surface border border-accent/20 rounded-xl shadow-lg overflow-hidden min-w-[140px] z-20"
                  dir="rtl"
                >
                  <button 
                    onClick={handleShareAyahImage}
                    disabled={isSharing}
                    className="w-full flex items-center gap-2 px-4 py-3 text-[14px] text-primary hover:bg-quranBg transition-colors disabled:opacity-50 text-right"
                  >
                    <ImageIcon size={16} className="text-accent" />
                    <span>مشاركة كصورة</span>
                  </button>
                  <div className="h-px w-full bg-accent/10"></div>
                  <button 
                    onClick={handleShareAyahText}
                    disabled={isSharing}
                    className="w-full flex items-center gap-2 px-4 py-3 text-[14px] text-primary hover:bg-quranBg transition-colors disabled:opacity-50 text-right"
                  >
                    <Type size={16} className="text-accent" />
                    <span>مشاركة كنص</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => ayah && toggleBookmark(ayah.id, `سورة ${ayah.ayah.surahName}: ${ayah.ayah.ayahNumber}`, ayah.ayah.textUthmani)}
            className={cn(
              "w-8 h-8 rounded-full bg-quranBg flex items-center justify-center transition-colors",
              isBookmarked ? "text-accent hover:bg-accent/10" : "text-textSecondary hover:text-primary hover:bg-accent/10"
            )}
          >
            <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* 5.5) Guided Reflection */}
      {ayah.ponder && ayah.ponder.length > 0 && (
        <div className="bg-surface rounded-[24px] overflow-hidden shadow-sm">
          <button 
            onClick={() => setShowGuidedReflection(!showGuidedReflection)}
            className="w-full flex items-center justify-between p-5 bg-surface hover:bg-surface/80 transition-colors"
          >
            <h2 className="text-[16px] font-semibold text-primary flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
              تأملات موجهة
            </h2>
            <ChevronDown className={cn("text-textSecondary transition-transform duration-300", showGuidedReflection && "rotate-180")} />
          </button>
          <AnimatePresence>
            {showGuidedReflection && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-5 pb-5 pt-1"
              >
                <div className="space-y-3">
                  {ayah.ponder.slice(0, 3).map((question, index) => (
                    <div key={index} className="flex gap-3 bg-quranBg rounded-[16px] p-4">
                      <span className="text-accent font-bold text-lg opacity-50 mt-[-2px]">{index + 1}</span>
                      <p className="text-[15px] leading-[1.7] text-textPrimary">{question}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 6) Tadabbur Expandable */}
      {hasTadabburContent && (
        <div className="bg-surface rounded-[24px] overflow-hidden shadow-sm">
          <button 
            onClick={() => setTadabburExpanded(!tadabburExpanded)}
            className="w-full p-5 flex items-center justify-between"
          >
            <span className="text-[16px] font-semibold text-primary">تدبَّر الآية</span>
            <ChevronDown className={cn("text-primary transition-transform duration-300", tadabburExpanded && "rotate-180")} />
          </button>
          
          <AnimatePresence>
            {tadabburExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-5 pb-5 space-y-6"
              >
                {/* Gharib */}
                {validGharib.length > 0 && (
                  <div>
                    {validGharib.map((g, i) => (
                      <div key={i} className="mb-2">
                        <span className="font-semibold text-accent">{g.word}</span>{' — '}
                        <span className="text-[16px] text-textPrimary">{g.meaning}</span>
                      </div>
                    ))}
                    <p className="text-[13px] text-textSecondary mt-2">
                      المعاني: {Array.from(new Set(validGharib.map(g => g.source))).join('، ')}
                    </p>
                  </div>
                )}
                
                {/* Tafsir */}
                {validTafsir && (
                  <div>
                    <div className="bg-quranBg rounded-[16px] p-4 mb-2">
                      <p className="text-[17px] leading-[1.9] text-textPrimary">{ayah.tafsir.text}</p>
                    </div>
                    <p className="text-[13px] text-textSecondary">{ayah.tafsir.source}</p>
                  </div>
                )}
                
                {/* Shawahid */}
                {validShawahid.length > 0 && (
                  <div className="space-y-4">
                    {validShawahid.map((shahid, i) => (
                      <div key={i} className="text-center pt-4 border-t border-accent/10">
                        <p className="font-semibold text-[18px] leading-[1.9] text-textPrimary mb-2">
                          {shahid.text}
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-[13px] text-textSecondary">
                            {shahid.author ? `${shahid.author} — ` : ''}{shahid.source}
                          </p>
                          <button onClick={() => handleShareShahid(shahid)} className="text-accent p-1">
                            <Share2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 7) CTA */}
      <div className="pt-4 pb-6">
        {isCompletedToday ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-accent">
              <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-xs">✓</span>
              <span className="font-semibold">تدبّرتَ آيةَ اليوم</span>
            </div>
            <Link 
              to="/session/today"
              className="flex items-center justify-center w-full h-[56px] rounded-full border border-accent text-primary text-[17px] font-semibold hover:bg-accent/5 transition-colors"
            >
              أعد الرحلة
            </Link>
          </div>
        ) : (
          <Link 
            to="/session/today"
            className="flex items-center justify-center w-full h-[56px] rounded-full bg-accent text-[#1E2A26] text-[17px] font-semibold hover:bg-accent/90 transition-colors"
          >
            ابدأ رحلة التدبُّر
          </Link>
        )}
      </div>

    </div>
  );
}
