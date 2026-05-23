import { useRef, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { LoadingSpinner } from './LoadingSpinner';

export function HomePage({ products, loading, onToggleWishlist, wishlist }) {
  const productsSectionRef = useRef(null);
  
  const featuredProducts = useMemo(() => 
    products.filter(p => p.featured === true),
    [products]
  );

  const scrollToProducts = () => productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  const handleWhatsAppOrder = () =>
    window.open(
      `https://wa.me/213555123456?text=${encodeURIComponent('Bonjour! Je souhaite passer une commande sur ProShop Algérie.')}`,
      '_blank'
    );

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">Nouvelle Collection 2024</span>
            <h1>Mode Premium<br />Confort et Élégance</h1>
            <p>Découvrez des designs sur mesure avec des matériaux premium. Commandez directement sur WhatsApp!</p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={scrollToProducts}>
                Acheter Maintenant <ChevronDown size={16} />
              </button>
              <button className="btn-outline" onClick={handleWhatsAppOrder}>Commander sur WhatsApp</button>
            </div>
            <div className="hero-features">
              <div className="feature">🚚 Livraison Gratuite</div>
              <div className="feature">🔒 Paiement Sécurisé</div>
              <div className="feature">⭐ 4.9 Note</div>
              <div className="feature">🔄 Retours 30 Jours</div>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600" alt="Collection" />
          </div>
        </div>
      </section>

      <div ref={productsSectionRef}>
        {featuredProducts.length > 0 ? (
          <section className="featured-section">
            <div className="container">
              <div className="section-header">
                <h2>Produits en Vedette</h2>
                <p>Sélectionnés spécialement pour vous</p>
              </div>
              <div className="products-grid">
                {featuredProducts.map(product => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlist.some(item => (item._id || item.id) === (product._id || product.id))}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="featured-section">
            <div className="container">
              <div className="section-header">
                <h2>Bientôt disponible</h2>
                <p>Nos produits en vedette arrivent bientôt</p>
              </div>
            </div>
          </section>
        )}
      </div>

      <section className="whatsapp-cta">
        <div className="container">
          <div className="cta-content">
            <div>
              <h2>Besoin d'aide pour choisir?</h2>
              <p>Discutez avec nos experts en style sur WhatsApp</p>
            </div>
            <button className="btn-primary whatsapp-btn" onClick={handleWhatsAppOrder}>
              Discuter sur WhatsApp 💬
            </button>
          </div>
        </div>
      </section>
    </>
  );
}