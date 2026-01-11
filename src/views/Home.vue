<template>
  <BaseLayout>
    <!-- Banner Section -->
    <section class="banner">
      <div class="container">
        <div class="swiper_banner" ref="bannerSwiper">
          <div class="swiper-wrapper">
            <div 
              v-for="(image, index) in bannerImages" 
              :key="index" 
              class="swiper-slide"
            >
              <img 
                :src="image" 
                :alt="`Banner ${index + 1}`"
                :class="{ hidden: index === 1 && !showSecondImage }"
              />
            </div>
          </div>
          <div class="banner_text">
            <div></div>
            <p>{{ displayTitle }}</p>
          </div>
          <div class="swiper-pagination"></div>
          <div class="swiper-button-prev"></div>
          <div class="swiper-button-next"></div>
        </div>
      </div>
    </section>

    <!-- About Us Section -->
    <section id="aboutUs" class="section">
      <div class="container">
        <div id="aboutUsContent">
          <div id="aboutUsHeader">
            <hr>
            <p><i class="fas fa-info-circle"></i> {{ t('О нас', 'About us') }}</p>
            <hr>
          </div>
          <div id="aboutUsText">
            <p>{{ displayAbout }}</p>
          </div>
          <router-link 
            v-if="!isAuthenticated" 
            to="/auth" 
            class="btn btn-primary"
          >
            <i class="fas fa-user-plus"></i> {{ t('Присоединиться', 'Join') }}
          </router-link>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="academic-stats-section">
      <div class="container">
        <div class="academic-header">
          <div class="academic-title-wrapper">
            <div class="academic-divider"></div>
            <h2 class="academic-title">
              <i class="fas fa-chart-bar"></i> {{ t('О кафедре в цифрах', 'Department in numbers') }}
            </h2>
            <div class="academic-divider"></div>
          </div>
          <p class="academic-subtitle">{{ t('Статистика и достижения кафедры САПРиУ', 'Statistics and achievements of the CAD department') }}</p>
        </div>
        
        <div class="academic-stats-grid">
          <div class="academic-stat-item">
            <div class="stat-icon">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number" data-count="1000">0</div>
              <div class="stat-label">{{ t('Специалистов подготовлено', 'Specialists trained') }}</div>
            </div>
          </div>
          
          <div class="academic-stat-item">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number" data-count="50">0</div>
              <div class="stat-label">{{ t('Сотрудников кафедры', 'Department staff') }}</div>
            </div>
          </div>
          
          <div class="academic-stat-item">
            <div class="stat-icon">
              <i class="fas fa-user-graduate"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number" data-count="200">0</div>
              <div class="stat-label">{{ t('Студентов в 2025 году', 'Students in 2025') }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Partners Section -->
    <section class="section">
      <div class="container">
        <div id="Main_parthner">
          <p><i class="fas fa-handshake"></i> {{ t('Партнёры кафедры', 'The partners of the department') }}</p>
        </div>
        <div class="swiper partners-swiper" ref="partnersSwiper">
          <div class="swiper-wrapper">
            <div id="comp_img" class="swiper-slide">
              <img src="/images/11.png" alt="Partner 1">
            </div>
            <div id="comp_img" class="swiper-slide">
              <img src="/images/12.png" alt="Partner 2">
            </div>
            <div id="comp_img" class="swiper-slide">
              <img src="/images/13.png" alt="Partner 3">
            </div>
            <div id="comp_img" class="swiper-slide">
              <img src="/images/14.png" alt="Partner 4">
            </div>
            <div id="comp_img" class="swiper-slide">
              <img src="/images/15.png" alt="Partner 5">
            </div>
          </div>
          <div class="swiper-pagination"></div>
        </div>
      </div>
    </section>

    <!-- News Section -->
    <section class="section section-bg news-section">
      <div class="container">
        <div id="NewsHeader">
          <p><i class="fas fa-newspaper"></i> {{ t('Главные новости', 'Main news') }}</p>
        </div>
        <div class="test-page-wrapper">
          <div class="carousel-wrapper" id="news_section">
            <div v-if="newsData.length === 0" class="no-news-message">
              <p style="text-align:center; font-size: 20px; color: #888; margin: 30px 0;">
                {{ t('Новости отсутствуют', 'No news available') }}
              </p>
            </div>
            <div v-else class="news-swiper" ref="newsSwiper">
              <div class="swiper-wrapper">
                <div class="swiper-slide" v-for="newsItem in newsData" :key="newsItem._id">
                  <div class="slide">
                    <div class="thumb">
                      <img 
                        :src="newsItem.images[0]" 
                        class="img_p" 
                        height="200" 
                        width="348" 
                        :alt="newsItem.heading"
                      />
                      <div class="news-date-overlay">
                        <i class="fas fa-calendar"></i>
                        <span>{{ formatNewsDate(newsItem.date) }}</span>
                      </div>
                    </div>
                    <div class="infos">
                      <div class="news-header-info">
                        <h4>{{ newsItem.heading }}</h4>
                        <div class="news-meta">
                          <span class="news-read-time">
                            <i class="fas fa-clock"></i> {{ calculateReadTime(newsItem.text) }} {{ t('мин', 'min') }}
                          </span>
                        </div>
                      </div>
                      <div class="text-wrapper">
                        <p>{{ newsItem.text }}</p>
                      </div>
                      <div class="news-footer">
                        <div class="news-actions">
                          <button class="btn-read-more" @click="openNewsModal(newsItem)">
                            {{ t('Читать далее', 'Read more') }}
                            <i class="fas fa-arrow-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Navigation buttons -->
              <div class="swiper-button-prev news-nav-prev"></div>
              <div class="swiper-button-next news-nav-next"></div>
              <!-- Pagination -->
              <div class="swiper-pagination news-pagination"></div>
            </div>
          </div>
        </div>
        
        <!-- News Button integrated into the same section -->
        <div class="news-button-container">
          <router-link to="/news" class="btn btn-primary">
            <i class="fas fa-arrow-right"></i> {{ t('Перейти к новостям', 'Go to the news page') }}
          </router-link>
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
              <i class="fas fa-calendar"></i> {{ formatNewsDate(selectedNews.date) }}
            </span>
            <span class="modal-read-time">
              <i class="fas fa-clock"></i> {{ calculateReadTime(selectedNews.text) }} {{ t('мин', 'min') }}
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
import { ref, onMounted, computed, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import BaseLayout from '@/components/BaseLayout.vue'
import { Swiper } from 'swiper'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import axios from 'axios'

const authStore = useAuthStore()
const languageStore = useLanguageStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentLanguage = computed(() => languageStore.currentLanguage)
const t = computed(() => languageStore.t)

const homeData = ref({})
const newsData = ref([])
const bannerImages = ref([])
const showSecondImage = ref(false)
const selectedNews = ref(null)
const currentImageIndex = ref(0)

const bannerSwiper = ref(null)
const partnersSwiper = ref(null)
const newsSwiper = ref(null)

let bannerSwiperInstance = null
let partnersSwiperInstance = null
let newsSwiperInstance = null

const normalizeImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  if (url.startsWith('/images/')) return url.replace('/images/', '/graduate/images/')
  if (url.startsWith('/')) return url
  return '/' + url.replace(/^public\//, '')
}

const fetchHomeData = async () => {
  try {
    const response = await fetch('/graduate/api/get_homepage', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) throw new Error('Failed to fetch homepage data')

    const reader = response.body.getReader()
    let receivedLength = 0
    let chunks = []

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      receivedLength += value.length
    }

    let chunksAll = new Uint8Array(receivedLength)
    let position = 0
    for (let chunk of chunks) {
      chunksAll.set(chunk, position)
      position += chunk.length
    }

    let result = new TextDecoder('utf-8').decode(chunksAll)
    const data = JSON.parse(result)

    homeData.value = data || {}
    const imgs = Array.isArray(data?.images) ? data.images : []
    bannerImages.value = imgs.map(normalizeImageUrl)
  } catch (error) {
    console.error('Error fetching home data:', error)
    homeData.value = homeData.value || {}
    bannerImages.value = ['/graduate/images/photoUni.png']
  }
}

const fetchNews = async () => {
  try {
    const response = await axios.get('/graduate/api/news/get')
    if (response.data && response.data.news) {
      newsData.value = response.data.news
        .map(item => ({
          ...item,
          date: new Date(item.date)
        }))
        .slice(0, 6)
    }
  } catch (error) {
    console.error('Error fetching news:', error)
  }
}

const initializeBannerSwiper = () => {
  if (bannerSwiper.value) {
    const slidesCount = bannerImages.value.length
    const enableLoop = slidesCount > 1
    bannerSwiperInstance = new Swiper(bannerSwiper.value, {
      modules: [Navigation, Pagination, Autoplay, EffectFade],
      loop: enableLoop,
      spaceBetween: 150,
      effect: enableLoop ? 'fade' : undefined,
      autoplay: enableLoop
        ? { delay: 5000, disableOnInteraction: false }
        : false,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    })
  }
}

const initializePartnersSwiper = () => {
  if (partnersSwiper.value) {
    const totalSlides = partnersSwiper.value.querySelectorAll('.swiper-slide').length
    partnersSwiperInstance = new Swiper(partnersSwiper.value, {
      modules: [Pagination, Autoplay],
      loop: totalSlides > 1,
      spaceBetween: 0,
      slidesPerView: 1,
      centeredSlides: true,
      autoplay: totalSlides > 1
        ? { delay: 2000, disableOnInteraction: false }
        : false,
      pagination: { el: '.swiper-pagination', clickable: true }
    })
  }
}

const initializeNewsSwiper = () => {
  if (newsSwiper.value && newsData.value.length > 0) {
    newsSwiperInstance = new Swiper(newsSwiper.value, {
      modules: [Navigation, Pagination],
      loop: false,
      spaceBetween: 30,
      slidesPerView: 3,
      centeredSlides: false,
      navigation: {
        nextEl: '.news-nav-next',
        prevEl: '.news-nav-prev',
      },
      pagination: {
        el: '.news-pagination',
        clickable: true,
        dynamicBullets: true,
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 30,
        }
      }
    })
  }
}

