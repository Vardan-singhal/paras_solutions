import { notFound, unstable_rethrow } from 'next/navigation';
import { connection } from 'next/server';
import { cache } from 'react';
import { backendUrl } from './backend-url.mjs';
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
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    unstable_rethrow(error);
    throw new Error(
      process.env.NODE_ENV === 'production'
        ? 'The website service is temporarily unavailable. Please try again shortly.'
        : 'The backend is unavailable. Run npm run dev from the project root to start the website and API together.',
    );
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
