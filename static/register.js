async function handleRegisterSubmit(event) {
    event.preventDefault();

    const firstNameInput = document.getElementById('register-first-name');
    const lastNameInput  = document.getElementById('register-last-name');
    const emailInput     = document.getElementById('register-email');
    const passwordInput  = document.getElementById('register-password');
    const confirmInput   = document.getElementById('register-confirm');
    const errorDiv       = document.getElementById('register-error');

    if (!firstNameInput || !lastNameInput || !emailInput || !passwordInput || !confirmInput || !errorDiv) return;

    const firstName = firstNameInput.value.trim();
    const lastName  = lastNameInput.value.trim();
    const name      = firstName + ' ' + lastName;
    const email     = emailInput.value;
    const password  = passwordInput.value;
    const confirm   = confirmInput.value;

    if (password !== confirm) {
        errorDiv.textContent = 'Passwords do not match.';
        return;
    }

    if (!validateSouthernEmail(email)) {
        errorDiv.textContent = 'Registration is restricted to @southernct.edu emails.';
        return;
    }

    errorDiv.textContent = 'Creating account...';
    errorDiv.style.color = '#003DA5';

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const result = await response.json();

        if (result.success) {
            alert('Account created successfully!');
            window.location.href = '/';
        } else {
            errorDiv.style.color = '';
            errorDiv.textContent = result.message;
        }
    } catch (error) {
        errorDiv.style.color = '';
        errorDiv.textContent = 'Server error. Could not connect to database.';
    }
}
