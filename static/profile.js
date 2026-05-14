// Load userData from localStorage or fallback to template values
let userData = JSON.parse(localStorage.getItem('userData')) || {
    username: document.getElementById('username-display').textContent || 'User Name',
    email: document.getElementById('email-display').textContent || 'user@example.com',
    avatar: document.getElementById('user-avatar').src || 'default-avatar.png',
    buttonColor: '#007bff'
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

// Update page display
function updateDisplay() {
    usernameDisplay.textContent = userData.username;
    emailDisplay.textContent = userData.email;
    avatarImg.src = userData.avatar || 'default-avatar.png';
    buttonColorInput.value = userData.buttonColor;
    document.documentElement.style.setProperty('--btn-blue', userData.buttonColor);

    sidebarUsername.textContent = userData.username.split(' ')[0] || '';
    sidebarAvatar.textContent = userData.username
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
}

updateDisplay();

// Edit Name
editNameBtn.addEventListener('click', () => {
    const newName = prompt('Enter your new username:', userData.username);
    if (newName) {
        userData.username = newName;
        localStorage.setItem('userData', JSON.stringify(userData));
        updateDisplay();
    }
});

// Save Changes (button color)
saveChangesBtn.addEventListener('click', () => {
    userData.buttonColor = buttonColorInput.value;
    localStorage.setItem('userData', JSON.stringify(userData));
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
            updateDisplay();
        };
        reader.readAsDataURL(file);
    }
});
