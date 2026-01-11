<template>
  <BaseLayout>
    <nav class="breadcrumb" aria-label="breadcrumb">
      <div class="container">
        <router-link to="/" class="breadcrumb-item">
          <i class="fas fa-home"></i> {{ t('Главная', 'Home') }}
        </router-link>
        <router-link to="/surveys" class="breadcrumb-item">
          <i class="fas fa-poll"></i> {{ t('Опросы', 'Surveys') }}
        </router-link>
        <span class="breadcrumb-item active">
          {{ survey?.title || t('Загрузка...', 'Loading...') }}
        </span>
      </div>
    </nav>

    <section class="section">
      <div class="container">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('Загрузка опроса...', 'Loading survey...') }}</p>
        </div>

        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          <h3>{{ t('Ошибка', 'Error') }}</h3>
          <p>{{ error }}</p>
          <router-link to="/surveys" class="btn btn-primary">
            {{ t('Вернуться к списку опросов', 'Back to surveys') }}
          </router-link>
        </div>

        <div v-else-if="submitted" class="success-state">
          <i class="fas fa-check-circle"></i>
          <h3>{{ t('Готово!', 'Done!') }}</h3>
          <p>{{ successMessage }}</p>
          <router-link to="/surveys" class="btn btn-primary">
            {{ t('К списку опросов', 'Back to surveys') }}
          </router-link>
        </div>

        <div v-else-if="survey" class="survey-container">
          <div class="survey-header">
            <h1>{{ survey.title }}</h1>
            <p v-if="survey.description" class="survey-description">{{ survey.description }}</p>
            <div class="survey-meta">
              <span v-if="requiredCount > 0" class="required-notice">
                <i class="fas fa-asterisk"></i> {{ t('Обязательные вопросы отмечены', 'Required questions are marked') }}
              </span>
            </div>
          </div>

          <div v-if="survey.settings.showProgressBar" class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            <span class="progress-text">{{ answeredCount }} / {{ survey.questions.length }}</span>
          </div>

          <form @submit.prevent="submitSurvey" class="survey-form">
            <div 
              v-for="(question, index) in survey.questions" 
              :key="question.id"
              class="question-block"
              :class="{ 'has-error': errors[question.id] }"
            >
              <div class="question-header">
                <span class="question-number">{{ index + 1 }}.</span>
                <div class="question-text">
                  <span>{{ question.question }}</span>
                  <span v-if="question.required" class="required-mark">*</span>
                </div>
              </div>
              
              <p v-if="question.description" class="question-description">{{ question.description }}</p>

              <!-- Короткий текст -->
              <input 
                v-if="question.type === 'text'"
                type="text"
                class="form-control"
                v-model="answers[question.id]"
                :placeholder="question.settings.placeholder"
                :required="question.required"
              />

              <!-- Длинный текст -->
              <textarea
                v-else-if="question.type === 'textarea'"
                class="form-control"
                :rows="question.settings.rows || 5"
                v-model="answers[question.id]"
                :placeholder="question.settings.placeholder"
                :required="question.required"
              ></textarea>

              <!-- Email -->
              <input 
                v-else-if="question.type === 'email'"
                type="email"
                class="form-control"
                v-model="answers[question.id]"
                :placeholder="question.settings.placeholder"
                :required="question.required"
              />

              <!-- Телефон -->
              <input 
                v-else-if="question.type === 'phone'"
                type="tel"
                class="form-control"
                v-model="answers[question.id]"
                :placeholder="question.settings.placeholder"
                :required="question.required"
              />

              <!-- Число -->
              <input 
                v-else-if="question.type === 'number'"
                type="number"
                class="form-control"
                v-model.number="answers[question.id]"
                :min="question.settings.minValue"
                :max="question.settings.maxValue"
                :required="question.required"
              />

              <!-- Дата -->
              <input 
                v-else-if="question.type === 'date'"
                type="date"
                class="form-control"
                v-model="answers[question.id]"
                :required="question.required"
              />

              <!-- Радио (один вариант) -->
              <div v-else-if="question.type === 'radio'" class="options-list">
                <label 
                  v-for="option in question.options" 
                  :key="option"
                  class="option-label"
                >
                  <input 
                    type="radio"
                    :name="question.id"
                    :value="option"
                    v-model="answers[question.id]"
                    :required="question.required"
                  />
                  <span>{{ option }}</span>
                </label>
              </div>

              <!-- Чекбокс (несколько вариантов) -->
              <div v-else-if="question.type === 'checkbox'" class="options-list">
                <label 
                  v-for="option in question.options" 
                  :key="option"
                  class="option-label"
                >
                  <input 
                    type="checkbox"
                    :value="option"
                    v-model="answers[question.id]"
                  />
                  <span>{{ option }}</span>
                </label>
              </div>

              <!-- Выпадающий список -->
              <select
                v-else-if="question.type === 'dropdown'"
                class="form-control"
                v-model="answers[question.id]"
                :required="question.required"
              >
                <option value="">{{ t('Выберите вариант', 'Select option') }}</option>
                <option 
                  v-for="option in question.options" 
                  :key="option"
                  :value="option"
                >
                  {{ option }}
                </option>
              </select>

              <!-- Рейтинг (звёзды) -->
              <div v-else-if="question.type === 'rating'" class="rating-input">
                <button
                  v-for="star in (question.settings.maxValue || 5)"
                  :key="star"
                  type="button"
                  class="star-btn"
                  :class="{ active: answers[question.id] >= star }"
                  @click="answers[question.id] = star"
                >
                  <i class="fas fa-star"></i>
                </button>
                <span v-if="answers[question.id]" class="rating-value">
                  {{ answers[question.id] }} / {{ question.settings.maxValue || 5 }}
                </span>
              </div>

              <!-- Шкала -->
              <div v-else-if="question.type === 'scale'" class="scale-input">
                <div class="scale-labels">
                  <span>{{ question.settings.scaleLabels?.min || question.settings.minValue || 1 }}</span>
                  <span>{{ question.settings.scaleLabels?.max || question.settings.maxValue || 10 }}</span>
                </div>
                <input
                  type="range"
                  class="scale-slider"
                  v-model.number="answers[question.id]"
                  :min="question.settings.minValue || 1"
                  :max="question.settings.maxValue || 10"
                  :required="question.required"
                />
                <div class="scale-value">{{ answers[question.id] ?? (question.settings.minValue || 1) }}</div>
              </div>

              <!-- Файл -->
              <input
                v-else-if="question.type === 'file'"
                type="file"
                class="form-control"
                @change="handleFileUpload($event, question.id)"
                :accept="question.settings.allowedFileTypes?.join(',')  || '*'"
                :multiple="question.settings.multipleFiles"
                :required="question.required"
              />

              <div v-if="errors[question.id]" class="error-message">
                {{ errors[question.id] }}
              </div>
            </div>

            <div v-if="survey.settings.collectEmail" class="question-block">
              <div class="question-header">
                <div class="question-text">
                  <span>{{ t('Ваш email', 'Your email') }}</span>
                  <span class="required-mark">*</span>
                </div>
              </div>
              <input
                type="email"
                class="form-control"
                v-model="respondentEmail"
                :placeholder="t('example@email.com', 'example@email.com')"
                required
              />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-lg" :disabled="submitting">
                <i class="fas fa-paper-plane"></i>
                {{ submitting ? t('Отправка...', 'Submitting...') : (survey.settings.submitButtonText || t('Отправить', 'Submit')) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import BaseLayout from '@/components/BaseLayout.vue'
import axios from 'axios'

const route = useRoute()
const languageStore = useLanguageStore()
const t = computed(() => languageStore.t)

const loading = ref(true)
const error = ref(null)
const survey = ref(null)
const answers = ref({})
const errors = ref({})
const respondentEmail = ref('')
const submitting = ref(false)
const submitted = ref(false)
const successMessage = ref('')
const startTime = ref(Date.now())

const requiredCount = computed(() => {
  if (!survey.value) return 0
  return survey.value.questions.filter(q => q.required).length
})

const answeredCount = computed(() => {
  if (!survey.value) return 0
  return survey.value.questions.filter(q => {
    const answer = answers.value[q.id]
    if (Array.isArray(answer)) return answer.length > 0
    if (q.type === 'scale') {
      const initialValue = q.settings?.minValue || 1
      return answer !== undefined && answer !== null && answer !== '' && answer !== initialValue
    }
    return answer !== undefined && answer !== null && answer !== ''
  }).length
})

const progressPercentage = computed(() => {
  if (!survey.value || survey.value.questions.length === 0) return 0
  return Math.round((answeredCount.value / survey.value.questions.length) * 100)
})

const fetchSurvey = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await axios.get(`/graduate/api/surveys/public/surveys/${route.params.id}`)
    
    if (response.data.success) {
      survey.value = response.data.survey
      
      survey.value.questions.forEach(q => {
        if (q.type === 'checkbox') {
          answers.value[q.id] = []
        } else if (q.type === 'scale') {
          answers.value[q.id] = q.settings.minValue || 1
        } else {
          answers.value[q.id] = null
        }
      })
    }
  } catch (err) {
    console.error('Error fetching survey:', err)
    error.value = err.response?.data?.msg || t.value('Не удалось загрузить опрос', 'Failed to load survey')
  } finally {
    loading.value = false
  }
}

