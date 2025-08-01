import { ref } from "vue";

export function useCurrentUser() {
    /* using composable for testing purposes and ensuring all infirmation is correct and expected */
    let user = ref(null);

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