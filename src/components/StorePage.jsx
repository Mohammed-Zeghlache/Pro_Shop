import { useState, useMemo } from 'react';
import { Filter, ShoppingBag } from 'lucide-react';
import { CATEGORIES, SORT_OPTIONS } from '../constants';
import { formatDZD } from '../utils/helpers';
import { ProductCard } from './ProductCard';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';

export function StorePage({ products, loading, onToggleWishlist, wishlist, searchQuery, setSearchQuery }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRangeDZD, setPriceRangeDZD] = useState({ min: 0, max: 100000 });
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPrice = (product.priceDZD || 0) >= priceRangeDZD.min && (product.priceDZD || 0) <= priceRangeDZD.max;
      return matchesCategory && matchesSearch && matchesPrice;
    });
    
    const sortFn = SORT_OPTIONS[sortBy]?.fn || SORT_OPTIONS.newest.fn;
    filtered.sort(sortFn);
    return filtered;
  }, [products, selectedCategory, searchQuery, sortBy, priceRangeDZD]);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceRangeDZD({ min: 0, max: 100000 });
    setSortBy('newest');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="store-page">
      <div className="store-header">
        <div className="container">
          <h1>Notre Collection</h1>
          <p>{products.length} produits disponibles</p>
        </div>
      </div>
      <div className="container">
        <div className="store-controls">
          <div className="filters-bar">
            <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={18} /> Filtres
            </button>
            <div className="category-filters">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? 'Tous' : (CATEGORIES[cat]?.label || cat)}
                </button>
              ))}
            </div>
            <div className="sort-select">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {Object.entries(SORT_OPTIONS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="filter-panel">
              <div className="filter-group">
                <label>Prix Minimum: {formatDZD(priceRangeDZD.min)}</label>
                <input type="range" min="0" max="100000" step="1000"
                  value={priceRangeDZD.min}
                  onChange={(e) => setPriceRangeDZD({ ...priceRangeDZD, min: parseInt(e.target.value) })} />
              </div>
              <div className="filter-group">
                <label>Prix Maximum: {formatDZD(priceRangeDZD.max)}</label>
                <input type="range" min="0" max="100000" step="1000"
                  value={priceRangeDZD.max}
                  onChange={(e) => setPriceRangeDZD({ ...priceRangeDZD, max: parseInt(e.target.value) })} />
              </div>
              <button className="clear-filters-btn" onClick={clearAllFilters}>Effacer les Filtres</button>
            </div>
          )}
        </div>

        <div className="products-info">
          <p>{filteredProducts.length} produits trouvés</p>
        </div>

        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Aucun produit trouvé"
            message="Essayez d'ajuster vos filtres"
            action={{ label: 'Effacer les Filtres', onClick: clearAllFilters }}
          />
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.some(item => (item._id || item.id) === (product._id || product.id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}