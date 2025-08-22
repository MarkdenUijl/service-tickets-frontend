<script setup>
    import { reactive, ref, computed, watch } from 'vue';
    import ValidatedInput from '../user-input/ValidatedInput.vue';
    import { useI18n } from 'vue-i18n';
    import api from '@/utils/api';
    import { useRouter } from 'vue-router';
    import { isEmail } from '@/utils/validators';
    import LoaderButton from '../buttons/LoaderButton.vue';

    const formData = reactive({
        email: '',
        password: '',
        tokenPersist: ''
    });

    const errors = reactive({
        login: '',
        email: ''
    });
    
    const { t } = useI18n();
    const router = useRouter();
    const loading = ref(false);
    
    const isEmailValid = computed(() => isEmail(formData.email) && !errors.email);
    const isLoginValid = computed(() => !errors.login);

    watch (() => formData.password, () => {
        errors.login = '';
    });

    watch (() => formData.email, () => {
        errors.login = '';
        errors.email = '';
    });

    const login = async () => {
        let isValid = true;

        if(formData.email === '') {
            errors.email = 'emptyFieldError';
            isValid = false;
        } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email.value)) {
            errors.email = 'emailInvalid';
            isValid = false;
        }

        if(formData.password === '') {
            errors.login = 'emptyFieldError';
            isValid = false;
        }

        if(isValid) {
            loading.value = true
            
            const payload = {
                username: formData.email,
                password: formData.password,
                tokenPersist: formData.tokenPersist
            }

            try {
                const response = await api.post('/auth/login', payload);
                const token = response.data.token;

                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                const userResponse = await api.get('/users/me');
                const user = userResponse.data;

                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('token', token);

                router.push('/dashboard/overview');
            } catch (error) {
                if (error.type === 'unauthorized') {
                    errors.email = 'emailIncorrect';
                } else {
                    errors.login = 'serverError';
                }
            } finally {
                loading.value = false;
            }
        } 
    }
</script>

<template>
    <form id="login-form" @submit.prevent="login">
        <ValidatedInput
            id="email"
            v-model="formData.email"
            placeholder="Email"
            type="text"
            :isValid="isEmailValid"
            :validationText="errors.email ? t(`auth.${errors.email}`) : ''"
        />

        <ValidatedInput
            id="password"
            v-model="formData.password"
            :placeholder="t('auth.password')"
            type="password"
            :isValid="isLoginValid"
            :validationText="errors.login ? t(`auth.${errors.login}`) : ''"
        />

        <div class="login-options">
            <label id="remember-me">
                <input id="remember-me-checkbox" type="checkbox" v-model="formData.tokenPersist">
                <span> {{ t('auth.rememberMeText') }} </span>
            </label>

            <div id="forgot-password">
                <!-- TURN INTO LINK -->
                {{ t('auth.forgotPasswordText') }}
            </div>
        </div>

        <LoaderButton
            :loading="loading.value"
            :label="t('auth.loginButtonText')"
            type="submit"
        />
    </form>
</template>

<style>
    #login-form {
        display: flex;
        flex-direction: column;
        align-items: center;
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
        background-color: var(--color-highlight);
        border: var(--color-highlight);
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
        color: var(--color-highlight);
    }
</style>