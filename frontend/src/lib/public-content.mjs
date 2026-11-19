import { getFallbackData } from './catalog-fallback.js';

// Successful public reads survive temporary outages in this process. The bundled
// snapshot supports cold starts and read-only deployments. Writes never enter here.
export function createPublicContentReader({
  fetcher = fetch,
  fallback = getFallbackData,
  rethrow = () => {},
} = {}) {
  const recent = new Map();
  const remember = (path, json) => {
    recent.delete(path);
    recent.set(path, json);
    if (recent.size > 500) recent.delete(recent.keys().next().value);
  };
  return async function read(path, url) {
    const recover = () => {
      const saved = recent.get(path) || fallback(path);
      return { status: saved.status || (saved.ok ? 200 : 503), ok: saved.ok, json: saved };
    };
    let response;
    let json;
    try {
      response = await fetcher(url, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
      if (response.status >= 500 || response.status === 408 || response.status === 429)
        return recover();
      if (!response.ok) {
        recent.delete(path);
        if (response.status === 404 || response.status === 410) {
          remember(path, { ok: false, status: response.status, data: null });
        }
        return { status: response.status, ok: false, json: null };
      }
      json = await response.json();
      if (json?.ok !== true || !Object.hasOwn(json, 'data'))
        throw new Error('Invalid public response');
    } catch (error) {
      rethrow(error);
      return recover();
    }
    remember(path, json);
    return { status: response.status, ok: true, json };
  };
}
