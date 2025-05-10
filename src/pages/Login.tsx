import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaFacebook } from 'react-icons/fa';

export const Login = () => {
  const { signInWithFacebook } = useAuth();
  const navigate = useNavigate();

  const handleFacebookLogin = async () => {
    try {
      await signInWithFacebook();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Container maxW="container.sm" py={12} dir="rtl">
      <VStack spacing={8} align="center">
        <Heading size="2xl">ברוכים הבאים לShareIt</Heading>
        <Text fontSize="xl" textAlign="center">
          שתפו המלצות וקבלו תגמולים
        </Text>
        
        <Box w="full" maxW="400px">
          <VStack spacing={4} w="full">
            <Button
              w="full"
              size="lg"
              leftIcon={<FaFacebook />}
              colorScheme="facebook"
              onClick={handleFacebookLogin}
            >
              המשך עם פייסבוק
            </Button>
            <Button
              w="full"
              size="lg"
              variant="outline"
              colorScheme="blue"
              onClick={() => navigate('/register')}
            >
              הרשמה
            </Button>
          </VStack>
        </Box>

        <Text fontSize="sm" color="gray.500" textAlign="center">
          בהמשך, אתה מסכים לתנאי השימוש ומדיניות הפרטיות של ShareIt
        </Text>
      </VStack>
    </Container>
  );
}; 