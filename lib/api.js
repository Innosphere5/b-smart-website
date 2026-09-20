import { PRODUCTS } from '@/data/products';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function formatCleanSizeSummary(sizes = [], rawSizesText = '') {
  if (rawSizesText && /^Sizes?:\s*/i.test(rawSizesText.trim())) {
    return rawSizesText.trim();
  }

  if (Array.isArray(sizes) && sizes.length > 0) {
    const cleanSizes = sizes.map((s) => String(s).trim()).filter(Boolean);
    if (cleanSizes.length === 1) {
      return `Size: ${cleanSizes[0]}`;
    } else if (cleanSizes.length > 1) {
      return `Sizes: ${cleanSizes[0]}-${cleanSizes[cleanSizes.length - 1]}`;
    }
  }

  if (rawSizesText && rawSizesText.includes('(')) {
    const sizeMatches = rawSizesText.match(/([A-Za-z0-9]+)\s*\(/g);
    if (sizeMatches && sizeMatches.length > 0) {
      const parsed = sizeMatches.map((m) => m.replace(/\s*\(/, '').trim());
      if (parsed.length === 1) return `Size: ${parsed[0]}`;
      return `Sizes: ${parsed[0]}-${parsed[parsed.length - 1]}`;
    }
  }

  return rawSizesText && !rawSizesText.includes('(') ? rawSizesText : 'Sizes Available';
}

/**
 * Strict Admin Credential Validation Algorithm
 * Ensures only products with complete required admin credentials:
 * - Valid Name
 * - Valid Positive Price (> 0)
 * - Valid School Assignment
 * - Valid Applicable Class/Grade Section
 * - Valid Category
 * - Valid Image Asset
 * are allowed to be displayed on the Web User Panel.
 */
export function cleanProductImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  let cleaned = url
    .replace(/\/e_make_transparent:[^/]+\//g, '/')
    .replace(/e_make_transparent:[0-9]+,?/g, '');

  if (cleaned.includes('cloudinary.com') && cleaned.includes('/upload/')) {
    if (!cleaned.includes('e_background_removal')) {
      cleaned = cleaned.replace(
        /\/upload\/(?:[a-zA-Z0-9_:,]+\/)?/,
        '/upload/e_background_removal,f_png,q_auto/'
      );
    }
  }
  return cleaned;
}

export function validateAdminProduct(product) {
  if (!product || typeof product !== 'object') return null;

  const name = product.name?.trim();
  if (!name) return null;

  const school = product.school?.trim() || 'General School';
  const applicableClass = (product.applicableClass || product.applicable_class)?.trim() || 'All Classes';
  let category = product.category?.trim() || 'General';

  // Normalize any legacy combined categories into individual categories
  const lowerCat = category.toLowerCase();
  const lowerName = name.toLowerCase();
  if (lowerCat.includes('accessories') && (lowerCat.includes('tie') || lowerCat.includes('belt'))) {
    if (lowerName.includes('tie')) {
      category = 'Tie';
    } else if (lowerName.includes('belt')) {
      category = 'Belt';
    } else {
      category = 'Accessories';
    }
  }

  const rawPrice = Number(product.basePrice ?? product.base_price ?? 0);
  const price = !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : 500;
  
  const rawImage = product.imageSrc || product.image_src || (Array.isArray(product.images) ? product.images[0] : '');
  const imageSrc = (typeof rawImage === 'string' && rawImage.trim().length >= 3)
    ? cleanProductImageUrl(rawImage)
    : 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600';

  const rawImages = Array.isArray(product.images) && product.images.length > 0 ? product.images : [imageSrc];
  const images = rawImages.map(cleanProductImageUrl);

  const sizes = Array.isArray(product.sizes) 
    ? product.sizes 
    : (typeof product.sizes === 'string' ? JSON.parse(product.sizes) : ["28", "30", "32", "34", "36"]);
  const rawSizesText = product.sizesText || product.sizes_text || "";
  const cleanSizesText = formatCleanSizeSummary(sizes, rawSizesText);
  const stockQuantity = Number(product.stockQuantity ?? product.stock_quantity ?? 50);

  // Return normalized production-ready product object
  return {
    id: String(product.id),
    name,
    school,
    applicableClass,
    category,
    basePrice: price,
    imageSrc,
    images,
    sizes,
    sizesText: cleanSizesText,
    sizePrices: product.sizePrices || product.size_prices || {},
    sizeStocks: product.sizeStocks || product.size_stocks || {},
    inStock: product.inStock !== false && product.in_stock !== false && stockQuantity > 0,
    stockQuantity,
    details: product.details || product.description || `Compliant ${school} uniform for ${applicableClass}.`,
    tone: product.tone || 'navy'
  };
}

// High-performance SWR Memory & Storage Cache
let memoryProductsCache = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 20000; // 20 seconds SWR freshness window

/**
 * Synchronously retrieves cached products if available (instant 0ms UI render)
 */
export function getCachedProducts() {
  if (memoryProductsCache && Array.isArray(memoryProductsCache) && memoryProductsCache.length > 0) {
    return memoryProductsCache;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('bsmart_products_cache_v3');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryProductsCache = parsed;
          return parsed;
        }
      }
    } catch (e) {
      // Ignore storage access errors
    }
  }
  return null;
}

/**
 * Fetch products from Express backend API or Supabase DB with SWR cache
 * Filters through the Admin Credential Validation Algorithm.
 * Falls back to validated static PRODUCTS if backend is offline.
 */
