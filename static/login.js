//  Login Logic 
async function handleLoginSubmit(event) {
    event.preventDefault(); // STOP the browser from forcing a redirect

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password'); 
    const errorDiv = document.getElementById('login-error');

    if (!emailInput || !passwordInput || !errorDiv) return;

    const email = emailInput.value;
    const password = passwordInput.value;

    if (!validateSouthernEmail(email)) {
        errorDiv.textContent = "Access restricted to @southernct.edu emails.";
        return;
    }

    try {
        // Send email AND password to Python to check
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = data.redirect; // ONLY redirect if Python says the password is correct
        } else {
            errorDiv.textContent = data.message; // Show error message from Python
        }
    } catch (error) {
        errorDiv.textContent = "Server error occurred.";
    }
}
