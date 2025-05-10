import { Box, Container, Flex, Button, Text, Heading, HStack, Link as ChakraLink, Stack } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'ראשי' },
    { path: '/businesses', label: 'עסקים' },
  ];

  return (
    <Box minH="100vh" dir="rtl">
      <Box bg="blue.500" px={4} py={4}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" wrap="wrap">
            <Link to="/">
              <Heading size="md" color="white">ShareIt</Heading>
            </Link>
            
            {/* Navigation */}
            <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
              {navLinks.map((link) => (
                <ChakraLink
                  key={link.path}
                  as={Link}
                  to={link.path}
                  color="white"
                  fontWeight={location.pathname === link.path ? 'bold' : 'normal'}
                  borderBottom={location.pathname === link.path ? '2px solid white' : 'none'}
                  _hover={{ textDecoration: 'none', borderBottom: '2px solid white' }}
                  pb={1}
                >
                  {link.label}
                </ChakraLink>
              ))}
            </HStack>
            
            <HStack spacing={4} align="center">
              {user ? (
                <>
                  <Link to="/scan">
                    <Button colorScheme="whiteAlpha" variant="outline" size={{ base: 'sm', md: 'md' }}>
                      סרוק קוד QR
                    </Button>
                  </Link>
                  <Link to="/business/new">
                    <Button colorScheme="whiteAlpha" variant="outline" size={{ base: 'sm', md: 'md' }}>
                      הוסף עסק
                    </Button>
                  </Link>
                  <Text color="white" display={{ base: 'none', md: 'block' }}>ברוך הבא, {user.displayName || user.email}</Text>
                  <Button colorScheme="whiteAlpha" onClick={() => signOut()} size={{ base: 'sm', md: 'md' }}>
                    התנתק
                  </Button>
                </>
              ) : (
                <Stack direction={{ base: 'column', sm: 'row' }} spacing={2}>
                  <Link to="/login">
                    <Button colorScheme="whiteAlpha" size={{ base: 'sm', md: 'md' }}>
                      התחברות
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button colorScheme="whiteAlpha" variant="outline" size={{ base: 'sm', md: 'md' }}>
                      הרשמה
                    </Button>
                  </Link>
                </Stack>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>
      <Container maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  );
}; 