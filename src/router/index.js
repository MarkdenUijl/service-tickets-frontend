import { createRouter, createWebHistory } from 'vue-router';
import { isTokenValid } from '@/utils/auth';

const AuthLayout = () => import('@/layouts/AuthLayout.vue');
const AccountCreationConfirmationView = () => import('@/views/auth-views/AccountCreationConfirmationView.vue');
const LoginView = () => import('@/views/auth-views/LoginView.vue');
const RegisterView = () => import('@/views/auth-views/RegisterView.vue');

const DashboardLayout = () => import('@/layouts/DashboardLayout.vue');
const DashboardView = () => import('@/views/dashboard-views/DashboardView.vue');
const TicketView = () => import('@/views/dashboard-views/TicketView.vue');
const ProjectView = () => import('@/views/dashboard-views/ProjectView.vue');
const ContractView = () => import('@/views/dashboard-views/ContractView.vue');
const UsersView = () => import('@/views/dashboard-views/UsersView.vue');
const SettingsView = () => import('@/views/dashboard-views/SettingsView.vue');

const routes = [
    {
        path: '/auth',
        component: AuthLayout,
        beforeEnter(to, from, next) {
                    if( isTokenValid() ) {
                        next('/dashboard/overview');
                    } else {
                        next();
                    }
                },
        children: [
            {
                path: 'login',
                name: 'login',
                component: LoginView,
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
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: 'overview',
                name: 'overview',
                component: DashboardView
            },
            {
                path: 'tickets',
                name: 'tickets',
                component: TicketView
            },
            {
                path: 'projects',
                name: 'projects',
                component: ProjectView
            },
            {
                path: 'contracts',
                name: 'contracts',
                component: ContractView
            },
            {
                path: 'users',
                name: 'users',
                component: UsersView
            },
            {
                path: 'settings',
                name: 'settings',
                component: SettingsView
            },
        ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/auth/login' }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = isTokenValid();

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/auth/login');
    } else {
        next();
    }
});

export default router;