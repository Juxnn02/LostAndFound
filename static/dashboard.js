
function toggleSidebar() {
    document.getElementById('sidePanel').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

function closeSidebar() {
    document.getElementById('sidePanel').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {

    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
        // Avatar
        const dashboardAvatar = document.getElementById('user-avatar-dashboard');
        if (dashboardAvatar) dashboardAvatar.src = userData.avatar;

        // Username
        const dashboardUsername = document.getElementById('username-dashboard');
        if (dashboardUsername) dashboardUsername.textContent = userData.username;

        // Blue buttons color
        document.documentElement.style.setProperty('--btn-blue', userData.buttonColor || '#007bff');
        document.documentElement.style.setProperty('--btn-blue-hover', '#ffffff');
    }


    const searchInput = document.getElementById('search-input');
    const filterLinks = document.querySelectorAll('.filter-menu a');
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

    // SEARCH LOGIC
    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            const query = searchInput.value.toLowerCase();
            let visibleCount = 0;
            document.querySelectorAll('.card').forEach(card => {
                const text = card.innerText.toLowerCase();
                const match = query === '' || text.includes(query);
                card.style.display = match ? '' : 'none';
                if (match) visibleCount++;
            });
            if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        });
    }

    // FILTER LOGIC
    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.innerText.toLowerCase();
            filterLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            let visibleCount = 0;
            document.querySelectorAll('.card').forEach(card => {
                const cardCategory = card.dataset.category;
                const status = card.dataset.status;
                let show = false;

                if (category === "all items") show = true;
                else if (category === "claimed") show = (status === "claimed");
                else show = (cardCategory === category && status !== "claimed");

                card.style.display = show ? '' : 'none';
                if (show) visibleCount++;
            });

            if (category === "claimed") {
                noClaimed.style.display = visibleCount === 0 ? 'block' : 'none';
                noResults.style.display = 'none';
            } else {
                noResults.style.display = visibleCount === 0 ? 'block' : 'none';
                noClaimed.style.display = 'none';
            }
        });
    });

    // LIVE POLLING
    const grid = document.getElementById('listings-grid');
    if (!grid) return;
    let latestId = parseInt(grid.dataset.latestId || '0', 10);

    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    function buildCard(post) {
        const imgHtml = post.image_url
            ? `<img src="/static/${esc(post.image_url)}" alt="${esc(post.item_name)}">`
            : `<div class="card-no-image"><span class="card-no-image-icon">📷</span><span class="card-no-image-label">No photo</span></div>`;

        const claimedOverlay = post.is_claimed ? '<div class="claimed-overlay">CLAIMED</div>' : '';
        const badge = post.category ? `<span class="card-badge">${esc(post.category)}</span>` : '';

        const card = document.createElement('div');
        card.className = 'card card-highlight';
        card.dataset.id = post.id;
        card.dataset.category = (post.category || '').toLowerCase();
        card.dataset.status = post.is_claimed ? 'claimed' : 'active';
        card.addEventListener('click', () => { location.href = `/listing-info?id=${post.id}`; });
        card.innerHTML = `
            <div class="card-img-wrapper">
                <div class="card-img">${imgHtml}</div>
                ${claimedOverlay}
                ${badge}
            </div>
            <div class="card-body">
                <strong>${esc(post.item_name)}</strong>
                <p class="card-location"><span class="material-symbols-outlined">location_on</span> ${esc(post.location)}</p>
            </div>
        `;

        const activeLink = document.querySelector('.filter-menu a.active');
        const activeCategory = activeLink ? activeLink.innerText.toLowerCase() : 'all items';
        if (activeCategory !== 'all items') {
            const cardCat = (post.category || '').toLowerCase();
            const status = post.is_claimed ? 'claimed' : 'active';
            if (activeCategory === 'claimed') card.style.display = status === 'claimed' ? '' : 'none';
            else card.style.display = (cardCat === activeCategory && status !== 'claimed') ? '' : 'none';
        }

        return card;
    }

    function showToast(count) {
        let toast = document.getElementById('new-listings-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'new-listings-toast';
            toast.className = 'new-listings-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = `${count} new listing${count !== 1 ? 's' : ''} added`;
        toast.classList.add('toast-visible');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('toast-visible'), 3500);
    }

    function pollNewListings() {
        fetch(`/api/listings/feed?since_id=${latestId}`)
            .then(r => r.json())
            .then(data => {
                const { new_posts, active_ids } = data;

                const activeSet = new Set(active_ids);
                document.querySelectorAll('.card[data-id]').forEach(card => {
                    if (!activeSet.has(parseInt(card.dataset.id))) card.remove();
                });

                if (!new_posts.length) return;
                const emptyState = document.getElementById('empty-state');
                if (emptyState) emptyState.remove();

                [...new_posts].reverse().forEach(post => {
                    if (post.id > latestId) latestId = post.id;
                    const card = buildCard(post);
                    const firstCard = grid.querySelector('.card');
                    if (firstCard) grid.insertBefore(card, firstCard);
                    else grid.prepend(card);
                    setTimeout(() => card.classList.remove('card-highlight'), 1500);
                });

                showToast(new_posts.length);
            })
            .catch(() => {});
    }

    setInterval(pollNewListings, 30000);

});

// Scroll to top button
const scrollBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
    if (scrollBtn) {
        scrollBtn.style.display = document.documentElement.scrollTop > 20 ? 'block' : 'none';
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
