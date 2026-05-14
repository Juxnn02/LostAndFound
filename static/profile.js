
// Load existing user data from localStorage
const userData = JSON.parse(localStorage.getItem('userData')) || {
    username: 'User',
    email: 'user@example.com',
    avatar: 'default-avatar.png',
    buttonColor: '#007bff', // default blue
    buttonHover: '#ffff00' // default yellow
};

// DOM elements
const avatarImg = document.getElementById('user-avatar');
const avatarInput = document.getElementById('avatar-input');
const editAvatarBtn = document.getElementById('edit-avatar-btn');
const usernameInput = document.getElementById('username-input');
const emailDisplay = document.getElementById('email-display');
const saveChangesBtn = document.getElementById('save-changes-btn');
const logoutBtn = document.getElementById('logout-btn');
const deleteAccountBtn = document.getElementById('delete-account-btn');
const buttonColorInput = document.getElementById('button-color');
const backButton = document.getElementById('back-button');

// Initialize fields
avatarImg.src = userData.avatar;
usernameInput.value = userData.username;
emailDisplay.textContent = userData.email;
buttonColorInput.value = userData.buttonColor;

// Edit Avatar
editAvatarBtn.addEventListener('click', () => avatarInput.click());

avatarInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            avatarImg.src = reader.result;
        };
        reader.readAsDataURL(file);
    }
});

// Save Changes
saveChangesBtn.addEventListener('click', () => {
    userData.username = usernameInput.value;
    userData.avatar = avatarImg.src;
    userData.buttonColor = buttonColorInput.value;

    localStorage.setItem('userData', JSON.stringify(userData));

    // Update global styles immediately
    document.documentElement.style.setProperty('--btn-color', userData.buttonColor);
    document.documentElement.style.setProperty('--btn-hover', '#ffffff'); // highlight color after change

    alert('Changes saved!');
});

// Logout
logoutBtn.addEventListener('click', () => {
    // Clear session data if any
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
});

// Delete Account
deleteAccountBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete your account?')) {
        localStorage.removeItem('userData');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
});

// Back to dashboard
backButton.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});
