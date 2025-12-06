import React, { useEffect, useState } from 'react';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { STORAGE_KEYS } from '../../utils/constants';
import './OrderForm.css';

const OrderForm = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [totalAmount, setTotalAmount] = useState(0);
  const [lastOrder, setLastOrder] = useState(null); // stores last successful order

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();

    // Load last order from localStorage
    const storedOrder = localStorage.getItem('LAST_ORDER');
    if (storedOrder) setLastOrder(JSON.parse(storedOrder));
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await productService.getAll();
      const data = Array.isArray(res) ? res : res.data || [];
      setProducts(data.filter(p => p.quantity > 0));
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Add product to cart
  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(p => p._id === product._id);
      if (exists) {
        return prev.map(p =>
          p._id === product._id ? { ...p, quantity: Math.min(p.quantity + 1, product.quantity) } : p
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  // Update quantity in cart
  const updateQty = (productId, qty) => {
    setCart(prev =>
      prev.map(p =>
        p._id === productId ? { ...p, quantity: Math.min(qty, p.quantity) } : p
      )
    );
  };

  // Remove product from cart
  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(p => p._id !== productId));
  };

  // Calculate total whenever cart changes
  useEffect(() => {
    const total = cart.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 0), 0);
    setTotalAmount(total);
  }, [cart]);

  // Handle order submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || cart.length === 0) {
      alert('Please add customer name and select products.');
      return;
    }

    const orderData = {
      customerName,
      paymentMethod,
      products: cart.map(p => ({ productId: p._id, quantity: p.quantity, price: p.price })),
      totalAmount
    };

    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        alert('You must be logged in to place an order.');
        return;
      }

      const res = await orderService.create(orderData, token);

      const savedOrder = {
        ...orderData,
        orderId: res.data.orderId || res.data._id,
        date: new Date().toISOString()
      };

      // Save last order in state and localStorage
      setLastOrder(savedOrder);
      localStorage.setItem('LAST_ORDER', JSON.stringify(savedOrder));

      // Reset cart for new order
      setCustomerName('');
      setCart([]);
      setPaymentMethod('cash');
      setTotalAmount(0);

      alert('Order successfully created!');
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Failed to create order.');
    }
  };

  return (
    <div className="order-form-page">
      <div className="order-form-left">
        <h1>Create New Order</h1>
        <form className="order-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer Name:</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Payment Method:</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="digital wallet">Digital Wallet</option>
            </select>
          </div>

          <div className="form-group product-selection">
            <h3>Available Products</h3>
            <ul className="product-list">
              {products.map(p => (
                <li key={p._id}>
                  {p.name} - ₱{p.price.toFixed(2)} ({p.quantity} in stock)
                  <button type="button" onClick={() => addToCart(p)}>Add</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="form-group order-summary">
            <h3>Current Order</h3>
            {cart.length === 0 ? (
              <p>No products added.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(p => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max={p.quantity}
                          value={p.quantity}
                          onChange={(e) => updateQty(p._id, parseInt(e.target.value))}
                        />
                      </td>
                      <td>₱{p.price.toFixed(2)}</td>
                      <td>₱{(p.price * p.quantity).toFixed(2)}</td>
                      <td>
                        <button type="button" onClick={() => removeFromCart(p._id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <h3>Total: ₱{totalAmount.toFixed(2)}</h3>
          </div>

          <button type="submit" className="submit-btn">Place Order</button>
        </form>
      </div>

      {/* Right side: Last successful order */}
      <div className="order-form-right">
        {lastOrder && (
          <div className="last-order">
            <h2>Last Order</h2>
            <p><strong>Order ID:</strong> {lastOrder.orderId}</p>
            <p><strong>Date:</strong> {new Date(lastOrder.date).toLocaleString()}</p>
            <p><strong>Customer:</strong> {lastOrder.customerName}</p>
            <p><strong>Payment Method:</strong> {lastOrder.paymentMethod}</p>
            <div className="order-items">
              {lastOrder.products.map(p => (
                <div key={p.productId}>
                  {p.quantity} x {products.find(prod => prod._id === p.productId)?.name || 'Unknown'} - ₱{(p.price * p.quantity).toFixed(2)}
                </div>
              ))}
            </div>
            <h4>Total: ₱{lastOrder.totalAmount.toFixed(2)}</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderForm;
