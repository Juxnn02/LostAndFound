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
    // Extract post ID from URL (e.g., /listing-info?id=5)
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id') || '1';
    // Helper function to fetch and display messages
    function loadMessages() {
        fetch(`/api/messages/${postId}`)
            .then(response => response.json())
            .then((data) => {
            if (!chatThread || !chatForm)
                return;
            // First, remove old message bubbles from the screen
            const existingMessages = chatThread.querySelectorAll('.chat-message');
            existingMessages.forEach(msg => msg.remove());
            // Loop through the database messages and add them to the screen
            data.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'chat-message';
                messageDiv.style.padding = '10px';
                messageDiv.style.borderRadius = '10px';
                messageDiv.style.marginBottom = '10px';
                messageDiv.style.width = 'fit-content';
                messageDiv.style.maxWidth = '80%';
                // Style differently based on who sent it (Assuming sender '1' is the current user)
                if (msg.sender_id === 1) {
                    messageDiv.style.background = '#2196F3';
                    messageDiv.style.color = 'white';
                    messageDiv.style.marginLeft = 'auto'; // Align to right
                }
                else {
                    messageDiv.style.background = '#f1f0f0';
                    messageDiv.style.color = 'black';
                    messageDiv.style.marginLeft = '0'; // Align to left
                }
                messageDiv.textContent = msg.text;
                chatThread.insertBefore(messageDiv, chatForm);
            });
        })
            .catch(error => console.error("Error loading messages:", error));
    }
    // --- Chat Logic ---
    if (connectBtn && chatThread) {
        connectBtn.addEventListener('click', () => {
            const isHidden = chatThread.style.display === 'none';
            chatThread.style.display = isHidden ? 'block' : 'none';
            if (isHidden) {
                loadMessages();
            }
        });
    }
    if (chatForm && chatInput && chatThread) {
        // Basic Polling: Ask the server for new messages every 3 seconds
        setInterval(() => {
            if (chatThread.style.display !== 'none') {
                loadMessages();
            }
        }, 3000);
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const messageText = chatInput.value.trim();
            if (!messageText)
                return;
            // Send new message to backend database
            fetch(`/api/messages/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: messageText })
            })
                .then(response => response.json())
                .then(data => {
                if (data.success) {
                    chatInput.value = ''; // Clear input field
                    loadMessages(); // Instantly reload messages to show your new one
                }
            })
                .catch(error => console.error("Error sending message:", error));
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
            const formData = new FormData(reportForm);
            const reason = formData.get('report-reason');
            alert(`Report submitted for reason: ${reason}. An admin will review this listing.`);
            reportModal.style.display = 'none'; // Close modal after submission
        });
    }
});
