<template>
  <BaseLayout>
    <!-- Breadcrumbs -->
    <nav class="breadcrumb" aria-label="breadcrumb">
      <div class="container">
        <router-link to="/" class="breadcrumb-item">
          <i class="fas fa-home"></i> {{ t('Главная', 'Home') }}
        </router-link>
        <span class="breadcrumb-item active">
          <i class="fas fa-search"></i> {{ t('Поиск выпускников', 'Graduate Search') }}
        </span>
      </div>
    </nav>

    <section class="section">
      <div class="container">
        <div class="search-header">
          <h1><i class="fas fa-search"></i> {{ t('Поиск выпускников', 'Graduate Search') }}</h1>
          <p>{{ t('Найдите выпускников кафедры САПРиУ по различным критериям', 'Find graduates of the SAPRiU department by various criteria') }}</p>
        </div>

        <!-- Search Form -->
        <div class="search-form card">
          <h3>{{ t('Параметры поиска', 'Search Parameters') }}</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label>{{ t('Имя', 'First Name') }}</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="searchParams.name"
                :placeholder="t('Введите имя', 'Enter first name')"
              />
            </div>
            <div class="form-group">
              <label>{{ t('Фамилия', 'Last Name') }}</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="searchParams.surname"
                :placeholder="t('Введите фамилию', 'Enter last name')"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ t('Год выпуска', 'Graduation Year') }}</label>
              <select class="form-control" v-model="searchParams['education.year_graduation']">
                <option value="">{{ t('Любой год', 'Any year') }}</option>
                <option v-for="year in graduationYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ t('Специальность', 'Specialization') }}</label>
              <select class="form-control" v-model="searchParams['education.specialty']">
                <option value="">{{ t('Любая специальность', 'Any specialization') }}</option>
                <option v-for="spec in specializations" :key="spec" :value="spec">
                  {{ spec }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ t('Город', 'City') }}</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="searchParams.city"
                :placeholder="t('Введите город', 'Enter city')"
              />
            </div>
            <div class="form-group">
              <label>{{ t('Группа', 'Group') }}</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="searchParams['education.group']"
                :placeholder="t('Введите название компании', 'Enter company name')"
              />
            </div>
          </div>

          <div class="search-actions">
            <button @click="performSearch" :disabled="searching" class="btn btn-primary">
              <i class="fas fa-search"></i> {{ t('Поиск', 'Search') }}
            </button>
            <button @click="clearSearch" class="btn btn-outline-secondary">
              <i class="fas fa-times"></i> {{ t('Очистить', 'Clear') }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="searching" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('Поиск выпускников...', 'Searching graduates...') }}</p>
        </div>

        <!-- Search Results -->
        <div v-else-if="hasSearched" class="search-results">
          <div class="results-header">
            <h3>{{ t('Результаты поиска', 'Search Results') }}</h3>
            <p v-if="results.length > 0">
              {{ t('Найдено', 'Found') }}: {{ results.length }} {{ t('выпускников', 'graduates') }}
            </p>
            <p v-else>
              {{ t('По вашему запросу ничего не найдено', 'No results found for your query') }}
            </p>
          </div>

          <!-- Results Grid -->
          <div v-if="results.length > 0" class="results-grid">
            <div 
              v-for="graduate in paginatedResults" 
              :key="graduate._id || graduate.id"
              class="graduate-card"
              @click="viewFullProfile(graduate)"
            >
              <div class="graduate-avatar">
                <img 
                  :src="graduate.avatar || '/graduate/images/default-avatar.png'" 
                  :alt="`${graduate.firstName} ${graduate.lastName}`"
                  @error="handleImageError"
                />
              </div>
              <div class="graduate-info">
                <h4 class="graduate-name">
                  {{ graduate.firstName }} {{ graduate.lastName }}
                </h4>
                <div class="graduate-details">
                  <div class="detail-row" v-if="graduate.graduationYear">
                    <i class="fas fa-graduation-cap"></i>
                    <span>{{ t('Выпуск', 'Class of') }} {{ graduate.graduationYear }}</span>
                  </div>
                  <div class="detail-row" v-if="graduate.specialization">
                    <i class="fas fa-book"></i>
                    <span>{{ graduate.specialization }}</span>
                  </div>
                  <div class="detail-row" v-if="graduate.city">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ graduate.city }}</span>
                  </div>
                  <div class="detail-row" v-if="graduate.company">
                    <i class="fas fa-building"></i>
                    <span>{{ graduate.company }}</span>
                  </div>
                </div>
                <div class="graduate-actions">
                  <button class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-eye"></i> {{ t('Просмотр', 'View') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div v-else class="no-results">
            <div class="card" style="text-align: center; padding: 40px;">
              <i class="fas fa-search" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
              <h3>{{ t('Ничего не найдено', 'Nothing found') }}</h3>
              <p>{{ t('Попробуйте изменить параметры поиска', 'Try changing search parameters') }}</p>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination">
            <button 
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="btn btn-outline-primary"
            >
              <i class="fas fa-chevron-left"></i> {{ t('Предыдущая', 'Previous') }}
            </button>
            
            <div class="page-numbers">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="['btn', page === currentPage ? 'btn-primary' : 'btn-outline-primary']"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="btn btn-outline-primary"
            >
              {{ t('Следующая', 'Next') }} <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- Initial State -->
        <div v-else class="initial-state">
          <div class="card" style="text-align: center; padding: 60px;">
            <i class="fas fa-graduation-cap" style="font-size: 80px; color: var(--accent-color); margin-bottom: 20px;"></i>
            <h3>{{ t('Поиск выпускников кафедры', 'Search for department graduates') }}</h3>
            <p>{{ t('Используйте форму выше для поиска выпускников по различным критериям', 'Use the form above to search for graduates by various criteria') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Full Profile Modal -->
    <div v-if="showProfileModal" class="modal-overlay" @click="closeProfileModal">
      <div class="modal-content profile-modal" @click.stop>
        <button @click="closeProfileModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
        
        <h3><i class="fas fa-user"></i> {{ t('Анкета выпускника', 'Graduate Profile') }}</h3>
        
        <div v-if="selectedProfile" class="profile-content">
          <!-- Profile Header -->
          <div class="profile-header">
            <div class="profile-photo">
              <img :src="selectedProfile.photo || '/graduate/images/default-avatar.png'" :alt="selectedProfile.name" />
            </div>
            <div class="profile-basic">
              <h4>{{ selectedProfile.surname }} {{ selectedProfile.name }} {{ selectedProfile.patronymic }}</h4>
              <div class="profile-meta">
                <span v-if="selectedProfile.city"><i class="fas fa-map-marker-alt"></i> {{ selectedProfile.city }}</span>
                <span v-if="selectedProfile.phone_number"><i class="fas fa-phone"></i> {{ selectedProfile.phone_number }}</span>
              </div>
            </div>
          </div>

          <!-- Education Section -->
          <div v-if="selectedProfile.education && selectedProfile.education.length" class="profile-section">
            <h5><i class="fas fa-graduation-cap"></i> {{ t('Образование', 'Education') }}</h5>
            <div v-for="(edu, index) in selectedProfile.education" :key="index" class="education-item">
              <div class="education-grid">
                <div v-if="edu.year_graduation" class="education-field">
                  <label>{{ t('Год выпуска', 'Graduation Year') }}:</label>
                  <span>{{ edu.year_graduation }}</span>
                </div>
                <div v-if="edu.educ_form" class="education-field">
                  <label>{{ t('Форма обучения', 'Education Form') }}:</label>
                  <span>{{ edu.educ_form }}</span>
                </div>
                <div v-if="edu.qualification" class="education-field">
                  <label>{{ t('Квалификация', 'Qualification') }}:</label>
                  <span>{{ edu.qualification }}</span>
                </div>
                <div v-if="edu.specialty" class="education-field">
                  <label>{{ t('Специальность', 'Specialty') }}:</label>
                  <span>{{ edu.specialty }}</span>
                </div>
                <div v-if="edu.dir_training" class="education-field">
                  <label>{{ t('Направление подготовки', 'Training Direction') }}:</label>
                  <span>{{ edu.dir_training }}</span>
                </div>
                <div v-if="edu.focus" class="education-field">
                  <label>{{ t('Направленность', 'Focus') }}:</label>
                  <span>{{ edu.focus }}</span>
                </div>
                <div v-if="edu.group" class="education-field">
                  <label>{{ t('Группа', 'Group') }}:</label>
                  <span>{{ edu.group }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Show message if no education data -->
          <div v-else-if="selectedProfile.education === undefined || selectedProfile.education === null" class="profile-section">
            <h5><i class="fas fa-graduation-cap"></i> {{ t('Образование', 'Education') }}</h5>
            <p style="color: #666; font-style: italic;">{{ t('Данные об образовании не найдены', 'Education data not found') }}</p>
          </div>

          <!-- Work Information -->
          <div v-if="hasWorkInfo" class="profile-section">
            <h5><i class="fas fa-briefcase"></i> {{ t('Рабочая информация', 'Work Information') }}</h5>
            <div class="work-grid">
              <div v-if="selectedProfile.work_place" class="work-field">
                <label>{{ t('Место работы', 'Work Place') }}:</label>
                <span>{{ selectedProfile.work_place }}</span>
              </div>
              <div v-if="selectedProfile.position" class="work-field">
                <label>{{ t('Должность', 'Position') }}:</label>
                <span>{{ selectedProfile.position }}</span>
              </div>
              <div v-if="selectedProfile.field_activety" class="work-field">
                <label>{{ t('Сфера деятельности', 'Field of Activity') }}:</label>
                <span>{{ selectedProfile.field_activety }}</span>
              </div>
              <div v-if="selectedProfile.academ_degree" class="work-field">
                <label>{{ t('Учёная степень', 'Academic Degree') }}:</label>
                <span>{{ selectedProfile.academ_degree }}</span>
              </div>
              <div v-if="selectedProfile.academ_rank" class="work-field">
                <label>{{ t('Учёное звание', 'Academic Rank') }}:</label>
                <span>{{ selectedProfile.academ_rank }}</span>
              </div>
            </div>
          </div>

          <!-- Additional Information -->
          <div v-if="hasAdditionalInfo" class="profile-section">
            <h5><i class="fas fa-info-circle"></i> {{ t('Дополнительная информация', 'Additional Information') }}</h5>
            <div class="additional-grid">
              <div v-if="selectedProfile.hobby" class="additional-field">
                <label>{{ t('Хобби', 'Hobby') }}:</label>
                <span>{{ selectedProfile.hobby }}</span>
              </div>
              <div v-if="selectedProfile.other_education" class="additional-field">
                <label>{{ t('Дополнительное образование', 'Additional Education') }}:</label>
                <span>{{ selectedProfile.other_education }}</span>
              </div>
              <div v-if="selectedProfile.best_practices" class="additional-field">
                <label>{{ t('Лучшие практики', 'Best Practices') }}:</label>
                <span>{{ selectedProfile.best_practices }}</span>
              </div>
            </div>
          </div>

          <!-- Social Networks -->
          <div v-if="hasSocialNetworks" class="profile-section">
            <h5><i class="fas fa-share-alt"></i> {{ t('Социальные сети', 'Social Networks') }}</h5>
            <div v-for="(social, index) in selectedProfile.social_network" :key="index" class="social-item">
              <div class="social-field">
                <label>{{ social.network_name }}:</label>
                <a :href="social.url" target="_blank" rel="noopener">{{ social.url }}</a>
              </div>
            </div>
          </div>

          <!-- Questions -->
          <div v-if="hasQuestionAnswers" class="profile-section">
            <h5><i class="fas fa-question-circle"></i> {{ t('Ответы на вопросы', 'Question Answers') }}</h5>
            <div class="questions-list">
              <div v-if="selectedProfile.q1 && selectedProfile.q1.length" class="question-item">
                <label>{{ t('Поддерживаете ли Вы отношения с другими выпускниками СПбГТИ?', 'Do you maintain relationships with other SPbGTI graduates?') }}</label>
                <p>{{ selectedProfile.q1.join('; ') }}</p>
              </div>
              <div v-if="selectedProfile.q2 && selectedProfile.q2.length" class="question-item">
                <label>{{ t('Чем может быть полезен университет для Вашей деятельности?', 'How can the university be useful for your activities?') }}</label>
                <p>{{ selectedProfile.q2.join('; ') }}</p>
              </div>
              <div v-if="selectedProfile.q3" class="question-item">
                <label>{{ t('Чем Ассоциация выпускников может быть Вам полезна?', 'How can the Alumni Association be useful to you?') }}</label>
                <p>{{ selectedProfile.q3 }}</p>
              </div>
              <div v-if="selectedProfile.q4 && selectedProfile.q4.length" class="question-item">
                <label>{{ t('Можете ли Вы оказать содействие в развитии университета?', 'Can you assist in the development of the university?') }}</label>
                <p>{{ selectedProfile.q4.join('; ') }}</p>
              </div>
              <div v-if="selectedProfile.q5 && selectedProfile.q5.length" class="question-item">
                <label>{{ t('Есть ли у вас материалы для музея истории университета?', 'Do you have materials for the university history museum?') }}</label>
                <p>{{ selectedProfile.q5.join('; ') }}</p>
              </div>
              <div v-if="selectedProfile.q6" class="question-item">
                <label>{{ t('Дополнительные сведения', 'Additional Information') }}</label>
                <p>{{ selectedProfile.q6 }}</p>
              </div>
              <div v-if="selectedProfile.q7" class="question-item">
                <label>{{ t('Участие в праздничном концерте', 'Participation in Anniversary Concert') }}</label>
                <p>{{ selectedProfile.q7 }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button @click="closeProfileModal" class="btn btn-secondary">
            {{ t('Закрыть', 'Close') }}
          </button>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLanguageStore } from '@/stores/language'
import BaseLayout from '@/components/BaseLayout.vue'
import axios from 'axios'

const languageStore = useLanguageStore()
const t = computed(() => languageStore.t)

const searchParams = ref({
  name: '',
  surname: '',
  city: '',
  'education.year_graduation': '',
  'education.specialty': '',
  'education.group': ''
})

const results = ref([])
const searching = ref(false)
const hasSearched = ref(false)
const currentPage = ref(1)
const itemsPerPage = 12

const showProfileModal = ref(false)
const selectedProfile = ref(null)

const graduationYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear; year >= 1990; year--) {
    years.push(year)
  }
  return years
})

