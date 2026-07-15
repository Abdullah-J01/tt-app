/**
 * Seeds an admin account into the local user store.
 *
 * Admins cannot self-register: roles come from the ADMIN_EMAILS allowlist, so
 * POST /api/auth/signup refuses allowlisted addresses — otherwise anyone could
 * claim the admin email on a fresh deploy and lock the real admin out. This
 * script is the out-of-band path, and it deliberately talks to the repository
 * rather than the HTTP route so it bypasses that block.
 *
 * Usage:
 *   npm run seed:admin -- admin@example.com
 *   ADMIN_SEED_PASSWORD=… npm run seed:admin -- admin@example.com   (non-interactive)
 *
 * After seeding, the admin signs in through the normal login form.
 * TODO(team): drop this once TT owns identity — admin becomes a TT role claim.
 */
// Imports carry explicit .ts extensions and avoid the `@/` alias so plain node
// (which strips types but does no bundler resolution) can run this directly.
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "../src/lib/authRules.ts";
import { isAdminEmail } from "../src/lib/roles.ts";
import { registerUser } from "../src/lib/users/repository.ts";

const die = (msg: string): never => {
  console.error(`✖ ${msg}`);
  process.exit(1);
};

const email = process.argv[2];
if (!email) die("Usage: npm run seed:admin -- <email>  (must be listed in ADMIN_EMAILS)");

if (!process.env.ADMIN_EMAILS) {
  die("ADMIN_EMAILS is not set. Run via `npm run seed:admin` so .env is loaded.");
}

// Seeding a non-allowlisted address would create a plain user and imply admin —
// refuse rather than silently mislead.
if (!isAdminEmail(email)) {
  die(
    `"${email}" is not in ADMIN_EMAILS (${process.env.ADMIN_EMAILS}).\n` +
      `  Add it there first, or sign up normally for a regular account.`,
  );
}

async function readPassword(): Promise<string> {
  const fromEnv = process.env.ADMIN_SEED_PASSWORD;
  if (fromEnv) return fromEnv;
  if (!stdin.isTTY) die("No TTY. Pass the password via ADMIN_SEED_PASSWORD.");

  const rl = createInterface({ input: stdin, output: stdout, terminal: true });
  // Mute the echo so the password never lands on screen or in scrollback.
  const muted = rl as unknown as { output: { write: (s: string) => void } };
  const write = muted.output.write.bind(muted.output);
  let masking = false;
  muted.output.write = (s: string) => {
    if (!masking) write(s);
  };
  const prompt = rl.question("Password: ");
  masking = true;
  const answer = await prompt;
  masking = false;
  write("\n");
  rl.close();
  return answer;
}

const password = await readPassword();
if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
  die(`Password must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters.`);
}

const result = await registerUser({ email, name: "Admin", password });
if (!result.ok) {
  die(
    `An account already exists for ${email}.\n` +
      `  Delete it from .data/users.json to re-seed.`,
  );
}

console.log(`✔ Seeded admin ${result.user.email}. Sign in at /login as usual.`);
