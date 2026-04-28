//  Login Logic 
function handleLoginSubmit(event: Event): void {
    const emailInput = document.getElementById('login-email') as HTMLInputElement | null;
    const errorDiv = document.getElementById('login-error') as HTMLElement | null;

    if (!emailInput || !errorDiv) return;

    const email = emailInput.value;

    if (!validateSouthernEmail(email)) {
        event.preventDefault(); // Stop form from submitting to dashboard
        errorDiv.textContent = "Access restricted to @southernct.edu emails.";
    }
}