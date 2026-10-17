export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/account',
          '/cart',
          '/checkout',
          '/order-confirmation',
          '/orders',
          '/forgot-password',
          '/login',
          '/register',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/account',
          '/cart',
          '/checkout',
          '/order-confirmation',
          '/orders',
        ],
      },
    ],
    sitemap: 'https://bsmartdresses.com/sitemap.xml',
    host: 'https://bsmartdresses.com',
  };
}
