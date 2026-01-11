<template>
  <BaseLayout>
    <nav class="breadcrumb" aria-label="breadcrumb">
      <div class="container">
        <router-link to="/" class="breadcrumb-item">
          <i class="fas fa-home"></i> {{ t('Главная', 'Home') }}
        </router-link>
        <span class="breadcrumb-item active">
          <i class="fas fa-user"></i> {{ t('Личный кабинет', 'Account') }}
        </span>
      </div>
    </nav>

    <section class="section">
      <div class="container">
        <div class="account-header">
          <h1><i class="fas fa-user-circle"></i> {{ t('Личный кабинет', 'Personal Account') }}</h1>
          <p>{{ t('Управляйте своей учетной записью и анкетными данными', 'Manage your account and profile information') }}</p>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('Загрузка данных...', 'Loading data...') }}</p>
        </div>

        <div v-else class="account-content">
          <div class="account-tabs">
            <button 
              @click="activeTab = 'profile'"
              :class="['tab-btn', { active: activeTab === 'profile' }]"
            >
              <i class="fas fa-user"></i> {{ t('Профиль', 'Profile') }}
            </button>
            <button 
              @click="activeTab = 'form'"
              :class="['tab-btn', { active: activeTab === 'form' }]"
            >
              <i class="fas fa-file-alt"></i> {{ t('Анкета выпускника', 'Graduate Form') }}
            </button>
            <button 
              @click="activeTab = 'settings'"
              :class="['tab-btn', { active: activeTab === 'settings' }]"
            >
              <i class="fas fa-cog"></i> {{ t('Настройки', 'Settings') }}
            </button>
          </div>

          <div v-if="activeTab === 'profile'" class="tab-content">
            <div class="card">
              <h3><i class="fas fa-user"></i> {{ t('Информация профиля', 'Profile Information') }}</h3>
              
              <div class="profile-info">
                <div class="profile-avatar">
                  <img 
                    :src="userProfile.avatar || '/graduate/images/default-avatar.png'" 
                    :alt="t('Аватар пользователя', 'User Avatar')"
                    @error="handleImageError"
                  />
                  <button @click="openAvatarModal" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-camera"></i> {{ t('Изменить', 'Change') }}
                  </button>
                </div>
                
                <div class="profile-details">
                  <div class="detail-item">
                    <label>{{ t('Email', 'Email') }}</label>
                    <span>{{ userProfile.email || '-' }}</span>
                  </div>
                  <div class="detail-item">
                    <label>{{ t('Дата регистрации', 'Registration Date') }}</label>
                    <span>{{ formatDate(userProfile.registrationDate) }}</span>
                  </div>
                  <div class="detail-item">
                    <label>{{ t('Статус', 'Status') }}</label>
                    <span :class="['status', userProfile.status]">
                      {{ getStatusText(userProfile.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'form'" class="tab-content">
            <div class="card">
              <h3><i class="fas fa-file-alt"></i> {{ t('Анкета выпускника', 'Graduate Form') }}</h3>
              
              <div v-if="!hasForm" class="no-form">
                <div class="empty-state">
                  <i class="fas fa-file-plus" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
                  <h4>{{ t('Анкета не заполнена', 'Form not completed') }}</h4>
                  <p>{{ t('Заполните анкету выпускника, чтобы другие могли найти вас', 'Fill out the graduate form so others can find you') }}</p>
                  <button @click="createForm" class="btn btn-primary">
                    <i class="fas fa-plus"></i> {{ t('Создать анкету', 'Create Form') }}
                  </button>
                </div>
              </div>

              <div v-else class="graduate-form">
                <form @submit.prevent="saveForm">
                  <div class="form-section">
                    <div class="section-header">
                      <i class="fas fa-user"></i>
                      <h4>{{ t('Личная информация', 'Personal Information') }}</h4>
                    </div>
                    <div class="section-content">
                      <div class="form-row">
                        <div class="form-group">
                          <label class="required">{{ t('Фамилия', 'Surname') }}</label>
                          <input 
                            type="text" 
                            class="form-control" 
                            :class="{ 'error': hasFieldError('surname') }"
                            v-model="formData.surname" 
                            @blur="validateField('surname', formData.surname, { required: true, minLength: 2, maxLength: 50 })"
                            required 
                          />
                          <div v-if="hasFieldError('surname')" class="field-error">
                            <div v-for="error in getFieldError('surname')" :key="error" class="error-message">
                              <i class="fas fa-exclamation-circle"></i> {{ error }}
                            </div>
                          </div>
                        </div>
                        <div class="form-group">
                          <label class="required">{{ t('Имя', 'Name') }}</label>
                          <input 
                            type="text" 
                            class="form-control" 
                            :class="{ 'error': hasFieldError('name') }"
                            v-model="formData.name" 
                            @blur="validateField('name', formData.name, { required: true, minLength: 2, maxLength: 50 })"
                            required 
                          />
                          <div v-if="hasFieldError('name')" class="field-error">
                            <div v-for="error in getFieldError('name')" :key="error" class="error-message">
                              <i class="fas fa-exclamation-circle"></i> {{ error }}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="form-row">
                        <div class="form-group">
                          <label>{{ t('Отчество', 'Patronymic') }}</label>
                          <input type="text" class="form-control" v-model="formData.patronymic" />
                        </div>
                        <div class="form-group">
                          <label>{{ t('Дата рождения', 'Birthday') }}</label>
                          <input type="date" class="form-control" v-model="formData.birthday" />
                        </div>
                      </div>

                      <div class="form-row">
                        <div class="form-group">
                          <label>{{ t('Телефон', 'Phone') }}</label>
                          <input 
                            type="tel" 
                            class="form-control" 
                            :class="{ 'error': hasFieldError('phone_number') }"
                            v-model="formData.phone_number" 
                            @input="onPhoneInput" 
                            @blur="validateField('phone_number', formData.phone_number, { phone: true })"
                            placeholder="+7(XXX)XXX-XX-XX" 
                          />
                          <div v-if="hasFieldError('phone_number')" class="field-error">
                            <div v-for="error in getFieldError('phone_number')" :key="error" class="error-message">
                              <i class="fas fa-exclamation-circle"></i> {{ error }}
                            </div>
                          </div>
                        </div>
                        <div class="form-group">
                          <label>{{ t('Город', 'City') }}</label>
                          <input type="text" class="form-control" v-model="formData.city" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="form-section">
                    <div class="section-header">
                      <i class="fas fa-briefcase"></i>
                      <h4>{{ t('Профессиональная деятельность', 'Professional Activity') }}</h4>
                    </div>
                    <div class="section-content">
                      <div class="form-row">
                        <div class="form-group">
                          <label>{{ t('Место работы', 'Work place') }}</label>
                          <input type="text" class="form-control" v-model="formData.work_place" />
                        </div>
                        <div class="form-group">
                          <label>{{ t('Сфера деятельности', 'Field of activity') }}</label>
                          <input type="text" class="form-control" v-model="formData.field_activety" />
                        </div>
                      </div>

                      <div class="form-row">
                        <div class="form-group">
                          <label>{{ t('Занимаемая должность', 'Position') }}</label>
                          <input type="text" class="form-control" v-model="formData.position" />
                        </div>
                        <div class="form-group">
                          <label>{{ t('Хобби', 'Hobby') }}</label>
                          <input type="text" class="form-control" v-model="formData.hobby" />
                        </div>
                      </div>

                      <div class="form-row">
                        <div class="form-group">
                          <label>{{ t('Ученая степень', 'Academic degree') }}</label>
                          <input type="text" class="form-control" v-model="formData.academ_degree" />
                        </div>
                        <div class="form-group">
                          <label>{{ t('Ученое звание', 'Academic rank') }}</label>
                          <input type="text" class="form-control" v-model="formData.academ_rank" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="form-section">
                    <div class="section-header">
                      <i class="fas fa-chalkboard-teacher"></i>
                      <h4>{{ t('Преподавание и партнерство', 'Teaching & Partnership') }}</h4>
                    </div>
                    <div class="section-content">
                      <div class="checkbox-section">
                        <label class="checkbox-label">
                          <input type="checkbox" v-model="formData.isLecturer" />
                          <span class="checkbox-text">{{ t('Я преподаватель', 'I am a lecturer') }}</span>
                        </label>
                      </div>
                      
                      <div v-if="formData.isLecturer" class="dynamic-fields">
                        <label>{{ t('Дисциплины', 'Disciplines') }}</label>
                        <div v-for="(disc, i) in formData.disciplines" :key="'d'+i" class="form-row">
                          <div class="form-group" style="flex:1">
                            <input type="text" class="form-control" v-model="formData.disciplines[i].value" />
                          </div>
                          <button type="button" class="btn-remove-item" @click="removeFromArray('disciplines', i)" v-if="formData.disciplines.length>1" :title="t('Удалить дисциплину', 'Remove discipline')">
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-primary" @click="addToArray('disciplines', { value: '' })">
                          <i class="fas fa-plus"></i> {{ t('Добавить дисциплину', 'Add discipline') }}
                        </button>
                      </div>

                      <div class="checkbox-section">
                        <label class="checkbox-label">
                          <input type="checkbox" v-model="formData.isPartner" />
                          <span class="checkbox-text">{{ t('Партнер кафедры', 'Department partner') }}</span>
                        </label>
                      </div>
                      
                      <div v-if="formData.isPartner" class="form-group">
                        <label>{{ t('Название организации-партнера', 'Partner organization') }}</label>
                        <input type="text" class="form-control" v-model="formData.partner" />
                      </div>

                      <div class="form-group">
                        <label>{{ t('Лучшие практики и достижения', 'Best practices and achievements') }}</label>
                        <textarea class="form-control" rows="4" v-model="formData.best_practices"></textarea>
                      </div>
                    </div>
                  </div>

                  <div class="form-section">
                    <div class="section-header">
                      <i class="fas fa-trophy"></i>
                      <h4>{{ t('Достижения и галерея', 'Achievements & Gallery') }}</h4>
                    </div>
                    <div class="section-content">
                      <!-- Achievements Images -->
                      <div class="form-group">
                        <label>{{ t('Фотографии достижений', 'Achievement photos') }}</label>
                        <div class="file-upload-wrapper">
                          <input 
                            type="file" 
                            accept="image/*" 
                            @change="onAddAchieveFile" 
                            id="achievement-upload"
                            class="file-input"
                          />
                          <label for="achievement-upload" class="file-upload-label">
                            <i class="fas fa-plus"></i>
                            {{ t('Добавить фото достижения', 'Add achievement photo') }}
                          </label>
                        </div>
                        <div class="gallery-grid" v-if="formData.achive_files && formData.achive_files.length">
                          <div class="gallery-item" v-for="(img, idx) in formData.achive_files" :key="'achv'+idx">
                            <div class="gallery-image-wrapper">
                              <img :src="img" alt="achieve" @error="handleImageError" />
                              <button type="button" class="btn-remove-item gallery-remove" @click="removeAchieve(idx)" :title="t('Удалить фото', 'Remove photo')">
                                <i class="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="form-group">
                        <label>{{ t('Архивные фотографии', 'Archive photos') }}</label>
                        <div class="file-upload-wrapper">
                          <input 
                            type="file" 
                            accept="image/*" 
                            @change="onAddGalleryPhoto" 
                            id="gallery-upload"
                            class="file-input"
                          />
                          <label for="gallery-upload" class="file-upload-label">
                            <i class="fas fa-images"></i>
                            {{ t('Добавить архивное фото', 'Add archive photo') }}
                          </label>
                        </div>
                        <div class="gallery-grid" v-if="newGalleryFiles.length">
                          <div class="gallery-item" v-for="(file, idx) in newGalleryFiles" :key="'gal'+idx">
                            <div class="gallery-image-wrapper">
                              <img :src="file.img" alt="gallery" @error="handleImageError" />
                              <button type="button" class="btn-remove-item gallery-remove" @click="removeGallery(idx)" :title="t('Удалить фото', 'Remove photo')">
                                <i class="fas fa-times"></i>
                              </button>
                            </div>
                            <input 
                              class="form-control gallery-comment" 
                              v-model="newGalleryFiles[idx].comment" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="form-section">
                    <div class="section-header">
                      <i class="fas fa-graduation-cap"></i>
                      <h4>{{ t('Образование', 'Education') }}</h4>
                    </div>
                    <div class="section-content">
                      <!-- Department Education -->
                      <div class="education-block">
                        <h5>{{ t('Образование на кафедре САПРиУ', 'Education at department') }}</h5>
                        <div v-for="(ed, i) in formData.education" :key="'e'+i" class="education-item">
                          <div class="form-row">
                            <div class="form-group">
                              <label>{{ t('Год выпуска', 'Graduation year') }}</label>
                              <input type="text" class="form-control" v-model="formData.education[i].year_graduation" />
                            </div>
                            <div class="form-group">
                              <label>{{ t('Форма обучения', 'Education form') }}</label>
                              <input type="text" class="form-control" v-model="formData.education[i].educ_form" />
                            </div>
                          </div>
                          <div class="form-row">
                            <div class="form-group">
                              <label>{{ t('Квалификация', 'Qualification') }}</label>
                              <input type="text" class="form-control" v-model="formData.education[i].qualification" />
                            </div>
                            <div class="form-group">
                              <label>{{ t('Специальность', 'Specialty') }}</label>
                              <input type="text" class="form-control" v-model="formData.education[i].specialty" />
                            </div>
                          </div>
                          <div class="form-row">
                            <div class="form-group">
                              <label>{{ t('Направление подготовки', 'Training direction') }}</label>
                              <input type="text" class="form-control" v-model="formData.education[i].dir_training" />
                            </div>
                            <div class="form-group">
                              <label>{{ t('Направленность', 'Focus') }}</label>
                              <input type="text" class="form-control" v-model="formData.education[i].focus" />
                            </div>
                          </div>
                          <div class="form-row">
                            <div class="form-group">
                              <label>{{ t('Номер группы', 'Group number') }}</label>
                              <input type="text" class="form-control" v-model="firstEducation.group" />
                            </div>
                            <div class="form-group" v-if="formData.education.length > 1">
                              <label>&nbsp;</label>
                              <button type="button" class="btn-remove-item btn-remove-block" @click="removeFromArray('education', 0)" :title="t('Удалить образование', 'Remove education')">
                                <i class="fas fa-times"></i> {{ t('Удалить', 'Remove') }}
                              </button>
                            </div>
                          </div>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-primary" @click="addToArray('education', { year_graduation: '', educ_form: '', qualification: '', specialty: '', dir_training: '', focus: '', group: '' })">
                          <i class="fas fa-plus"></i> {{ t('Добавить образование', 'Add education') }}
                        </button>
                      </div>

                      <div class="education-block">
                        <h5>{{ t('Другое образование', 'Other education') }}</h5>
                        <div v-for="(ed, i) in formData.another_education" :key="'ae'+i" class="education-item">
                          <div class="form-row">
                            <div class="form-group">
                              <label>{{ t('Город', 'City') }}</label>
                              <input type="text" class="form-control" v-model="formData.another_education[i].an_city" />
                            </div>
                            <div class="form-group">
                              <label>{{ t('Вуз', 'University') }}</label>
                              <input type="text" class="form-control" v-model="formData.another_education[i].an_uni" />
                            </div>
                          </div>
                          <div class="form-row">
                            <div class="form-group">
                              <label>{{ t('Год окончания', 'Graduation year') }}</label>
                              <input type="text" class="form-control" v-model="formData.another_education[i].an_year_graduation" />
                            </div>
                            <div class="form-group">
                              <label>{{ t('Квалификация', 'Qualification') }}</label>
                              <input type="text" class="form-control" v-model="formData.another_education[i].an_qualification" />
                            </div>
                          </div>
                          <div class="form-row">
                            <div class="form-group">
                              <label>{{ t('Специальность', 'Specialty') }}</label>
                              <input type="text" class="form-control" v-model="formData.another_education[i].an_specialty" />
                            </div>
                            <div class="form-group">
                              <label>{{ t('Направление подготовки', 'Training direction') }}</label>
                              <input type="text" class="form-control" v-model="formData.another_education[i].an_dir_training" />
                            </div>
                          </div>
                          <div class="form-row">
                            <div class="form-group">
                              <label>{{ t('Направленность', 'Focus') }}</label>
                              <input type="text" class="form-control" v-model="formData.another_education[i].an_focus" />
                            </div>
                            <div class="form-group">
                              <label>{{ t('Группа', 'Group') }}</label>
                              <input type="text" class="form-control" v-model="formData.another_education[i].an_group" />
                            </div>
                            <div class="form-group" v-if="formData.another_education.length > 1">
                              <label>&nbsp;</label>
                              <button type="button" class="btn-remove-item btn-remove-block" @click="removeFromArray('another_education', i)" :title="t('Удалить образование', 'Remove education')">
                                <i class="fas fa-times"></i> {{ t('Удалить', 'Remove') }}
                              </button>
                            </div>
                          </div>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-primary" @click="addToArray('another_education', { an_city: '', an_uni: '', an_year_graduation: '', an_qualification: '', an_specialty: '', an_dir_training: '', an_focus: '', an_group: '' })">
                          <i class="fas fa-plus"></i> {{ t('Добавить образование', 'Add education') }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="form-section">
                    <div class="section-header">
                      <i class="fas fa-share-alt"></i>
                      <h4>{{ t('Социальные сети', 'Social Networks') }}</h4>
                    </div>
                    <div class="section-content">
                      <div v-for="(sn, i) in formData.social_network" :key="'sn'+i" class="social-network-item">
                        <div class="form-row">
                          <div class="form-group">
                            <label>{{ t('Социальная сеть', 'Social network') }}</label>
                            <select class="form-control" v-model="formData.social_network[i].network_name">
                              <option disabled value="">{{ t('Выберите сеть', 'Select network') }}</option>
                              <option v-for="net in socialNetworkOptions" :key="net" :value="net">{{ net }}</option>
                            </select>
                          </div>
                          <div class="form-group">
                            <label>{{ t('URL профиля', 'Profile URL') }}</label>
                            <input type="text" class="form-control" v-model="formData.social_network[i].url" />
                          </div>
                          <div class="form-group" v-if="formData.social_network.length > 1">
                            <label>&nbsp;</label>
                            <button type="button" class="btn-remove-item btn-remove-block" @click="removeFromArray('social_network', i)" :title="t('Удалить социальную сеть', 'Remove social network')">
                              <i class="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <button type="button" class="btn btn-sm btn-outline-primary" @click="addToArray('social_network', { network_name: '', url: '' })">
                        <i class="fas fa-plus"></i> {{ t('Добавить социальную сеть', 'Add social network') }}
                      </button>
                    </div>
                  </div>

                  <div class="form-section">
                    <div class="section-header">
                      <i class="fas fa-question-circle"></i>
                      <h4>{{ t('Анкета выпускника', 'Graduate Questionnaire') }}</h4>
                    </div>
                    <div class="section-content">
                      <div class="questions-grid">
                        <div class="question-group">
                          <h5>{{ t('Поддерживаете ли Вы отношения с другими выпускниками?', 'Do you maintain relationships with other graduates?') }}</h5>
                          <div class="checkbox-options">
                            <div v-for="opt in q1OptionsLocalized" :key="'q1_'+opt" class="checkbox-option">
                              <label class="checkbox-label">
                                <input type="checkbox" :value="opt" :checked="formData.q1.includes(opt)" @change="toggleMulti('q1', opt)" />
                                <span class="checkbox-text">{{ opt }}</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div class="question-group">
                          <h5>{{ t('Чем может быть полезен университет?', 'How can the university help?') }}</h5>
                          <div class="checkbox-options">
                            <div v-for="opt in q2OptionsLocalized" :key="'q2_'+opt" class="checkbox-option">
                              <label class="checkbox-label">
                                <input type="checkbox" :value="opt" :checked="formData.q2.includes(opt)" @change="toggleMulti('q2', opt)" />
                                <span class="checkbox-text">{{ opt }}</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div class="question-group">
                          <h5>{{ t('Содействие университету', 'Assistance to the university') }}</h5>
                          <div class="checkbox-options">
                            <div v-for="opt in q4OptionsLocalized" :key="'q4_'+opt" class="checkbox-option">
                              <label class="checkbox-label">
                                <input type="checkbox" :value="opt" :checked="formData.q4.includes(opt)" @change="toggleMulti('q4', opt)" />
                                <span class="checkbox-text">{{ opt }}</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div class="question-group">
                          <h5>{{ t('Материалы для музея', 'Materials for the museum') }}</h5>
                          <div class="checkbox-options">
                            <div v-for="opt in q5OptionsLocalized" :key="'q5_'+opt" class="checkbox-option">
                              <label class="checkbox-label">
                                <input type="checkbox" :value="opt" :checked="formData.q5.includes(opt)" @change="toggleMulti('q5', opt)" />
                                <span class="checkbox-text">{{ opt }}</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="form-section consent-section">
                    <div class="consent-wrapper">
                      <label class="checkbox-label consent-label">
                        <input type="checkbox" v-model="consentAccepted" />
                        <span class="checkbox-text">{{ t('Я согласен на обработку персональных данных', 'I agree to the processing of personal data') }}</span>
                      </label>
                    </div>
                  </div>

                  <div class="form-actions">
                    <button type="submit" :disabled="saving || !consentAccepted" class="btn btn-primary btn-save">
                      <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                      <i v-else class="fas fa-save"></i>
                      {{ saving ? t('Сохранение...', 'Saving...') : t('Сохранить анкету', 'Save Form') }}
                    </button>
                    <button v-if="hasForm" @click="deleteForm" type="button" class="btn btn-danger btn-delete">
                      <i class="fas fa-trash"></i> {{ t('Удалить анкету', 'Delete Form') }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'settings'" class="tab-content">
            <div class="card">
              <h3><i class="fas fa-cog"></i> {{ t('Настройки аккаунта', 'Account Settings') }}</h3>
              
              <div class="settings-section">
                <h4>{{ t('Изменение пароля', 'Change Password') }}</h4>
                <form @submit.prevent="changePassword">
                  <div class="form-group">
                    <label>{{ t('Текущий пароль', 'Current Password') }}</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      v-model="passwordForm.currentPassword"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label>{{ t('Новый пароль', 'New Password') }}</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      v-model="passwordForm.newPassword"
                      required
                      minlength="6"
                    />
                  </div>
                  <div class="form-group">
                    <label>{{ t('Подтвердите новый пароль', 'Confirm New Password') }}</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      v-model="passwordForm.confirmPassword"
                      required
                    />
                  </div>
                  <button type="submit" :disabled="changing" class="btn btn-primary">
                    <i class="fas fa-key"></i> {{ t('Изменить пароль', 'Change Password') }}
                  </button>
                </form>
              </div>

              <div class="settings-section">
                <h4>{{ t('Удаление аккаунта', 'Delete Account') }}</h4>
                <p class="text-danger">
                  {{ t('Внимание! Удаление аккаунта необратимо.', 'Warning! Account deletion is irreversible.') }}
                </p>
                <button @click="confirmDeleteAccount" class="btn btn-danger">
                  <i class="fas fa-trash"></i> {{ t('Удалить аккаунт', 'Delete Account') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="message" :class="['message', messageType]">
          <i :class="messageType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
          {{ message }}
        </div>
      </div>
    </section>

    <div v-if="showAvatarModal" class="modal-overlay" @click="closeAvatarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-camera"></i> {{ t('Загрузить аватар', 'Upload Avatar') }}</h3>
          <button @click="closeAvatarModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="avatar-preview">
            <img 
              v-if="avatarPreview" 
              :src="avatarPreview" 
              alt="Avatar Preview"
              class="preview-image"
            />
            <div v-else class="preview-placeholder">
              <i class="fas fa-user"></i>
              <p>{{ t('Предварительный просмотр', 'Preview') }}</p>
            </div>
          </div>
          <div class="upload-options">
            <input 
              ref="fileInput"
              type="file" 
              accept="image/*" 
              @change="handleFileSelect"
              style="display: none"
            />
            <button @click="selectFile" class="btn btn-primary">
              <i class="fas fa-folder-open"></i> {{ t('Выбрать файл', 'Choose File') }}
            </button>
            <button 
              v-if="selectedFile" 
              @click="uploadAvatar" 
              class="btn btn-success"
              :disabled="uploading"
            >
              <i v-if="uploading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-upload"></i>
              {{ uploading ? t('Загрузка...', 'Uploading...') : t('Загрузить', 'Upload') }}
            </button>
          </div>
          <div v-if="selectedFile" class="file-info">
            <p><strong>{{ t('Файл:', 'File:') }}</strong> {{ selectedFile.name }}</p>
            <p><strong>{{ t('Размер:', 'Size:') }}</strong> {{ formatFileSize(selectedFile.size) }}</p>
          </div>
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
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

const t = computed(() => languageStore.t)

const loading = ref(true)
const activeTab = ref('profile')
const userProfile = ref({})
const hasForm = ref(false)
const saving = ref(false)
const changing = ref(false)
const message = ref('')
const messageType = ref('success')

const showAvatarModal = ref(false)
const selectedFile = ref(null)
const avatarPreview = ref('')
const uploading = ref(false)
const fileInput = ref(null)

const formData = ref({
  surname: '',
  name: '',
  patronymic: '',
  birthday: '',
  phone_number: '',
  city: '',
  photo: '/graduate/images/default-avatar.png',
  status_verified: false,

  partner: '',
  work_place: '',
  position: '',
  field_activety: '',
  academ_degree: '',
  academ_rank: '',
  hobby: '',
  isLecturer: false,
  isPartner: false,
  best_practices: '',

  disciplines: [{ value: '' }],
  education: [{ year_graduation: '', educ_form: '', qualification: '', specialty: '', dir_training: '', focus: '', group: '' }],
  another_education: [{ an_city: '', an_uni: '', an_year_graduation: '', an_qualification: '', an_specialty: '', an_dir_training: '', an_focus: '', an_group: '' }],
  social_network: [{ network_name: '', url: '' }],
  achive_files: [],

  q1: [''],
  q2: [''],
  q4: [''],
  q5: ['']
})

const consentAccepted = ref(true)
const socialNetworkOptions = ['Instagram', 'VK', 'Facebook']

const firstEducation = computed(() => {
  return formData.value.education && formData.value.education.length > 0 
    ? formData.value.education[0] 
    : { year_graduation: '', educ_form: '', qualification: '', specialty: '', dir_training: '', focus: '', group: '' }
})

const q1OptionsRu = ['Совместные встречи', 'Онлайн общение', 'Профессиональные сообщества']
const q2OptionsRu = ['Повышение квалификации', 'Стажировки/Практики', 'Карьерные мероприятия']
const q4OptionsRu = ['Менторство', 'Пожертвования', 'Совместные проекты']
const q5OptionsRu = ['Фото', 'Документы', 'Артефакты']

const q1OptionsEn = ['Meetups', 'Online communication', 'Professional communities']
const q2OptionsEn = ['Professional development', 'Internships/Practice', 'Career events']
const q4OptionsEn = ['Mentorship', 'Donations', 'Joint projects']
const q5OptionsEn = ['Photos', 'Documents', 'Artifacts']

const q1OptionsLocalized = computed(() => languageStore.currentLanguage === 'ru' ? q1OptionsRu : q1OptionsEn)
const q2OptionsLocalized = computed(() => languageStore.currentLanguage === 'ru' ? q2OptionsRu : q2OptionsEn)
const q4OptionsLocalized = computed(() => languageStore.currentLanguage === 'ru' ? q4OptionsRu : q4OptionsEn)
const q5OptionsLocalized = computed(() => languageStore.currentLanguage === 'ru' ? q5OptionsRu : q5OptionsEn)

const validationErrors = ref({})

const validateField = (fieldName, value, rules = {}) => {
  const errors = []
  
  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push(t.value('Это поле обязательно для заполнения', 'This field is required'))
  }
  
  if (rules.minLength && value && value.toString().length < rules.minLength) {
    errors.push(t.value(`Минимум ${rules.minLength} символов`, `Minimum ${rules.minLength} characters`))
  }
  
  if (rules.maxLength && value && value.toString().length > rules.maxLength) {
    errors.push(t.value(`Максимум ${rules.maxLength} символов`, `Maximum ${rules.maxLength} characters`))
  }
  
  if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    errors.push(t.value('Введите корректный email', 'Enter a valid email'))
  }
  
  if (rules.phone && value && !/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(value)) {
    errors.push(t.value('Введите корректный номер телефона', 'Enter a valid phone number'))
  }
  
  if (rules.url && value && !/^https?:\/\/.+/.test(value)) {
    errors.push(t.value('Введите корректный URL', 'Enter a valid URL'))
  }
  
  if (errors.length > 0) {
    validationErrors.value[fieldName] = errors
  } else {
    delete validationErrors.value[fieldName]
  }
  
  return errors.length === 0
}

const validateForm = () => {
  const rules = {
    surname: { required: true, minLength: 2, maxLength: 50 },
    name: { required: true, minLength: 2, maxLength: 50 },
    patronymic: { maxLength: 50 },
    phone_number: { phone: true },
    city: { maxLength: 100 },
    work_place: { maxLength: 200 },
    position: { maxLength: 100 },
    field_activety: { maxLength: 100 },
    academ_degree: { maxLength: 100 },
    academ_rank: { maxLength: 100 },
    hobby: { maxLength: 200 },
    best_practices: { maxLength: 1000 }
  }
  
  let isValid = true
  
  Object.keys(rules).forEach(field => {
    if (!validateField(field, formData.value[field], rules[field])) {
      isValid = false
    }
  })
  
  return isValid
}

const getFieldError = (fieldName) => {
  return validationErrors.value[fieldName] || []
}

const hasFieldError = (fieldName) => {
  return fieldName in validationErrors.value
}

const toggleMulti = (key, value) => {
  if (!Array.isArray(formData.value[key])) formData.value[key] = []
  const idx = formData.value[key].indexOf(value)
  if (idx === -1) formData.value[key].push(value)
  else formData.value[key].splice(idx, 1)
}

const onPhoneInput = (e) => {
  let v = e.target.value.replace(/\D/g, '')
  if (!v) { formData.value.phone_number = ''; return }
  v = v.slice(0, 11)
  const parts = ['+7(']
  if (v[0] === '7') v = v
  else if (v[0] === '8') v = '7' + v.slice(1)
  else v = '7' + v
  parts.push(v.slice(1,4))
  if (v.length >= 4) parts.push(')')
  if (v.length >= 7) formData.value.phone_number = `${parts.join('')}${v.slice(4,7)}-${v.slice(7,9)}-${v.slice(9,11)}`
  else if (v.length >= 4) formData.value.phone_number = `${parts.join('')}${v.slice(4)}`
}


const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

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

const fetchUserData = async () => {
  try {
    loading.value = true
    
    const profileResponse = await axios.get('/graduate/api/account/profile')
    if (profileResponse.data) {
      console.log('Profile data from server:', profileResponse.data)
      userProfile.value = profileResponse.data
      console.log('User profile avatar:', userProfile.value.avatar)
    }

    const formResponse = await axios.post('/graduate/api/account/form/get_data')
    if (formResponse && formResponse.data) {
      hasForm.value = true
      const serverData = formResponse.data
      
      const mergedData = {
        ...formData.value,
        ...serverData,
        education: serverData.education && serverData.education.length > 0 
          ? serverData.education 
          : [{ year_graduation: '', educ_form: '', qualification: '', specialty: '', dir_training: '', focus: '', group: '' }],
        another_education: serverData.another_education && serverData.another_education.length > 0 
          ? serverData.another_education 
          : [{ an_city: '', an_uni: '', an_year_graduation: '', an_qualification: '', an_specialty: '', an_dir_training: '', an_focus: '', an_group: '' }],
        social_network: serverData.social_network && serverData.social_network.length > 0 
          ? serverData.social_network 
          : [{ network_name: '', url: '' }],
        disciplines: serverData.disciplines && serverData.disciplines.length > 0 
          ? serverData.disciplines 
          : [{ value: '' }],
        q1: serverData.q1 && serverData.q1.length > 0 ? serverData.q1 : [''],
        q2: serverData.q2 && serverData.q2.length > 0 ? serverData.q2 : [''],
        q4: serverData.q4 && serverData.q4.length > 0 ? serverData.q4 : [''],
        q5: serverData.q5 && serverData.q5.length > 0 ? serverData.q5 : ['']
      }
      
      formData.value = mergedData
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    
    // Проверяем, является ли это ошибкой подтверждения email
    if (error.response?.status === 403 && error.response?.data?.emailConfirmed === false) {
      // Пользователь не подтвердил email - перенаправляем на страницу авторизации
      showMessage(error.response.data.message, 'error')
      setTimeout(() => {
        authStore.logout()
        router.push('/auth')
      }, 3000)
    } else {
      showMessage('Ошибка загрузки данных', 'error')
    }
  } finally {
    loading.value = false
  }
}

const createForm = () => {
  hasForm.value = true
}

const saveForm = async () => {
  try {
    saving.value = true
    if (!validateForm()) {
      showMessage(t.value('Пожалуйста, исправьте ошибки в форме', 'Please fix form errors'), 'error')
      return
    }
    
    const payload = { ...formData.value, new_gallery_files: newGalleryFiles?.value || [] }
    const response = await axios.post('/graduate/api/account/form', payload)
    
    if (response && response.status === 200) {
      showMessage(t.value('Анкета успешно сохранена', 'Form saved successfully'), 'success')
      hasForm.value = true
    } else {
      throw new Error(response.data?.message || 'Save failed')
    }
  } catch (error) {
    console.error('Error saving form:', error)
    showMessage(t.value('Ошибка сохранения анкеты', 'Error saving form'), 'error')
  } finally {
    saving.value = false
  }
}

const deleteForm = async () => {
  if (!confirm(t.value('Вы уверены, что хотите удалить анкету?', 'Are you sure you want to delete the form?'))) {
    return
  }

  try {
    const response = await axios.delete('/graduate/api/account/form')
    
    if (response.data && response.data.success) {
      hasForm.value = false
      formData.value = {
        surname: '',
        name: '',
        patronymic: '',
        birthday: '',
        phone_number: '',
        city: '',
        photo: '/graduate/images/default-avatar.png',
        status_verified: false,
        work_place: '',
        position: '',
        field_activety: '',
        academ_degree: '',
        academ_rank: '',
        hobby: '',
        isLecturer: false,
        disciplines: [{ value: '' }],
        isPartner: false,
        partner: '',
        education: [{ year_graduation: '', educ_form: '', qualification: '', specialty: '', dir_training: '', focus: '', group: '' }],
        another_education: [{ an_city: '', an_uni: '', an_year_graduation: '', an_qualification: '', an_specialty: '', an_dir_training: '', an_focus: '', an_group: '' }],
        social_network: [{ network_name: '', url: '' }],
        other_education: '',
        best_practices: '',
        q1: [''],
        q2: [''],
        q3: '',
        q4: [''],
        q5: [''],
        q6: '',
        q7: ''
      }
      showMessage(t.value('Анкета удалена', 'Form deleted'), 'success')
    }
  } catch (error) {
    console.error('Error deleting form:', error)
    showMessage(t.value('Ошибка удаления анкеты', 'Error deleting form'), 'error')
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showMessage(t.value('Пароли не совпадают', 'Passwords do not match'), 'error')
    return
  }

  try {
    changing.value = true
    
    const response = await axios.post('/graduate/api/account/change-password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    if (response.data && response.data.success) {
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      showMessage(t.value('Пароль успешно изменен', 'Password changed successfully'), 'success')
    } else {
      throw new Error(response.data?.message || 'Password change failed')
    }
  } catch (error) {
    console.error('Error changing password:', error)
    showMessage(t.value('Ошибка изменения пароля', 'Error changing password'), 'error')
  } finally {
    changing.value = false
  }
}

const confirmDeleteAccount = () => {
  if (confirm(t.value('Вы уверены, что хотите удалить аккаунт? Это действие необратимо!', 'Are you sure you want to delete your account? This action is irreversible!'))) {
    deleteAccount()
  }
}

const deleteAccount = async () => {
  try {
    const response = await axios.delete('/graduate/api/account/delete')
    
    if (response.data && response.data.success) {
      await authStore.logout()
      router.push('/')
    }
  } catch (error) {
    console.error('Error deleting account:', error)
    showMessage(t.value('Ошибка удаления аккаунта', 'Error deleting account'), 'error')
  }
}

const openAvatarModal = () => {
  showAvatarModal.value = true
  selectedFile.value = null
  avatarPreview.value = ''
}

const closeAvatarModal = () => {
  showAvatarModal.value = false
  selectedFile.value = null
  avatarPreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const selectFile = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return


  if (!file.type.startsWith('image/')) {
    showMessage(t.value('Пожалуйста, выберите файл изображения', 'Please select an image file'), 'error')
    return
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    showMessage(t.value('Размер файла не должен превышать 5MB', 'File size should not exceed 5MB'), 'error')
    return
  }

  selectedFile.value = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const uploadAvatar = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('avatar', selectedFile.value)

    const response = await axios.post('/graduate/api/account/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data.success) {
      userProfile.value.avatar = response.data.avatarUrl
      showMessage(t.value('Аватар успешно загружен', 'Avatar uploaded successfully'), 'success')
      closeAvatarModal()
    } else {
      throw new Error(response.data.message || 'Upload failed')
    }
  } catch (error) {
    console.error('Avatar upload error:', error)
    showMessage(
      error.response?.data?.message || t.value('Ошибка загрузки аватара', 'Error uploading avatar'), 
      'error'
    )
  } finally {
    uploading.value = false
  }
}

const handleImageError = (event) => {
  if (event.target.alt === t.value('Аватар пользователя', 'User Avatar')) {
    event.target.src = '/graduate/images/default-avatar.png'
  }
}

const onAddAchieveFile = (e) => {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onloadend = () => {
    if (!Array.isArray(formData.value.achive_files)) formData.value.achive_files = []
    formData.value.achive_files.push(reader.result)
  }
  reader.readAsDataURL(file)
}
const removeAchieve = (idx) => {
  if (Array.isArray(formData.value.achive_files)) formData.value.achive_files.splice(idx, 1)
}

const newGalleryFiles = ref([])
const onAddGalleryPhoto = (e) => {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onloadend = () => {
    newGalleryFiles.value.push({ img: reader.result, comment: '' })
  }
  reader.readAsDataURL(file)
}
const removeGallery = (idx) => newGalleryFiles.value.splice(idx, 1)

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(languageStore.currentLanguage === 'ru' ? 'ru-RU' : 'en-US')
}

const getStatusText = (status) => {
  const statusMap = {
    active: t.value('Активен', 'Active'),
    pending: t.value('Ожидает подтверждения', 'Pending'),
    inactive: t.value('Неактивен', 'Inactive')
  }
  return statusMap[status] || status
}

const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

const addToArray = (key, value) => {
  if (Array.isArray(formData.value[key])) formData.value[key].push(value)
}
const removeFromArray = (key, index) => {
  if (Array.isArray(formData.value[key]) && formData.value[key].length > 1) {
    formData.value[key].splice(index, 1)
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth')
    return
  }
  
  fetchUserData()
})
</script>

<style scoped>
.account-header {
  text-align: center;
  margin-bottom: 40px;
}

.account-header h1 {
  font-size: 36px;
  color: var(--primary-color);
  margin-bottom: 15px;
}

.account-header p {
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

.account-tabs {
  display: flex;
  border-bottom: 2px solid #eee;
  margin-bottom: 30px;
}

.tab-btn {
  background: none;
  border: none;
  padding: 15px 25px;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: var(--transition);
  border-bottom: 3px solid transparent;
}

.tab-btn:hover,
.tab-btn.active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
}

.tab-content {
  min-height: 400px;
}

.profile-info {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.profile-avatar {
  text-align: center;
  flex-shrink: 0;
}

.profile-avatar img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
  border: 4px solid var(--light-bg);
}

.profile-details {
  flex: 1;
}

.detail-item {
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item label {
  font-weight: 600;
  color: var(--primary-color);
  width: 200px;
  flex-shrink: 0;
}

.detail-item span {
  color: #555;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status.active {
  background: #d4edda;
  color: #155724;
}

.status.pending {
  background: #fff3cd;
  color: #856404;
}

.status.inactive {
  background: #f8d7da;
  color: #721c24;
}

.no-form {
  text-align: center;
  padding: 60px 0;
}

.empty-state h4 {
  color: var(--primary-color);
  margin-bottom: 15px;
}

.graduate-form {
  max-width: 900px;
  margin: 0 auto;
}


/* Form Sections */
.form-section {
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  margin-bottom: 30px;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.section-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, #34495e 100%);
  color: var(--white);
  padding: 20px 30px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.section-header i {
  font-size: 20px;
  opacity: 0.9;
}

.section-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.section-content {
  padding: 30px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-color);
  font-size: 14px;
}

.form-group label.required::after {
  content: ' *';
  color: var(--danger-color);
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: var(--transition);
  box-sizing: border-box;
  background: var(--white);
  font-family: 'Roboto', sans-serif;
}

.form-control:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-control::placeholder {
  color: #adb5bd;
  font-style: italic;
}

.form-control.error {
  border-color: var(--danger-color);
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

/* Field Error Styles */
.field-error {
  margin-top: 8px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--danger-color);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

.error-message i {
  font-size: 12px;
  opacity: 0.8;
}


/* File Upload */
.file-upload-wrapper {
  margin-bottom: 20px;
}

/* Remove Item Buttons */
.btn-remove-item {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
  flex-shrink: 0;
}

.btn-remove-item:hover {
  background: #ff3742;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
}

.btn-remove-item:active {
  transform: scale(0.95);
}

.btn-remove-block {
  width: auto;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  min-width: 100px;
}

.btn-remove-block i {
  margin-right: 6px;
}

/* Gallery remove buttons */
.gallery-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  font-size: 11px;
  z-index: 10;
}

.file-input {
  display: none;
}

.file-upload-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: linear-gradient(135deg, var(--accent-color) 0%, #2980b9 100%);
  color: var(--white);
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;
  border: none;
  font-size: 14px;
}

.file-upload-label:hover {
  background: linear-gradient(135deg, #2980b9 0%, #1f5f8b 100%);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

/* Gallery */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.gallery-item {
  background: var(--white);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: var(--transition);
}

.gallery-item:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.gallery-image-wrapper {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.gallery-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--transition);
}

.gallery-item:hover .gallery-remove {
  opacity: 1;
}

.gallery-comment {
  border: none;
  border-top: 1px solid #e9ecef;
  border-radius: 0;
  padding: 10px 15px;
  font-size: 14px;
}

/* Checkbox Styles */
.checkbox-section {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-color);
  cursor: pointer;
}

.checkbox-text {
  color: var(--text-color);
}

/* Education Blocks */
.education-block {
  margin-bottom: 40px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.education-block h5 {
  color: var(--primary-color);
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid var(--accent-color);
  padding-bottom: 10px;
}

.education-item {
  background: var(--white);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

/* Questions Grid */
.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.question-group {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.question-group h5 {
  color: var(--primary-color);
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.checkbox-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-option {
  background: var(--white);
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: var(--transition);
}

.checkbox-option:hover {
  background: #f8f9fa;
  border-color: var(--accent-color);
}

/* Social Networks */
.social-network-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #e9ecef;
}

/* Consent Section */
.consent-section {
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
  border: 2px solid #28a745;
}

.consent-wrapper {
  padding: 20px;
  text-align: center;
}

.consent-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 20px;
  margin-top: 40px;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  justify-content: center;
}

.btn-save {
  padding: 15px 30px;
  font-size: 16px;
  font-weight: 600;
  min-width: 200px;
}

.btn-delete {
  padding: 15px 30px;
  font-size: 16px;
  font-weight: 600;
  min-width: 200px;
}

.settings-section {
  margin-bottom: 40px;
  padding: 30px;
  border: 1px solid #eee;
  border-radius: var(--border-radius);
}

.settings-section h4 {
  color: var(--primary-color);
  margin-bottom: 20px;
}

.text-danger {
  color: var(--danger-color);
}

.message {
  position: fixed;
  top: 100px;
  right: 20px;
  padding: 15px 20px;
  border-radius: var(--border-radius);
  color: white;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.message.success {
  background: #28a745;
}

.message.error {
  background: var(--danger-color);
}

.message.info {
  background: var(--accent-color);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .account-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    text-align: left;
    border-bottom: 1px solid #eee;
    border-left: 3px solid transparent;
  }
  
  .tab-btn.active {
    border-bottom-color: #eee;
    border-left-color: var(--accent-color);
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .profile-info {
    flex-direction: column;
    text-align: center;
  }
  
  .detail-item {
    flex-direction: column;
    gap: 5px;
  }
  
  .detail-item label {
    width: auto;
  }
  
  .account-header h1 {
    font-size: 28px;
  }

  /* Form Mobile Styles */
  .graduate-form {
    max-width: 100%;
  }

  .form-section {
    margin-bottom: 20px;
  }

  .section-header {
    padding: 15px 20px;
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .section-content {
    padding: 20px;
  }


  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .btn-remove-item {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }

  .btn-remove-block {
    padding: 6px 12px;
    font-size: 13px;
    min-width: 80px;
  }

  .gallery-remove {
    width: 24px;
    height: 24px;
    font-size: 10px;
  }

  .questions-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .form-actions {
    flex-direction: column;
    gap: 15px;
    padding: 20px;
  }

  .btn-save,
  .btn-delete {
    width: 100%;
    min-width: auto;
  }

  .education-block {
    padding: 20px;
  }

  .education-item {
    padding: 15px;
  }

  .question-group {
    padding: 20px;
  }

  .social-network-item {
    padding: 15px;
  }

  .checkbox-section {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .section-header h4 {
    font-size: 16px;
  }

  .form-control {
    padding: 12px 14px;
    font-size: 16px;
  }

  .file-upload-label {
    padding: 10px 16px;
    font-size: 13px;
  }

  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

/* Avatar Upload Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 20px;
}

.avatar-preview {
  text-align: center;
  margin-bottom: 20px;
}

.preview-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary-color);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.preview-placeholder {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 3px dashed #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: #999;
}

.preview-placeholder i {
  font-size: 40px;
  margin-bottom: 10px;
}

.upload-options {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.file-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.file-info p {
  margin: 5px 0;
  color: #666;
}

.file-info strong {
  color: #333;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .upload-options {
    flex-direction: column;
    align-items: center;
  }
  
  .upload-options .btn {
    width: 100%;
    max-width: 200px;
  }
}
</style> 