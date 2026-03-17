const crypto = require("crypto");

const HASH_ALGO = "scrypt";
const SALT_BYTES = 16;
const KEY_LENGTH = 64;

const hashPassword = (rawPassword) => {
  if (typeof rawPassword !== "string" || rawPassword.length === 0) {
    throw new Error("Password is required");
  }

  const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
  const hash = crypto.scryptSync(rawPassword, salt, KEY_LENGTH).toString("hex");
  return `${HASH_ALGO}$${salt}$${hash}`;
};

const isHashedPassword = (storedPassword) =>
  typeof storedPassword === "string" && storedPassword.startsWith(`${HASH_ALGO}$`);

const verifyPassword = (rawPassword, storedPassword) => {
  if (typeof rawPassword !== "string" || typeof storedPassword !== "string") {
    return false;
  }

  if (!isHashedPassword(storedPassword)) {
    // Backward compatibility for old plaintext accounts.
    return rawPassword === storedPassword;
  }

  const [algo, salt, hash] = storedPassword.split("$");
  if (algo !== HASH_ALGO || !salt || !hash) {
    return false;
  }

  const inputHash = crypto.scryptSync(rawPassword, salt, KEY_LENGTH).toString("hex");
  const inputBuffer = Buffer.from(inputHash, "hex");
  const storedBuffer = Buffer.from(hash, "hex");

  if (inputBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(inputBuffer, storedBuffer);
};

module.exports = {
  hashPassword,
  verifyPassword,
  isHashedPassword
};
