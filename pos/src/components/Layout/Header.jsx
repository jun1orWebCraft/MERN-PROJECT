import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo text-bold">
          POS
        </Link>
        <nav className="nav">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/orders">Order</Link>
              <Link to="/reports">Reports</Link>
              <div className="user-info">
                <span>Welcome, {user?.firstName}</span>
                <Button variant="secondary" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;