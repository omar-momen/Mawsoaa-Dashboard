<script setup lang="ts">
import type { FormInput, FormProps, FormValidation } from '~/types/form'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { getNestedValue } from '~/utils/nested-keys'

const props = defineProps<FormProps>()

const emit = defineEmits<{
  refresh: []
}>()

const formTitle = computed(() => {
  return props.mode === 'add' ? t('form.add') + ' ' + props.title : t('form.edit') + ' ' + props.title
})

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useToast()

// Delimiter regex for tags input (comma or space)
const tagsDelimiter = /[,\s]+/

// Initialize form state
const state = reactive<Record<string, unknown>>({})

// Function to initialize state
const initializeState = () => {
  props.inputs.forEach((input: FormInput) => {
    // In edit mode, use the value from currentRow or input.val
    if (props.mode === 'edit' && props.currentRow) {
      // Handle nested keys (e.g., 'name[ar]' -> 'name.ar')
      const rowValue = getNestedValue(props.currentRow, input.key) ?? props.currentRow[input.key]
      if (input.val !== undefined) {
        state[input.key] = input.val
      } else if (rowValue !== undefined && rowValue !== null) {
        if (input.type === 'tags') {
          if (Array.isArray(rowValue)) {
            if (rowValue.length > 0 && typeof rowValue[0] === 'object' && rowValue[0] !== null) {
              // Extract label from objects with id and label properties
              state[input.key] = rowValue.map((item: Record<string, unknown>) => {
                // Use label property, fallback to id or string representation
                return String(item.label ?? item.id ?? item)
              }).filter(Boolean)
            } else {
              // Already an array of strings/primitives
              state[input.key] = rowValue.map(String).filter(Boolean)
            }
          } else if (typeof rowValue === 'string') {
            state[input.key] = rowValue.split(/[,\s]+/).filter(Boolean)
          } else {
            state[input.key] = []
          }
        } else if (input.type === 'switch') {
          // Convert 0/1 to boolean for switch component
          state[input.key] = rowValue === 1 || rowValue === true
        } else {
          state[input.key] = rowValue
        }
      } else {
        if (input.type === 'tags') {
          state[input.key] = []
        } else if (input.type === 'switch') {
          state[input.key] = false
        } else {
          state[input.key] = ''
        }
      }
      return
    }

    // In add mode, initialize with default values
    if (input.multiple || input.type === 'tags') {
      state[input.key] = []
    } else if (input.type === 'switch') {
      state[input.key] = false
    } else if (input.type === 'number') {
      state[input.key] = null
    } else {
      // All text-based inputs (text, email, tel, password, textarea) default to empty string
      state[input.key] = ''
    }
  })
}

// Initialize state on mount
initializeState()

// Reset and reinitialize state when modal opens or mode/row changes
watch([() => open.value, () => props.mode, () => props.currentRow], () => {
  if (open.value) {
    initializeState()
  }
}, { deep: true })

// Validation function
const validate = (formState: Record<string, unknown>): FormError[] => {
  const errors: FormError[] = []

  props.inputs.forEach((input: FormInput) => {
    const value = formState[input.key]

    // Required validation
    if (input.required) {
      if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        errors.push({
          name: input.key,
          message: `${input.label} ${t('form.validation.is_required')}`
        })
      }
    }

    // Custom validations
    if (input.validations && input.validations.length > 0) {
      input.validations.forEach((validation: FormValidation) => {
        if (!validation.valid(value)) {
          errors.push({
            name: input.key,
            message: validation.message
          })
        }
      })
    }
  })

  return errors
}

// Loading state
const isSaving = ref(false)

// Handle form submission
const handleSubmit = async (_event: FormSubmitEvent<Record<string, unknown>>) => {
  isSaving.value = true

  try {
    const formData = new FormData()

    // Build FormData from state
    for (const key in state) {
      const value = state[key]

      // In edit mode, skip non-required fields that are null, empty, or undefined
      if (props.mode === 'edit') {
        const input = props.inputs.find(inp => inp.key === key)
        const isRequired = input?.required === true
        const isEmpty = value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)

        // Skip non-required empty fields in edit mode
        if (!isRequired && isEmpty) {
          continue
        }
      }

      // Handle arrays (for multiple selects)
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            // Extract value from object if it's a select option
            const obj = item as Record<string, unknown>
            const val = obj.id || obj.value || item
            formData.append(`${key}[${index}]`, String(val))
          } else {
            formData.append(`${key}[${index}]`, String(item))
          }
        })
      } else if (value instanceof File) {
        // Handle file uploads
        formData.append(key, value)
      } else if (typeof value === 'object' && value !== null) {
        // Handle object values (from select)
        const obj = value as Record<string, unknown>
        const val = obj.id || obj.value || value
        formData.append(key, String(val))
      } else if (typeof value === 'boolean') {
        // Convert boolean to 0/1 for switches
        const input = props.inputs.find(inp => inp.key === key)
        if (input?.type === 'switch') {
          formData.append(key, value ? '1' : '0')
        } else {
          formData.append(key, String(value))
        }
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value))
      }
    }

    // Make API call
    let error = null
    if (props.mode === 'edit' && props.currentRow?.id) {
      const result = await useClientApi(`${props.endpoint}/${props.currentRow.id}`, {
        method: 'POST',
        body: formData
      })
      error = result.error.value
      if (!error) {
        toast.add({
          title: t('form.success.title'),
          description: props.mode === 'edit' ? t('form.success.updated') : t('form.success.created'),
          color: 'success'
        })
      }
    } else {
      const result = await useClientApi(props.endpoint, {
        method: 'POST',
        body: formData
      })
      error = result.error.value
      if (!error) {
        toast.add({
          title: t('form.success.title'),
          description: props.mode === 'edit' ? t('form.success.updated') : t('form.success.created'),
          color: 'success'
        })
      }
    }

    // Only close slideover and refresh table on success
    if (!error) {
      emit('refresh')
      open.value = false
    }
  } finally {
    isSaving.value = false
  }
}

