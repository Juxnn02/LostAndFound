document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const filterLinks = document.querySelectorAll('.filter-menu a');

    const cards = document.querySelectorAll('.card');
    const noResults = document.getElementById('no-results');

    // FORMAT TIMESTAMPS
    function updateTimestamps() {
        document.querySelectorAll('.post-time').forEach(elem => {
            const timestamp = elem.getAttribute('data-timestamp');
            if (timestamp) {
                elem.textContent = 'posted ' + formatTimeAgo(timestamp);
            }
        });
    }

    // Update timestamps immediately and every minute
    updateTimestamps();
    setInterval(updateTimestamps, 60000);

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

    // FILTER
    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const category = link.innerText.toLowerCase();

            filterLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            let visibleCount = 0;

            cards.forEach(card => {
                const cardCategory = card.dataset.category;
                const status = card.dataset.status;

                let show;

                if (category === "apply all") {
                    show = true;
                } else if (category === "claimed listings") {
                    show = (status === "claimed");
                } else {
                    show = (cardCategory === category && status !== "claimed");
                }

                card.style.display = show ? '' : 'none';
                if (show) visibleCount++;
            });

            // show correct message
            if (category === "claimed listings") {
                noClaimed.style.display = visibleCount === 0 ? 'block' : 'none';
                noResults.style.display = 'none';
            } else {
                noResults.style.display = visibleCount === 0 ? 'block' : 'none';
                noClaimed.style.display = 'none';
            }
        });
    });
});

const scrollBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
    if (document.documentElement.scrollTop > 20) {
        scrollBtn.style.display = "block";
    } else {
        scrollBtn.style.display = "none";
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Must be at the end to work properly
function toggleUserMenu() {
    const menu = document.getElementById("user-dropdown");
    menu.classList.toggle("hidden");
}