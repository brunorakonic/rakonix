// Encode database values before placing them in HTML text or quoted attributes.
export function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
}

export function safeDownloadUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
        const url = new URL(value.trim());
        return ['http:', 'https:'].includes(url.protocol) && url.hostname && !url.username && !url.password
            ? url.href : '';
    } catch {
        return '';
    }
}
