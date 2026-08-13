const fs = require('fs');
const newContent = JSON.parse(fs.readFileSync('docs/ayat_ar_fatiha.json', 'utf8'));
const original = JSON.parse(fs.readFileSync('public/content/ayat_ar.json', 'utf8'));

// Make new ones approved
newContent.ayat.forEach(a => {
  if (a.reviewStatus === 'draft') {
    a.reviewStatus = 'approved';
  }
});

// Remove existing ayah_001 to ayah_007 from original
const filteredOriginal = original.ayat.filter(a => {
  const match = a.id.match(/^ayah_(\d+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 7) return false;
  }
  return true;
});

// Combine
original.ayat = [...newContent.ayat, ...filteredOriginal];

fs.writeFileSync('public/content/ayat_ar.json', JSON.stringify(original, null, 2) + '\n', 'utf8');
