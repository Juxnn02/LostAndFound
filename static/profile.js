// Try to get the currently logged-in user
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// If there is a logged-in user, use their info; otherwise fallback
let userData = JSON.parse(localStorage.getItem('userData')) || {
    username: (currentUser && currentUser.username) || 'User Name',
    email: (currentUser && currentUser.email) || 'user@example.com',
    avatar: (currentUser && currentUser.avatar) || 'default-avatar.png',
    buttonColor: (currentUser && currentUser.buttonColor) || '#007bff'
};

// Elements
const usernameDisplay = document.getElementById('username-display');
const emailDisplay = document.getElementById('email-display');
const avatarImg = document.getElementById('user-avatar');
const sidebarUsername = document.getElementById('sidebar-username');
const sidebarAvatar = document.getElementById('sidebar-avatar');

const editNameBtn = document.getElementById('edit-name-btn');
const saveChangesBtn = document.getElementById('save-changes-btn');
const deleteAccountBtn = document.getElementById('delete-account-btn');

const buttonColorInput = document.getElementById('button-color');
const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
const avatarInput = document.getElementById('avatar-input');

// Function to update all displays
function updateDisplay() {
    usernameDisplay.textContent = userData.username;
    emailDisplay.textContent = userData.email;
    avatarImg.src = userData.avatar || 'default-avatar.png';
    buttonColorInput.value = userData.buttonColor;
    document.documentElement.style.setProperty('--btn-blue', userData.buttonColor);

    // Sidebar initials and first name
    sidebarUsername.textContent = userData.username.split(' ')[0] || '';
    sidebarAvatar.textContent = userData.username
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
}

// Initialize
updateDisplay();

// Edit Name
editNameBtn.addEventListener('click', () => {
    const newName = prompt('Enter your new username:', userData.username);
    if (newName) {
        userData.username = newName;
        localStorage.setItem('userData', JSON.stringify(userData));
        if (currentUser) {
            currentUser.username = newName;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        updateDisplay();
    }
});

// Save Changes (button color)
saveChangesBtn.addEventListener('click', () => {
    userData.buttonColor = buttonColorInput.value;
    localStorage.setItem('userData', JSON.stringify(userData));
    if (currentUser) {
        currentUser.buttonColor = buttonColorInput.value;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    updateDisplay();
    alert('Changes saved!');
});

// Delete account
deleteAccountBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete your account?')) {
        localStorage.removeItem('userData');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
});

// Upload avatar
uploadAvatarBtn.addEventListener('click', () => avatarInput.click());
avatarInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            userData.avatar = reader.result;
            localStorage.setItem('userData', JSON.stringify(userData));

            // Optionally update currentUser avatar too
            if (currentUser) {
                currentUser.avatar = reader.result;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }

            updateDisplay();
        };
        reader.readAsDataURL(file);
    }
});
