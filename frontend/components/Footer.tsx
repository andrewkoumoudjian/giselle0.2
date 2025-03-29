'use client';

import { Box, Container, Grid, Typography, Link as MuiLink, IconButton, Stack, Divider } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import Link from 'next/link';

const footerLinks = [
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Blog', href: '/blog' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '/docs' },
      { name: 'Interview Tips', href: '/resources/tips' },
      { name: 'Success Stories', href: '/success-stories' },
      { name: 'FAQs', href: '/faqs' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Accessibility', href: '/accessibility' }
    ]
  }
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        backgroundColor: 'grey.50',
        pt: { xs: 6, md: 10 },
        pb: 4,
        borderTop: '1px solid',
        borderColor: 'grey.200'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and description */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                mb: 2, 
                color: 'primary.main',
                fontSize: '1.5rem',
                letterSpacing: '.1rem',
              }}
            >
              GISELLE
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '90%' }}>
              An AI-powered interview platform that eliminates bias in the hiring process.
              Empowering companies to make fair hiring decisions based on skills and qualifications.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton color="primary" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton color="primary" aria-label="Twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton color="primary" aria-label="LinkedIn">
                <LinkedInIcon />
              </IconButton>
              <IconButton color="primary" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
            </Stack>
          </Grid>
          
          {/* Footer links */}
          {footerLinks.map((section) => (
            <Grid item xs={6} sm={4} md={2.5} key={section.title}>
              <Typography 
                variant="subtitle1" 
                component="h3" 
                sx={{ fontWeight: 600, mb: 2 }}
              >
                {section.title}
              </Typography>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                {section.links.map((link) => (
                  <Box component="li" key={link.name} sx={{ mb: 1 }}>
                    <MuiLink 
                      component={Link} 
                      href={link.href}
                      underline="hover"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      {link.name}
                    </MuiLink>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
          
          {/* Contact info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="subtitle1" 
              component="h3" 
              sx={{ fontWeight: 600, mb: 2 }}
            >
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              1234 Market Street, Suite 5000
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              San Francisco, CA 94103
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              support@giselle.ai
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              (415) 555-0123
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Giselle AI. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
} 