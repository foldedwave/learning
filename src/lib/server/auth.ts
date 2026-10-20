import { hash, verify } from '@node-rs/argon2';
import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gte, isNull } from 'drizzle-orm';
import type { Db } from './db/client.ts';
import { authSession, child, parent, pinAttempt, type Role } from './db/schema.ts';

export const SESSION_COOKIE = 'session';

/** Idle time before a session expires. */
export const IDLE_MS: Record<Role, number> = {
	child: 4 * 60 * 60 * 1000,
	parent: 30 * 60 * 1000
};

export const LOCKOUT_FAILURES = 5;
export const LOCKOUT_WINDOW_MS = 10 * 60 * 1000;

/** Pictures for a child's 3-picture PIN. The PIN is stored as a hash of the chosen ids. */
export const PIN_PICTURES = ['🐶', '🐱', '🦊', '🐸', '🐵', '🦁', '🐼', '🐧', '🐙'] as const;

// argon2id with OWASP's minimum recommended parameters
const ARGON2 = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

export const hashPin = (pin: string) => hash(pin, ARGON2);
export const verifyPin = (pinHash: string, pin: string) => verify(pinHash, pin).catch(() => false);

export const isDigitPin = (pin: string) => /^\d{4,6}$/.test(pin);
export const isPicturePin = (pin: string) => /^[0-8]-[0-8]-[0-8]$/.test(pin);

const sha256 = (token: string) => createHash('sha256').update(token).digest('hex');

export interface SessionUser {
	role: Role;
	childId: number | null;
}

export function createSession(
	db: Db,
	user: SessionUser,
	now = new Date()
): { token: string; expiresAt: Date } {
	const token = randomBytes(32).toString('base64url');
	const expiresAt = new Date(now.getTime() + IDLE_MS[user.role]);
	db.insert(authSession)
		.values({
			id: sha256(token),
			role: user.role,
			childId: user.childId,
			expiresAt: expiresAt.toISOString(),
			lastSeenAt: now.toISOString()
		})
		.run();
	return { token, expiresAt };
}

/** Looks up a session token and slides its idle expiry. Returns null if missing or expired. */
export function validateSession(
	db: Db,
	token: string,
	now = new Date()
): (SessionUser & { expiresAt: Date }) | null {
	const id = sha256(token);
	const row = db.select().from(authSession).where(eq(authSession.id, id)).get();
	if (!row) return null;
	if (new Date(row.expiresAt) <= now) {
		db.delete(authSession).where(eq(authSession.id, id)).run();
		return null;
	}
	if (row.childId !== null) {
		const kid = db
			.select({ archivedAt: child.archivedAt })
			.from(child)
			.where(eq(child.id, row.childId))
			.get();
		if (!kid || kid.archivedAt) return null;
	}
	let expiresAt = new Date(row.expiresAt);
	// Only write when at least a minute has passed, to keep page loads read-only most of the time
	if (now.getTime() - new Date(row.lastSeenAt).getTime() > 60_000) {
		expiresAt = new Date(now.getTime() + IDLE_MS[row.role]);
		db.update(authSession)
			.set({ lastSeenAt: now.toISOString(), expiresAt: expiresAt.toISOString() })
			.where(eq(authSession.id, id))
			.run();
	}
	return { role: row.role, childId: row.childId, expiresAt };
}

export function deleteSession(db: Db, token: string) {
	db.delete(authSession)
		.where(eq(authSession.id, sha256(token)))
		.run();
}

const attemptScope = (role: Role, childId: number | null) =>
	and(
		eq(pinAttempt.role, role),
		childId === null ? isNull(pinAttempt.childId) : eq(pinAttempt.childId, childId)
	);

/**
 * True when 5 failed attempts within 10 minutes (with no success since) happened
 * less than 10 minutes ago. Attempts made while locked are not recorded.
 */
export function isLockedOut(db: Db, role: Role, childId: number | null, now = new Date()): boolean {
	const since = new Date(now.getTime() - 2 * LOCKOUT_WINDOW_MS).toISOString();
	const recent = db
		.select({ success: pinAttempt.success, createdAt: pinAttempt.createdAt })
		.from(pinAttempt)
		.where(and(attemptScope(role, childId), gte(pinAttempt.createdAt, since)))
		.orderBy(pinAttempt.id)
		.all();
	const lastSuccess = recent.findLastIndex((r) => r.success);
	const failures = recent.slice(lastSuccess + 1).map((r) => Date.parse(r.createdAt));
	if (failures.length < LOCKOUT_FAILURES) return false;
	const window = failures.slice(-LOCKOUT_FAILURES);
	const lockedAt = window[window.length - 1];
	return lockedAt - window[0] <= LOCKOUT_WINDOW_MS && now.getTime() - lockedAt < LOCKOUT_WINDOW_MS;
}

export function recordPinAttempt(
	db: Db,
	role: Role,
	childId: number | null,
	success: boolean,
	now = new Date()
) {
	db.insert(pinAttempt).values({ role, childId, success, createdAt: now.toISOString() }).run();
}

export type SignInResult =
	| { ok: true; token: string; expiresAt: Date }
	| { ok: false; reason: 'locked' | 'wrong' | 'unknown' };

export async function signInParent(db: Db, pin: string, now = new Date()): Promise<SignInResult> {
	const row = db.select().from(parent).where(eq(parent.id, 1)).get();
	if (!row) return { ok: false, reason: 'unknown' };
	if (isLockedOut(db, 'parent', null, now)) return { ok: false, reason: 'locked' };
	const ok = await verifyPin(row.pinHash, pin);
	recordPinAttempt(db, 'parent', null, ok, now);
	if (!ok) return { ok: false, reason: 'wrong' };
	return { ok: true, ...createSession(db, { role: 'parent', childId: null }, now) };
}

export async function signInChild(
	db: Db,
	childId: number,
	pin: string | null,
	now = new Date()
): Promise<SignInResult> {
	const row = db.select().from(child).where(eq(child.id, childId)).get();
	if (!row || row.archivedAt) return { ok: false, reason: 'unknown' };
	if (row.pinHash) {
		if (isLockedOut(db, 'child', childId, now)) return { ok: false, reason: 'locked' };
		const ok = pin !== null && (await verifyPin(row.pinHash, pin));
		recordPinAttempt(db, 'child', childId, ok, now);
		if (!ok) return { ok: false, reason: 'wrong' };
	}
	return { ok: true, ...createSession(db, { role: 'child', childId }, now) };
}

export const hasParent = (db: Db) => !!db.select({ id: parent.id }).from(parent).get();
