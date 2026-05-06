/* My Listings Logic */
document.addEventListener('DOMContentLoaded', () => {
    // Updates the count display based on how many cards are rendered
    updateTotalCount();
});

/* CLAIM LISTING  */
function claimListing(id) {
    fetch(`/api/listings/claim/${id}`, {
        method: "POST"
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Reloading the page lets Jinja2 move the item to the "Claimed" column
            location.reload(); 
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(err => console.error("Claim failed:", err));
}

/* UNCLAIM LISTING
 * Reverses the claim status.
 */
function unclaimListing(id) {
    fetch(`/api/listings/unclaim/${id}`, {
        method: "POST"
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(err => console.error("Unclaim failed:", err));
}

/* Edit Listing */
function editListing(id) {
    window.location.href = `/edit_listing?edit=${id}`;
}

/* DELETE LISTING */
function deleteListing(id) {
    if (confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
        fetch(`/api/listings/delete/${id}`, {
            method: "DELETE"
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Remove the card from the screen immediately or reload
                location.reload(); 
            } else {
                alert("Error deleting listing: " + data.message);
            }
        })
        .catch(err => console.error("Delete failed:", err));
    }
}

/* Update Total Count */
function updateTotalCount() {
    const countElement = document.getElementById('listing-count');
    // Finds every div with the class 'listing-card'
    const totalCards = document.querySelectorAll('.listing-card').length;
    
    if (countElement) {
        countElement.innerHTML = `<strong>Total Listings:</strong> ${totalCards}`;
    }
}