const specializations = [
  'Автоматизированные системы обработки информации и управления',
  'Информационные системы и технологии',
  'Программная инженерия',
  'Прикладная информатика',
  'Системы автоматизированного проектирования',
  'Управление в технических системах'
]

const totalPages = computed(() => Math.ceil(results.value.length / itemsPerPage))

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return results.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const hasQuestionAnswers = computed(() => {
  if (!selectedProfile.value) return false
  
  const profile = selectedProfile.value
  return !!(profile.q1 && profile.q1.length) ||
         !!(profile.q2 && profile.q2.length) ||
         !!profile.q3 ||
         !!(profile.q4 && profile.q4.length) ||
         !!(profile.q5 && profile.q5.length) ||
         !!profile.q6 ||
         !!profile.q7
})

const hasAdditionalInfo = computed(() => {
  if (!selectedProfile.value) return false
  
  const profile = selectedProfile.value
  return !!(profile.hobby && profile.hobby.trim()) ||
         !!(profile.other_education && profile.other_education.trim()) ||
         !!(profile.best_practices && profile.best_practices.trim())
})

const hasWorkInfo = computed(() => {
  if (!selectedProfile.value) return false
  
  const profile = selectedProfile.value
  return !!(profile.work_place && profile.work_place.trim()) ||
         !!(profile.position && profile.position.trim()) ||
         !!(profile.field_activety && profile.field_activety.trim()) ||
         !!(profile.academ_degree && profile.academ_degree.trim()) ||
         !!(profile.academ_rank && profile.academ_rank.trim())
})

