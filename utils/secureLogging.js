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
  'role',
  'image_url',
  'logo_url',
  'location_link',
  'phone_number',
  'emergency_contact',
  'doctors_count',
  'established_year',
  'facilities',
  'working_hours',
  'description',
  'specialties_count',
  'ambulance_available',
  'insurance_accepted',
  'parking_available',
  'type'
];

// Update maskValue to handle different types of sensitive data
const maskValue = (value, key) => {
  if (!value) return '[EMPTY]';
  
  if (typeof value === 'string') {
    if (value.includes('supabase.co')) {
      return '[URL_HIDDEN]';
    }
    if (value.includes('@')) {
      const [name, domain] = value.split('@');
      return `${name[0]}***@${domain[0]}***`;
    }
    if (value.length > 20) {
      return '[LONG_STRING]';
    }
    if (key === 'phone' || key === 'emergency_contact') {
      return '[PHONE]';
    }
    if (key === 'location') {
      return '[LOCATION]';
    }
    return `[${key.toUpperCase()}]`;
  }
  
  if (Array.isArray(value)) {
    return '[ARRAY]';
  }
  
  if (typeof value === 'object') {
    return '[OBJECT]';
  }
  
  if (typeof value === 'number') {
    return '[NUMBER]';
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
