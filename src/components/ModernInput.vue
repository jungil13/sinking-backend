<template>
  <div class="space-y-2">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Input Container -->
    <div class="relative">
      <!-- Left Icon -->
      <div v-if="leftIcon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <component :is="leftIcon" class="h-5 w-5 text-gray-400" />
      </div>

      <!-- Input Field -->
      <input
        :id="inputId"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="[
          'block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 transition-all duration-200',
          leftIcon ? 'pl-10' : 'pl-4',
          rightIcon || showPasswordToggle ? 'pr-10' : 'pr-4',
          error ? 'ring-red-300 focus:ring-red-600' : '',
          disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
        ]"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <!-- Right Icon or Password Toggle -->
      <div v-if="rightIcon || showPasswordToggle" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <!-- Password Toggle -->
        <button
          v-if="showPasswordToggle"
          type="button"
          class="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
          @click="togglePasswordVisibility"
        >
          <EyeIcon v-if="!showPassword" class="h-5 w-5" />
          <EyeSlashIcon v-else class="h-5 w-5" />
        </button>
        
        <!-- Right Icon -->
        <component v-else-if="rightIcon" :is="rightIcon" class="h-5 w-5 text-gray-400" />
      </div>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="text-sm text-red-600 flex items-center">
      <ExclamationTriangleIcon class="h-4 w-4 mr-1" />
      {{ error }}
    </p>

    <!-- Help Text -->
    <p v-if="helpText && !error" class="text-sm text-gray-500">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  leftIcon: {
    type: [String, Object],
    default: null
  },
  rightIcon: {
    type: [String, Object],
    default: null
  },
  showPasswordToggle: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const showPassword = ref(false)
const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)

const inputType = computed(() => {
  if (props.type === 'password' && props.showPasswordToggle) {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}
</script>
