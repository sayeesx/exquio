const sensitiveFields = [
  'email',
  'phone',
  'password',
  'token',
  'id',
  'app_metadata',
  'user_metadata',
  'identities',
  'created_at',
  'confirmed_at',
  'last_sign_in_at',
  'email_confirmed_at',
  'aud',
  'provider',
  'providers',
  'sub',
  'user_id',
  'role'
];

// Update maskValue to handle different types of sensitive data
const maskValue = (value, key) => {
  if (!value) return value;
  
  if (typeof value === 'string') {
    if (value.includes('@')) { // Email
      const [name, domain] = value.split('@');
      return `${name[0]}${'*'.repeat(name.length - 1)}@${domain}`;
    } else if (value.length > 20) { // Long strings like IDs
      return `${value.slice(0, 4)}...${value.slice(-4)}`;
    } else if (key === 'phone') { // Phone numbers
      return value.replace(/\d/g, '*');
    } else if (key.includes('date') || key.includes('_at')) { // Dates
      return '[TIMESTAMP]';
    }
    return '*'.repeat(Math.min(value.length, 8));
  }
  
  if (Array.isArray(value)) {
    return '[ARRAY]';
  }
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  return '[HIDDEN]';
};

const sanitizeData = (data) => {
  if (!data) return null;
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  if (typeof data === 'object') {
    const sanitized = {};
    Object.keys(data).forEach(key => {
      if (sensitiveFields.includes(key)) {
        sanitized[key] = maskValue(data[key], key);
      } else if (typeof data[key] === 'object') {
        sanitized[key] = sanitizeData(data[key]);
      } else {
        sanitized[key] = data[key];
      }
    });
    return sanitized;
  }
  
  return data;
};

export const secureLog = (message, data = null) => {
  const timestamp = new Date().toISOString();
  
  if (!data) {
    console.log(`🔒 [${timestamp}] ${message}`);
    return;
  }

  const sanitizedData = sanitizeData(data);
  console.log(`🔒 [${timestamp}] ${message}:`, sanitizedData);
};

// Usage example:
// secureLog('Auth state', {
//   user: {
//     email: 'najeeb@gm.com',
//     id: 'fb7dc12a-0272-48d6-8661-2cb8cd0fbb95',
//     phone: '1234567890'
//   }
// });
// Output: 🔒 [2024-03-05T12:00:00.000Z] Auth state: {
//   user: {
//     email: 'n****@gm.com',
//     id: 'fb7...b95',
//     phone: '**********'
//   }
// }
