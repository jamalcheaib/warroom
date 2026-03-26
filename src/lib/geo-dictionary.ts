/**
 * Geographic dictionary for south Lebanon / northern Palestine border region.
 * Built from operational maps + known locations.
 * Each entry: keyword (as appears in Arabic news) → [lat, lon]
 */

export interface GeoLocation {
  lat: number;
  lon: number;
  nameAr: string;
  nameEn: string;
  type: 'lebanese_town' | 'settlement' | 'military_position' | 'city' | 'area' | 'base';
}

// Lebanese towns (south Lebanon)
const LEBANESE_TOWNS: Record<string, GeoLocation> = {
  'الخيام': { lat: 33.360, lon: 35.590, nameAr: 'الخيام', nameEn: 'Al-Khiam', type: 'lebanese_town' },
  'الطيبة': { lat: 33.340, lon: 35.520, nameAr: 'الطيبة', nameEn: 'Al-Taybeh', type: 'lebanese_town' },
  'العديسة': { lat: 33.340, lon: 35.510, nameAr: 'العديسة', nameEn: 'Al-Adaisseh', type: 'lebanese_town' },
  'مركبا': { lat: 33.310, lon: 35.460, nameAr: 'مركبا', nameEn: 'Markaba', type: 'lebanese_town' },
  'ميس الجبل': { lat: 33.280, lon: 35.430, nameAr: 'ميس الجبل', nameEn: 'Mais al-Jabal', type: 'lebanese_town' },
  'مارون الراس': { lat: 33.290, lon: 35.440, nameAr: 'مارون الراس', nameEn: 'Maroun al-Ras', type: 'lebanese_town' },
  'عيتا الشعب': { lat: 33.280, lon: 35.410, nameAr: 'عيتا الشعب', nameEn: 'Aita al-Shaab', type: 'lebanese_town' },
  'بنت جبيل': { lat: 33.290, lon: 35.420, nameAr: 'بنت جبيل', nameEn: 'Bint Jbeil', type: 'lebanese_town' },
  'الناقورة': { lat: 33.120, lon: 35.140, nameAr: 'الناقورة', nameEn: 'Naqoura', type: 'lebanese_town' },
  'كفرشوبا': { lat: 33.370, lon: 35.640, nameAr: 'كفرشوبا', nameEn: 'Kfar Shouba', type: 'lebanese_town' },
  'القنطرة': { lat: 33.310, lon: 35.460, nameAr: 'القنطرة', nameEn: 'Al-Qantara', type: 'lebanese_town' },
  'حولا': { lat: 33.350, lon: 35.540, nameAr: 'حولا', nameEn: 'Houla', type: 'lebanese_town' },
  'عيترون': { lat: 33.300, lon: 35.420, nameAr: 'عيترون', nameEn: 'Aitaroun', type: 'lebanese_town' },
  'رميش': { lat: 33.270, lon: 35.390, nameAr: 'رميش', nameEn: 'Rmeish', type: 'lebanese_town' },
  'يارون': { lat: 33.290, lon: 35.410, nameAr: 'يارون', nameEn: 'Yaroun', type: 'lebanese_town' },
  'بليدا': { lat: 33.260, lon: 35.370, nameAr: 'بليدا', nameEn: 'Blida', type: 'lebanese_town' },
  'عيتا الفخار': { lat: 33.340, lon: 35.540, nameAr: 'عيتا الفخار', nameEn: 'Aita al-Foukhar', type: 'lebanese_town' },
  'شبعا': { lat: 33.380, lon: 35.680, nameAr: 'شبعا', nameEn: 'Shebaa', type: 'lebanese_town' },
  'كفركلا': { lat: 33.330, lon: 35.510, nameAr: 'كفركلا', nameEn: 'Kfar Kila', type: 'lebanese_town' },
  'طير حرفا': { lat: 33.220, lon: 35.310, nameAr: 'طير حرفا', nameEn: 'Tair Harfa', type: 'lebanese_town' },
  'حاريص': { lat: 33.230, lon: 35.340, nameAr: 'حاريص', nameEn: 'Hariss', type: 'lebanese_town' },
  'عيناتا': { lat: 33.300, lon: 35.440, nameAr: 'عيناتا', nameEn: 'Ainata', type: 'lebanese_town' },
  'علما الشعب': { lat: 33.260, lon: 35.350, nameAr: 'علما الشعب', nameEn: 'Alma al-Shaab', type: 'lebanese_town' },
  'الضهيرة': { lat: 33.190, lon: 35.230, nameAr: 'الضهيرة', nameEn: 'Al-Dhahira', type: 'lebanese_town' },
  'صور': { lat: 33.270, lon: 35.200, nameAr: 'صور', nameEn: 'Tyre', type: 'city' },
  'صيدا': { lat: 33.560, lon: 35.380, nameAr: 'صيدا', nameEn: 'Sidon', type: 'city' },
  'النبطية': { lat: 33.380, lon: 35.490, nameAr: 'النبطية', nameEn: 'Nabatieh', type: 'city' },
  'بعلبك': { lat: 34.010, lon: 36.210, nameAr: 'بعلبك', nameEn: 'Baalbek', type: 'city' },
  'الهرمل': { lat: 34.390, lon: 36.390, nameAr: 'الهرمل', nameEn: 'Hermel', type: 'city' },
  'بيروت': { lat: 33.890, lon: 35.510, nameAr: 'بيروت', nameEn: 'Beirut', type: 'city' },
  'الضاحية': { lat: 33.850, lon: 35.520, nameAr: 'الضاحية', nameEn: 'Dahiyeh', type: 'area' },
  'الضاحية الجنوبية': { lat: 33.850, lon: 35.520, nameAr: 'الضاحية الجنوبية', nameEn: 'Dahiyeh', type: 'area' },
  'ابل السقي': { lat: 33.310, lon: 35.470, nameAr: 'ابل السقي', nameEn: 'Ibl al-Saqi', type: 'lebanese_town' },
  'ابل ثلاثين': { lat: 33.310, lon: 35.470, nameAr: 'ابل ثلاثين', nameEn: 'Ibl al-Thalatheen', type: 'lebanese_town' },
  'دبين': { lat: 33.330, lon: 35.490, nameAr: 'دبين', nameEn: 'Debbin', type: 'lebanese_town' },
  'راشيا الفخار': { lat: 33.350, lon: 35.620, nameAr: 'راشيا الفخار', nameEn: 'Rashaya al-Foukhar', type: 'lebanese_town' },
  'كفرحمام': { lat: 33.360, lon: 35.560, nameAr: 'كفرحمام', nameEn: 'Kfar Hammam', type: 'lebanese_town' },
  'طلوسة': { lat: 33.320, lon: 35.500, nameAr: 'طلوسة', nameEn: 'Talouseh', type: 'lebanese_town' },
  'يحمر': { lat: 33.350, lon: 35.530, nameAr: 'يحمر', nameEn: 'Yahmar', type: 'lebanese_town' },
  'حداثا': { lat: 33.300, lon: 35.400, nameAr: 'حداثا', nameEn: 'Hadatha', type: 'lebanese_town' },
  'عدشيت': { lat: 33.260, lon: 35.350, nameAr: 'عدشيت', nameEn: 'Aadchit', type: 'lebanese_town' },
  'برعشيت': { lat: 33.250, lon: 35.330, nameAr: 'برعشيت', nameEn: 'Bra\'shit', type: 'lebanese_town' },
  'جبشيت': { lat: 33.410, lon: 35.450, nameAr: 'جبشيت', nameEn: 'Jibsheet', type: 'lebanese_town' },
  'المنصوري': { lat: 33.210, lon: 35.260, nameAr: 'المنصوري', nameEn: 'Mansouri', type: 'lebanese_town' },
  'عدلون': { lat: 33.420, lon: 35.310, nameAr: 'عدلون', nameEn: 'Adloun', type: 'lebanese_town' },
};

