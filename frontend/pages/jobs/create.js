import React from 'react';
import {
  Container,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Box,
  Heading
} from '@chakra-ui/react';
import NextLink from 'next/link';
import CreateJobForm from '../../components/CreateJobForm';
import { withAuth } from '../../context/AuthContext';

const CreateJobPage = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Breadcrumb mb={6}>
        <BreadcrumbItem>
          <BreadcrumbLink as={NextLink} href="/jobs">Jobs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Create Job</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Box mb={8}>
        <CreateJobForm />
      </Box>
    </Container>
  );
};

// Wrap the CreateJobPage component with the withAuth HOC to protect this route
// Only users with the 'employer' role can access this page
export default withAuth(CreateJobPage, { requiredRole: 'employer' });
