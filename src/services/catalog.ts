// Explicit demonstration data. Prices, inventory and specifications are illustrative.
export const categories = [
  { id: 'laptops', name: 'PC portables', symbol: '▱' },
  { id: 'desktops', name: 'PC de bureau', symbol: '▣' },
  { id: 'phones', name: 'Smartphones', symbol: '▯' },
  { id: 'components', name: 'Composants', symbol: '◈' },
  { id: 'accessories', name: 'Périphériques', symbol: '⌨' },
] as const;
export type CategoryId = typeof categories[number]['id'];
export type Product = {
  id: string; name: string; brand: string; category: CategoryId;
  price: number; previousPrice?: number; stock: number; ram: number; storage: number;
  description: string; specs: Record<string, string>; image: string; badge?: string;
};
const images = {
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
  desktop: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&auto=format&fit=crop&q=80',
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
  keyboard: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
  component: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
};
export const products: Product[] = [
  { id: 'zenbook-14', name: 'Zenbook 14 OLED', brand: 'ASUS', category: 'laptops', price: 1099, previousPrice: 1299, stock: 8, ram: 16, storage: 512, badge: 'Notre sélection', image: images.laptop, description: 'Un portable léger pour travailler, créer et profiter de vos contenus sur un écran OLED.', specs: { Processeur: 'Intel Core Ultra 5', Écran: '14 pouces OLED', Mémoire: '16 Go', Stockage: 'SSD 512 Go', Système: 'Windows 11' } },
  { id: 'macbook-air', name: 'MacBook Air 13', brand: 'Apple', category: 'laptops', price: 1199, stock: 5, ram: 16, storage: 256, image: images.laptop, description: 'Un ordinateur compact et silencieux pour les études et les projets du quotidien.', specs: { Processeur: 'Apple M3', Écran: '13,6 pouces', Mémoire: '16 Go', Stockage: 'SSD 256 Go', Système: 'macOS' } },
  { id: 'legion-5', name: 'Legion 5 Gaming', brand: 'Lenovo', category: 'laptops', price: 1499, previousPrice: 1699, stock: 3, ram: 32, storage: 1024, badge: 'Gaming', image: images.laptop, description: 'Une configuration pour jouer et créer, avec une carte graphique dédiée et un écran fluide.', specs: { Processeur: 'AMD Ryzen 7', Graphismes: 'NVIDIA GeForce RTX 4060', Écran: '16 pouces · 165 Hz', Mémoire: '32 Go', Stockage: 'SSD 1 To' } },
  { id: 'inspiron-15', name: 'Inspiron 15', brand: 'Dell', category: 'laptops', price: 649, stock: 0, ram: 8, storage: 512, image: images.laptop, description: 'Un grand écran et une configuration polyvalente pour la bureautique.', specs: { Processeur: 'Intel Core i5', Écran: '15,6 pouces Full HD', Mémoire: '8 Go', Stockage: 'SSD 512 Go' } },
  { id: 'rog-tower', name: 'ROG Tower Gaming', brand: 'ASUS', category: 'desktops', price: 1799, stock: 4, ram: 32, storage: 1024, image: images.desktop, description: 'Un PC de bureau dédié au jeu, à la création et aux usages exigeants.', specs: { Processeur: 'Intel Core i7', Graphismes: 'NVIDIA GeForce RTX 4070', Mémoire: '32 Go', Stockage: 'SSD 1 To', Système: 'Windows 11' } },
  { id: 'ideacentre', name: 'IdeaCentre Mini', brand: 'Lenovo', category: 'desktops', price: 599, stock: 12, ram: 16, storage: 512, image: images.desktop, description: 'Un ordinateur de bureau compact pour un espace de travail bien organisé.', specs: { Processeur: 'Intel Core i5', Mémoire: '16 Go', Stockage: 'SSD 512 Go', Connectique: 'USB-C · HDMI · Ethernet' } },
  { id: 'iphone-15', name: 'iPhone 15', brand: 'Apple', category: 'phones', price: 749, previousPrice: 869, stock: 15, ram: 6, storage: 128, badge: 'À découvrir', image: images.phone, description: 'Un smartphone polyvalent pour la photo, les appels et toutes vos applications.', specs: { Écran: '6,1 pouces OLED', Stockage: '128 Go', Photo: 'Capteur principal 48 Mpx', Connectique: 'USB-C', Réseau: '5G' } },
  { id: 'galaxy-s24', name: 'Galaxy S24', brand: 'Samsung', category: 'phones', price: 699, stock: 7, ram: 8, storage: 256, image: images.phone, description: 'Un smartphone compact avec un écran lumineux et un appareil photo polyvalent.', specs: { Écran: '6,2 pouces AMOLED', Mémoire: '8 Go', Stockage: '256 Go', Réseau: '5G', Système: 'Android' } },
  { id: 'pixel-8', name: 'Pixel 8', brand: 'Google', category: 'phones', price: 499, stock: 0, ram: 8, storage: 128, image: images.phone, description: 'Un smartphone Android centré sur la photographie et les usages du quotidien.', specs: { Écran: '6,2 pouces OLED', Mémoire: '8 Go', Stockage: '128 Go', Réseau: '5G' } },
  { id: 'rtx-4060', name: 'GeForce RTX 4060', brand: 'MSI', category: 'components', price: 329, stock: 9, ram: 0, storage: 0, image: images.component, description: 'Une carte graphique pour assembler ou faire évoluer votre PC de jeu.', specs: { Mémoire: '8 Go GDDR6', Interface: 'PCI Express 4.0', Sorties: 'HDMI · DisplayPort', Format: 'Double ventilateur' } },
  { id: 'ssd-990', name: '990 PRO SSD 1 To', brand: 'Samsung', category: 'components', price: 109, previousPrice: 139, stock: 22, ram: 0, storage: 1024, image: images.component, description: 'Un SSD interne pour accélérer le démarrage et le chargement de vos applications.', specs: { Capacité: '1 To', Format: 'M.2 2280', Interface: 'NVMe PCIe 4.0', Type: 'SSD interne' } },
  { id: 'mx-keys', name: 'MX Keys S', brand: 'Logitech', category: 'accessories', price: 109, stock: 18, ram: 0, storage: 0, image: images.keyboard, description: 'Un clavier sans fil confortable pour votre espace de travail.', specs: { Disposition: 'AZERTY français', Connexion: 'Bluetooth · Récepteur USB', Éclairage: 'Rétroéclairage', Compatibilité: 'Windows · macOS' } },
];
export type CatalogFilters = { query: string; category: CategoryId | 'all'; brands: string[]; minPrice: string; maxPrice: string; inStock: boolean; ram: number[]; storage: number[] };
export const defaultFilters: CatalogFilters = { query: '', category: 'all', brands: [], minPrice: '', maxPrice: '', inStock: false, ram: [], storage: [] };
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const parsePrice = (value: string) => value.trim() === '' ? undefined : Number(value.replace(',', '.'));
export function validPriceRange(filters: CatalogFilters) {
  const min = parsePrice(filters.minPrice), max = parsePrice(filters.maxPrice);
  return (min === undefined || Number.isFinite(min) && min >= 0) && (max === undefined || Number.isFinite(max) && max >= 0) && (min === undefined || max === undefined || min <= max);
}
export function filterProducts(items: Product[], filters: CatalogFilters): Product[] {
  if (!validPriceRange(filters)) return [];
  const min = parsePrice(filters.minPrice), max = parsePrice(filters.maxPrice);
  const words = normalize(filters.query).trim().split(/\s+/).filter(Boolean);
  return items.filter(p => {
    const text = normalize([p.name, p.brand, p.description, categories.find(c => c.id === p.category)?.name, ...Object.values(p.specs)].join(' '));
    return words.every(word => text.includes(word)) && (filters.category === 'all' || p.category === filters.category)
      && (!filters.brands.length || filters.brands.includes(p.brand)) && (!filters.inStock || p.stock > 0)
      && (min === undefined || p.price >= min) && (max === undefined || p.price <= max)
      && (!filters.ram.length || filters.ram.includes(p.ram)) && (!filters.storage.length || filters.storage.includes(p.storage));
  });
}
export const formatPrice = (price: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
export const getProduct = (id: string) => products.find(p => p.id === id);
