const sensitiveFields = [
  'email',
  'password',
  'phone',
  'created_at',
  'updated_at',
  'last_login',
  'auth_token',
  'session_token',
  'refresh_token',
  'access_token',
  'emergency_contact',
  'id',
  'doctors_count',
  'bed_count',
  'established_year',
  'working_hours',
  'facilities',
  'specialities',
  'insurance_accepted',
  'image_url',
  'logo_url'
];

const safeFields = [
  'name',
  'location',
  'type',
  'rating'
];

const cacheFields = [
  'name',
  'location',
  'type',
  'rating'
];

const sanitizeData = (data) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => {
      const sanitized = {};
      safeFields.forEach(field => {
        if (item[field]) sanitized[field] = item[field];
      });
      return sanitized;
    });
  }
  
  if (typeof data === 'object') {
    const sanitized = {};
    safeFields.forEach(field => {
      if (data[field]) sanitized[field] = data[field];
    });
    return sanitized;
  }
  
  return data;
};

const getTimestamp = () => {
  return new Date().toISOString();
};

export const secureLog = (message, data) => {
  const sanitizedData = sanitizeData(data);
  
  if (!sanitizedData || Object.keys(sanitizedData).length === 0) {
    console.log(`🔒 ${message}: [Data hidden for security]`);
    return;
  }
  
  console.log(`🔒 ${message}:`, sanitizedData);
};

export const secureCacheLog = (message, cachedData) => {
  const sanitizedData = sanitizeData(cachedData);
  const timestamp = getTimestamp();
  
  if (!sanitizedData || Object.keys(sanitizedData).length === 0) {
    console.log(`🔒 [${timestamp}] Cache ${message}: [Data hidden for security]`);
    return;
  }
  
  console.log(`🔒 [${timestamp}] Cache ${message}:`, sanitizedData);
};