// Handle validation errors
const handleError = (event: { errors: FormError[] }) => {
  const firstError = event?.errors?.[0]
  if (firstError && 'id' in firstError && typeof firstError.id === 'string') {
    const element = document.getElementById(firstError.id)
    element?.focus()
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="formTitle"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UForm
        id="table-form"
        :state="state"
        :validate="validate"
        class="space-y-4"
        @submit="(event) => handleSubmit(event as FormSubmitEvent<Record<string, unknown>>)"
        @error="handleError"
      >
        <div
          v-for="input in inputs"
          :key="input.key"
        >
          <!-- Text Input -->
          <UFormField
            v-if="input.type === 'text'"
            :label="input.label"
            :name="input.key"
            :required="input.required"
            :hint="input.hint"
          >
            <UInput
              v-model="state[input.key] as string"
              :placeholder="input.placeholder"
              type="text"
            />
          </UFormField>

          <!-- Email Input -->
          <UFormField
            v-if="input.type === 'email'"
            :label="input.label"
            :name="input.key"
            :required="input.required"
            :hint="input.hint"
          >
            <UInput
              v-model="state[input.key] as string"
              :placeholder="input.placeholder"
              type="email"
            />
          </UFormField>

          <!-- Password Input -->
          <UFormField
            v-if="input.type === 'password'"
            :label="input.label"
            :name="input.key"
            :required="input.required"
            :hint="input.hint"
          >
            <UInput
              v-model="state[input.key] as string"
              :placeholder="input.placeholder"
              type="password"
            />
          </UFormField>

          <!-- Number Input -->
          <UFormField
            v-if="input.type === 'number'"
            :label="input.label"
            :name="input.key"
            :required="input.required"
            :hint="input.hint"
          >
            <UInputNumber
              v-model="state[input.key] as number | null"
              :placeholder="input.placeholder"
            />
          </UFormField>

          <!-- Textarea -->
          <UFormField
            v-if="input.type === 'textarea'"
            :label="input.label"
            :name="input.key"
            :required="input.required"
            :hint="input.hint"
          >
            <UTextarea
              v-model="state[input.key] as string"
              :placeholder="input.placeholder"
            />
          </UFormField>

          <!-- Switch -->
          <UFormField
            v-if="input.type === 'switch'"
            :label="input.label"
            :name="input.key"
            :required="input.required"
            :hint="input.hint"
          >
            <USwitch v-model="state[input.key] as boolean" />
          </UFormField>

          <!-- Select -->
          <UFormField
            v-if="input.type === 'select'"
            :label="input.label"
            :name="input.key"
            :required="input.required"
            :hint="input.hint"
          >
            <InputSelect
              v-if="input.getEndpoint"
              v-model="state[input.key] as Record<string, unknown> | Record<string, unknown>[] | null"
              :url="input.getEndpoint"
              :value-key="input.valueKey || 'id'"
              :label-key="input.labelKey || 'label'"
              :multiple="input.multiple"
              :placeholder="input.placeholder"
            />
            <InputSelect
              v-else
              v-model="state[input.key] as Record<string, unknown> | Record<string, unknown>[] | null"
              :static-options="input.options || []"
              :multiple="input.multiple"
              :placeholder="input.placeholder"
            />
          </UFormField>

          <!-- File Image Upload -->
          <UFormField
            v-if="input.type === 'file-image'"
            :label="input.label"
            :name="input.key"
            :required="input.required"
            :hint="input.hint"
          >
            <UFileUpload
              v-model="state[input.key] as File | null"
              accept="image/*"
              :label="input.placeholder || t('form.upload_image')"
            />
          </UFormField>

          <!-- Tags Input -->
          <UFormField
            v-if="input.type === 'tags'"
            :label="input.label"
            :name="input.key"
            :required="input.required"
            :hint="input.hint"
          >
            <UInputTags
              v-model="state[input.key] as string[]"
              :placeholder="input.placeholder"
              :delimiter="tagsDelimiter"
              :add-on-blur="true"
              :add-on-tab="true"
              class="w-full"
            />
          </UFormField>
        </div>
      </UForm>
    </template>

    <template #footer>
      <UButton
        color="neutral"
        variant="outline"
        :label="t('form.cancel')"
        @click="open = false"
      />
      <UButton
        :loading="isSaving"
        :label="t('form.save')"
        type="submit"
        form="table-form"
      />
    </template>
  </UModal>
</template>
