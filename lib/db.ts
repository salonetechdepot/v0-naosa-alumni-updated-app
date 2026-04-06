import { neon } from '@neondatabase/serverless'

// Create a SQL client using the Neon serverless driver
export const sql = neon(process.env.DATABASE_URL!)

// Types for database operations
export interface Member {
  id: string
  firstName: string
  middleName: string | null
  surname: string
  gender: 'male' | 'female'
  currentAddress: string
  admissionNumber: string | null
  dateOfEntry: string
  dateOfExit: string
  email: string | null
  phone: string
  registrationAmount: number
  transactionReference: string
  systemReference: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

export type TransactionType = 'registration' | 'donation' | 'contribution'

export interface Transaction {
  id: string
  memberId: string | null
  memberName: string
  phone: string
  amount: number
  transactionReference: string
  systemReference: string
  type: TransactionType
  description: string | null
  createdAt: Date
}

export interface AdminUser {
  id: string
  email: string
  password: string
  name: string
  createdAt: Date
}

// Helper to generate unique system reference
export function generateSystemReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `NAOSA-${timestamp}-${random}`
}
