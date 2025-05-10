import { useState } from 'react';
import { Box, Heading, Text, Button, VStack, Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Input, Alert, AlertIcon, Divider } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { FaFacebook } from 'react-icons/fa';

export const Home = () => {
  const { user, signInWithFacebook } = useAuth();
  const navigate = useNavigate();

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'שגיאה בהתחברות');
    } finally {
      setLoginLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setRegLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      setRegSuccess('ההרשמה בוצעה בהצלחה!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setRegError(err.message || 'אירעה שגיאה בהרשמה');
    } finally {
      setRegLoading(false);
    }
  };

  // Facebook auth handler
  const handleFacebookAuth = async () => {
    try {
      await signInWithFacebook();
      navigate('/dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'שגיאה בהתחברות עם פייסבוק');
    }
  };

  if (user) {
    return (
      <VStack spacing={8} align="center" py={12} dir="rtl">
        <Heading size="2xl">ברוך הבא ל-ShareIt</Heading>
        <Text fontSize="xl">אתה מחובר בתור {user.displayName || user.email}</Text>
        <Button colorScheme="blue" onClick={() => navigate('/dashboard')}>
          עבור ללוח הבקרה
        </Button>
      </VStack>
    );
  }

  return (
    <VStack spacing={8} align="center" py={12} dir="rtl">
      <Heading size="2xl">ברוכים הבאים ל-ShareIt</Heading>
      <Tabs variant="enclosed" colorScheme="blue" w="full" maxW="400px" isFitted>
        <TabList>
          <Tab>התחברות</Tab>
          <Tab>הרשמה</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <VStack spacing={4} w="full">
              <Button
                w="full"
                size="lg"
                leftIcon={<FaFacebook />}
                bg="#1877F2"
                color="white"
                _hover={{ bg: '#166FE5' }}
                _active={{ bg: '#166FE5' }}
                onClick={handleFacebookAuth}
              >
                התחבר עם פייסבוק
              </Button>
              <Box position="relative" w="full" py={4}>
                <Divider />
                <Text
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  bg="white"
                  px={2}
                  color="gray.500"
                >
                  או
                </Text>
              </Box>
              <form onSubmit={handleLogin}>
                <VStack spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>אימייל</FormLabel>
                    <Input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="הכנס כתובת אימייל"
                      dir="ltr"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>סיסמה</FormLabel>
                    <Input
                      type="password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="הכנס סיסמה"
                      dir="ltr"
                    />
                  </FormControl>
                  <Button
                    w="full"
                    size="lg"
                    colorScheme="blue"
                    type="submit"
                    isLoading={loginLoading}
                  >
                    התחבר
                  </Button>
                  {loginError && (
                    <Alert status="error" mt={2} borderRadius="md">
                      <AlertIcon />
                      {loginError}
                    </Alert>
                  )}
                </VStack>
              </form>
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} w="full">
              <Button
                w="full"
                size="lg"
                leftIcon={<FaFacebook />}
                bg="#1877F2"
                color="white"
                _hover={{ bg: '#166FE5' }}
                _active={{ bg: '#166FE5' }}
                onClick={handleFacebookAuth}
              >
                הרשמה עם פייסבוק
              </Button>
              <Box position="relative" w="full" py={4}>
                <Divider />
                <Text
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  bg="white"
                  px={2}
                  color="gray.500"
                >
                  או
                </Text>
              </Box>
              <form onSubmit={handleRegister}>
                <VStack spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>אימייל</FormLabel>
                    <Input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="הכנס כתובת אימייל"
                      dir="ltr"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>סיסמה</FormLabel>
                    <Input
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="הכנס סיסמה"
                      dir="ltr"
                    />
                  </FormControl>
                  <Button
                    w="full"
                    size="lg"
                    colorScheme="blue"
                    type="submit"
                    isLoading={regLoading}
                  >
                    הרשמה
                  </Button>
                  {regError && (
                    <Alert status="error" mt={2} borderRadius="md">
                      <AlertIcon />
                      {regError}
                    </Alert>
                  )}
                  {regSuccess && (
                    <Alert status="success" mt={2} borderRadius="md">
                      <AlertIcon />
                      {regSuccess}
                    </Alert>
                  )}
                </VStack>
              </form>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}; 