// Israeli settlements and cities (occupied Palestine / northern Israel)
const SETTLEMENTS: Record<string, GeoLocation> = {
  'كريات شمونة': { lat: 33.210, lon: 35.570, nameAr: 'كريات شمونة', nameEn: 'Kiryat Shmona', type: 'settlement' },
  'المطلة': { lat: 33.280, lon: 35.540, nameAr: 'المطلة', nameEn: 'Metulla', type: 'settlement' },
  'نهاريا': { lat: 33.000, lon: 35.090, nameAr: 'نهاريا', nameEn: 'Nahariya', type: 'settlement' },
  'عكا': { lat: 32.930, lon: 35.080, nameAr: 'عكا', nameEn: 'Akko', type: 'settlement' },
  'حيفا': { lat: 32.800, lon: 34.980, nameAr: 'حيفا', nameEn: 'Haifa', type: 'city' },
  'صفد': { lat: 32.960, lon: 35.500, nameAr: 'صفد', nameEn: 'Safed', type: 'settlement' },
  'طبريا': { lat: 32.790, lon: 35.530, nameAr: 'طبريا', nameEn: 'Tiberias', type: 'settlement' },
  'مسكاف عام': { lat: 33.270, lon: 35.550, nameAr: 'مسكاف عام', nameEn: 'Misgav Am', type: 'settlement' },
  'مسغاف عام': { lat: 33.270, lon: 35.550, nameAr: 'مسغاف عام', nameEn: 'Misgav Am', type: 'settlement' },
  'أفيفيم': { lat: 33.260, lon: 35.500, nameAr: 'أفيفيم', nameEn: 'Avivim', type: 'settlement' },
  'دوفيف': { lat: 33.270, lon: 35.480, nameAr: 'دوفيف', nameEn: 'Dovev', type: 'settlement' },
  'يفتاح': { lat: 33.250, lon: 35.510, nameAr: 'يفتاح', nameEn: 'Yiftah', type: 'settlement' },
  'دفنة': { lat: 33.240, lon: 35.620, nameAr: 'دفنة', nameEn: 'Dafna', type: 'settlement' },
  'بيت هلل': { lat: 33.220, lon: 35.600, nameAr: 'بيت هلل', nameEn: 'Beit Hillel', type: 'settlement' },
  'شتولا': { lat: 33.080, lon: 35.180, nameAr: 'شتولا', nameEn: 'Shetula', type: 'settlement' },
  'حنيتا': { lat: 33.090, lon: 35.170, nameAr: 'حنيتا', nameEn: 'Hanita', type: 'settlement' },
  'زرعيت': { lat: 33.100, lon: 35.210, nameAr: 'زرعيت', nameEn: 'Zar\'it', type: 'settlement' },
  'يرئون': { lat: 33.140, lon: 35.250, nameAr: 'يرئون', nameEn: 'Yir\'on', type: 'settlement' },
  'تل أبيب': { lat: 32.080, lon: 34.780, nameAr: 'تل أبيب', nameEn: 'Tel Aviv', type: 'city' },
  'القدس': { lat: 31.780, lon: 35.230, nameAr: 'القدس', nameEn: 'Jerusalem', type: 'city' },
  'الجولان': { lat: 33.100, lon: 35.800, nameAr: 'الجولان', nameEn: 'Golan Heights', type: 'area' },
  'مرج عيون': { lat: 33.370, lon: 35.530, nameAr: 'مرج عيون', nameEn: 'Marjayoun', type: 'lebanese_town' },
  'شلومي': { lat: 33.070, lon: 35.150, nameAr: 'شلومي', nameEn: 'Shlomi', type: 'settlement' },
  'مناره': { lat: 33.250, lon: 35.510, nameAr: 'مناره', nameEn: 'Manara', type: 'settlement' },
  'المنارة': { lat: 33.250, lon: 35.510, nameAr: 'المنارة', nameEn: 'Manara', type: 'settlement' },
};

