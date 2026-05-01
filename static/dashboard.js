document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const filterLinks = document.querySelectorAll('.filter-menu a');

    const cards = document.querySelectorAll('.card');
    const noResults = document.getElementById('no-results');

    // CLOSE DROPDOWN OUTSIDE CLICK
    window.addEventListener('click', (e) => {
        const menu = document.getElementById("user-dropdown");
        const btn = document.getElementById("user-menu-btn");

        if (!menu.classList.contains('hidden') && !btn.contains(e.target)) {
            menu.classList.add('hidden');
        }
    });

    // SEARCH LOGIC
    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            const query = searchInput.value.toLowerCase();

            let visibleCount = 0;

            cards.forEach(card => {
                const text = card.innerText.toLowerCase();
                const match = text.includes(query);

                if (query === "") {
                    card.style.display = '';
                    visibleCount++;
                } else {
                    card.style.display = match ? '' : 'none';
                    if (match) visibleCount++;
                }
            });

            if (noResults) {
                noResults.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        });
    }

    // FILTER LOGIC
    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const target = e.currentTarget;
            const category = target.innerText.toLowerCase();

            filterLinks.forEach(l => {
                l.classList.remove('active');
            });

            target.classList.add('active');

            let visibleCount = 0;

            cards.forEach(card => {
                const match = card.dataset.category?.toLowerCase();

                let show;

                if (category === "apply all") {
                    show = true;
                } else {
                    show = (match === category);
                }

                card.style.display = show ? '' : 'none';

                if (show) visibleCount++;
            });

            if (noResults) {
                noResults.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        });
    });
});

// Must be at the end to work properly
function toggleUserMenu() {
    const menu = document.getElementById("user-dropdown");
    menu.classList.toggle("hidden");
}