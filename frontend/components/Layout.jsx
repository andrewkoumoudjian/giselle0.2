import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import EnhancedNavbar from './EnhancedNavbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <Flex direction="column" minH="100vh">
      <EnhancedNavbar />
      <Box flex="1">
        {children}
      </Box>
      <Footer />
    </Flex>
  );
};

export default Layout;
