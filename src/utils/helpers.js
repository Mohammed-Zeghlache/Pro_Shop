export const imageToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload  = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export const getColorStyle = (colorName) => {
  const normalized = colorName.toLowerCase().trim();
  const hexMap = {
    black: '#000000', white: '#ffffff', navy: '#1e3a8a',
    gray: '#666666',  blue: '#3b82f6',  red: '#d93838',
    green: '#1c7a56', yellow: '#e0a100', pink: '#ec4899',
    purple: '#8b5cf6', orange: '#f97316', teal: '#14b8a6',
    brown: '#8B4513', beige: '#F5F5DC', maroon: '#800000',
    olive: '#808000'
  };
  return hexMap[normalized] || normalized;
};

const USD_TO_DZD_RATE = 150;
export const usdToDzd = (usd) => usd * USD_TO_DZD_RATE;
export const dzdToUsd = (dzd) => dzd / USD_TO_DZD_RATE;

export const formatDZD = (amount) => {
  if (amount === undefined || amount === null) return '0 DZD';
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};