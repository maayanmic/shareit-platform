import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Business } from '../models/Business';

const COLLECTION_NAME = 'businesses';
const businessesCollection = collection(db, COLLECTION_NAME);

// Convert Firestore data to Business object
const convertFirestoreData = (data: any, id: string): Business => {
  return {
    id,
    ...data,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate()
  };
};

// Get all businesses
export const getAllBusinesses = async (): Promise<Business[]> => {
  const snapshot = await getDocs(businessesCollection);
  return snapshot.docs.map(doc => convertFirestoreData(doc.data(), doc.id));
};

// Get business by ID
export const getBusinessById = async (id: string): Promise<Business | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return convertFirestoreData(snapshot.data(), id);
};

// Create new business
export const createBusiness = async (business: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> => {
  const docRef = await addDoc(businessesCollection, {
    ...business,
    ownerId: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return docRef.id;
};

// Update business
export const updateBusiness = async (id: string, data: Partial<Business>): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  
  // Remove fields that shouldn't be updated directly
  const { id: _, createdAt, updatedAt, ...updateData } = data;
  
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};

// Delete business
export const deleteBusiness = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

// Get businesses by category
export const getBusinessesByCategory = async (category: string): Promise<Business[]> => {
  const q = query(businessesCollection, where('categories', 'array-contains', category));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => convertFirestoreData(doc.data(), doc.id));
}; 