<script setup>
    import { ref, computed, watch } from 'vue';
    import { useI18n } from 'vue-i18n';
    import { motion } from 'motion-v';

    import ValidatedInput from '../text-input/ValidatedInput.vue';
    import { capitalizeWords } from '@/utils/capitalizeWords';

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const firstName = ref('');
    const lastName = ref('');
    const email = ref('');
    const password = ref('');
    const passwordConfirmation = ref('');
    const passwordRegisterErrorKey = ref('');

    const { t } = useI18n();
    const emit = defineEmits(['form-progress'])

    const isFirstNameValid = computed(() => firstName.value.length > 0);
    const isLastNameValid = computed(() => lastName.value.length > 0);

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

        if (isFirstNameValid.value) count++;
        if (isLastNameValid.value) count++;
        if(isEmailValid.value) count++;
        if(isPasswordValid.value) count++;
        if(isPasswordConfirmationValid.value) count++;

        return (count / 5) * 100;
    });

    watch(formCompletion, (val) => {
        emit('form-progress', val)
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

    const register = () => {
        firstName.value = capitalizeWords(firstName.value);
        lastName.value = capitalizeWords(lastName.value);

        console.log(`first name: ${firstName.value}`)
        console.log(`last name: ${lastName.value}`)
        console.log(`email: ${email.value}`)
        console.log(`password: ${password.value}`)
        console.log(`confirmation: ${passwordConfirmation.value}`)
    }
</script>

<template>
    <form id="registration-form" @submit.prevent="register">
        <div id="registration-name-form">
            <ValidatedInput
                id="firstname"
                v-model="firstName"
                placeholder="First name"
                type="text"
                :isValid="isFirstNameValid"
                validationMode="both"
                :style="{
                    width: '60%'
                }"
            />
            
            <ValidatedInput
                id="lastname"
                v-model="lastName"
                placeholder="Last name"
                type="text"
                :isValid="isLastNameValid"
                validationMode="both"
            />
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
    </form>
</template>

<style>
    #registration-form {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 16px;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    #registration-name-form {
        width: 100%;
        display: flex;
        flex-direction: row;
        gap: 8px;
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
</style>