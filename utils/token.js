const crypto = require("crypto");
const { normalizeRole } = require("./roles");

const TOKEN_TTL_SECONDS = 60 * 60 * 24;

const getTokenSecret = () =>
  process.env.AUTH_SECRET || process.env.SESSION_SECRET || "chapter10-auth-secret";

const encodeBase64Url = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const toBase64Url = (base64Value) =>
  base64Value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
};

const sign = (payloadBase64) =>
  toBase64Url(crypto.createHmac("sha256", getTokenSecret()).update(payloadBase64).digest("base64"));

const createAuthToken = (user) => {
  const payload = {
    id: String(user._id || user.id),
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  };

  const payloadBase64 = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(payloadBase64);
  return `${payloadBase64}.${signature}`;
};

const verifyAuthToken = (token) => {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const tokenParts = token.split(".");
  if (tokenParts.length !== 2) {
    return null;
  }

  const [payloadBase64, signature] = tokenParts;
  if (!payloadBase64 || !signature) {
    return null;
  }

  const expectedSignature = sign(payloadBase64);
  const givenBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    givenBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(givenBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(payloadBase64));
    if (!payload.id || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    payload.role = normalizeRole(payload.role);
    return payload;
  } catch (error) {
    return null;
  }
};

module.exports = {
  createAuthToken,
  verifyAuthToken
};
