'use client'

import { Member, Transaction, RegistrationStatus } from './types'

const MEMBERS_KEY = 'naosa_members'
const TRANSACTIONS_KEY = 'naosa_transactions'

function generateSystemReference(): string {
  const prefix = 'NAOSA'
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${year}-${random}`
}

export function getMembers(): Member[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(MEMBERS_KEY)
  return data ? JSON.parse(data) : []
}

export function getApprovedMembers(): Member[] {
  return getMembers().filter(m => m.status === 'approved')
}

export function getPendingMembers(): Member[] {
  return getMembers().filter(m => m.status === 'pending')
}

export function getMembersByStatus(status: RegistrationStatus): Member[] {
  return getMembers().filter(m => m.status === status)
}

export function addMember(memberData: Omit<Member, 'id' | 'systemReference' | 'status' | 'createdAt'>): Member {
  const members = getMembers()
  const newMember: Member = {
    ...memberData,
    id: crypto.randomUUID(),
    systemReference: generateSystemReference(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  members.push(newMember)
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
  
  // Also add to transactions
  addTransaction({
    memberId: newMember.id,
    memberName: `${newMember.firstName} ${newMember.middleName} ${newMember.surname}`.trim(),
    phone: newMember.phone,
    amount: newMember.registrationAmount,
    transactionReference: newMember.transactionReference,
    systemReference: newMember.systemReference,
  })
  
  return newMember
}

export function updateMemberStatus(id: string, status: RegistrationStatus): void {
  const members = getMembers()
  const index = members.findIndex(m => m.id === id)
  if (index !== -1) {
    members[index].status = status
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
  }
}

export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(TRANSACTIONS_KEY)
  return data ? JSON.parse(data) : []
}

export function addTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
  const transactions = getTransactions()
  const newTransaction: Transaction = {
    ...transactionData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  transactions.push(newTransaction)
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
  return newTransaction
}

// Admin authentication (simple for demo)
const ADMIN_KEY = 'naosa_admin_auth'

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(ADMIN_KEY) === 'true'
}

export function adminLogin(password: string): boolean {
  // Simple password check for demo - in production, use proper auth
  if (password === 'naosa2024') {
    localStorage.setItem(ADMIN_KEY, 'true')
    return true
  }
  return false
}

export function adminLogout(): void {
  localStorage.removeItem(ADMIN_KEY)
}
