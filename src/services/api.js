import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:8888/api';

// Axios instance yaradırıq
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ========================================
// 📦 PRODUCT API CALLS
// ========================================

/**
 * Bütün məhsulları əldə et
 */
export const getAllProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Məhsulları əldə etmə xətası:', error);
    throw error;
  }
};

/**
 * Tək məhsul əldə et
 */
export const getSingleProduct = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Məhsul əldə etmə xətası:', error);
    throw error;
  }
};

/**
 * Yeni məhsul yarat (Şəkil ilə)
 */
export const createProduct = async (productData) => {
  try {
    const formData = new FormData();
    
    // Məhsul məlumatlarını əlavə et
    formData.append('ad', productData.name);
    formData.append('qiymet', productData.price);
    
    if (productData.description) {
      formData.append('tesvir', productData.description);
    }
    
    if (productData.weight) {
      formData.append('ceki', productData.weight);
    }
    
    // Şəkil faylını əlavə et (əgər varsa)
    if (productData.imageFile) {
      formData.append('sekil', productData.imageFile);
    }

    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Məhsul yaratma xətası:', error);
    throw error;
  }
};

/**
 * Məhsul yenilə (Şəkil ilə)
 */
export const updateProduct = async (id, productData) => {
  try {
    const formData = new FormData();
    
    // Məhsul məlumatlarını əlavə et
    if (productData.name) {
      formData.append('ad', productData.name);
    }
    
    if (productData.price) {
      formData.append('qiymet', productData.price);
    }
    
    if (productData.description) {
      formData.append('tesvir', productData.description);
    }
    
    if (productData.weight) {
      formData.append('ceki', productData.weight);
    }
    
    // Şəkil faylını əlavə et (əgər yeni şəkil varsa)
    if (productData.imageFile) {
      formData.append('sekil', productData.imageFile);
    }

    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Məhsul yeniləmə xətası:', error);
    throw error;
  }
};

/**
 * Məhsul sil
 */
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Məhsul silmə xətası:', error);
    throw error;
  }
};

export default api;
