// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/components/Login.vue';
import DashboardPage from '@/components/Dashboard.vue';

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
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Navigation Guard
router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem("session_id") && localStorage.getItem("session_hash");

    // Jika sudah login dan mencoba ke /login, redirect ke /dashboard
    if (to.name === 'login' && isAuthenticated) {
        next('/dashboard');
        return;
    }

    // Jika memerlukan autentikasi dan belum login, redirect ke /login
    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login'); 
    } else {
        next(); // Lanjutkan navigasi
    }
});

export default router;
