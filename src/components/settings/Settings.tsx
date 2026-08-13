import { useAppStore } from '../../lib/store';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const { theme, setTheme, textSize, setTextSize, notificationEnabled, notificationTime, setNotification, frequency, setFrequency } = useAppStore();
  const navigate = useNavigate();

  return (
    <div className="p-4 max-w-xl mx-auto pb-20">
      <h1 className="text-[22px] font-semibold text-primary mb-6">الإعدادات</h1>
      
      <div className="space-y-6">
        {/* Frequency */}
        <section className="bg-surface rounded-[24px] p-5 shadow-sm">
          <h2 className="text-[16px] font-semibold text-primary mb-4">وتيرة الآيات</h2>
          
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="frequency" 
                value="daily" 
                checked={frequency === 'daily'}
                onChange={() => setFrequency('daily')}
                className="w-5 h-5 accent-accent"
              />
              <div>
                <div className="text-[15px] text-textPrimary">يومياً</div>
                <div className="text-[13px] text-textSecondary">آية جديدة كل يوم</div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="frequency" 
                value="bidaily" 
                checked={frequency === 'bidaily'}
                onChange={() => setFrequency('bidaily')}
                className="w-5 h-5 accent-accent"
              />
              <div>
                <div className="text-[15px] text-textPrimary">يوم بعد يوم (أو ٣ مرات أسبوعياً)</div>
                <div className="text-[13px] text-textSecondary">آية جديدة كل يومين</div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="frequency" 
                value="weekly" 
                checked={frequency === 'weekly'}
                onChange={() => setFrequency('weekly')}
                className="w-5 h-5 accent-accent"
              />
              <div>
                <div className="text-[15px] text-textPrimary">أسبوعياً</div>
                <div className="text-[13px] text-textSecondary">آية جديدة كل أسبوع</div>
              </div>
            </label>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-surface rounded-[24px] p-5 shadow-sm">
          <h2 className="text-[16px] font-semibold text-primary mb-4">المظهر</h2>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-[16px] text-textPrimary">السمة</span>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value as any)}
              className="bg-quranBg rounded-lg px-3 py-1 text-[14px] text-primary border-none outline-none"
            >
              <option value="light">فاتح (ضُحى)</option>
              <option value="dark">داكن (تهجُّد)</option>
              <option value="auto">تلقائي</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-[16px] text-textPrimary">حجم الخط</span>
            <div className="flex bg-quranBg rounded-lg p-1 gap-1">
              <button 
                onClick={() => setTextSize('normal')}
                className={`px-4 py-1 rounded-md text-[14px] ${textSize === 'normal' ? 'bg-surface text-primary shadow-sm' : 'text-textSecondary'}`}
              >
                عادي
              </button>
              <button 
                onClick={() => setTextSize('large')}
                className={`px-4 py-1 rounded-md text-[14px] ${textSize === 'large' ? 'bg-surface text-primary shadow-sm' : 'text-textSecondary'}`}
              >
                كبير
              </button>
            </div>
          </div>
        </section>

        {/* Notifications (Web simulation) */}
        <section className="bg-surface rounded-[24px] p-5 shadow-sm">
          <h2 className="text-[16px] font-semibold text-primary mb-4">التذكير اليومي</h2>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[16px] text-textPrimary">تفعيل التذكير</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationEnabled}
                onChange={(e) => setNotification(e.target.checked)}
              />
              <div className="w-11 h-6 bg-accent/20 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
            </label>
          </div>
          
          {notificationEnabled && (
            <div className="flex items-center justify-between pt-4 border-t border-accent/10">
              <span className="text-[16px] text-textPrimary">وقت التذكير</span>
              <input 
                type="time" 
                value={notificationTime}
                onChange={(e) => setNotification(notificationEnabled, e.target.value)}
                className="bg-quranBg rounded-lg px-3 py-1 text-[14px] text-primary border-none outline-none"
              />
            </div>
          )}
        </section>

        {/* About */}
        <section className="bg-surface rounded-[24px] p-5 shadow-sm space-y-4">
          <h2 className="text-[16px] font-semibold text-primary">عن التطبيق</h2>
          <p className="text-[14px] text-textSecondary leading-[1.8]">
            جميع النصوص الشرعية في التطبيق منقولة من مصادر موثقة ومُراجَعة من مختصين.
          </p>
          <div className="pt-2 border-t border-accent/10 flex flex-col items-start">
            <button 
              onClick={() => navigate('/onboarding')}
              className="text-[14px] text-accent font-medium w-full text-start py-2"
            >
              دليل البداية
            </button>
            <button className="text-[14px] text-accent font-medium w-full text-start py-2">شارك التطبيق</button>
            <button className="text-[14px] text-textSecondary w-full text-start py-2">سياسة الخصوصية</button>
          </div>
          <p className="text-center text-[12px] text-textSecondary pt-4">إصدار 1.0.0</p>
        </section>
      </div>
    </div>
  );
}
