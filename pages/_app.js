import { ChakraProvider } from '@chakra-ui/react';
import Layout from '../components/Layout';
import theme from '../theme';
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

  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default MyApp;
