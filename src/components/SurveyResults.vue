<template>
  <div class="survey-results">
    <div class="results-header">
      <div>
        <h2>{{ survey?.title }}</h2>
        <p v-if="survey?.description">{{ survey.description }}</p>
      </div>
      <div class="header-actions">
        <button @click="$emit('back')" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i> {{ t('Назад', 'Back') }}
        </button>
        <button @click="exportToPDF" class="btn btn-success">
          <i class="fas fa-file-pdf"></i> {{ t('Экспорт PDF', 'Export PDF') }}
        </button>
        <button @click="showExportModal = true" class="btn btn-success">
          <i class="fas fa-chart-bar"></i> {{ t('PDF с гистограммами', 'PDF with Charts') }}
        </button>
        <button @click="exportToWord" class="btn btn-success">
          <i class="fas fa-file-word"></i> {{ t('Экспорт Word', 'Export Word') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ t('Загрузка результатов...', 'Loading results...') }}</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
    </div>

    <div v-else class="results-content">
      <!-- Общая статистика -->
      <div class="stats-section card">
        <h3><i class="fas fa-chart-bar"></i> {{ t('Общая статистика', 'Overall Statistics') }}</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
              <h4>{{ stats.survey?.totalResponses || 0 }}</h4>
              <p>{{ t('Всего ответов', 'Total Responses') }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-calendar"></i>
            </div>
            <div class="stat-info">
              <h4>{{ formatDate(stats.survey?.lastResponseAt) }}</h4>
              <p>{{ t('Последний ответ', 'Last Response') }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-info">
              <h4>{{ averageCompletionTime }}</h4>
              <p>{{ t('Среднее время прохождения', 'Average Completion Time') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Статистика по вопросам -->
      <div v-if="questionStats.length > 0" class="questions-stats card">
        <h3><i class="fas fa-poll"></i> {{ t('Статистика по вопросам', 'Question Statistics') }}</h3>
        
        <div class="question-stats-list">
          <div 
            v-for="(qStat, index) in questionStats" 
            :key="qStat.questionId"
            class="question-stat-item"
          >
            <div class="question-stat-header">
              <span class="question-number">{{ index + 1 }}.</span>
              <span class="question-text">{{ qStat.questionText }}</span>
              <span class="question-type-badge">{{ getQuestionTypeLabel(qStat.type) }}</span>
            </div>

            <!-- Средний балл для числовых вопросов -->
            <div v-if="['rating', 'scale', 'number'].includes(qStat.type)" class="numeric-stats">
              <div class="numeric-stat">
                <span class="stat-label">{{ t('Средний балл', 'Average Score') }}:</span>
                <span class="stat-value highlight">{{ qStat.average }}</span>
              </div>
              <div class="numeric-stat">
                <span class="stat-label">{{ t('Минимум', 'Min') }}:</span>
                <span class="stat-value">{{ qStat.min }}</span>
              </div>
              <div class="numeric-stat">
                <span class="stat-label">{{ t('Максимум', 'Max') }}:</span>
                <span class="stat-value">{{ qStat.max }}</span>
              </div>
              <div class="numeric-stat">
                <span class="stat-label">{{ t('Ответов', 'Responses') }}:</span>
                <span class="stat-value">{{ qStat.count }}</span>
              </div>
            </div>

            <!-- Процентное распределение для вопросов с вариантами -->
            <div v-else-if="['radio', 'checkbox', 'dropdown'].includes(qStat.type)" class="distribution-stats">
              <div class="distribution-header">
                <span>{{ t('Процентное распределение ответов', 'Response Distribution') }}:</span>
                <span class="total-responses">{{ qStat.totalResponses }} {{ t('ответов', 'responses') }}</span>
              </div>
              <div class="distribution-bars">
                <div 
                  v-for="option in qStat.distribution" 
                  :key="option.value"
                  class="distribution-item"
                >
                  <div class="distribution-label">
                    <span class="option-text">{{ option.value }}</span>
                    <span class="option-stats">{{ option.count }} ({{ option.percentage }}%)</span>
                  </div>
                  <div class="distribution-bar">
                    <div 
                      class="distribution-fill" 
                      :style="{ width: option.percentage + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Для текстовых вопросов -->
            <div v-else class="text-stats">
              <span class="stat-label">{{ t('Количество ответов', 'Response Count') }}:</span>
              <span class="stat-value">{{ qStat.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Детальные ответы -->
      <div class="detailed-responses card">
        <h3><i class="fas fa-list"></i> {{ t('Детальные ответы', 'Detailed Responses') }}</h3>
        
        <div class="table-container">
          <table class="responses-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{{ t('Дата', 'Date') }}</th>
                <th v-if="survey?.settings?.collectEmail">Email</th>
                <th>{{ t('Время заполнения', 'Completion Time') }}</th>
                <th>{{ t('Действия', 'Actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(response, index) in paginatedResponses" :key="response.id">
                <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                <td>{{ formatDateTime(response.submittedAt) }}</td>
                <td v-if="survey?.settings?.collectEmail">{{ response.email || '-' }}</td>
                <td>{{ formatCompletionTime(response.completionTime) }}</td>
                <td>
                  <button @click="viewResponse(response)" class="btn btn-sm btn-info">
                    <i class="fas fa-eye"></i> {{ t('Просмотр', 'View') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Пагинация -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="btn btn-sm btn-secondary"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="btn btn-sm btn-secondary"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно экспорта PDF с гистограммами -->
    <div v-if="showExportModal" class="modal-overlay" @click="showExportModal = false">
      <div class="modal-content export-modal" @click.stop>
        <button @click="showExportModal = false" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
        
        <h3><i class="fas fa-chart-bar"></i> {{ t('Экспорт PDF с гистограммами', 'Export PDF with Charts') }}</h3>
        
        <p class="export-description">
          {{ t('Выберите интервал лет для формирования отчёта с гистограммами распределения статистических показателей', 'Select year range for generating report with statistical distribution charts') }}
        </p>
        
        <div class="year-range-form">
          <div class="year-input-group">
            <label>{{ t('С года', 'From year') }}:</label>
            <input 
              type="number" 
              v-model.number="yearStart" 
              :min="2020" 
              :max="currentYear"
              class="year-input-field"
            />
          </div>
          <div class="year-input-group">
            <label>{{ t('По год', 'To year') }}:</label>
            <input 
              type="number" 
              v-model.number="yearEnd" 
              :min="yearStart" 
              :max="currentYear"
              class="year-input-field"
            />
          </div>
        </div>
        
        <div class="export-actions">
          <button @click="showExportModal = false" class="btn btn-secondary">
            {{ t('Отмена', 'Cancel') }}
          </button>
          <button @click="exportToPDFWithCharts" class="btn btn-success" :disabled="exporting">
            <i class="fas" :class="exporting ? 'fa-spinner fa-spin' : 'fa-download'"></i>
            {{ exporting ? t('Формирование...', 'Generating...') : t('Скачать PDF', 'Download PDF') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно детального просмотра ответа -->
    <div v-if="selectedResponse" class="modal-overlay" @click="closeResponseModal">
      <div class="modal-content" @click.stop>
        <button @click="closeResponseModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
        
        <h3>{{ t('Детальный ответ', 'Detailed Response') }} #{{ selectedResponseIndex }}</h3>
        
        <div class="response-details">
          <div class="detail-row">
            <span class="detail-label">{{ t('Дата отправки', 'Submitted') }}:</span>
            <span class="detail-value">{{ formatDateTime(selectedResponse.submittedAt) }}</span>
          </div>
          <div v-if="selectedResponse.email" class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">{{ selectedResponse.email }}</span>
          </div>
          <div v-if="selectedResponse.completionTime" class="detail-row">
            <span class="detail-label">{{ t('Время заполнения', 'Completion Time') }}:</span>
            <span class="detail-value">{{ formatCompletionTime(selectedResponse.completionTime) }}</span>
          </div>
        </div>

        <div class="answers-list">
          <div 
            v-for="answer in selectedResponse.answers"
            :key="answer.questionId"
            class="answer-item"
          >
            <div class="answer-question">
              {{ getQuestionText(answer.questionId) }}
            </div>
            <div class="answer-value">
              {{ formatAnswer(answer) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useLanguageStore } from '@/stores/language'
import axios from 'axios'

const props = defineProps({
  surveyId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['back'])

const languageStore = useLanguageStore()
const t = computed(() => languageStore.t)

const loading = ref(true)
const error = ref(null)
const survey = ref(null)
const stats = ref({})
const responses = ref([])

const currentPage = ref(1)
const pageSize = ref(10)
const selectedResponse = ref(null)
const selectedResponseIndex = ref(0)

// Параметры для экспорта PDF с гистограммами
const currentYear = new Date().getFullYear()
const yearStart = ref(currentYear - 1)
const yearEnd = ref(currentYear)
const showExportModal = ref(false)
const exporting = ref(false)

// Блокировка скролла при открытии модальных окон
const lockScroll = (lock) => {
  document.body.style.overflow = lock ? 'hidden' : ''
}

watch(showExportModal, (val) => lockScroll(val))
watch(selectedResponse, (val) => lockScroll(!!val))

onUnmounted(() => {
  lockScroll(false)
})

const totalPages = computed(() => {
  return Math.ceil(responses.value.length / pageSize.value)
})

const paginatedResponses = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return responses.value.slice(start, end)
})

// Среднее время прохождения
const averageCompletionTime = computed(() => {
  if (responses.value.length === 0) return '-'
  
  const validTimes = responses.value
    .map(r => r.completionTime)
    .filter(t => t && t > 0)
  
  if (validTimes.length === 0) return '-'
  
  const avgSeconds = Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length)
  const minutes = Math.floor(avgSeconds / 60)
  const secs = avgSeconds % 60
  return `${minutes} ${t.value('мин', 'min')} ${secs} ${t.value('сек', 'sec')}`
})

// Статистика по каждому вопросу
const questionStats = computed(() => {
  if (!survey.value?.questions || responses.value.length === 0) return []
  
  return survey.value.questions.map(question => {
    const questionAnswers = responses.value
      .map(r => r.answers?.find(a => a.questionId === question.id))
      .filter(a => a && a.answer !== null && a.answer !== undefined && a.answer !== '')
    
    const stat = {
      questionId: question.id,
      questionText: question.question,
      type: question.type,
      count: questionAnswers.length
    }
    
    // Для числовых вопросов (rating, scale, number)
    if (['rating', 'scale', 'number'].includes(question.type)) {
      const numericValues = questionAnswers
        .map(a => parseFloat(a.answer))
        .filter(v => !isNaN(v))
      
      if (numericValues.length > 0) {
        const sum = numericValues.reduce((a, b) => a + b, 0)
        stat.average = (sum / numericValues.length).toFixed(2)
        stat.min = Math.min(...numericValues)
        stat.max = Math.max(...numericValues)
        stat.count = numericValues.length
      } else {
        stat.average = '-'
        stat.min = '-'
        stat.max = '-'
      }
    }
    
    // Для вопросов с вариантами (radio, checkbox, dropdown)
    if (['radio', 'checkbox', 'dropdown'].includes(question.type)) {
      const optionCounts = {}
      let totalAnswers = 0
      
      // Инициализируем все опции нулями
      if (question.options) {
        question.options.forEach(opt => {
          optionCounts[opt] = 0
        })
      }
      
      // Подсчитываем ответы
      questionAnswers.forEach(a => {
        if (Array.isArray(a.answer)) {
          // checkbox - множественный выбор
          a.answer.forEach(val => {
            optionCounts[val] = (optionCounts[val] || 0) + 1
            totalAnswers++
          })
        } else {
          // radio, dropdown - одиночный выбор
          optionCounts[a.answer] = (optionCounts[a.answer] || 0) + 1
          totalAnswers++
        }
      })
      
      stat.totalResponses = questionAnswers.length
      stat.distribution = Object.entries(optionCounts).map(([value, count]) => ({
        value,
        count,
        percentage: totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0
      })).sort((a, b) => b.count - a.count)
    }
    
    return stat
  })
})

const getQuestionTypeLabel = (type) => {
  const labels = {
    'text': t.value('Текст', 'Text'),
    'textarea': t.value('Длинный текст', 'Long Text'),
    'radio': t.value('Один вариант', 'Single Choice'),
    'checkbox': t.value('Несколько вариантов', 'Multiple Choice'),
    'dropdown': t.value('Выпадающий список', 'Dropdown'),
    'number': t.value('Число', 'Number'),
    'date': t.value('Дата', 'Date'),
    'email': 'Email',
    'phone': t.value('Телефон', 'Phone'),
    'rating': t.value('Рейтинг', 'Rating'),
    'scale': t.value('Шкала', 'Scale'),
    'file': t.value('Файл', 'File')
  }
  return labels[type] || type
}

const fetchResults = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await axios.get(`/graduate/api/surveys/admin/surveys/${props.surveyId}/stats`)
    
    if (response.data.success) {
      survey.value = response.data.survey
      stats.value = response.data
      responses.value = response.data.responses || []
    }
  } catch (err) {
    console.error('Error fetching results:', err)
    error.value = t.value('Не удалось загрузить результаты', 'Failed to load results')
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(languageStore.currentLanguage === 'ru' ? 'ru-RU' : 'en-US')
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString(languageStore.currentLanguage === 'ru' ? 'ru-RU' : 'en-US')
}

const formatCompletionTime = (seconds) => {
  if (!seconds) return '-'
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes} ${t.value('мин', 'min')} ${secs} ${t.value('сек', 'sec')}`
}

const viewResponse = (response) => {
  selectedResponse.value = response
  selectedResponseIndex.value = responses.value.findIndex(r => r.id === response.id) + 1
}

const closeResponseModal = () => {
  selectedResponse.value = null
}

const getQuestionText = (questionId) => {
  const question = survey.value?.questions?.find(q => q.id === questionId)
  return question ? question.question : questionId
}

const formatAnswer = (answer) => {
  if (Array.isArray(answer.answer)) {
    return answer.answer.join(', ')
  }
  return String(answer.answer)
}

const exportToPDF = async () => {
  try {
    const response = await axios.get(`/graduate/api/surveys/admin/surveys/${props.surveyId}/export/pdf`, {
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `survey-report-${props.surveyId}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    console.error('Error exporting to PDF:', err)
    alert(t.value('Ошибка экспорта в PDF', 'Error exporting to PDF'))
  }
}

const exportToWord = async () => {
  try {
    const response = await axios.get(`/graduate/api/surveys/admin/surveys/${props.surveyId}/export/word`, {
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `survey-report-${props.surveyId}.docx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    console.error('Error exporting to Word:', err)
    alert(t.value('Ошибка экспорта в Word', 'Error exporting to Word'))
  }
}

// Экспорт PDF с гистограммами
const exportToPDFWithCharts = async () => {
  try {
    exporting.value = true
    const response = await axios.get(
      `/graduate/api/surveys/admin/surveys/${props.surveyId}/export/pdf-charts?startYear=${yearStart.value}&endYear=${yearEnd.value}`, 
      { responseType: 'blob' }
    )
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `survey-report-charts-${yearStart.value}-${yearEnd.value}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    showExportModal.value = false
  } catch (err) {
    console.error('Error exporting to PDF with charts:', err)
    alert(t.value('Ошибка экспорта PDF с гистограммами', 'Error exporting PDF with charts'))
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  fetchResults()
})
</script>

<style scoped>
.survey-results {
  max-width: 1200px;
  margin: 0 auto;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.results-header h2 {
  color: var(--primary-color);
  margin-bottom: 10px;
}

.results-header p {
  color: #666;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.results-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.card h3 {
  color: var(--primary-color);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-section {
  background: linear-gradient(135deg, var(--accent-color) 0%, #2980b9 100%);
  color: white;
}

.stats-section h3 {
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  padding: 20px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 32px;
  opacity: 0.9;
}

.stat-info h4 {
  color: white;
  margin: 0 0 5px 0;
  font-size: 24px;
}

.stat-info p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.table-container {
  overflow-x: auto;
}

.responses-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.responses-table th,
.responses-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.responses-table th {
  background: var(--light-bg);
  font-weight: 600;
  color: var(--primary-color);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.page-info {
  font-weight: 600;
  color: var(--text-color);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow: hidden;
  box-sizing: border-box;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  padding: 30px;
  max-width: 800px;
  width: calc(100% - 40px);
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  box-sizing: border-box;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
}

.modal-content h3 {
  color: var(--primary-color);
  margin-bottom: 20px;
}

.response-details {
  background: var(--light-bg);
  padding: 20px;
  border-radius: var(--border-radius);
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #666;
}

.detail-value {
  color: var(--text-color);
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.answer-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: var(--border-radius);
  border-left: 4px solid var(--accent-color);
}

.answer-question {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
}

.answer-value {
  color: #666;
  line-height: 1.6;
}

.loading-state,
.error-state {
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

.error-state i {
  font-size: 80px;
  color: #dc3545;
  margin-bottom: 20px;
}

/* Question Statistics Styles */
.questions-stats {
  margin-top: 20px;
}

.question-stats-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.question-stat-item {
  background: #f8f9fa;
  border-radius: var(--border-radius);
  padding: 20px;
  border-left: 4px solid var(--accent-color);
}

.question-stat-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.question-number {
  font-weight: 700;
  color: var(--accent-color);
  font-size: 18px;
}

.question-text {
  flex: 1;
  font-weight: 600;
  color: var(--text-color);
  font-size: 16px;
  min-width: 200px;
}

.question-type-badge {
  background: var(--accent-color);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* Numeric Stats */
.numeric-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  background: white;
  padding: 15px;
  border-radius: var(--border-radius);
}

.numeric-stat {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
}

.stat-value.highlight {
  color: var(--accent-color);
  font-size: 28px;
}

/* Distribution Stats */
.distribution-stats {
  background: white;
  padding: 15px;
  border-radius: var(--border-radius);
}

.distribution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 500;
  color: var(--text-color);
}

.total-responses {
  color: #666;
  font-size: 14px;
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distribution-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.distribution-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.option-text {
  font-weight: 500;
  color: var(--text-color);
}

.option-stats {
  color: #666;
  font-size: 14px;
  font-weight: 600;
}

.distribution-bar {
  height: 24px;
  background: #e9ecef;
  border-radius: 12px;
  overflow: hidden;
}

.distribution-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), #2980b9);
  border-radius: 12px;
  transition: width 0.5s ease;
  min-width: 2px;
}

/* Text Stats */
.text-stats {
  background: white;
  padding: 15px;
  border-radius: var(--border-radius);
  display: flex;
  gap: 10px;
  align-items: center;
}

.text-stats .stat-value {
  font-size: 18px;
}

/* Button primary style for PDF with charts export */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Export Modal Styles */
.export-modal {
  max-width: 500px;
  overflow-x: hidden;
}

.export-modal * {
  box-sizing: border-box;
}

.export-modal h3 {
  display: flex;
  align-items: center;
  gap: 10px;
}

.export-modal h3 i {
  color: var(--accent-color);
}

.export-description {
  color: #666;
  margin-bottom: 25px;
  line-height: 1.6;
}

.year-range-form {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  width: 100%;
  min-width: 0;
}

.year-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.year-input-group label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 14px;
}

.year-input-field {
  padding: 12px 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  width: 100%;
  max-width: 100%;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.year-input-field:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
}

.export-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  width: 100%;
  flex-wrap: wrap;
}

.export-actions .btn {
  min-width: 140px;
  justify-content: center;
}

@media (max-width: 768px) {
  .results-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    flex: 1;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .question-stat-header {
    flex-direction: column;
  }

  .numeric-stats {
    flex-direction: column;
    gap: 15px;
  }

  .stat-value.highlight {
    font-size: 24px;
  }

  .modal-overlay {
    padding: 10px;
  }

  .modal-content {
    padding: 20px;
    width: calc(100% - 20px);
  }

  .export-modal {
    max-width: 100%;
  }

  .year-range-form {
    flex-direction: column;
    gap: 15px;
  }

  .export-actions {
    flex-direction: column;
  }

  .export-actions .btn {
    width: 100%;
  }
}
</style>

