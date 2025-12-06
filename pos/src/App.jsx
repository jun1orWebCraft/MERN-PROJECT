import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Loading from './components/Loading';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import OrderForm from "./pages/Orders/OrderForm";
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading />;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Header />
                    <Dashboard />
                    <Footer />
                  </ProtectedRoute>
                }
              />

              {/* Orders */}
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Header />
                    <OrderForm />
                    <Footer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/new"
                element={
                  <ProtectedRoute>
                    <Header />
                    <OrderForm />
                    <Footer />
                  </ProtectedRoute>
                }
              />

              {/* Reports */}
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Header />
                    <Reports />
                    <Footer />
                  </ProtectedRoute>
                }
              />

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