const hasSocialNetworks = computed(() => {
  if (!selectedProfile.value) return false
  
  const profile = selectedProfile.value
  return !!(profile.social_network && 
           Array.isArray(profile.social_network) && 
           profile.social_network.length > 0 &&
           profile.social_network.some(social => 
             social.network_name && social.network_name.trim() && 
             social.url && social.url.trim()
           ))
})

const normalizeImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  if (url.startsWith('/images/')) return url.replace('/images/', '/graduate/images/')
  if (url.startsWith('/')) return url
  return '/' + url.replace(/^public\//, '')
}

const performSearch = async () => {
  try {
    searching.value = true
    hasSearched.value = true
    
    const queryParams = new URLSearchParams()
    Object.entries(searchParams.value).forEach(([key, value]) => {
      if (value && value.trim()) {
        queryParams.append(key, value.trim())
      }
    })
    
    const response = await axios.get(`/graduate/api/forms/search?${queryParams}`)
    
    if (response.data && response.data.forms) {
      results.value = response.data.forms.map(f => {
        return {
          id: f._id,
          firstName: f.name,
          lastName: f.surname,
          patronymic: f.patronymic,
          city: f.city,
          graduationYear: f.education?.year_graduation,
          specialization: f.education?.specialty,
          avatar: f.photo ? normalizeImageUrl(f.photo) : f.photo,
          fullData: f
        }
      })
    } else {
      results.value = []
    }
    
    currentPage.value = 1
  } catch (error) {
    console.error('Error searching graduates:', error)
    results.value = []
    
    // no mock data
  } finally {
    searching.value = false
  }
}

