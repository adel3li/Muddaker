export interface AyahContent {
  textUthmani: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  verified: boolean;
}

export interface Gharib {
  word: string;
  meaning: string;
  source: string;
  verified: boolean;
}

export interface TextWithSource {
  text: string;
  source: string;
  verified: boolean;
}

export interface Shahid {
  type: 'hadith' | 'athar' | 'quote';
  author: string;
  text: string;
  source: string;
  verified: boolean;
}

export interface LiveAction {
  title: string;
  action: string;
}

export interface AyahEntry {
  id: string;
  order: number;
  theme: string;
  themeLabel: string;
  ayah: AyahContent;
  gharib: Gharib[];
  tafsir: TextWithSource;
  context?: TextWithSource;
  shawahid?: Shahid[];
  ponder: string[];
  live: LiveAction;
  dua: string | TextWithSource;
  journalPrompt: string;
  audio: null | { reciter: string; asset: string };
  reviewStatus: 'draft' | 'pending_review' | 'approved' | 'needs_correction';
  reviewedBy: string;
  reviewDate: string | null;
  contentVersion: number;
}

export interface AyahDatabase {
  schemaVersion: number;
  ayat: AyahEntry[];
}

export interface GemAttribution {
  author: string;
  source: string;
  verified: boolean;
}

export interface GemEntry {
  id: string;
  order: number;
  type: 'ayah' | 'hadith' | 'athar' | 'quote';
  text: string;
  attribution: GemAttribution;
  reviewStatus: 'draft' | 'pending_review' | 'approved' | 'needs_correction';
}

export interface GemDatabase {
  schemaVersion: number;
  gems: GemEntry[];
}
