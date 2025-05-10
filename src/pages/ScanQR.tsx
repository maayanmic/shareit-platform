import { useState } from 'react';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { QRScanner } from '../components/QRScanner';
import { useAuth } from '../contexts/AuthContext';

export const ScanQR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleScanSuccess = async (decodedText: string) => {
    if (!user) {
      console.error('Authentication required');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    try {
      // כאן בדרך כלל:
      // 1. מאמתים את נתוני קוד ה-QR
      // 2. בודקים אם זה קוד עסק תקין
      // 3. מבצעים מימוש
      // 4. מעדכנים את המטבעות של המשתמש
      
      console.log('QR code scanned successfully:', decodedText);
      
      // מעבר לעמוד העסק או אישור מימוש
      navigate(`/business/${decodedText}`);
    } catch (error) {
      console.error('Failed to process QR code:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
  };

  return (
    <Container maxW="container.sm" py={8} dir="rtl">
      <VStack spacing={8} align="center">
        <Heading size="xl">סרוק קוד QR של העסק</Heading>
        <Text textAlign="center">
          סרוק את קוד ה-QR בעסק כדי לממש את ההטבה שלך
        </Text>
        
        <Box w="full">
          <QRScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
          />
        </Box>

        {isProcessing && (
          <Text color="blue.500">מעבד קוד QR...</Text>
        )}
      </VStack>
    </Container>
  );
}; 