import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, 
  Container, 
  Heading, 
  Text, 
  Stack, 
  VStack, 
  HStack, 
  Image, 
  Badge, 
  Button, 
  Divider, 
  SimpleGrid,
  Skeleton, 
  SkeletonText,
  useToast
} from '@chakra-ui/react';
import { FiPhone, FiMail, FiGlobe, FiMap, FiClock, FiEdit, FiTrash2, FiShare2 } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getBusinessById, deleteBusiness } from '../services/businessService';
import type { Business } from '../models/Business';

export const BusinessProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        if (!id) {
          setError('מזהה העסק חסר');
          setLoading(false);
          return;
        }

        const data = await getBusinessById(id);
        setBusiness(data);
      } catch (err) {
        console.error('Error fetching business:', err);
        setError('אירעה שגיאה בטעינת פרטי העסק');
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('האם אתה בטוח שברצונך למחוק עסק זה?')) return;

    try {
      await deleteBusiness(id);
      toast({
        title: 'העסק נמחק בהצלחה',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (err) {
      console.error('Error deleting business:', err);
      toast({
        title: 'אירעה שגיאה במחיקת העסק',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: business?.name,
          text: business?.description,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'הקישור הועתק ללוח',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8} align="stretch" dir="rtl">
          <Skeleton height="60px" />
          <SkeletonText mt="4" noOfLines={4} spacing="4" />
          <Skeleton height="200px" />
          <SkeletonText mt="4" noOfLines={6} spacing="4" />
        </VStack>
      </Container>
    );
  }

  if (error || !business) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={4} align="center" dir="rtl">
          <Heading color="red.500">שגיאה</Heading>
          <Text>{error || 'לא נמצאו פרטי עסק'}</Text>
          <Button colorScheme="blue" onClick={() => navigate('/')}>חזרה לדף הבית</Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8} dir="rtl">
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={2}>
            <Heading size="2xl">{business.name}</Heading>
            {business.categories && business.categories.length > 0 && (
              <HStack spacing={2}>
                {business.categories.map((category, idx) => (
                  <Badge key={idx} colorScheme="blue" fontSize="sm">
                    {category}
                  </Badge>
                ))}
              </HStack>
            )}
          </VStack>

          {/* User is business owner */}
          {user && (
            <HStack spacing={4}>
              <Button
                leftIcon={<FiShare2 />}
                colorScheme="green"
                variant="outline"
                onClick={handleShare}
              >
                שיתוף
              </Button>
              <Button
                leftIcon={<FiEdit />}
                colorScheme="blue"
                onClick={() => navigate(`/business/edit/${id}`)}
              >
                עריכה
              </Button>
              <Button
                leftIcon={<FiTrash2 />}
                colorScheme="red"
                variant="outline"
                onClick={handleDelete}
              >
                מחיקה
              </Button>
            </HStack>
          )}
        </HStack>

        <Divider />

        {/* Business Details */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <VStack align="start" spacing={4}>
            <Heading size="md">תיאור</Heading>
            <Text>{business.description}</Text>

            <VStack align="start" spacing={2} width="full">
              <Heading size="md" mt={4}>פרטי קשר</Heading>
              <Divider />
              
              <HStack>
                <FiMap />
                <Text>{business.address}</Text>
              </HStack>
              
              <HStack>
                <FiPhone />
                <Text>{business.phone}</Text>
              </HStack>
              
              <HStack>
                <FiMail />
                <Text>{business.email}</Text>
              </HStack>
              
              {business.website && (
                <HStack>
                  <FiGlobe />
                  <Text as="a" href={business.website} color="blue.500" textDecoration="underline" target="_blank" rel="noopener noreferrer">
                    {business.website}
                  </Text>
                </HStack>
              )}
            </VStack>

            {business.hours && Object.values(business.hours).some(h => h) && (
              <VStack align="start" spacing={2} width="full">
                <Heading size="md" mt={4}>שעות פעילות</Heading>
                <Divider />
                
                <HStack justify="space-between" width="full">
                  <Text fontWeight="bold">ראשון:</Text>
                  <Text>{business.hours.sunday || 'סגור'}</Text>
                </HStack>
                
                <HStack justify="space-between" width="full">
                  <Text fontWeight="bold">שני:</Text>
                  <Text>{business.hours.monday || 'סגור'}</Text>
                </HStack>
                
                <HStack justify="space-between" width="full">
                  <Text fontWeight="bold">שלישי:</Text>
                  <Text>{business.hours.tuesday || 'סגור'}</Text>
                </HStack>
                
                <HStack justify="space-between" width="full">
                  <Text fontWeight="bold">רביעי:</Text>
                  <Text>{business.hours.wednesday || 'סגור'}</Text>
                </HStack>
                
                <HStack justify="space-between" width="full">
                  <Text fontWeight="bold">חמישי:</Text>
                  <Text>{business.hours.thursday || 'סגור'}</Text>
                </HStack>
                
                <HStack justify="space-between" width="full">
                  <Text fontWeight="bold">שישי:</Text>
                  <Text>{business.hours.friday || 'סגור'}</Text>
                </HStack>
                
                <HStack justify="space-between" width="full">
                  <Text fontWeight="bold">שבת:</Text>
                  <Text>{business.hours.saturday || 'סגור'}</Text>
                </HStack>
              </VStack>
            )}
          </VStack>

          <Box>
            {business.logoUrl ? (
              <Image 
                src={business.logoUrl} 
                alt={business.name}
                borderRadius="md"
                objectFit="cover"
                width="100%"
                maxHeight="400px"
              />
            ) : (
              <Box 
                bg="gray.200" 
                height="300px" 
                borderRadius="md" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
              >
                <Text color="gray.500" fontSize="lg">אין תמונה זמינה</Text>
              </Box>
            )}
          </Box>
        </SimpleGrid>
      </VStack>
    </Container>
  );
}; 