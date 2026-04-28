//  Create Listing Logic 
document.addEventListener('DOMContentLoaded', () => {
    const createForm = document.getElementById('create-listing-form') as HTMLFormElement | null;

    if (createForm) {
        createForm.addEventListener('submit', async (event: Event) => {
            event.preventDefault(); // Prevent standard page reload

            // Safely grab all input elements with their proper types
            const titleInput = document.getElementById('listing-title') as HTMLInputElement | null;
            const categoryInput = document.getElementById('listing-category') as HTMLSelectElement | null;
            const locationInput = document.getElementById('listing-location') as HTMLSelectElement | null;
            const descInput = document.getElementById('listing-description') as HTMLTextAreaElement | null;
            const imageInput = document.getElementById('listing-image') as HTMLInputElement | null;

            if (!titleInput || !categoryInput || !locationInput || !descInput) {
                console.error("Missing form fields");
                return;
            }

            // Use FormData to handle both text inputs and the image file
            const formData = new FormData();
            formData.append('title', titleInput.value);
            formData.append('category', categoryInput.value);
            formData.append('location', locationInput.value);
            formData.append('description', descInput.value);
            
            // Append the file if one was selected
            if (imageInput && imageInput.files && imageInput.files.length > 0) {
                formData.append('image', imageInput.files[0]);
            }

            try {
                // Send to our new Flask route
                const response = await fetch('/api/listings', {
                    method: 'POST',
                    body: formData // The browser automatically sets Content-Type to multipart/form-data
                });

                const data = await response.json();

                if (data.success) {
                    alert('Listing successfully created!');
                    window.location.href = '/dashboard';
                } else {
                    alert('Error creating listing: ' + data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Server error occurred.');
            }
        });
    }
});