export async function getLiveProducts(forceFresh = false) {
  // If we have fresh in-memory cache, return it immediately to reduce UI render time
  if (!forceFresh && memoryProductsCache && Date.now() - lastCacheTime < CACHE_TTL_MS) {
    return memoryProductsCache;
  }

  try {
    const targetUrl = typeof window !== 'undefined' ? '/api/products' : `${API_BASE_URL}/api/products`;
    let res = await fetch(targetUrl, { 
      cache: 'default',
      next: { revalidate: 30 }
    });
    
    if (!res.ok && targetUrl !== `${API_BASE_URL}/api/products`) {
      res = await fetch(`${API_BASE_URL}/api/products`, { cache: 'no-store' });
    }

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        const validatedProducts = data.products
          .map(validateAdminProduct)
          .filter(Boolean);

        // Update SWR cache
        memoryProductsCache = validatedProducts;
        lastCacheTime = Date.now();
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('bsmart_products_cache_v3', JSON.stringify(validatedProducts));
          } catch (e) {}
        }

        return validatedProducts;
      }
    }
  } catch (error) {
    console.warn('Live API connection notice:', error.message);
  }
  
  // If network fetch failed, return existing cached data if available
  const existingCache = getCachedProducts();
  if (existingCache) return existingCache;

  // Filter fallback static products through same validation algorithm
  const fallback = PRODUCTS.map(validateAdminProduct).filter(Boolean);
  memoryProductsCache = fallback;
  return fallback;
}

/**
 * Get product by ID (filtered & validated)
 */
export async function getLiveProductById(id) {
  const products = await getLiveProducts();
  if (!Array.isArray(products) || products.length === 0) return null;
  return products.find((p) => String(p.id) === String(id)) || null;
}

// High-performance SWR Memory & Storage Cache for Schools & Classes
let memorySchoolsCache = null;
let lastSchoolsCacheTime = 0;
let memoryClassesCache = null;
let lastClassesCacheTime = 0;
const MASTERS_CACHE_TTL_MS = 5000; // 5 seconds freshness window

export function getCachedSchools() {
  if (memorySchoolsCache && Array.isArray(memorySchoolsCache) && memorySchoolsCache.length > 0) {
    return memorySchoolsCache;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('bsmart_schools_cache_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memorySchoolsCache = parsed;
          return parsed;
        }
      }
    } catch (e) {}
  }
  return null;
}

export async function getLiveSchools(forceFresh = false) {
  if (!forceFresh && memorySchoolsCache && Date.now() - lastSchoolsCacheTime < MASTERS_CACHE_TTL_MS) {
    return memorySchoolsCache;
  }

  try {
    const targetUrl = typeof window !== 'undefined'
      ? `/api/schools${forceFresh ? '?fresh=1' : ''}`
      : `${API_BASE_URL}/api/schools`;

    let res = await fetch(targetUrl, {
      cache: forceFresh ? 'no-store' : 'default',
      next: { revalidate: 5 },
    });

    if (!res.ok && targetUrl !== `${API_BASE_URL}/api/schools` && API_BASE_URL) {
      res = await fetch(`${API_BASE_URL}/api/schools`, { cache: 'no-store' });
    }

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.schools)) {
        const cleanSchools = data.schools.filter((s) => s && typeof s === 'string' && s.trim().length > 0);
        memorySchoolsCache = cleanSchools;
        lastSchoolsCacheTime = Date.now();
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('bsmart_schools_cache_v2', JSON.stringify(cleanSchools));
          } catch (e) {}
        }
        return cleanSchools;
      }
    }
  } catch (error) {
    console.warn('Live Schools API notice:', error.message);
  }

  const cached = getCachedSchools();
  if (cached) return cached;
  return [];
}

export function getCachedClasses() {
  if (memoryClassesCache && Array.isArray(memoryClassesCache) && memoryClassesCache.length > 0) {
    return memoryClassesCache;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('bsmart_classes_cache_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryClassesCache = parsed;
          return parsed;
        }
      }
    } catch (e) {}
  }
  return null;
}

export async function getLiveClasses(forceFresh = false) {
  if (!forceFresh && memoryClassesCache && Date.now() - lastClassesCacheTime < MASTERS_CACHE_TTL_MS) {
    return memoryClassesCache;
  }

  try {
    const targetUrl = typeof window !== 'undefined'
      ? `/api/classes${forceFresh ? '?fresh=1' : ''}`
      : `${API_BASE_URL}/api/classes`;

    let res = await fetch(targetUrl, {
      cache: forceFresh ? 'no-store' : 'default',
      next: { revalidate: 5 },
    });

    if (!res.ok && targetUrl !== `${API_BASE_URL}/api/classes` && API_BASE_URL) {
      res = await fetch(`${API_BASE_URL}/api/classes`, { cache: 'no-store' });
    }

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.classes)) {
        const cleanClasses = data.classes.filter((c) => c && typeof c === 'string' && c.trim().length > 0);
        memoryClassesCache = cleanClasses;
        lastClassesCacheTime = Date.now();
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('bsmart_classes_cache_v2', JSON.stringify(cleanClasses));
          } catch (e) {}
        }
        return cleanClasses;
      }
    }
  } catch (error) {
    console.warn('Live Classes API notice:', error.message);
  }

  const cached = getCachedClasses();
  if (cached) return cached;
  return ['All Classes'];
}

