import { DressCode } from '../types/models';

export interface NigerianOutfitStyle {
  themeTitle: string;
  primaryColors: string[];
  description: string;
  mensOutfit: string;
  womensOutfit: string;
  accessories: string;
  footwear: string;
  specialInstructions: string;
  mensPhotoUrl: string;
  womensPhotoUrl: string;
}

export const NIGERIAN_CHURCH_STYLES: NigerianOutfitStyle[] = [
  {
    themeTitle: 'Corporate Royal Blue & Crisp White',
    primaryColors: ['#1D4ED8', '#FFFFFF', '#0B192C'],
    description: 'Men: Deep Navy or Royal Blue suit/blazer with white shirt and departmental tie. Ladies: Royal blue corporate gown or skirt suit with white blouse and silk scarf.',
    mensOutfit: 'Fitted navy blue corporate suit or tailored trousers with a crisp white long-sleeve cufflink shirt, royal blue patterned tie, and departmental lapel badge.',
    womensOutfit: 'Royal blue modest corporate gown or pencil skirt suit paired with a pristine white chiffon blouse and matching silk blue pocket-handkerchief.',
    accessories: 'Silver wristwatch, departmental lapel pin, neat dark leather belt.',
    footwear: 'Polished black oxford shoes or modest dark heels (maximum 2-3 inches for comfortable service duty).',
    specialInstructions: 'Departmental identification lapel pin is compulsory for all members serving on the front desk.',
    mensPhotoUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=80',
    womensPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
  },
  {
    themeTitle: 'African Splendor — Royal Ankara Touch',
    primaryColors: ['#B45309', '#1E3A8A', '#F59E0B'],
    description: 'Rich traditional attire featuring vibrant African print / Ankara with navy blue accents. Modest, elegant, and culturally dignified.',
    mensOutfit: 'Tailored Senator-style native wear in navy blue with tasteful Ankara pocket/collar embellishment, or full coordinated Ankara tunic with dark trousers.',
    womensOutfit: 'Elegantly tailored Ankara peplum top with floor-length flared skirt or a modest A-line African print gown with navy blue shoulder cape.',
    accessories: 'Traditional coral beads or discreet gold studs, departmental lapel badge.',
    footwear: 'Comfortable dark leather loafers or low-block traditional matching pumps.',
    specialInstructions: 'Ensure fabrics are neatly pressed. Closed shoes and dignified styling throughout.',
    mensPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    womensPhotoUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&auto=format&fit=crop&q=80',
  },
  {
    themeTitle: 'Smart Monochrome — Black & Pure White',
    primaryColors: ['#000000', '#FFFFFF', '#4B5563'],
    description: 'Black corporate suit/skirt with crisp white shirt or blouse. Clean, sharp, and high-impact administrative elegance.',
    mensOutfit: 'Black corporate blazer over tailored black trousers, crisp spread-collar white shirt, black silk tie, and departmental lapel pin.',
    womensOutfit: 'Structured black midi pencil dress with white collar and cuffs, or black A-line skirt with a high-neck white button-up blouse.',
    accessories: 'Silver cufflinks, white pocket square, departmental name tag.',
    footwear: 'Polished black formal shoes or comfortable black closed-toe court shoes.',
    specialInstructions: 'Minimal gold jewelry accessories recommended.',
    mensPhotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    womensPhotoUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80',
  },
  {
    themeTitle: 'Emerald Grace — Forest Green & Warm Cream',
    primaryColors: ['#047857', '#FEF3C7', '#064E3B'],
    description: 'Rich emerald green combined with warm cream. Symbolizes growth, life, divine favor, and kingdom fruitfulness.',
    mensOutfit: 'Emerald green Senator kaftan with cream chest embroidery, or a cream corporate shirt under a deep green tailored blazer.',
    womensOutfit: 'Flattering emerald green midi gown with cream belt and cream headpiece, or emerald skirt suit with cream inner camisole.',
    accessories: 'Gold wristwatch, green tie or lapel pin.',
    footwear: 'Brown leather formal shoes or cream/gold low-heeled court shoes.',
    specialInstructions: 'Keep tones deep and dignified. Iron thoroughly before service.',
    mensPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    womensPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  },
  {
    themeTitle: 'Wine Majesty & Champagne Cream',
    primaryColors: ['#881337', '#FFFBEB', '#4C0519'],
    description: 'Deep royal wine/burgundy paired with champagne cream. Warm, radiant, hospitable, and exceptionally photogenic.',
    mensOutfit: 'Burgundy corporate suit or wine Senator top with cream trousers, deep wine tie, and white pocket square.',
    womensOutfit: 'Modest wine corporate gown with champagne cream lapels, or wine peplum suit with cream accessories.',
    accessories: 'Lapel pin, tasteful pearl or gold earrings.',
    footwear: 'Dark oxblood or black dress shoes, or comfortable burgundy block heels.',
    specialInstructions: 'Lapel badge compulsory on front desk shift.',
    mensPhotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80',
    womensPhotoUrl: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=500&auto=format&fit=crop&q=80',
  },
  {
    themeTitle: 'Serene Sky Blue & Deep Midnight Navy',
    primaryColors: ['#0284C7', '#0F172A', '#E0F2FE'],
    description: 'Sky blue shirt or blouse with deep midnight navy trousers or skirt. Refreshing, calm, and approachable.',
    mensOutfit: 'Fitted sky-blue long-sleeve cotton shirt, dark navy trousers, navy blue tie with silver clip, and department pin.',
    womensOutfit: 'Sky-blue pleated skirt or midi gown with midnight navy blazer and blue silk scarf.',
    accessories: 'Silver cufflinks, navy pocket handkerchief.',
    footwear: 'Polished black or deep navy shoes.',
    specialInstructions: 'Arrive 15 minutes before briefing for desk arrangement.',
    mensPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    womensPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
  },
  {
    themeTitle: 'Blush Pink & Pearl White Celebration',
    primaryColors: ['#EC4899', '#FFFFFF', '#831843'],
    description: 'Soft blush pink with pearl white accents. Joyful, welcoming, and radiant for thanksgiving and celebratory services.',
    mensOutfit: 'White tailored shirt with subtle blush pink tie, charcoal/navy trousers, or native Senator wear with pink accent stitching.',
    womensOutfit: 'Blush pink midi gown with white blazer or lace-trimmed pink peplum suit and cream pumps.',
    accessories: 'Pearl studs, department lapel pin.',
    footwear: 'Nude/white low-heeled court shoes or formal dark leather shoes.',
    specialInstructions: 'Ensure tidy hair and official departmental badge.',
    mensPhotoUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=80',
    womensPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
  },
  {
    themeTitle: 'Teal Harmony & Warm Ochre Gold',
    primaryColors: ['#0F766E', '#F59E0B', '#CCFBF1'],
    description: 'Deep teal blue-green complemented with warm golden ochre accents. Distinctive, modest, and regal.',
    mensOutfit: 'Teal tailored kaftan with golden embroidery at neck, or dark corporate suit with teal-gold patterned tie.',
    womensOutfit: 'Teal floor-length flared gown with gold waist sash or tailored peplum top with matching teal pencil skirt.',
    accessories: 'Gold-tone wristwatch, departmental lapel pin.',
    footwear: 'Dark brown leather shoes or gold-accented low heels.',
    specialInstructions: 'Modest length for all gowns (below the knee).',
    mensPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    womensPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  },
];

