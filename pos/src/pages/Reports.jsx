import React, { useEffect, useState, useMemo } from 'react';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { STORAGE_KEYS } from '../utils/constants';
import './Reports.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [txSearch, setTxSearch] = useState('');
  const [txFilter, setTxFilter] = useState('All');
  const [prodSearch, setProdSearch] = useState('');
  const [prodFilter, setProdFilter] = useState('All');

  // Fetch all transactions/orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) return;

      const res = await orderService.getAll(token);
      console.log('Orders API response:', res);

      // Extract the actual array from paginated response
      const data = res?.data?.data || [];
      if (!Array.isArray(data)) {
        console.error('Orders data is not an array:', data);
        setTransactions([]);
        return;
      }

      setTransactions(
        data
          .map(tx => ({ ...tx, orderId: tx.orderId || crypto.randomUUID() })) // ensure unique IDs
          .sort((a, b) => new Date(b.date) - new Date(a.date))
      );
    } catch (err) {
      console.error('Error fetching orders:', err);
      setTransactions([]);
    }
  };

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await productService.getAll();
      const data = res?.data || [];
      setProducts(data.map(p => ({ ...p, _id: p._id || crypto.randomUUID() }))); // ensure unique IDs
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();

    // Listen to localStorage updates (live updates from OrderForm)
    const handleNewOrder = () => {
      const lastOrder = JSON.parse(localStorage.getItem('LAST_ORDER') || 'null');
      if (lastOrder) {
        setTransactions(prev => {
          const exists = prev.find(tx => tx.orderId === lastOrder.orderId);
          if (exists) return prev;
          return [{ ...lastOrder, orderId: lastOrder.orderId || crypto.randomUUID() }, ...prev];
        });
      }
    };

    window.addEventListener('storage', handleNewOrder);
    handleNewOrder();
    return () => window.removeEventListener('storage', handleNewOrder);
  }, []);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch =
        tx.orderId?.toString().includes(txSearch) ||
        tx.paymentMethod?.toLowerCase().includes(txSearch.toLowerCase());
      const matchesFilter = txFilter === 'All' || tx.paymentMethod === txFilter;
      return matchesSearch && matchesFilter;
    });
  }, [transactions, txSearch, txFilter]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        (p.name || '').toLowerCase().includes(prodSearch.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(prodSearch.toLowerCase());
      const matchesFilter =
        prodFilter === 'All' ||
        (prodFilter === 'Available' && p.quantity > 0) ||
        (prodFilter === 'Out' && p.quantity <= 0);
      return matchesSearch && matchesFilter;
    });
  }, [products, prodSearch, prodFilter]);

  // Summary stats
  const totalRevenue = useMemo(
    () => transactions.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0),
    [transactions]
  );
  const totalOrders = transactions.length;
  const today = new Date().toISOString().slice(0, 10);
  const todaysTransactions = transactions.filter(tx => tx.date?.slice(0, 10) === today).length;
  const todaysSales = transactions
    .filter(tx => tx.date?.slice(0, 10) === today)
    .reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);

  // Chart data
  const lineData = {
    labels: transactions.map(tx => new Date(tx.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Sales',
        data: transactions.map(tx => tx.totalAmount || 0),
        borderColor: 'blue',
        fill: false
      }
    ]
  };

  const barData = {
    labels: products.map(p => p.category),
    datasets: [
      {
        label: 'Category Stock',
        data: products.map(p => p.quantity || 0),
        backgroundColor: 'orange'
      }
    ]
  };

  const pieData = {
    labels: ['Cash', 'Card', 'Digital Wallet'],
    datasets: [
      {
        data: [
          transactions.filter(tx => tx.paymentMethod === 'cash').length,
          transactions.filter(tx => tx.paymentMethod === 'card').length,
          transactions.filter(tx => tx.paymentMethod === 'digital wallet').length
        ],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56']
      }
    ]
  };

  return (
    <div className="reports-page">
      <h1>Reports Dashboard</h1>

      {/* Summary */}
      <div className="summary-grid">
        <div className="summary-box">
          <h3>Total Revenue</h3>
          <h2>₱{totalRevenue.toFixed(2)}</h2>
          <p className="summary-sub">All sales</p>
        </div>
        <div className="summary-box">
          <h3>Total Orders</h3>
          <h2>{totalOrders}</h2>
          <p className="summary-sub">Completed transactions</p>
        </div>
        <div className="summary-box">
          <h3>Today's Sales</h3>
          <h2>₱{todaysSales.toFixed(2)}</h2>
          <p className="summary-sub">Revenue today</p>
        </div>
        <div className="summary-box">
          <h3>Transactions Today</h3>
          <h2>{todaysTransactions}</h2>
          <p className="summary-sub">Completed today</p>
        </div>
      </div>

      {/* Transactions Table */}
<section className="report-section">
  <h2>Today's Transactions</h2>
  <div className="filter-bar">
    <input
      type="text"
      placeholder="Search Order # or Payment..."
      value={txSearch}
      onChange={e => setTxSearch(e.target.value)}
    />
    <select value={txFilter} onChange={e => setTxFilter(e.target.value)}>
      <option value="All">All Payment Methods</option>
      <option value="cash">Cash</option>
      <option value="card">Card</option>
      <option value="digital wallet">Digital Wallet</option>
    </select>
  </div>

  <div className="table-wrapper scrollable">
    <table className="report-table">
      <thead>
        <tr>
          <th>Order #</th>
          <th>Date & Time</th>
          <th>Items</th>
          <th>Payment</th>
          <th>Total (₱)</th>
        </tr>
      </thead>
      <tbody>
        {filteredTransactions.slice(0, 10).map(tx => {
          // Use tx.date or fallback to tx.createdAt
          const txDate = tx.date || tx.createdAt;
          const formattedDate = txDate
            ? new Date(txDate).toLocaleString('en-PH', { timeZone: 'Asia/Manila', hour12: true })
            : 'N/A';

          // Total quantity of items
          const totalItems = Array.isArray(tx.products)
            ? tx.products.reduce((sum, p) => sum + (p.quantity || 0), 0)
            : 0;

          return (
            <tr key={tx.orderId || crypto.randomUUID()}>
              <td>{tx.orderId || 'N/A'}</td>
              <td>{formattedDate}</td>
              <td>{totalItems}</td>
              <td>{tx.paymentMethod || 'N/A'}</td>
              <td>{(tx.totalAmount || 0).toFixed(2)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
    {filteredTransactions.length === 0 && <p>No transactions found.</p>}
  </div>
</section>


      {/* Inventory Table */}
      <section className="report-section">
        <h2>Inventory Status</h2>
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search Product or Category..."
            value={prodSearch}
            onChange={e => setProdSearch(e.target.value)}
          />
          <select value={prodFilter} onChange={e => setProdFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Out">Out of Stock</option>
          </select>
        </div>

        <div className="table-wrapper scrollable">
          <table className="report-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.slice(0, 10).map(p => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.quantity}</td>
                  <td className={p.quantity > 0 ? 'in-stock' : 'out-of-stock'}>
                    {p.quantity > 0 ? 'Available' : 'Out of Stock'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length > 10 && (
            <p className="more-items">+{filteredProducts.length - 10} more items...</p>
          )}
        </div>
      </section>

      {/* Charts */}
      <section className="report-section chart-section">
        <h2>Monthly Sales Trend</h2>
        <div className="charts-container">
          <div className="chart-wrapper">
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </section>

      <section className="report-section chart-section">
        <h2>Sales by Category</h2>
        <div className="charts-container">
          <div className="chart-wrapper">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <div className="chart-wrapper">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reports;
