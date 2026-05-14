const avatarImg       = document.getElementById('user-avatar');
const avatarInitials  = document.getElementById('user-avatar-initials');
const usernameDisplay = document.getElementById('username-display');
const sidebarUsername = document.getElementById('sidebar-username');
const sidebarAvatar   = document.getElementById('sidebar-avatar');
const profileMsg      = document.getElementById('profile-message');
const buttonColorInput = document.getElementById('button-color');
const avatarInput     = document.getElementById('avatar-input');

// Restore saved accent color from localStorage (cosmetic only)
const savedColor = localStorage.getItem('profileAccentColor');
if (savedColor) {
    document.documentElement.style.setProperty('--primary', savedColor);
    buttonColorInput.value = savedColor;
}

// Restore saved avatar from localStorage (cosmetic only)
const savedAvatar = localStorage.getItem('profileAvatar');
if (savedAvatar) {
    avatarImg.src = savedAvatar;
    avatarImg.classList.remove('hidden');
    if (avatarInitials) avatarInitials.classList.add('hidden');
}

function showMsg(text, isError) {
    profileMsg.textContent = text;
    profileMsg.style.color = isError ? 'var(--danger)' : 'var(--success)';
}

function updateSidebar(name) {
    if (sidebarUsername) sidebarUsername.textContent = name.split(' ')[0] || name;
    if (sidebarAvatar) {
        sidebarAvatar.textContent = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
}

// Edit Name — saves to database
document.getElementById('edit-name-btn').addEventListener('click', async () => {
    const current = usernameDisplay.textContent;
    const newName = prompt('Enter your new display name:', current);
    if (!newName || !newName.trim()) return;

    const res = await fetch('/api/profile/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newName.trim() })
    });
    const data = await res.json();
    if (data.success) {
        usernameDisplay.textContent = data.username;
        updateSidebar(data.username);
        showMsg('Name updated!', false);
    } else {
        showMsg(data.message || 'Could not update name.', true);
    }
});

// Save Changes — persists accent color to localStorage
document.getElementById('save-changes-btn').addEventListener('click', () => {
    const color = buttonColorInput.value;
    localStorage.setItem('profileAccentColor', color);
    document.documentElement.style.setProperty('--primary', color);
    showMsg('Changes saved!', false);
});

// Delete Account — removes from database
document.getElementById('delete-account-btn').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    const res = await fetch('/api/profile/delete-account', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
        localStorage.clear();
        window.location.href = '/';
    } else {
        showMsg(data.message || 'Could not delete account.', true);
    }
});

// Avatar upload — stores in localStorage (cosmetic/local)
document.getElementById('upload-avatar-btn').addEventListener('click', () => avatarInput.click());
avatarInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        const dataUrl = reader.result;
        localStorage.setItem('profileAvatar', dataUrl);
        avatarImg.src = dataUrl;
        avatarImg.classList.remove('hidden');
        if (avatarInitials) avatarInitials.classList.add('hidden');
    };
    reader.readAsDataURL(file);
});
