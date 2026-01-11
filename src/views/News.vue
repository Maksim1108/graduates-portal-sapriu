<template>
  <BaseLayout>
    <!-- Breadcrumbs -->
    <nav class="breadcrumb" aria-label="breadcrumb">
      <div class="container">
        <router-link to="/" class="breadcrumb-item">
          <i class="fas fa-home"></i> {{ t('Главная', 'Home') }}
        </router-link>
        <span class="breadcrumb-item active">
          <i class="fas fa-newspaper"></i> {{ t('Новости', 'News') }}
        </span>
      </div>
    </nav>

    <section class="section">
      <div class="container">
        <div class="news-header">
          <h1><i class="fas fa-newspaper"></i> {{ t('Новости кафедры', 'Department News') }}</h1>
          <p>{{ t('Последние новости и события кафедры САПРиУ', 'Latest news and events from the SAPRiU department') }}</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('Загрузка новостей...', 'Loading news...') }}</p>
        </div>

        <!-- No News State -->
        <div v-else-if="!loading && news.length === 0" class="no-news">
          <div class="card" style="text-align: center; padding: 40px;">
            <i class="fas fa-newspaper" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
            <h3>{{ t('Новостей пока нет', 'No news yet') }}</h3>
            <p>{{ t('Новости появятся здесь, как только будут опубликованы.', 'News will appear here as soon as they are published.') }}</p>
          </div>
        </div>

        <!-- News Grid -->
        <div v-else class="news-grid">
          <article 
            v-for="article in paginatedNews" 
            :key="article._id" 
            class="news-card"
            @click="openNewsModal(article)"
          >
            <div class="news-image">
              <img 
                :src="article.images && article.images[0] ? article.images[0] : '/graduate/images/default-news.png'" 
                :alt="article.heading"
                @error="handleImageError"
              />
              <div class="news-date-badge">
                {{ formatDate(article.date) }}
              </div>
            </div>
            <div class="news-content">
              <h3 class="news-title">{{ article.heading }}</h3>
              <p class="news-excerpt">{{ truncateText(article.text, 150) }}</p>
              <div class="news-meta">
                <span class="read-more">
                  {{ t('Читать далее', 'Read more') }} <i class="fas fa-arrow-right"></i>
                </span>
              </div>
            </div>
          </article>
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
    </section>

    <!-- News Modal -->
    <div v-if="selectedNews" class="modal-overlay" @click="closeNewsModal">
      <div class="modal-content news-modal" @click.stop>
        <button @click="closeNewsModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="modal-header">
          <h2>{{ selectedNews.heading }}</h2>
          <div class="modal-meta">
            <span class="modal-date">
              <i class="fas fa-calendar"></i> {{ formatDate(selectedNews.date) }}
            </span>
          </div>
        </div>
        
        <div class="modal-body">
          <div v-if="selectedNews.images && selectedNews.images.length > 0" class="modal-images">
            <div class="image-carousel">
              <img 
                :src="selectedNews.images[currentImageIndex]" 
                :alt="selectedNews.heading"
                class="modal-image"
              />
              <div v-if="selectedNews.images.length > 1" class="image-controls">
                <button 
                  @click="previousImage" 
                  class="btn btn-primary btn-sm"
                  :disabled="currentImageIndex === 0"
                >
                  <i class="fas fa-chevron-left"></i>
                </button>
                <span class="image-counter">
                  {{ currentImageIndex + 1 }} / {{ selectedNews.images.length }}
                </span>
                <button 
                  @click="nextImage" 
                  class="btn btn-primary btn-sm"
                  :disabled="currentImageIndex === selectedNews.images.length - 1"
                >
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div class="modal-text">
            <p v-for="(paragraph, index) in selectedNews.text.split('\n')" 
               :key="index" 
               v-show="paragraph.trim()">
              {{ paragraph }}
            </p>
          </div>
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

const news = ref([])
const loading = ref(true)
const error = ref(null)
const currentPage = ref(1)
const itemsPerPage = 6
const selectedNews = ref(null)
const currentImageIndex = ref(0)

const totalPages = computed(() => Math.ceil(news.value.length / itemsPerPage))

const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return news.value.slice(start, end)
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

const normalizeImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  if (url.startsWith('/images/')) return url.replace('/images/', '/graduate/images/')
  if (url.startsWith('/')) return url
  return '/' + url.replace(/^public\//, '')
}

const fetchNews = async () => {
  try {
    loading.value = true
    const response = await axios.get('/graduate/api/news/get')
    
    if (response.data && response.data.news) {
      news.value = response.data.news.map(item => ({
        ...item,
        date: new Date(item.date),
        images: item.images ? item.images.map(normalizeImageUrl) : item.images
      })).sort((a, b) => b.date - a.date)
    }
  } catch (err) {
    console.error('Error fetching news:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return ''
  
  const d = date instanceof Date ? date : new Date(date)
  
  if (isNaN(d.getTime())) return ''
  
  return d.toLocaleDateString(languageStore.currentLanguage === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  })
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const openNewsModal = (article) => {
  selectedNews.value = article
  currentImageIndex.value = 0
  document.body.style.overflow = 'hidden'
}

const closeNewsModal = () => {
  selectedNews.value = null
  currentImageIndex.value = 0
  document.body.style.overflow = 'auto'
}

const nextImage = () => {
  if (selectedNews.value && currentImageIndex.value < selectedNews.value.images.length - 1) {
    currentImageIndex.value++
  }
}

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const handleImageError = (event) => {
  event.target.src = '/graduate/images/default-news.png'
}

onMounted(() => {
  fetchNews()
})
</script>

<style scoped>
.news-header {
  text-align: center;
  margin-bottom: 50px;
}

.news-header h1 {
  font-size: 36px;
  color: var(--primary-color);
  margin-bottom: 15px;
}

.news-header p {
  font-size: 18px;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
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

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.news-card {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  cursor: pointer;
}

.news-card:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.news-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
}

.news-card:hover .news-image img {
  opacity: 0.95;
}

.news-date-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: var(--accent-color);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.news-content {
  padding: 25px;
}

.news-title {
  font-size: 20px;
  color: var(--primary-color);
  margin-bottom: 15px;
  line-height: 1.3;
}

.news-excerpt {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.read-more {
  color: var(--accent-color);
  font-weight: 500;
  font-size: 14px;
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

/* Modal styles */
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
  overflow-y: auto;
}

.news-modal {
  background: white;
  border-radius: var(--border-radius);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 10;
  transition: var(--transition);
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.7);
}

.modal-header {
  padding: 30px 30px 0;
}

.modal-header h2 {
  color: var(--primary-color);
  margin-bottom: 15px;
  font-size: 28px;
  line-height: 1.3;
}

.modal-meta {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.modal-body {
  padding: 0 30px 30px;
}

.modal-images {
  margin-bottom: 30px;
}

.image-carousel {
  text-align: center;
}

.modal-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: var(--border-radius);
  margin-bottom: 15px;
}

.image-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.image-counter {
  color: #666;
  font-size: 14px;
}

.modal-text p {
  line-height: 1.7;
  margin-bottom: 15px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .news-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .news-header h1 {
    font-size: 28px;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
  
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-header,
  .modal-body {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .modal-close {
    top: 10px;
    right: 10px;
  }
}
</style> 