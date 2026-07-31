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
import OrderSuccess from './pages/OrderSuccess';
import OrderDetails from './pages/OrderDetails';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';

// Route Guards imports
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Main Application Routes */}
            <Route path="/" element={<RootLayout />}>
              {/* Public Views */}
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetails />} />
              <Route path="cart" element={<Cart />} />
              
              {/* Authenticated Guest Views */}
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="verify-otp" element={<VerifyOtp />} />

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
              <Route 
                path="order-success" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <OrderSuccess />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="orders/:id" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <OrderDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="payment-success" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <PaymentSuccess />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="payment-failed" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <PaymentFailed />
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