// Israeli military positions (from maps)
const MILITARY_POSITIONS: Record<string, GeoLocation> = {
  'موقع المرج': { lat: 33.300, lon: 35.520, nameAr: 'موقع المرج', nameEn: 'Al-Marj Position', type: 'military_position' },
  'موقع البغدادي': { lat: 33.280, lon: 35.520, nameAr: 'موقع البغدادي', nameEn: 'Al-Baghdadi Position', type: 'military_position' },
  'موقع الراهب': { lat: 33.260, lon: 35.450, nameAr: 'موقع الراهب', nameEn: 'Al-Raheb Position', type: 'military_position' },
  'موقع السماقة': { lat: 33.290, lon: 35.480, nameAr: 'موقع السماقة', nameEn: 'Al-Samaqa Position', type: 'military_position' },
  'موقع رويسات العلم': { lat: 33.310, lon: 35.510, nameAr: 'موقع رويسات العلم', nameEn: 'Ruwaisat al-Alam Position', type: 'military_position' },
  'موقع الأبيض': { lat: 33.130, lon: 35.220, nameAr: 'موقع الأبيض', nameEn: 'Al-Abyad Position', type: 'military_position' },
  'موقع بركة ريشا': { lat: 33.100, lon: 35.190, nameAr: 'موقع بركة ريشا', nameEn: 'Birkat Risha Position', type: 'military_position' },
  'ثكنة برانيت': { lat: 33.100, lon: 35.200, nameAr: 'ثكنة برانيت', nameEn: 'Branit Barracks', type: 'base' },
  'قاعدة ميرون': { lat: 32.990, lon: 35.410, nameAr: 'قاعدة ميرون', nameEn: 'Meron Base', type: 'base' },
  'قاعدة رامات دافيد': { lat: 32.670, lon: 35.180, nameAr: 'قاعدة رامات دافيد', nameEn: 'Ramat David Airbase', type: 'base' },
  'مستوطنة المطلة': { lat: 33.280, lon: 35.540, nameAr: 'مستوطنة المطلة', nameEn: 'Metulla Settlement', type: 'settlement' },
};

