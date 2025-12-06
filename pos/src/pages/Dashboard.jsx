import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { STORAGE_KEYS } from '../utils/constants';
import './Dashboard.css';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await productService.getAll();
      const data = Array.isArray(res) ? res : res?.data || [];
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) return;

      const res = await orderService.getAll(token);
      const allOrdersRaw = res?.data?.data || [];
      if (!Array.isArray(allOrdersRaw)) return;

      setOrders(
        allOrdersRaw
          .map(o => ({
            ...o,
            orderId: o.orderId || crypto.randomUUID(),
            date: o.date || o.createdAt || new Date().toISOString()
          }))
          .reverse()
      );
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();

    const handleNewOrder = () => {
      const lastOrder = JSON.parse(localStorage.getItem('LAST_ORDER') || 'null');
      if (lastOrder) {
        setOrders(prev => {
          if (prev.find(o => o.orderId === lastOrder.orderId)) return prev;
          return [{ ...lastOrder, orderId: lastOrder.orderId || crypto.randomUUID() }, ...prev];
        });
      }
    };

    window.addEventListener('storage', handleNewOrder);
    handleNewOrder();

    return () => window.removeEventListener('storage', handleNewOrder);
  }, []);

  const handlePrint = () => {
    if (!selectedOrder) return;
    const printContent = document.getElementById('receipt-content');
    const newWin = window.open('', 'Print-Window');
    newWin.document.write('<html><head><title>Receipt</title></head><body>');
    newWin.document.write(printContent.innerHTML);
    newWin.document.write('</body></html>');
    newWin.document.close();
    newWin.focus();
    newWin.print();
    newWin.close();
  };

  // Helper to safely get product name
  const getProductName = (productId) => {
    const product = products.find(p => p._id == productId); // loose equality
    return product?.name || 'Unknown';
  };

  return (
    <div className="dashboard">
      {/* LEFT SIDE - Products */}
      <div className="dashboard-left">
        <h1>Products</h1>
        <div className="products-grid">
          {products.map(product => (
            <div key={product._id || crypto.randomUUID()} className="product-card">
              <img src={product.imageUrl || '/placeholder.png'} alt={product.name || 'Product'} />
              <div className="product-name">{product.name || 'Unnamed Product'}</div>
              <div className="product-price">₱{product.price?.toFixed(2) || '0.00'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE - Orders */}
      <div className="dashboard-right">
        <h2>All Orders</h2>
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const formattedDate = order.date
                ? new Date(order.date).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })
                : 'N/A';

              return (
                <div
                  key={order.orderId || crypto.randomUUID()}
                  className="order-card"
                  onClick={() => setSelectedOrder(order)}
                >
                  <p><strong>Customer:</strong> {order.customerName || 'Unknown'}</p>
                  <p><strong>Date:</strong> {formattedDate}</p>
                  <p><strong>Payment:</strong> {order.paymentMethod || 'N/A'}</p>
                  <p><strong>Total:</strong> ₱{order.totalAmount?.toFixed(2) || '0.00'}</p>
                  <div className="order-items">
                    {Array.isArray(order.products) && order.products.length > 0 ? (
                      order.products.map((p, idx) => (
                        <div key={`${p.productId}-${idx}`}>
                          {p.quantity || 0} x {getProductName(p.productId)} - ₱{(p.price * (p.quantity || 0)).toFixed(2)}
                        </div>
                      ))
                    ) : (
                      <p>No items</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for order details */}
      {selectedOrder && (
        <div className="order-modal" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Order Receipt</h3>
            <div id="receipt-content">
              <p><strong>Customer:</strong> {selectedOrder.customerName || 'Unknown'}</p>
              <p>
                <strong>Date:</strong>{' '}
                {selectedOrder.date
                  ? new Date(selectedOrder.date).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })
                  : 'N/A'}
              </p>
              <p><strong>Payment:</strong> {selectedOrder.paymentMethod || 'N/A'}</p>
              <div className="order-items">
                {Array.isArray(selectedOrder.products) && selectedOrder.products.length > 0 ? (
                  selectedOrder.products.map((p, idx) => (
                    <div key={`${p.productId}-${idx}`}>
                      {p.quantity || 0} x {getProductName(p.productId)} - ₱{(p.price * (p.quantity || 0)).toFixed(2)}
                    </div>
                  ))
                ) : (
                  <p>No items</p>
                )}
              </div>
              <p><strong>Total:</strong> ₱{selectedOrder.totalAmount?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="modal-buttons">
              <button onClick={handlePrint}>Print Receipt</button>
              <button onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
