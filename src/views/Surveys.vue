<template>
  <BaseLayout>
    <nav class="breadcrumb" aria-label="breadcrumb">
      <div class="container">
        <router-link to="/" class="breadcrumb-item">
          <i class="fas fa-home"></i> {{ t('Главная', 'Home') }}
        </router-link>
        <span class="breadcrumb-item active">
          <i class="fas fa-poll"></i> {{ t('Опросы', 'Surveys') }}
        </span>
      </div>
    </nav>

    <section class="section">
      <div class="container">
        <div class="page-header">
          <h1><i class="fas fa-poll"></i> {{ t('Доступные опросы', 'Available Surveys') }}</h1>
          <p>{{ t('Пройдите опрос и поделитесь своим мнением', 'Take a survey and share your opinion') }}</p>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('Загрузка опросов...', 'Loading surveys...') }}</p>
        </div>

        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ error }}</p>
        </div>

        <div v-else-if="surveys.length === 0" class="empty-state">
          <i class="fas fa-inbox"></i>
          <h3>{{ t('Нет доступных опросов', 'No available surveys') }}</h3>
          <p>{{ t('На данный момент нет активных опросов', 'There are no active surveys at the moment') }}</p>
        </div>

        <div v-else class="surveys-grid">
          <div 
            v-for="survey in surveys" 
            :key="survey._id"
            class="survey-card"
          >
            <div class="survey-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            
            <div class="survey-content">
              <h3>{{ survey.title }}</h3>
              <p v-if="survey.description">{{ truncateText(survey.description, 120) }}</p>
              
              <div class="survey-meta">
                <span v-if="survey.stats?.totalResponses !== undefined">
                  <i class="fas fa-users"></i> {{ survey.stats.totalResponses }} {{ t('ответов', 'responses') }}
                </span>
                <span>
                  <i class="fas fa-calendar"></i> {{ formatDate(survey.createdAt) }}
                </span>
                <span v-if="survey.access.type === 'closed'">
                  <i class="fas fa-lock"></i> {{ t('Для зарегистрированных', 'For registered users') }}
                </span>
              </div>
            </div>

            <div class="survey-actions">
              <router-link 
                :to="`/surveys/${survey._id}`" 
                class="btn btn-primary"
              >
                <i class="fas fa-arrow-right"></i> {{ t('Пройти опрос', 'Take Survey') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLanguageStore } from '@/stores/language'
import BaseLayout from '@/components/BaseLayout.vue'
import axios from 'axios'

const languageStore = useLanguageStore()
const t = computed(() => languageStore.t)

const loading = ref(true)
const error = ref(null)
const surveys = ref([])

const fetchSurveys = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await axios.get('/graduate/api/surveys/public/surveys')
    
    if (response.data.success) {
      surveys.value = response.data.surveys
    }
  } catch (err) {
    console.error('Error fetching surveys:', err)
    error.value = t.value('Не удалось загрузить опросы', 'Failed to load surveys')
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(languageStore.currentLanguage === 'ru' ? 'ru-RU' : 'en-US')
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

onMounted(() => {
  fetchSurveys()
})
</script>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 50px;
}

.page-header h1 {
  font-size: 36px;
  color: var(--primary-color);
  margin-bottom: 15px;
}

.page-header p {
  font-size: 18px;
  color: #666;
}

.surveys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

.survey-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 30px;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  border-top: 4px solid var(--accent-color);
  overflow: hidden;
  box-sizing: border-box;
}

.survey-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.survey-icon {
  text-align: center;
  margin-bottom: 20px;
}

.survey-icon i {
  font-size: 48px;
  color: var(--accent-color);
}

.survey-content {
  flex: 1;
  margin-bottom: 20px;
}

.survey-content h3 {
  color: var(--primary-color);
  margin-bottom: 12px;
  font-size: 20px;
}

.survey-content p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.survey-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #888;
}

.survey-meta span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.survey-meta i {
  color: var(--accent-color);
  width: 16px;
}

.survey-actions {
  text-align: center;
  margin-top: auto;
  width: 100%;
}

.survey-actions .btn {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.loading-state .spinner {
  width: 60px;
  height: 60px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state i,
.empty-state i {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.3;
}

.error-state i {
  color: #dc3545;
}

.empty-state i {
  color: #999;
}

.empty-state h3 {
  color: var(--primary-color);
  margin-bottom: 15px;
}

.empty-state p {
  color: #666;
  font-size: 16px;
}

@media (max-width: 768px) {
  .surveys-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 28px;
  }
}
</style>

