import { useAppStore } from '../../lib/store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

export function Consistency() {
  const completedSessions = useAppStore(state => state.completedSessions);
  
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  const days = eachDayOfInterval({ start, end });
  
  // Basic grid rendering
  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-[22px] font-semibold text-primary mb-6">المداومة</h1>
      
      <div className="bg-surface rounded-[24px] p-6 shadow-sm mb-6 text-center">
        <h2 className="text-accent font-semibold mb-2">«أحبُّ الأعمالِ إلى اللهِ أدومُها وإن قلَّ»</h2>
        <p className="text-[13px] text-textSecondary">متفق عليه</p>
      </div>

      <div className="text-center mb-8">
        <p className="text-[16px] text-textPrimary">هذه صفحتُك مع القرآن… لا سِباقَ مع أحد</p>
      </div>

      <div className="bg-surface rounded-[24px] p-6 shadow-sm">
        <div className="text-center font-semibold text-primary mb-4">
          {format(today, 'MMMM yyyy')}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map((d, i) => (
            <div key={i} className="text-center text-[12px] text-textSecondary">{d}</div>
          ))}
          
          {/* Offset for first day of month (0 = Sunday in date-fns) */}
          {Array.from({ length: start.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isCompleted = !!completedSessions[dateStr];
            const isToday = isSameDay(day, today);
            
            return (
              <div 
                key={dateStr} 
                className={`aspect-square rounded-full flex items-center justify-center text-[14px]
                  ${isCompleted ? 'bg-success text-white' : 'bg-quranBg/50 text-textPrimary'}
                  ${isToday && !isCompleted ? 'border border-accent' : ''}
                `}
              >
                {format(day, 'd')}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
