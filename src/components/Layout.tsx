import { Box, Container, Flex, Button, Text, Heading, HStack } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();

  return (
    <Box minH="100vh" dir="rtl">
      <Box bg="blue.500" px={4} py={4}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Link to="/">
              <Heading size="md" color="white">ShareIt</Heading>
            </Link>
            <HStack spacing={4} align="center">
              {user ? (
                <>
                  <Link to="/scan">
                    <Button colorScheme="whiteAlpha" variant="outline">
                      סרוק קוד QR
                    </Button>
                  </Link>
                  <Text color="white">ברוך הבא, {user.displayName}</Text>
                  <Button colorScheme="whiteAlpha" onClick={() => signOut()}>
                    התנתק
                  </Button>
                </>
              ) : (
                <Link to="/">
                  <Button colorScheme="whiteAlpha">
                    התחברות
                  </Button>
                </Link>
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