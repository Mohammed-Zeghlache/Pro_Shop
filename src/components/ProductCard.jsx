import { useState } from 'react';
import { Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { getColorStyle, formatDZD } from '../utils/helpers';
import { RatingStars } from './RatingStars';

export function ProductCard({ product, onToggleWishlist, isWishlisted }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Black');

  const discountPercent = product.oldPriceDZD
    ? Math.round(((product.oldPriceDZD - product.priceDZD) / product.oldPriceDZD) * 100)
    : 0;

  const handleWhatsAppOrder = () => {
    const phoneNumber = '213782667195';
    const message =
      `Bonjour! Je suis intéressé par la commande suivante:\n\n` +
      `Produit: ${product.name}\nTaille: ${selectedSize}\nCouleur: ${selectedColor}\n` +
      `Prix: ${formatDZD(product.priceDZD)}\n\nMerci de m'aider avec cette commande.`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImage(prev => (prev - 1 + product.images.length) % product.images.length);
  };
  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImage(prev => (prev + 1) % product.images.length);
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img src={product.images[currentImage]} alt={product.name} className="product-image" loading="lazy" />
        {product.images.length > 1 && (
          <>
            <button className="image-nav-prev" onClick={prevImage}><ChevronLeft size={20} /></button>
            <button className="image-nav-next" onClick={nextImage}><ChevronRight size={20} /></button>
          </>
        )}
        <div className="image-counter">
          {currentImage + 1} / {product.images.length}
        </div>
        <button className="wishlist-btn" onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}>
          <Heart size={18}
            fill={isWishlisted ? '#D4AF37' : 'none'}
            color={isWishlisted ? '#D4AF37' : '#666'}
          />
        </button>
        {discountPercent > 0 && <span className="sale-badge">-{discountPercent}%</span>}
        {product.stock < 10 && product.stock > 0 && (
          <span className="low-stock-badge">Plus que {product.stock}</span>
        )}
        {product.featured && <span className="featured-badge">⭐ En Vedette</span>}
      </div>

      <div className="product-info">
        <div className="product-category">
          {CATEGORIES[product.category]?.icon} {CATEGORIES[product.category]?.label || product.category}
        </div>
        <h3 className="product-title">{product.name}</h3>
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={14} />

        <div className="options-section">
          <label className="options-label">Taille:</label>
          <div className="size-options">
            {product.sizes?.map(size => (
              <button key={size}
                className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                onClick={() => setSelectedSize(size)}
              >{size}</button>
            ))}
          </div>
        </div>

        <div className="options-section">
          <label className="options-label">Couleur:</label>
          <div className="color-options">
            {product.colors?.map(color => (
              <button key={color}
                className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                style={{ backgroundColor: getColorStyle(color) }}
                onClick={() => setSelectedColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>

        <div className="product-price">
          <span className="current-price">{formatDZD(product.priceDZD)}</span>
          {product.oldPriceDZD && <span className="old-price">{formatDZD(product.oldPriceDZD)}</span>}
        </div>

        <button className="whatsapp-order-btn-full" onClick={handleWhatsAppOrder}>
          💬 Commander sur WhatsApp
        </button>
      </div>
    </div>
  );
}