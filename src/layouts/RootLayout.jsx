import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const RootLayout = () => {
  return (
    <>
      <Navbar />
      <main className="container flex-col" style={{ minHeight: 'calc(100vh - var(--nav-height) - var(--footer-height) - 100px)' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};
export default RootLayout;
