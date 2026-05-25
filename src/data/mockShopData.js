// TODO: replace with real store API connectors
// Each connector maps to a store's API — search(), getProduct(), placeOrder()
export const MOCK_STORE_CONNECTORS = [
  { id: "builder-depot",   name: "Builder Depot",   apiType: "mock", currency: "EUR", deliveryAvailable: true,  pickupAvailable: true,  address: "12 Riverstone Ave, Berlin",   lat: 52.5214, lng: 13.3984, distance: 2.4, status: "connected" },
  { id: "profi-materials", name: "Profi Materials", apiType: "mock", currency: "EUR", deliveryAvailable: true,  pickupAvailable: true,  address: "28 Tempelhof Ring, Berlin",   lat: 52.4868, lng: 13.4079, distance: 5.1, status: "connected" },
  { id: "fastfix-trade",   name: "FastFix Trade",   apiType: "mock", currency: "EUR", deliveryAvailable: false, pickupAvailable: true,  address: "15 Kranplatz Lane, Berlin",   lat: 52.5312, lng: 13.3918, distance: 1.9, status: "connected" },
  { id: "color-house",     name: "Color House",     apiType: "mock", currency: "EUR", deliveryAvailable: true,  pickupAvailable: true,  address: "63 Malerhof Street, Berlin",  lat: 52.5096, lng: 13.4461, distance: 4.8, status: "connected" },
  { id: "tile-square",     name: "Tile Square",     apiType: "mock", currency: "EUR", deliveryAvailable: true,  pickupAvailable: true,  address: "88 Tempelhof Road, Berlin",   lat: 52.4871, lng: 13.4032, distance: 5.8, status: "connected" },
];

export const PRODUCT_CATEGORIES = [
  "Beton i zaprawy",
  "Płytki",
  "Farby i tynki",
  "Złączniki",
  "Instalacje",
  "Płyty i ocieplenie",
];

