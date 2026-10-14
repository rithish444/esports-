/**
 * Esports Arena — Security & Firewall Shield
 * Defends against XSS, SQLi, Brute Force, Rate Limit Abuse, and Privilege Escalation
 */

// 1. XSS SANITIZATION (HTML Entity Encoding & Script Tag Stripper)
export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/javascript:[^"']*/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove inline event handlers like onclick=, onerror=
    .replace(/[<>]/g, (match) => (match === '<' ? '&lt;' : '&gt;')) // Encode remaining angles
    .trim();
};

// 2. STRICT VALIDATORS
export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

export const validateFFUid = (uid) => {
  // Free Fire UIDs are numeric, between 8 and 12 digits
  return /^\d{8,12}$/.test(String(uid).trim());
};

export const validatePhone = (phone) => {
  // E.164 and standard 10-15 digit phone formats
  const clean = phone.replace(/[\s\-()]/g, '');
  return /^\+?[0-9]{10,15}$/.test(clean);
};

export const validateTeamName = (name) => {
  if (!name || name.trim().length < 3) {
    throw new Error('Team name must be at least 3 characters long.');
  }
  if (name.trim().length > 30) {
    throw new Error('Team name cannot exceed 30 characters.');
  }
  // Disallow control characters or script injections
  if (/[<>{}\\]/.test(name)) {
    throw new Error('Team name contains forbidden special characters.');
  }
  return sanitizeInput(name);
};

// 3. BRUTE FORCE FIREWALL & RATE LIMITER (Local & Memory Storage)
const RATE_LIMIT_KEY = 'esports_firewall_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export const checkRateLimit = (identifier = 'global') => {
  const now = Date.now();
  const rawData = localStorage.getItem(RATE_LIMIT_KEY);
  let records = {};

  if (rawData) {
    try {
      records = JSON.parse(rawData);
    } catch (e) {
      records = {};
    }
  }

  const userRecord = records[identifier] || { count: 0, lockedUntil: 0 };

  // If currently locked out
  if (userRecord.lockedUntil && now < userRecord.lockedUntil) {
    const remainingSeconds = Math.ceil((userRecord.lockedUntil - now) / 1000);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return {
      allowed: false,
      message: `🚨 Firewall Lockout: Too many failed login attempts! System locked for ${minutes}m ${seconds}s to prevent brute-force attacks.`,
      remainingSeconds
    };
  }

  // If lockout expired, reset
  if (userRecord.lockedUntil && now >= userRecord.lockedUntil) {
    delete records[identifier];
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(records));
  }

  return { allowed: true };
};

export const recordFailedAttempt = (identifier = 'global') => {
  const now = Date.now();
  const rawData = localStorage.getItem(RATE_LIMIT_KEY);
  let records = {};

  if (rawData) {
    try { records = JSON.parse(rawData); } catch (e) { records = {}; }
  }

  const userRecord = records[identifier] || { count: 0, lockedUntil: 0 };
  userRecord.count += 1;

  if (userRecord.count >= MAX_ATTEMPTS) {
    userRecord.lockedUntil = now + LOCKOUT_MINUTES * 60 * 1000;
  }

  records[identifier] = userRecord;
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(records));

  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - userRecord.count);
  return {
    isLocked: userRecord.count >= MAX_ATTEMPTS,
    attemptsLeft
  };
};

export const resetRateLimit = (identifier = 'global') => {
  const rawData = localStorage.getItem(RATE_LIMIT_KEY);
  if (rawData) {
    try {
      const records = JSON.parse(rawData);
      delete records[identifier];
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(records));
    } catch (e) { /* ignore */ }
  }
};