// Named areas / regions frequently mentioned
const AREAS: Record<string, GeoLocation> = {
  'مزارع شبعا': { lat: 33.420, lon: 35.730, nameAr: 'مزارع شبعا', nameEn: 'Shebaa Farms', type: 'area' },
  'تلال كفرشوبا': { lat: 33.390, lon: 35.660, nameAr: 'تلال كفرشوبا', nameEn: 'Kfar Shouba Hills', type: 'area' },
  'الجليل': { lat: 33.050, lon: 35.400, nameAr: 'الجليل', nameEn: 'Galilee', type: 'area' },
  'الجليل الأعلى': { lat: 33.100, lon: 35.450, nameAr: 'الجليل الأعلى', nameEn: 'Upper Galilee', type: 'area' },
  'جنوب لبنان': { lat: 33.280, lon: 35.400, nameAr: 'جنوب لبنان', nameEn: 'South Lebanon', type: 'area' },
  'الشمال': { lat: 33.100, lon: 35.400, nameAr: 'الشمال', nameEn: 'The North (Israel)', type: 'area' },
  'سهل الحولة': { lat: 33.100, lon: 35.600, nameAr: 'سهل الحولة', nameEn: 'Hula Valley', type: 'area' },
  'مثلث خلة وردة': { lat: 33.310, lon: 35.500, nameAr: 'مثلث خلة وردة', nameEn: 'Khallet Wardeh Triangle', type: 'area' },
  'القطاع الشرقي': { lat: 33.280, lon: 35.620, nameAr: 'القطاع الشرقي', nameEn: 'Eastern Sector', type: 'area' },
  'القطاع الغربي': { lat: 33.150, lon: 35.300, nameAr: 'القطاع الغربي', nameEn: 'Western Sector', type: 'area' },
  'مرتفع المحيس': { lat: 33.350, lon: 35.530, nameAr: 'مرتفع المحيس', nameEn: 'Al-Muhays Heights', type: 'area' },
  'المحيسة': { lat: 33.350, lon: 35.530, nameAr: 'المحيسة', nameEn: 'Al-Muhaysa', type: 'area' },
  'وادي السلوقي': { lat: 33.320, lon: 35.460, nameAr: 'وادي السلوقي', nameEn: 'Saluki Valley', type: 'area' },
  'البقاع': { lat: 33.850, lon: 36.050, nameAr: 'البقاع', nameEn: 'Bekaa Valley', type: 'area' },
  'غزة': { lat: 31.500, lon: 34.470, nameAr: 'غزة', nameEn: 'Gaza', type: 'area' },
  'رفح': { lat: 31.290, lon: 34.250, nameAr: 'رفح', nameEn: 'Rafah', type: 'area' },
  'خان يونس': { lat: 31.340, lon: 34.310, nameAr: 'خان يونس', nameEn: 'Khan Younis', type: 'area' },
  'جباليا': { lat: 31.530, lon: 34.490, nameAr: 'جباليا', nameEn: 'Jabalia', type: 'area' },
  'اليمن': { lat: 15.370, lon: 44.190, nameAr: 'اليمن', nameEn: 'Yemen', type: 'area' },
  'مأرب': { lat: 15.450, lon: 45.320, nameAr: 'مأرب', nameEn: 'Marib', type: 'area' },
  'الحديدة': { lat: 14.800, lon: 42.950, nameAr: 'الحديدة', nameEn: 'Hodeidah', type: 'area' },
  'إيلات': { lat: 29.560, lon: 34.950, nameAr: 'إيلات', nameEn: 'Eilat', type: 'settlement' },
};

