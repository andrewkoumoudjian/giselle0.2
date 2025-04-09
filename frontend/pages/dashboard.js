import React from 'react';
import { Container } from '@chakra-ui/react';
import HRDashboard from '../components/HRDashboard';

const DashboardPage = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <HRDashboard />
    </Container>
  );
};

export default DashboardPage;
