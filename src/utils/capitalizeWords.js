export function capitalizeWords(str) {
    return str
        .split(' ')
        .filter(word => word.trim() !== '')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}