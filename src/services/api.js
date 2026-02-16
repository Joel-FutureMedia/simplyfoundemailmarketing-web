import axios from 'axios'

//const API_BASE_URL = 'http://localhost:8585/api'
const API_BASE_URL = 'https://emailmarketin.simplyfound.com.na/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Subscribers API
export const subscribeEmail = (email) => {
  const formData = new FormData()
  formData.append('email', email)
  return api.post('/subscribers/subscribe', formData)
}

export const unsubscribeEmail = (email) => {
  return api.get('/subscribers/unsubscribe', {
    params: { email }
  })
}

export const getAllSubscribers = () => {
  return api.get('/subscribers/all')
}

export const getSubscriberCounts = () => {
  return api.get('/subscribers/count')
}

export const deleteSubscriber = (id) => {
  return api.delete(`/subscribers/${id}`)
}

// Newsletters API
export const createNewsletter = (formData) => {
  return api.post('/newsletters/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const sendNewsletter = (id) => {
  return api.post(`/newsletters/send/${id}`)
}

export const updateNewsletter = (id, formData) => {
  return api.put(`/newsletters/update/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const deleteNewsletter = (id) => {
  return api.delete(`/newsletters/delete/${id}`)
}

export const getAllNewsletters = () => {
  return api.get('/newsletters/all')
}

// Analytics API
export const getNewsletterAnalytics = (newsletterId) => {
  return api.get(`/analytics/${newsletterId}`)
}

export const getDashboardAnalytics = () => {
  return api.get('/analytics/dashboard')
}

// Auth API
export const login = (email, password) => {
  return api.post('/auth/login', { email, password })
}

export const register = (email, password) => {
  return api.post('/auth/register', { email, password })
}

// Scheduling API
export const scheduleEmail = (newsletterId, scheduledAt) => {
  return api.post('/scheduling/schedule', null, {
    params: { newsletterId, scheduledAt }
  })
}

export const getAllScheduledEmails = () => {
  return api.get('/scheduling/all')
}

export const getScheduledEmailsByNewsletter = (newsletterId) => {
  return api.get(`/scheduling/newsletter/${newsletterId}`)
}

export const cancelScheduledEmail = (id) => {
  return api.delete(`/scheduling/cancel/${id}`)
}

export default api