const handleFileUpload = (event, questionId) => {
  const files = event.target.files
  if (files && files.length > 0) {
    const fileReaders = Array.from(files).map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result
        })
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    })

    Promise.all(fileReaders).then(filesData => {
      answers.value[questionId] = filesData
    }).catch(err => {
      console.error('Error reading files:', err)
      errors.value[questionId] = t.value('Ошибка чтения файлов', 'Error reading files')
    })
  }
}

const validateAnswers = () => {
  errors.value = {}
  let isValid = true

  survey.value.questions.forEach(question => {
    if (question.required) {
      const answer = answers.value[question.id]
      
      if (!answer || (Array.isArray(answer) && answer.length === 0) || answer === '') {
        errors.value[question.id] = t.value('Этот вопрос обязателен', 'This question is required')
        isValid = false
      }
    }
  })

  if (survey.value.settings.collectEmail && !respondentEmail.value) {
    isValid = false
  }

  return isValid
}

const submitSurvey = async () => {
  if (!validateAnswers()) {
    alert(t.value('Пожалуйста, ответьте на все обязательные вопросы', 'Please answer all required questions'))
    return
  }

  try {
    submitting.value = true
    
    const completionTime = Math.floor((Date.now() - startTime.value) / 1000) // в секундах

    const formattedAnswers = survey.value.questions.map(q => ({
      questionId: q.id,
      questionType: q.type,
      answer: answers.value[q.id]
    }))

    const response = await axios.post(
      `/graduate/api/surveys/public/surveys/${route.params.id}/submit`,
      {
        answers: formattedAnswers,
        completionTime,
        email: respondentEmail.value || null
      }
    )

    if (response.data.success) {
      successMessage.value = response.data.message
      submitted.value = true
    }
  } catch (err) {
    console.error('Error submitting survey:', err)
    alert(err.response?.data?.msg || t.value('Ошибка при отправке ответа', 'Error submitting response'))
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchSurvey()
})
</script>

