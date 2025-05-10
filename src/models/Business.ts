export interface Business {
  id?: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  categories?: string[];
  createdAt?: Date;
  updatedAt?: Date;
} 