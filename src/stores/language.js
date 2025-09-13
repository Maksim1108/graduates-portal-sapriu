import { defineStore } from 'pinia'
import axios from 'axios'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage: 'ru'
  }),

  getters: {
    isRussian: (state) => state.currentLanguage === 'ru',
    isEnglish: (state) => state.currentLanguage === 'en',
    
    // Translation helpers
    t: (state) => (ruText, enText) => {
      return state.currentLanguage === 'ru' ? ruText : enText
    }
  },

  actions: {
    setLanguage(lang) {
      if (lang === 'ru' || lang === 'en') {
        this.currentLanguage = lang
        localStorage.setItem('language', lang)
        // Sync with backend session (used by server-rendered templates)
        try {
          axios.post('/graduate/api/set_lang', { lang })
        } catch {}
      }
    },

    initializeLanguage() {
      const savedLang = localStorage.getItem('language')
      if (savedLang && (savedLang === 'ru' || savedLang === 'en')) {
        this.currentLanguage = savedLang
      } else {
        // Detect browser language or default to Russian
        const browserLang = navigator.language.toLowerCase()
        this.currentLanguage = browserLang.includes('en') ? 'en' : 'ru'
        localStorage.setItem('language', this.currentLanguage)
      }
      // Inform backend about current language
      try {
        axios.post('/graduate/api/set_lang', { lang: this.currentLanguage })
      } catch {}
    },

    toggleLanguage() {
      this.setLanguage(this.currentLanguage === 'ru' ? 'en' : 'ru')
    }
  }
}) 