// Merge all dictionaries
const ALL_LOCATIONS: Record<string, GeoLocation> = {
  ...LEBANESE_TOWNS,
  ...SETTLEMENTS,
  ...MILITARY_POSITIONS,
  ...AREAS,
};

/**
 * Extract geographic coordinates from operation text.
 * Returns the first matching location, prioritizing specific locations over areas.
 */
export function extractGeoFromText(text: string): GeoLocation | null {
  // Priority 1: Military positions (most specific)
  for (const [keyword, loc] of Object.entries(MILITARY_POSITIONS)) {
    if (text.includes(keyword)) return loc;
  }

  // Priority 2: Towns and settlements
  for (const [keyword, loc] of Object.entries(LEBANESE_TOWNS)) {
    if (text.includes(keyword)) return loc;
  }
  for (const [keyword, loc] of Object.entries(SETTLEMENTS)) {
    if (text.includes(keyword)) return loc;
  }

  // Priority 3: Areas (least specific)
  for (const [keyword, loc] of Object.entries(AREAS)) {
    if (text.includes(keyword)) return loc;
  }

  return null;
}

/**
 * Extract ALL matching locations from text (for multi-location operations).
 */
export function extractAllGeoFromText(text: string): GeoLocation[] {
  const found: GeoLocation[] = [];
  const seen = new Set<string>();

  for (const [keyword, loc] of Object.entries(ALL_LOCATIONS)) {
    if (text.includes(keyword) && !seen.has(`${loc.lat},${loc.lon}`)) {
      seen.add(`${loc.lat},${loc.lon}`);
      found.push(loc);
    }
  }

  return found;
}

export { ALL_LOCATIONS, LEBANESE_TOWNS, SETTLEMENTS, MILITARY_POSITIONS, AREAS };
