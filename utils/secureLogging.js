const sensitiveFields = ['*']; // Consider all fields sensitive

const maskValue = (value) => '[HIDDEN]';

const sanitizeData = (data) => {
  if (!data) return '[HIDDEN]';
  
  if (Array.isArray(data)) {
    return '[ARRAY_HIDDEN]';
  }
  
  if (typeof data === 'object') {
    return '[OBJECT_HIDDEN]';
  }
  
  return '[HIDDEN]';
};

export const secureLog = (message, data = null) => {
  const timestamp = new Date().toISOString();
  
  if (!data) {
    console.log(`🔒 [${timestamp}] ${message}`);
    return;
  }
  
  console.log(`🔒 [${timestamp}] ${message}: [DATA_HIDDEN]`);
};
