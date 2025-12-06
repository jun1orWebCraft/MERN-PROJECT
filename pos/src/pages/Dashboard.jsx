import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { STORAGE_KEYS } from '../utils/constants';
import './Dashboard.css';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]); // all completed orders

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await productService.getAll();
      const data = Array.isArray(res) ? res : res.data || [];
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) return;

      const res = await orderService.getAll(token);
      const allOrders = Array.isArray(res) ? res : res.data || [];
      // Reverse so latest orders show first
      setOrders(allOrders.reverse());
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();

    // Listen to localStorage updates (live update from OrderForm)
    const handleNewOrder = () => {
      const lastOrder = JSON.parse(localStorage.getItem('LAST_ORDER') || 'null');
      if (lastOrder) {
        setOrders(prev => {
          // Avoid duplicate if already included
          if (prev.find(o => o.orderId === lastOrder.orderId)) return prev;
          return [lastOrder, ...prev];
        });
      }
    };

    window.addEventListener('storage', handleNewOrder);
    handleNewOrder(); // initial check

    return () => window.removeEventListener('storage', handleNewOrder);
  }, []);

  return (
    <div className="dashboard">
      {/* LEFT SIDE - Product Display */}
      <div className="dashboard-left">
        <h1>Products</h1>
        <div className="products-grid">
          {products.map(product => (
            <div key={product._id} className="product-card">
              <img src={product.imageUrl || '/placeholder.png'} alt={product.name} />
              <div className="product-name">{product.name}</div>
              <div className="product-price">₱{product.price?.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE - All Orders */}
      <div className="dashboard-right">
        <h2>All Orders</h2>
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.orderId} className="order-card">
                <p><strong>Customer:</strong> {order.customerName}</p>
                <p><strong>Date:</strong> {new Date(order.date).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}</p>
                <p><strong>Payment:</strong> {order.paymentMethod}</p>
                <div className="order-items">
                  {order.products.map(p => (
                    <div key={p.productId}>
                      {p.quantity} x {products.find(prod => prod._id === p.productId)?.name || 'Unknown'} - ₱{(p.price * p.quantity).toFixed(2)}
                    </div>
                  ))}
                </div>
                <p><strong>Total:</strong> ₱{order.totalAmount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
