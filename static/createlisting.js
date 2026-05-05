var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//  Create Listing Logic 
document.addEventListener('DOMContentLoaded', () => {
    // IMAGE PREVIEW
    const imageInput = document.getElementById('listing-image');
    const imagePreview = document.getElementById('image-preview');
    const uploadText = document.getElementById('upload-text');
    
    if (imageInput) {
        imageInput.addEventListener('change', (event) => {
            const file = event.target.files ? event.target.files[0] : null;
            
            if (file) {
                // Show preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (imagePreview && e.target) {
                        imagePreview.src = e.target.result;
                        imagePreview.style.display = 'block';
                        uploadText.style.display = 'none';
                    }
                };
                reader.readAsDataURL(file);
            } else {
                // Hide preview if no file selected
                if (imagePreview) {
                    imagePreview.style.display = 'none';
                    uploadText.style.display = 'block';
                    imagePreview.src = '';
                }
            }
        });
    }
    
    const createForm = document.getElementById('create-listing-form');
    if (createForm) {
        createForm.addEventListener('submit', (event) => __awaiter(this, void 0, void 0, function* () {
            event.preventDefault(); // Prevent standard page reload
            // Safely grab all input elements with their proper types
            const titleInput = document.getElementById('listing-title');
            const categoryInput = document.getElementById('listing-category');
            const locationInput = document.getElementById('listing-location');
            const descInput = document.getElementById('listing-description');
            const imageInput = document.getElementById('listing-image');
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
                const response = yield fetch('/api/listings', {
                    method: 'POST',
                    body: formData // The browser automatically sets Content-Type to multipart/form-data
                });
                const data = yield response.json();
                if (data.success) {
                    alert('Listing successfully created!');
                    window.location.href = '/dashboard';
                }
                else {
                    alert('Error creating listing: ' + data.message);
                }
            }
            catch (error) {
                console.error('Error:', error);
                alert('Server error occurred.');
            }
        }));
    }
});
