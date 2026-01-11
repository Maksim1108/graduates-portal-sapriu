<template>
  <div class="survey-builder">
    <div class="builder-header">
      <h2 v-if="!editingSurvey">{{ t('Создать опрос', 'Create Survey') }}</h2>
      <h2 v-else>{{ t('Редактировать опрос', 'Edit Survey') }}</h2>
    </div>

    <div class="builder-content">
      <!-- Основные настройки опроса -->
      <div class="card section">
        <h3><i class="fas fa-cog"></i> {{ t('Основные настройки', 'Basic Settings') }}</h3>
        
        <div class="form-group">
          <label>{{ t('Название опроса', 'Survey Title') }} *</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="survey.title" 
            :placeholder="t('Введите название опроса', 'Enter survey title')"
            required
          />
        </div>

        <div class="form-group">
          <label>{{ t('Описание', 'Description') }}</label>
          <textarea 
            class="form-control" 
            rows="3" 
            v-model="survey.description"
            :placeholder="t('Краткое описание опроса (необязательно)', 'Brief description (optional)')"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>{{ t('Тип доступа', 'Access Type') }}</label>
            <select class="form-control" v-model="survey.access.type">
              <option value="open">{{ t('Открытый (для всех)', 'Open (for everyone)') }}</option>
              <option value="closed">{{ t('Закрытый (только зарегистрированные)', 'Closed (registered only)') }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ t('Статус', 'Status') }}</label>
            <select class="form-control" v-model="survey.status">
              <option value="draft">{{ t('Черновик', 'Draft') }}</option>
              <option value="published">{{ t('Опубликован', 'Published') }}</option>
              <option value="closed">{{ t('Закрыт', 'Closed') }}</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="survey.access.allowMultipleResponses" />
              {{ t('Разрешить повторное прохождение', 'Allow multiple responses') }}
            </label>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="survey.settings.collectEmail" />
              {{ t('Собирать email', 'Collect email') }}
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>{{ t('Дата начала', 'Start Date') }}</label>
            <input type="datetime-local" class="form-control" v-model="survey.settings.startDate" />
          </div>

          <div class="form-group">
            <label>{{ t('Дата окончания', 'End Date') }}</label>
            <input type="datetime-local" class="form-control" v-model="survey.settings.endDate" />
          </div>
        </div>

        <div class="form-group">
          <label>{{ t('Текст кнопки отправки', 'Submit Button Text') }}</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="survey.settings.submitButtonText"
            :placeholder="t('Отправить', 'Submit')"
          />
        </div>

        <div class="form-group">
          <label>{{ t('Сообщение после отправки', 'Success Message') }}</label>
          <textarea 
            class="form-control" 
            rows="2" 
            v-model="survey.settings.successMessage"
            :placeholder="t('Спасибо! Ваш ответ записан.', 'Thank you! Your response has been recorded.')"
          ></textarea>
        </div>
      </div>

      <!-- Вопросы -->
      <div class="card section">
        <div class="section-header">
          <h3><i class="fas fa-question-circle"></i> {{ t('Вопросы', 'Questions') }}</h3>
        </div>

        <draggable 
          v-model="survey.questions" 
          @start="drag=true" 
          @end="drag=false"
          item-key="id"
          handle=".drag-handle"
          class="questions-list"
        >
          <template #item="{element, index}">
            <div class="question-card">
              <div class="question-header">
                <span class="drag-handle" title="Перетащите для изменения порядка">
                  <i class="fas fa-grip-vertical"></i>
                </span>
                <span class="question-number">{{ t('Вопрос', 'Question') }} {{ index + 1 }}</span>
                <button @click="deleteQuestion(index)" class="btn btn-sm btn-danger">
                  <i class="fas fa-trash"></i>
                </button>
              </div>

              <div class="question-body">
                <div class="form-group">
                  <label>{{ t('Тип вопроса', 'Question Type') }}</label>
                  <select class="form-control" v-model="element.type" @change="onQuestionTypeChange(element)">
                    <option value="text">{{ t('Короткий текст', 'Short Text') }}</option>
                    <option value="textarea">{{ t('Длинный текст', 'Long Text') }}</option>
                    <option value="radio">{{ t('Один вариант', 'Single Choice') }}</option>
                    <option value="checkbox">{{ t('Несколько вариантов', 'Multiple Choice') }}</option>
                    <option value="dropdown">{{ t('Выпадающий список', 'Dropdown') }}</option>
                    <option value="date">{{ t('Дата', 'Date') }}</option>
                    <option value="number">{{ t('Число', 'Number') }}</option>
                    <option value="email">{{ t('Email', 'Email') }}</option>
                    <option value="phone">{{ t('Телефон', 'Phone') }}</option>
                    <option value="rating">{{ t('Рейтинг (звёзды)', 'Rating (stars)') }}</option>
                    <option value="scale">{{ t('Шкала (1-10)', 'Scale (1-10)') }}</option>
                    <option value="file">{{ t('Файл', 'File') }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>{{ t('Текст вопроса', 'Question Text') }} *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="element.question"
                    :placeholder="t('Введите текст вопроса', 'Enter question text')"
                    required
                  />
                </div>

                <div class="form-group">
                  <label>{{ t('Описание/подсказка', 'Description/hint') }}</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="element.description"
                    :placeholder="t('Дополнительная подсказка (необязательно)', 'Additional hint (optional)')"
                  />
                </div>

                <!-- Варианты ответов для radio, checkbox, dropdown -->
                <div v-if="['radio', 'checkbox', 'dropdown'].includes(element.type)" class="form-group">
                  <label>{{ t('Варианты ответов', 'Answer Options') }}</label>
                  <div v-for="(option, optIndex) in element.options" :key="optIndex" class="option-row">
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="element.options[optIndex]"
                      :placeholder="t('Вариант', 'Option') + ' ' + (optIndex + 1)"
                    />
                    <button @click="removeOption(element, optIndex)" class="btn btn-sm btn-danger">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <button @click="addOption(element)" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-plus"></i> {{ t('Добавить вариант', 'Add Option') }}
                  </button>
                </div>

                <!-- Настройки для числовых вопросов -->
                <div v-if="['number', 'scale'].includes(element.type)" class="form-row">
                  <div class="form-group">
                    <label>{{ t('Минимум', 'Minimum') }}</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      v-model.number="element.settings.minValue"
                    />
                  </div>
                  <div class="form-group">
                    <label>{{ t('Максимум', 'Maximum') }}</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      v-model.number="element.settings.maxValue"
                    />
                  </div>
                </div>

                <!-- Настройки для textarea -->
                <div v-if="element.type === 'textarea'" class="form-group">
                  <label>{{ t('Количество строк', 'Number of rows') }}</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    v-model.number="element.settings.rows"
                    min="3"
                    max="20"
                  />
                </div>

                <div class="form-group checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="element.required" />
                    {{ t('Обязательный вопрос', 'Required question') }}
                  </label>
                </div>
              </div>
            </div>
          </template>
        </draggable>

        <div v-if="survey.questions.length === 0" class="empty-questions">
          <i class="fas fa-question-circle"></i>
          <p>{{ t('Нет вопросов. Добавьте первый вопрос.', 'No questions yet. Add your first question.') }}</p>
        </div>

        <div class="add-question-footer">
          <button @click="addQuestion" class="btn btn-primary">
            <i class="fas fa-plus"></i> {{ t('Добавить вопрос', 'Add Question') }}
          </button>
        </div>
      </div>

      <!-- Действия -->
      <div class="builder-actions">
        <button @click="saveSurvey" class="btn btn-success btn-lg">
          <i class="fas fa-save"></i> {{ t('Сохранить опрос', 'Save Survey') }}
        </button>
        <button @click="$emit('cancel')" class="btn btn-secondary btn-lg">
          {{ t('Отмена', 'Cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLanguageStore } from '@/stores/language'
import axios from 'axios'
import draggable from 'vuedraggable'

const props = defineProps({
  editingSurvey: Object
})

const emit = defineEmits(['saved', 'cancel'])

const languageStore = useLanguageStore()
const t = computed(() => languageStore.t)

const survey = ref({
  title: '',
  description: '',
  access: {
    type: 'open',
    allowMultipleResponses: false
  },
  settings: {
    showProgressBar: true,
    randomizeQuestions: false,
    showResultsAfterSubmit: false,
    collectEmail: false,
    submitButtonText: 'Отправить',
    successMessage: 'Спасибо! Ваш ответ записан.',
    startDate: null,
    endDate: null
  },
  questions: [],
  status: 'draft'
})

const drag = ref(false)
let questionIdCounter = ref(0)

const generateQuestionId = () => {
  return `q_${Date.now()}_${questionIdCounter.value++}`
}

const addQuestion = () => {
  const newQuestion = {
    id: generateQuestionId(),
    type: 'text',
    question: '',
    description: '',
    required: false,
    options: [],
    settings: {
      minValue: null,
      maxValue: null,
      minLength: null,
      maxLength: null,
      rows: 5,
      placeholder: ''
    },
    order: survey.value.questions.length
  }
  
  survey.value.questions.push(newQuestion)
  
  // Прокручиваем к новому вопросу после добавления
  setTimeout(() => {
    const questionCards = document.querySelectorAll('.question-card')
    if (questionCards.length > 0) {
      const lastCard = questionCards[questionCards.length - 1]
      lastCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, 100)
}

const deleteQuestion = (index) => {
  if (confirm(t.value('Удалить этот вопрос?', 'Delete this question?'))) {
    survey.value.questions.splice(index, 1)
    // Обновляем order
    survey.value.questions.forEach((q, i) => {
      q.order = i
    })
  }
}

const onQuestionTypeChange = (question) => {
  // Инициализируем options для типов с вариантами
  if (['radio', 'checkbox', 'dropdown'].includes(question.type)) {
    if (!question.options || question.options.length === 0) {
      question.options = ['Вариант 1', 'Вариант 2', 'Вариант 3']
    }
  }
  
  // Устанавливаем значения по умолчанию для scale и rating
  if (question.type === 'scale') {
    question.settings.minValue = question.settings.minValue || 1
    question.settings.maxValue = question.settings.maxValue || 10
  }
  
  if (question.type === 'rating') {
    question.settings.maxValue = question.settings.maxValue || 5
  }
}

const addOption = (question) => {
  question.options.push(`Вариант ${question.options.length + 1}`)
}

const removeOption = (question, index) => {
  if (question.options.length > 1) {
    question.options.splice(index, 1)
  }
}

const saveSurvey = async () => {
  // Валидация
  if (!survey.value.title.trim()) {
    alert(t.value('Введите название опроса', 'Please enter survey title'))
    return
  }

  if (survey.value.questions.length === 0) {
    alert(t.value('Добавьте хотя бы один вопрос', 'Please add at least one question'))
    return
  }

  // Проверяем вопросы
  for (let i = 0; i < survey.value.questions.length; i++) {
    const q = survey.value.questions[i]
    if (!q.question.trim()) {
      alert(t.value(`Вопрос ${i + 1}: введите текст вопроса`, `Question ${i + 1}: enter question text`))
      return
    }
    
    if (['radio', 'checkbox', 'dropdown'].includes(q.type) && q.options.length === 0) {
      alert(t.value(`Вопрос ${i + 1}: добавьте варианты ответов`, `Question ${i + 1}: add answer options`))
      return
    }
  }

  try {
    let response
    if (props.editingSurvey) {
      // Обновление существующего опроса
      response = await axios.put(`/graduate/api/surveys/admin/surveys/${props.editingSurvey._id}`, survey.value)
    } else {
      // Создание нового опроса
      response = await axios.post('/graduate/api/surveys/admin/surveys', survey.value)
    }

    if (response.data.success) {
      alert(t.value('Опрос успешно сохранён', 'Survey saved successfully'))
      emit('saved', response.data.survey)
    }
  } catch (error) {
    console.error('Error saving survey:', error)
    alert(t.value('Ошибка при сохранении опроса', 'Error saving survey'))
  }
}

onMounted(() => {
  if (props.editingSurvey) {
    // Загружаем данные редактируемого опроса
    survey.value = { ...props.editingSurvey }
    
    // Конвертируем даты
    if (survey.value.settings.startDate) {
      survey.value.settings.startDate = new Date(survey.value.settings.startDate).toISOString().slice(0, 16)
    }
    if (survey.value.settings.endDate) {
      survey.value.settings.endDate = new Date(survey.value.settings.endDate).toISOString().slice(0, 16)
    }
  }
})
</script>

<style scoped>
.survey-builder {
  max-width: 1200px;
  margin: 0 auto;
}

.builder-header {
  text-align: center;
  margin-bottom: 30px;
}

.builder-header h2 {
  color: var(--primary-color);
  font-size: 28px;
}

.builder-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section {
  background: white;
  padding: 25px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.section h3 {
  color: var(--primary-color);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
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

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: normal !important;
}

.checkbox-label input {
  width: auto;
  margin: 0;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-card {
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: var(--transition);
}

.question-card:hover {
  border-color: var(--accent-color);
}

.question-header {
  background: var(--primary-color);
  color: white;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.drag-handle {
  cursor: move;
  font-size: 18px;
  opacity: 0.6;
}

.drag-handle:hover {
  opacity: 1;
}

.question-number {
  flex: 1;
  font-weight: 600;
  font-size: 16px;
}

.question-body {
  padding: 20px;
}

.option-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.option-row .form-control {
  flex: 1;
}

.empty-questions {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-questions i {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-questions p {
  font-size: 18px;
  margin: 0;
}

.add-question-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e9ecef;
  text-align: center;
}

.builder-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  padding: 20px;
}

.btn-lg {
  padding: 15px 40px;
  font-size: 18px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .question-header {
    flex-wrap: wrap;
  }

  .builder-actions {
    flex-direction: column;
  }

  .btn-lg {
    width: 100%;
  }
}
</style>

