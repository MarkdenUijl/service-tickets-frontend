<script setup>
    import { ref, computed, watch } from 'vue';
    import { useI18n } from 'vue-i18n';
    import { motion } from 'motion-v';
    import { useRouter } from 'vue-router';
    import api from '@/utils/api'

    import ValidatedInput from '../text-input/ValidatedInput.vue';
    import { capitalizeWords } from '@/utils/capitalizeWords';

    const firstName = ref('');
    const lastName = ref('');
    const email = ref('');
    const password = ref('');
    const passwordConfirmation = ref('');

    const firstNameErrorKey = ref('');
    const lastNameErrorKey = ref('');
    const emailRegisterErrorKey = ref('');
    const passwordRegisterErrorKey = ref('');
    const passwordConfirmationErrorKey = ref('');

    const { t } = useI18n();
    const router = useRouter();
    const emit = defineEmits(['form-progress'])

    const resetForm = () => {
        firstName.value = '';
        lastName.value = '';
        email.value = '';
        password.value = '';
        passwordConfirmation.value = '';

        firstNameErrorKey.value = '';
        lastNameErrorKey.value = '';
        emailRegisterErrorKey.value = '';
        passwordRegisterErrorKey.value = '';
        passwordConfirmationErrorKey.value = '';
    };

    const isFirstNameValid = computed(() => firstName.value.length > 0);
    const isLastNameValid = computed(() =>  lastName.value.length > 0);

    const isEmailValid = computed(() =>
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email.value) && emailRegisterErrorKey.value === ''
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

    watch(firstName, () => {
        firstNameErrorKey.value = '';
    });

    watch(lastName, () => {
        lastNameErrorKey.value = '';
    });

    watch (email, (val) => {
        if (isEmailValid.value) {
            isEmailValid.value = '';
            return;
        }
        
        if (val.length === 0) {
            emailRegisterErrorKey.value = '';
        } else if (! /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(val)) {
            emailRegisterErrorKey.value = 'emailInvalid';
        } else {
            emailRegisterErrorKey.value = '';
        }
    });

    watch (password, (val) => {
        if (isPasswordValid.value) {
            passwordRegisterErrorKey.value = '';
            return;
        }

        if (val.length === 0) {
            passwordRegisterErrorKey.value = '';
        } else if (val.length < 8) {
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

    watch([password, passwordConfirmation], ([newPassword, newConfirmation]) => {
        if (newConfirmation.length === 0) {
            passwordConfirmationErrorKey.value = '';
        } else if (newPassword !== newConfirmation) {
            passwordConfirmationErrorKey.value = 'passwordMismatch';
        } else {
            passwordConfirmationErrorKey.value = '';
        }
    });

    const register = () => {
        let isValid = true;

        if(firstName.value === '') {
            firstNameErrorKey.value = 'emptyFieldError';
            isValid = false;
        }

        if(lastName.value === '') {
            lastNameErrorKey.value = 'emptyFieldError';
            isValid = false;
        }

        if(email.value === '') {
            emailRegisterErrorKey.value = 'emptyFieldError';
            isValid = false;
        } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email.value)) {
            emailRegisterErrorKey.value = 'emailInvalid';
            isValid = false;
        }

        if(password.value === '') {
            passwordRegisterErrorKey.value = 'emptyFieldError';
            isValid = false;
        }

        if(passwordConfirmation.value === '') {
            passwordConfirmationErrorKey.value = 'emptyFieldError';
            isValid = false;
        }

        if (isValid) {
            firstName.value = capitalizeWords(firstName.value);
            lastName.value = capitalizeWords(lastName.value);

            const payload = {
                firstName: firstName.value,
                lastName: lastName.value,
                email: email.value,
                password: password.value
            }

            api.post('/users', payload)
            .then( function(response) {
                console.log(response);
                resetForm();
                router.push('auth/login');
            })
            .catch( function(error) {
                if (error.originalError.status === 409) {
                    emailRegisterErrorKey.value = 'emailConflict';
                    console.log('There was already an account with this name')
                } else if (error.type === 'network') {
                    emailRegisterErrorKey.value = 'serverError';
                } else {
                    emailRegisterErrorKey.value = 'serverError';
                }
            })
        }
    }
</script>

<template>
    <form id="registration-form" @submit.prevent="register">
        <div id="registration-name-form">
            <ValidatedInput
                id="firstname"
                v-model="firstName"
                :placeholder="t('registerFirstName')"
                type="text"
                :isValid="isFirstNameValid"
                :validationText="firstNameErrorKey ? t(firstNameErrorKey) : ''"
                validationMode="both"
                :style="{
                    width: '60%'
                }"
            />
            
            <ValidatedInput
                id="lastname"
                v-model="lastName"
                :placeholder="t('registerLastName')"
                type="text"
                :isValid="isLastNameValid"
                :validationText="lastNameErrorKey ? t(lastNameErrorKey) : ''"
                validationMode="both"
            />
        </div>
        
        <ValidatedInput
            id="email"
            v-model="email"
            placeholder="Email"
            type="text"
            :isValid="isEmailValid"
            :validationText="emailRegisterErrorKey ? t(emailRegisterErrorKey) : ''"
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
            :validationText="passwordConfirmationErrorKey? t(passwordConfirmationErrorKey) : ''"
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