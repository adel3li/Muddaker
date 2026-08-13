import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyContent } from '../../lib/content';
import { AyahEntry } from '../../types/content';
import { useAppStore } from '../../lib/store';
import { X, Bookmark } from 'lucide-react';

type Station = 'sukun' | 'tilawa' | 'fahm' | 'tadabbur' | 'maaisha' | 'khatam';

const toArabicNumeral = (n: number) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d as any]);

export function Session() {
  const [ayah, setAyah] = useState<AyahEntry | null>(null);
  const [station, setStation] = useState<Station>('sukun');
  const [ponderIndex, setPonderIndex] = useState(0);
  const [journalText, setJournalText] = useState('');
  
  const navigate = useNavigate();
  const markCompleted = useAppStore(s => s.markSessionCompleted);
  const addJournalEntry = useAppStore(s => s.addJournalEntry);
  const toggleBookmark = useAppStore(s => s.toggleBookmark);
  const bookmarks = useAppStore(s => s.bookmarks);

  const isBookmarked = ayah ? bookmarks.some(b => b.ayahId === ayah.id) : false;

  const handleBookmarkToggle = () => {
    if (!ayah) return;
    toggleBookmark(
      ayah.id,
      `${ayah.ayah.surahName} ${ayah.ayah.ayahNumber}`,
      ayah.ayah.textUthmani
    );
  };

  useEffect(() => {
    getDailyContent().then(res => setAyah(res.ayah));
  }, []);

  // Timers (tunable constants per spec)
  useEffect(() => {
    if (!ayah) return;
    
    let timer: NodeJS.Timeout;
    
    const advanceStation = () => {
      switch (station) {
        case 'sukun': setStation('tilawa'); break;
        case 'tilawa': setStation('fahm'); break;
        case 'fahm': setStation('tadabbur'); break;
        case 'tadabbur': 
          if (ponderIndex < ayah.ponder.length - 1) {
            setPonderIndex(p => p + 1);
          } else {
            setStation('maaisha');
          }
          break;
        case 'maaisha': setStation('khatam'); break;
        case 'khatam': break; // Manual exit
      }
    };

    let duration = 0;
    switch (station) {
      case 'sukun': duration = 15000; break; // 15s
      case 'tilawa': duration = 30000; break; // 30s
      case 'fahm': duration = 40000; break; // 40s
      case 'tadabbur': duration = 35000; break; // 35s per question
      case 'maaisha': duration = 20000; break; // 20s
    }

    if (duration > 0) {
      timer = setTimeout(advanceStation, duration);
    }

    return () => clearTimeout(timer);
  }, [station, ponderIndex, ayah]);

  if (!ayah) return null;

  const handleComplete = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    markCompleted(todayStr, ayah.id);
    
    if (journalText.trim()) {
      addJournalEntry({
        ayahId: ayah.id,
        ayahReference: `${ayah.ayah.surahName} ${ayah.ayah.ayahNumber}`,
        text: journalText.trim(),
        dateStr: todayStr
      });
    }
    
    navigate('/');
  };

  const skipStation = () => {
    switch (station) {
      case 'sukun': setStation('tilawa'); break;
      case 'tilawa': setStation('fahm'); break;
      case 'fahm': setStation('tadabbur'); break;
      case 'tadabbur': 
        if (ponderIndex < ayah.ponder.length - 1) setPonderIndex(p => p + 1);
        else setStation('maaisha');
        break;
      case 'maaisha': setStation('khatam'); break;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0E1A17] text-[#F1EDE0] z-50 font-sans" dir="rtl">
      {/* Background drift effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1B2721] to-[#0E1A17] opacity-80 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: station === 'sukun' ? 0.05 : station === 'tilawa' ? 0.08 : 0.03
          }}
          transition={{
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 1, ease: "easeInOut" }
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-[#CBAC6F] rounded-full blur-[100px]"
        />
      </div>
      
      {/* Top Bar */}
      <div className="absolute top-0 w-full px-4 md:px-8 py-4 md:py-5 pt-[calc(env(safe-area-inset-top)+1rem)] flex justify-between items-center z-20 bg-[#0E1A17]/80 backdrop-blur-md border-b border-white/5 pointer-events-none">
        <button onClick={() => navigate('/')} className="text-[#A7B2AB] hover:text-[#F1EDE0] transition-colors p-2 text-sm md:text-lg pointer-events-auto">
          خروج
        </button>
        
        {/* Progress Bar in Center */}
        {station !== 'khatam' && (
          <div className="w-32 sm:w-48 md:w-64 h-[2px] bg-[#1A2620] relative overflow-hidden rounded-full pointer-events-auto" dir="ltr">
            <motion.div 
              className="absolute top-0 right-0 h-full bg-[#CBAC6F]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ 
                duration: station === 'sukun' ? 15 : station === 'tilawa' ? 30 : station === 'fahm' ? 40 : station === 'tadabbur' ? 35 : 20, 
                ease: "linear" 
              }}
              key={station + ponderIndex}
            />
          </div>
        )}

        <div className="flex items-center gap-2 pointer-events-auto">
          {station !== 'khatam' ? (
            <button onClick={skipStation} className="text-[#CBAC6F] text-sm md:text-lg p-2 hover:opacity-80 transition-opacity">التالي</button>
          ) : <div className="w-10 md:w-12"></div>}
        </div>
      </div>

      {/* Content Scroll Container */}
      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden z-10 w-full flex flex-col">
        <div className="w-full my-auto flex flex-col items-center justify-center py-28 md:py-32 shrink-0 min-h-max">
          <AnimatePresence mode="wait">
            {/* 1. Sukun */}
        {station === 'sukun' && (
          <motion.div 
            key="sukun"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center z-10"
          >
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 rounded-full border border-[#CBAC6F]/30 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(203,172,111,0.1)]"
            >
              <div className="w-16 h-16 rounded-full bg-[#CBAC6F]/10"></div>
            </motion.div>
            <p className="text-lg md:text-xl font-medium tracking-wide text-center px-4">تهيّأ… أنت على موعدٍ مع كلامِ الله</p>
          </motion.div>
        )}

        {/* 2. Tilawa */}
        {station === 'tilawa' && (
          <motion.div 
            key="tilawa"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="w-full max-w-3xl px-6 z-10 text-center"
          >
            <motion.p 
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="font-quran text-[36px] md:text-[46px] leading-[2.2] text-[#F1EDE0]"
              dir="rtl"
            >
              <span className="text-[#A7B2AB] mx-2">﴿</span>
              {ayah.ayah.textUthmani}
              <span className="text-[#A7B2AB] mx-2">﴾</span>
            </motion.p>
          </motion.div>
        )}

        {/* 3. Fahm */}
        {station === 'fahm' && (
          <motion.div 
            key="fahm"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.8, staggerChildren: 0.2, delayChildren: 0.1 } },
              exit: { opacity: 0, transition: { duration: 0.8 } }
            }}
            className="w-full max-w-2xl px-6 z-10 flex flex-col gap-8 items-center"
          >
            {ayah.gharib?.length > 0 && (
              <motion.div 
                className="flex flex-col items-center gap-3 justify-center w-full max-w-lg"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
              >
                {ayah.gharib.map((g, i) => (
                  <motion.div 
                    key={i} 
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                    }}
                    className="border border-[#CBAC6F]/30 rounded-2xl md:rounded-full px-5 md:px-6 py-3 md:py-3 text-base md:text-lg text-center leading-relaxed w-fit max-w-full"
                  >
                    <span className="text-[#CBAC6F] font-semibold">{g.word}</span> <span className="text-[#A7B2AB] mx-2">—</span> {g.meaning}
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
              }}
              className="bg-[#142019] rounded-[24px] p-6 md:p-8 text-center border border-[#A7B2AB]/10 w-full mt-4"
            >
              <p className="text-[17px] md:text-[22px] leading-[2] mb-4 md:mb-6 text-[#F1EDE0]">{ayah.tafsir.text}</p>
              <p className="text-[12px] md:text-[14px] text-[#A7B2AB]">التفسير الميسر — مجمع الملك فهد</p>
            </motion.div>
          </motion.div>
        )}

        {/* 4. Tadabbur */}
        {station === 'tadabbur' && (
          <motion.div 
            key={`tadabbur-${ponderIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-2xl px-6 z-10 text-center"
          >
            <span className="text-[#CBAC6F] text-lg md:text-xl mb-6 md:mb-8 block font-medium">
              {toArabicNumeral(ayah.ponder.length)} / {toArabicNumeral(ponderIndex + 1)}
            </span>
            <p className="text-[24px] md:text-[34px] leading-[1.8] font-medium text-[#F1EDE0]">
              {ayah.ponder[ponderIndex]}
            </p>
          </motion.div>
        )}

        {/* 5. Maaisha */}
        {station === 'maaisha' && (
          <motion.div 
            key="maaisha"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-xl px-6 z-10"
          >
            <div className="bg-[#16241F] rounded-[24px] p-8 md:p-10 text-center border border-[#CBAC6F]/20 shadow-xl shadow-[#CBAC6F]/5">
              <motion.h3 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-[#CBAC6F] font-semibold text-xl md:text-2xl mb-4 md:mb-6"
              >
                {ayah.live.title}
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-[18px] md:text-[22px] leading-[1.8] mb-8 md:mb-12 text-[#F1EDE0]"
              >
                {ayah.live.action}
              </motion.p>
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStation('khatam')}
                className="w-full md:w-4/5 mx-auto block py-3 md:py-4 rounded-full bg-[#CBAC6F] text-[#16241F] text-lg md:text-xl font-medium hover:bg-[#E9DFC7] transition-colors"
              >
                سأفعلها اليوم
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* 6. Khatam */}
        {station === 'khatam' && (
          <motion.div 
            key="khatam"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 1.5, staggerChildren: 0.3 } },
              exit: { opacity: 0, transition: { duration: 1.5 } }
            }}
            className="w-full max-w-xl px-6 z-10 flex flex-col items-center"
          >
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 1 } }
              }}
              className="mb-8 md:mb-12 w-full"
            >
              <p className="font-quran text-[28px] md:text-[38px] text-[#CBAC6F] text-center leading-[2]" dir="rtl">
                {typeof ayah.dua === 'string' ? ayah.dua : ayah.dua.text}
              </p>
              {typeof ayah.dua !== 'string' && ayah.dua.source && (
                <p className="text-[13px] md:text-[14px] text-[#A7B2AB] text-center mt-4 md:mt-6">
                  {ayah.dua.source}
                </p>
              )}
            </motion.div>
            
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
              }}
              className="w-full space-y-4 md:space-y-6 bg-[#16241F] p-6 md:p-8 rounded-[24px] border border-[#A7B2AB]/10"
            >
              <p className="text-right text-[#F1EDE0] text-base md:text-lg">{ayah.journalPrompt}</p>
              <textarea
                value={journalText}
                onChange={e => setJournalText(e.target.value)}
                placeholder="...اكتب خاطرتك هنا"
                className="w-full bg-transparent border-none min-h-[100px] text-[#F1EDE0] placeholder:text-[#A7B2AB]/50 focus:outline-none resize-none text-right text-base md:text-lg"
              />
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                className="w-full h-[52px] md:h-[60px] rounded-full bg-[#CBAC6F] text-[#16241F] text-lg md:text-xl font-medium hover:bg-[#E9DFC7] transition-colors mt-2 md:mt-4 mb-12"
              >
                إنهاء
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