<style scoped>
.survey-container {
  max-width: 800px;
  margin: 0 auto;
}

.survey-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  border-top: 4px solid var(--accent-color);
}

.survey-header h1 {
  margin: 0 0 15px 0;
  font-size: 32px;
  color: var(--primary-color);
}

.survey-description {
  font-size: 18px;
  margin: 0 0 20px 0;
  color: #666;
}

.survey-meta {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #666;
}

.survey-meta i {
  margin-right: 5px;
}

.progress-bar {
  background: #e9ecef;
  height: 40px;
  border-radius: 20px;
  position: relative;
  margin-bottom: 30px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, var(--accent-color), var(--primary-color));
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 20px;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 600;
  color: var(--text-color);
  z-index: 1;
}

.survey-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.question-block {
  background: white;
  padding: 25px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  border-left: 4px solid var(--accent-color);
}

.question-block.has-error {
  border-left-color: #dc3545;
}

.question-header {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.question-number {
  font-weight: 700;
  color: var(--accent-color);
  font-size: 18px;
}

.question-text {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  gap: 5px;
}

.required-mark {
  color: #dc3545;
  font-size: 20px;
}

.question-description {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 14px;
  font-style: italic;
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

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  border: 2px solid transparent;
}

.option-label:hover {
  background: #e9ecef;
  border-color: var(--accent-color);
}

.option-label input {
  width: auto;
  margin: 0;
  cursor: pointer;
}

.option-label span {
  flex: 1;
  font-size: 16px;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #ddd;
  cursor: pointer;
  transition: var(--transition);
  padding: 5px;
}

.star-btn:hover,
.star-btn.active {
  color: #ffc107;
}

.rating-value {
  margin-left: 10px;
  font-weight: 600;
  color: var(--text-color);
}

.scale-input {
  width: 100%;
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: 600;
  color: var(--text-color);
}

.scale-slider {
  width: 100%;
  height: 8px;
  border-radius: 5px;
  background: #e9ecef;
  outline: none;
  -webkit-appearance: none;
}

.scale-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent-color);
  cursor: pointer;
}

.scale-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent-color);
  cursor: pointer;
  border: none;
}

.scale-value {
  text-align: center;
  margin-top: 10px;
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-color);
}

.error-message {
  margin-top: 10px;
  color: #dc3545;
  font-size: 14px;
  font-weight: 500;
}

.form-actions {
  text-align: center;
  margin-top: 20px;
}

.btn-lg {
  padding: 15px 50px;
  font-size: 18px;
}

.loading-state,
.error-state,
.success-state {
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
.success-state i {
  font-size: 80px;
  margin-bottom: 20px;
}

.error-state i {
  color: #dc3545;
}

.success-state i {
  color: #28a745;
}

.error-state h3,
.success-state h3 {
  color: var(--primary-color);
  margin-bottom: 15px;
}

.error-state p,
.success-state p {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .survey-header h1 {
    font-size: 24px;
  }

  .survey-description {
    font-size: 16px;
  }

  .question-block {
    padding: 20px 15px;
  }

  .rating-input {
    flex-wrap: wrap;
    justify-content: center;
  }

  .star-btn {
    font-size: 28px;
  }
}
</style>

