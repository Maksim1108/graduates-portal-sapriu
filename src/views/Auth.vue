<template>
  <BaseLayout>
    <!-- Breadcrumbs -->
    <nav class="breadcrumb" aria-label="breadcrumb">
      <div class="container">
        <router-link to="/" class="breadcrumb-item">
          <i class="fas fa-home"></i> {{ t('Главная', 'Home') }}
        </router-link>
        <span class="breadcrumb-item active">
          <i class="fas fa-sign-in-alt"></i> {{ t('Авторизация', 'Authentication') }}
        </span>
      </div>
    </nav>

    <section class="section">
      <div class="container">
        <div class="mainContent card">
          <div class="headingText">
            <h2 class="header">
              <i class="fas fa-user-circle"></i> {{ currentHeader }}
            </h2>
          </div>
          
          <div class="auth-form">
            <div class="form-group" v-if="emailVisible">
              <label><b><i class="fas fa-envelope"></i> Email</b></label>
              <input 
                type="email" 
                class="form-control" 
                :placeholder="t('Введите свой', 'Enter your') + ' email'" 
                v-model="inputEmail"  
                @keypress.enter="emailKeyPressHandler"
              />
            </div>
            
            <div class="form-group" v-if="passwordVisible">
              <label><b><i class="fas fa-lock"></i> {{ t('Пароль', 'Password') }}</b></label>
              <input 
                type="password" 
                id="password" 
                class="form-control"
                :placeholder="t('Введите свой пароль', 'Enter your password')" 
                v-model="inputPassword" 
                @keypress.enter="loginKeyPressHandler"
              />
            </div>
            
            <div class="auth-buttons">
              <button 
                class="btn btn-primary LoginButton" 
                v-if="loginButtonVisible" 
                :disabled="loginButtonDisabled" 
                @click="handleLogin"
              >
                <i class="fas fa-sign-in-alt"></i> {{ t('Войти', 'Enter') }}
              </button>

              <button 
                class="btn btn-primary RegButton" 
                v-if="regButtonVisible" 
                :disabled="regButtonDisabled" 
                @click="handleRegister"
              >
                <i class="fas fa-user-plus"></i> {{ t('Зарегистрироваться', 'Register') }}
              </button>

              <button 
                class="btn btn-danger ResetPassButton"  
                v-if="resetButtonVisible" 
                :disabled="resetButtonDisabled" 
                @click="handleResetPassword"
              >
                <i class="fas fa-key"></i> {{ t('Сбросить пароль', 'Reset your password') }}
              </button>
            </div>
    
            <div class="switchButtonsBlock">
              <button 
                class="btn btn-sm btn-outline-primary SwitchToLoginButton" 
                v-if="switchLoginButtonVisible" 
                @click="switchToLogin"
              >
                <i class="fas fa-sign-in-alt"></i> {{ t('Вход', 'Log in') }}
              </button>
              <button 
                class="btn btn-sm btn-outline-primary SwitchToRegButton" 
                v-if="switchRegButtonVisible" 
                @click="switchToReg"
              >
                <i class="fas fa-user-plus"></i> {{ t('Регистрация', 'Registration') }}
              </button>
              <button 
                class="btn btn-sm btn-outline-danger SwitchToResetPassButton" 
                v-if="switchResetButtonVisible" 
                @click="switchToResetPass"
              >
                <i class="fas fa-key"></i> {{ t('Сброс пароля', 'Password reset') }}
              </button>
            </div>
          </div>

          <!-- Modal for messages -->
          <div v-if="showModal" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop :class="{ 'email-confirmation-modal': isEmailConfirmationModal }">
              <div v-if="isEmailConfirmationModal" class="email-confirmation-icon">
                <i class="fas fa-envelope-open-text"></i>
              </div>
              <p>{{ modalMessage }}</p>
              <div v-if="isEmailConfirmationModal" class="email-confirmation-help">
                <p><strong>{{ t('Что делать дальше?', 'What to do next?') }}</strong></p>
                <ul>
                  <li>{{ t('Проверьте папку "Входящие" в вашем email', 'Check your "Inbox" folder') }}</li>
                  <li>{{ t('Если письма нет, проверьте папку "Спам"', 'If no email, check "Spam" folder') }}</li>
                  <li>{{ t('Нажмите на ссылку в письме для подтверждения', 'Click the link in the email to confirm') }}</li>
                  <li>{{ t('После подтверждения попробуйте войти снова', 'After confirmation, try logging in again') }}</li>
                </ul>
              </div>
              <button @click="closeModal" class="btn btn-primary btn-sm">OK</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import BaseLayout from '@/components/BaseLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

