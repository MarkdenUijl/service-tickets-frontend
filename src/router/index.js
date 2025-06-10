import { createRouter, createWebHistory } from 'vue-router';
import { isTokenValid } from '@/utils/auth';

const DashboardView = () => import('@/views/DashboardView.vue');
const AccountCreationConfirmationView = () => import('@/views/auth-views/AccountCreationConfirmationView.vue');
const LoginView = () => import('@/views/auth-views/LoginView.vue');
const RegisterView = () => import('@/views/auth-views/RegisterView.vue');
const AuthLayout = () => import('@/layouts/AuthLayout.vue');
const DashboardLayout = () => import('@/layouts/DashboardLayout.vue');

const routes = [
    {
        path: '/auth',
        component: AuthLayout,
        children: [
            {
                path: 'login',
                name: 'login',
                component: LoginView,
                beforeEnter(to, from, next) {
                    if( isTokenValid() ) {
                        next('');
                    } else {
                        next();
                    }
                }
            },
            {
                path: 'register',
                name: 'register',
                component: RegisterView
            },
            {
                path: 'confirmation',
                name: 'confirmation',
                component: AccountCreationConfirmationView
            }
        ]
    },
    {
        path: '/',
        name: 'dashboard',
        component: DashboardLayout,
        meta: { requiresAuth: true }
    },
    { path: '/:pathMatch(.*)*', redirect: '/auth/login' }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// router.beforeEach((to, from, next) => {
//     const isAuthenticated = isTokenValid();

//     if (to.meta.requiresAuth && !isAuthenticated) {
//         next('auth/login');
//     } else {
//         next();
//     }
// });

export default router;