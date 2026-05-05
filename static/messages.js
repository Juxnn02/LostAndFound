function handleSend(event) {
    event.preventDefault();

    const input = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    if (input.value.trim() === "") return false;

    const newMsg = document.createElement('div');
    newMsg.className = 'bubble sent';
    const now = new Date();
    const timeStr = formatTimeAgo(now);
    newMsg.innerHTML = `<p>${input.value}</p><span style="font-size: 11px; opacity: 0.7;">${timeStr}</span>`;

    chatBox.appendChild(newMsg);

    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    return false;
}

function loadChat(user) {
    const chatBox = document.getElementById('chat-box');

    /* clear chat */
    chatBox.innerHTML = "";

    /* Temporary demo messages based on user */
    if (user === 'alex') {
        chatBox.innerHTML = `
            <div class="bubble received"><p>Hi! I found your water bottle.</p><span style="font-size: 11px; opacity: 0.7;">2 hrs ago</span></div>
            <div class="bubble sent"><p>That's great thank you!</p><span style="font-size: 11px; opacity: 0.7;">2 hrs ago</span></div>
        `;
    }

    else if (user === 'jordan') {
        chatBox.innerHTML = `
            <div class="bubble received"><p>When did you want to meet?</p><span style="font-size: 11px; opacity: 0.7;">30 mins ago</span></div>
        `;
    }

    else if (user === 'live') {
        chatBox.innerHTML = `
            <div class="bubble received"><p>Hey! I just saw your listing!</p><span style="font-size: 11px; opacity: 0.7;">just now</span></div>
        `;
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}