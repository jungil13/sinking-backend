<template>
  <span
    :class="[
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
      variantClasses,
      sizeClasses
    ]"
  >
    <!-- Icon -->
    <component v-if="icon" :is="icon" class="w-3 h-3 mr-1" />
    
    <!-- Badge Text -->
    <span>{{ text }}</span>
    
    <!-- Dot -->
    <span v-if="showDot" :class="['w-2 h-2 rounded-full ml-2', dotColorClass]"></span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'success', 'warning', 'danger', 'info', 'primary', 'secondary'].includes(value)
  },
  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value)
  },
  icon: {
    type: [String, Object],
    default: null
  },
  showDot: {
    type: Boolean,
    default: false
  }
})

const variantClasses = computed(() => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-600 text-white'
  }
  return variants[props.variant] || variants.default
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-1.5 text-sm',
    lg: 'px-5 py-2 text-base'
  }
  return sizes[props.size] || sizes.sm
})

const dotColorClass = computed(() => {
  const colors = {
    default: 'bg-gray-400',
    success: 'bg-green-400',
    warning: 'bg-yellow-400',
    danger: 'bg-red-400',
    info: 'bg-blue-400',
    primary: 'bg-blue-400',
    secondary: 'bg-gray-400'
  }
  return colors[props.variant] || colors.default
})
</script>
