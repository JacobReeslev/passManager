import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Navbar, NavbarBrand, Nav, NavItem, NavLink, Container } from 'reactstrap';
import { isAuthenticated, logout } from '../services/authService';
import '../App.css';

// Import real components (these will throw errors until the components exist)
import Login from './Auth/Login';
import Register from './Auth/Register';
import PasswordsList from './Passwords/PasswordsList';
import AddPassword from './Passwords/AddPassword';
import ViewPassword from './Passwords/ViewPassword';
import TestimonialsList from './Testimonials/TestimonialsList';
import AddTestimonial from './Testimonials/AddTestimonial';

// Home component defined inline since it's simple
const Home = () => (
  <div className="text-center p-5">
    <h1>Welcome to Password Manager</h1>
    <p>A secure way to store and manage your passwords</p>
    <p>Your passwords are encrypted in your browser before being sent to the server.</p>
    <p>This means no one, not even us, can see your actual passwords.</p>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  useEffect(() => {
    const checkAuth = () => {
      setAuthenticated(isAuthenticated());
    };
    
    // Check authentication status when component mounts
    checkAuth();
    
    // Add event listener for storage changes (for when user logs out in another tab)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        <Navbar color="dark" dark expand="md">
          <NavbarBrand tag={Link} to="/">Password Manager</NavbarBrand>
          <Nav className="ms-auto" navbar>
            <NavItem>
              <NavLink tag={Link} to="/">Home</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/testimonials">Testimonials</NavLink>
            </NavItem>
            {authenticated ? (
              <>
                <NavItem>
                  <NavLink tag={Link} to="/passwords">My Passwords</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/passwords/add">Add Password</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/testimonials/add">Add Testimonial</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink style={{ cursor: 'pointer' }} onClick={handleLogout}>Logout</NavLink>
                </NavItem>
              </>
            ) : (
              <>
                <NavItem>
                  <NavLink tag={Link} to="/login">Login</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/register">Register</NavLink>
                </NavItem>
              </>
            )}
          </Nav>
        </Navbar>

        <Container className="mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/testimonials" element={<TestimonialsList />} />
            <Route path="/testimonials/add" element={<ProtectedRoute element={<AddTestimonial />} />} />
            <Route path="/passwords" element={<ProtectedRoute element={<PasswordsList />} />} />
            <Route path="/passwords/add" element={<ProtectedRoute element={<AddPassword />} />} />
            <Route path="/passwords/:id" element={<ProtectedRoute element={<ViewPassword />} />} />
            <Route path="*" element={<div className="text-center p-5"><h2>Page Not Found</h2></div>} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;