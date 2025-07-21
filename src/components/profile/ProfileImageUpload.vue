<template>
  <div class="profile-image-upload-container">
    <q-card class="image-upload-card" flat bordered>
      <q-card-section class="text-center">
        <div class="image-upload-header q-mb-lg">
          <q-icon name="photo_camera" size="36px" color="primary" class="q-mr-sm" />
          <span class="header-title">{{ $t('profile.profileImage') }}</span>
        </div>

        <!-- Current Image Display -->
        <div class="current-image-wrapper q-mb-xl">
          <q-avatar :size="$q.screen.xs ? '120px' : '140px'" class="current-avatar bg-grey-2 shadow-10">
            <img
              v-if="imagePreview || userProfile?.image"
              :src="imagePreview || userProfile?.image || ''"
              alt="Profile Avatar"
              class="avatar-image"
            >
            <q-icon v-else name="person" :size="$q.screen.xs ? '70px' : '90px'" color="grey-5" />
            <!-- Status Badge -->
            <q-badge
              v-if="imagePreview && imagePreview !== userProfile?.image"
              floating
              color="amber-7"
              class="change-indicator"
            >
              <q-icon name="edit" size="xs" />
            </q-badge>
          </q-avatar>
        </div>

        <!-- Upload Actions -->
        <div class="upload-actions q-gutter-sm q-mb-md">
          <q-btn
            flat
            color="primary"
            icon="upload"
            :label="$t('profile.chooseImage')"
            @click="triggerFileInput"
            class="upload-btn"
            size="md"
          />
          <q-btn
            v-if="imagePreview"
            flat
            color="negative"
            icon="clear"
            :label="$t('common.cancel')"
            @click="clearPreview"
            class="cancel-btn"
            size="md"
          />
        </div>

        <!-- Hidden File Input -->
        <q-file
          ref="fileInput"
          v-model="imageFile"
          accept="image/jpeg,image/png,image/jpg"
          @update:model-value="onImageChange"
          style="display: none"
          max-file-size="5242880"
          @rejected="onRejected"
        />

        <!-- Upload Progress -->
        <div v-if="uploading" class="q-mt-md">
          <q-linear-progress
            :value="uploadProgress"
            color="primary"
            class="q-mb-sm"
            rounded
          />
          <div class="text-caption text-grey-7">
            {{ $t('profile.uploading') }}... {{ Math.round(uploadProgress * 100) }}%
          </div>
        </div>

        <!-- Upload Button -->
        <div v-if="imagePreview && imagePreview !== userProfile?.image" class="q-mt-lg">
          <q-btn
            color="primary"
            icon="cloud_upload"
            :label="$t('profile.uploadImage')"
            @click="uploadImage"
            :loading="uploading"
            unelevated
            rounded
            class="upload-submit-btn"
            size="lg"
          />
        </div>

        <!-- Image Info -->
        <div v-if="imageFile" class="q-mt-md text-caption text-grey-7">
          <div>{{ $t('profile.fileName') }}: <span class="text-weight-medium text-dark">{{ imageFile.name }}</span></div>
          <div>{{ $t('profile.fileSize') }}: <span class="text-weight-medium text-dark">{{ formatFileSize(imageFile.size) }}</span></div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useProfileStore } from 'src/stores/profileStore';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

const { t } = useI18n();
const $q = useQuasar();
const profileStore = useProfileStore();

// Reactive state
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const uploading = ref(false);
const uploadProgress = ref(0);
const fileInput = ref();

// Computed
const userProfile = computed(() => profileStore.userProfile);

// Methods
const triggerFileInput = () => {
  fileInput.value?.pickFiles();
};

const onImageChange = (file: File | null) => {
  if (!file) {
    imagePreview.value = null;
    return;
  }

  // Validate file size (5MB max)
  if (file.size > 5242880) {
    $q.notify({
      type: 'negative',
      message: t('profile.fileSizeError'),
      position: 'top'
    });
    return;
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    $q.notify({
      type: 'negative',
      message: t('profile.fileTypeError'),
      position: 'top'
    });
    return;
  }

  // Create preview
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
  };
};

const clearPreview = () => {
  imageFile.value = null;
  imagePreview.value = null;
  uploadProgress.value = 0;
};

const uploadImage = async () => {
  if (!imageFile.value) return;

  uploading.value = true;
  uploadProgress.value = 0;

  try {
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 0.9) {
        uploadProgress.value += 0.1;
      }
    }, 100);

    const formData = new FormData();
    formData.append('image', imageFile.value);

    await profileStore.updateProfileImage(formData);

    clearInterval(progressInterval);
    uploadProgress.value = 1;

    // Clear the preview after successful upload
    setTimeout(() => {
      clearPreview();
    }, 1000);
  } catch {
    uploadProgress.value = 0;
    // Error handling is done in the store
  } finally {
    uploading.value = false;
  }
};

