<script setup>
    import { ref, computed, watch } from 'vue';
    import { useI18n } from 'vue-i18n';
    import { motion } from 'motion-v';
    import { RouterLink } from 'vue-router';

    import LogoIcon from '@/components/graphic-items/LogoIcon.vue';
    import ValidatedInput from '../text-input/ValidatedInput.vue';

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const email = ref('');
    const password = ref('');
    const passwordConfirmation = ref('');

    const emailRegisterError = ref('');

    const passwordRegisterErrorKey = ref('');

    const passwordConfirmationError = ref('');

    const { t } = useI18n();

    const isEmailValid = computed(() =>
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email.value)
    );

    const isPasswordValid = computed(() => 
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\W]{9,}$/.test(password.value)
    );

    const isPasswordConfirmationValid = computed(() => 
        password.value.length > 0 && password.value === passwordConfirmation.value
    );

    const formCompletion = computed(() => {
        let count = 0;
        
        if(isEmailValid.value) count++;
        if(isPasswordValid.value) count++;
        if(isPasswordConfirmationValid.value) count++;

        return (count / 3) * 100;
    });

    watch (email, () => {
        if (emailRegisterError.value) {
            emailRegisterError.value = '';
        }
    });

    watch (password, (val) => {
        if (isPasswordValid.value) {
            passwordRegisterErrorKey.value = '';
            return;
        }

        if (val.length < 8) {
            passwordRegisterErrorKey.value = 'passwordTooShort';
        } else if (!/[A-Z]/.test(val)) {
            passwordRegisterErrorKey.value = 'passwordMissingUppercase';
        } else if (!/[a-z]/.test(val)) {
            passwordRegisterErrorKey.value = 'passwordMissingLowercase';
        } else if (!/\d/.test(val)) {
            passwordRegisterErrorKey.value = 'passwordMissingDigit';
        } else if (!/[^A-Za-z\d]/.test(val)) {
            passwordRegisterErrorKey.value = 'passwordMissingSpecial';
        } else {
            passwordRegisterErrorKey.value = 'passwordInvalid';
        }
    });

    watch (passwordConfirmation, () => {
        if (passwordConfirmationError.value) {
            passwordConfirmationError.value = '';
        }
    });

    const register = () => {
        console.log(`email: ${email.value}`)
        console.log(`password: ${password.value}`)
        console.log(`confirmation: ${passwordConfirmation.value}`)
    }
</script>

<template>
    <form id="registration-form" @submit.prevent="register">
        <div id="login-header-text">
            <div id="login-header-title">
                <LogoIcon />
                <span :style="{ 'font-weight' : 800, 'font-size' : '20px' }">HELVAR SERVICE TICKETS</span>
            </div>

            <span id="login-header-subtext">
                {{ t('registerHeaderSubtext') }}
            </span>
        </div> 
        
        <ValidatedInput
            id="email"
            v-model="email"
            placeholder="Email"
            type="text"
            :isValid="isEmailValid"
            :validationText="t('emailInvalid')"
            validationMode="both"
        />

        <ValidatedInput
            id="password"
            v-model="password"
            :placeholder="t('password')"
            type="password"
            :isValid="isPasswordValid"
            :validationText="passwordRegisterErrorKey ? t(passwordRegisterErrorKey) : ''"
            validationMode="both"
        />

        <ValidatedInput
            id="confirm-password"
            v-model="passwordConfirmation"
            :placeholder="t('passwordConfirm')"
            type="password"
            :isValid="isPasswordConfirmationValid"
            :validationText="t('passwordMismatch')"
            validationMode="both"
        />

        <motion.button 
            class="submit-button" 
            type="submit"
            :whilePress="{ scale: 0.95 }"
            >
            {{ t('submitButtonText') }}
        </motion.button>

        <motion.div 
            id="return-button" 
            :whilePress="{ scale: 0.95 }"
            >
            <RouterLink to="/auth/login" id="register-return-link">
                {{ t('registerReturnText') }}
            </RouterLink>
        </motion.div>

        <div id="register-progress-bar" >
            <div id="register-progress-fill" :style="{ width: formCompletion + '%' }">

            </div>
        </div>
    </form>
</template>

<style>
    #login-header-text {
        max-width: 300px;
    }

    #registration-form {
        height: inherit;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 32px;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    #return-button {
        display: flex;
        border: solid var(--vt-c-highlight) 2px;
        align-items: center;
        justify-content: center;
        width: 300px;
        height: 44px;
        border-radius: 8px;
        box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    }

    #register-return-link {
        color: var(--vt-c-highlight);
        font-family: 'Ubuntu';
        font-weight: 700;
        font-size: 16px;
        text-decoration: none;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #register-progress-bar {
        height: 8px;
        position: absolute;
        width: 100%;
        bottom: 0;
        overflow: hidden;
        display: flex;
        align-items: flex-start;
    }

    #register-progress-fill {
        height: 100%;
        background-color: var(--vt-c-green);
        transition: width 0.3s ease-in-out;
    }
</style>