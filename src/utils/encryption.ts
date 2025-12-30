/**
 * Encrypts password using base64 encoding before sending to backend
 */
export const encryptPassword = (password: string): string => {
  return btoa(password);
};

/**
 * Decrypts base64 encoded password (for reference, backend handles decryption)
 */
export const decryptPassword = (encodedPassword: string): string => {
  return atob(encodedPassword);
};

