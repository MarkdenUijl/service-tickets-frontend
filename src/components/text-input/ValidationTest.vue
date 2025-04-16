<script setup>
    import { ref, computed } from 'vue';
    import ValidatedInput from './ValidatedInput.vue';
    import { useI18n } from 'vue-i18n';

    const email = ref('');
    const password = ref('');
    const { t } = useI18n();

    const isEmailValid = computed(() =>
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email.value)
    );

    const isPasswordValid = computed(() =>
        /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password.value)
    );

    const login = () => {
        if(isEmailValid && isPasswordValid) {
            const payload = {
                email: email.value,
                password: password.value
            }

            console.log(`Logged in with email ${payload.email} and password ${payload.password}.`)
        } else {
            console.log("Both email and password need to be filled.")
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
            :isValid="isPasswordValid"
            :validationText="t('passwordInvalid')"
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
        gap: 16px;
    }
</style>