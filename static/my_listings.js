/* My Listings Logic */
document.addEventListener('DOMContentLoaded', () => {
    // Updates the count display based on how many cards are rendered
    updateTotalCount();
});

/* Edit Listing */
function editListing(id) {
    window.location.href = `/edit_listing?edit=${id}`;
}

/* DELETE LISTING */
function deleteListing(id) {
    if (confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
        fetch(`/delete-listing/${id}`, { method: "POST" })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Remove the card from DOM instantly
                const card = document.getElementById(`listing-${id}`);
                if (card) card.remove();
                updateTotalCount(); // optional: update counters
            } else {
                alert("Error deleting listing: " + data.error);
            }
        })
        .catch(err => console.error("Delete failed:", err));
    }
}

function updateTotalCount() {
    const total = document.querySelectorAll('.ml-card').length;
    const active = document.querySelectorAll('.ml-card:not(.ml-card-claimed)').length;
    const claimed = document.querySelectorAll('.ml-card-claimed').length;

    document.getElementById('total-count').textContent = total;
    document.getElementById('active-count').textContent = active;
    document.getElementById('claimed-count').textContent = claimed;
}
