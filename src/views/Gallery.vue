<template>
  <BaseLayout>
    <!-- Breadcrumbs -->
    <nav class="breadcrumb" aria-label="breadcrumb">
      <div class="container">
        <router-link to="/" class="breadcrumb-item">
          <i class="fas fa-home"></i> {{ t('Главная', 'Home') }}
        </router-link>
        <span class="breadcrumb-item active">
          <i class="fas fa-images"></i> {{ t('Галерея', 'Gallery') }}
        </span>
      </div>
    </nav>

    <section class="section">
      <div class="container">
        <div class="gallery-header">
          <h1><i class="fas fa-images"></i> {{ t('Галерея кафедры', 'Department Gallery') }}</h1>
          <p>{{ t('Фотографии событий, мероприятий и достижений кафедры САПРиУ', 'Photos of events, activities and achievements of the SAPRiU department') }}</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('Загрузка изображений...', 'Loading images...') }}</p>
        </div>

        <!-- No Images State -->
        <div v-else-if="!loading && images.length === 0" class="no-images">
          <div class="card" style="text-align: center; padding: 40px;">
            <i class="fas fa-images" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
            <h3>{{ t('Изображений пока нет', 'No images yet') }}</h3>
            <p>{{ t('Фотографии появятся здесь, как только будут загружены.', 'Photos will appear here as soon as they are uploaded.') }}</p>
          </div>
        </div>

        <!-- Gallery Grid -->
        <div v-else class="gallery-grid">
          <div 
            v-for="(image, index) in paginatedImages" 
            :key="image._id || index"
            class="gallery-item"
            @click="openLightbox(index + (currentPage - 1) * itemsPerPage)"
          >
            <div class="image-container">
              <img 
                :src="image.img || image.src || image.url || image" 
                :alt="image.alt || `Gallery image ${index + 1}`"
                @error="handleImageError"
                loading="lazy"
              />
              <div class="image-overlay">
                <i class="fas fa-search-plus"></i>
              </div>
            </div>
            <div v-if="image.title || image.description" class="image-info">
              <h4 v-if="image.title">{{ image.title }}</h4>
              <p v-if="image.description">{{ image.description }}</p>
            </div>
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
    </section>

    <!-- Lightbox Modal -->
    <div v-if="lightboxOpen" class="lightbox-overlay" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <button @click="closeLightbox" class="lightbox-close">
          <i class="fas fa-times"></i>
        </button>
        
        <button 
          v-if="currentImageIndex > 0"
          @click="previousImage"
          class="lightbox-nav lightbox-prev"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <button 
          v-if="currentImageIndex < images.length - 1"
          @click="nextImage"
          class="lightbox-nav lightbox-next"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
        
        <div class="lightbox-image-container">
          <img 
            :src="currentLightboxImage.img || currentLightboxImage.src || currentLightboxImage.url || currentLightboxImage"
            :alt="currentLightboxImage.alt || `Gallery image ${currentImageIndex + 1}`"
            class="lightbox-image"
            @click.stop
          />
        </div>
        
        <div v-if="currentLightboxImage.title || currentLightboxImage.description" class="lightbox-info">
          <h3 v-if="currentLightboxImage.title">{{ currentLightboxImage.title }}</h3>
          <p v-if="currentLightboxImage.description">{{ currentLightboxImage.description }}</p>
        </div>
        
        <div class="lightbox-counter">
          {{ currentImageIndex + 1 }} / {{ images.length }}
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLanguageStore } from '@/stores/language'
import BaseLayout from '@/components/BaseLayout.vue'
import axios from 'axios'

const languageStore = useLanguageStore()
const t = computed(() => languageStore.t)

const images = ref([])
const loading = ref(true)
const error = ref(null)
const currentPage = ref(1)
const itemsPerPage = 12
const lightboxOpen = ref(false)
const currentImageIndex = ref(0)

const totalPages = computed(() => Math.ceil(images.value.length / itemsPerPage))

const paginatedImages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return images.value.slice(start, end)
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

