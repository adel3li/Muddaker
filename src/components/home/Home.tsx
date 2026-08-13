import { useEffect, useState } from 'react';
import { getDailyContent } from '../../lib/content';
import { AyahEntry, GemEntry } from '../../types/content';
import { Link } from 'react-router-dom';
import { Settings, Share2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../lib/store';

export function Home() {
  const [ayah, setAyah] = useState<AyahEntry | null>(null);
  const [gem, setGem] = useState<GemEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [tadabburExpanded, setTadabburExpanded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const completedSessions = useAppStore(state => state.completedSessions);
  const frequency = useAppStore(state => state.frequency);
  const todayStr = new Date().toISOString().split('T')[0];
  const isCompletedToday = ayah && completedSessions[todayStr] === ayah.id;

  useEffect(() => {
    getDailyContent().then((data) => {
      setAyah(data.ayah);
      setGem(data.gem);
      setLoading(false);
    });
  }, [frequency]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  if (!ayah) return <div className="p-4 text-center">لا توجد آيات متوفرة اليوم.</div>;

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
  const hasTadabburContent = validGharib.length > 0 || validTafsir || validShawahid.length > 0 || (ayah?.ponder && ayah.ponder.length > 0);

  return (
    <div className="flex flex-col p-4 max-w-xl mx-auto gap-4">
      {/* 1) Header card */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-primary">السلام عليكم</h1>
          <p className="text-[13px] text-textSecondary">{hijriStr} — {dateStr}</p>
        </div>
        <Link to="/settings" className="w-11 h-11 rounded-full bg-quranBg flex items-center justify-center text-primary">
          <Settings size={20} />
        </Link>
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
      <div className="bg-surface rounded-[24px] p-5 shadow-sm text-center">
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
      </div>

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
                
                {/* Ponder 0 */}
                {ayah.ponder && ayah.ponder.length > 0 && (
                  <div className="pt-4 border-t border-accent/10">
                    <span className="text-accent text-sm font-medium mb-2 block">للتدبُّر</span>
                    <p className="text-[16px] text-textSecondary">{ayah.ponder[0]}</p>
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