const animateCounters = () => {
  const counters = document.querySelectorAll('.stat-number')
  
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-count'))
    const duration = 2000 // 2 seconds
    const increment = target / (duration / 16) // 60fps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      counter.textContent = Math.floor(current)
    }, 16)
  })
}

onMounted(async () => {
  await fetchHomeData()
  await fetchNews()

  await nextTick()

  initializeBannerSwiper()
  initializePartnersSwiper()
  initializeNewsSwiper()

  setTimeout(() => {
    showSecondImage.value = true
  }, 1000)
  
  setTimeout(() => {
    animateCounters()
  }, 1500)
})

const displayTitle = computed(() => {
  return currentLanguage.value === 'ru'
    ? (homeData.value?.titleru || '')
    : (homeData.value?.title || '')
})

const displayAbout = computed(() => {
  return currentLanguage.value === 'ru'
    ? (homeData.value?.aboutru || '')
    : (homeData.value?.about || '')
})

const formatNewsDate = (date) => {
  if (!date) return ''
  
  const d = date instanceof Date ? date : new Date(date)
  
  if (isNaN(d.getTime())) return ''
  
  return d.toLocaleDateString(currentLanguage.value === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  })
}

const calculateReadTime = (text) => {
  if (!text) return 1
  const wordsPerMinute = 200
  const wordCount = text.split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
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
</script>

<style scoped>
/* Additional styles specific to Home component */
#aboutUsHeader {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

#aboutUsHeader hr {
  flex: 1;
  border: none;
  height: 2px;
  background: linear-gradient(to right, transparent, var(--accent-color), transparent);
}

