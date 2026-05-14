// Load user data or defaults
let userData = JSON.parse(localStorage.getItem('userData')) || {
    username: 'User Name',
    email: 'user@example.com',
    avatar: null,
    buttonColor: '#007bff'
};

// Elements
const usernameDisplay = document.getElementById('username-display');
const emailDisplay = document.getElementById('email-display');
const sidebarUsername = document.getElementById('sidebar-username');
const sidebarAvatar = document.getElementById('sidebar-avatar');
const editNameBtn = document.getElementById('edit-name-btn');
const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
const avatarInput = document.getElementById('avatar-input');
const buttonColorInput = document.getElementById('button-color');

// Initialize display
usernameDisplay.textContent = userData.username;
emailDisplay.textContent = userData.email;
sidebarUsername.textContent = userData.username.split(' ')[0];
sidebarAvatar.textContent = userData.username.split(' ').map(n => n[0]).join('').toUpperCase();
buttonColorInput.value = userData.buttonColor;

// Edit username
editNameBtn.addEventListener('click', () => {
    const newName = prompt('Enter your new username:', userData.username);
    if (newName) {
        userData.username = newName;
        usernameDisplay.textContent = newName;
        sidebarUsername.textContent = newName.split(' ')[0];
        sidebarAvatar.textContent = newName.split(' ').map(n => n[0]).join('').toUpperCase();
        localStorage.setItem('userData', JSON.stringify(userData));
    }
});

// Change button color
buttonColorInput.addEventListener('input', () => {
    document.documentElement.style.setProperty('--btn-blue', buttonColorInput.value);
    userData.buttonColor = buttonColorInput.value;
    localStorage.setItem('userData', JSON.stringify(userData));
});

// Upload avatar
uploadAvatarBtn.addEventListener('click', () => avatarInput.click());
avatarInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = () => {
            userData.avatar = reader.result;
            localStorage.setItem('userData', JSON.stringify(userData));
            alert('Avatar updated! (sidebar currently shows initials)');
        };
        reader.readAsDataURL(file);
    }
});
