'use client';

import { useState } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  Typography, 
  Menu, 
  Container, 
  Avatar, 
  Button, 
  Tooltip, 
  MenuItem,
  useScrollTrigger,
  Slide,
  Stack
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const pages = [
  { title: 'Home', path: '/' },
  { title: 'About', path: '/about' },
  { title: 'How It Works', path: '/how-it-works' },
  { title: 'For Employers', path: '/employers' }
];

const userPages = [
  { title: 'My Profile', path: '/profile' },
  { title: 'My Interviews', path: '/interviews' },
  { title: 'Settings', path: '/settings' },
  { title: 'Logout', path: '/logout' }
];

function HideOnScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  
  // Mock user state - in a real app, this would come from authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <HideOnScroll>
      <AppBar position="sticky" color="default" elevation={0} sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid',
        borderColor: 'grey.100'
      }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* Desktop Logo */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'primary.main',
                textDecoration: 'none',
                fontSize: '1.5rem'
              }}
            >
              GISELLE
            </Typography>

            {/* Mobile Menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem 
                    key={page.title} 
                    onClick={handleCloseNavMenu}
                    component={Link}
                    href={page.path}
                    selected={pathname === page.path}
                  >
                    <Typography textAlign="center">{page.title}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Mobile Logo */}
            <Typography
              variant="h5"
              noWrap
              component={Link}
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'primary.main',
                textDecoration: 'none',
              }}
            >
              GISELLE
            </Typography>

            {/* Desktop Navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              {pages.map((page) => (
                <Button
                  key={page.title}
                  onClick={handleCloseNavMenu}
                  component={Link}
                  href={page.path}
                  sx={{ 
                    mx: 1, 
                    my: 2, 
                    color: pathname === page.path ? 'primary.main' : 'text.primary',
                    fontWeight: pathname === page.path ? 700 : 500,
                    position: 'relative',
                    '&::after': pathname === page.path ? {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '3px',
                      bottom: -8,
                      left: 0,
                      backgroundColor: 'primary.main',
                      borderRadius: '2px'
                    } : {}
                  }}
                >
                  {page.title}
                </Button>
              ))}
            </Box>

            {/* Authentication */}
            <Box sx={{ flexGrow: 0 }}>
              {isLoggedIn ? (
                <>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar 
                        alt="User Profile" 
                        src="/images/avatar.png"
                        sx={{ width: 40, height: 40 }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    {userPages.map((page) => (
                      <MenuItem 
                        key={page.title} 
                        onClick={handleCloseUserMenu}
                        component={Link}
                        href={page.path}
                      >
                        <Typography textAlign="center">{page.title}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button 
                    component={Link} 
                    href="/login" 
                    color="primary"
                    variant="text"
                    sx={{ 
                      fontWeight: 600,
                      display: { xs: 'none', sm: 'inline-flex' }
                    }}
                  >
                    Log In
                  </Button>
                  <Button 
                    component={Link} 
                    href="/signup" 
                    color="primary"
                    variant="contained"
                    sx={{ fontWeight: 600 }}
                  >
                    Sign Up
                  </Button>
                </Stack>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
} 