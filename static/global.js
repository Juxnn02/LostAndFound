document.addEventListener('DOMContentLoaded', () => {
    // Apply saved user settings globally
    function applyUserSettings() {
        const avatarUrl = localStorage.getItem('userAvatar');
        const userName = localStorage.getItem('userName');
        const buttonColor = localStorage.getItem('buttonColor') || '#007bff';

        // Update CSS variables
        document.documentElement.style.setProperty('--button-bg', buttonColor);
        document.documentElement.style.setProperty('--button-hover', '#ffffff');

        // Update sidebar avatar
        const sidebarAvatar = document.querySelector('.sidepanel .avatar');
        if (sidebarAvatar) {
            if (avatarUrl) {
                sidebarAvatar.innerHTML = `<img src="${avatarUrl}" alt="User Avatar">`;
            } else if (userName) {
                sidebarAvatar.textContent = userName.split('')[0].toUpperCase();
            }
        }

        // Update sidebar username
        const sidebarName = document.querySelector('.sidepanel .user-info h3');
        if (sidebarName && userName) {
            sidebarName.textContent = `Welcome, ${userName.split(' ')[0]}!`;
        }

        // Update navbar title background
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.backgroundColor = buttonColor;
        }

        // Update buttons (like empty-state button, top buttons)
        const allButtons = document.querySelectorAll('button, .empty-state-btn, .sidepanel a');
        allButtons.forEach(btn => {
            // skip delete buttons
            if (!btn.classList.contains('delete-btn')) {
                btn.style.backgroundColor = buttonColor;
                btn.onmouseover = () => btn.style.backgroundColor = '#ffffff';
                btn.onmouseout = () => btn.style.backgroundColor = buttonColor;
            }
        });
    }

    applyUserSettings();

    // Listen for profile updates from profile page
    window.addEventListener('storage', (event) => {
        if (event.key === 'profileUpdated') {
            applyUserSettings();
        }
    });
});
