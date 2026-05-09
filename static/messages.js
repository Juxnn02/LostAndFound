// Active conversation state
let activePostId = null;
let activeOtherUserId = null;
let pollInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    const params      = new URLSearchParams(window.location.search);
    const urlPostId   = params.get('post_id')   ? parseInt(params.get('post_id'))   : null;
    const urlUserId   = params.get('user_id')   ? parseInt(params.get('user_id'))   : null;
    const urlPostName = params.get('post_name')  || '';
    const urlOwnerName= params.get('owner_name') || '';

    if (urlPostId && urlUserId) {
        // Came from a listing's Connect button — load inbox then open that chat
        loadConversations().then(() => openChat(urlPostId, urlUserId, urlOwnerName, urlPostName));
    } else {
        loadConversations();
    }
});

async function loadConversations() {
    const res = await fetch('/api/conversations');
    const convos = await res.json();

    const list  = document.getElementById('inbox-list');
    const empty = document.getElementById('inbox-empty');

    list.querySelectorAll('.inbox-card').forEach(el => el.remove());

    if (convos.length === 0) {
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';

    convos.forEach(c => {
        const card = document.createElement('div');
        card.className = 'inbox-card';
        card.dataset.postId = c.post_id;
        card.dataset.otherUserId = c.other_user_id;

        if (c.post_id === activePostId && c.other_user_id === activeOtherUserId) {
            card.classList.add('active');
        }

        const timeStr = c.timestamp ? formatTimeAgo(c.timestamp) : '';
        card.innerHTML = `
            <div class="inbox-header">
                <strong>${escapeHtml(c.other_user_name)}</strong>
                <span class="inbox-time">${timeStr}</span>
            </div>
            <p class="preview">Re: ${escapeHtml(c.post_name)}</p>
            <p class="preview-msg">${escapeHtml(c.last_message)}</p>
        `;
        card.addEventListener('click', () => openChat(c.post_id, c.other_user_id, c.other_user_name, c.post_name));
        list.insertBefore(card, empty);
    });
}

function openChat(postId, otherUserId, otherUserName, postName) {
    activePostId = postId;
    activeOtherUserId = otherUserId;

    // Highlight active inbox card
    document.querySelectorAll('.inbox-card').forEach(c => {
        c.classList.toggle('active',
            parseInt(c.dataset.postId) === postId &&
            parseInt(c.dataset.otherUserId) === otherUserId
        );
    });

    // Update header
    const headerName    = document.getElementById('chat-header-name');
    const headerListing = document.getElementById('chat-header-listing');
    if (headerName)    headerName.textContent    = otherUserName || 'User';
    if (headerListing) headerListing.textContent = postName ? `Re: ${postName}` : '';

    // Enable input
    const input = document.getElementById('user-input');
    const btn   = document.getElementById('send-btn');
    if (input) { input.disabled = false; input.focus(); }
    if (btn)   { btn.disabled   = false; }

    fetchMessages();

    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(fetchMessages, 3000);
}

async function fetchMessages() {
    if (!activePostId) return;
    const res = await fetch(`/api/messages/${activePostId}?other_user_id=${activeOtherUserId}`);
    const msgs = await res.json();

    if (!Array.isArray(msgs)) return;

    const box = document.getElementById('chat-box');
    if (!box) return;

    const wasAtBottom = box.scrollHeight - box.scrollTop <= box.clientHeight + 40;

    box.innerHTML = '';

    if (msgs.length === 0) {
        box.innerHTML = '<p class="empty-chat-text">No messages yet — say hi! 👋</p>';
        return;
    }

    msgs.forEach(msg => {
        const bubble = document.createElement('div');
        bubble.className = `bubble ${msg.is_mine ? 'sent' : 'received'}`;
        const timeStr = msg.timestamp ? formatTimeAgo(msg.timestamp) : '';
        bubble.innerHTML = `<p>${escapeHtml(msg.text)}</p><span class="bubble-time">${timeStr}</span>`;
        box.appendChild(bubble);
    });

    if (wasAtBottom) box.scrollTop = box.scrollHeight;
}

async function handleSend(event) {
    event.preventDefault();

    const input = document.getElementById('user-input');
    const text  = input ? input.value.trim() : '';
    if (!text || !activePostId) return false;

    input.value = '';

    const res = await fetch(`/api/messages/${activePostId}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text, receiver_id: activeOtherUserId })
    });

    const data = await res.json();
    if (data.success) {
        fetchMessages();
        loadConversations();
    }

    return false;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
