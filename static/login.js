//  Login Logic 
function handleLoginSubmit(event) {
    const emailInput = document.getElementById('login-email');
    const errorDiv = document.getElementById('login-error');
    if (!emailInput || !errorDiv)
        return;
    const email = emailInput.value;
    if (!validateSouthernEmail(email)) {
        event.preventDefault(); // Stop form from submitting to dashboard
        errorDiv.textContent = "Access restricted to @southernct.edu emails.";
    }
}