const currentLightboxImage = computed(() => {
  return images.value[currentImageIndex.value] || {}
})

const normalizeImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  if (url.startsWith('/images/')) return url.replace('/images/', '/graduate/images/')
  if (url.startsWith('/')) return url
  return '/' + url.replace(/^public\//, '')
}

const fetchImages = async () => {
  try {
    loading.value = true
    const response = await axios.get('/graduate/api/gallery/get_true')
    
    if (response.data && response.data.photos) {
      images.value = response.data.photos.map(photo => ({
        ...photo,
        img: photo.img ? normalizeImageUrl(photo.img) : photo.img
      }))
    } else if (response.data && Array.isArray(response.data)) {
      images.value = response.data.map(item => ({
        ...item,
        img: item.img ? normalizeImageUrl(item.img) : item.img
      }))
    } else {
      images.value = [
        '/graduate/images/1.png',
        '/graduate/images/2.png',
        '/graduate/images/3.jpg',
        '/graduate/images/4.jpg',
        '/graduate/images/5.png',
        '/graduate/images/11.png',
        '/graduate/images/12.png',
        '/graduate/images/13.png',
        '/graduate/images/14.png',
        '/graduate/images/15.png'
      ]
    }
  } catch (err) {
    console.error('Error fetching gallery images:', err)
    error.value = err.message
    
    images.value = [
      '/graduate/images/1.png',
      '/graduate/images/2.png',
      '/graduate/images/3.jpg',
      '/graduate/images/4.jpg',
      '/graduate/images/5.png'
    ]
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const openLightbox = (index) => {
  currentImageIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = 'auto'
}

const nextImage = () => {
  if (currentImageIndex.value < images.value.length - 1) {
    currentImageIndex.value++
  }
}

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const handleImageError = (event) => {
  console.warn('Image failed to load:', event.target.src)
  event.target.src = '/graduate/images/default-avatar.png'
}

const handleKeydown = (event) => {
  if (!lightboxOpen.value) return
  
  switch (event.key) {
    case 'Escape':
      closeLightbox()
      break
    case 'ArrowLeft':
      previousImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

onMounted(() => {
  fetchImages()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.gallery-header {
  text-align: center;
  margin-bottom: 50px;
}

.gallery-header h1 {
  font-size: 36px;
  color: var(--primary-color);
  margin-bottom: 15px;
}

.gallery-header p {
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

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 50px;
}

.gallery-item {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  cursor: pointer;
}

.gallery-item:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
}

.gallery-item:hover .image-container img {
  opacity: 0.95;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--transition);
}

.gallery-item:hover .image-overlay {
  opacity: 1;
}

.image-overlay i {
  color: white;
  font-size: 24px;
}

.image-info {
  padding: 15px;
}

.image-info h4 {
  font-size: 16px;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.image-info p {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
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

/* Lightbox styles */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.lightbox-content {
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
}

.lightbox-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 10;
  transition: var(--transition);
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  z-index: 10;
  transition: var(--transition);
  font-size: 18px;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.3);
}

.lightbox-prev {
  left: -70px;
}

.lightbox-next {
  right: -70px;
}

.lightbox-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: var(--border-radius);
}

.lightbox-info {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  text-align: center;
  margin-top: 20px;
  border-radius: var(--border-radius);
}

.lightbox-info h3 {
  color: white;
  margin-bottom: 10px;
}

.lightbox-info p {
  margin: 0;
  opacity: 0.9;
}

.lightbox-counter {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  border-radius: 20px;
}

@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .gallery-header h1 {
    font-size: 28px;
  }
  
  .lightbox-nav {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .lightbox-prev {
    left: -50px;
  }
  
  .lightbox-next {
    right: -50px;
  }
  
  .lightbox-close {
    top: -40px;
    width: 35px;
    height: 35px;
  }
}

@media (max-width: 480px) {
  .lightbox-nav {
    position: static;
    margin: 10px;
  }
  
  .lightbox-content {
    position: relative;
  }
  
  .lightbox-controls {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
</style> 