// Update the sensitiveFields array to include more fields
const sensitiveFields = [
  'created_at',
  'id',
  'phone_number',
  'logo_url',
  'is_available',
  'location'
];

const safeFields = [
  'name'
];

const maskValue = (value, field) => {
  if (field === 'name') {
    return value.substring(0, 3) + '***';
  }
  return '[REDACTED]';
};

const sanitizeData = (data) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => {
      const sanitized = {};
      Object.keys(item).forEach(key => {
        if (sensitiveFields.includes(key)) {
          sanitized[key] = '[REDACTED]';
        } else if (safeFields.includes(key)) {
          sanitized[key] = maskValue(item[key], key);
        }
      });
      return sanitized;
    });
  }
  
  if (typeof data === 'object') {
    const sanitized = {};
    Object.keys(data).forEach(key => {
      if (sensitiveFields.includes(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (safeFields.includes(key)) {
        sanitized[key] = maskValue(data[key], key);
      }
    });
    return sanitized;
  }
  
  return '[REDACTED]';
};

export const secureLog = (message, data = null) => {
  const timestamp = new Date().toISOString();
  
  if (!data) {
    console.log(`🔒 [${timestamp}] ${message}`);
    return;
  }
  
  const sanitizedData = sanitizeData(data);
  console.log(`🔒 [${timestamp}] ${message}:`, JSON.stringify(sanitizedData, null, 2));
};
