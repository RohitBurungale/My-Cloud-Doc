const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12;
const SECRET = "my-super-secret-key-123";

async function getKey() {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("appwrite-docs"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptFile(file) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const buffer = await file.arrayBuffer();
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    buffer
  );

  // ✅ RETURN ONLY BLOB
  return new Blob(
    [iv, new Uint8Array(encrypted)],
    { type: "application/octet-stream" }
  );
}

export async function decryptFile(blob) {
  const key = await getKey();
  const buffer = await blob.arrayBuffer();

  const iv = buffer.slice(0, IV_LENGTH);
  const data = buffer.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: new Uint8Array(iv) },
    key,
    data
  );

  return new Blob([decrypted]);
}
