<template>
  <BaseLayout>
    <nav class="breadcrumb" aria-label="breadcrumb">
      <div class="container">
        <router-link to="/" class="breadcrumb-item">
          <i class="fas fa-home"></i> {{ t('Главная', 'Home') }}
        </router-link>
        <span class="breadcrumb-item active">
          <i class="fas fa-cog"></i> {{ t('Панель администратора', 'Admin Panel') }}
        </span>
      </div>
    </nav>

    <section class="section">
      <div class="container">
        <div class="admin-header">
          <h1><i class="fas fa-shield-alt"></i> {{ t('Панель администратора', 'Admin Panel') }}</h1>
          <p>{{ t('Управление контентом и настройками сайта', 'Manage site content and settings') }}</p>
        </div>

        <div class="admin-nav">
          <button 
            v-for="tab in adminTabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['nav-btn', { active: activeTab === tab.id }]"
          >
            <i :class="tab.icon"></i> {{ t(tab.labelRu, tab.labelEn) }}
          </button>
        </div>

        <div v-if="activeTab === 'dashboard'" class="tab-content">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-info">
                <h3>{{ stats.totalUsers }}</h3>
                <p>{{ t('Всего пользователей', 'Total Users') }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-file-alt"></i>
              </div>
              <div class="stat-info">
                <h3>{{ stats.totalForms }}</h3>
                <p>{{ t('Анкет заполнено', 'Forms Completed') }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-newspaper"></i>
              </div>
              <div class="stat-info">
                <h3>{{ stats.totalNews }}</h3>
                <p>{{ t('Новостей опубликовано', 'News Published') }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-images"></i>
              </div>
              <div class="stat-info">
                <h3>{{ stats.totalImages }}</h3>
                <p>{{ t('Изображений в галерее', 'Gallery Images') }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'users'" class="tab-content">
          <div class="card">
            <div class="card-header">
              <h3><i class="fas fa-users"></i> {{ t('Управление пользователями', 'User Management') }}</h3>
              <div class="header-actions">
                <input 
                  type="text" 
                  class="search-input" 
                  v-model="userSearch"
                  :placeholder="t('Поиск пользователей...', 'Search users...')"
                />
              </div>
            </div>

            <div class="table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>{{ t('Email', 'Email') }}</th>
                    <th>{{ t('Роль', 'Role') }}</th>
                    <th>{{ t('Статус анкеты', 'Profile Status') }}</th>
                    <th>{{ t('Дата регистрации', 'Registration Date') }}</th>
                    <th>{{ t('Действия', 'Actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user._id">
                    <td>{{ user.email }}</td>
                    <td>
                      <span :class="['role-badge', user.role]">
                        {{ user.role }}
                      </span>
                    </td>
                    <td>
                      <span :class="['status-badge', user.profileStatus === 'verified' ? 'verified' : 'pending']">
                        {{ user.profileStatus === 'verified' ? t('Проверена', 'Verified') : t('На проверке', 'Pending') }}
                      </span>
                    </td>
                    <td>{{ formatDate(user.createdAt) }}</td>
                    <td>
                      <div class="action-buttons">
                        <button @click="viewUserProfile(user)" class="btn btn-sm btn-info">
                          <i class="fas fa-eye"></i> {{ t('Анкета', 'Profile') }}
                        </button>
                        <button 
                          v-if="user.profileStatus === 'pending'"
                          @click="verifyProfile(user._id)"
                          class="btn btn-sm btn-success"
                          :title="t('Одобрить анкету', 'Approve Profile')"
                        >
                          <i class="fas fa-check"></i>
                        </button>
                        <button 
                          v-if="user.profileStatus === 'verified'"
                          @click="rejectProfile(user._id)"
                          class="btn btn-sm btn-warning"
                          :title="t('Отклонить анкету', 'Reject Profile')"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                        <button @click="deleteUser(user)" class="btn btn-sm btn-danger">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'news'" class="tab-content">
          <div class="card">
            <div class="card-header">
              <h3><i class="fas fa-newspaper"></i> {{ t('Управление новостями', 'News Management') }}</h3>
              <div class="header-actions">
                <button @click="openNewsModal()" class="btn btn-primary">
                  <i class="fas fa-plus"></i> {{ t('Добавить новость', 'Add News') }}
                </button>
              </div>
            </div>

            <div class="news-list">
              <div v-for="newsItem in newsList" :key="newsItem._id" class="news-item">
                <div class="news-image">
                  <img :src="newsItem.images[0] || '/graduate/images/default-news.png'" :alt="newsItem.heading" />
                </div>
                <div class="news-content">
                  <h4>{{ newsItem.heading }}</h4>
                  <p>{{ truncateText(newsItem.text, 150) }}</p>
                  <div class="news-meta">
                    <span>{{ formatDate(newsItem.date) }}</span>
                    <span>{{ t('Автор', 'Author') }}: {{ newsItem.author || 'Admin' }}</span>
                  </div>
                </div>
                <div class="news-actions">
                  <button @click="openNewsModal(newsItem)" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteNews(newsItem)" class="btn btn-sm btn-danger">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'partners'" class="tab-content">
          <div class="card">
            <div class="card-header">
              <h3><i class="fas fa-handshake"></i> {{ t('Управление партнёрами', 'Partners Management') }}</h3>
              <div class="header-actions">
                <button @click="openPartnerModal()" class="btn btn-primary">
                  <i class="fas fa-plus"></i> {{ t('Добавить партнёра', 'Add Partner') }}
                </button>
              </div>
            </div>

            <div class="partners-list">
              <div v-for="partner in partnersList" :key="partner._id" class="partner-item">
                <div class="partner-left">
                  <div class="partner-logo small">
                    <img :src="partner.logo || '/graduate/images/default-partner.png'" :alt="partner.companyName" />
                  </div>
                  <div class="partner-content">
                    <h4 class="partner-title">{{ partner.companyName }}</h4>
                    <div class="partner-meta">
                      <span v-if="partner.country_city"><i class="fas fa-map-marker-alt"></i> {{ partner.country_city }}</span>
                      <span v-if="partner.year"><i class="fas fa-calendar"></i> {{ partner.year }}<span v-if="partner.end_year">–{{ partner.end_year }}</span></span>
                      <a v-if="partner.link" :href="partner.link" target="_blank" rel="noopener" @click.stop>
                        <i class="fas fa-globe"></i>{{ t('Сайт', 'Website') }}
                      </a>
                    </div>
                    <p v-if="partner.projects" class="partner-projects">{{ truncateText(partner.projects, 120) }}</p>
                  </div>
                </div>
                <div class="partner-actions">
                  <button @click="openPartnerModal(partner)" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-edit"></i> {{ t('Редактировать', 'Edit') }}
                  </button>
                  <button @click="deletePartner(partner)" class="btn btn-sm btn-danger">
                    <i class="fas fa-trash"></i> {{ t('Удалить', 'Delete') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'surveys'" class="tab-content">
          <SurveyBuilder 
            v-if="showSurveyBuilder" 
            :editingSurvey="editingSurvey"
            @saved="onSurveySaved"
            @cancel="closeSurveyBuilder"
          />
          
          <SurveyResults 
            v-else-if="viewingSurveyResults"
            :surveyId="viewingSurveyResults"
            @back="closeSurveyResults"
          />
          
          <div v-else class="card">
            <div class="card-header">
              <h3><i class="fas fa-poll"></i> {{ t('Управление опросами', 'Surveys Management') }}</h3>
              <div class="header-actions">
                <button @click="openSurveyBuilder()" class="btn btn-primary">
                  <i class="fas fa-plus"></i> {{ t('Создать опрос', 'Create Survey') }}
                </button>
              </div>
            </div>

            <div v-if="surveysList.length === 0" class="empty-state">
              <i class="fas fa-poll"></i>
              <p>{{ t('Нет созданных опросов', 'No surveys created') }}</p>
            </div>

            <div v-else class="surveys-list">
              <div v-for="survey in surveysList" :key="survey._id" :class="['survey-item', { 'expired': isSurveyExpired(survey) }]">
                <div class="survey-info">
                  <h4>{{ survey.title }}</h4>
                  <p v-if="survey.description">{{ truncateText(survey.description, 100) }}</p>
                  <div class="survey-meta">
                    <span :class="['status-badge', survey.status]">{{ getStatusText(survey.status) }}</span>
                    <span v-if="isSurveyExpired(survey)" class="status-badge expired-badge">
                      <i class="fas fa-clock"></i> {{ t('Истек', 'Expired') }}
                    </span>
                    <span class="meta-item">
                      <i class="fas fa-users"></i> {{ survey.stats?.totalResponses || 0 }} {{ t('ответов', 'responses') }}
                    </span>
                    <span class="meta-item">
                      <i class="fas fa-question-circle"></i> {{ survey.questions?.length || 0 }} {{ t('вопросов', 'questions') }}
                    </span>
                    <span class="meta-item">
                      <i class="fas fa-calendar"></i> {{ formatDate(survey.createdAt) }}
                    </span>
                    <span v-if="survey.settings?.endDate" class="meta-item">
                      <i class="fas fa-calendar-times"></i> {{ t('До', 'Until') }}: {{ formatDate(survey.settings.endDate) }}
                    </span>
                    <span v-if="survey.access.type === 'closed'" class="meta-item">
                      <i class="fas fa-lock"></i> {{ t('Закрытый', 'Closed') }}
                    </span>
                  </div>
                </div>
                <div class="survey-actions">
                  <button @click="viewSurveyResults(survey._id)" class="btn btn-sm btn-info">
                    <i class="fas fa-chart-bar"></i> {{ t('Результаты', 'Results') }}
                  </button>
                  <button @click="openSurveyBuilder(survey)" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-edit"></i> {{ t('Редактировать', 'Edit') }}
                  </button>
                  <button @click="copySurveyLink(survey._id)" class="btn btn-sm btn-success">
                    <i class="fas fa-link"></i> {{ t('Ссылка', 'Link') }}
                  </button>
                  <button @click="deleteSurvey(survey)" class="btn btn-sm btn-danger">
                    <i class="fas fa-trash"></i> {{ t('Удалить', 'Delete') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'gallery'" class="tab-content">
          <div class="card">
            <div class="card-header">
              <h3><i class="fas fa-images"></i> {{ t('Управление галереей', 'Gallery Management') }}</h3>
              <div class="header-actions">
                <input 
                  type="file" 
                  ref="fileInput" 
                  @change="uploadImages" 
                  multiple 
                  accept="image/*" 
                  style="display: none;"
                />
                <button @click="$refs.fileInput.click()" class="btn btn-primary">
                  <i class="fas fa-upload"></i> {{ t('Загрузить изображения', 'Upload Images') }}
                </button>
              </div>
            </div>

            <div class="gallery-grid">
              <div v-for="image in galleryImages" :key="image._id" class="gallery-item">
                <img :src="image.img || image.url || image" :alt="image.title || 'Gallery Image'" />
                <div class="image-overlay">
                  <button @click="deleteImage(image)" class="btn btn-sm btn-danger">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'homepage'" class="tab-content">
          <div class="card">
            <h3><i class="fas fa-home"></i> {{ t('Управление главной страницей', 'Homepage Management') }}</h3>
            
            <form @submit.prevent="saveHomepage">
              <div class="form-group">
                <label>{{ t('Заголовок (Русский)', 'Title (Russian)') }}</label>
                <input type="text" class="form-control" v-model="homepageData.titleru" />
              </div>
              
              <div class="form-group">
                <label>{{ t('Заголовок (Английский)', 'Title (English)') }}</label>
                <input type="text" class="form-control" v-model="homepageData.title" />
              </div>
              
              <div class="form-group">
                <label>{{ t('Описание (Русский)', 'Description (Russian)') }}</label>
                <textarea class="form-control" rows="4" v-model="homepageData.aboutru"></textarea>
              </div>
              
              <div class="form-group">
                <label>{{ t('Описание (Английский)', 'Description (English)') }}</label>
                <textarea class="form-control" rows="4" v-model="homepageData.about"></textarea>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-save"></i> {{ t('Сохранить', 'Save') }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div v-if="activeTab === 'settings'" class="tab-content">
          <div class="card">
            <h3><i class="fas fa-cog"></i> {{ t('Системные настройки', 'System Settings') }}</h3>
            
            <div class="settings-grid">
              <div class="setting-item">
                <label>{{ t('Название сайта', 'Site Name') }}</label>
                <input type="text" class="form-control" v-model="siteSettings.siteName" />
              </div>
              
              <div class="setting-item">
                <label>{{ t('Email администратора', 'Admin Email') }}</label>
                <input type="email" class="form-control" v-model="siteSettings.adminEmail" />
              </div>
              
              <div class="setting-item">
                <label>{{ t('Максимальный размер файла (MB)', 'Max File Size (MB)') }}</label>
                <input type="number" class="form-control" v-model="siteSettings.maxFileSize" />
              </div>
              
              <div class="setting-item">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="siteSettings.enableRegistration" />
                  {{ t('Разрешить регистрацию', 'Enable Registration') }}
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button @click="saveSettings" class="btn btn-primary">
                <i class="fas fa-save"></i> {{ t('Сохранить настройки', 'Save Settings') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div v-if="showNewsModal" class="modal-overlay" @click="closeNewsModal">
      <div class="modal-content" @click.stop>
        <button @click="closeNewsModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
        
        <h3>{{ editingNews ? t('Редактировать новость', 'Edit News') : t('Добавить новость', 'Add News') }}</h3>
        
        <form @submit.prevent="saveNews">
          <div class="form-group">
            <label>{{ t('Заголовок', 'Headline') }}</label>
            <input type="text" class="form-control" v-model="newsForm.heading" required />
          </div>
          
          <div class="form-group">
            <label>{{ t('Текст новости', 'News Text') }}</label>
            <textarea class="form-control" rows="6" v-model="newsForm.text" required></textarea>
          </div>
          
          <div class="form-group">
            <label>{{ t('Автор', 'Author') }}</label>
            <input type="text" class="form-control" v-model="newsForm.author" />
          </div>

          <div class="form-group">
            <label>{{ t('Дата', 'Date') }}</label>
            <input type="date" class="form-control" v-model="newsForm.date" />
          </div>

          <div class="form-group">
            <label>{{ t('Фотография', 'Photo') }}</label>
            <div v-if="newsForm.images && newsForm.images.length" class="news-image" style="width: 100%; height: auto;">
              <img :src="newsForm.images[0]" :alt="newsForm.heading || 'news'" style="max-width: 100%; height: auto; border-radius: var(--border-radius);" />
            </div>
            <input ref="newsFileInput" type="file" accept="image/*" style="display:none" @change="onNewsImageChange" />
            <div class="form-actions" style="margin-top: 10px;">
              <button type="button" class="btn btn-outline-primary" @click="$refs.newsFileInput.click()">
                <i class="fas fa-upload"></i> {{ newsForm.images && newsForm.images.length ? t('Заменить фото', 'Replace Photo') : t('Загрузить фото', 'Upload Photo') }}
              </button>
              <button v-if="newsForm.images && newsForm.images.length" type="button" class="btn btn-secondary" @click="removeNewsImage">
                <i class="fas fa-times"></i> {{ t('Удалить фото', 'Remove Photo') }}
              </button>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> {{ t('Сохранить', 'Save') }}
            </button>
            <button type="button" @click="closeNewsModal" class="btn btn-secondary">
              {{ t('Отмена', 'Cancel') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showPartnerModal" class="modal-overlay" @click="closePartnerModal">
      <div class="modal-content" @click.stop>
        <button @click="closePartnerModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
        
        <h3>{{ editingPartner ? t('Редактировать партнёра', 'Edit Partner') : t('Добавить партнёра', 'Add Partner') }}</h3>
        
        <form @submit.prevent="savePartner">
          <div class="form-group">
            <label>{{ t('Логотип', 'Logo') }}</label>
            <div v-if="partnerForm.logo" class="partner-logo" style="width: 120px;">
              <img :src="partnerForm.logo" alt="logo" style="max-width:100%; height:auto; border-radius: var(--border-radius);" />
            </div>
            <input ref="partnerLogoInput" type="file" accept="image/*" style="display:none" @change="onPartnerLogoChange" />
            <div class="form-actions" style="margin-top: 10px;">
              <button type="button" class="btn btn-outline-primary" @click="$refs.partnerLogoInput.click()">
                <i class="fas fa-upload"></i> {{ partnerForm.logo ? t('Заменить логотип', 'Replace Logo') : t('Загрузить логотип', 'Upload Logo') }}
              </button>
              <button v-if="partnerForm.logo" type="button" class="btn btn-secondary" @click="removePartnerLogo">
                <i class="fas fa-times"></i> {{ t('Удалить логотип', 'Remove Logo') }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('Короткое название', 'Company Name') }}</label>
            <input type="text" class="form-control" v-model="partnerForm.companyName" required />
          </div>

          <div class="form-group">
            <label>{{ t('Полное название', 'Full Company Name') }}</label>
            <input type="text" class="form-control" v-model="partnerForm.companyFullName" />
          </div>

          <div class="form-group">
            <label>{{ t('Город/Страна', 'City/Country') }}</label>
            <input type="text" class="form-control" v-model="partnerForm.country_city" />
          </div>

          <div class="form-group">
            <label>{{ t('Представитель', 'Representative') }}</label>
            <input type="text" class="form-control" v-model="partnerForm.represent_name" />
          </div>

          <div class="form-group">
            <label>{{ t('Год начала сотрудничества', 'Start Year') }}</label>
            <input type="number" class="form-control" v-model="partnerForm.year" />
          </div>

          <div class="form-group">
            <label>{{ t('Год окончания', 'End Year') }}</label>
            <input type="number" class="form-control" v-model="partnerForm.end_year" />
          </div>

          <div class="form-group">
            <label>{{ t('Проекты', 'Projects') }}</label>
            <textarea class="form-control" rows="3" v-model="partnerForm.projects"></textarea>
          </div>

          <div class="form-group">
            <label>{{ t('Описание', 'About') }}</label>
            <textarea class="form-control" rows="4" v-model="partnerForm.about"></textarea>
          </div>

          <div class="form-group">
            <label>{{ t('Сайт', 'Website') }}</label>
            <input type="url" class="form-control" v-model="partnerForm.link" />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> {{ t('Сохранить', 'Save') }}
            </button>
            <button type="button" @click="closePartnerModal" class="btn btn-secondary">
              {{ t('Отмена', 'Cancel') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showProfileModal" class="modal-overlay" @click="closeProfileModal">
      <div class="modal-content profile-modal" @click.stop>
        <button @click="closeProfileModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
        
        <h3><i class="fas fa-user"></i> {{ t('Анкета пользователя', 'User Profile') }}</h3>
        
        <div v-if="selectedUserProfile" class="profile-content">
          <div class="profile-section">
            <h4><i class="fas fa-info-circle"></i> {{ t('Информация о пользователе', 'User Information') }}</h4>
            <div class="profile-grid">
              <div class="profile-item">
                <label>{{ t('Email', 'Email') }}:</label>
                <span>{{ selectedUserProfile.user.email }}</span>
              </div>
              <div class="profile-item">
                <label>{{ t('Роль', 'Role') }}:</label>
                <span :class="['role-badge', selectedUserProfile.user.role]">{{ selectedUserProfile.user.role }}</span>
              </div>
              <div class="profile-item">
                <label>{{ t('Статус', 'Status') }}:</label>
                <span :class="['status-badge', selectedUserProfile.user.active ? 'active' : 'inactive']">
                  {{ selectedUserProfile.user.active ? t('Активен', 'Active') : t('Неактивен', 'Inactive') }}
                </span>
              </div>
              <div class="profile-item">
                <label>{{ t('Дата регистрации', 'Registration Date') }}:</label>
                <span>{{ formatDate(selectedUserProfile.user.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedUserProfile.profile" class="profile-section">
            <h4><i class="fas fa-file-alt"></i> {{ t('Данные анкеты', 'Profile Data') }}</h4>
            
            <div class="profile-subsection">
              <h5>{{ t('Личная информация', 'Personal Information') }}</h5>
              <div class="profile-grid">
                <div class="profile-item" v-if="selectedUserProfile.profile.name">
                  <label>{{ t('Имя', 'Name') }}:</label>
                  <span>{{ selectedUserProfile.profile.name }}</span>
                </div>
                <div class="profile-item" v-if="selectedUserProfile.profile.surname">
                  <label>{{ t('Фамилия', 'Surname') }}:</label>
                  <span>{{ selectedUserProfile.profile.surname }}</span>
                </div>
                <div class="profile-item" v-if="selectedUserProfile.profile.patronymic">
                  <label>{{ t('Отчество', 'Patronymic') }}:</label>
                  <span>{{ selectedUserProfile.profile.patronymic }}</span>
                </div>
                <div class="profile-item" v-if="selectedUserProfile.profile.birthday">
                  <label>{{ t('Дата рождения', 'Birthday') }}:</label>
                  <span>{{ selectedUserProfile.profile.birthday }}</span>
                </div>
                <div class="profile-item" v-if="selectedUserProfile.profile.phone_number">
                  <label>{{ t('Телефон', 'Phone') }}:</label>
                  <span>{{ selectedUserProfile.profile.phone_number }}</span>
                </div>
                <div class="profile-item" v-if="selectedUserProfile.profile.city">
                  <label>{{ t('Город', 'City') }}:</label>
                  <span>{{ selectedUserProfile.profile.city }}</span>
                </div>
              </div>
            </div>

            <div class="profile-subsection" v-if="selectedUserProfile.profile.photo">
              <h5>{{ t('Фотография', 'Photo') }}</h5>
              <div class="profile-photo">
                <img :src="selectedUserProfile.profile.photo" :alt="t('Фото пользователя', 'User Photo')" />
              </div>
            </div>

            <div class="profile-subsection" v-if="selectedUserProfile.profile.education && selectedUserProfile.profile.education.length">
              <h5>{{ t('Образование на кафедре САПРиУ', 'Education at SAPR Department') }}</h5>
              <div v-for="(edu, index) in selectedUserProfile.profile.education" :key="index" class="education-item">
                <div class="profile-grid">
                  <div class="profile-item" v-if="edu.year_graduation">
                    <label>{{ t('Год выпуска', 'Graduation Year') }}:</label>
                    <span>{{ edu.year_graduation }}</span>
                  </div>
                  <div class="profile-item" v-if="edu.educ_form">
                    <label>{{ t('Форма обучения', 'Education Form') }}:</label>
                    <span>{{ edu.educ_form }}</span>
                  </div>
                  <div class="profile-item" v-if="edu.qualification">
                    <label>{{ t('Квалификация', 'Qualification') }}:</label>
                    <span>{{ edu.qualification }}</span>
                  </div>
                  <div class="profile-item" v-if="edu.specialty">
                    <label>{{ t('Специальность', 'Specialty') }}:</label>
                    <span>{{ edu.specialty }}</span>
                  </div>
                  <div class="profile-item" v-if="edu.dir_training">
                    <label>{{ t('Направление подготовки', 'Training Direction') }}:</label>
                    <span>{{ edu.dir_training }}</span>
                  </div>
                  <div class="profile-item" v-if="edu.focus">
                    <label>{{ t('Направленность', 'Focus') }}:</label>
                    <span>{{ edu.focus }}</span>
                  </div>
                  <div class="profile-item" v-if="edu.group">
                    <label>{{ t('Номер группы', 'Group Number') }}:</label>
                    <span>{{ edu.group }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="profile-subsection">
              <h5>{{ t('Рабочая информация', 'Work Information') }}</h5>
              <div class="profile-grid">
                <div class="profile-item" v-if="selectedUserProfile.profile.work_place">
                  <label>{{ t('Место работы', 'Work Place') }}:</label>
                  <span>{{ selectedUserProfile.profile.work_place }}</span>
                </div>
                <div class="profile-item" v-if="selectedUserProfile.profile.position">
                  <label>{{ t('Должность', 'Position') }}:</label>
                  <span>{{ selectedUserProfile.profile.position }}</span>
                </div>
                <div class="profile-item" v-if="selectedUserProfile.profile.field_activety">
                  <label>{{ t('Сфера деятельности', 'Field of Activity') }}:</label>
                  <span>{{ selectedUserProfile.profile.field_activety }}</span>
                </div>
                <div class="profile-item" v-if="selectedUserProfile.profile.academ_degree">
                  <label>{{ t('Учёная степень', 'Academic Degree') }}:</label>
                  <span>{{ selectedUserProfile.profile.academ_degree }}</span>
                </div>
                <div class="profile-item" v-if="selectedUserProfile.profile.academ_rank">
                  <label>{{ t('Учёное звание', 'Academic Rank') }}:</label>
                  <span>{{ selectedUserProfile.profile.academ_rank }}</span>
                </div>
              </div>
            </div>

            <div class="profile-subsection">
              <h5>{{ t('Дополнительная информация', 'Additional Information') }}</h5>
              <div class="profile-grid">
                <div class="profile-item" v-if="selectedUserProfile.profile.hobby">
                  <label>{{ t('Хобби', 'Hobby') }}:</label>
                  <span>{{ selectedUserProfile.profile.hobby }}</span>
                </div>
                <div class="profile-item" v-if="selectedUserProfile.profile.other_education">
                  <label>{{ t('Дополнительное образование', 'Additional Education') }}:</label>
                  <span>{{ selectedUserProfile.profile.other_education }}</span>
                </div>
                <div class="profile-item" v-if="selectedUserProfile.profile.best_practices">
                  <label>{{ t('Лучшие практики', 'Best Practices') }}:</label>
                  <span>{{ selectedUserProfile.profile.best_practices }}</span>
                </div>
              </div>
            </div>

            <div class="profile-subsection" v-if="selectedUserProfile.profile.social_network && selectedUserProfile.profile.social_network.length">
              <h5>{{ t('Социальные сети', 'Social Networks') }}</h5>
              <div v-for="(social, index) in selectedUserProfile.profile.social_network" :key="index" class="social-item">
                <div class="profile-grid">
                  <div class="profile-item" v-if="social.network_name">
                    <label>{{ t('Сеть', 'Network') }}:</label>
                    <span>{{ social.network_name }}</span>
                  </div>
                  <div class="profile-item" v-if="social.url">
                    <label>{{ t('Ссылка', 'URL') }}:</label>
                    <span><a :href="social.url" target="_blank" rel="noopener">{{ social.url }}</a></span>
                  </div>
                </div>
              </div>
            </div>

            <div class="profile-subsection">
              <h5>{{ t('Ответы на вопросы', 'Question Answers') }}</h5>
              <div class="questions-list">
                <div class="question-item" v-if="selectedUserProfile.profile.q1 && selectedUserProfile.profile.q1.length">
                  <label>{{ t('Поддерживаете ли Вы отношения с другими выпускниками СПбГТИ?', 'Do you maintain relationships with other SPbGTI graduates?') }}</label>
                  <p>{{ selectedUserProfile.profile.q1.join('; ') }}</p>
                </div>
                <div class="question-item" v-if="selectedUserProfile.profile.q2 && selectedUserProfile.profile.q2.length">
                  <label>{{ t('Чем может быть полезен университет для Вашей деятельности?', 'How can the university be useful for your activities?') }}</label>
                  <p>{{ selectedUserProfile.profile.q2.join('; ') }}</p>
                </div>
                <div class="question-item" v-if="selectedUserProfile.profile.q3">
                  <label>{{ t('Чем Ассоциация выпускников может быть Вам полезна?', 'How can the Alumni Association be useful to you?') }}</label>
                  <p>{{ selectedUserProfile.profile.q3 }}</p>
                </div>
                <div class="question-item" v-if="selectedUserProfile.profile.q4 && selectedUserProfile.profile.q4.length">
                  <label>{{ t('Можете ли Вы оказать содействие в развитии университета?', 'Can you assist in the development of the university?') }}</label>
                  <p>{{ selectedUserProfile.profile.q4.join('; ') }}</p>
                </div>
                <div class="question-item" v-if="selectedUserProfile.profile.q5 && selectedUserProfile.profile.q5.length">
                  <label>{{ t('Есть ли у вас материалы для музея истории университета?', 'Do you have materials for the university history museum?') }}</label>
                  <p>{{ selectedUserProfile.profile.q5.join('; ') }}</p>
                </div>
                <div class="question-item" v-if="selectedUserProfile.profile.q6">
                  <label>{{ t('Дополнительные сведения', 'Additional Information') }}</label>
                  <p>{{ selectedUserProfile.profile.q6 }}</p>
                </div>
                <div class="question-item" v-if="selectedUserProfile.profile.q7">
                  <label>{{ t('Участие в праздничном концерте', 'Participation in Anniversary Concert') }}</label>
                  <p>{{ selectedUserProfile.profile.q7 }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="profile-section">
            <div class="no-profile">
              <i class="fas fa-file-alt"></i>
              <p>{{ t('Анкета не заполнена', 'Profile not filled') }}</p>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import BaseLayout from '@/components/BaseLayout.vue'
import SurveyBuilder from '@/components/SurveyBuilder.vue'
import SurveyResults from '@/components/SurveyResults.vue'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

const t = computed(() => languageStore.t)

const activeTab = ref('dashboard')
const stats = ref({
  totalUsers: 0,
  totalForms: 0,
  totalNews: 0,
  totalImages: 0
})

const users = ref([])
const userSearch = ref('')
const newsList = ref([])
const galleryImages = ref([])
const recentActivity = ref([])

const partnersList = ref([])
const showPartnerModal = ref(false)
const editingPartner = ref(null)
const partnerForm = ref({
  logo: '',
  companyFullName: '',
  companyName: '',
  country_city: '',
  represent_name: '',
  year: '',
  end_year: '',
  projects: '',
  about: '',
  link: '',
  vacancies: [],
  forsearch: []
})
const partnerLogoInput = ref(null)

const homepageData = ref({
  titleru: '',
  title: '',
  aboutru: '',
  about: '',
  images: []
})

const siteSettings = ref({
  siteName: '',
  adminEmail: '',
  maxFileSize: 5,
  enableRegistration: true
})

const showNewsModal = ref(false)
const editingNews = ref(null)
const newsForm = ref({
  heading: '',
  text: '',
  author: '',
  images: []
})

const newsFileInput = ref(null)

const showProfileModal = ref(false)
const selectedUserProfile = ref(null)

const surveysList = ref([])
const showSurveyBuilder = ref(false)
const editingSurvey = ref(null)
const viewingSurveyResults = ref(null)

const adminTabs = [
  { id: 'dashboard', labelRu: 'Дашборд', labelEn: 'Dashboard', icon: 'fas fa-dashboard' },
  { id: 'homepage', labelRu: 'Главная страница', labelEn: 'Homepage', icon: 'fas fa-home' },
  { id: 'users', labelRu: 'Пользователи', labelEn: 'Users', icon: 'fas fa-users' },
  { id: 'surveys', labelRu: 'Опросы', labelEn: 'Surveys', icon: 'fas fa-poll' },
  { id: 'news', labelRu: 'Новости', labelEn: 'News', icon: 'fas fa-newspaper' },
  { id: 'partners', labelRu: 'Партнёры', labelEn: 'Partners', icon: 'fas fa-handshake' },
  { id: 'gallery', labelRu: 'Галерея', labelEn: 'Gallery', icon: 'fas fa-images' }, 
]

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  
  return users.value.filter(user => 
    user.email.toLowerCase().includes(userSearch.value.toLowerCase())
  )
})

const fetchStats = async () => {
  try {
    const response = await axios.get('/graduate/api/admin/stats')
    if (response.data) {
      stats.value = {
        totalUsers: response.data.totalUsers ?? 0,
        totalForms: response.data.totalForms ?? 0,
        totalNews: response.data.totalNews ?? 0,
        totalImages: response.data.totalImages ?? 0
      }
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const fetchUsers = async () => {
  try {
    const response = await axios.get('/graduate/api/admin/users-with-profiles')
    if (response.data && response.data.users) {
      users.value = response.data.users.map(user => ({
        ...user,
        profileStatus: user.profileStatus || 'pending'
      }))
    }
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const fetchNews = async () => {
  try {
    const response = await axios.get('/graduate/api/news/get')
    if (response.data && response.data.news) {
      newsList.value = response.data.news
    }
  } catch (error) {
    console.error('Error fetching news:', error)
  }
}

const fetchGallery = async () => {
  try {
    const response = await axios.get('/graduate/api/gallery/get_all')
    if (response.data && response.data.photos) {
      galleryImages.value = response.data.photos.map(p => ({
        _id: p._id || p?._doc?._id,
        img: p.img || p?._doc?.img
      }))
    }
  } catch (error) {
    console.error('Error fetching gallery:', error)
  }
}

const fetchPartners = async () => {
  try {
    const response = await axios.get('/graduate/api/partners/search')
    if (response.data && response.data.partners) {
      partnersList.value = response.data.partners
    }
  } catch (error) {
    console.error('Error fetching partners:', error)
  }
}

const fetchHomepage = async () => {
  try {
    const response = await axios.get('/graduate/api/get_homepage')
    if (response.data) {
      homepageData.value = response.data
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
  }
}

const toggleUserStatus = async (user) => {
  try {
    const response = await axios.post(`/graduate/api/admin/users/${user._id}/toggle-status`)
    if (response.data && response.data.success) {
      user.active = !user.active
    }
  } catch (error) {
    console.error('Error toggling user status:', error)
  }
}

const deleteUser = async (user) => {
  if (!confirm(t.value('Вы уверены, что хотите удалить этого пользователя?', 'Are you sure you want to delete this user?'))) {
    return
  }

  try {
    const response = await axios.delete(`/graduate/api/admin/users/${user._id}`)
    if (response.data && response.data.success) {
      users.value = users.value.filter(u => u._id !== user._id)
    }
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

const openNewsModal = (news = null) => {
  editingNews.value = news
  if (news) {
    newsForm.value = { 
      ...news,
      date: news?.date ? new Date(news.date).toISOString().split('T')[0] : ''
    }
  } else {
    newsForm.value = {
      heading: '',
      text: '',
      author: '',
      images: [],
      date: new Date().toISOString().split('T')[0]
    }
  }
  showNewsModal.value = true
}

const closeNewsModal = () => {
  showNewsModal.value = false
  editingNews.value = null
}

const saveNews = async () => {
  try {
    let response
    if (editingNews.value) {
      response = await axios.put(`/graduate/api/news/${editingNews.value._id}`, newsForm.value)
    } else {
      response = await axios.post('/graduate/api/news', newsForm.value)
    }

    if (response.status === 200 || response.status === 201) {
      closeNewsModal()
      fetchNews()
    }
  } catch (error) {
    console.error('Error saving news:', error)
  }
}

const onNewsImageChange = (event) => {
  const file = event.target.files && event.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onloadend = () => {
    newsForm.value.images = [reader.result]
  }
  reader.readAsDataURL(file)
}

const removeNewsImage = () => {
  newsForm.value.images = []
  if (newsFileInput.value) {
    newsFileInput.value.value = ''
  }
}

const deleteNews = async (news) => {
  if (!confirm(t.value('Вы уверены, что хотите удалить эту новость?', 'Are you sure you want to delete this news?'))) {
    return
  }

  try {
    const response = await axios.delete(`/graduate/api/news/${news._id}`)
    if (response.status === 204 || response.status === 200) {
      newsList.value = newsList.value.filter(n => n._id !== news._id)
    }
  } catch (error) {
    console.error('Error deleting news:', error)
  }
}

const uploadImages = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  try {
    const formData = new FormData()
    
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i])
    }

    formData.append('comment', 'Admin upload')

    const response = await axios.post('/graduate/api/gallery/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data.success) {
      showMessage(t.value('Изображения успешно загружены', 'Images uploaded successfully'), 'success')
      await fetchGallery()
    } else {
      throw new Error(response.data.message || 'Upload failed')
    }
  } catch (error) {
    console.error('Error uploading images:', error)
    showMessage(
      error.response?.data?.message || t.value('Ошибка загрузки изображений', 'Error uploading images'), 
      'error'
    )
  } finally {
    if (event.target) {
      event.target.value = ''
    }
  }
}

const deleteImage = async (image) => {
  if (!image || !image._id) return
  if (!confirm(t.value('Удалить это изображение?', 'Delete this image?'))) return

  try {
    const response = await axios.delete(`/graduate/api/gallery/${image._id}`)
    if (response.status === 204 || response.status === 200) {
      galleryImages.value = galleryImages.value.filter(i => i._id !== image._id)
    }
  } catch (error) {
    console.error('Error deleting image:', error)
  }
}

const openPartnerModal = (partner = null) => {
  editingPartner.value = partner
  if (partner) {
    partnerForm.value = { ...partner }
  } else {
    partnerForm.value = {
      logo: '', companyFullName: '', companyName: '', country_city: '',
      represent_name: '', year: '', end_year: '', projects: '', about: '', link: '',
      vacancies: [], forsearch: []
    }
  }
  showPartnerModal.value = true
}

const closePartnerModal = () => {
  showPartnerModal.value = false
  editingPartner.value = null
}

const onPartnerLogoChange = (event) => {
  const file = event.target.files && event.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onloadend = () => {
    partnerForm.value.logo = reader.result
  }
  reader.readAsDataURL(file)
}

const removePartnerLogo = () => {
  partnerForm.value.logo = ''
  if (partnerLogoInput.value) partnerLogoInput.value.value = ''
}

const savePartner = async () => {
  try {
    let response
    if (editingPartner.value && editingPartner.value._id) {
      response = await axios.put(`/graduate/api/partners/${editingPartner.value._id}`, partnerForm.value)
    } else {
      response = await axios.post('/graduate/api/partners', partnerForm.value)
    }
    if (response.status === 200 || response.status === 201) {
      closePartnerModal()
      fetchPartners()
    }
  } catch (error) {
    console.error('Error saving partner:', error)
  }
}

const deletePartner = async (partner) => {
  if (!partner || !partner._id) return
  if (!confirm(t.value('Удалить партнёра?', 'Delete partner?'))) return
  try {
    const response = await axios.delete(`/graduate/api/partners/${partner._id}`)
    if (response.status === 204 || response.status === 200) {
      partnersList.value = partnersList.value.filter(p => p._id !== partner._id)
    }
  } catch (error) {
    console.error('Error deleting partner:', error)
  }
}

const saveHomepage = async () => {
  try {
    const response = await axios.post('/graduate/api/admin/update_homepage', homepageData.value)
    if (response.status === 200) {
      alert(t.value('Данные главной страницы сохранены', 'Homepage data saved'))
    }
  } catch (error) {
    console.error('Error saving homepage:', error)
  }
}

const saveSettings = async () => {
  try {
    const response = await axios.post('/graduate/api/admin/settings', siteSettings.value)
    if (response.data && response.data.success) {
      alert(t.value('Настройки сохранены', 'Settings saved'))
    }
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

const viewUserProfile = async (user) => {
  try {
    const response = await axios.get(`/graduate/api/admin/users/${user._id}/profile`)
    if (response.data && response.data.success) {
      selectedUserProfile.value = response.data
      showProfileModal.value = true
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    alert(t.value('Ошибка при загрузке анкеты пользователя', 'Error loading user profile'))
  }
}

const closeProfileModal = () => {
  showProfileModal.value = false
  selectedUserProfile.value = null
}

const verifyProfile = async (userId) => {
  try {
    const response = await axios.post(`/graduate/api/admin/verify-profile/${userId}`, { verified: true })
    if (response.data && response.data.success) {
      // Обновляем статус в локальных данных
      const userIndex = users.value.findIndex(u => u._id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].profileStatus = 'verified'
      }
      // Обновляем статус в модальном окне, если оно открыто
      if (selectedUserProfile.value && selectedUserProfile.value.profile) {
        selectedUserProfile.value.profile.status_verified = true
      }
      alert(t.value('Анкета одобрена', 'Profile approved'))
    }
  } catch (error) {
    console.error('Error verifying profile:', error)
    alert(t.value('Ошибка при одобрении анкеты', 'Error approving profile'))
  }
}

const rejectProfile = async (userId) => {
  try {
    const response = await axios.post(`/graduate/api/admin/verify-profile/${userId}`, { verified: false })
    if (response.data && response.data.success) {
      // Обновляем статус в локальных данных
      const userIndex = users.value.findIndex(u => u._id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].profileStatus = 'pending'
      }
      // Обновляем статус в модальном окне, если оно открыто
      if (selectedUserProfile.value && selectedUserProfile.value.profile) {
        selectedUserProfile.value.profile.status_verified = false
      }
      alert(t.value('Анкета отклонена', 'Profile rejected'))
    }
  } catch (error) {
    console.error('Error rejecting profile:', error)
    alert(t.value('Ошибка при отклонении анкеты', 'Error rejecting profile'))
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(languageStore.currentLanguage === 'ru' ? 'ru-RU' : 'en-US')
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

const message = ref('')
const messageType = ref('success')

const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

const fetchSurveys = async () => {
  try {
    const response = await axios.get('/graduate/api/surveys/admin/surveys')
    if (response.data && response.data.success) {
      surveysList.value = response.data.surveys
    }
  } catch (error) {
    console.error('Error fetching surveys:', error)
  }
}

const openSurveyBuilder = (survey = null) => {
  editingSurvey.value = survey
  showSurveyBuilder.value = true
}

const closeSurveyBuilder = () => {
  showSurveyBuilder.value = false
  editingSurvey.value = null
}

const onSurveySaved = () => {
  closeSurveyBuilder()
  fetchSurveys()
}

const viewSurveyResults = (surveyId) => {
  viewingSurveyResults.value = surveyId
}

const closeSurveyResults = () => {
  viewingSurveyResults.value = null
  fetchSurveys()
}

const copySurveyLink = (surveyId) => {
  const link = `${window.location.origin}/graduate/surveys/${surveyId}`
  navigator.clipboard.writeText(link).then(() => {
    alert(t.value('Ссылка скопирована в буфер обмена', 'Link copied to clipboard'))
  }).catch(() => {
    prompt(t.value('Скопируйте ссылку:', 'Copy link:'), link)
  })
}

const deleteSurvey = async (survey) => {
  if (!confirm(t.value('Вы уверены, что хотите удалить этот опрос? Все ответы также будут удалены.', 'Are you sure you want to delete this survey? All responses will also be deleted.'))) {
    return
  }

  try {
    const response = await axios.delete(`/graduate/api/surveys/admin/surveys/${survey._id}`)
    if (response.data && response.data.success) {
      surveysList.value = surveysList.value.filter(s => s._id !== survey._id)
      showMessage(t.value('Опрос успешно удалён', 'Survey deleted successfully'), 'success')
    }
  } catch (error) {
    console.error('Error deleting survey:', error)
    showMessage(t.value('Ошибка при удалении опроса', 'Error deleting survey'), 'error')
  }
}

const getStatusText = (status) => {
  const texts = {
    'draft': t.value('Черновик', 'Draft'),
    'published': t.value('Опубликован', 'Published'),
    'closed': t.value('Закрыт', 'Closed')
  }
  return texts[status] || status
}

const isSurveyExpired = (survey) => {
  if (!survey.settings?.endDate) return false
  const endDate = new Date(survey.settings.endDate)
  const now = new Date()
  return now > endDate
}

onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    router.push('/')
    return
  }

  fetchStats()
  fetchUsers()
  fetchNews()
  fetchGallery()
  fetchHomepage()
  fetchPartners()
  fetchSurveys()
})
</script>

<style scoped>
.admin-header {
  text-align: center;
  margin-bottom: 40px;
}

.admin-header h1 {
  font-size: 36px;
  color: var(--primary-color);
  margin-bottom: 15px;
}

.admin-header p {
  font-size: 18px;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.admin-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
  padding-bottom: 20px;
}

.nav-btn {
  background: none;
  border: none;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: var(--transition);
  border-radius: var(--border-radius);
  white-space: nowrap;
}

.nav-btn:hover,
.nav-btn.active {
  background: var(--accent-color);
  color: white;
}

.nav-btn i {
  margin-right: 8px;
}

.tab-content {
  min-height: 500px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-info h3 {
  font-size: 28px;
  color: var(--primary-color);
  margin: 0 0 5px 0;
}

.stat-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  margin: 0;
  color: var(--primary-color);
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  width: 200px;
}

.table-container {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.admin-table th,
.admin-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.admin-table th {
  background: var(--light-bg);
  font-weight: 600;
  color: var(--primary-color);
}

.role-badge,
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.role-badge.admin {
  background: #dc3545;
  color: white;
}

.role-badge.user {
  background: var(--accent-color);
  color: white;
}

.status-badge.verified {
  background: #28a745;
  color: white;
}

.status-badge.pending {
  background: #ffc107;
  color: #212529;
}

.action-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.action-buttons .btn {
  min-width: 32px;
  padding: 4px 8px;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.news-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.news-item:hover {
  box-shadow: var(--box-shadow);
}

.news-image {
  width: 120px;
  height: 80px;
  flex-shrink: 0;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.news-content {
  flex: 1;
}

.news-content h4 {
  color: var(--primary-color);
  margin-bottom: 10px;
}

.news-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #666;
  margin-top: 10px;
}

.news-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

/* Partners admin styles */
.partners-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.partner-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.partner-item:hover { box-shadow: var(--box-shadow); }

.partner-left { display: flex; align-items: center; gap: 20px; }

.partner-logo.small { width: 80px; height: 80px; border-radius: 10px; overflow: hidden; background: #fafafa; display:flex; align-items:center; justify-content:center; }
.partner-logo.small img { width: 100%; height: 100%; object-fit: cover; }

.partner-title { margin: 0 0 6px 0; color: var(--primary-color); font-size: 18px; }

.partner-meta { display: flex; gap: 14px; font-size: 13px; color: #666; }
.partner-meta i { margin-right: 6px; }
.partner-projects { margin: 10px 0 0 0; color: #555; font-size: 14px; }

.partner-actions { display: flex; gap: 8px; }

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.gallery-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--light-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  flex-shrink: 0;
}

.activity-content p {
  margin: 0 0 5px 0;
  color: var(--text-color);
}

.activity-time {
  font-size: 12px;
  color: #888;
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

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
}

.checkbox-label {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
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

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  padding: 30px;
  max-width: 600px;
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

/* Profile Modal Styles */
.profile-modal {
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.profile-content {
  margin-top: 20px;
}

.profile-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: var(--border-radius);
  background: #fafafa;
}

.profile-section h4 {
  color: var(--primary-color);
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-section h4 i {
  color: var(--accent-color);
}

.profile-subsection {
  margin-bottom: 20px;
}

.profile-subsection h5 {
  color: var(--text-color);
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.profile-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.profile-item label {
  font-weight: 600;
  color: #666;
  font-size: 14px;
}

.profile-item span {
  color: var(--text-color);
  font-size: 15px;
}

.profile-item a {
  color: var(--accent-color);
  text-decoration: none;
}

.profile-item a:hover {
  text-decoration: underline;
}

.profile-photo {
  margin-top: 10px;
}

.profile-photo img {
  max-width: 200px;
  max-height: 200px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
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

.no-profile {
  text-align: center;
  padding: 40px;
  color: #666;
}

.no-profile i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #ccc;
}

.no-profile p {
  font-size: 18px;
  margin: 0;
}

/* Surveys management styles */
.surveys-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.survey-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: var(--border-radius);
  transition: var(--transition);
  background: white;
  gap: 20px;
}

.survey-item:hover {
  box-shadow: var(--box-shadow);
  border-color: var(--accent-color);
}

.survey-info {
  flex: 1;
}

.survey-info h4 {
  margin: 0 0 10px 0;
  color: var(--primary-color);
  font-size: 18px;
}

.survey-info p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
}

.survey-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
}

.meta-item i {
  color: var(--accent-color);
}

.status-badge.draft {
  background: #ffc107;
  color: #212529;
}

.status-badge.published {
  background: #28a745;
  color: white;
}

.status-badge.closed {
  background: #dc3545;
  color: white;
}

.status-badge.expired-badge {
  background: #6c757d;
  color: white;
}

.survey-item.expired {
  opacity: 0.7;
  border-left: 4px solid #6c757d;
  background: #f8f9fa;
}

.survey-item.expired:hover {
  opacity: 0.85;
  border-left-color: #5a6268;
}

.survey-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.3;
}

@media (max-width: 768px) {
  .admin-nav {
    justify-content: center;
  }
  
  .nav-btn {
    padding: 10px 15px;
    font-size: 12px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  
  .stat-card {
    padding: 20px;
    gap: 15px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .news-item {
    flex-direction: column;
  }
  
  .news-image {
    width: 100%;
    height: 150px;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .admin-header h1 {
    font-size: 28px;
  }

  .profile-modal {
    max-width: 95vw;
    margin: 10px;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-section {
    padding: 15px;
  }

  .profile-photo img {
    max-width: 150px;
    max-height: 150px;
  }

  .survey-item {
    flex-direction: column;
    align-items: stretch;
  }

  .survey-actions {
    justify-content: space-between;
  }

  .survey-actions .btn {
    flex: 1;
  }
}
</style> 