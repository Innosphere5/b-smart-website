export const PRODUCTS = [];

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}
