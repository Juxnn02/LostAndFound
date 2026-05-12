document.addEventListener('DOMContentLoaded', () => {
    const connectBtn = document.getElementById('connect-btn');
    const reportBtn = document.getElementById('report-btn');
    const reportModal = document.getElementById('report-modal');
    const cancelReportBtn = document.getElementById('cancel-report-btn');
    const reportForm = document.getElementById('report-form');
    const claimToggle = document.getElementById('claim-toggle');
    const claimLabel = document.querySelector('.claim-label');

    // Format the listing timestamp
    const timestampEl = document.getElementById('listing-timestamp');
    if (timestampEl) {
        const iso = timestampEl.getAttribute('data-timestamp');
        if (iso) {
            timestampEl.textContent = formatTimeAgo(iso);
            setInterval(() => { timestampEl.textContent = formatTimeAgo(iso); }, 60000);
        }
    }

    // Read post and owner info from the container
    const container = document.querySelector('[data-post-id]');
    const postId    = container ? container.dataset.postId    : null;
    const ownerId   = container ? container.dataset.ownerId   : null;
    const postName  = container ? container.dataset.postName  : '';
    const ownerName = container ? container.dataset.ownerName : '';

    // Connect button → redirect to messages page with all context
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            if (postId && ownerId) {
                const params = new URLSearchParams({
                    post_id:    postId,
                    user_id:    ownerId,
                    post_name:  postName,
                    owner_name: ownerName
                });
                window.location.href = `/messages?${params.toString()}`;
            } else {
                window.location.href = '/messages';
            }
        });
    }

        /* CLAIM / UNCLAIM TOGGLE */
if (claimToggle) {

    claimToggle.addEventListener('change', () => {

        const postId = claimToggle.dataset.postId;

        const endpoint = claimToggle.checked
            ? `/api/listings/claim/${postId}`
            : `/api/listings/unclaim/${postId}`;

        fetch(endpoint, {
            method: "POST"
        })
        .then(res => res.json())
        .then(data => {

            if (data.success) {
                const isClaimed = claimToggle.checked;
                claimLabel.textContent = isClaimed ? "Claimed" : "Active";

                // Live-update the overlay and grayscale without a page reload
                const imageWrapper = document.querySelector('.listing-image-wrapper');
                let overlay = imageWrapper ? imageWrapper.querySelector('.claimed-overlay') : null;

                if (isClaimed) {
                    if (imageWrapper && !overlay) {
                        overlay = document.createElement('div');
                        overlay.className = 'claimed-overlay';
                        overlay.textContent = 'CLAIMED';
                        imageWrapper.appendChild(overlay);
                    } else if (overlay) {
                        overlay.style.display = '';
                    }
                    if (container) container.dataset.postStatus = 'claimed';
                } else {
                    if (overlay) overlay.style.display = 'none';
                    if (container) container.dataset.postStatus = 'active';
                }

            } else {

                alert("Error: " + data.message);

                claimToggle.checked = !claimToggle.checked;
            }
        })
        .catch(err => {
            console.error("Toggle failed:", err);

            claimToggle.checked = !claimToggle.checked;
        });

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

            fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post_id: postId, reason: reason })
            })
            .then(r => r.json())
            .then(data => {
                reportModal.classList.remove('active');
                if (data.success) {
                    alert('Report submitted. An admin will review this listing.');
                } else {
                    alert('Could not submit report: ' + (data.message || 'Unknown error'));
                }
            })
            .catch(() => {
                reportModal.classList.remove('active');
                alert('Could not reach the server. Please try again.');
            });
        });
    }
});