const currentLanguage = computed(() => languageStore.currentLanguage)
const t = computed(() => languageStore.t)

const mode = ref('login')
const inputEmail = ref('')
const inputPassword = ref('')

const loginButtonDisabled = ref(false)
const regButtonDisabled = ref(false)
const resetButtonDisabled = ref(false)

const showModal = ref(false)
const modalMessage = ref('')
const isEmailConfirmationModal = ref(false)

const emailVisible = computed(() => true)
const passwordVisible = computed(() => mode.value === 'login' || mode.value === 'register')

const loginButtonVisible = computed(() => mode.value === 'login')
const regButtonVisible = computed(() => mode.value === 'register')
const resetButtonVisible = computed(() => mode.value === 'reset')

const switchLoginButtonVisible = computed(() => mode.value !== 'login')
const switchRegButtonVisible = computed(() => mode.value !== 'register')
const switchResetButtonVisible = computed(() => mode.value !== 'reset')

const currentHeader = computed(() => {
  switch (mode.value) {
    case 'login':
      return t.value('Вход в систему', 'Login')
    case 'register':
      return t.value('Регистрация', 'Registration')
    case 'reset':
      return t.value('Сброс пароля', 'Password Reset')
    default:
      return t.value('Авторизация', 'Authentication')
  }
})

const openModal = (message, isEmailConfirmation = false) => {
  modalMessage.value = message
  isEmailConfirmationModal.value = isEmailConfirmation
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  modalMessage.value = ''
  isEmailConfirmationModal.value = false
}

const switchToLogin = () => {
  mode.value = 'login'
  inputEmail.value = ''
  inputPassword.value = ''
  authStore.clearError()
}

const switchToReg = () => {
  mode.value = 'register'
  inputEmail.value = ''
  inputPassword.value = ''
  authStore.clearError()
}

const switchToResetPass = () => {
  mode.value = 'reset'
  inputEmail.value = ''
  inputPassword.value = ''
  authStore.clearError()
}

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password) => {
  return password && password.length >= 6
}

const handleLogin = async () => {
  if (!inputEmail.value) {
    openModal(t.value('Вы не ввели email', 'E-mail is not entered'))
    return
  }
  
  if (!inputPassword.value) {
    openModal(t.value('Вы не ввели пароль', 'Password is not entered'))
    return
  }
  
  if (!validatePassword(inputPassword.value)) {
    openModal(t.value('Пароль слишком короткий, должно быть более 6 символов', 'The password is too short, must be more than 6 characters'))
    return
  }

  loginButtonDisabled.value = true
  
  try {
    const result = await authStore.login({
      email: inputEmail.value,
      password: inputPassword.value
    })

    if (result.success) {
      if (result.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/account')
      }
    } else {
      // Проверяем, является ли это ошибкой подтверждения email
      if (result.emailConfirmationRequired) {
        openModal(result.msg, true)
      } else {
        openModal(result.msg)
      }
    }
  } catch (error) {
    openModal(t.value('Ошибка при входе в систему', 'Login error'))
  } finally {
    loginButtonDisabled.value = false
  }
}

