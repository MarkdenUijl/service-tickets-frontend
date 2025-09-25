export function capitalizeWords(str) {
    /**
     * Capitalize the first letter of each word and lower-case the rest.
     * WHY: Filters out empty segments so multiple spaces don’t produce blanks.
     */
    return str
        .split(' ')
        .filter(word => word.trim() !== '')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}