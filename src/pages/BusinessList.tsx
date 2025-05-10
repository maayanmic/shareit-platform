import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  SimpleGrid,
  Text,
  VStack,
  Skeleton,
  Badge,
  useToast
} from '@chakra-ui/react';
import { FiSearch, FiPlus, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getAllBusinesses } from '../services/businessService';
import type { Business } from '../models/Business';

export const BusinessList = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const data = await getAllBusinesses();
        setBusinesses(data);
        setFilteredBusinesses(data);
      } catch (error) {
        console.error('Error fetching businesses:', error);
        toast({
          title: 'שגיאה בטעינת העסקים',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [toast]);

  useEffect(() => {
    // Filter businesses when search query changes
    if (searchQuery.trim() === '') {
      setFilteredBusinesses(businesses);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = businesses.filter(
        (business) =>
          business.name.toLowerCase().includes(query) ||
          business.description.toLowerCase().includes(query) ||
          business.address.toLowerCase().includes(query) ||
          (business.categories && business.categories.some(category => category.toLowerCase().includes(query)))
      );
      setFilteredBusinesses(filtered);
    }
  }, [searchQuery, businesses]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8} dir="rtl">
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading>עסקים</Heading>
            <Skeleton height="40px" width="150px" />
          </Flex>
          <Skeleton height="50px" />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} height="200px" borderRadius="md" />
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8} dir="rtl">
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Heading>עסקים</Heading>
          {user && (
            <Button
              as={RouterLink}
              to="/business/new"
              colorScheme="blue"
              leftIcon={<FiPlus />}
            >
              הוסף עסק חדש
            </Button>
          )}
        </Flex>

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="חפש עסק לפי שם, תיאור, כתובת או קטגוריה"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </InputGroup>

        {filteredBusinesses.length === 0 ? (
          <VStack py={10} spacing={4}>
            <Heading size="md">לא נמצאו עסקים</Heading>
            <Text>נסה לחפש מונח אחר או הוסף עסק חדש</Text>
            {user && (
              <Button
                as={RouterLink}
                to="/business/new"
                colorScheme="blue"
                leftIcon={<FiPlus />}
              >
                הוסף עסק חדש
              </Button>
            )}
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {filteredBusinesses.map((business) => (
              <Link
                as={RouterLink}
                to={`/business/${business.id}`}
                key={business.id}
                _hover={{ textDecoration: 'none' }}
              >
                <Box
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  transition="all 0.3s"
                  _hover={{ shadow: 'lg', transform: 'translateY(-5px)' }}
                >
                  <Box h="160px" bg="gray.100" position="relative">
                    {business.logoUrl ? (
                      <Image
                        src={business.logoUrl}
                        alt={business.name}
                        objectFit="cover"
                        w="100%"
                        h="100%"
                      />
                    ) : (
                      <Flex
                        w="100%"
                        h="100%"
                        justify="center"
                        align="center"
                        bg="blue.50"
                        color="blue.500"
                      >
                        <Text fontSize="xl" fontWeight="bold">
                          {business.name.charAt(0).toUpperCase()}
                        </Text>
                      </Flex>
                    )}
                  </Box>

                  <Box p={4}>
                    <Heading size="md" mb={2}>
                      {business.name}
                    </Heading>
                    
                    <Text fontSize="sm" noOfLines={2} mb={3} color="gray.600">
                      {business.description}
                    </Text>
                    
                    {business.categories && business.categories.length > 0 && (
                      <HStack spacing={2} mb={3} flexWrap="wrap">
                        {business.categories.map((category, idx) => (
                          <Badge key={idx} colorScheme="blue" mb={2}>
                            {category}
                          </Badge>
                        ))}
                      </HStack>
                    )}
                    
                    <Divider my={3} />
                    
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <FiMapPin size={14} />
                        <Text fontSize="sm" noOfLines={1}>
                          {business.address}
                        </Text>
                      </HStack>
                      
                      <HStack>
                        <FiPhone size={14} />
                        <Text fontSize="sm">{business.phone}</Text>
                      </HStack>
                      
                      <HStack>
                        <FiMail size={14} />
                        <Text fontSize="sm" noOfLines={1}>
                          {business.email}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                </Box>
              </Link>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
}; 