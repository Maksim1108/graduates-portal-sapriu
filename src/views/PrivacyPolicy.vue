<template>
  <BaseLayout>
    <!-- Breadcrumbs -->
    <nav class="breadcrumb" aria-label="breadcrumb">
      <div class="container">
        <router-link to="/" class="breadcrumb-item">
          <i class="fas fa-home"></i> {{ t('Главная', 'Home') }}
        </router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">{{ t('Политика конфиденциальности', 'Privacy Policy') }}</span>
      </div>
    </nav>

    <!-- Privacy Policy Content -->
    <section class="privacy-policy-section">
      <div class="container">
        <div class="privacy-policy-header">
          <h1>{{ t('Политика конфиденциальности', 'Privacy Policy') }}</h1>
        </div>
        
        <div class="privacy-policy-content">
          <iframe 
            src="https://drive.google.com/file/d/1fZWhNO_b_eFShh5R6F-dKzTsXKSLCV7n/preview" 
            width="65%" 
            height="720"
            style="display: block; margin: 0 auto;" 
            allow="autoplay"
            title="Политика конфиденциальности"
          >
            {{ t('Ошибка при загрузке документа', 'Error loading document') }}
          </iframe>
        </div>
      </div>
    </section>
  </BaseLayout>
</template>

<script setup>
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

const t = (ru, en) => {
  return languageStore.currentLanguage === 'ru' ? ru : en
}
</script>

<style scoped>
.privacy-policy-section {
  padding: 40px 0;
  min-height: calc(100vh - 200px);
}

.privacy-policy-header {
  text-align: center;
  margin-bottom: 40px;
}

.privacy-policy-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.privacy-policy-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 600px;
}

.privacy-policy-content iframe {
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Breadcrumb styles */
.breadcrumb {
  background-color: #f8f9fa;
  padding: 15px 0;
  margin-bottom: 0;
}

.breadcrumb-item {
  color: #6c757d;
  text-decoration: none;
  font-size: 14px;
}

.breadcrumb-item:hover {
  color: #007bff;
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #495057;
  font-weight: 500;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #6c757d;
}

/* Responsive design */
@media (max-width: 768px) {
  .privacy-policy-content iframe {
    width: 95% !important;
    height: 500px;
  }
  
  .privacy-policy-header h1 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .privacy-policy-content iframe {
    width: 100% !important;
    height: 400px;
  }
  
  .privacy-policy-header h1 {
    font-size: 1.5rem;
  }
}
</style>
