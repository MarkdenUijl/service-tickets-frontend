import { onMounted, onUnmounted, reactive } from "vue";

const EMPTY_USER = {
    firstName: '',
    lastName: '',
    email: ''
}

export function useCurrentUser() {
    let user = reactive({ ...EMPTY_USER});

    const loadUserFromStorage = () => {
        try {
            const stored = JSON.parse(localStorage.getItem('user') || '{}');

            if( typeof stored.firstName === 'string' ) Object.assign(user, stored);
            else Object.assign(user, EMPTY_USER); 
        } catch (error) {
            console.warn('Failed to parse user from localStorage', error);
        }
    };

    loadUserFromStorage();

    const handleStorageChange = (e) => {
        if( e.key === 'user' ) {
            loadUserFromStorage();
        }
    }

    onMounted(() => window.addEventListener('storage', handleStorageChange));

    onUnmounted(() => window.removeEventListener('storage', handleStorageChange));

    const setUser = (newUser) => {
        localStorage.setItem('user', JSON.stringify(newUser));
        Object.assign(user, newUser);
    };

    return { user, setUser };
}