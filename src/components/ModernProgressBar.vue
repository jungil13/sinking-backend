<template>
  <div class="w-full">
    <!-- Label and Percentage -->
    <div v-if="showLabel || showPercentage" class="flex justify-between items-center mb-2">
      <span v-if="showLabel" class="text-sm font-medium text-gray-700">{{ label }}</span>
      <span v-if="showPercentage" class="text-sm text-gray-500">{{ Math.round(percentage) }}%</span>
    </div>

    <!-- Progress Bar Container -->
    <div 
      :class="[
        'w-full rounded-full overflow-hidden',
        sizeClasses,
        backgroundColorClass
      ]"
    >
      <!-- Progress Fill -->
      <div
        :class="[
          'h-full rounded-full transition-all duration-500 ease-out',
          progressColorClass,
          animated ? 'animate-pulse' : ''
        ]"
        :style="{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }"
      >
        <!-- Striped Pattern -->
        <div v-if="striped" class="h-full bg-stripes opacity-30"></div>
      </div>
    </div>

    <!-- Description -->
    <p v-if="description" class="text-xs text-gray-500 mt-1">{{ description }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100
  },
  label: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'danger', 'info'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  showPercentage: {
    type: Boolean,
    default: true
  },
  striped: {
    type: Boolean,
    default: false
  },
  animated: {
    type: Boolean,
    default: false
  }
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }
  return sizes[props.size] || sizes.md
})

const backgroundColorClass = computed(() => {
  return 'bg-gray-200'
})

const progressColorClass = computed(() => {
  const colors = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600',
    success: 'bg-gradient-to-r from-green-500 to-green-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    danger: 'bg-gradient-to-r from-red-500 to-red-600',
    info: 'bg-gradient-to-r from-blue-400 to-blue-500'
  }
  return colors[props.variant] || colors.primary
})
</script>

<style scoped>
.bg-stripes {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}
</style>
