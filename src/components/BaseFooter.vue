<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- Левая панель с информацией о кафедре -->
        <div class="footer-left">
          <!-- Логотип университета -->
          <div class="university-logo">
            <div class="university-logo-circle">
              <img src="/images/techSymb.png" alt="University Logo" class="university-logo-img">
            </div>
            <div class="university-info">
              <h3>Санкт-Петербургский государственный технологический институт</h3>
              <p>(технический университет)</p>
            </div>
          </div>

          <!-- Логотип кафедры -->
          <div class="department-logo">
            <div class="department-logo-box">
              <img src="/images/saprSymbFooter.png" alt="University Logo" class="university-logo-img">
            </div>
            <div class="department-info">
              <h4>Кафедра систем автоматизированного проектирования и управления</h4>
            </div>
          </div>

          <!-- Контактная информация -->
          <div class="contact-info">
            <div class="contact-item">
              <i class="fas fa-envelope"></i>
              <div class="contact-details">
                <span class="contact-label">E-mail кафедры:</span>
                <a href="mailto:CAD_dept@technolog.edu.ru" class="contact-link">CAD_dept@technolog.edu.ru</a>
                <a href="mailto:pnsapr@gmail.com" class="contact-link">pnsapr@gmail.com</a>
              </div>
            </div>
            <div class="contact-item">
              <i class="fas fa-map-marker-alt"></i>
              <div class="contact-details">
                <span class="contact-label">Адрес:</span>
                <span class="contact-text">Московский пр-т., 26, г. Санкт-Петербург</span>
              </div>
            </div>
          </div>

          <!-- Согласие на обработку данных -->
          <div class="data-consent">
            <i class="fas fa-check-circle"></i>
            <a href="/graduate/politic" class="consent-link">Согласие на обработку данных</a>
          </div>
        </div>

        <!-- Правая панель с картой -->
        <div class="footer-right">
          <div id="map" class="map-container"></div>
        </div>
      </div>
      
      <!-- Нижняя часть футера -->
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Кафедра САПРиУ СПбГТИ(ТУ). Все права защищены.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const authStore = useAuthStore()
const languageStore = useLanguageStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentLanguage = computed(() => languageStore.currentLanguage)
const currentYear = computed(() => new Date().getFullYear())

// Инициализация карты
onMounted(() => {
  if (window.ymaps) {
    initMap()
  } else {
    const script = document.createElement('script')
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=YOUR_API_KEY&lang=ru_RU'
    script.onload = initMap
    document.head.appendChild(script)
  }
})

function initMap() {
  const coordinates = [59.918636, 30.319394]
  
  window.ymaps.ready(() => {
    const map = new window.ymaps.Map('map', {
      center: coordinates,
      zoom: 16,
      controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
    })
    
    // Добавляем метку
    const placemark = new window.ymaps.Placemark(coordinates, {
      balloonContent: 'СПбГТИ (ТУ)<br/>Московский пр., 26'
    }, {
      preset: 'islands#redDotIcon'
    })
    
    map.geoObjects.add(placemark)
  })
}
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: var(--white);
  padding: 40px 0 20px;
  margin-top: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 30px;
}

/* Левая панель */
.footer-left {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* Логотип университета */
.university-logo {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
}

.university-logo-circle {
  width: 60px;
  height: 80px;
}

.university-logo-img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.university-info h3 {
  color: var(--white);
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 5px 0;
  line-height: 1.3;
}

.university-info p {
  color: #bdc3c7;
  font-size: 14px;
  margin: 0;
  font-style: italic;
}

/* Логотип кафедры */
.department-logo {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.department-logo-box {
  width: 60px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;;
}

.department-logo-text {
  color: #2c3e50;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 1px;
}

.department-info h4 {
  color: var(--white);
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  line-height: 1.4;
}

/* Контактная информация */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.contact-item i {
  color: var(--accent-color);
  font-size: 16px;
  margin-top: 2px;
  width: 16px;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.contact-label {
  color: var(--white);
  font-weight: 600;
  font-size: 14px;
}

.contact-link {
  color: #3498db;
  text-decoration: none;
  font-size: 14px;
  transition: var(--transition);
}

.contact-link:hover {
  color: var(--white);
  text-decoration: underline;
}

.contact-text {
  color: #bdc3c7;
  font-size: 14px;
}

/* Согласие на обработку данных */
.data-consent {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.data-consent i {
  color: #3498db;
  font-size: 18px;
}

.consent-link {
  color: #3498db;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition);
}

.consent-link:hover {
  color: var(--white);
  text-decoration: underline;
}

/* Правая панель с картой */
.footer-right {
  display: flex;
  justify-content: center;
  align-items: center;
}

.map-container {
  width: 100%;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

/* Нижняя часть футера */
.footer-bottom {
  border-top: 1px solid #34495e;
  padding-top: 20px;
  text-align: center;
}

.footer-bottom p {
  margin: 0;
  color: #95a5a6;
  font-size: 14px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .university-logo {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .department-logo {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .map-container {
    height: 250px;
  }
  
  .university-info h3 {
    font-size: 16px;
  }
  
  .department-info h4 {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }
  
  .footer {
    padding: 30px 0 15px;
  }
  
  .university-logo-circle {
    width: 60px;
    height: 60px;
  }
  
  .university-logo-img {
    width: 35px;
    height: 35px;
  }
  
  .map-container {
    height: 200px;
  }
}
</style> 