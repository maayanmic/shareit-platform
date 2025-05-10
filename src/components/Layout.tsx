import { Box, Container, Flex, Button, Text, Heading, HStack, Link as ChakraLink, Stack, IconButton, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, VStack } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navLinks = [
    { path: '/', label: 'ראשי' },
    { path: '/businesses', label: 'עסקים' },
  ];

  const NavContent = () => (
    <>
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
          onClick={onClose}
        >
          {link.label}
        </ChakraLink>
      ))}
    </>
  );

  return (
    <Box minH="100vh" dir="rtl">
      <Box bg="blue.500" px={4} py={4}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" wrap="wrap">
            <HStack spacing={4}>
              <IconButton
                aria-label="Open menu"
                icon={<FiMenu />}
                display={{ base: 'flex', md: 'none' }}
                colorScheme="whiteAlpha"
                onClick={onOpen}
              />
              <Link to="/">
                <Heading size="md" color="white">ShareIt</Heading>
              </Link>
            </HStack>
            
            {/* Desktop Navigation */}
            <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
              <NavContent />
            </HStack>
            
            {/* Mobile Drawer */}
            <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader borderBottomWidth="1px">ShareIt</DrawerHeader>
                <DrawerBody>
                  <VStack spacing={4} align="stretch">
                    <NavContent />
                  </VStack>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
            
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