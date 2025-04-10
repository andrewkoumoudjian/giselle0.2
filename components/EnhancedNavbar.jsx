import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Collapse,
  Icon,
  Link as ChakraLink,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Container,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  HStack,
  Tooltip,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  AddIcon,
  ExternalLinkIcon,
  SettingsIcon,
  BellIcon,
} from '@chakra-ui/icons';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';

const EnhancedNavbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const router = useRouter();
  const { user, isAuthenticated, logout, hasRole } = useSupabaseAuth();

  // Colors
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('blue.600', 'blue.300');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Box>
      <Flex
        bg={bg}
        color={linkColor}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4, md: 6 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={borderColor}
        align={'center'}
        position="sticky"
        top={0}
        zIndex={1000}
        boxShadow="sm"
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
            <Icon as={isOpen ? CloseIcon : HamburgerIcon} w={5} h={5} />
          </Button>
        </Flex>

        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <NextLink href="/" passHref>
            <Box
              as="a"
              textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
              fontFamily={'heading'}
              color={useColorModeValue('gray.800', 'white')}
              fontWeight="bold"
              fontSize="xl"
              _hover={{
                textDecoration: 'none',
              }}
            >
              HR Talent Platform
            </Box>
          </NextLink>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav
              linkColor={linkColor}
              linkHoverColor={linkHoverColor}
              popoverContentBgColor={popoverContentBgColor}
              currentPath={router.pathname}
            />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={4}
          align="center"
        >
          {isAuthenticated() ? (
            <HStack spacing={4}>
              {/* Notifications */}
              <Tooltip label="Notifications" hasArrow placement="bottom">
                <Button
                  variant="ghost"
                  colorScheme="blue"
                  size="sm"
                  position="relative"
                >
                  <Icon as={BellIcon} boxSize={5} />
                  <Box
                    position="absolute"
                    top="0"
                    right="0"
                    bg="red.500"
                    borderRadius="full"
                    w="14px"
                    h="14px"
                    fontSize="xs"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontWeight="bold"
                  >
                    3
                  </Box>
                </Button>
              </Tooltip>

              {/* User Menu */}
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}
                >
                  <HStack spacing={2}>
                    <Avatar
                      size={'sm'}
                      name={user?.name || 'User'}
                      src={user?.avatar || undefined}
                      bg="blue.500"
                    />
                    <Text display={{ base: 'none', md: 'flex' }} fontWeight="medium">
                      {user?.name || 'User'}
                    </Text>
                    <ChevronDownIcon />
                  </HStack>
                </MenuButton>
                <MenuList zIndex={1001}>
                  {hasRole('employer') && (
                    <MenuItem icon={<Icon as={ChevronRightIcon} />}>
                      <NextLink href="/dashboard" passHref>
                        <Box as="a">HR Dashboard</Box>
                      </NextLink>
                    </MenuItem>
                  )}
                  {hasRole('jobseeker') && (
                    <MenuItem icon={<Icon as={ChevronRightIcon} />}>
                      <NextLink href="/applications" passHref>
                        <Box as="a">My Applications</Box>
                      </NextLink>
                    </MenuItem>
                  )}
                  <MenuItem icon={<Icon as={SettingsIcon} />}>
                    <NextLink href="/profile" passHref>
                      <Box as="a">Profile Settings</Box>
                    </NextLink>
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={logout} color="red.500">Sign Out</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          ) : (
            <>
              <NextLink href="/login" passHref>
                <Button
                  as="a"
                  fontSize={'sm'}
                  fontWeight={500}
                  variant={'ghost'}
                  colorScheme="blue"
                >
                  Sign In
                </Button>
              </NextLink>
              <NextLink href="/register" passHref>
                <Button
                  as="a"
                  display={{ base: 'none', md: 'inline-flex' }}
                  fontSize={'sm'}
                  fontWeight={600}
                  colorScheme="blue"
                  leftIcon={<AddIcon />}
                >
                  Sign Up
                </Button>
              </NextLink>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav currentPath={router.pathname} />
      </Collapse>
    </Box>
  );
};

