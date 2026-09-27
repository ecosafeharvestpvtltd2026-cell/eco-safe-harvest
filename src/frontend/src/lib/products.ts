import { Product } from "@/backend";

/** Sinhala display labels for every harvest product. */
export const PRODUCT_LABELS: Record<Product, string> = {
  [Product.passion]: "පැශන්",
  [Product.pear]: "පේර",
  [Product.guava]: "ගස්ලබු",
  [Product.banana]: "කෙසෙල්",
  [Product.woodApple]: "දිවුල්",
  [Product.mustard]: "අබ",
  [Product.other]: "වෙනත්",
};

/** Stable display order for product pickers and price lists. */
export const PRODUCT_ORDER: Product[] = [
  Product.passion,
  Product.pear,
  Product.guava,
  Product.banana,
  Product.woodApple,
  Product.mustard,
  Product.other,
];

export function productLabel(product: Product): string {
  return PRODUCT_LABELS[product] ?? "වෙනත්";
}
