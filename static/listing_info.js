document.addEventListener('DOMContentLoaded', () => {
    const connectBtn = document.getElementById('connect-btn');
    const reportBtn = document.getElementById('report-btn');
    const reportModal = document.getElementById('report-modal');
    const cancelReportBtn = document.getElementById('cancel-report-btn');
    const reportForm = document.getElementById('report-form');

    // Format the listing timestamp
    const timestampEl = document.getElementById('listing-timestamp');
    if (timestampEl) {
        const iso = timestampEl.getAttribute('data-timestamp');
        if (iso) {
            timestampEl.textContent = formatTimeAgo(iso);
            setInterval(() => { timestampEl.textContent = formatTimeAgo(iso); }, 60000);
        }
    }

    // Read post and owner IDs from the container
    const container = document.querySelector('[data-post-id]');
    const postId = container ? container.dataset.postId : null;
    const ownerId = container ? container.dataset.ownerId : null;

    // Connect button → redirect to messages page for this listing
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            if (postId && ownerId) {
                window.location.href = `/messages?post_id=${postId}&user_id=${ownerId}`;
            } else {
                window.location.href = '/messages';
            }
        });
    }

    // Report modal
    if (reportBtn) {
        reportBtn.addEventListener('click', () => reportModal.classList.add('active'));
    }

    if (cancelReportBtn) {
        cancelReportBtn.addEventListener('click', () => reportModal.classList.remove('active'));
    }

    if (reportForm) {
        reportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const reason = new FormData(reportForm).get('report-reason');
            alert(`Report submitted: "${reason}". An admin will review this listing.`);
            reportModal.classList.remove('active');
        });
    }
});
