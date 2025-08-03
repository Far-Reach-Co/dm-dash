export default function truncateString(str, maxLength, ending = '...') {
    if (typeof str !== 'string') return '';
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - ending.length) + ending;
} 