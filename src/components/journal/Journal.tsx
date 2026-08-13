import { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Link } from 'react-router-dom';
import { BookOpen, Trash2, Bookmark } from 'lucide-react';

export function Journal() {
  const journalEntries = useAppStore(state => state.journalEntries);
  const deleteEntry = useAppStore(state => state.deleteJournalEntry);
  const bookmarks = useAppStore(state => state.bookmarks);
  const toggleBookmark = useAppStore(state => state.toggleBookmark);
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'journal' | 'bookmarks'>('journal');

  return (
    <div className="p-4 max-w-xl mx-auto pb-24">
      <div className="flex gap-4 mb-8 mt-2">
        <button 
          onClick={() => setActiveTab('journal')}
          className={`flex-1 py-3 text-center rounded-full text-sm font-medium transition-colors ${activeTab === 'journal' ? 'bg-accent text-surface' : 'text-textSecondary hover:bg-surface'}`}
        >
          خواطري
        </button>
        <button 
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-3 text-center rounded-full text-sm font-medium transition-colors ${activeTab === 'bookmarks' ? 'bg-accent text-surface' : 'text-textSecondary hover:bg-surface'}`}
        >
          المحفوظات
        </button>
      </div>

      {activeTab === 'journal' ? (
        journalEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
            <div className="w-24 h-24 bg-quranBg rounded-full flex items-center justify-center text-accent mb-6">
              <BookOpen size={40} />
            </div>
            <p className="text-[18px] text-textPrimary mb-2">صفحتُك مع القرآن ما زالت بيضاء…</p>
            <p className="text-[15px] text-textSecondary mb-8">ابدأ اليوم بآية ودوّن ما يلامس قلبك.</p>
            <Link 
              to="/session/today"
              className="px-8 h-[48px] rounded-full bg-accent text-[#1E2A26] text-[16px] font-semibold flex items-center justify-center hover:bg-accent/90 transition-colors"
            >
              ابدأ رحلة اليوم
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {journalEntries.map(entry => {
              const isExpanded = expandedId === entry.id;
              
              return (
                <div 
                  key={entry.id}
                  className="bg-surface rounded-[16px] border-r-4 border-r-accent p-5 shadow-sm cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] text-textSecondary">{entry.dateStr}</span>
                    <span className="px-3 py-1 bg-quranBg rounded-full text-[12px] text-primary">
                      {entry.ayahReference}
                    </span>
                  </div>
                  
                  <p className={`text-[16px] leading-[1.8] text-textPrimary ${!isExpanded && 'line-clamp-3'}`}>
                    {entry.text}
                  </p>
                  
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-accent/10 flex justify-end">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('هل أنت متأكد من حذف هذه الخاطرة؟')) {
                            deleteEntry(entry.id);
                          }
                        }}
                        className="flex items-center gap-2 text-red-500/80 hover:text-red-600 p-2"
                      >
                        <Trash2 size={16} />
                        <span className="text-sm">حذف</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
            <div className="w-24 h-24 bg-quranBg rounded-full flex items-center justify-center text-accent mb-6">
              <Bookmark size={40} />
            </div>
            <p className="text-[18px] text-textPrimary mb-2">ليس لديك آيات محفوظة بعد.</p>
            <p className="text-[15px] text-textSecondary mb-8">احفظ الآيات التي تلامس قلبك أثناء الجلسة للرجوع إليها لاحقًا.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map(bookmark => (
              <div 
                key={bookmark.ayahId}
                className="bg-surface rounded-[16px] p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-quranBg rounded-full text-[12px] text-primary">
                    {bookmark.ayahReference}
                  </span>
                  <button 
                    onClick={() => toggleBookmark(bookmark.ayahId, bookmark.ayahReference, bookmark.textUthmani)}
                    className="p-2 text-accent hover:text-accent/80 transition-colors"
                  >
                    <Bookmark size={18} fill="currentColor" />
                  </button>
                </div>
                
                <p className="font-quran text-[22px] leading-loose text-center text-accent" dir="rtl">
                  {bookmark.textUthmani}
                </p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
