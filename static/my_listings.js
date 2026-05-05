/* My Listings Logic */
document.addEventListener('DOMContentLoaded', () => {
    updateTotalCount();
});

/* Function to redirect to edit page */
function editListing(id) {
    // This matches the logic you had to include the ID in the URL
    window.location.href = `/edit_listing?edit=${id}`;
}

/* Function to handle deletion */
function deleteListing(id) {
    if (confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
        console.log("Team: Requesting deletion for Listing ID:", id);
        // Backend team will add API call here
        alert("Listing " + id + " has been deleted (Demo only).");
    }
}

/* Update the count at the top of the page */
function updateTotalCount() {
    const countElement = document.getElementById('listing-count');
    const totalCards = document.querySelectorAll('.card, .listing-card').length;
    
    if (countElement) {
        countElement.innerText = `Total Listings: ${totalCards}`;
    }
}