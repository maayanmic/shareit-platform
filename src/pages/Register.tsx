import { useState } from 'react';
import { Box, Button, Container, FormControl, FormLabel, Heading, Input, Text, VStack, Alert, AlertIcon } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess('ההרשמה בוצעה בהצלחה!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.message || 'אירעה שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={12} dir="rtl">
      <VStack spacing={8} align="center">
        <Heading size="2xl">הרשמה ל-ShareIt</Heading>
        <Box w="full" maxW="400px">
          <form onSubmit={handleRegister}>
            <VStack spacing={4} w="full">
              <FormControl isRequired>
                <FormLabel>אימייל</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="הכנס כתובת אימייל"
                  dir="ltr"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>סיסמה</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="הכנס סיסמה"
                  dir="ltr"
                />
              </FormControl>
              <Button
                w="full"
                size="lg"
                colorScheme="blue"
                type="submit"
                isLoading={loading}
              >
                הרשמה
              </Button>
            </VStack>
          </form>
          {error && (
            <Alert status="error" mt={4} borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          {success && (
            <Alert status="success" mt={4} borderRadius="md">
              <AlertIcon />
              {success}
            </Alert>
          )}
        </Box>
        <Text fontSize="sm" color="gray.500" textAlign="center">
          כבר יש לך חשבון? <Button variant="link" colorScheme="blue" onClick={() => navigate('/login')}>התחבר</Button>
        </Text>
      </VStack>
    </Container>
  );
}; 