const profileMsg = document.getElementById('profile-message');

function showMsg(text, isError) {
    profileMsg.textContent = text;
    profileMsg.style.color = isError ? 'var(--danger)' : 'var(--success)';
}

// Save nickname and pronouns to the database
document.getElementById('save-profile-btn').addEventListener('click', async () => {
    const nickname = document.getElementById('nickname-input').value.trim();
    const pronouns = document.getElementById('pronouns-input').value.trim();

    const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, pronouns })
    });
    const data = await res.json();
    if (data.success) {
        showMsg('Changes saved!', false);
    } else {
        showMsg(data.message || 'Could not save changes.', true);
    }
});

// Delete account — removes from database
document.getElementById('delete-account-btn').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    const res = await fetch('/api/profile/delete-account', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
        window.location.href = '/';
    } else {
        showMsg(data.message || 'Could not delete account.', true);
    }
});
