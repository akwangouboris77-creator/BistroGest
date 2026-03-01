
export enum PaymentMethod {
  CASH = 'Espèces',
  AIRTEL_MONEY = 'Airtel Money',
  MOOV_MONEY = 'Moov Money'
}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILED = 'FAILED'
}

export enum UserRole {
  OWNER = 'Propriétaire',
  MANAGER = 'Gérant',
  WAITER = 'Serveur'
}

export type SubscriptionTier = 'starter' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  role: UserRole;
  assignedStoreId?: string;
  isVerified?: boolean;
}

export interface Store {
  id: string;
  name: string;
  location: string;
  tvaEnabled: boolean;
  subscriptionStatus: 'ACTIVE' | 'EXPIRED' | 'TRIAL';
  subscriptionExpiryDate?: string;
  tier: SubscriptionTier;
  activationCode?: string;
  staffAccessCode?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  threshold: number;
  hasConsigne: boolean;
  category: string;
  image?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  unitCost: number;
}

export interface Sale {
  id: string;
  orderNumber: string;
  storeId: string;
  tableNumber?: string;
  customerName?: string;
  timestamp: string;
  items: SaleItem[];
  subtotal: number;
  tvaAmount: number;
  total: number;
  totalCost: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  managedBy: string;
}

export interface PendingOrder {
  id: string;
  customerName: string;
  tableNumber: string;
  waiterName?: string;
  items: SaleItem[];
  timestamp: string;
  total: number;
  status: 'PENDING' | 'VALIDATED' | 'CANCELLED';
}

export interface StaffPerformance {
  attendance: number;
  salesSkills: number;
  clientSatisfaction: number;
  honesty: number;
  lastEvaluation: string;
  complaints: number;
}

export interface StaffMember {
  id: string;
  name: string;
  username: string; // Nouvel identifiant unique
  accessCode: string; // Code secret à 4-6 chiffres
  role: string;
  performance: StaffPerformance;
  totalSalesGenerated: number;
  isActive: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'SALE' | 'STOCK_UPDATE' | 'CONSIGNE_UPDATE' | 'SYSTEM' | 'BILLING' | 'STAFF_EVAL';
  description: string;
  user: string;
  amount?: number;
}

export interface Settings {
  bistroName: string;
  bistroSlogan?: string;
  bistroPhone?: string;
  nifNumber?: string;
  ownerName: string;
  ownerEmail: string;
  managerName: string;
  location: string;
  theme?: 'light' | 'dark';
  tvaRate: number;
  logoUrl?: string;
  receiptFooterMessage?: string;
  logoFontSize?: number;
  monthlyRent: number;
  monthlyDjSalary: number;
  monthlyManagerSalary: number;
  monthlyElectricity: number;
  monthlyWater: number;
  appSubscription: number;
  monthlyWifi: number;
  monthlyCanal: number;
  installationDate?: number;
  lastBackupDate?: number;
  paymentRemindersEnabled: boolean;
  daysBeforeReminder: number;
  lastReminderDismissed?: number;
}

export interface CrateStock {
  sobragaEmpties: number;
  sobragaFull: number;
}
