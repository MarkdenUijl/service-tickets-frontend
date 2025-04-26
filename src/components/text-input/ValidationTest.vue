<script setup>
    import { ref, computed, watch } from 'vue';
    import ValidatedInput from './ValidatedInput.vue';
    import { useI18n } from 'vue-i18n';
    import axios from 'axios';

    const email = ref('');
    const password = ref('');
    const loginErrorKey = ref('');
    const { t } = useI18n();

    const isEmailValid = computed(() =>
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email.value)
    );

    const isPasswordValid = computed(() =>
        // /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password.value);
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

            // console.log(`Logged in with email ${payload.email} and password ${payload.password}.`);
            axios.post("https://localhost:8443/auth/login", payload)
            .then( function(response) {
                console.log(response);
            })
            .catch( function(error) {
                if (error.response.status === 401) {
                    loginErrorKey.value = 'emailIncorrect';
                } else {
                    loginErrorKey.value ='serverError';
                }
            })
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
        gap: 16px;
    }
</style>