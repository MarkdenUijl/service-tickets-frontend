export function isTokenValid() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp > currentTime) {
            return true;
        } else {
            logout();
            return false;
        }

    } catch (e) {
        logout();
        return false;
    }
}

export function logout() {
    localStorage.removeItem('token');
    window.location.href('/login');
}