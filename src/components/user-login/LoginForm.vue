<script setup>
    import { ref, computed, watch } from 'vue';
    import ValidatedInput from '../text-input/ValidatedInput.vue';
    import { useI18n } from 'vue-i18n';
    import api from '@/utils/api';

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const email = ref('');
    const password = ref('');
    const loginErrorKey = ref('');
    const { t } = useI18n();

    const isEmailValid = computed(() =>
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email.value)
    );

    const isLoginValid = computed(() =>
        loginErrorKey.value === ''
    );

    watch (password, () => {
        if (loginErrorKey.value) {
            loginErrorKey.value = '';
        }
    });

    watch (email, () => {
        if (loginErrorKey.value) {
            loginErrorKey.value = '';
        }
    });

    const login = () => {
        password
        if(isEmailValid.value) {
            const payload = {
                username: email.value,
                password: password.value
            }

            api.post('/auth/login', payload)
            .then( function(response) {
                const token = response.data.token;

                localStorage.setItem('token', token);
            })
            .catch( function(error) {
                if (error.type === 'unauthorized') {
                    loginErrorKey.value = 'emailIncorrect';
                } else if (error.type === 'network') {
                    loginErrorKey.value = 'serverError';
                } else {
                    loginErrorKey.value = 'serverError';
                }
            })
        } else {
            loginErrorKey.value = 'insufficientCredentialsError'
        }
    }
</script>

<template>
    <form id="login-form" @submit.prevent="login">
        <ValidatedInput
            v-model="email"
            placeholder="Email"
            type="text"
            :isValid="isEmailValid"
            :validationText="t('emailInvalid')"
        />

        <ValidatedInput
            v-model="password"
            :placeholder="t('password')"
            type="password"
            :isValid="isLoginValid"
            :validationText="loginErrorKey ? t(loginErrorKey) : ''"
        />

        <button class="btn btn-outline-dark" type="submit">
            Login
        </button>
    </form>
</template>

<style>
    #login-form {
        display: flex;
        flex-direction: column;
        gap: 32px;
    }
</style>