// Helper to get all Sunday dates in a given year and month (0-indexed month, 0 = Jan)
export function getSundaysInMonth(year: number, month: number): Date[] {
  const sundays: Date[] = [];
  const date = new Date(year, month, 1);

  while (date.getMonth() === month) {
    if (date.getDay() === 0) {
      sundays.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }

  return sundays;
}

// Generate new Nigerian outfit plans for a list of Sundays, avoiding recent repetition
export function generateOutfitPlanForSundays(
  sundays: Date[],
  existingCodes: DressCode[]
): Omit<DressCode, 'id' | 'createdAt' | 'updatedAt'>[] {
  const recentThemes = existingCodes.slice(0, 4).map((c) => c.themeTitle.toLowerCase());
  const availableStyles = NIGERIAN_CHURCH_STYLES.filter(
    (s) => !recentThemes.includes(s.themeTitle.toLowerCase())
  );

  const stylePool = availableStyles.length >= sundays.length ? availableStyles : NIGERIAN_CHURCH_STYLES;

  return sundays.map((sun, index) => {
    const style = stylePool[index % stylePool.length];
    const sundayDateStr = sun.toISOString().split('T')[0];

    return {
      sundayDate: sundayDateStr,
      themeTitle: style.themeTitle,
      primaryColors: style.primaryColors,
      description: style.description,
      mensOutfit: style.mensOutfit,
      womensOutfit: style.womensOutfit,
      accessories: style.accessories,
      footwear: style.footwear,
      specialInstructions: style.specialInstructions,
      photoUrl: style.mensPhotoUrl || style.womensPhotoUrl,
      mensPhotoUrl: style.mensPhotoUrl,
      womensPhotoUrl: style.womensPhotoUrl,
      status: 'Draft', // Smart plans are saved as Drafts until the officer deliberately publishes!
    };
  });
}