const DesktopNav = ({ linkColor, linkHoverColor, popoverContentBgColor, currentPath }) => {
  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => {
        const isActive = currentPath === navItem.href ||
                       (navItem.children && navItem.children.some(child => currentPath === child.href));

        return (
          <Box key={navItem.label}>
            <Popover trigger={'hover'} placement={'bottom-start'} gutter={12}>
              <PopoverTrigger>
                <NextLink href={navItem.href ?? '#'} passHref>
                  <Box
                    as="a"
                    p={2}
                    fontSize={'sm'}
                    fontWeight={500}
                    color={isActive ? 'blue.500' : linkColor}
                    _hover={{
                      textDecoration: 'none',
                      color: linkHoverColor,
                    }}
                    position="relative"
                    _after={isActive ? {
                      content: '""',
                      position: 'absolute',
                      bottom: '-2px',
                      left: '0',
                      right: '0',
                      height: '2px',
                      backgroundColor: 'blue.500',
                      borderRadius: 'full',
                    } : {}}
                  >
                  {navItem.label}
                  {navItem.children && (
                    <Icon
                      as={ChevronDownIcon}
                      w={4}
                      h={4}
                      ml={1}
                      transform={'translateY(-1px)'}
                    />
                  )}
                  </Box>
                </NextLink>
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
                      <DesktopSubNav
                        key={child.label}
                        {...child}
                        isActive={currentPath === child.href}
                      />
                    ))}
                  </Stack>
                </PopoverContent>
              )}
            </Popover>
          </Box>
        );
      })}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel, icon, isActive }) => {
  return (
    <NextLink href={href} passHref>
      <Box
        as="a"
        role={'group'}
        display={'block'}
        p={2}
        rounded={'md'}
        _hover={{ bg: useColorModeValue('blue.50', 'gray.900') }}
        bg={isActive ? useColorModeValue('blue.50', 'gray.900') : 'transparent'}
      >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            color={isActive ? 'blue.500' : 'inherit'}
            _groupHover={{ color: 'blue.500' }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={'sm'} color={isActive ? 'blue.400' : 'gray.500'}>{subLabel}</Text>
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
          <Icon color={'blue.400'} w={5} h={5} as={icon || ChevronRightIcon} />
        </Flex>
      </Stack>
      </Box>
    </NextLink>
  );
};

const MobileNav = ({ currentPath }) => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
      borderBottomWidth={1}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem
          key={navItem.label}
          {...navItem}
          isActive={currentPath === navItem.href ||
                   (navItem.children && navItem.children.some(child => currentPath === child.href))}
          currentPath={currentPath}
        />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href, isActive, currentPath }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <NextLink href={href ?? '#'} passHref>
        <Flex
          as="a"
          py={2}
          justify={'space-between'}
          align={'center'}
          _hover={{
            textDecoration: 'none',
          }}
        >
        <Text
          fontWeight={600}
          color={isActive ? 'blue.500' : useColorModeValue('gray.600', 'gray.200')}
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
      </NextLink>

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
              <NextLink
                key={child.label}
                href={child.href}
                passHref
              >
                <Box
                  as="a"
                  py={2}
                  color={currentPath === child.href ? 'blue.500' : 'inherit'}
                  fontWeight={currentPath === child.href ? 600 : 400}
                >
                  {child.label}
                </Box>
              </NextLink>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: 'Jobs',
    href: '/jobs',
    children: [
      {
        label: 'Browse Jobs',
        subLabel: 'Find open positions',
        href: '/jobs',
        icon: ExternalLinkIcon,
      },
      {
        label: 'Post a Job',
        subLabel: 'Create a new job listing',
        href: '/jobs/create',
        icon: AddIcon,
      },
    ],
  },
  {
    label: 'Candidates',
    href: '/candidates',
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'About',
    href: '/about',
  },
];

export default EnhancedNavbar;
