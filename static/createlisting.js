function toggleSidebar() {
    document.getElementById('sidePanel').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

function closeSidebar() {
    document.getElementById('sidePanel').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    // Set today as the max date and default value for the date picker
    const dateInput = document.getElementById('listing-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.max = today;
        dateInput.value = today;
    }

    const imageInput    = document.getElementById('listing-image');
    const imagePreview  = document.getElementById('image-preview');
    const uploadArea    = document.getElementById('image-upload-area');
    const placeholder   = document.getElementById('upload-placeholder');
    const clearBtn      = document.getElementById('clear-image-btn');
    const errorEl       = document.getElementById('create-error');

    function showPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            uploadArea.classList.add('has-preview');
            clearBtn.classList.add('visible');
        };
        reader.readAsDataURL(file);
    }

    function clearPreview() {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
        uploadArea.classList.remove('has-preview');
        clearBtn.classList.remove('visible');
        imageInput.value = '';
    }

    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) showPreview(file); else clearPreview();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearPreview);
    }

    const form = document.getElementById('create-listing-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title    = document.getElementById('listing-title');
        const dateEl   = document.getElementById('listing-date');
        const desc     = document.getElementById('listing-description');
        const location = document.getElementById('listing-location');
        const category = document.getElementById('listing-category');

        if (errorEl) errorEl.textContent = '';

        // Manual validation with friendly messages
        if (!title || !title.value.trim()) {
            showError('Please enter a title for the item.');
            title && title.focus();
            return;
        }
        if (!desc || !desc.value.trim()) {
            showError('Please add a description so people can identify the item.');
            desc && desc.focus();
            return;
        }
        if (!location || !location.value) {
            showError('Please select where the item was found or lost.');
            location && location.focus();
            return;
        }

        if (!category || !category.value || category.value === "") {
            showError('Please select a category.');
            category && category.focus();
            return;
        }

        const formData = new FormData();
        formData.append('title',       title.value.trim());
        formData.append('date_found',  dateEl ? dateEl.value : '');
        formData.append('description', desc.value.trim());
        formData.append('location',    location.value);
        formData.append('category',    category ? category.value : '');

        if (imageInput && imageInput.files && imageInput.files.length > 0) {
            formData.append('image', imageInput.files[0]);
        }

        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

        try {
            const res  = await fetch('/api/listings', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.success) {
                window.location.href = '/dashboard';
            } else {
                showError(data.message || 'Something went wrong. Please try again.');
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Listing'; }
            }
        } catch {
            showError('Could not reach the server. Check your connection.');
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Listing'; }
        }
    });

    function showError(msg) {
        if (errorEl) {
            errorEl.textContent = msg;
            errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});

// Handles character counting for listing descriptions //
document.addEventListener('DOMContentLoaded', function() {
    const descriptionArea = document.getElementById('listing-description');
    const charDisplay = document.getElementById('current-chars');

    if (descriptionArea && charDisplay) {
        const updateCounter = () => {
            const len = descriptionArea.value.length;
            charDisplay.textContent = len;

            // Add red color class if at maximum capacity
            if (len >= 150) {
                charDisplay.classList.add('limit-reached');
            } else {
                charDisplay.classList.remove('limit-reached');
            }
        };

        // Listen for typing, pasting, and deleting
        descriptionArea.addEventListener('input', updateCounter);

        updateCounter();
    }
});
