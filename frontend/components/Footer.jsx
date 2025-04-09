import React from 'react';
import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  VisuallyHidden,
  chakra,
  useColorModeValue,
  Image,
  Flex,
} from '@chakra-ui/react';
import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';
import NextLink from 'next/link';

const SocialButton = ({ children, label, href }) => {
  return (
    <chakra.button
      bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      _hover={{
        bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
      }}
      target="_blank"
      rel="noopener noreferrer"
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

const Footer = () => {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      mt="auto"
      borderTopWidth={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Container as={Stack} maxW={'container.xl'} py={10}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Flex align="center">
              <Image 
                src="https://via.placeholder.com/40" 
                alt="Logo" 
                boxSize="40px" 
                mr={2} 
              />
              <Text fontSize="xl" fontWeight="bold">HR Talent</Text>
            </Flex>
            <Text fontSize={'sm'}>
              Connecting top talent with great opportunities. Our AI-powered platform helps HR agencies find the perfect candidates for their job openings.
            </Text>
            <Stack direction={'row'} spacing={6}>
              <SocialButton label={'Twitter'} href={'#'}>
                <FaTwitter />
              </SocialButton>
              <SocialButton label={'LinkedIn'} href={'#'}>
                <FaLinkedin />
              </SocialButton>
              <SocialButton label={'GitHub'} href={'#'}>
                <FaGithub />
              </SocialButton>
            </Stack>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>For Job Seekers</ListHeader>
            <Link as={NextLink} href={'/jobs'}>Browse Jobs</Link>
            <Link as={NextLink} href={'/resources'}>Career Resources</Link>
            <Link as={NextLink} href={'/resume-tips'}>Resume Tips</Link>
            <Link as={NextLink} href={'/interview-prep'}>Interview Prep</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>For Employers</ListHeader>
            <Link as={NextLink} href={'/dashboard'}>HR Dashboard</Link>
            <Link as={NextLink} href={'/jobs/create'}>Post a Job</Link>
            <Link as={NextLink} href={'/pricing'}>Pricing</Link>
            <Link as={NextLink} href={'/enterprise'}>Enterprise Solutions</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Company</ListHeader>
            <Link as={NextLink} href={'/about'}>About Us</Link>
            <Link as={NextLink} href={'/contact'}>Contact Us</Link>
            <Link as={NextLink} href={'/privacy'}>Privacy Policy</Link>
            <Link as={NextLink} href={'/terms'}>Terms of Service</Link>
          </Stack>
        </SimpleGrid>
      </Container>

      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Container
          as={Stack}
          maxW={'container.xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}
        >
          <Text>© 2023 HR Talent. All rights reserved</Text>
          <Stack direction={'row'} spacing={6}>
            <Link href={'#'}>Privacy Policy</Link>
            <Link href={'#'}>Terms of Service</Link>
            <Link href={'#'}>Cookie Policy</Link>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
