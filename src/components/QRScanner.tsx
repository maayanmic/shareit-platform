import { useEffect, useRef, useState } from 'react';
import { Box, Button, VStack } from '@chakra-ui/react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export const QRScanner = ({ onScanSuccess, onScanError }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanner = () => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          onScanSuccess(decodedText);
          stopScanner();
        },
        (error) => {
          if (onScanError) {
            onScanError(error);
          }
        }
      );
    }
    setIsScanning(true);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  return (
    <VStack spacing={4} align="center" w="full" dir="rtl">
      <Box id="qr-reader" w="full" maxW="400px" />
      {!isScanning ? (
        <Button colorScheme="blue" onClick={startScanner}>
          התחל סריקה
        </Button>
      ) : (
        <Button colorScheme="red" onClick={stopScanner}>
          עצור סריקה
        </Button>
      )}
    </VStack>
  );
}; 