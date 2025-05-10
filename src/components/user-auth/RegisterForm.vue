<script setup>
    import { ref, computed, watch } from 'vue';
    import { useI18n } from 'vue-i18n';
    import ValidatedInput from '../text-input/ValidatedInput.vue';

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const email = ref('');
    const password = ref('');
    const passwordConfirmation = ref('');
    const emailRegisterError = ref('');
    const passwordRegisterError = ref('');
    const passwordConfirmationError = ref('')
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


    watch (email, () => {
        if (emailRegisterError.value) {
            emailRegisterError.value = '';
        }
    });

    watch (password, () => {
        if (passwordRegisterError.value) {
            passwordRegisterError.value = '';
        }
    });

    watch (passwordConfirmation, () => {
        if (passwordConfirmationError.value) {
            passwordConfirmationError.value = '';
        }
    });
</script>

<template>
    <form id="registration-form" @submit.prevent="register">
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
            :validationText="t('passwordInvalid')"
            validationMode="both"
        />

        <ValidatedInput
            id="confirm-password"
            v-model="passwordConfirmation"
            :placeholder="t('passwordConfirm')"
            type="password"
            :isValid="isPasswordConfirmationValid"
            validationText="PLACEHOLDER"
            validationMode="both"
        />
    </form>
</template>

<style>
    #registration-form {
        border: double red 2px;
        height: inherit;
        display: flex;
        flex-direction: column;
        gap: 32px;
        justify-content: center;
        align-items: center;
    }
</style>