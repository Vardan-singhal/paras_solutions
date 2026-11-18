import { notFound, unstable_rethrow } from 'next/navigation';
import { connection } from 'next/server';
import { cache } from 'react';
import { backendUrl } from './backend-url.mjs';
import { getFallbackData } from './catalog-fallback.js';

// Memoize only within a server render: public content stays fresh on each request.
// AbortSignal opts out of Next's fetch memoization, so deduplicate explicitly.
const requestApi = cache(async (path) => {
  // Service bindings exist at request time, not while Next.js builds the site.
  await connection();
  const url = backendUrl(path);
  let response;
  try {
    response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
  } catch (error) {
    unstable_rethrow(error);
    // Fall back to local catalog data if the backend server is not running
    const fallback = getFallbackData(path);
    return {
      status: fallback.status || (fallback.ok ? 200 : 500),
      ok: fallback.ok,
      json: fallback,
    };
  }
  if (!response.ok && response.status >= 500) {
    const fallback = getFallbackData(path);
    if (fallback.ok) {
      return {
        status: 200,
        ok: true,
        json: fallback,
      };
    }
  }
  return {
    status: response.status,
    ok: response.ok,
    json: response.ok ? await response.json() : null,
  };
});
export async function api(path, { missingIs404 = false } = {}) {
  const response = await requestApi(path);
  if (response.status === 404 && missingIs404) notFound();
  if (!response.ok)
    throw new Error('Content is temporarily unavailable. Please try again shortly.');
  return response.json;
}
export async function content(path, options) {
  return (await api(path, options)).data;
}
export const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export function metadata(title, description, path, image) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: 'website',
      ...(image ? { images: [{ url: image.src, alt: image.alt }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image.src] } : {}),
    },
  };
}
export function jsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
