import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPassword.vue'),
    },
    {
  path: '/payment-success',
  name: 'payment-success',
  component: () => import('../views/PaymentSuccess.vue')
},
{
  path: '/payment-failed',
  name: 'payment-failed',
  component: () => import('../views/PaymentFailed.vue')
},

    // Admin Routes
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      redirect: '/admin/dashboard',
      meta: { requiresAuth: true, roles: ['admin'] },
      children: [
        { path: 'dashboard', name: 'AdminDashboard', component: () => import('../views/admin/Dashboard.vue') },
        { path: 'members', name: 'AdminMembers', component: () => import('../views/admin/Members.vue') },
        { path: 'registrations', name: 'AdminRegistrations', component: () => import('../views/admin/Registrations.vue') },
        { path: 'contributions', name: 'AdminContributions', component: () => import('../views/admin/Contributions.vue') },
        { path: 'loans', name: 'AdminLoans', component: () => import('../views/admin/Loans.vue') },
        { path: 'withdrawals', name: 'AdminWithdrawals', component: () => import('../views/admin/Withdrawals.vue') },
        { path: 'messages', name: 'AdminMessages', component: () => import('../views/admin/Messages.vue') },
        { path: 'reports', name: 'AdminReports', component: () => import('../views/admin/Reports.vue') },
        { path: 'notifications', name: 'AdminNotifications', component: () => import('../views/admin/Notifications.vue') },
        { path: 'settings', name: 'AdminSettings', component: () => import('../views/admin/Settings.vue') },
      ]
    },

    // Treasurer Routes
    {
      path: '/treasurer',
      component: () => import('../views/treasurer/TreasurerLayout.vue'),
      redirect: '/treasurer/dashboard',
      meta: { requiresAuth: true, roles: ['treasurer'] },
      children: [
        { path: 'dashboard', name: 'TreasurerDashboard', component: () => import('../views/treasurer/Dashboard.vue') },
        { path: 'members', name: 'TreasurerMembers', component: () => import('../views/treasurer/Members.vue') },
        { path: 'loans', name: 'TreasurerLoans', component: () => import('../views/treasurer/Loans.vue') },
        { path: 'withdrawals', name: 'TreasurerWithdrawals', component: () => import('../views/treasurer/Withdrawals.vue') },
        { path: 'messages', name: 'TreasurerMessages', component: () => import('../views/treasurer/Messages.vue') },
        { path: 'reports', name: 'TreasurerReports', component: () => import('../views/treasurer/Reports.vue') },
        { path: 'settings', name: 'TreasurerSettings', component: () => import('../views/treasurer/Settings.vue') },
      ]
    },

    // Committee Routes
    {
      path: '/committee',
      component: () => import('../views/committee/CommitteeLayout.vue'),
       redirect: '/committee/dashboard',  // ← fixed
      meta: { requiresAuth: true, roles: ['screening_committee'] },
      children: [
        { path: 'dashboard', name: 'CommitteeDashboard', component: () => import('../views/committee/Dashboard.vue') },
        { path: 'members', name: 'CommitteeMembers', component: () => import('../views/committee/Members.vue') },
        { path: 'loans', name: 'CommitteeLoans', component: () => import('../views/committee/Loans.vue') },
        { path: 'Messages', name: 'CommitteeMessages', component: () => import('../views/committee/Messages.vue') },
        { path: 'settings', name: 'CommitteeSettings', component: () => import('../views/committee/Settings.vue') },
      ]
    },

    // Member Routes
    {
      path: '/member',
      component: () => import('../views/members/MemberLayout.vue'),
      redirect: '/member/dashboard',
      meta: { requiresAuth: true, roles: ['member'] },
      children: [
        { path: 'dashboard', name: 'MemberDashboard', component: () => import('../views/members/Dashboard.vue') },
        { path: 'contributions', name: 'MemberContributions', component: () => import('../views/members/Contributions.vue') },
        { path: 'loans', name: 'MemberLoans', component: () => import('../views/members/LoanRepayment.vue') },
        { path: 'withdrawals', name: 'MemberWithdrawals', component: () => import('../views/members/Withdrawals.vue') },
        { path: 'messages', name: 'MemberMessages', component: () => import('../views/members/Messages.vue') },
        { path: 'notifications', name: 'MemberNotifications', component: () => import('../views/members/Notifications.vue') },
        { path: 'settings', name: 'MemberSettings', component: () => import('../views/members/Settings.vue') },
      ]
    }
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next("/login")
  }

  if (to.meta.roles && !authStore.hasAnyRole(to.meta.roles)) {
    // redirect user to their own dashboard if wrong role
    if (authStore.userRole) {
      return next(`/${authStore.userRole}/dashboard`)
    }
    return next("/login")
  }

  next()
})

export default router
