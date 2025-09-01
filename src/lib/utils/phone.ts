/**
 * Format Turkish phone number for display (0XXX XXX XX XX)
 */
export const formatPhoneForDisplay = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Limit to 11 digits (0 + 10 digits)
  const limited = digits.slice(0, 11);
  
  // Format as 0XXX XXX XX XX
  if (limited.length <= 4) {
    return limited;
  } else if (limited.length <= 7) {
    return limited.slice(0, 4) + ' ' + limited.slice(4);
  } else if (limited.length <= 9) {
    return limited.slice(0, 4) + ' ' + limited.slice(4, 7) + ' ' + limited.slice(7);
  } else {
    return limited.slice(0, 4) + ' ' + limited.slice(4, 7) + ' ' + limited.slice(7, 9) + ' ' + limited.slice(9);
  }
};

/**
 * Convert Turkish phone number to international format (+90...)
 */
export const formatPhoneForAPI = (phoneNumber: string): string => {
  const cleanPhoneNumber = phoneNumber.replace(/\s/g, '');
  
  // If starts with 0, replace with +90
  if (cleanPhoneNumber.startsWith('0')) {
    return `+90${cleanPhoneNumber.substring(1)}`;
  }
  
  // If already starts with +90, return as is
  if (cleanPhoneNumber.startsWith('+90')) {
    return cleanPhoneNumber;
  }
  
  // Otherwise, assume it's Turkish number and add +90
  return `+90${cleanPhoneNumber}`;
};

/**
 * Validate Turkish phone number
 */
export const isValidTurkishPhone = (phoneNumber: string): boolean => {
  const cleanPhoneNumber = phoneNumber.replace(/\s/g, '');
  
  // Should be 11 digits starting with 0, or 10 digits for the mobile part
  const turkishPhoneRegex = /^0[5][0-9]{9}$/;
  
  return turkishPhoneRegex.test(cleanPhoneNumber);
};