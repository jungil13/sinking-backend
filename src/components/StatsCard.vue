<template>
  <div 
    :class="[
      'bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition-all duration-300',
      hoverEffect ? 'hover:shadow-xl hover:scale-105' : '',
      glassEffect ? 'bg-white/80 backdrop-blur-sm border-white/30' : ''
    ]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div :class="['p-3 rounded-xl', iconBackgroundClass]">
        <component :is="icon" :class="['w-6 h-6', iconColorClass]" />
      </div>
      <div v-if="trend" class="flex items-center space-x-1">
        <component 
          :is="trend > 0 ? 'ArrowUpIcon' : 'ArrowDownIcon'" 
          :class="[
            'w-4 h-4',
            trend > 0 ? 'text-green-500' : 'text-red-500'
          ]"
        />
        <span :class="[
          'text-sm font-medium',
          trend > 0 ? 'text-green-600' : 'text-red-600'
        ]">
          {{ Math.abs(trend) }}%
        </span>
      </div>
    </div>

    <!-- Content -->
    <div>
      <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ value }}</h3>
      <p class="text-sm text-gray-600">{{ label }}</p>
    </div>

    <!-- Progress Bar (Optional) -->
    <div v-if="showProgress && progress !== undefined" class="mt-4">
      <ModernProgressBar 
        :percentage="progress" 
        :variant="progressVariant"
        :size="'sm'"
        :show-label="false"
        :show-percentage="false"
      />
    </div>

    <!-- Footer -->
    <div v-if="footerText" class="mt-4 pt-4 border-t border-gray-100">
      <p class="text-xs text-gray-500">{{ footerText }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/vue/24/outline'
import ModernProgressBar from './ModernProgressBar.vue'

const props = defineProps({
  value: {
    type: [String, Number],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: [String, Object],
    required: true
  },
  trend: {
    type: Number,
    default: null
  },
  progress: {
    type: Number,
    default: undefined
  },
  progressVariant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'danger', 'info'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'danger', 'info', 'secondary'].includes(value)
  },
  hoverEffect: {
    type: Boolean,
    default: true
  },
  glassEffect: {
    type: Boolean,
    default: false
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  footerText: {
    type: String,
    default: ''
  }
})

const iconBackgroundClass = computed(() => {
  const backgrounds = {
    primary: 'bg-blue-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    danger: 'bg-red-100',
    info: 'bg-blue-100',
    secondary: 'bg-gray-100'
  }
  return backgrounds[props.variant] || backgrounds.primary
})

const iconColorClass = computed(() => {
  const colors = {
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
    secondary: 'text-gray-600'
  }
  return colors[props.variant] || colors.primary
})
</script>