const onRejected = (rejectedEntries: any[]) => {
  const rejection = rejectedEntries[0];
  let message = t('profile.fileRejected');

  if (rejection.failedPropValidation === 'max-file-size') {
    message = t('profile.fileSizeError');
  } else if (rejection.failedPropValidation === 'accept') {
    message = t('profile.fileTypeError');
  }

  $q.notify({
    type: 'negative',
    message,
    position: 'top'
  });
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return `0 ${t('profile.fileSizeUnits.bytes')}`;
  const k = 1024;
  const sizes = [
    t('profile.fileSizeUnits.bytes'),
    t('profile.fileSizeUnits.kb'),
    t('profile.fileSizeUnits.mb'),
    t('profile.fileSizeUnits.gb')
  ];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped lang="scss">
.profile-image-upload-container {
  max-width: 420px;
  margin: 0 auto;
  padding: 2.5rem 0 1.5rem 0;

  @media (max-width: 767px) {
    padding: 1rem 0.5rem;
    max-width: 100%;
  }
}

.image-upload-card {
  border-radius: 22px;
  border: none;
  box-shadow: 0 8px 32px 0 rgba(33, 150, 243, 0.10), 0 1.5px 6px 0 rgba(33, 150, 243, 0.08); // primary color shadow
  background: linear-gradient(135deg, #e3f2fd 0%, #f8fafc 100%); // lighter blue for primary
  transition: box-shadow 0.3s;
  &:hover {
    box-shadow: 0 12px 40px 0 rgba(33, 150, 243, 0.18), 0 2px 8px 0 rgba(33, 150, 243, 0.10);
  }

  @media (max-width: 767px) {
    border-radius: 16px;

    .q-card__section {
      padding: 1rem !important;
    }
  }
}

.image-upload-header {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--q-primary);

  @media (max-width: 767px) {
    margin-bottom: 1.5rem;

    .q-icon {
      font-size: 28px !important;
    }
  }

  .header-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--q-primary);
    letter-spacing: 0.5px;

    @media (max-width: 767px) {
      font-size: 1.1rem;
    }
  }
}

.current-image-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 767px) {
    margin-bottom: 2rem !important;
  }
}

.current-avatar {
  border: 4px solid var(--q-primary);
  box-shadow: 0 8px 30px rgba(33, 150, 243, 0.18);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  background: #fff;
  &:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 12px 40px rgba(33, 150, 243, 0.25);
  }

  @media (max-width: 767px) {
    border-width: 3px;
    &:hover {
      transform: none;
    }
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.change-indicator {
  animation: pulse 2s infinite;
  right: 0;
  top: 0;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.upload-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 0.5rem;

  @media (max-width: 767px) {
    gap: 8px;
    flex-direction: column;
    align-items: center;

    .q-btn {
      width: 100%;
      max-width: 200px;
    }
  }
}

.upload-btn {
  background: linear-gradient(90deg, var(--q-primary), #42a5f5 100%);
  color: #fff !important;
  border-radius: 22px;
  padding: 8px 28px;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.10);
  transition: background 0.2s, box-shadow 0.2s;
  &:hover {
    background: linear-gradient(90deg, #42a5f5 0%, var(--q-primary) 100%);
    box-shadow: 0 4px 16px rgba(33, 150, 243, 0.18);
    color: #fff !important;
  }

  @media (max-width: 767px) {
    padding: 10px 20px;
    border-radius: 18px;
    font-size: 0.9rem;
  }
}

.cancel-btn {
  border-radius: 22px;
  padding: 8px 28px;
  font-weight: 500;
  background: #fff;
  color: #c62828 !important;
  border: 1.5px solid #f8bbd0;
  box-shadow: 0 1px 4px rgba(198, 40, 40, 0.08);
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: #f8bbd0;
    color: #fff !important;
  }

  @media (max-width: 767px) {
    padding: 10px 20px;
    border-radius: 18px;
    font-size: 0.9rem;
  }
}

.upload-submit-btn {
  background: linear-gradient(90deg, var(--q-primary), #43e97b 100%);
  border-radius: 22px;
  padding: 12px 40px;
  font-weight: 700;
  text-transform: none;
  color: #fff !important;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.18);
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  &:hover {
    background: linear-gradient(90deg, #43e97b 0%, var(--q-primary) 100%);
    box-shadow: 0 6px 20px rgba(33, 150, 243, 0.25);
    color: #fff !important;
  }

  @media (max-width: 767px) {
    padding: 10px 32px;
    border-radius: 18px;
    font-size: 1rem;
    min-width: 160px;
  }
}

.q-linear-progress {
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: #e3f2fd;
}

.text-dark {
  color: var(--q-primary) !important;
}
</style>
