export const isEmail = (email) =>
  // Basic email pattern check
  // WHY: Keeps validation lightweight; not meant to fully RFC-validate all cases.
  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);

export const isStrongPassword = (pwd) =>
  // Password must contain: uppercase, lowercase, digit, special char, and be ≥9 chars
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\W]{9,}$/.test(pwd);