/**
 * Store service — stub for future partner API integration.
 *
 * TODO: Wire these functions to real partner APIs or an internal
 * data-ingestion pipeline once partner agreements are in place.
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface PartnerStore {
  /** Unique store identifier from the partner feed */
  id: string;
  /** Human-readable store name */
  name: string;
  /** Street address */
  address: string;
  /** City */
  city: string;
  /** ISO 3166-1 alpha-2 country code */
  country: string;
  /** Latitude in decimal degrees */
  lat: number;
  /** Longitude in decimal degrees */
  lng: number;
  /** Partner-specific chain identifier, if applicable */
  chainId?: string;
  /** Store phone number */
  phone?: string;
  /** Store website URL */
  website?: string;
}

export interface StoreInventoryFeed {
  /** Store identifier this feed belongs to */
  storeId: string;
  /** ISO 8601 timestamp of the last feed update */
  fetchedAt: string;
  items: StoreInventoryItem[];
}

export interface StoreInventoryItem {
  /** Partner SKU or product code */
  sku: string;
  /** Product display name */
  productName: string;
  /** Category label (e.g. "Concrete", "Electrical") */
  category: string;
  /** Whether the item is currently in stock */
  inStock: boolean;
  /** Rough stock level: "ok" | "low" | "out" */
  stockLevel: "ok" | "low" | "out";
  /** Estimated pickup time in minutes, if available */
  pickupEtaMinutes?: number;
}

export interface StorePriceFeed {
  /** Store identifier this feed belongs to */
  storeId: string;
  /** ISO 8601 timestamp of the last feed update */
  fetchedAt: string;
  prices: StorePriceItem[];
}

export interface StorePriceItem {
  /** Partner SKU or product code */
  sku: string;
  /** Price in the store's local currency */
  price: number;
  /** ISO 4217 currency code (e.g. "PLN", "EUR") */
  currency: string;
  /** Unit of measure (e.g. "bag", "m²", "piece") */
  unit: string;
}

// ---------------------------------------------------------------------------
// Stub functions
// ---------------------------------------------------------------------------

/**
 * Fetch a list of partner stores optionally filtered by city or country.
 *
 * TODO: Replace stub with HTTP call to the partner store-locator API.
 */
export async function getPartnerStores(
  _filters: { city?: string; country?: string } = {}
): Promise<PartnerStore[]> {
  // TODO: Call partner store-locator API endpoint
  // Example: GET https://api.partner.example/stores?city=Berlin&country=DE
  return [];
}

/**
 * Fetch the latest inventory feed for a specific store.
 *
 * TODO: Replace stub with HTTP call to the partner inventory feed API.
 */
export async function getStoreInventory(storeId: string): Promise<StoreInventoryFeed | null> {
  // TODO: Call partner inventory endpoint
  // Example: GET https://api.partner.example/stores/{storeId}/inventory
  void storeId;
  return null;
}

/**
 * Fetch the latest price feed for a specific store.
 *
 * TODO: Replace stub with HTTP call to the partner price feed API.
 */
export async function getStorePrices(storeId: string): Promise<StorePriceFeed | null> {
  // TODO: Call partner price endpoint
  // Example: GET https://api.partner.example/stores/{storeId}/prices
  void storeId;
  return null;
}

/**
 * Search across all partner stores for a given product keyword,
 * returning combined store + inventory + price data.
 *
 * TODO: Implement once individual feed functions are wired up.
 */
export async function searchProductAcrossStores(
  _keyword: string,
  _location?: { lat: number; lng: number }
): Promise<{ store: PartnerStore; inventory: StoreInventoryItem; price?: StorePriceItem }[]> {
  // TODO: Fetch stores, filter inventory by keyword, merge prices
  return [];
}
