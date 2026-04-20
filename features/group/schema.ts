export type GroupNameInput = { name: string };
export type AddMemberInput = { email: string };

export function parseGroupNameBody(body: unknown): GroupNameInput | null {
  if (!body || typeof body !== "object") return null;
  const name = (body as { name?: unknown }).name;
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  return { name: trimmed };
}

export function parseAddMemberBody(body: unknown): AddMemberInput | null {
  if (!body || typeof body !== "object") return null;
  const email = (body as { email?: unknown }).email;
  if (typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return null;
  return { email: trimmed };
}
