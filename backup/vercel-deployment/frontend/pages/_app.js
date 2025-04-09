import { useState, useEffect } from 'react';
import Head from 'next/head';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// Client-side cache for emotion styling
const clientSideEmotionCache = createCache({ key: 'css' });

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export default function MyApp({ Component, pageProps }) {
  const [emotionCache] = useState(clientSideEmotionCache);
  const [isClient, setIsClient] = useState(false);

  // This useEffect ensures that the app is only rendered on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Giselle AI Interview System</title>
        <meta name="description" content="AI-powered interview system for candidate evaluation" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {isClient && <Component {...pageProps} />}
      </ThemeProvider>
    </CacheProvider>
  );
} 