const clearSearch = () => {
  searchParams.value = {
    firstName: '',
    lastName: '',
    graduationYear: '',
    specialization: '',
    city: '',
    company: ''
  }
  results.value = []
  hasSearched.value = false
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleImageError = (event) => {
  event.target.src = '/graduate/images/default-avatar.png'
}

const viewFullProfile = async (graduate) => {
  try {
    const response = await axios.get(`/graduate/api/forms/get_form/${graduate.id}`)
    if (response.data && response.data.success) {
      selectedProfile.value = response.data.form
      showProfileModal.value = true
    } else {
      selectedProfile.value = graduate
      showProfileModal.value = true
    }
  } catch (error) {
    console.error('Error fetching full profile:', error)
    selectedProfile.value = graduate
    showProfileModal.value = true
  }
}

const closeProfileModal = () => {
  showProfileModal.value = false
  selectedProfile.value = null
}

onMounted(() => {
})
</script>

<style scoped>
.search-header {
  text-align: center;
  margin-bottom: 40px;
}

.search-header h1 {
  font-size: 36px;
  color: var(--primary-color);
  margin-bottom: 15px;
}

.search-header p {
  font-size: 18px;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.search-form {
  margin-bottom: 40px;
  padding: 30px;
}

.search-form h3 {
  color: var(--primary-color);
  margin-bottom: 25px;
  font-size: 22px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-color);
}

.form-control {
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: var(--border-radius);
  font-size: 16px;
  transition: var(--transition);
}

.form-control:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
}

