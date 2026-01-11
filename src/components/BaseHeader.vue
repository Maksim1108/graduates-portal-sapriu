<template>
  <header>
    <div id="headerContent">
      <div id="headerLeftPart">
        <router-link to="/" class="header-logo-name">
          <img id="uniIcon" src="/images/techSymb.png" alt="University Logo">
          <img id="saprIcon" src="/images/saprSymbFooter.png" alt="SAPR Logo">
        </router-link>
      </div>
      
      <!-- Бургер-кнопка для мобильных -->
      <button 
        v-if="!isMobileMenuOpen"
        class="burger-btn"
        @click="toggleMobileMenu"
        :aria-label="currentLanguage === 'ru' ? 'Меню' : 'Menu'"
      >
        <i class="fas fa-bars"></i>
      </button>
      
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
          <router-link to="/surveys">
            <i class="fas fa-poll"></i> 
            {{ currentLanguage === 'ru' ? 'Опросы' : 'Surveys' }}
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

      <!-- Мобильное меню (выпадающее) -->
      <div 
        v-if="isMobileMenuOpen" 
        class="mobile-menu-overlay"
        @click="closeMobileMenu"
      ></div>
      <div 
        class="mobile-menu"
        :class="{ 'mobile-menu-open': isMobileMenuOpen }"
      >
        <!-- Заголовок мобильного меню -->
        <div class="mobile-menu-header">
          <router-link to="/" class="mobile-menu-logo" @click="closeMobileMenu">
            <img id="uniIcon" src="/images/techSymb.png" alt="University Logo">
            <img id="saprIcon" src="/images/saprSymbFooter.png" alt="SAPR Logo">
          </router-link>
          <button class="mobile-menu-close" @click="closeMobileMenu" aria-label="Закрыть меню">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <nav class="mobile-nav">
          <router-link to="/" @click="closeMobileMenu">
            <i class="fas fa-home"></i> 
            {{ currentLanguage === 'ru' ? 'Главная' : 'Home' }}
          </router-link>
          <router-link to="/news" @click="closeMobileMenu">
            <i class="fas fa-newspaper"></i> 
            {{ currentLanguage === 'ru' ? 'Новости' : 'News' }}
          </router-link>
          <router-link to="/gallery" @click="closeMobileMenu">
            <i class="fas fa-images"></i> 
            {{ currentLanguage === 'ru' ? 'Галерея' : 'Gallery' }}
          </router-link>
          <router-link to="/partners" @click="closeMobileMenu">
            <i class="fas fa-handshake"></i> 
            {{ currentLanguage === 'ru' ? 'Партнёры' : 'Partners' }}
          </router-link>
          <router-link to="/surveys" @click="closeMobileMenu">
            <i class="fas fa-poll"></i> 
            {{ currentLanguage === 'ru' ? 'Опросы' : 'Surveys' }}
          </router-link>
          <router-link to="/search" @click="closeMobileMenu">
            <i class="fas fa-search"></i> 
            {{ currentLanguage === 'ru' ? 'Поиск' : 'Search' }}
          </router-link>
        </nav>

        <div class="mobile-menu-footer">
          <div class="mobile-language-switcher">
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
          
          <div class="mobile-auth-links">
            <template v-if="!isAuthenticated">
              <router-link to="/auth" class="btn btn-outline-primary btn-sm" @click="closeMobileMenu">
                <i class="fas fa-sign-in-alt"></i> 
                {{ currentLanguage === 'ru' ? 'Войти' : 'Login' }}
              </router-link>
            </template>
            <template v-else>
              <router-link 
                v-if="userRole === 'admin'" 
                to="/admin" 
                class="btn btn-outline-primary btn-sm"
                @click="closeMobileMenu"
              >
                <i class="fas fa-cog"></i> 
                {{ currentLanguage === 'ru' ? 'Админ' : 'Admin' }}
              </router-link>
              <router-link to="/account" class="btn btn-outline-primary btn-sm" @click="closeMobileMenu">
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
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const authStore = useAuthStore()
const languageStore = useLanguageStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userRole = computed(() => authStore.userRole)
const currentLanguage = computed(() => languageStore.currentLanguage)

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // Блокируем скролл страницы, когда меню открыто
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  // Разблокируем скролл страницы
  document.body.style.overflow = ''
}

const changeLanguage = (lang) => {
  languageStore.setLanguage(lang)
}

const logout = async () => {
  await authStore.logout()
  closeMobileMenu()
}

// Закрывать меню при изменении размера окна (если перешли на десктоп)
const handleResize = () => {
  if (window.innerWidth > 768) {
    isMobileMenuOpen.value = false
    document.body.style.overflow = ''
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // Убеждаемся, что скролл разблокирован при размонтировании
  document.body.style.overflow = ''
})
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

/* Бургер-кнопка */
.burger-btn {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  color: var(--primary-color);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: var(--transition);
  z-index: 1001;
}

.burger-btn:hover {
  background: var(--light-bg);
  color: var(--accent-color);
}

.burger-btn i {
  transition: var(--transition);
}

/* Мобильное меню */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  display: none;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.mobile-menu.mobile-menu-open {
  transform: translateX(0);
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  flex: 1;
}

.mobile-nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px solid #eee;
  transition: var(--transition);
}

.mobile-nav a:hover {
  background: var(--light-bg);
  color: var(--accent-color);
}

.mobile-nav a i {
  width: 20px;
  text-align: center;
  color: var(--accent-color);
}

/* Заголовок мобильного меню */
.mobile-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 1;
}

.mobile-menu-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 8px;
}

.mobile-menu-logo #uniIcon {
  width: 35px;
  height: 35px;
  object-fit: contain;
}

.mobile-menu-logo #saprIcon {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.mobile-menu-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--accent-color);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.mobile-menu-close:hover {
  background: var(--light-bg);
  color: var(--primary-color);
}

.mobile-menu-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  background: var(--light-bg);
}

.mobile-language-switcher {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  justify-content: center;
}

.mobile-language-switcher .lang-btn {
  flex: 1;
  max-width: 120px;
}

.mobile-auth-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mobile-auth-links .btn {
  width: 100%;
  justify-content: center;
  padding: 10px 16px;
  font-size: 14px;
  max-width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .burger-btn {
    display: block;
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
  }

  #headerContent {
    position: relative;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-right: 60px;
  }

  #headerLeftPart {
    flex: 0 0 auto;
  }

  /* Скрываем обычное меню на мобилке */
  #headerCenterPart {
    display: none !important;
  }

  #headerRightPart {
    display: none !important;
  }

  /* Показываем мобильное меню */
  .mobile-menu-overlay {
    display: block;
  }

  .mobile-menu {
    display: flex;
  }
}

@media (min-width: 769px) {
  .mobile-menu-overlay,
  .mobile-menu {
    display: none !important;
  }
}
</style> 