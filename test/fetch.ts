import { vi } from "vitest";

export type MockFetchResponse = {
  status?: number;
  json?: unknown;
};

/**
 * Spies on `globalThis.fetch` and resolves the next call with a JSON `Response`.
 */
export function mockFetchOnce(response: MockFetchResponse): ReturnType<
  typeof vi.spyOn
> {
  const { status = 200, json = {} } = response;
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(json), {
      status,
      statusText: status < 400 ? "OK" : "Error",
    }),
  );
}

export function mockFetchSequence(
  responses: MockFetchResponse[],
): ReturnType<typeof vi.spyOn> {
  const spy = vi.spyOn(globalThis, "fetch");
  for (const r of responses) {
    const { status = 200, json = {} } = r;
    spy.mockResolvedValueOnce(
      new Response(JSON.stringify(json), {
        status,
        statusText: status < 400 ? "OK" : "Error",
      }),
    );
  }
  return spy;
}
