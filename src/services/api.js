const API_URL = import.meta.env.VITE_API_URL;

// API Products
export const productsApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error('Impossible de charger les produits');
    }
    return response.json();
  }
};

export const api = {
  products: productsApi
};
