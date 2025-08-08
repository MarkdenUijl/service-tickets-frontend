import { ref } from "vue";

const EMPTY_USER = {
    firstName: '',
    lastName: '',
    email: ''
}

export function useCurrentUser() {
    let user = ref(EMPTY_USER);

    try {
        const userRaw = localStorage.getItem('user');

        if (userRaw) {
            const maybeUser = JSON.parse(userRaw);

            if (
                typeof maybeUser === 'object' &&
                maybeUser !== null &&
                typeof maybeUser.firstName === 'string' &&
                typeof maybeUser.lastName === 'string' &&
                typeof maybeUser.email === 'string'
            ) {
                user.value = maybeUser;
            } 
        }
    } catch (error) {
        console.warn('Failed to parse user from localStorage', error);
    }

    return {
        user
    };
}