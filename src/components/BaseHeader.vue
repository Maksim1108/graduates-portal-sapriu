<template>
  <header>
    <div id="headerContent">
      <div id="headerLeftPart">
        <router-link to="/" class="header-logo-name">
          <img id="uniIcon" src="/images/techSymb.png" alt="University Logo">
          <img id="saprIcon" src="/images/saprSymbFooter.png" alt="SAPR Logo">
        </router-link>
      </div>
      
      <div id="headerCenterPart">
        <nav>
          <router-link to="/">
            <i class="fas fa-home"></i> 
            {{ currentLanguage === 'ru' ? 'Главная' : 'Home' }}
          </router-link>
          <router-link to="/news">
            <i class="fas fa-newspaper"></i> 
            {{ currentLanguage === 'ru' ? 'Новости' : 'News' }}
          </router-link>
          <router-link to="/gallery">
            <i class="fas fa-images"></i> 
            {{ currentLanguage === 'ru' ? 'Галерея' : 'Gallery' }}
          </router-link>
          <router-link to="/partners">
            <i class="fas fa-handshake"></i> 
            {{ currentLanguage === 'ru' ? 'Партнёры' : 'Partners' }}
          </router-link>
          <router-link to="/search">
            <i class="fas fa-search"></i> 
            {{ currentLanguage === 'ru' ? 'Поиск' : 'Search' }}
          </router-link>
        </nav>
      </div>
      
      <div id="headerRightPart">
        <div class="language-switcher">
          <button 
            @click="changeLanguage('ru')" 
            :class="{ active: currentLanguage === 'ru' }"
            class="lang-btn"
          >
            RU
          </button>
          <button 
            @click="changeLanguage('en')" 
            :class="{ active: currentLanguage === 'en' }"
            class="lang-btn"
          >
            EN
          </button>
        </div>
        
        <div class="auth-links">
          <template v-if="!isAuthenticated">
            <router-link to="/auth" class="btn btn-outline-primary btn-sm">
              <i class="fas fa-sign-in-alt"></i> 
              {{ currentLanguage === 'ru' ? 'Войти' : 'Login' }}
            </router-link>
          </template>
          <template v-else>
            <router-link 
              v-if="userRole === 'admin'" 
              to="/admin" 
              class="btn btn-outline-primary btn-sm"
            >
              <i class="fas fa-cog"></i> 
              {{ currentLanguage === 'ru' ? 'Админ' : 'Admin' }}
            </router-link>
            <router-link to="/account" class="btn btn-outline-primary btn-sm">
              <i class="fas fa-user"></i> 
              {{ currentLanguage === 'ru' ? 'Профиль' : 'Profile' }}
            </router-link>
            <button @click="logout" class="btn btn-danger btn-sm">
              <i class="fas fa-sign-out-alt"></i> 
              {{ currentLanguage === 'ru' ? 'Выйти' : 'Logout' }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const authStore = useAuthStore()
const languageStore = useLanguageStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userRole = computed(() => authStore.userRole)
const currentLanguage = computed(() => languageStore.currentLanguage)

const changeLanguage = (lang) => {
  languageStore.setLanguage(lang)
}

const logout = async () => {
  await authStore.logout()
}
</script>

<style scoped>
#headerRightPart {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 20px;
}

.language-switcher {
  display: flex;
  gap: 5px;
}

.lang-btn {
  padding: 6px 12px;
  border: 1px solid var(--accent-color);
  background: transparent;
  color: var(--accent-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: var(--transition);
}

.lang-btn.active,
.lang-btn:hover {
  background: var(--accent-color);
  color: var(--white);
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 768px) {
  #headerContent {
    flex-direction: column;
    gap: 15px;
  }
  
  #headerRightPart {
    flex-direction: column;
    gap: 10px;
  }
  
  .auth-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style> 