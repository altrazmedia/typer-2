export function makeJsonRequest(
  body: unknown,
  options: { method?: string; url?: string } = {},
): Request {
  const { method = "POST", url = "http://test.local/api" } = options;
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Body that makes `request.json()` throw in handlers that wrap JSON parse in try/catch. */
export function makeInvalidJsonRequest(url = "http://test.local/api"): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "not-valid-json{",
  });
}