const handleRegister = async () => {
  if (!inputEmail.value) {
    openModal(t.value('Вы не ввели email', 'E-mail is not entered'))
    return
  }
  
  if (!validateEmail(inputEmail.value)) {
    openModal(t.value('Некорректный email адрес', 'Invalid email address'))
    return
  }
  
  if (!inputPassword.value) {
    openModal(t.value('Вы не ввели пароль', 'Password is not entered'))
    return
  }
  
  if (!validatePassword(inputPassword.value)) {
    openModal(t.value('Пароль слишком короткий, должно быть более 6 символов', 'The password is too short, must be more than 6 characters'))
    return
  }

  regButtonDisabled.value = true
  
  try {
    const result = await authStore.register({
      email: inputEmail.value,
      password: inputPassword.value
    })

    if (result.success) {
      openModal(result.msg || t.value('Регистрация успешна! Проверьте email для подтверждения.', 'Registration successful! Check your email for confirmation.'))
      switchToLogin()
    } else {
      openModal(result.msg)
    }
  } catch (error) {
    openModal(t.value('Ошибка при регистрации', 'Registration error'))
  } finally {
    regButtonDisabled.value = false
  }
}

const handleResetPassword = async () => {
  if (!inputEmail.value) {
    openModal(t.value('Вы не ввели email', 'E-mail is not entered'))
    return
  }
  
  if (!validateEmail(inputEmail.value)) {
    openModal(t.value('Некорректный email адрес', 'Invalid email address'))
    return
  }

  resetButtonDisabled.value = true
  
  try {
    const result = await authStore.resetPassword(inputEmail.value)
    openModal(result.msg || (result.success 
      ? t.value('Ссылка для сброса пароля отправлена на email', 'Password reset link sent to email')
      : t.value('Ошибка при сбросе пароля', 'Error resetting password')
    ))
    
    if (result.success) {
      switchToLogin()
    }
  } catch (error) {
    openModal(t.value('Ошибка при сбросе пароля', 'Error resetting password'))
  } finally {
    resetButtonDisabled.value = false
  }
}

const emailKeyPressHandler = () => {
  if (mode.value === 'login' && passwordVisible.value) {
    document.getElementById('password')?.focus()
  } else if (mode.value === 'register' && passwordVisible.value) {
    document.getElementById('password')?.focus()
  } else {
    if (mode.value === 'reset') {
      handleResetPassword()
    }
  }
}

const loginKeyPressHandler = () => {
  if (mode.value === 'login') {
    handleLogin()
  } else if (mode.value === 'register') {
    handleRegister()
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    if (authStore.userRole === 'admin') {
      router.push('/admin')
    } else {
      router.push('/account')
    }
  }
})
</script>

<style scoped>
.headingText {
  text-align: center;
  margin-bottom: 30px;
}

.header {
  color: var(--primary-color);
  font-size: 28px;
  margin: 0;
}

.auth-form {
  max-width: 400px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-color);
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: var(--border-radius);
  font-size: 16px;
  transition: var(--transition);
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 30px 0;
}

.auth-buttons .btn {
  width: 100%;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
}

.switchButtonsBlock {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-content p {
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 1.5;
}

/* Email confirmation modal styles */
.email-confirmation-modal {
  max-width: 500px;
}

.email-confirmation-icon {
  text-align: center;
  margin-bottom: 20px;
}

.email-confirmation-icon i {
  font-size: 48px;
  color: var(--accent-color);
}

.email-confirmation-help {
  background: #f8f9fa;
  padding: 15px;
  border-radius: var(--border-radius);
  margin: 20px 0;
  text-align: left;
}

.email-confirmation-help p {
  margin-bottom: 10px;
  font-size: 14px;
}

.email-confirmation-help ul {
  margin: 0;
  padding-left: 20px;
}

.email-confirmation-help li {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.4;
}

@media (max-width: 480px) {
  .auth-form {
    padding: 0 10px;
  }
  
  .switchButtonsBlock {
    flex-direction: column;
    gap: 8px;
  }
  
  .switchButtonsBlock .btn {
    width: 100%;
  }
}
</style> 