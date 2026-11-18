import { notFound, unstable_rethrow } from 'next/navigation';
const origin = process.env.API_INTERNAL_URL || 'http://127.0.0.1:4000';
export async function api(path, { missingIs404 = false } = {}) {
  let response;
  try {
    response = await fetch(`${origin}/api/v1${path}`, {
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
  if (response.status === 404 && missingIs404) notFound();
  if (!response.ok)
    throw new Error('Content is temporarily unavailable. Please try again shortly.');
  const json = await response.json();
  return json;
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
