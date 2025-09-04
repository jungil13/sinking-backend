<template>
  <div 
    :class="[
      'bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300',
      hoverEffect ? 'hover:shadow-xl hover:scale-105' : '',
      glassEffect ? 'bg-white/80 backdrop-blur-sm border-white/30' : '',
      paddingClass
    ]"
  >
    <!-- Header -->
    <div v-if="title || $slots.header" class="px-6 py-4 border-b border-gray-100">
      <slot name="header">
        <h3 v-if="title" class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-gray-600 mt-1">{{ subtitle }}</p>
      </slot>
    </div>

    <!-- Content -->
    <div :class="contentClass">
      <slot></slot>
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  hoverEffect: {
    type: Boolean,
    default: true
  },
  glassEffect: {
    type: Boolean,
    default: false
  },
  paddingClass: {
    type: String,
    default: 'p-6'
  },
  contentClass: {
    type: String,
    default: 'p-6'
  }
})
</script>
