//  Dashboard Logic 
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const filterLinks = document.querySelectorAll('.filter-menu a');
    
    // Logic to close dropdown when clicking outside
    window.addEventListener('click', (e) => {
        const menu = document.getElementById("user-dropdown");
        const btn = document.getElementById("user-menu-btn");
        
        // If the menu is open AND the click was not on the button
        if (!menu.classList.contains('hidden') && !btn.contains(e.target)) {
            menu.classList.add('hidden');
        }
    });
    
    // Handle Search functionality
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const query = searchInput.value.toLowerCase();
            console.log("Searching for:", query);
            // In the future, this will filter the DOM elements or make an API call
        });
    }
    // Handle Category Filter Clicks
    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target;
            // Remove active style from all links
            filterLinks.forEach(l => {
                l.style.textDecoration = 'none';
            });
            // Add active style to clicked link
            target.style.textDecoration = 'underline';
            console.log("Filtering by:", target.innerText);
        });
    });
});

//Must be at the end of the file to work properly
function toggleUserMenu() {
    const menu = document.getElementById("user-dropdown");
    menu.classList.toggle("hidden");
    }   
