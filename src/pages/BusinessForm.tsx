import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Textarea,
  VStack,
  HStack,
  useToast
} from '@chakra-ui/react';
import { FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { createBusiness, getBusinessById, updateBusiness } from '../services/businessService';
import type { Business } from '../models/Business';

// Common business categories
const businessCategories = [
  'מסעדה',
  'בית קפה',
  'שירותים מקצועיים',
  'בריאות',
  'חינוך',
  'קמעונאות',
  'טכנולוגיה',
  'אחר'
];

type FormErrors = {
  [key: string]: string;
};

export const BusinessForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState<Omit<Business, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logoUrl: '',
    hours: {
      sunday: '',
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
    },
    categories: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      toast({
        title: 'עליך להתחבר כדי להוסיף או לערוך עסק',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }

    // Fetch business data if in edit mode
    if (isEditMode && id) {
      const fetchBusiness = async () => {
        try {
          setLoading(true);
          const businessData = await getBusinessById(id);
          
          if (businessData) {
            setFormData({
              name: businessData.name,
              description: businessData.description,
              address: businessData.address,
              phone: businessData.phone,
              email: businessData.email,
              website: businessData.website || '',
              logoUrl: businessData.logoUrl || '',
              hours: businessData.hours || {
                sunday: '',
                monday: '',
                tuesday: '',
                wednesday: '',
                thursday: '',
                friday: '',
                saturday: '',
              },
              categories: businessData.categories || [],
            });
            
            setSelectedCategories(businessData.categories || []);
          }
        } catch (error) {
          console.error('Error fetching business data:', error);
          toast({
            title: 'שגיאה בטעינת פרטי העסק',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      };

      fetchBusiness();
    }
  }, [id, isEditMode, navigate, toast, user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'שם העסק הוא שדה חובה';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'תיאור העסק הוא שדה חובה';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'כתובת העסק היא שדה חובה';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'מספר הטלפון הוא שדה חובה';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'כתובת האימייל היא שדה חובה';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'כתובת אימייל לא תקינה';
    }

    if (formData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/.test(formData.website)) {
      newErrors.website = 'כתובת אתר לא תקינה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.startsWith('hours.')) {
      const hourField = name.split('.')[1];
      setFormData({
        ...formData,
        hours: {
          ...formData.hours,
          [hourField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value && !selectedCategories.includes(value)) {
      const newCategories = [...selectedCategories, value];
      setSelectedCategories(newCategories);
      setFormData({
        ...formData,
        categories: newCategories,
      });
    }
  };

  const handleRemoveCategory = (category: string) => {
    const newCategories = selectedCategories.filter(c => c !== category);
    setSelectedCategories(newCategories);
    setFormData({
      ...formData,
      categories: newCategories,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isEditMode && id) {
        await updateBusiness(id, formData);
        toast({
          title: 'העסק עודכן בהצלחה',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate(`/business/${id}`);
      } else {
        if (!user?.uid) {
          throw new Error('User not authenticated');
        }
        const newId = await createBusiness(formData, user.uid);
        toast({
          title: 'העסק נוצר בהצלחה',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate(`/business/${newId}`);
      }
    } catch (error) {
      console.error('Error saving business:', error);
      toast({
        title: 'אירעה שגיאה בשמירת העסק',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.lg" py={8} dir="rtl">
      <VStack spacing={8} align="stretch">
        <Heading>{isEditMode ? 'עריכת עסק' : 'הוספת עסק חדש'}</Heading>
        <Divider />

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired isInvalid={!!errors.name}>
              <FormLabel>שם העסק</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="הזן את שם העסק"
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.description}>
              <FormLabel>תיאור העסק</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="הזן תיאור קצר של העסק"
                rows={4}
              />
              <FormErrorMessage>{errors.description}</FormErrorMessage>
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired isInvalid={!!errors.address}>
                <FormLabel>כתובת</FormLabel>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="הזן את כתובת העסק"
                />
                <FormErrorMessage>{errors.address}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.phone}>
                <FormLabel>טלפון</FormLabel>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="הזן מספר טלפון"
                  type="tel"
                />
                <FormErrorMessage>{errors.phone}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired isInvalid={!!errors.email}>
                <FormLabel>דואר אלקטרוני</FormLabel>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="הזן כתובת אימייל"
                  type="email"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.website}>
                <FormLabel>אתר אינטרנט</FormLabel>
                <Input
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="הזן כתובת אתר (לא חובה)"
                  type="url"
                />
                <FormErrorMessage>{errors.website}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>קטגוריות</FormLabel>
              <Select
                placeholder="בחר קטגוריה"
                onChange={handleCategoryChange}
                value=""
              >
                {businessCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>

              <HStack mt={2} flexWrap="wrap" spacing={2}>
                {selectedCategories.map((category) => (
                  <Button
                    key={category}
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => handleRemoveCategory(category)}
                    rightIcon={<FiX />}
                    mb={2}
                  >
                    {category}
                  </Button>
                ))}
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel>לוגו העסק (URL)</FormLabel>
              <Input
                name="logoUrl"
                value={formData.logoUrl || ''}
                onChange={handleInputChange}
                placeholder="הזן קישור לתמונת הלוגו (לא חובה)"
              />
            </FormControl>

            <Heading size="md" mt={2}>שעות פעילות</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>ראשון</FormLabel>
                <Input
                  name="hours.sunday"
                  value={formData.hours?.sunday || ''}
                  onChange={handleInputChange}
                  placeholder="לדוגמה: 9:00 - 18:00"
                />
              </FormControl>

              <FormControl>
                <FormLabel>שני</FormLabel>
                <Input
                  name="hours.monday"
                  value={formData.hours?.monday || ''}
                  onChange={handleInputChange}
                  placeholder="לדוגמה: 9:00 - 18:00"
                />
              </FormControl>

              <FormControl>
                <FormLabel>שלישי</FormLabel>
                <Input
                  name="hours.tuesday"
                  value={formData.hours?.tuesday || ''}
                  onChange={handleInputChange}
                  placeholder="לדוגמה: 9:00 - 18:00"
                />
              </FormControl>

              <FormControl>
                <FormLabel>רביעי</FormLabel>
                <Input
                  name="hours.wednesday"
                  value={formData.hours?.wednesday || ''}
                  onChange={handleInputChange}
                  placeholder="לדוגמה: 9:00 - 18:00"
                />
              </FormControl>

              <FormControl>
                <FormLabel>חמישי</FormLabel>
                <Input
                  name="hours.thursday"
                  value={formData.hours?.thursday || ''}
                  onChange={handleInputChange}
                  placeholder="לדוגמה: 9:00 - 18:00"
                />
              </FormControl>

              <FormControl>
                <FormLabel>שישי</FormLabel>
                <Input
                  name="hours.friday"
                  value={formData.hours?.friday || ''}
                  onChange={handleInputChange}
                  placeholder="לדוגמה: 9:00 - 18:00"
                />
              </FormControl>

              <FormControl>
                <FormLabel>שבת</FormLabel>
                <Input
                  name="hours.saturday"
                  value={formData.hours?.saturday || ''}
                  onChange={handleInputChange}
                  placeholder="לדוגמה: סגור"
                />
              </FormControl>
            </SimpleGrid>

            <HStack spacing={4} justifyContent="flex-end" mt={4}>
              <Button
                colorScheme="gray"
                onClick={() => navigate(isEditMode && id ? `/business/${id}` : '/')}
              >
                ביטול
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                isLoading={loading}
                leftIcon={<FiSave />}
              >
                {isEditMode ? 'עדכן עסק' : 'צור עסק'}
              </Button>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}; 