import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Layout structure
import RootLayout from './layouts/RootLayout';

// Core Pages imports
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import Payment from './pages/Payment';
import Wishlist from './pages/Wishlist';

// Route Guards imports
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Main Application Routes */}
            <Route path="/" element={<RootLayout />}>
              {/* Authenticated Customer Pages */}
              <Route 
                index 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="products" 
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="products/:id" 
                element={
                  <ProtectedRoute>
                    <ProductDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="cart" 
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="wishlist" 
                element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                } 
              />
              
              {/* Authenticated Guest Views */}
              <Route 
                path="login" 
                element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                } 
              />
              <Route 
                path="register" 
                element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                } 
              />
              <Route 
                path="verify-otp" 
                element={
                  <GuestRoute>
                    <VerifyOtp />
                  </GuestRoute>
                } 
              />

              {/* Customer Accounts Guard - Requires Customer/Admin */}
              <Route 
                path="checkout" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="payment" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <Payment />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="orders" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="profile" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Back-Office Panel - Requires Admin Badge */}
              <Route 
                path="admin" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Wildcard redirects back to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
