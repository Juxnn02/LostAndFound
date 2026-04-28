//  Create Listing Logic 
document.addEventListener('DOMContentLoaded', () => {
    const createForm = document.getElementById('create-listing-form') as HTMLFormElement | null;

    if (createForm) {
        createForm.addEventListener('submit', (event: Event) => {
            event.preventDefault(); // Prevent standard page reload

            const title = (document.getElementById('listing-title') as HTMLInputElement).value;
            const category = (document.getElementById('listing-category') as HTMLSelectElement).value;
            
            // For now, mock a successful submission
            console.log(`Submitting new listing: ${title} in category ${category}`);
            alert(`Listing for "${title}" has been successfully created!`);
            
            // Redirect back to dashboard after creation
            window.location.href = '/dashboard';
        });
    }
});