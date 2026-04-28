export interface FetchWithRetryOptions {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  retryOnStatuses?: number[];
}

const DEFAULT_RETRY_STATUSES = [408, 429, 500, 502, 503, 504];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithTimeoutAndRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    timeoutMs = 10000,
    retries = 1,
    retryDelayMs = 250,
    retryOnStatuses = DEFAULT_RETRY_STATUSES,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!retryOnStatuses.includes(response.status) || attempt === retries) {
        return response;
      }
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt === retries) {
        throw error;
      }
    }

    await sleep(retryDelayMs * (attempt + 1));
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Request failed after retries");
}

export async function fetchJsonWithRetry<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: FetchWithRetryOptions = {}
): Promise<T> {
  const response = await fetchWithTimeoutAndRetry(input, init, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error?: unknown }).error ?? "Request failed")
        : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return (await response.json()) as T;
}
