export async function readJson(res: Response): Promise<{
  status: number;
  body: unknown;
}> {
  const status = res.status;
  const body = await res.json();
  return { status, body };
}
