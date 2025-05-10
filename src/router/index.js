import { createRouter, createWebHistory } from 'vue-router';

import { isTokenValid } from '@/utils/auth';

const routes = [
    { 
        path: '/login', 
        name: 'login', 
        component: () => import('@/views/LoginView.vue'),
        beforeEnter(to, from, next) {
            if (isTokenValid()) {
                next('/');
            } else {
                next();
            }
        }
    },
    { 
        path: '/register', 
        name: 'register', 
        component: () => import('@/views/RegisterView.vue') 
    },
    { 
        path: '/', 
        name: 'dashboard', 
        component: () => import('@/views/DashboardView.vue'),
        meta: { requiresAuth: 'true' }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = isTokenValid();

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
    } else {
        next();
    }
});

export default router;