#aboutUsHeader p {
  margin: 0 20px;
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
}

#aboutUsContent {
  text-align: center;
}

#aboutUsText {
  margin-bottom: 30px;
  font-size: 18px;
  line-height: 1.6;
}

.swiper_banner .swiper-slide img {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.partners-swiper .swiper-slide {
  display: flex;
  align-items: center;
  justify-content: center;
}

.partners-swiper #comp_img img {
  width: 200%;
  height: auto;
  max-height: 700px;
  object-fit: contain;
  transform: scale(1);
  transition: var(--transition);
}

/* News Swiper Styles */
.news-swiper {
  position: relative;
  padding: 20px 0 60px;
  max-width: 100%;
  overflow: hidden;
}

.news-swiper .swiper-slide {
  height: 450px;
  display: flex;
  justify-content: center;
}

.slide {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  transition: var(--transition);
  width: 320px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Navigation buttons */
.news-nav-prev,
.news-nav-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: var(--transition);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.news-nav-prev:hover,
.news-nav-next:hover {
  background: #2980b9;
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.news-nav-prev {
  left: 10px;
}

.news-nav-next {
  right: 10px;
}

.news-nav-prev::after,
.news-nav-next::after {
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  font-size: 16px;
}

.news-nav-prev::after {
  content: '\f053'; /* fa-chevron-left */
}

.news-nav-next::after {
  content: '\f054'; /* fa-chevron-right */
}

/* Pagination */
.news-pagination {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.news-pagination .swiper-pagination-bullet {
  background: #ccc;
  opacity: 1;
  width: 12px;
  height: 12px;
  margin: 0 5px;
  transition: var(--transition);
}

.news-pagination .swiper-pagination-bullet-active {
  background: var(--accent-color);
  transform: scale(1.2);
}

.text-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
  margin-bottom: 15px;
}

.text-wrapper::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(transparent, white);
}

/* Academic Statistics Section */
.academic-stats-section {
  background: var(--light-bg);
  padding: 60px 0;
}

/* Academic Header */
.academic-header {
  text-align: center;
  margin-bottom: 50px;
}

.academic-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.academic-divider {
  width: 60px;
  height: 2px;
  background: var(--accent-color);
  margin: 0 20px;
}

.academic-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
  font-family: 'Roboto', sans-serif;
}

