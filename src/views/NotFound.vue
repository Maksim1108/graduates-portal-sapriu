<template>
  <BaseLayout>
    <section class="section">
      <div class="container">
        <div class="card" style="text-align: center; padding: 60px;">
          <h1 style="font-size: 120px; color: var(--accent-color); margin: 0;">404</h1>
          <h2>{{ t('Страница не найдена', 'Page Not Found') }}</h2>
          <p>{{ t('Запрашиваемая страница не существует или была перемещена.', 'The requested page does not exist or has been moved.') }}</p>
          <router-link to="/" class="btn btn-primary">
            <i class="fas fa-home"></i> {{ t('Вернуться на главную', 'Return to Home') }}
          </router-link>
        </div>
      </div>
    </section>
  </BaseLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
import BaseLayout from '@/components/BaseLayout.vue'

const languageStore = useLanguageStore()
const t = computed(() => languageStore.t)
</script> 