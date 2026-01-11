<template>
  <BaseLayout>
    <!-- Breadcrumbs -->
    <nav class="breadcrumb" aria-label="breadcrumb">
      <div class="container">
        <router-link to="/" class="breadcrumb-item">
          <i class="fas fa-home"></i> {{ t('Главная', 'Home') }}
        </router-link>
        <span class="breadcrumb-item active">
          <i class="fas fa-handshake"></i> {{ t('Партнёры', 'Partners') }}
        </span>
      </div>
    </nav>

    <section class="section">
      <div class="container">
        <div class="partners-header">
          <h1><i class="fas fa-handshake"></i> {{ t('Партнёры кафедры', 'Department Partners') }}</h1>
          <p>{{ t('Компании и организации, сотрудничающие с кафедрой САПРиУ', 'Companies and organizations cooperating with the SAPRiU department') }}</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('Загрузка партнёров...', 'Loading partners...') }}</p>
        </div>

        <!-- No Partners State -->
        <div v-else-if="!loading && partners.length === 0" class="no-partners">
          <div class="card" style="text-align: center; padding: 40px;">
            <i class="fas fa-handshake" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
            <h3>{{ t('Партнёров пока нет', 'No partners yet') }}</h3>
            <p>{{ t('Информация о партнёрах появится здесь, как только будет добавлена.', 'Partner information will appear here as soon as it is added.') }}</p>
          </div>
        </div>

        <!-- Partners Grid -->
        <div v-else class="partners-grid">
          <div 
            v-for="partner in partners" 
            :key="partner._id || partner.id"
            class="partner-card"
            @click="openPartnerModal(partner)"
          >
            <div class="partner-logo">
              <img 
                :src="partner.logo || partner.image || '/graduate/images/default-partner.png'" 
                :alt="partner.name"
                @error="handleImageError"
              />
            </div>
            <div class="partner-content">
              <h3 class="partner-name">{{ partner.name }}</h3>
              <p class="partner-type" v-if="partner.type">{{ partner.type }}</p>
              <p class="partner-description">{{ truncateText(partner.description, 120) }}</p>
              <div class="partner-meta">
                <span v-if="partner.website" class="partner-website">
                  <i class="fas fa-globe"></i> {{ t('Сайт', 'Website') }}
                </span>
                <span class="view-more">
                  {{ t('Подробнее', 'Details') }} <i class="fas fa-arrow-right"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Default Partners (Fallback) -->
        <div v-if="!loading && partners.length === 0" class="default-partners">
          <div class="partners-grid">
            <div v-for="(logo, index) in defaultLogos" :key="index" class="partner-card simple">
              <div class="partner-logo">
                <img :src="logo" :alt="`Partner ${index + 1}`" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Partner Modal -->
    <div v-if="selectedPartner" class="modal-overlay" @click="closePartnerModal">
      <div class="modal-content partner-modal" @click.stop>
        <button @click="closePartnerModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="modal-header">
          <div class="modal-logo">
            <img 
              :src="selectedPartner.logo || selectedPartner.image || '/graduate/images/default-partner.png'" 
              :alt="selectedPartner.name"
            />
          </div>
          <div class="modal-title">
            <h2>{{ selectedPartner.name }}</h2>
            <p v-if="selectedPartner.type" class="partner-type-modal">{{ selectedPartner.type }}</p>
          </div>
        </div>
        
        <div class="modal-body">
          <div v-if="selectedPartner.description" class="partner-description-full">
            <h4>{{ t('О компании', 'About Company') }}</h4>
            <p v-for="(paragraph, index) in selectedPartner.description.split('\n')" 
               :key="index" 
               v-show="paragraph.trim()">
              {{ paragraph }}
            </p>
          </div>
          
          <div class="partner-details">
            <div v-if="selectedPartner.website" class="detail-item">
              <h5><i class="fas fa-globe"></i> {{ t('Веб-сайт', 'Website') }}</h5>
              <a :href="selectedPartner.website" target="_blank" rel="noopener noreferrer">
                {{ selectedPartner.website }}
              </a>
            </div>
            
            <div v-if="selectedPartner.email" class="detail-item">
              <h5><i class="fas fa-envelope"></i> {{ t('Email', 'Email') }}</h5>
              <a :href="`mailto:${selectedPartner.email}`">{{ selectedPartner.email }}</a>
            </div>
            
            <div v-if="selectedPartner.phone" class="detail-item">
              <h5><i class="fas fa-phone"></i> {{ t('Телефон', 'Phone') }}</h5>
              <span>{{ selectedPartner.phone }}</span>
            </div>
            
            <div v-if="selectedPartner.address" class="detail-item">
              <h5><i class="fas fa-map-marker-alt"></i> {{ t('Адрес', 'Address') }}</h5>
              <span>{{ selectedPartner.address }}</span>
            </div>
            
            <div v-if="selectedPartner.since" class="detail-item">
              <h5><i class="fas fa-calendar"></i> {{ t('Партнёр с', 'Partner since') }}</h5>
              <span>{{ formatYear(selectedPartner.since) }}</span>
            </div>
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

