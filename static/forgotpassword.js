//  Forgot Password Logic 
function handleForgotSubmit(event) {
    event.preventDefault();
    const emailInput = document.getElementById('forgot-email');
    const errorDiv = document.getElementById('forgot-error');
    if (!emailInput || !errorDiv)
        return;
    const email = emailInput.value;
    if (!validateSouthernEmail(email)) {
        errorDiv.textContent = "Please enter a valid @southernct.edu email.";
        return;
    }
    // If valid, hide Step 1 and show Step 2 (Verification Code)
    errorDiv.textContent = "";
    const step1 = document.getElementById('forgot-step-1');
    const step2 = document.getElementById('forgot-step-2');
    if (step1)
        step1.style.display = 'none';
    if (step2)
        step2.style.display = 'block';
}
function handleForgotVerify(event) {
    event.preventDefault();
    // Hide Step 2, Show Step 3 (New Password)
    const step2 = document.getElementById('forgot-step-2');
    const step3 = document.getElementById('forgot-step-3');
    if (step2)
        step2.style.display = 'none';
    if (step3)
        step3.style.display = 'block';
}
function handleResetPassword(event) {
    event.preventDefault();
    const passwordInput = document.getElementById('new-password');
    const confirmInput = document.getElementById('new-confirm');
    const errorDiv = document.getElementById('reset-error');
    if (!passwordInput || !confirmInput || !errorDiv)
        return;
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    if (password !== confirm) {
        errorDiv.textContent = "Passwords do not match.";
        return;
    }
    alert("Password reset successfully!");
    window.location.href = "/"; // Redirect to login
}
