import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    userRole: null,
    loading: false,
    error: null
  }),

  getters: {
    isAdmin: (state) => state.userRole === 'admin',
    getUserId: (state) => state.user?.id || localStorage.getItem('user_id')
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.post('/graduate/api/account/login', credentials)
        
        if (response.data.success) {
          this.isAuthenticated = true
          this.userRole = response.data.role
          
          localStorage.setItem('user_id', 'true')
          localStorage.setItem('role', response.data.role)
          
          return { success: true, role: response.data.role }
        } else {
          this.error = response.data.msg
          return { success: false, msg: response.data.msg }
        }
      } catch (error) {
        // Проверяем, является ли ошибка связанной с неподтвержденным email
        const errorMsg = error.response?.data?.msg || 'Login failed'
        this.error = errorMsg
        
        // Если это ошибка подтверждения email, возвращаем специальный флаг
        const isEmailConfirmationError = errorMsg.includes('подтвердите') || 
                                       errorMsg.includes('confirm') ||
                                       errorMsg.includes('подтверждения') ||
                                       errorMsg.includes('confirmation')
        
        return { 
          success: false, 
          msg: errorMsg,
          emailConfirmationRequired: isEmailConfirmationError
        }
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.post('/graduate/api/account/reg', userData)
        
        if (response.data.success) {
          return { success: true, msg: response.data.msg }
        } else {
          this.error = response.data.msg
          return { success: false, msg: response.data.msg }
        }
      } catch (error) {
        this.error = error.response?.data?.msg || 'Registration failed'
        return { success: false, msg: this.error }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await axios.get('/graduate/api/account/logout')
      } catch (error) {
        console.error('Logout error:', error)
      }
      
      this.isAuthenticated = false
      this.user = null
      this.userRole = null
      this.error = null
      
      localStorage.removeItem('user_id')
      localStorage.removeItem('role')
    },

    async resetPassword(email) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.post('/graduate/api/account/reset_pass/send_link', { email })
        return { success: response.data.success, msg: response.data.msg }
      } catch (error) {
        this.error = error.response?.data?.msg || 'Password reset failed'
        return { success: false, msg: this.error }
      } finally {
        this.loading = false
      }
    },

    async checkAuthStatus() {
      const userId = localStorage.getItem('user_id')
      const role = localStorage.getItem('role')
      
      if (userId && role) {
        this.isAuthenticated = true
        this.userRole = role
      }
    },

    clearError() {
      this.error = null
    }
  }
}) 