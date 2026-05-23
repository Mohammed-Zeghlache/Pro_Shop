export const STORAGE_KEYS = {
  WISHLIST: 'proshop_wishlist',
};

export const CATEGORIES = {
  't-shirt':     { label: 'T-Shirts',     icon: '👕' },
  'hoodie':      { label: 'Hoodies',      icon: '🧥' },
  'jacket':      { label: 'Jackets',      icon: '🧥' },
  'pants':       { label: 'Pants',        icon: '👖' },
  'shoes':       { label: 'Footwear',     icon: '👟' },
  'accessories': { label: 'Accessories',  icon: '🧢' }
};

export const AVAILABLE_COLORS = [
  'Black', 'White', 'Navy', 'Gray', 'Blue', 'Red', 'Green', 'Yellow',
  'Pink', 'Purple', 'Orange', 'Teal', 'Brown', 'Beige', 'Maroon', 'Olive'
];

export const SORT_OPTIONS = {
  newest:     { label: 'Plus récents',         fn: (a, b) => (b.createdAt || 0) - (a.createdAt || 0) },
  price_asc:  { label: 'Prix: Croissant',      fn: (a, b) => (a.priceDZD || 0) - (b.priceDZD || 0) },
  price_desc: { label: 'Prix: Décroissant',    fn: (a, b) => (b.priceDZD || 0) - (a.priceDZD || 0) },
  rating:     { label: 'Mieux notés',          fn: (a, b) => (b.rating || 0) - (a.rating || 0) },
  popular:    { label: 'Les plus populaires',  fn: (a, b) => (b.sales || 0) - (a.sales || 0) }
};