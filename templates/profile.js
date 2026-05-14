
document.addEventListener('DOMContentLoaded', () => {
    const avatar = document.getElementById('avatar');
    const avatarUpload = document.getElementById('avatar-upload');
    const saveBtn = document.getElementById('save-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const nameInput = document.getElementById('name-input');
    const buttonColorInput = document.getElementById('button-color');

    // Load saved avatar
    if(localStorage.getItem('userAvatar')) {
        avatar.innerHTML = '';
        const img = document.createElement('img');
        img.src = localStorage.getItem('userAvatar');
        avatar.appendChild(img);
    }

    // Load saved button color
    if(localStorage.getItem('buttonColor')) {
        document.documentElement.style.setProperty('--button-bg', localStorage.getItem('buttonColor'));
        document.documentElement.style.setProperty('--button-hover', '#ffffff');
        buttonColorInput.value = localStorage.getItem('buttonColor');
    }

    avatar.addEventListener('click', () => avatarUpload.click());

    avatarUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = () => {
                avatar.innerHTML = '';
                const img = document.createElement('img');
                img.src = reader.result;
                avatar.appendChild(img);
                localStorage.setItem('userAvatar', reader.result);
            };
            reader.readAsDataURL(file);
        }
    });

    saveBtn.addEventListener('click', () => {
        const newName = nameInput.value.trim();
        if(newName) {
            // Here you would normally send an AJAX request to backend to update
            // For demo, just save locally
            localStorage.setItem('userName', newName);
            alert('Changes saved!');
        }

        // Save button color
        const color = buttonColorInput.value;
        localStorage.setItem('buttonColor', color);
        document.documentElement.style.setProperty('--button-bg', color);
        document.documentElement.style.setProperty('--button-hover', '#ffffff');
    });

    logoutBtn.addEventListener('click', () => {
        // Clear session if needed
        location.href = '/';
    });

    deleteBtn.addEventListener('click', () => {
        if(confirm('Are you sure you want to delete your account? This cannot be undone.')) {
            // Send delete request to backend here
            alert('Account deleted!');
            location.href = '/';
        }
    });
});
