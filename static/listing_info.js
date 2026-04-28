//  Listing Information & Report Logic 
document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const connectBtn = document.getElementById('connect-btn');
    const chatThread = document.getElementById('chat-thread');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const reportBtn = document.getElementById('report-btn');
    const reportModal = document.getElementById('report-modal');
    const cancelReportBtn = document.getElementById('cancel-report-btn');
    const reportForm = document.getElementById('report-form');
    // --- Chat Logic ---
    if (connectBtn && chatThread) {
        connectBtn.addEventListener('click', () => {
            // Toggle visibility of the chat thread
            chatThread.style.display = chatThread.style.display === 'none' ? 'block' : 'none';
        });
    }
    if (chatForm && chatInput && chatThread) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message)
                return;
            // Create a new chat bubble
            const messageDiv = document.createElement('div');
            messageDiv.style.background = '#2196F3';
            messageDiv.style.color = 'white';
            messageDiv.style.padding = '10px';
            messageDiv.style.borderRadius = '10px';
            messageDiv.style.marginBottom = '10px';
            messageDiv.style.width = 'fit-content';
            messageDiv.style.maxWidth = '80%';
            messageDiv.style.marginLeft = 'auto'; // Align to right for sender
            messageDiv.textContent = message;
            // Append to thread and clear input
            chatThread.insertBefore(messageDiv, chatForm);
            chatInput.value = '';
        });
    }
    // --- Report Modal Logic ---
    if (reportBtn && reportModal) {
        reportBtn.addEventListener('click', () => {
            reportModal.style.display = 'flex'; // Show modal overlay
        });
    }
    if (cancelReportBtn && reportModal) {
        cancelReportBtn.addEventListener('click', () => {
            reportModal.style.display = 'none'; // Hide modal
        });
    }
    if (reportForm && reportModal) {
        reportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Extract the selected radio button value
            const formData = new FormData(reportForm);
            const reason = formData.get('report-reason');
            alert(`Report submitted for reason: ${reason}. An admin will review this listing.`);
            reportModal.style.display = 'none'; // Close modal after submission
        });
    }
});
