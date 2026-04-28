
//  Register Logic (Direct to Database) 
async function handleRegisterSubmit(event: Event): Promise<void> {
    event.preventDefault(); 
    
    const nameInput = document.getElementById('register-name') as HTMLInputElement | null;
    const emailInput = document.getElementById('register-email') as HTMLInputElement | null;
    const passwordInput = document.getElementById('register-password') as HTMLInputElement | null;
    const confirmInput = document.getElementById('register-confirm') as HTMLInputElement | null;
    const errorDiv = document.getElementById('register-error') as HTMLElement | null;

    if (!nameInput || !emailInput || !passwordInput || !confirmInput || !errorDiv) return;

    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    // 1. Basic Frontend Validation
    if (password !== confirm) {
        errorDiv.textContent = "Passwords do not match.";
        errorDiv.style.color = "red";
        return;
    }

    if (!validateSouthernEmail(email)) {
        errorDiv.textContent = "Registration is restricted to @southernct.edu emails.";
        errorDiv.style.color = "red";
        return;
    }

    // Give the user visual feedback that the request is sending
    errorDiv.textContent = "Creating account..."; 
    errorDiv.style.color = "blue";

    // 2. Send POST request to backend Database
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name, email: email, password: password })
        });

        // Read the response from Python
        const result = await response.json();

        if (result.success) {
            alert("Account created successfully!");
            window.location.href = "/"; // Redirect to login
        } else {
            errorDiv.style.color = "red";
            errorDiv.textContent = result.message; // e.g. "Email already registered"
        }
    } catch (error) {
        console.error("Error saving to database:", error);
        errorDiv.style.color = "red";
        errorDiv.textContent = "Server error. Could not connect to database.";
    }
}