.search-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.loading-state {
  text-align: center;
  padding: 60px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.search-results {
  margin-top: 40px;
}

.results-header {
  text-align: center;
  margin-bottom: 40px;
}

.results-header h3 {
  color: var(--primary-color);
  margin-bottom: 10px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.graduate-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  cursor: pointer;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 15px;
}

.graduate-card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  border-color: var(--accent-color);
}

.graduate-avatar {
  flex-shrink: 0;
}

.graduate-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--light-bg);
}

.graduate-info {
  flex: 1;
  min-width: 0;
}

.graduate-name {
  color: var(--primary-color);
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.graduate-details {
  margin-bottom: 10px;
}

.detail-row {
  margin-bottom: 4px;
  color: #666;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-row i {
  color: var(--accent-color);
  width: 14px;
  flex-shrink: 0;
}

.graduate-actions {
  display: flex;
  justify-content: flex-end;
}

.graduate-actions .btn {
  font-size: 12px;
  padding: 4px 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 40px;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.initial-state {
  margin-top: 40px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .search-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .search-actions .btn {
    width: 200px;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .search-header h1 {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .search-form {
    padding: 20px;
  }
  
  .graduate-year,
  .graduate-spec,
  .graduate-location,
  .graduate-company {
    justify-content: flex-start;
    text-align: left;
  }
  
  .graduate-info {
    text-align: left;
  }
  
  .graduate-avatar {
    text-align: center;
  }
}

/* Profile Modal Styles */
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
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  padding: 30px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
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

.profile-modal {
  max-width: 900px;
}

.profile-content {
  margin-top: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: var(--border-radius);
}

.profile-photo {
  flex-shrink: 0;
}

.profile-photo img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--light-bg);
}

.profile-basic h4 {
  color: var(--primary-color);
  margin-bottom: 10px;
  font-size: 24px;
}

.profile-meta {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

.profile-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.profile-section {
  margin-bottom: 25px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: var(--border-radius);
  background: #fafafa;
}

.profile-section h5 {
  color: var(--primary-color);
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
}

.profile-section h5 i {
  color: var(--accent-color);
}

.education-grid,
.work-grid,
.additional-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.education-field,
.work-field,
.additional-field,
.social-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.education-field label,
.work-field label,
.additional-field label,
.social-field label {
  font-weight: 600;
  color: #666;
  font-size: 14px;
}

.education-field span,
.work-field span,
.additional-field span {
  color: var(--text-color);
  font-size: 15px;
}

.social-field a {
  color: var(--accent-color);
  text-decoration: none;
}

.social-field a:hover {
  text-decoration: underline;
}

.education-item {
  margin-bottom: 15px;
  padding: 15px;
  background: white;
  border-radius: var(--border-radius);
  border-left: 4px solid var(--accent-color);
}

.social-item {
  margin-bottom: 10px;
  padding: 10px;
  background: white;
  border-radius: var(--border-radius);
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.question-item {
  padding: 15px;
  background: white;
  border-radius: var(--border-radius);
  border-left: 4px solid var(--primary-color);
}

.question-item label {
  display: block;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.question-item p {
  margin: 0;
  color: var(--text-color);
  line-height: 1.5;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    padding: 20px;
  }

  .profile-modal {
    max-width: 95vw;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-meta {
    justify-content: center;
  }

  .education-grid,
  .work-grid,
  .additional-grid {
    grid-template-columns: 1fr;
  }
}
</style> 