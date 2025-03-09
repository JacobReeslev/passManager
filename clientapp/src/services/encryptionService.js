// Convert a string to an ArrayBuffer for crypto operations
const str2ab = (str) => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

// Convert ArrayBuffer to Base64 string for storage
const ab2base64 = (buf) => {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));
};

// Convert Base64 string back to ArrayBuffer
const base642ab = (base64) => {
  const binary = atob(base64);
  const buf = new ArrayBuffer(binary.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) {
    bufView[i] = binary.charCodeAt(i);
  }
  return buf;
};

// Derive an encryption key from the user's master password
export const deriveKey = async (masterPassword) => {
  const encoder = new TextEncoder();
  const salt = encoder.encode('static-salt'); // In production, use a unique salt per user

  // Import the master password as a key
  const masterKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(masterPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive a key for AES-GCM encryption
  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    masterKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  return derivedKey;
};

// Encrypt a password using the derived key
export const encryptPassword = async (password, key) => {
  // Generate a random IV (Initialization Vector)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the password
  const encoder = new TextEncoder();
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoder.encode(password)
  );

  // Return the encrypted password and IV as Base64 strings
  return {
    encryptedPassword: ab2base64(encryptedData),
    iv: ab2base64(iv)
  };
};

// Decrypt a password using the derived key
export const decryptPassword = async (encryptedData, iv, key) => {
  // Convert Base64 strings back to ArrayBuffer
  const encryptedBuffer = base642ab(encryptedData);
  const ivBuffer = base642ab(iv);

  // Decrypt the password
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    encryptedBuffer
  );

  // Convert the decrypted data back to a string
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};
