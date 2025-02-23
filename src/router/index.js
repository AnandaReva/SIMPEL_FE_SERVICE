// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/components/Login.vue';
import DashboardPage from '@/components/Dashboard.vue';
import VerifyOTP from '@/components/auths/VerifyOTP.vue';

const routes = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardPage,
        meta: { requiresAuth: true },
    },
    {
        path: '/login',
        name: 'login',
        component: LoginPage,
        meta: { requiresAuth: false },
    },
    {
        path: '/verify-otp',
        name: 'verify-otp',
        component: VerifyOTP,
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
    const otpExpirationTime = parseInt(sessionStorage.getItem("otp_expiration_time"), 10) || 0;
    const currentTime = Math.floor(Date.now() / 1000);

    const hasOTPSession = otpEmail && otpExpirationTime;
    const isOTPExpired = otpExpirationTime > 0 && currentTime > otpExpirationTime;

    // Jika sudah login dan mencoba ke /login, redirect ke /dashboard
    if (to.name === 'login' && isAuthenticated) {
        return next('/dashboard');
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

    // Jika semua kondisi aman, lanjutkan navigasi
    next();
});

export default router;
