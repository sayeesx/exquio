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
  'description' // Added description to sensitive fields since it's usually null
];

const safeFields = [
  'name',
  'location'
];

const sanitizeData = (data) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => {
      // Only return name and location for hospitals
      const { name, location } = item;
      return { name, location };
    });
  }
  
  if (typeof data === 'object') {
    const sanitized = {};
    Object.keys(data).forEach(key => {
      if (safeFields.includes(key)) {
        sanitized[key] = data[key];
      }
    });
    return sanitized;
  }
  
  return data;
};

export const secureLog = (message, data) => {
  const sanitizedData = sanitizeData(data);
  if (!sanitizedData || Object.keys(sanitizedData).length === 0) {
    console.log(`🔒 ${message}: [Data hidden for security]`);
    return;
  }
  
  // Format the output to be more readable
  if (Array.isArray(sanitizedData)) {
    console.log(`🔒 ${message}:`);
    sanitizedData.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name} (${item.location})`);
    });
  } else {
    console.log(`🔒 ${message}:`, sanitizedData);
  }
};
