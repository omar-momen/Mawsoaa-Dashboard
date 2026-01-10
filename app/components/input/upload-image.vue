<script setup lang="ts">
defineOptions({
  inheritAttrs: false
})

interface Props {
  /**
   * Existing image URL to display (for edit mode)
   */
  existingImageUrl?: string | null
  /**
   * Placeholder label for the upload button
   */
  label?: string
  /**
   * Accept attribute for file input
   */
  accept?: string
}

const props = withDefaults(defineProps<Props>(), {
  existingImageUrl: null,
  label: undefined,
  accept: 'image/*'
})

const modelValue = defineModel<File | null>('modelValue', { default: null })

const { t } = useI18n()

// Preview URL for newly selected file
const previewUrl = ref<string | null>(null)

// Track if user explicitly removed the image
const isRemoved = ref(false)

// Computed to determine which image to show
const displayImage = computed(() => {
  if (isRemoved.value) {
    return null
  }
  if (modelValue.value instanceof File) {
    return previewUrl.value
  }
  return props.existingImageUrl
})

// File input ref
const fileInputRef = ref<HTMLInputElement | null>(null)

// Handle file selection from native input
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null

  if (file) {
    // Validate it's an image
    if (!file.type.startsWith('image/')) {
      const toast = useToast()
      toast.add({
        title: t('form.validation.invalid_image'),
        color: 'error'
      })
      // Reset the file input
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
      modelValue.value = null
      return
    }

    // If a new file is set, create preview
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = URL.createObjectURL(file)
    modelValue.value = file
    isRemoved.value = false // Reset removed flag when new file is selected
  } else {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
    modelValue.value = null
  }
}

// Handle button click to trigger file input
const handleUploadClick = () => {
  fileInputRef.value?.click()
}

// Handle remove image
const handleRemove = (event: Event) => {
  event.stopPropagation()
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  modelValue.value = null
  isRemoved.value = true // Mark as removed
  // Reset file input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Cleanup preview URL on unmount
onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<template>
  <div class="space-y-3">
    <!-- Image Upload Area -->
    <div class="relative inline-block group">
      <input
        ref="fileInputRef"
        type="file"
        :accept="accept"
        class="hidden"
        @change="handleFileChange"
      >

      <!-- Image Container (Clickable) -->
      <div
        class="relative w-60 h-48 rounded-lg overflow-hidden border border-border cursor-pointer transition-all hover:border-primary/50"
        @click="handleUploadClick"
      >
        <!-- Image or Placeholder -->
        <div
          v-if="displayImage"
          class="w-full h-full"
        >
          <NuxtImg
            :src="displayImage"
            :alt="t('labels.avatar')"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div
          v-else
          class="w-full h-full flex flex-col items-center justify-center bg-muted/30 text-muted-foreground"
        >
          <Icon
            name="i-lucide-image-plus"
            class="w-12 h-12 mb-2"
          />
          <span class="text-sm">
            {{ label || t('form.upload_image') }}
          </span>
        </div>

        <!-- Desktop Hover Overlay -->
        <div
          v-if="displayImage || !isRemoved"
          class="absolute inset-0 bg-black/60 opacity-0 md:group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-2 backdrop-blur-sm"
        >
          <UButton
            type="button"
            color="primary"
            variant="solid"
            icon="i-lucide-upload"
            size="sm"
            class="shadow-lg"
            @click.stop="handleUploadClick"
          >
            {{ displayImage ? t('form.change_image') : t('form.upload_image') }}
          </UButton>
          <UButton
            v-if="displayImage"
            type="button"
            color="error"
            variant="solid"
            icon="i-lucide-trash-2"
            size="sm"
            class="shadow-lg"
            @click.stop="handleRemove"
          >
            {{ t('form.remove_image') }}
          </UButton>
        </div>

        <!-- Mobile Action Buttons (Always Visible) -->
        <div
          v-if="displayImage || !isRemoved"
          class="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 p-2 bg-linear-to-t from-black/70 to-transparent md:hidden"
        >
          <UButton
            type="button"
            color="primary"
            variant="solid"
            icon="i-lucide-upload"
            size="xs"
            square
            class="shadow-lg"
            :aria-label="displayImage ? t('form.change_image') : t('form.upload_image')"
            @click.stop="handleUploadClick"
          />
          <UButton
            v-if="displayImage"
            type="button"
            color="error"
            variant="solid"
            icon="i-lucide-trash-2"
            size="xs"
            square
            class="shadow-lg"
            :aria-label="t('form.remove_image')"
            @click.stop="handleRemove"
          />
        </div>
      </div>
    </div>
  </div>
</template>
