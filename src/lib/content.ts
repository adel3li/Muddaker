import { AyahDatabase, AyahEntry, GemDatabase, GemEntry } from '../types/content';
import { useAppStore } from './store';

// Import JSON statically to avoid fetch issues
import ayatData from '../../public/content/ayat_ar.json';
import gemsData from '../../public/content/gems_ar.json';

const IS_RELEASE = import.meta.env.PROD;

export async function fetchAyat(): Promise<AyahEntry[]> {
  const data = ayatData as unknown as AyahDatabase;
  
  // Filter for approved only in release, or allow drafts in debug
  return data.ayat.filter(a => !IS_RELEASE || a.reviewStatus === 'approved');
}

export async function fetchGems(): Promise<GemEntry[]> {
  const data = gemsData as unknown as GemDatabase;
  
  return data.gems.filter(g => !IS_RELEASE || g.reviewStatus === 'approved');
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getIndexByFrequency(dayOfYear: number): number {
  const frequency = useAppStore.getState().frequency;
  if (frequency === 'weekly') {
    return Math.floor(dayOfYear / 7);
  }
  if (frequency === 'bidaily') {
    return Math.floor(dayOfYear / 2);
  }
  return dayOfYear;
}

export async function getDailyContent(): Promise<{ ayah: AyahEntry | null; gem: GemEntry | null }> {
  try {
    const [ayat, gems] = await Promise.all([fetchAyat(), fetchGems()]);
    
    // Sort by order to ensure deterministic selection
    const sortedAyat = [...ayat].sort((a, b) => a.order - b.order);
    const sortedGems = [...gems].sort((a, b) => a.order - b.order);
    
    const dayOfYear = getDayOfYear();
    const currentIndex = getIndexByFrequency(dayOfYear);
    
    const ayahOfDay = sortedAyat.length > 0 ? sortedAyat[currentIndex % sortedAyat.length] : null;
    const gemOfDay = sortedGems.length > 0 ? sortedGems[currentIndex % sortedGems.length] : null;
    
    return { ayah: ayahOfDay, gem: gemOfDay };
  } catch (error) {
    console.error('Error loading daily content', error);
    return { ayah: null, gem: null };
  }
}
