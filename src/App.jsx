import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Search, Menu, X, Heart } from 'lucide-react';
import { STORAGE_KEYS } from './constants';
import { fetchProducts, setAdminToken } from './services/api';
import { useLocalStorage } from './hooks/useLocalStorage';
import { HomePage } from './components/HomePage';
import { StorePage } from './components/StorePage';
import { WishlistPage } from './components/WishlistPage';
import { AdminPage } from './components/AdminPage';

function App() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useLocalStorage(STORAGE_KEYS.WISHLIST, []);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => !!localStorage.getItem('adminToken'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const exists = prev.some(item => (item._id || item.id) === (product._id || product.id));
      toast.success(exists ? `${product.name} retiré de la liste` : `${product.name} ajouté à la liste`);
      return exists
        ? prev.filter(item => (item._id || item.id) !== (product._id || product.id))
        : [...prev, product];
    });
  }, [setWishlist]);

  const handleAdminAuth = useCallback((status) => {
    setIsAdminLoggedIn(status);
    if (!status) setAdminToken(null);
  }, []);

  return (
    <div className="app-layout-wrapper">
      <Toaster position="bottom-right" toastOptions={{ className: 'toast-custom', duration: 3000 }} />

      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="logo">✨ ProShop Algérie</Link>
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Rechercher des produits..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="nav-actions">
            <Link to="/" className={`nav-link-item ${location.pathname === '/' ? 'active' : ''}`}>Accueil</Link>
            <Link to="/store" className={`nav-link-item ${location.pathname === '/store' ? 'active' : ''}`}>Boutique</Link>
            <Link to="/wishlist" className="nav-link-item">
              <Heart size={18} />
              {wishlist.length > 0 && <span className="wishlist-count">{wishlist.length}</span>}
            </Link>
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Accueil</Link>
            <Link to="/store" onClick={() => setIsMobileMenuOpen(false)}>Boutique</Link>
            <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)}>Liste d'envies</Link>
          </div>
        )}
      </nav>

      <main className="main-content-window">
        <Routes>
          <Route path="/" element={
            <HomePage
              products={products}
              loading={loading}
              onToggleWishlist={toggleWishlist}
              wishlist={wishlist}
            />
          } />
          <Route path="/store" element={
            <StorePage
              products={products}
              loading={loading}
              onToggleWishlist={toggleWishlist}
              wishlist={wishlist}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          } />
          <Route path="/wishlist" element={
            <WishlistPage
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
            />
          } />
          <Route path="/admin" element={
            <AdminPage
              products={products}
              setProducts={setProducts}
              isAdminLoggedIn={isAdminLoggedIn}
              onLogin={handleAdminAuth}
            />
          } />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-content container">
          <div className="footer-section">
            <h4>ProShop Algérie</h4>
            <p>Vêtements premium pour le style moderne.</p>
          </div>
          <div className="footer-section">
            <h4>Liens Rapides</h4>
            <Link to="/">Accueil</Link>
            <Link to="/store">Boutique</Link>
            <Link to="/wishlist">Liste d'envies</Link>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: contact@proshop.dz</p>
            <p>WhatsApp: +213 555 12 34 56</p>
            <p>Algérie</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ProShop Algérie. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;