// availability: in_stock | limited | preorder | out_of_stock
export const MOCK_PRODUCTS = [
  // Beton i zaprawy
  { id: "p-001", name: "Cement 25kg",                        category: "Beton i zaprawy",    storeId: "builder-depot",   storeName: "Builder Depot",   price:  7.90, unit: "worek",  availability: "in_stock", eta: "Odbiór w 35 min",         etaMinutes:  35, sku: "BD-CEM-25" },
  { id: "p-002", name: "Cement 25kg",                        category: "Beton i zaprawy",    storeId: "profi-materials", storeName: "Profi Materials", price:  7.60, unit: "worek",  availability: "limited",  eta: "Odbiór w 55 min",         etaMinutes:  55, sku: "PM-CEM-25" },
  { id: "p-003", name: "Cement szybkowiążący 25kg",          category: "Beton i zaprawy",    storeId: "builder-depot",   storeName: "Builder Depot",   price:  9.20, unit: "worek",  availability: "in_stock", eta: "Odbiór w 35 min",         etaMinutes:  35, sku: "BD-RCEM-25" },
  { id: "p-004", name: "Mieszanka betonowa 25kg",            category: "Beton i zaprawy",    storeId: "profi-materials", storeName: "Profi Materials", price:  4.50, unit: "worek",  availability: "in_stock", eta: "Odbiór w 55 min",         etaMinutes:  55, sku: "PM-MIX-25" },
  { id: "p-005", name: "Mieszanka betonowa 25kg",            category: "Beton i zaprawy",    storeId: "builder-depot",   storeName: "Builder Depot",   price:  4.80, unit: "worek",  availability: "in_stock", eta: "Odbiór w 35 min",         etaMinutes:  35, sku: "BD-MIX-25" },
  { id: "p-006", name: "Piasek budowlany 25kg",              category: "Beton i zaprawy",    storeId: "profi-materials", storeName: "Profi Materials", price:  3.20, unit: "worek",  availability: "in_stock", eta: "Odbiór w 55 min",         etaMinutes:  55, sku: "PM-SND-25" },
  { id: "p-007", name: "Cegła pełna (szt.)",                 category: "Beton i zaprawy",    storeId: "profi-materials", storeName: "Profi Materials", price:  0.49, unit: "szt.",   availability: "in_stock", eta: "Odbiór w 55 min",         etaMinutes:  55, sku: "PM-BRK-1" },
  { id: "p-008", name: "Cegła pełna (szt.)",                 category: "Beton i zaprawy",    storeId: "builder-depot",   storeName: "Builder Depot",   price:  0.52, unit: "szt.",   availability: "limited",  eta: "Odbiór w 35 min",         etaMinutes:  35, sku: "BD-BRK-1" },

  // Płytki
  { id: "p-009", name: "Płytki ceramiczne 60x60 (m²)",       category: "Płytki",             storeId: "tile-square",     storeName: "Tile Square",     price: 23.50, unit: "m²",     availability: "in_stock", eta: "Odbiór w 2 godz.",        etaMinutes: 120, sku: "TS-CER-6060" },
  { id: "p-010", name: "Płytki porcelanowe 60x60 (m²)",      category: "Płytki",             storeId: "builder-depot",   storeName: "Builder Depot",   price: 21.90, unit: "m²",     availability: "limited",  eta: "Odbiór w 35 min",         etaMinutes:  35, sku: "BD-POR-6060" },
  { id: "p-011", name: "Płytki porcelanowe 60x60 (m²)",      category: "Płytki",             storeId: "tile-square",     storeName: "Tile Square",     price: 24.00, unit: "m²",     availability: "in_stock", eta: "Odbiór w 2 godz.",        etaMinutes: 120, sku: "TS-POR-6060" },
  { id: "p-012", name: "Mozaika ścienna 30x30 (m²)",         category: "Płytki",             storeId: "tile-square",     storeName: "Tile Square",     price: 18.90, unit: "m²",     availability: "in_stock", eta: "Odbiór w 2 godz.",        etaMinutes: 120, sku: "TS-MOS-3030" },
  { id: "p-013", name: "Fuga do płytek 2kg",                 category: "Płytki",             storeId: "tile-square",     storeName: "Tile Square",     price:  8.90, unit: "opak.",  availability: "in_stock", eta: "Odbiór w 2 godz.",        etaMinutes: 120, sku: "TS-GRT-2" },
  { id: "p-014", name: "Fuga do płytek 2kg",                 category: "Płytki",             storeId: "builder-depot",   storeName: "Builder Depot",   price:  7.50, unit: "opak.",  availability: "in_stock", eta: "Odbiór w 35 min",         etaMinutes:  35, sku: "BD-GRT-2" },

  // Farby i tynki
  { id: "p-015", name: "Farba biała wewnętrzna 15L",         category: "Farby i tynki",      storeId: "color-house",     storeName: "Color House",     price: 42.90, unit: "wiadro", availability: "in_stock", eta: "Dostawa dzisiaj do 17:00", etaMinutes: 300, sku: "CH-PWH-15" },
  { id: "p-016", name: "Farba biała wewnętrzna 15L",         category: "Farby i tynki",      storeId: "builder-depot",   storeName: "Builder Depot",   price: 39.50, unit: "wiadro", availability: "limited",  eta: "Odbiór w 35 min",         etaMinutes:  35, sku: "BD-PWH-15" },
  { id: "p-017", name: "Farba elewacyjna 15L",               category: "Farby i tynki",      storeId: "color-house",     storeName: "Color House",     price: 45.30, unit: "wiadro", availability: "preorder", eta: "Dostawa jutro do 08:00",  etaMinutes:1440, sku: "CH-PEX-15" },
  { id: "p-018", name: "Grunt głębokopenetrujący 10L",       category: "Farby i tynki",      storeId: "color-house",     storeName: "Color House",     price: 28.90, unit: "wiadro", availability: "in_stock", eta: "Dostawa dzisiaj do 17:00", etaMinutes: 300, sku: "CH-PRM-10" },
  { id: "p-019", name: "Grunt głębokopenetrujący 10L",       category: "Farby i tynki",      storeId: "builder-depot",   storeName: "Builder Depot",   price: 25.00, unit: "wiadro", availability: "in_stock", eta: "Odbiór w 35 min",         etaMinutes:  35, sku: "BD-PRM-10" },
  { id: "p-020", name: "Silikon uszczelniający 280ml",       category: "Farby i tynki",      storeId: "builder-depot",   storeName: "Builder Depot",   price:  4.90, unit: "szt.",   availability: "in_stock", eta: "Odbiór w 35 min",         etaMinutes:  35, sku: "BD-SIL-280" },
  { id: "p-021", name: "Silikon uszczelniający 280ml",       category: "Farby i tynki",      storeId: "fastfix-trade",   storeName: "FastFix Trade",   price:  5.20, unit: "szt.",   availability: "in_stock", eta: "Odbiór w 20 min",         etaMinutes:  20, sku: "FF-SIL-280" },

  // Złączniki
  { id: "p-022", name: "Wkręty do płyt G-K 5x70 (500 szt.)",category: "Złączniki",          storeId: "fastfix-trade",   storeName: "FastFix Trade",   price: 18.20, unit: "opak.",  availability: "in_stock", eta: "Odbiór w 20 min",         etaMinutes:  20, sku: "FF-SCR-570" },
  { id: "p-023", name: "Wkręty do płyt G-K 5x70 (500 szt.)",category: "Złączniki",          storeId: "builder-depot",   storeName: "Builder Depot",   price: 16.90, unit: "opak.",  availability: "in_stock", eta: "Odbiór w 35 min",         etaMinutes:  35, sku: "BD-SCR-570" },
  { id: "p-024", name: "Wkręty do drewna 4x40 (200 szt.)",  category: "Złączniki",          storeId: "fastfix-trade",   storeName: "FastFix Trade",   price:  8.50, unit: "opak.",  availability: "in_stock", eta: "Odbiór w 20 min",         etaMinutes:  20, sku: "FF-SCR-440" },
  { id: "p-025", name: "Kołki rozporowe 8x40 (100 szt.)",   category: "Złączniki",          storeId: "fastfix-trade",   storeName: "FastFix Trade",   price:  6.80, unit: "opak.",  availability: "in_stock", eta: "Odbiór w 20 min",         etaMinutes:  20, sku: "FF-ANK-840" },

  // Instalacje
  { id: "p-026", name: "Rura PVC 110mm / 2m",               category: "Instalacje",         storeId: "builder-depot",   storeName: "Builder Depot",   price: 14.90, unit: "szt.",   availability: "in_stock", eta: "Odbiór w 35 min",         etaMinutes:  35, sku: "BD-PVC-110" },
  { id: "p-027", name: "Przewód elektryczny 3x2.5mm (100m)", category: "Instalacje",        storeId: "fastfix-trade",   storeName: "FastFix Trade",   price: 89.00, unit: "rolka",  availability: "in_stock", eta: "Odbiór w 20 min",         etaMinutes:  20, sku: "FF-CAB-325" },

  // Płyty i ocieplenie
  { id: "p-028", name: "Płyta OSB 250x125cm gr. 12mm",       category: "Płyty i ocieplenie", storeId: "builder-depot",   storeName: "Builder Depot",   price: 22.50, unit: "szt.",   availability: "in_stock", eta: "Odbiór w 35 min",         etaMinutes:  35, sku: "BD-OSB-12" },
  { id: "p-029", name: "Płyta OSB 250x125cm gr. 12mm",       category: "Płyty i ocieplenie", storeId: "profi-materials", storeName: "Profi Materials", price: 21.00, unit: "szt.",   availability: "limited",  eta: "Odbiór w 55 min",         etaMinutes:  55, sku: "PM-OSB-12" },
  { id: "p-030", name: "Płyta styropianowa 100x50cm gr. 5cm",category: "Płyty i ocieplenie", storeId: "builder-depot",   storeName: "Builder Depot",   price: 12.90, unit: "szt.",   availability: "in_stock", eta: "Odbiór w 35 min",         etaMinutes:  35, sku: "BD-EPS-5" },
];
