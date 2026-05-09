document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const filterLinks = document.querySelectorAll('.filter-menu a');
    const cards = document.querySelectorAll('.card');
    const noResults = document.getElementById('no-results');
    const noClaimed = document.getElementById('no-claimed');

    // FORMAT TIMESTAMPS
    function updateTimestamps() {
        document.querySelectorAll('.post-time').forEach(elem => {
            const timestamp = elem.getAttribute('data-timestamp');
            if (timestamp) {
                elem.textContent = 'posted ' + formatTimeAgo(timestamp);
            }
        });
    }

    updateTimestamps();
    setInterval(updateTimestamps, 60000);

    // CLOSE DROPDOWN OUTSIDE CLICK
    window.addEventListener('click', (e) => {
        const menu = document.getElementById('user-dropdown');
        const btn = document.getElementById('user-menu-btn');
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
                const match = query === '' || text.includes(query);
                card.style.display = match ? '' : 'none';
                if (match) visibleCount++;
            });

            if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        });
    }

    // FILTER — uses data-filter attribute to avoid innerText locale issues
    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const filter = link.dataset.filter;

            filterLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            let visibleCount = 0;

            cards.forEach(card => {
                const cardCategory = card.dataset.category;
                const status = card.dataset.status;
                let show;

                if (filter === 'all') {
                    show = true;
                } else if (filter === 'claimed') {
                    show = status === 'claimed';
                } else {
                    show = cardCategory === filter && status !== 'claimed';
                }

                card.style.display = show ? '' : 'none';
                if (show) visibleCount++;
            });

            if (filter === 'claimed') {
                if (noClaimed) noClaimed.style.display = visibleCount === 0 ? 'block' : 'none';
                if (noResults) noResults.style.display = 'none';
            } else {
                if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
                if (noClaimed) noClaimed.style.display = 'none';
            }
        });
    });
});

const scrollBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    if (scrollBtn) {
        scrollBtn.style.display = document.documentElement.scrollTop > 20 ? 'block' : 'none';
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleUserMenu() {
    document.getElementById('user-dropdown').classList.toggle('hidden');
}