const partners = ref([])
const loading = ref(true)
const error = ref(null)
const selectedPartner = ref(null)

const defaultLogos = [
  '/graduate/images/11.png',
  '/graduate/images/12.png', 
  '/graduate/images/13.png',
  '/graduate/images/14.png',
  '/graduate/images/15.png'
]

const normalizeImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  if (url.startsWith('/images/')) return url.replace('/images/', '/graduate/images/')
  if (url.startsWith('/')) return url
  return '/' + url.replace(/^public\//, '')
}

const fetchPartners = async () => {
  try {
    loading.value = true
    const response = await axios.get('/graduate/api/partners/search')
    
    if (response.data && response.data.partners) {
      partners.value = response.data.partners.map(p => ({
        _id: p._id,
        logo: p.logo ? normalizeImageUrl(p.logo) : p.logo,
        name: p.companyName,
        description: p.about,
        website: p.link,
        type: p.companyFullName,
        since: p.year,
        end_year: p.end_year,
        city: p.country_city
      }))
    } else if (response.data && Array.isArray(response.data)) {
      partners.value = response.data
    } else {
      partners.value = []
    }
  } catch (err) {
    console.error('Error fetching partners:', err)
    error.value = err.message
    partners.value = []
  } finally {
    loading.value = false
  }
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

const formatYear = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.getFullYear()
}

const openPartnerModal = (partner) => {
  selectedPartner.value = partner
  document.body.style.overflow = 'hidden'
}

const closePartnerModal = () => {
  selectedPartner.value = null
  document.body.style.overflow = 'auto'
}

const handleImageError = (event) => {
  event.target.src = '/graduate/images/default-partner.png'
}

onMounted(() => {
  fetchPartners()
})
</script>

<style scoped>
.partners-header {
  text-align: center;
  margin-bottom: 50px;
}

.partners-header h1 {
  font-size: 36px;
  color: var(--primary-color);
  margin-bottom: 15px;
}

.partners-header p {
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

.partners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.partner-card {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  cursor: pointer;
}

.partner-card:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.partner-card.simple {
  cursor: default;
}

.partner-logo {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 20px;
}

.partner-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: var(--transition);
}

.partner-card:hover .partner-logo img {
  opacity: 0.95;
}

.partner-content {
  padding: 25px;
}

.partner-name {
  font-size: 20px;
  color: var(--primary-color);
  margin-bottom: 8px;
  line-height: 1.3;
}

.partner-type {
  color: var(--accent-color);
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.partner-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.partner-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.partner-website {
  color: #888;
  font-size: 14px;
}

.view-more {
  color: var(--accent-color);
  font-weight: 500;
  font-size: 14px;
}

.default-partners {
  margin-top: 50px;
}

.default-partners .partners-grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.default-partners .partner-logo {
  height: 100px;
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
}

.partner-modal {
  background: white;
  border-radius: var(--border-radius);
  max-width: 600px;
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
  display: flex;
  align-items: center;
  padding: 30px 30px 20px;
  border-bottom: 1px solid #eee;
}

.modal-logo {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: var(--border-radius);
  margin-right: 20px;
  flex-shrink: 0;
}

.modal-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.modal-title h2 {
  color: var(--primary-color);
  margin: 0 0 5px 0;
  font-size: 24px;
}

.partner-type-modal {
  color: var(--accent-color);
  font-weight: 500;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 12px;
}

.modal-body {
  padding: 30px;
}

.partner-description-full h4 {
  color: var(--primary-color);
  margin-bottom: 15px;
  font-size: 18px;
}

.partner-description-full p {
  line-height: 1.7;
  margin-bottom: 15px;
  color: #555;
}

.partner-details {
  margin-top: 30px;
}

.detail-item {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-item h5 {
  color: var(--primary-color);
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
}

.detail-item h5 i {
  margin-right: 8px;
  color: var(--accent-color);
  width: 16px;
}

.detail-item a {
  color: var(--accent-color);
  text-decoration: none;
  transition: var(--transition);
}

.detail-item a:hover {
  text-decoration: underline;
}

.detail-item span {
  color: #555;
}

@media (max-width: 768px) {
  .partners-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .partners-header h1 {
    font-size: 28px;
  }
  
  .modal-header {
    flex-direction: column;
    text-align: center;
    padding-bottom: 30px;
  }
  
  .modal-logo {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .modal-body {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .partners-grid {
    grid-template-columns: 1fr;
  }
  
  .partner-meta {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style> 