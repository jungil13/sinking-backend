<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  BellIcon,
  CheckCircleIcon,
  XMarkIcon,
  LockClosedIcon
} from '@heroicons/vue/24/outline'

const showSuccessAlert = ref(false)
const showErrorAlert = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

// User profile data
const userProfile = ref({
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  employment: '',
  monthlyIncome: 0,
  emergencyContact: '',
  emergencyPhone: ''
})

// Password change form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Settings categories
const settingsCategories = [
  { id: 'profile', name: 'Profile Information', icon: UserIcon },
  { id: 'security', name: 'Security Settings', icon: ShieldCheckIcon },
]

const activeCategory = ref('profile')

// Notification settings
const notificationSettings = ref({
  email: {
    contributions: true,
    loanUpdates: true,
    withdrawalStatus: true,
    generalUpdates: true
  },
  sms: {
    paymentReminders: true,
    emergencyAlerts: false,
    loanDueDates: true
  }
})

// Security settings
const securitySettings = ref({
  twoFactorAuth: false,
  loginNotifications: true,
  sessionTimeout: 30
})

// API functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

const fetchUserProfile = async () => {
  try {
    isLoading.value = true
    const response = await axios.get('http://localhost:5000/api/user/settings/profile', {
      headers: getAuthHeaders()
    })

    if (response.data.success) {
      const { user, member } = response.data.data
      
      // Update user profile with data from API
      userProfile.value = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: member?.phone || '',
        address: member?.address || '',
        employment: member?.employment || '',
        monthlyIncome: member?.monthlyIncome || 0,
        emergencyContact: member?.emergencyContact || '',
        emergencyPhone: member?.emergencyPhone || ''
      }
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    showErrorAlert.value = true
    errorMessage.value = 'Failed to load profile data'
    setTimeout(() => {
      showErrorAlert.value = false
    }, 3000)
  } finally {
    isLoading.value = false
  }
}

const saveProfile = async () => {
  try {
    isLoading.value = true
    const response = await axios.put('http://localhost:5000/api/user/settings/profile', userProfile.value, {
      headers: getAuthHeaders()
    })

    if (response.data.success) {
      showSuccessAlert.value = true
      successMessage.value = 'Profile updated successfully!'
      setTimeout(() => {
        showSuccessAlert.value = false
      }, 3000)
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    showErrorAlert.value = true
    errorMessage.value = error.response?.data?.message || 'Failed to update profile'
    setTimeout(() => {
      showErrorAlert.value = false
    }, 3000)
  } finally {
    isLoading.value = false
  }
}

const saveNotifications = () => {
  showSuccessAlert.value = true
  successMessage.value = 'Notification settings saved!'
  setTimeout(() => {
    showSuccessAlert.value = false
  }, 3000)
}

const changePassword = async () => {
  try {
    // Validate passwords
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      showErrorAlert.value = true
      errorMessage.value = 'New passwords do not match'
      setTimeout(() => {
        showErrorAlert.value = false
      }, 3000)
      return
    }

    if (passwordForm.value.newPassword.length < 6) {
      showErrorAlert.value = true
      errorMessage.value = 'New password must be at least 6 characters long'
      setTimeout(() => {
        showErrorAlert.value = false
      }, 3000)
      return
    }

    isLoading.value = true
    const response = await axios.put('http://localhost:5000/api/user/settings/password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    }, {
      headers: getAuthHeaders()
    })

    if (response.data.success) {
      showSuccessAlert.value = true
      successMessage.value = 'Password changed successfully!'
      
      // Clear form
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      
      setTimeout(() => {
        showSuccessAlert.value = false
      }, 3000)
    }
  } catch (error) {
    console.error('Error changing password:', error)
    showErrorAlert.value = true
    errorMessage.value = error.response?.data?.message || 'Failed to change password'
    setTimeout(() => {
      showErrorAlert.value = false
    }, 3000)
  } finally {
    isLoading.value = false
  }
}

const saveSecurity = () => {
  showSuccessAlert.value = true
  successMessage.value = 'Security settings updated!'
  setTimeout(() => {
    showSuccessAlert.value = false
  }, 3000)
}

const toggleTwoFactor = () => {
  securitySettings.value.twoFactorAuth = !securitySettings.value.twoFactorAuth
}

