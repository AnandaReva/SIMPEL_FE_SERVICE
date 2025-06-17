import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/components/Login.vue';
//import DashboardPage from '@/components/Dashboard.vue';
import MonitoringPage from '@/components/monitoring/MonitoringPage.vue';


import ReportPage from '@/components/reports/ReportPage.vue';
/* import YearlyReport from '@/components/reports/YearlyReport.vue';
import MonthlyReport from '@/components/reports/MonthlyReport.vue';
import DailyReport from '@/components/reports/DailyReport.vue'
import DayDetailReport from '@/components/reports/DayDetailReport.vue';
 */

import DeviceManagement from '@/components/device_management/DeviceManagement.vue';
import AddDevice from '@/components/device_management/AddDevice.vue';
import EditDevice from '@/components/device_management/EditDevice.vue';

import UserManagementPage from '@/components/user_management/UserManagement.vue';
import AddUser from '@/components/user_management/Adduser.vue';

import EditUser from '@/components/user_management/EditUser.vue';


import SettingsPage from '@/components/Settings.vue';


import VerifyOTP from '@/components/auths/VerifyOTP.vue';
import ResetPassword from '@/components/auths/ResetPassword.vue';
import VerifyResetPassword from '@/components/auths/VerifyResetPassword.vue';

const routes = [
    {
        path: '/',
        redirect: '/monitoring'
    },
    // {
    //     path: '/dashboard',
    //     name: 'dashboard',
    //     component: DashboardPage,
    //     meta: { requiresAuth: true },
    // },
    {
        path: '/monitoring',
        name: 'monitoring',
        component: MonitoringPage,
        meta: { requiresAuth: true },
    },

    {
        path: '/report/',
        name: 'report',
        component: ReportPage,
        meta: { requiresAuth: true, parent: 'report' },
    },

    {
        path: '/users',
        name: 'user-management',
        component: UserManagementPage,
        meta: { requiresAuth: true },
    },
        {
        path: '/user/add',
        name: 'user-add',
        component: AddUser,
        meta: { requiresAuth: true, parent: 'user-management' },
    },
    {
        path: '/user/edit/:username',
        name: 'user-edit',
        component: EditUser,
        meta: { requiresAuth: true, parent: 'user-management' },
    },


    // device managements

    {
        path: '/device',
        name: 'device-management',
        component: DeviceManagement,
        meta: { requiresAuth: true },
    },
    {
        path: '/device/add',
        name: 'device-add',
        component: AddDevice,
        meta: { requiresAuth: true, parent: 'device-management' },
    },
    {
        path: '/device/edit/:device_name',
        name: 'device-edit',
        component: EditDevice,
        meta: { requiresAuth: true, parent: 'device-management' },
    },


    {
        path: '/settings',
        name: 'settings',
        component: SettingsPage,
        meta: { requiresAuth: true },
    },







    {
        path: '/login',
        name: 'login',
        component: LoginPage,
        meta: { requiresAuth: false },
    },
    // {
    //     path: '/verify-otp',
    //     name: 'verify-otp',
    //     component: VerifyOTP,
    //     meta: { requiresAuth: false },
    // },
    {
        path: '/reset-password',
        name: 'reset-password',
        component: ResetPassword,
        meta: { requiresAuth: false },
    },
    {
        path: '/reset-password-confirm/:signature',
        name: 'reset-password-confirm',
        component: VerifyResetPassword,
        meta: { requiresAuth: false },
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Navigation Guard
router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem("session_id") && localStorage.getItem("session_hash");
    const otpEmail = sessionStorage.getItem("otp_data");
    const expireTstamp = parseInt(sessionStorage.getItem("otp_expire_tstamp"), 10) || 0;

    const currentTime = Math.floor(Date.now() / 1000);
    const RemainingTime = expireTstamp - currentTime;
    const hasOTPSession = otpEmail && expireTstamp;
    const isOTPExpired = RemainingTime <= 0;

    // Jika sudah login dan mencoba ke /login, redirect ke /dashboard
    if (to.name === 'login' && isAuthenticated) {
        return next('/monitoring');
    }

    // Jika memerlukan autentikasi dan belum login, redirect ke /login
    if (to.meta.requiresAuth && !isAuthenticated) {
        return next('/login');
    }

    // Jika mencoba ke /verify-otp tetapi tidak ada sesi OTP atau OTP sudah expired
    if (to.name === 'verify-otp' && (!hasOTPSession || isOTPExpired)) {
        console.warn("OTP tidak valid atau sudah kadaluarsa. Mengembalikan ke halaman sebelumnya.");
        return next(from.fullPath && from.fullPath !== '/verify-otp' ? from.fullPath : '/');
    }

    // Jika path tidak terdaftar dalam router, kembali ke halaman sebelumnya atau ke `/`
    if (to.matched.length === 0) {
        console.warn(`Path ${to.fullPath} tidak terdaftar. Kembali ke halaman sebelumnya.`);
        return next(from.fullPath && from.fullPath !== to.fullPath ? from.fullPath : '/');
    }

    // Jika user masuk ke halaman reset-password, biarkan tanpa redirect
    if (to.name === 'reset-password' || to.name === 'reset-password-confirm') {
        return next();
    }

    // Jika semua kondisi aman, lanjutkan navigasi
    next();
});

export default router;
