let resetEmail = "";

function handleForgotSubmit(event) {
    event.preventDefault();

    const email = document.getElementById("forgot-email").value;
    const errorDiv = document.getElementById("forgot-error");
    const btn = event.target.querySelector("button[type='submit']");

    errorDiv.textContent = "";
    btn.disabled = true;
    btn.textContent = "Sending…";

    fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email })
    })
        .then(response => response.json())
        .then(data => {
            btn.disabled = false;
            btn.textContent = "Send Code";
            if (data.success) {
                resetEmail = email;
                errorDiv.style.color = "green";
                errorDiv.textContent = data.message;
                document.getElementById("forgot-step-1").classList.remove("active");
                document.getElementById("forgot-step-2").classList.add("active");
            } else {
                errorDiv.style.color = "red";
                errorDiv.textContent = data.message;
            }
        })
        .catch(() => {
            btn.disabled = false;
            btn.textContent = "Send Code";
            errorDiv.style.color = "red";
            errorDiv.textContent = "Could not reach the server. Please try again.";
        });
}

function handleForgotVerify(event) {
    event.preventDefault();

    const code = document.getElementById("verification-code").value;
    const errorDiv = document.getElementById("forgot-error");

    const btn = event.target.querySelector("button[type='submit']");
    btn.disabled = true;
    btn.textContent = "Verifying…";

    fetch("/api/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, code: code })
    })
        .then(response => response.json())
        .then(data => {
            btn.disabled = false;
            btn.textContent = "Verify Code";
            if (data.success) {
                errorDiv.textContent = "";
                document.getElementById("forgot-step-2").classList.remove("active");
                document.getElementById("forgot-step-3").classList.add("active");
            } else {
                errorDiv.style.color = "red";
                errorDiv.textContent = data.message;
            }
        })
        .catch(() => {
            btn.disabled = false;
            btn.textContent = "Verify Code";
            errorDiv.style.color = "red";
            errorDiv.textContent = "Could not reach the server. Please try again.";
        });
}

function handleResetPassword(event) {
    event.preventDefault();

    const password = document.getElementById("new-password").value;
    const confirm = document.getElementById("new-confirm").value;
    const errorDiv = document.getElementById("reset-error");

    if (password !== confirm) {
        errorDiv.textContent = "Passwords do not match.";
        return;
    }

    fetch("/api/reset-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: resetEmail,
            password: password
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Password reset successfully!");
                window.location.href = "/";
            } else {
                errorDiv.textContent = data.message;
            }
        });
}