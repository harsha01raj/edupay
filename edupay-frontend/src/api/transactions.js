import api from './axios'

export const fetchTransactions = (params) => api.get('/transactions', { params })
export const fetchTransactionsBySchool = (schoolId, params) => api.get(`/transactions/school/${encodeURIComponent(schoolId)}`, { params })
export const checkTransactionStatus = (customOrderId) => api.get(`/transaction-status/${encodeURIComponent(customOrderId)}`)
