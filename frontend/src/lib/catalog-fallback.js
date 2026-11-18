import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const catalog = require('../data/catalog.json');

export function getFallbackData(pathAndQuery) {
  const [pathname, queryString] = pathAndQuery.split('?');
  const params = new URLSearchParams(queryString || '');
  const cleanPath = pathname.replace(/^\/api\/v1/, '').replace(/^\//, '');
  const parts = cleanPath.split('/').filter(Boolean);

  if (cleanPath === 'settings/public') {
    return { ok: true, data: catalog.settings };
  }

  if (cleanPath === 'calculator/settings') {
    return { ok: true, data: catalog.calculator };
  }

  if (cleanPath === 'gallery/categories') {
    const categories = Array.from(new Set((catalog.gallery || []).map((g) => g.category).filter(Boolean)));
    return { ok: true, data: categories };
  }

  if (cleanPath === 'certifications') {
    return { ok: true, data: [] };
  }

  const resourceType = parts[0];
  const resourceSlug = parts[1];

  let list = [];
  if (resourceType === 'products') list = catalog.products || [];
  else if (resourceType === 'categories') list = catalog.categories || [];
  else if (resourceType === 'industries') list = catalog.industries || [];
  else if (resourceType === 'pages') list = catalog.pages || [];
  else if (resourceType === 'blogs') list = catalog.blogs || [];
  else if (resourceType === 'case-studies') list = catalog.caseStudies || [];
  else if (resourceType === 'clients') list = catalog.clients || [];
  else if (resourceType === 'testimonials') list = catalog.testimonials || [];
  else if (resourceType === 'machines') list = catalog.machines || [];
  else if (resourceType === 'gallery') list = catalog.gallery || [];
  else {
    return { ok: true, data: null };
  }

  if (resourceSlug) {
    const decodedSlug = decodeURIComponent(resourceSlug);
    const item = list.find((i) => i.slug === decodedSlug);
    if (!item) {
      return { ok: false, status: 404, data: null };
    }
    return { ok: true, data: item };
  }

  // Filter list
  let filtered = [...list];
  if (params.get('featured') === 'true') {
    filtered = filtered.filter((i) => i.primary);
  }
  if (params.get('category')) {
    const cat = params.get('category');
    filtered = filtered.filter((i) => i.categorySlug === cat || i.category === cat);
  }
  if (params.get('search')) {
    const term = params.get('search').toLowerCase();
    filtered = filtered.filter((i) =>
      (i.name || i.title || '').toLowerCase().includes(term)
    );
  }

  const limit = parseInt(params.get('limit') || '100', 10);
  const page = parseInt(params.get('page') || '1', 10);
  const total = filtered.length;
  const paged = filtered.slice((page - 1) * limit, page * limit);

  return {
    ok: true,
    data: paged,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}
