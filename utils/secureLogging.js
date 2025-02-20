const sensitiveFields = [
  'email', 'password', 'phone', 'created_at', 'updated_at', 'last_login',
  'auth_token', 'session_token', 'refresh_token', 'access_token',
  'emergency_contact', 'id', 'doctors_count', 'bed_count', 'established_year',
  'working_hours', 'facilities', 'specialities', 'insurance_accepted',
  'image_url', 'logo_url', 'location' // Added location as sensitive
];

const safeFields = [
  'name',
  'type',
  'rating'
];

const sanitizeData = (data) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => {
      const sanitized = {};
      safeFields.forEach(field => {
        if (item[field]) {
          // Mask part of the name for additional security
          if (field === 'name') {
            sanitized[field] = `${item[field].substring(0, 3)}***`;
          } else {
            sanitized[field] = item[field];
          }
        }
      });
      return sanitized;
    });
  }
  
  if (typeof data === 'object') {
    const sanitized = {};
    safeFields.forEach(field => {
      if (data[field]) {
        // Mask part of the name for additional security
        if (field === 'name') {
          sanitized[field] = `${data[field].substring(0, 3)}***`;
        } else {
          sanitized[field] = data[field];
        }
      }
    });
    return sanitized;
  }
  
  return data;
};

export const secureLog = (message, data) => {
  const sanitizedData = sanitizeData(data);
  
  if (!sanitizedData || Object.keys(sanitizedData).length === 0) {
    console.log(`🔒 [SECURE] ${message}: [Data redacted]`);
    return;
  }
  
  console.log(`🔒 [SECURE] ${message}:`, JSON.stringify(sanitizedData));
};

export const secureCacheLog = (message, cachedData) => {
  const sanitizedData = sanitizeData(cachedData);
  const timestamp = new Date().toISOString();
  
  if (!sanitizedData || Object.keys(sanitizedData).length === 0) {
    console.log(`🔒 [SECURE-CACHE ${timestamp}] ${message}: [Data redacted]`);
    return;
  }
  
  console.log(`🔒 [SECURE-CACHE ${timestamp}] ${message}:`, JSON.stringify(sanitizedData));
};
