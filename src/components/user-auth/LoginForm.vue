<script setup>
    import { ref, computed, watch } from 'vue';
    import ValidatedInput from '../text-input/ValidatedInput.vue';
    import { useI18n } from 'vue-i18n';
    import api from '@/utils/api';
    import { motion } from 'motion-v';
    import { useRouter } from 'vue-router';

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const email = ref('');
    const password = ref('');
    const tokenPersist = ref(false);

    const loginErrorKey = ref('');
    
    const { t } = useI18n();
    const router = useRouter();

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
        if(isEmailValid.value) {
            const payload = {
                username: email.value,
                password: password.value,
                tokenPersist: tokenPersist.value
            }

            api.post('/auth/login', payload)
            .then( function(response) {
                const token = response.data.token;

                localStorage.setItem('token', token);
                router.push('/');
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
            id="email"
            v-model="email"
            placeholder="Email"
            type="text"
            :isValid="isEmailValid"
            :validationText="t('emailInvalid')"
        />

        <ValidatedInput
            id="password"
            v-model="password"
            :placeholder="t('password')"
            type="password"
            :isValid="isLoginValid"
            :validationText="loginErrorKey ? t(loginErrorKey) : ''"
        />

        <div class="login-options">
            <label id="remember-me">
                <input id="remember-me-checkbox" type="checkbox" v-model="tokenPersist">
                <span> {{ t('rememberMeText') }} </span>
            </label>

            <div id="forgot-password">
                <!-- TURN INTO LINK -->
                {{ t('forgotPasswordText') }}
            </div>
        </div>

        <motion.button 
            class="submit-button" 
            type="submit"
            :whilePress="{ scale: 0.95 }"
            >
            {{ t('loginButtonText') }}
        </motion.button>
    </form>
</template>

<style>
    #login-form {
        display: flex;
        flex-direction: column;
        gap: 32px;
    }

    .login-options {
        width: 300px;
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        font-weight: 400;
    }

    #remember-me {
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--color-subtext);
        cursor: pointer;
        position: relative;
    }

    #remember-me input {
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        height: 14px;
        width: 14px;
        border: 1px solid var(--color-subtext);
        border-radius: 4px;
    }

    #remember-me input:checked {
        background-color: var(--vt-c-highlight);
        border: var(--vt-c-highlight);
    }

    #remember-me input[type="checkbox"]:checked::after {
        content: "";
        position: absolute;
        left: 4px;
        top: 5px;
        width: 6px;
        height: 10px;
        border-width: 0 3px 3px 0;
        transform: rotate(45deg);
        border-color: white;
        border-style: solid;
    }

    #forgot-password {
        color: var(--vt-c-highlight);
    }
</style>