import { Heart } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { EmptyState } from './EmptyState';

export function WishlistPage({ wishlist, onToggleWishlist }) {
  if (wishlist.length === 0) {
    return (
      <div className="container">
        <EmptyState icon={Heart} title="Votre liste d'envies est vide"
          message="Ajoutez vos articles préférés ici"
          action={{ label: 'Magasiner', onClick: () => window.location.href = '/store' }} />
      </div>
    );
  }
  return (
    <div className="container">
      <div className="section-header">
        <h1>Ma Liste d'Envies</h1>
        <p>{wishlist.length} articles sauvegardés</p>
      </div>
      <div className="products-grid">
        {wishlist.map(product => (
          <ProductCard key={product._id || product.id} product={product}
            onToggleWishlist={onToggleWishlist} isWishlisted={true} />
        ))}
      </div>
    </div>
  );
}