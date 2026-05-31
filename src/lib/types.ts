export type StoreId =
  | "amazon"
  | "pccomponentes"
  | "mediamarkt"
  | "elcorteingles"
  | "fnac"
  | "ebay"
  | "aliexpress"
  | "booking"
  | "decathlon"
  | "ikea";

export interface ProductOffer {
  store: StoreId;
  url: string;
  price: number;
  note?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  badge: string;
  trending: boolean;
  featured?: boolean;
  dealOfDay?: boolean;
  image: string;
  offers: ProductOffer[];
  videoHook: string;
  keywords: string[];
  pros?: string[];
  cons?: string[];
  specs?: Record<string, string>;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

export interface ProductsData {
  lastUpdated: string;
  products: Product[];
  categories: Category[];
}

export interface StoreInfo {
  label: string;
  color: string;
  network: string;
}

export interface AffiliateConfig {
  market: string;
  currency: string;
  locale: string;
  disclaimer: string;
  networks: Record<string, unknown>;
  stores: Record<StoreId, StoreInfo>;
}

export type SortOption = "discount" | "price-asc" | "price-desc" | "rating" | "reviews";

export interface TopList {
  slug: string;
  title: string;
  description: string;
  productIds: string[];
}
