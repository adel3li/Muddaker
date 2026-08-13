import { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Bookmark, CalendarDays, Heart, Play } from 'lucide-react';

export function Onboarding() {
  const [step, setStep] = useState(0);
  const completeOnboarding = useAppStore(s => s.completeOnboarding);
  const setNotification = useAppStore(s => s.setNotification);
  const navigate = useNavigate();

  const handleComplete = () => {
    completeOnboarding();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 text-center z-50 overflow-y-auto">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="step0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center max-w-sm w-full py-10"
          >
            <h1 className="text-[40px] font-semibold text-primary mb-4 font-quran">تدبُّر</h1>
            <p className="text-[18px] text-textSecondary mb-12">آيةٌ واحدة… تعيشها يومًا كاملًا</p>
            <button 
              onClick={() => setStep(1)}
              className="w-full h-[56px] rounded-full bg-accent text-[#1E2A26] text-[17px] font-semibold hover:bg-accent/90 transition-colors"
            >
              ابدأ
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center max-w-sm w-full py-10"
          >
            <div className="bg-quranBg rounded-[24px] p-8 mb-8 w-full">
              <p className="font-quran text-[24px] leading-loose text-primary mb-4" dir="rtl">
                ﴿كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ﴾
              </p>
              <p className="text-[13px] text-textSecondary">سورة ص: ٢٩</p>
            </div>
            
            <h2 className="text-[20px] font-semibold text-primary mb-4">فكرة التطبيق</h2>
            <p className="text-[15px] leading-[1.8] text-textSecondary mb-12">
              تطبيق «تدبُّر» يعرض لك آية يومية تعيش معها بكل جوارحك؛ بدءًا من التلاوة والفهم، وصولًا إلى التدبر والمعايشة العملية في حياتك اليومية.
            </p>
            
            <button 
              onClick={() => setStep(2)}
              className="w-full h-[56px] rounded-full bg-accent text-[#1E2A26] text-[17px] font-semibold hover:bg-accent/90 transition-colors"
            >
              التالي
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center max-w-sm w-full py-10"
          >
            <div className="w-16 h-16 bg-quranBg rounded-full flex items-center justify-center text-accent mb-6">
              <Play fill="currentColor" size={24} />
            </div>
            
            <h2 className="text-[20px] font-semibold text-primary mb-6">رحلة الآية</h2>
            
            <div className="text-right w-full space-y-4 mb-10 text-[15px] text-textSecondary">
              <p><strong className="text-primary font-semibold">١. السكون:</strong> تهيئة قلبك للقاء كلام الله.</p>
              <p><strong className="text-primary font-semibold">٢. التلاوة:</strong> قراءة الآية بتأنٍّ.</p>
              <p><strong className="text-primary font-semibold">٣. الفهم:</strong> التعرف على المعاني الغريبة والتفسير المبسط.</p>
              <p><strong className="text-primary font-semibold">٤. التدبُّر:</strong> تساؤلات تفتح آفاق قلبك.</p>
              <p><strong className="text-primary font-semibold">٥. المعايشة:</strong> تطبيق عملي للآية في يومك.</p>
              <p><strong className="text-primary font-semibold">٦. الختام:</strong> دعاء وتدوين خاطرتك.</p>
            </div>
            
            <button 
              onClick={() => setStep(3)}
              className="w-full h-[56px] rounded-full bg-accent text-[#1E2A26] text-[17px] font-semibold hover:bg-accent/90 transition-colors"
            >
              التالي
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center max-w-sm w-full py-10"
          >
            <div className="w-16 h-16 bg-quranBg rounded-full flex items-center justify-center text-accent mb-6">
              <BookOpen size={28} />
            </div>
            
            <h2 className="text-[20px] font-semibold text-primary mb-6">الخواطر والمحفوظات</h2>
            
            <p className="text-[15px] leading-[1.8] text-textSecondary mb-6">
              في قسم <strong className="text-primary font-semibold">خواطري</strong>، يمكنك تدوين ما لامس قلبك من الآية للرجوع إليه لاحقًا.
            </p>
            
            <div className="flex items-start gap-3 bg-surface p-4 rounded-xl border border-accent/20 mb-10 text-right">
              <Bookmark className="text-accent shrink-0 mt-1" size={20} />
              <p className="text-[14px] text-textSecondary">
                يمكنك الضغط على أيقونة الحفظ أثناء رحلتك مع الآية للاحتفاظ بها في قائمة <strong>المحفوظات</strong>.
              </p>
            </div>
            
            <button 
              onClick={() => setStep(4)}
              className="w-full h-[56px] rounded-full bg-accent text-[#1E2A26] text-[17px] font-semibold hover:bg-accent/90 transition-colors"
            >
              التالي
            </button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center max-w-sm w-full py-10"
          >
            <div className="w-16 h-16 bg-quranBg rounded-full flex items-center justify-center text-accent mb-6">
              <CalendarDays size={28} />
            </div>
            
            <h2 className="text-[20px] font-semibold text-primary mb-6">الاستمرارية (الوِرد)</h2>
            
            <p className="text-[15px] leading-[1.8] text-textSecondary mb-6">
              التدبُّر رحلة حياة. قسم <strong className="text-primary font-semibold">الاستمرارية</strong> يساعدك على متابعة التزامك اليومي وبناء عادة العيش مع القرآن.
            </p>
            
            <div className="flex items-start gap-3 bg-surface p-4 rounded-xl border border-accent/20 mb-10 text-right">
              <Heart className="text-accent shrink-0 mt-1" size={20} />
              <p className="text-[14px] text-textSecondary">
                كل يوم تكمل فيه رحلة الآية يُضاف إلى سجلك، لنبني معًا قلباً موصولاً بالله.
              </p>
            </div>
            
            <button 
              onClick={() => setStep(5)}
              className="w-full h-[56px] rounded-full bg-accent text-[#1E2A26] text-[17px] font-semibold hover:bg-accent/90 transition-colors"
            >
              التالي
            </button>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div 
            key="step5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center max-w-sm w-full py-10"
          >
            <h2 className="text-[22px] font-semibold text-primary mb-4">التذكير اليومي</h2>
            <p className="text-[16px] text-textSecondary mb-8 leading-[1.8]">
              نذكّرك بآيةٍ واحدةٍ كل يوم. متى يناسبك؟
            </p>
            
            <input 
              type="time" 
              defaultValue="07:00"
              onChange={(e) => setNotification(true, e.target.value)}
              className="bg-surface border border-accent/30 rounded-xl px-6 py-4 text-[24px] text-primary mb-12 outline-none focus:border-accent"
            />
            
            <button 
              onClick={() => {
                setNotification(true);
                handleComplete();
              }}
              className="w-full h-[56px] rounded-full bg-accent text-[#1E2A26] text-[17px] font-semibold hover:bg-accent/90 transition-colors mb-4"
            >
              حفظ ومتابعة
            </button>
            <button 
              onClick={() => {
                setNotification(false);
                handleComplete();
              }}
              className="text-[15px] text-textSecondary py-2"
            >
              تخطّي
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
