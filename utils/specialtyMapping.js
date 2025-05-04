export const specialtyMapping = {
  'cardiologists': 'cardiology',
  'neurologists': 'neurology',
  'pediatricians': 'pediatrics',
  'dermatologists': 'dermatology',
  'orthopedists': 'orthopedics',
  'ophthalmologists': 'ophthalmology',
  'gynecologists': 'gynecology',
  'urologists': 'urology',
  'psychiatrists': 'psychiatry',
  'dentists': 'dental',
  'ent specialists': 'ent',
  'pulmonologists': 'pulmonology',
  'gastroenterologists': 'gastroenterology',
  'endocrinologists': 'endocrinology',
  'oncologists': 'oncology'
};

export const standardizeSpecialtyName = (specialty) => {
  if (!specialty) return '';
  const lowercaseSpecialty = specialty.toLowerCase().trim();
  return specialtyMapping[lowercaseSpecialty] || lowercaseSpecialty;
};
