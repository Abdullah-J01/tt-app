import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

/**
 * File-backed user store — MVP stand-in for a database.
 *
 * Server-only: importing this from a client component fails the build on the
 * `node:` imports above, which is the intended guardrail.
 *
 * Deliberately a JSON file rather than an in-memory Map so accounts survive dev
 * server restarts and HMR. It is NOT production storage: writes are per-process
 * and the filesystem is read-only on most serverless hosts. Production goes
 * through TT's auth endpoints — see the TODO(team) in ./repository.
 */

export interface StoredUser {
  id: string;
  /** Always lowercased — the store treats email as a case-insensitive unique key. */
  email: string;
  name: string;
  /** scrypt hash from ./password. Never a plaintext password. */
  passwordHash: string;
  createdAt: string;
}

interface UserFile {
  users: StoredUser[];
}

const FILE = process.env.USERS_FILE ?? join(process.cwd(), ".data", "users.json");

const EMPTY: UserFile = { users: [] };

/**
 * The file is meant to be hand-editable, so every record is validated field by
 * field. A single malformed entry (null, missing passwordHash, a non-string
 * hash) would otherwise throw deep in login and 500 the route for every user.
 * Bad records are dropped rather than thrown on.
 */
function isStoredUser(value: unknown): value is StoredUser {
  if (!value || typeof value !== "object") return false;
  const u = value as Record<string, unknown>;
  return (
    typeof u.id === "string" &&
    typeof u.email === "string" &&
    typeof u.name === "string" &&
    typeof u.passwordHash === "string" &&
    typeof u.createdAt === "string"
  );
}

async function readFileSafe(): Promise<UserFile> {
  try {
    const parsed: unknown = JSON.parse(await readFile(FILE, "utf8"));
    if (!parsed || typeof parsed !== "object") return EMPTY;
    const { users } = parsed as { users?: unknown };
    if (!Array.isArray(users)) return EMPTY;
    return { users: users.filter(isStoredUser) };
  } catch {
    // Missing file is the normal first-run path.
    return EMPTY;
  }
}

async function write(data: UserFile): Promise<void> {
  await mkdir(dirname(FILE), { recursive: true, mode: 0o700 });
  // Write-then-rename: rename is atomic, so a crash mid-write can't leave a
  // half-written file that would read back as zero users.
  const tmp = `${FILE}.${randomUUID()}.tmp`;
  try {
    // 0600 — the file holds password hashes; default umask would make it
    // world-readable. Set at create time so there's no readable window.
    await writeFile(tmp, JSON.stringify(data, null, 2), { encoding: "utf8", mode: 0o600 });
    await rename(tmp, FILE);
  } catch (error) {
    // Don't leave the temp file behind if the rename failed.
    await rm(tmp, { force: true }).catch(() => undefined);
    throw error;
  }
}

/**
 * Serializes every mutation through one promise chain. Two concurrent signups
 * would otherwise both read the same snapshot and the second write would drop
 * the first user (lost update). Only holds within a process — good enough for
 * a single dev server, and another reason this isn't production storage.
 */
let queue: Promise<unknown> = Promise.resolve();
function exclusive<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  // Keep the chain alive even if this task rejects.
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const key = normalizeEmail(email);
  const { users } = await readFileSafe();
  return users.find((u) => u.email === key) ?? null;
}

/** Returns null when the email is already taken, so callers report it without a second read. */
export async function insertUser(user: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<StoredUser | null> {
  return exclusive(async () => {
    const data = await readFileSafe();
    const key = normalizeEmail(user.email);
    if (data.users.some((u) => u.email === key)) return null;

    const created: StoredUser = {
      id: randomUUID(),
      email: key,
      name: user.name.trim(),
      passwordHash: user.passwordHash,
      createdAt: new Date().toISOString(),
    };
    data.users.push(created);
    await write(data);
    return created;
  });
}
