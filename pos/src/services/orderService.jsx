import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders';

export const orderService = {
  create: (orderData, token) =>
    axios.post(API_URL, orderData, {
      headers: { Authorization: `Bearer ${token}` }
    }),

  getLastOrder: async (token) => {
    return await axios.get(`${API_URL}/orders/last`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  getAll: (token) =>
    axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    }),

  getById: (id, token) =>
    axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),

  update: (id, orderData, token) =>
    axios.put(`${API_URL}/${id}`, orderData, {
      headers: { Authorization: `Bearer ${token}` }
    }),

  delete: (id, token) =>
    axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
};
