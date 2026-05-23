import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Plus, Trash2, Upload, Edit, X, ChevronDown,
  TrendingUp, Package, DollarSign, Star, Search,
  RefreshCw, Download, Grid, List, LogOut
} from 'lucide-react';
import { CATEGORIES, AVAILABLE_COLORS } from '../constants';
import { getColorStyle, formatDZD, imageToBase64 } from '../utils/helpers';
import { createProduct, updateProduct, deleteProduct, setAdminToken } from '../services/api';
import { AdminLoginPage } from './AdminLoginPage';

export function AdminPage({ products, setProducts, isAdminLoggedIn, onLogin }) {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedColorsList, setSelectedColorsList] = useState([]);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    priceDZD: '',
    oldPriceDZD: '',
    description: '',
    category: 't-shirt',
    sizes: '',
    colors: '',
    stock: '100',
    featured: false
  });

  const categories = Object.keys(CATEGORIES);

  const stats = useMemo(() => ({
    totalProducts: products.length,
    totalValueDZD: products.reduce((sum, p) => sum + (p.priceDZD || 0), 0),
    avgPriceDZD: products.length > 0 ? products.reduce((sum, p) => sum + (p.priceDZD || 0), 0) / products.length : 0,
    featuredCount: products.filter(p => p.featured).length
  }), [products]);

  const filteredProducts = useMemo(() =>
    products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }),
    [products, searchTerm, categoryFilter]
  );

  if (!isAdminLoggedIn) {
    return <AdminLoginPage onLogin={onLogin} />;
  }

  const handleImageUpload = async (file) => {
    if (file && file.size <= 5 * 1024 * 1024) {
      try {
        const base64 = await imageToBase64(file);
        setImagePreviews(prev => [...prev, base64]);
        toast.success('Image ajoutée');
      } catch { 
        toast.error('Erreur lors de l\'upload'); 
      }
    } else {
      toast.error('L\'image doit être moins de 5MB');
    }
  };

  const removeImage = (indexToRemove) => {
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    toast.success('Image supprimée');
  };

  const toggleColor = (color) => {
    setSelectedColorsList(prev => {
      if (prev.includes(color)) {
        return prev.filter(c => c !== color);
      } else {
        return [...prev, color];
      }
    });
  };

  const updateColorsField = (colors) => {
    setFormData(prev => ({
      ...prev,
      colors: colors.join(', ')
    }));
  };

  useEffect(() => {
    if (formData.colors) {
      const colorsArray = formData.colors.split(',').map(c => c.trim()).filter(Boolean);
      setSelectedColorsList(colorsArray);
    } else {
      setSelectedColorsList([]);
    }
  }, [formData.colors]);

  const closeAndResetModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      priceDZD: '',
      oldPriceDZD: '',
      description: '',
      category: 't-shirt',
      sizes: '',
      colors: '',
      stock: '100',
      featured: false
    });
    setImagePreviews([]);
    setSelectedColorsList([]);
    setShowModal(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    const colorsString = (product.colors || []).join(', ');
    setFormData({
      name: product.name || '',
      priceDZD: product.priceDZD !== undefined && product.priceDZD !== null ? String(product.priceDZD) : '',
      oldPriceDZD: product.oldPriceDZD !== undefined && product.oldPriceDZD !== null ? String(product.oldPriceDZD) : '',
      description: product.description || '',
      category: product.category || 't-shirt',
      sizes: product.sizes?.join(', ') || '',
      colors: colorsString,
      stock: product.stock !== undefined && product.stock !== null ? String(product.stock) : '100',
      featured: product.featured || false
    });
    setSelectedColorsList(product.colors || []);
    setImagePreviews([...(product.images || [])]);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (imagePreviews.length === 0) {
      toast.error('Veuillez uploader au moins une image');
      setLoading(false);
      return;
    }

    const cleanSizes = formData.sizes.split(',').map(s => s.trim()).filter(Boolean);
    const cleanColors = selectedColorsList.length > 0 ? selectedColorsList : ['Black', 'White'];

    const productData = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      priceDZD: parseFloat(formData.priceDZD) || 0,
      oldPriceDZD: formData.oldPriceDZD ? parseFloat(formData.oldPriceDZD) : null,
      stock: parseInt(formData.stock) || 0,
      sizes: cleanSizes.length ? cleanSizes : ['S', 'M', 'L', 'XL'],
      colors: cleanColors,
      images: imagePreviews,
      featured: formData.featured,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewCount: editingProduct ? editingProduct.reviewCount : 0,
      sales: editingProduct ? editingProduct.sales : 0,
    };

    try {
      let result;
      if (editingProduct) {
        result = await updateProduct(editingProduct._id || editingProduct.id, productData);
        setProducts(prev => prev.map(p =>
          (p._id || p.id) === (editingProduct._id || editingProduct.id) ? result : p
        ));
        toast.success('Produit mis à jour!');
      } else {
        result = await createProduct(productData);
        setProducts(prev => [result, ...prev]);
        toast.success('Produit ajouté!');
      }
      closeAndResetModal();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit? Cette action est irréversible.')) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
      toast.success('Produit supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exportation réussie');
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === undefined || value === null ? '' : value
    }));
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <div>
              <h1>Gestion des Produits</h1>
              <p>Ajoutez, modifiez ou supprimez des produits</p>
            </div>
            <div className="admin-actions">
              <button className="btn-outline" onClick={exportData}><Download size={18} /> Exporter</button>
              <button className="btn-primary" onClick={() => { setEditingProduct(null); setShowModal(true); }}>
                <Plus size={18} /> Ajouter un Produit
              </button>
              <button className="btn-danger-outline" onClick={() => { setAdminToken(null); onLogin(false); }}>
                <LogOut size={18} /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon"><Package size={24} /></div><div><div className="stat-value">{stats.totalProducts}</div><div className="stat-label">Total Produits</div></div></div>
          <div className="stat-card"><div className="stat-icon"><DollarSign size={24} /></div><div><div className="stat-value">{formatDZD(stats.totalValueDZD)}</div><div className="stat-label">Valeur Stock</div></div></div>
          <div className="stat-card"><div className="stat-icon"><TrendingUp size={24} /></div><div><div className="stat-value">{formatDZD(stats.avgPriceDZD)}</div><div className="stat-label">Prix Moyen</div></div></div>
          <div className="stat-card"><div className="stat-icon"><Star size={24} /></div><div><div className="stat-value">{stats.featuredCount}</div><div className="stat-label">En Vedette</div></div></div>
        </div>

        <div className="admin-controls">
          <div className="search-bar">
            <Search size={16} />
            <input type="text" placeholder="Rechercher..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">Toutes Catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{CATEGORIES[cat]?.label}</option>
            ))}
          </select>
          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><Grid size={16} /></button>
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={16} /></button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="admin-products-grid">
            {filteredProducts.map(product => (
              <div key={product._id || product.id} className="admin-product-card">
                <img src={product.images?.[0] || ''} alt={product.name} />
                <div className="admin-product-info">
                  <h4>{product.name}</h4>
                  <p className="price">{formatDZD(product.priceDZD)}</p>
                  <p className="stock">Stock: {product.stock}</p>
                  <div className="admin-product-actions">
                    <button className="edit-btn" onClick={() => handleEdit(product)}><Edit size={14} /> Modifier</button>
                    <button className="delete-btn" onClick={() => handleDelete(product._id || product.id)}><Trash2 size={14} /> Supprimer</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr><th>Image</th><th>Nom</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Vedette</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product._id || product.id}>
                    <td><img src={product.images?.[0] || ''} className="table-product-image" alt={product.name} /></td>
                    <td><strong>{product.name}</strong></td>
                    <td><span className="category-badge">{CATEGORIES[product.category]?.label || product.category}</span></td>
                    <td>{formatDZD(product.priceDZD)}</td>
                    <td>{product.stock}</td>
                    <td>{product.featured ? '⭐ Oui' : '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="edit-btn" onClick={() => handleEdit(product)}><Edit size={14} /></button>
                        <button className="delete-btn" onClick={() => handleDelete(product._id || product.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeAndResetModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}</h2>
              <button className="close-modal" onClick={closeAndResetModal}><X size={24} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nom Produit *</label>
                    <input type="text" required value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      placeholder="Ex: T-Shirt Premium" />
                  </div>
                  <div className="form-group">
                    <label>Catégorie *</label>
                    <select value={formData.category} onChange={(e) => handleFormChange('category', e.target.value)}>
                      {categories.map(cat => <option key={cat} value={cat}>{CATEGORIES[cat]?.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Prix (DZD) *</label>
                    <input type="number" step="100" required value={formData.priceDZD}
                      onChange={(e) => handleFormChange('priceDZD', e.target.value)}
                      placeholder="Ex: 4500" />
                  </div>
                  <div className="form-group">
                    <label>Ancien Prix (DZD)</label>
                    <input type="number" step="100" value={formData.oldPriceDZD}
                      onChange={(e) => handleFormChange('oldPriceDZD', e.target.value)}
                      placeholder="Ex: 6500" />
                  </div>
                  <div className="form-group">
                    <label>Quantité Stock *</label>
                    <input type="number" required value={formData.stock}
                      onChange={(e) => handleFormChange('stock', e.target.value)}
                      placeholder="100" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea required rows="3" value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Décrivez les caractéristiques du produit..." />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tailles (séparées par virgule)</label>
                    <input type="text" value={formData.sizes}
                      onChange={(e) => handleFormChange('sizes', e.target.value)}
                      placeholder="S, M, L, XL" />
                  </div>
                  <div className="form-group">
                    <label>Couleurs</label>
                    <div className="color-selector-wrapper">
                      <div className="color-selector-trigger" onClick={() => setShowColorDropdown(!showColorDropdown)}>
                        <div className="selected-colors-display">
                          {selectedColorsList.length > 0 ? (
                            selectedColorsList.map(color => (
                              <div key={color} className="selected-color-chip" style={{ backgroundColor: getColorStyle(color) }}>
                                <span>{color}</span>
                              </div>
                            ))
                          ) : (
                            <span className="placeholder-text">Sélectionner des couleurs...</span>
                          )}
                        </div>
                        <ChevronDown size={16} />
                      </div>
                      {showColorDropdown && (
                        <div className="color-selector-dropdown">
                          <div className="color-dropdown-header">
                            <span>Choisir les couleurs</span>
                            <button type="button" onClick={() => setShowColorDropdown(false)}>✕</button>
                          </div>
                          <div className="color-dropdown-grid">
                            {AVAILABLE_COLORS.map(color => (
                              <button
                                key={color}
                                type="button"
                                className={`color-option ${selectedColorsList.includes(color) ? 'selected' : ''}`}
                                onClick={() => {
                                  toggleColor(color);
                                  const newColors = selectedColorsList.includes(color)
                                    ? selectedColorsList.filter(c => c !== color)
                                    : [...selectedColorsList, color];
                                  updateColorsField(newColors);
                                }}
                              >
                                <div className="color-swatch" style={{ backgroundColor: getColorStyle(color) }} />
                                <span className="color-name">{color}</span>
                                {selectedColorsList.includes(color) && <span className="check-mark">✓</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.featured}
                      onChange={(e) => handleFormChange('featured', e.target.checked)} />
                    Produit en Vedette (apparaît sur la page d'accueil)
                  </label>
                </div>

                <div className="form-group">
                  <label>Images Produit * (ajoutez autant que vous voulez)</label>
                  <div className="image-upload-grid">
                    {imagePreviews.map((img, index) => (
                      <div key={index} className="image-upload-box">
                        <div className="image-preview-container">
                          <img src={img} alt={`Preview ${index + 1}`} />
                          <button type="button" className="remove-image" onClick={() => removeImage(index)}>
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="image-upload-box add-more">
                      <label className="upload-label">
                        <Upload size={24} />
                        <span>Ajouter image</span>
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={(e) => handleImageUpload(e.target.files[0])} />
                      </label>
                    </div>
                  </div>
                  <small>{imagePreviews.length} image(s) ajoutée(s)</small>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeAndResetModal}>Annuler</button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? <RefreshCw size={18} className="spinning" /> : (editingProduct ? 'Mettre à Jour' : 'Ajouter')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}