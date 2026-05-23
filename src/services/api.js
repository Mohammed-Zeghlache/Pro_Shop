import { dzdToUsd, usdToDzd } from '../utils/helpers';

const API_URL = 'http://localhost:9000/api';

let adminToken = null;

export const setAdminToken = (token) => {
  adminToken = token;
  if (token) {
    localStorage.setItem('adminToken', token);
  } else {
    localStorage.removeItem('adminToken');
  }
};

export const getAdminToken = () => {
  return adminToken || localStorage.getItem('adminToken');
};

export const fetchProducts = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_URL}/products?${params}`);
  if (!response.ok) throw new Error('Failed to fetch products');
  const products = await response.json();
  return products.map(p => ({
    ...p,
    priceDZD: usdToDzd(p.price),
    oldPriceDZD: p.oldPrice ? usdToDzd(p.oldPrice) : null
  }));
};

export const adminLogin = async (username, password) => {
  const response = await fetch(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) throw new Error('Login failed');
  const data = await response.json();
  if (data.token) setAdminToken(data.token);
  return data;
};

export const createProduct = async (productData) => {
  const token = getAdminToken();
  const backendData = {
    ...productData,
    price: dzdToUsd(productData.priceDZD),
    oldPrice: productData.oldPriceDZD ? dzdToUsd(productData.oldPriceDZD) : null,
    priceDZD: undefined,
    oldPriceDZD: undefined
  };
  
  const response = await fetch(`${API_URL}/admin/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(backendData)
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create product: ${error}`);
  }
  const product = await response.json();
  return {
    ...product,
    priceDZD: usdToDzd(product.price),
    oldPriceDZD: product.oldPrice ? usdToDzd(product.oldPrice) : null
  };
};

export const updateProduct = async (id, productData) => {
  const token = getAdminToken();
  const backendData = {
    ...productData,
    price: dzdToUsd(productData.priceDZD),
    oldPrice: productData.oldPriceDZD ? dzdToUsd(productData.oldPriceDZD) : null,
    priceDZD: undefined,
    oldPriceDZD: undefined
  };
  
  const response = await fetch(`${API_URL}/admin/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(backendData)
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update product: ${error}`);
  }
  const product = await response.json();
  return {
    ...product,
    priceDZD: usdToDzd(product.price),
    oldPriceDZD: product.oldPrice ? usdToDzd(product.oldPrice) : null
  };
};

export const deleteProduct = async (id) => {
  const token = getAdminToken();
  const response = await fetch(`${API_URL}/admin/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to delete product');
  return response.json();
};