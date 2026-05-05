/**
 * Utility function to format timestamps as relative time (e.g., "2 hrs ago")
 * @param {string|Date} timestamp - ISO format string or Date object
 * @returns {string} Formatted time like "2 hrs ago", "5 mins ago", etc.
 */
function formatTimeAgo(timestamp) {
    if (!timestamp) return '';

    // Convert to Date object if string
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const secondsAgo = Math.floor((now - date) / 1000);

    // Handle edge case for future dates
    if (secondsAgo < 0) {
        return 'just now';
    }

    // Less than a minute
    if (secondsAgo < 60) {
        return 'just now';
    }

    // Minutes
    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) {
        return minutesAgo === 1 ? '1 min ago' : `${minutesAgo} mins ago`;
    }

    // Hours
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) {
        return hoursAgo === 1 ? '1 hr ago' : `${hoursAgo} hrs ago`;
    }

    // Days
    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo < 7) {
        return daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
    }

    // Weeks
    const weeksAgo = Math.floor(daysAgo / 7);
    if (weeksAgo < 4) {
        return weeksAgo === 1 ? '1 week ago' : `${weeksAgo} weeks ago`;
    }

    // Months
    const monthsAgo = Math.floor(daysAgo / 30);
    if (monthsAgo < 12) {
        return monthsAgo === 1 ? '1 month ago' : `${monthsAgo} months ago`;
    }

    // Years
    const yearsAgo = Math.floor(monthsAgo / 12);
    return yearsAgo === 1 ? '1 year ago' : `${yearsAgo} years ago`;
}

/**
 * Format timestamp as readable date (e.g., "Oct 24, 2026 at 2:30 PM")
 * @param {string|Date} timestamp - ISO format string or Date object
 * @returns {string} Formatted date string
 */
function formatFullDate(timestamp) {
    if (!timestamp) return '';

    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    if (isNaN(date.getTime())) return '';

    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
