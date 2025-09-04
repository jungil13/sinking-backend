<script setup>
import { ref, onMounted } from 'vue'

// Reactive data for animations
const stats = ref([
  { number: '500+', label: 'Active Members', icon: '👥' },
  { number: '₱2.5M+', label: 'Total Contributions', icon: '💰' },
  { number: '₱1.8M+', label: 'Loans Disbursed', icon: '🏦' },
  { number: '98%', label: 'Satisfaction Rate', icon: '⭐' }
])

const features = ref([
  {
    icon: '💳',
    title: 'Smart Contributions',
    description: 'Track and manage member contributions with automated calculations and reporting.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: '🏦',
    title: 'Easy Loans',
    description: 'Streamlined loan application and approval process with built-in risk assessment.',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: '📊',
    title: 'Real-time Reports',
    description: 'Comprehensive financial reports and analytics to make informed decisions.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: '🔒',
    title: 'Secure Transactions',
    description: 'Bank-level security with encrypted data and secure payment processing.',
    color: 'from-red-500 to-red-600'
  },
  {
    icon: '📱',
    title: 'Mobile Friendly',
    description: 'Access your account anywhere with our responsive mobile interface.',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    icon: '⚡',
    title: 'Fast Processing',
    description: 'Quick approval times and instant notifications for all transactions.',
    color: 'from-yellow-500 to-yellow-600'
  }
])

const testimonials = ref([
  {
    name: 'Maria Santos',
    role: 'Member since 2020',
    content: 'FundEase has made managing my contributions so much easier. The interface is intuitive and the support is excellent.',
    avatar: '👩‍💼'
  },
  {
    name: 'John Dela Cruz',
    role: 'Business Owner',
    content: 'The loan process was smooth and fast. I got approved within 24 hours and the funds were in my account the next day.',
    avatar: '👨‍💼'
  },
  {
    name: 'Ana Rodriguez',
    role: 'Teacher',
    content: 'I love the real-time reports and notifications. It keeps me informed about all my financial activities.',
    avatar: '👩‍🏫'
  }
])

const isVisible = ref(false)

onMounted(() => {
  isVisible.value = true
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
    <!-- Hero Section -->
    <div class="relative min-h-screen flex items-center justify-center p-4">
      <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute top-40 left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div class="absolute top-20 right-20 w-60 h-60 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>
      </div>

      <!-- Floating Elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full animate-float"></div>
        <div class="absolute top-1/3 right-1/3 w-6 h-6 bg-green-400 rounded-full animate-float animation-delay-1000"></div>
        <div class="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-400 rounded-full animate-float animation-delay-2000"></div>
        <div class="absolute bottom-1/3 right-1/4 w-5 h-5 bg-yellow-400 rounded-full animate-float animation-delay-3000"></div>
    </div>

      <div class="relative z-10 w-full max-w-6xl text-center">
        <!-- Main Header -->
        <div class="mb-16" :class="{ 'animate-fade-in-up': isVisible }">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mb-8 animate-pulse">
            <span class="text-3xl">🏦</span>
          </div>
          <h1 class="text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome to <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 animate-gradient">FundEase</span>
        </h1>
          <p class="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Your trusted sinking fund management platform for managing contributions, loans, and withdrawals with ease and security.
        </p>
      </div>

        <!-- Statistics -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16" :class="{ 'animate-fade-in-up': isVisible }" style="animation-delay: 0.2s">
          <div v-for="(stat, index) in stats" :key="index" 
               class="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div class="text-4xl mb-2">{{ stat.icon }}</div>
            <div class="text-3xl font-bold text-gray-900 mb-1">{{ stat.number }}</div>
            <div class="text-sm text-gray-600">{{ stat.label }}</div>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="space-y-6" :class="{ 'animate-fade-in-up': isVisible }" style="animation-delay: 0.4s">
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link 
              to="/login"
              class="group bg-gradient-to-r from-blue-600 to-green-600 text-white px-10 py-5 rounded-2xl font-semibold text-xl hover:from-blue-700 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              <span class="flex items-center justify-center gap-2">
                Sign In
                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </span>
            </router-link>
            <router-link 
              to="/register"
              class="group bg-white/90 backdrop-blur-sm text-gray-700 px-10 py-5 rounded-2xl font-semibold text-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              <span class="flex items-center justify-center gap-2">
                Create Account
                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
              </span>
            </router-link>
          </div>
          
          <p class="text-lg text-gray-500">
            Already have an account? 
            <router-link to="/login" class="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              Sign in here
            </router-link>
          </p>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="py-20 bg-white/50 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-5xl font-bold text-gray-900 mb-6">Why Choose FundEase?</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of sinking fund management with our cutting-edge features and user-friendly interface.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="(feature, index) in features" :key="index" 
               class="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div class="w-16 h-16 bg-gradient-to-r rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" :class="feature.color">
              <span class="text-3xl">{{ feature.icon }}</span>
            </div>
            <h3 class="text-2xl font-semibold text-gray-900 mb-4 text-center">{{ feature.title }}</h3>
            <p class="text-gray-600 text-center leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Testimonials Section -->
    <div class="py-20 bg-gradient-to-r from-blue-50 to-green-50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-5xl font-bold text-gray-900 mb-6">What Our Members Say</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied members who trust FundEase for their financial needs.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="(testimonial, index) in testimonials" :key="index" 
               class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">{{ testimonial.avatar }}</span>
              </div>
              <h4 class="text-xl font-semibold text-gray-900">{{ testimonial.name }}</h4>
              <p class="text-gray-600">{{ testimonial.role }}</p>
            </div>
            <p class="text-gray-700 italic text-center leading-relaxed">"{{ testimonial.content }}"</p>
            <div class="flex justify-center mt-4">
              <div class="flex space-x-1">
                <span v-for="i in 5" :key="i" class="text-yellow-400 text-xl">⭐</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

    <!-- CTA Section -->
    <div class="py-20 bg-gradient-to-r from-blue-600 to-green-600">
      <div class="max-w-4xl mx-auto text-center px-4">
        <h2 class="text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
        <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join FundEase today and experience the most advanced sinking fund management platform.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link 
            to="/register"
            class="bg-white text-blue-600 px-10 py-5 rounded-2xl font-semibold text-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
          >
            Get Started Now
          </router-link>
          <router-link 
            to="/login"
            class="bg-transparent border-2 border-white text-white px-10 py-5 rounded-2xl font-semibold text-xl hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300"
          >
            Sign In
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.animation-delay-6000 {
  animation-delay: 6s;
}

.animation-delay-1000 {
  animation-delay: 1s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-3000 {
  animation-delay: 3s;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-fade-in-up {
  animation: fadeInUp 1s ease-out forwards;
}

.animate-gradient {
  animation: gradient 3s ease infinite;
}

@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #10b981);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #2563eb, #059669);
}
</style>
