import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      let isMounted = true;
      
      // Dynamically import QR Scanner library to reduce initial bundle size
      import('html5-qrcode').then(({ Html5Qrcode }) => {
        if (!isMounted) return;
        
        setLoading(false);
        
        const html5QrCode = new Html5Qrcode("qr-reader");
        
        const qrConfig = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        };
        
        html5QrCode.start(
          { facingMode: "environment" },
          qrConfig,
          (decodedText) => {
            onScan(decodedText);
            html5QrCode.stop();
            onClose();
          },
          (errorMessage) => {
            console.log(errorMessage);
          }
        ).catch((err) => {
          setError(`Unable to start scanner: ${err}`);
          setLoading(false);
        });
        
        return () => {
          isMounted = false;
          html5QrCode.stop().catch(err => console.error(err));
        };
      }).catch(err => {
        setError(`Failed to load scanner: ${err}`);
        setLoading(false);
      });
    }
  }, [isOpen, onScan, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center">
          {loading ? (
            <Skeleton className="h-64 w-full rounded-md" />
          ) : error ? (
            <div className="p-4 text-red-500 text-center">
              <p>{error}</p>
              <p className="text-sm mt-2">Please ensure camera permissions are enabled</p>
            </div>
          ) : (
            <>
              <div id="qr-reader" className="w-full max-w-sm mx-auto"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                Position the QR code within the frame to scan
              </p>
            </>
          )}
        </div>
        
        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => {}}>
            Upload Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
