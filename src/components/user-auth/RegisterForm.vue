<script setup>
    import { reactive, computed, watch, ref, onMounted, onUnmounted  } from 'vue';
    import { useI18n } from 'vue-i18n';
    import { useRouter } from 'vue-router';
    import api from '@/utils/api'

    import ValidatedInput from '../user-input/ValidatedInput.vue';
    import LoaderButton from '../buttons/LoaderButton.vue';
    import { capitalizeWords } from '@/utils/capitalizeWords';
    import { isEmail, isStrongPassword } from '@/utils/validators';

    const inputWidth = ref('60%');

    const updateInputWidth = () => {
        inputWidth.value = window.innerWidth <= 635 ? '100%' : '60%';
    };

    onMounted(() => {
        updateInputWidth();
        window.addEventListener('resize', updateInputWidth);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', updateInputWidth);
    });

    const formData = reactive({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        passwordConfirmation: '',
    });

    const errors = reactive({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        passwordConfirmation: '',
    });

    const { t } = useI18n();
    const router = useRouter();
    const emit = defineEmits(['form-progress'])
    const loading = ref(false);

    const resetForm = () => {
        Object.keys(formData).forEach(key => formData[key] = '');
        Object.keys(errors).forEach(key => errors[key] = '');
    };

    const isFirstNameValid = computed(() => formData.firstName.length > 0);
    const isLastNameValid = computed(() => formData.lastName.length > 0);
    const isEmailValid = computed(() => isEmail(formData.email) && !errors.email);
    const isPasswordValid = computed(() => isStrongPassword(formData.password))

    const isPasswordConfirmationValid = computed(() =>
        formData.password.length > 0 &&
        formData.passwordConfirmation.length > 0 &&
        formData.password === formData.passwordConfirmation
    );

    const formCompletion = computed(() => {
        const validations = [
            isFirstNameValid.value,
            isLastNameValid.value,
            isEmailValid.value,
            isPasswordValid.value,
            isPasswordConfirmationValid.value,
        ];

        return (validations.filter(Boolean).length / validations.length) * 100;
    });

    watch(formCompletion, (val) => {
        emit('form-progress', val)
    });

    watch(() => formData.firstName, () => {
        errors.firstName = '';
    });

        watch(() => formData.lastName, () => {
        errors.lastName = '';
    });

    watch(() => formData.email, (val) => {
        if (isEmailValid.value) {
            errors.email = '';
            return;
        }

        if (val.length === 0) {
            errors.email = '';
        } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(val)) {
            errors.email = 'emailInvalid';
        } else {
            errors.email = '';
        }
    });

    watch(() => formData.password, (val) => {
        if (isPasswordValid.value) {
            errors.password = '';
            return;
        }

        if (val.length === 0) {
            errors.password = '';
        } else if (val.length < 8) {
            errors.password = 'passwordTooShort';
        } else if (!/[A-Z]/.test(val)) {
            errors.password = 'passwordMissingUppercase';
        } else if (!/[a-z]/.test(val)) {
            errors.password = 'passwordMissingLowercase';
        } else if (!/\d/.test(val)) {
            errors.password = 'passwordMissingDigit';
        } else if (!/[^A-Za-z\d]/.test(val)) {
            errors.password = 'passwordMissingSpecial';
        } else {
            errors.password = 'passwordInvalid';
        }
    });

   watch(
        [() => formData.password, () => formData.passwordConfirmation],
        ([newPassword, newConfirmation]) => {
            if (newConfirmation.length === 0) {
                errors.passwordConfirmation = '';
            } else if (newPassword.length === 0) {
                errors.passwordConfirmation = 'emptyFieldError';
            } else if (newPassword !== newConfirmation) {
                errors.passwordConfirmation = 'passwordMismatch';
            } else {
                errors.passwordConfirmation = '';
            }
        }
    );

    const register = async () => {
        let isValid = true;

        Object.entries({
            firstName: () => formData.firstName ? '' : 'emptyFieldError',
            lastName: () => formData.lastName ? '' : 'emptyFieldError',
            email: () => {
                if (!formData.email) return 'emptyFieldError';
                if (!isEmail(formData.email)) return 'emailInvalid';
                return '';
            },
            password: () => formData.password ? '' : 'emptyFieldError',
            passwordConfirmation: () => formData.passwordConfirmation ? '' : 'emptyFieldError',
        }).forEach(([field, validator]) => {
            const error = validator();
            
            if (error) {
                errors[field] = error;
                isValid = false;
            }
        });

        if (!isValid) return;

        loading.value = true;

        const payload = {
            firstName: capitalizeWords(formData.firstName),
            lastName: capitalizeWords(formData.lastName),
            email: formData.email.toLowerCase(),
            password: formData.password,
        };

        try {
            await api.post('/users', payload);
            resetForm();

            router.push('confirmation');
        } catch (error) {
            if (error.originalError?.status === 409) {
                errors.email = 'emailConflict';
            } else {
                errors.email = 'serverError';
            }
        } finally {
            loading.value = false;
        }
    };
</script>

<template>
    <form id="registration-form" @submit.prevent="register">
        <div id="registration-name-form">
            <ValidatedInput
                id="firstname"
                v-model="formData.firstName"
                :placeholder="t('auth.registerFirstName')"
                type="text"
                :isValid="isFirstNameValid"
                :validationText="errors.firstName ? t(`auth.${errors.firstName}`) : ''"
                validationMode="both"
                :style="{
                    width: inputWidth
                }"
            />
            
            <ValidatedInput
                id="lastname"
                v-model="formData.lastName"
                :placeholder="t('auth.registerLastName')"
                type="text"
                :isValid="isLastNameValid"
                :validationText="errors.lastName ? t(`auth.${errors.lastName}`) : ''"
                validationMode="both"
            />
        </div>
        
        <ValidatedInput
            id="email"
            v-model="formData.email"
            placeholder="Email"
            type="text"
            :isValid="isEmailValid"
            :validationText="errors.email ? t(`auth.${errors.email}`) : ''"
            validationMode="both"
        />

        <ValidatedInput
            id="password"
            v-model="formData.password"
            :placeholder="t('auth.password')"
            type="password"
            :isValid="isPasswordValid"
            :validationText="errors.password ? t(`auth.${errors.password}`) : ''"
            validationMode="both"
        />

        <ValidatedInput
            id="confirm-password"
            v-model="formData.passwordConfirmation"
            :placeholder="t('auth.passwordConfirm')"
            type="password"
            :isValid="isPasswordConfirmationValid"
            :validationText="errors.passwordConfirmation? t(`auth.${errors.passwordConfirmation}`) : ''"
            validationMode="both"
        />

        <LoaderButton
            :loading="loading"
            :label="t('auth.submitButtonText')"
            type="submit"
        />
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

    .firstname {
        width: 60%;
    }

    #return-button {
        display: flex;
        border: solid var(--color-highlight) 2px;
        align-items: center;
        justify-content: center;
        width: 300px;
        height: 44px;
        border-radius: 8px;
        box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    }

    #register-return-link {
        color: var(--color-highlight);
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

    @media (max-width: 635px) {
        #registration-name-form {
            flex-direction: column;
        }
    }
</style>