.academic-title i {
  margin-right: 10px;
  color: var(--accent-color);
}

.academic-subtitle {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
  font-style: italic;
  font-weight: 400;
}

/* Academic Stats Grid */
.academic-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  max-width: 900px;
  margin: 0 auto;
}

/* Academic Stat Item */
.academic-stat-item {
  background: var(--white);
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 30px 20px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
}

.academic-stat-item:hover {
  border-color: var(--accent-color);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.1);
}

.academic-stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: var(--accent-color);
}

.stat-icon {
  margin-bottom: 20px;
}

.stat-icon i {
  font-size: 36px;
  color: var(--accent-color);
}

.stat-content {
  position: relative;
}

.stat-number {
  font-size: 42px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 10px;
  line-height: 1;
  font-family: 'Roboto', sans-serif;
}

.stat-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
  line-height: 1.4;
  margin: 0;
}

/* News section styling */
.news-section {
  position: relative;
}

.news-button-container {
  text-align: center;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(52, 152, 219, 0.1);
}

.news-button {
  font-size: 18px;
  padding: 15px 30px;
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.news-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.news-button:hover::before {
  left: 100%;
}

.news-button:hover {
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.news-button i {
  margin-right: 8px;
  transition: transform 0.3s ease;
}

.news-button:hover i {
  transform: translateX(3px);
}

@media (max-width: 768px) {
  #aboutUsHeader {
    flex-direction: column;
    text-align: center;
  }
  
  #aboutUsHeader hr {
    width: 100%;
    margin: 10px 0;
  }
  
  .news-swiper .swiper-slide {
    height: 420px;
  }
  
  .slide {
    width: 280px;
  }
  
  .news-nav-prev,
  .news-nav-next {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
  
  .news-nav-prev {
    left: 5px;
  }
  
  .news-nav-next {
    right: 5px;
  }
  
  .news-button {
    font-size: 16px;
    padding: 12px 25px;
  }
}

@media (max-width: 480px) {
  .news-nav-prev,
  .news-nav-next {
    display: none;
  }
  
  .news-swiper {
    padding: 20px 0 40px;
  }
  
  .news-button-container {
    margin-top: 30px;
    padding-top: 25px;
  }
  
  /* Partners section mobile styles */
  .partners-swiper #comp_img img {
    width: 150%;
    max-height: 400px;
  }
  
  /* Academic statistics section mobile styles */
  .academic-stats-section {
    padding: 40px 0;
  }
  
  .academic-title {
    font-size: 24px;
  }
  
  .academic-subtitle {
    font-size: 14px;
  }
  
  .academic-stats-grid {
    grid-template-columns: 1fr;
    gap: 25px;
  }
  
  .academic-stat-item {
    padding: 25px 15px;
  }
  
  .stat-icon i {
    font-size: 30px;
  }
  
  .stat-number {
    font-size: 36px;
  }
  
  .stat-label {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .academic-title {
    font-size: 20px;
  }
  
  .academic-divider {
    width: 40px;
    margin: 0 15px;
  }
  
  .academic-stat-item {
    padding: 20px 10px;
  }
  
  .stat-number {
    font-size: 32px;
  }
  
  .stat-label {
    font-size: 14px;
  }
}

/* Enhanced News Card Styles */
.slide .thumb {
  position: relative;
  overflow: hidden;
  height: 200px;
  flex-shrink: 0;
}

.news-category-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: var(--accent-color);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  z-index: 2;
}

.news-date-overlay {
  position: absolute;
  bottom: 15px;
  left: 15px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  z-index: 2;
}

.news-date-overlay i {
  margin-right: 5px;
}

.news-header-info {
  margin-bottom: 15px;
  flex-shrink: 0;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 12px;
  color: #888;
}

.news-author,
.news-read-time {
  display: flex;
  align-items: center;
  gap: 5px;
}

.news-author i,
.news-read-time i {
  color: var(--accent-color);
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.news-tags {
  display: flex;
  gap: 8px;
}

.news-tag {
  background: #f8f9fa;
  color: #666;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.news-tag i {
  margin-right: 4px;
  color: var(--accent-color);
}

.btn-read-more {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-read-more:hover {
  background: #2980b9;
}

.btn-read-more i {
  transition: transform 0.3s ease;
}

.btn-read-more:hover i {
  transform: translateX(2px);
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
  flex-wrap: wrap;
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
  .news-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .news-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
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