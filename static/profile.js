// profile.js

// Load user data or defaults
let userData = JSON.parse(localStorage.getItem('userData')) || {
    username: 'User',
    email: 'user@example.com',
    avatar: 'default-avatar.png',
    buttonColor: '#007bff'
};

// Elements
const avatarImg = document.getElementById('user-avatar');
const avatarInput = document.getElementById('avatar-input');
const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
const usernameDisplay = document.getElementById('username-display');
const emailDisplay = document.getElementById('email-display');
const editNameBtn = document.getElementById('edit-name-btn');
const saveChangesBtn = document.getElementById('save-changes-btn');
const logoutBtn = document.getElementById('logout-btn');
const deleteAccountBtn = document.getElementById('delete-account-btn');
const buttonColorInput = document.getElementById('button-color');
const backButton = document.getElementById('back-button');

// Initialize page
avatarImg.src = userData.avatar;
usernameDisplay.textContent = userData.username;
emailDisplay.textContent = userData.email;
buttonColorInput.value = userData.buttonColor;

// Edit username
editNameBtn.addEventListener('click', () => {
    const newName = prompt('Enter new username:', userData.username);
    if (newName) {
        usernameDisplay.textContent = newName;
        userData.username = newName;
    }
});

// Upload avatar
uploadAvatarBtn.addEventListener('click', () => avatarInput.click());
avatarInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            avatarImg.src = reader.result;
            userData.avatar = reader.result;
        };
        reader.readAsDataURL(file);
    }
});

// Save changes
saveChangesBtn.addEventListener('click', () => {
    userData.buttonColor = buttonColorInput.value;
    localStorage.setItem('userData', JSON.stringify(userData));

    // Update blue buttons globally
    document.documentElement.style.setProperty('--btn-blue', userData.buttonColor);
    document.documentElement.style.setProperty('--btn-blue-hover', '#ffffff');

    alert('Changes saved!');
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
});

// Delete account
deleteAccountBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete your account?')) {
        localStorage.removeItem('userData');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
});

// Back to dashboard
backButton.addEventListener('click', () => {
    localStorage.setItem('userData', JSON.stringify(userData));
    window.location.href = 'dashboard.html';
});
