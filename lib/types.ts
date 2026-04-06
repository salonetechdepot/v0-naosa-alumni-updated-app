export type RegistrationStatus = 'pending' | 'approved' | 'rejected'

export interface Member {
  id: string
  firstName: string
  middleName: string
  surname: string
  gender: 'male' | 'female'
  currentAddress: string
  admissionNumber: string
  dateOfEntry: string
  dateOfExit: string
  email: string
  phone: string
  registrationAmount: number
  transactionReference: string
  systemReference: string
  status: RegistrationStatus
  createdAt: string
}

export interface Transaction {
  id: string
  memberId: string
  memberName: string
  phone: string
  amount: number
  transactionReference: string
  systemReference: string
  createdAt: string
}
