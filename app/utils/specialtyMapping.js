export const specialtyMapping = {
  'cardiologist': 'cardiology',
  'neurologist': 'neurology',
  'pediatrician': 'pediatrics',
  'dermatologist': 'dermatology',
  'orthopedist': 'orthopedics',
  'ophthalmologist': 'ophthalmology',
  'gynecologist': 'gynecology',
  'urologist': 'urology',
  'psychiatrist': 'psychiatry',
  'dentist': 'dental',
  'ent specialist': 'ent',
  'pulmonologist': 'pulmonology',
  'gastroenterologist': 'gastroenterology',
  'endocrinologist': 'endocrinology',
  'oncologist': 'oncology'
};

export const standardizeSpecialtyName = (specialty) => {
  if (!specialty) return '';
  
  // Clean and normalize the input
  const normalized = specialty.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/s$/, '')          // Remove trailing 's'
    .replace(/ists?$/, 'ist')   // Convert 'specialists' or 'specialist' to 'ist'
    .replace(/ians?$/, 'y')     // Convert 'physicians' or 'physician' to 'y'
    .replace(/ists?$/, 'y');    // Convert remaining 'ists' or 'ist' to 'y'
  
  console.log('Standardized specialty name:', normalized);
  return specialtyMapping[normalized] || normalized;
};