// Load user profile data when component mounts
onMounted(() => {
  fetchUserProfile()
})
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold mb-2">Account Settings</h1>
          <p class="text-blue-100 text-lg">Manage your profile information and preferences</p>
        </div>
        <div class="hidden md:block">
          <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <UserIcon class="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Settings Navigation -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Settings</h3>
          <nav class="space-y-2">
            <button
              v-for="category in settingsCategories"
              :key="category.id"
              @click="activeCategory = category.id"
              :class="{
                'w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200': true,
                'bg-blue-100 text-blue-700 shadow-md': activeCategory === category.id,
                'text-gray-600 hover:text-gray-900 hover:bg-gray-100': activeCategory !== category.id
              }"
            >
              <div class="flex items-center space-x-3">
                <component :is="category.icon" class="h-5 w-5" />
                <span>{{ category.name }}</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      <!-- Settings Content -->
      <div class="lg:col-span-3">
        <!-- Profile Information -->
        <div v-if="activeCategory === 'profile'" class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <UserIcon class="w-6 h-6 text-blue-600" />
              <h2 class="text-xl font-bold text-gray-900">Profile Information</h2>
            </div>
          </div>
          
          <form @submit.prevent="saveProfile" class="space-y-6">
            <!-- Personal Information -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    v-model="userProfile.firstName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    v-model="userProfile.lastName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div class="relative">
                    <EnvelopeIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      v-model="userProfile.email"
                      type="email"
                      class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div class="relative">
                    <PhoneIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      v-model="userProfile.phone"
                      type="tel"
                      class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Address Information -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Complete Address</label>
                <div class="relative">
                  <MapPinIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <textarea
                    v-model="userProfile.address"
                    rows="3"
                    class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter complete address"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Employment Information -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Employment</label>
                  <div class="relative">
                    <BriefcaseIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      v-model="userProfile.employment"
                      type="text"
                      class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter employment"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Monthly Income (₱)</label>
                  <div class="relative">
                    <CurrencyDollarIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      v-model="userProfile.monthlyIncome"
                      type="number"
                      class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter monthly income"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Emergency Contact -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                  <div class="relative">
                    <ExclamationTriangleIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      v-model="userProfile.emergencyContact"
                      type="text"
                      class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter emergency contact name"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone</label>
                  <div class="relative">
                    <PhoneIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      v-model="userProfile.emergencyPhone"
                      type="tel"
                      class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter emergency contact phone"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                :disabled="isLoading"
                class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Security Settings -->
        <div v-if="activeCategory === 'security'" class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <ShieldCheckIcon class="w-6 h-6 text-blue-600" />
              <h2 class="text-xl font-bold text-gray-900">Security Settings</h2>
            </div>
          </div>
          
          <div class="space-y-6">
            <!-- Change Password Section -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
              <form @submit.prevent="changePassword" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div class="relative">
                    <LockClosedIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      v-model="passwordForm.currentPassword"
                      type="password"
                      class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div class="relative">
                    <LockClosedIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      v-model="passwordForm.newPassword"
                      type="password"
                      class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div class="relative">
                    <LockClosedIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      v-model="passwordForm.confirmPassword"
                      type="password"
                      class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>
                
                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="isLoading"
                    class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ isLoading ? 'Changing...' : 'Change Password' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Other Security Settings -->
            <div class="border-t border-gray-200 pt-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Other Security Settings</h3>
              
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 class="font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p class="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <button
                  @click="toggleTwoFactor"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    securitySettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>

              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 class="font-medium text-gray-900">Login Notifications</h3>
                  <p class="text-sm text-gray-500">Get notified when someone logs into your account</p>
                </div>
                <button
                  @click="securitySettings.loginNotifications = !securitySettings.loginNotifications"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    securitySettings.loginNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      securitySettings.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>

              <div class="p-4 bg-gray-50 rounded-xl">
                <label class="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <input
                  v-model="securitySettings.sessionTimeout"
                  type="number"
                  min="5"
                  max="120"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div class="flex justify-end pt-6 border-t border-gray-200">
                <button
                  @click="saveSecurity"
                  class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Save Security Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div v-if="activeCategory === 'notifications'" class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <BellIcon class="w-6 h-6 text-blue-600" />
              <h2 class="text-xl font-bold text-gray-900">Notification Settings</h2>
            </div>
          </div>
          
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 class="font-medium text-gray-900">Contribution Updates</h4>
                    <p class="text-sm text-gray-500">Get notified about your contribution status</p>
                  </div>
                  <button
                    @click="notificationSettings.email.contributions = !notificationSettings.email.contributions"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      notificationSettings.email.contributions ? 'bg-blue-600' : 'bg-gray-200'
                    ]"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        notificationSettings.email.contributions ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                </div>

                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 class="font-medium text-gray-900">Loan Updates</h4>
                    <p class="text-sm text-gray-500">Receive updates about your loan applications</p>
                  </div>
                  <button
                    @click="notificationSettings.email.loanUpdates = !notificationSettings.email.loanUpdates"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      notificationSettings.email.loanUpdates ? 'bg-blue-600' : 'bg-gray-200'
                    ]"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        notificationSettings.email.loanUpdates ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">SMS Notifications</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 class="font-medium text-gray-900">Payment Reminders</h4>
                    <p class="text-sm text-gray-500">Get SMS reminders for upcoming payments</p>
                  </div>
                  <button
                    @click="notificationSettings.sms.paymentReminders = !notificationSettings.sms.paymentReminders"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      notificationSettings.sms.paymentReminders ? 'bg-blue-600' : 'bg-gray-200'
                    ]"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        notificationSettings.sms.paymentReminders ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-6 border-t border-gray-200">
              <button
                @click="saveNotifications"
                class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Save Notification Settings
              </button>
            </div>
          </div>
        </div>

        <!-- Preferences -->
        <div v-if="activeCategory === 'preferences'" class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <Cog6ToothIcon class="w-6 h-6 text-blue-600" />
              <h2 class="text-xl font-bold text-gray-900">Preferences</h2>
            </div>
          </div>
          
          <div class="text-center py-12">
            <Cog6ToothIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Preferences Coming Soon</h3>
            <p class="text-gray-500">Additional preference settings will be available in future updates.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Alert -->
    <div v-if="showSuccessAlert" class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn">
      <div class="flex items-center">
        <CheckCircleIcon class="h-5 w-5 mr-2" />
        {{ successMessage }}
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="showErrorAlert" class="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn">
      <div class="flex items-center">
        <XMarkIcon class="h-5 w-5 mr-2" />
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>