var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//  Register Logic (Direct to Database) 
function handleRegisterSubmit(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const nameInput = document.getElementById('register-name');
        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        const confirmInput = document.getElementById('register-confirm');
        const errorDiv = document.getElementById('register-error');
        if (!nameInput || !emailInput || !passwordInput || !confirmInput || !errorDiv)
            return;
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
            const response = yield fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: name, email: email, password: password })
            });
            // Read the response from Python
            const result = yield response.json();
            if (result.success) {
                alert("Account created successfully!");
                window.location.href = "/"; // Redirect to login
            }
            else {
                errorDiv.style.color = "red";
                errorDiv.textContent = result.message; // e.g. "Email already registered"
            }
        }
        catch (error) {
            console.error("Error saving to database:", error);
            errorDiv.style.color = "red";
            errorDiv.textContent = "Server error. Could not connect to database.";
        }
    });
}
