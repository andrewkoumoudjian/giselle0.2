import { AuthProvider } from '../context/AuthContext';
import { useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  // Add Google Analytics or other tracking here
  useEffect(() => {
    // Example: Initialize analytics
    // if (typeof window !== 'undefined') {
    //   // Initialize analytics
    // }
  }, []);

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <AuthProvider>
      {getLayout(<Component {...pageProps} />)}
    </AuthProvider>
  );
}

export default MyApp;
