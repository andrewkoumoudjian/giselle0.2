import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Container,
  Image,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import NextLink from 'next/link';

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('blue.500', 'blue.300');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Box
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      bg={useColorModeValue('white', 'gray.800')}
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="sm"
    >
      <Container maxW="container.xl">
        <Flex
          minH={'60px'}
          py={{ base: 2 }}
          align={'center'}
          justify="space-between"
        >
          <Flex
            flex={{ base: 1, md: 'auto' }}
            ml={{ base: -2 }}
            display={{ base: 'flex', md: 'none' }}
          >
            <Button
              onClick={onToggle}
              variant={'ghost'}
              aria-label={'Toggle Navigation'}
            >
              {isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            </Button>
          </Flex>
          
          <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
            <NextLink href="/" passHref>
              <Link
                textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                fontFamily={'heading'}
                color={useColorModeValue('gray.800', 'white')}
                _hover={{ textDecoration: 'none' }}
              >
                <Flex align="center">
                  <Image 
                    src="https://via.placeholder.com/40" 
                    alt="Logo" 
                    boxSize="40px" 
                    mr={2} 
                  />
                  <Text fontSize="xl" fontWeight="bold">HR Talent</Text>
                </Flex>
              </Link>
            </NextLink>

            <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
              <DesktopNav linkColor={linkColor} linkHoverColor={linkHoverColor} popoverContentBgColor={popoverContentBgColor} />
            </Flex>
          </Flex>

          <Stack
            flex={{ base: 1, md: 0 }}
            justify={'flex-end'}
            direction={'row'}
            spacing={6}
          >
            <Button
              as={NextLink}
              href="/jobs"
              fontSize={'sm'}
              fontWeight={400}
              variant={'link'}
              color={linkColor}
              _hover={{ color: linkHoverColor }}
            >
              Browse Jobs
            </Button>
            <Button
              as={NextLink}
              href="/dashboard"
              display={{ base: 'none', md: 'inline-flex' }}
              fontSize={'sm'}
              fontWeight={600}
              color={'white'}
              bg={'blue.500'}
              _hover={{
                bg: 'blue.400',
              }}
            >
              HR Dashboard
            </Button>
          </Stack>
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <MobileNav />
        </Collapse>
      </Container>
    </Box>
  );
};

const DesktopNav = ({ linkColor, linkHoverColor, popoverContentBgColor }) => {
  const NAV_ITEMS = [
    {
      label: 'Jobs',
      href: '/jobs',
      children: [
        {
          label: 'Browse Jobs',
          subLabel: 'Find your next opportunity',
          href: '/jobs',
        },
        {
          label: 'Post a Job',
          subLabel: 'Create a new job listing',
          href: '/jobs/create',
        },
      ],
    },
    {
      label: 'For Employers',
      href: '/dashboard',
      children: [
        {
          label: 'HR Dashboard',
          subLabel: 'Manage applications and candidates',
          href: '/dashboard',
        },
        {
          label: 'Analytics',
          subLabel: 'Track your hiring metrics',
          href: '/analytics',
        },
      ],
    },
    {
      label: 'About',
      href: '/about',
    },
  ];

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                as={NextLink}
                p={2}
                href={navItem.href ?? '#'}
                fontSize={'sm'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
                {navItem.children && (
                  <Icon
                    as={ChevronDownIcon}
                    transition={'all .25s ease-in-out'}
                    w={4}
                    h={4}
                    ml={1}
                  />
                )}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }) => {
  return (
    <Link
      as={NextLink}
      href={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('blue.50', 'gray.900') }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'blue.500' }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'blue.500'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = () => {
  const NAV_ITEMS = [
    {
      label: 'Jobs',
      href: '/jobs',
      children: [
        {
          label: 'Browse Jobs',
          subLabel: 'Find your next opportunity',
          href: '/jobs',
        },
        {
          label: 'Post a Job',
          subLabel: 'Create a new job listing',
          href: '/jobs/create',
        },
      ],
    },
    {
      label: 'For Employers',
      href: '/dashboard',
      children: [
        {
          label: 'HR Dashboard',
          subLabel: 'Manage applications and candidates',
          href: '/dashboard',
        },
        {
          label: 'Analytics',
          subLabel: 'Track your hiring metrics',
          href: '/analytics',
        },
      ],
    },
    {
      label: 'About',
      href: '/about',
    },
  ];

  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={NextLink}
        href={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link
                key={child.label}
                as={NextLink}
                py={2}
                href={child.href}
              >
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

export default Navbar;
