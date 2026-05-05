let resetEmail = "";

function handleForgotSubmit(event) {
    event.preventDefault();

    const email = document.getElementById("forgot-email").value;
    const errorDiv = document.getElementById("forgot-error");

    fetch("/api/forgot-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                resetEmail = email;
                errorDiv.style.color = "green";
                errorDiv.textContent = data.message;

                document.getElementById("forgot-step-1").style.display = "none";
                document.getElementById("forgot-step-2").style.display = "block";


            } else {
                errorDiv.style.color = "red";
                errorDiv.textContent = data.message;
            }
        });
}

function handleForgotVerify(event) {
    event.preventDefault();

    const code = document.getElementById("verification-code").value;
    const errorDiv = document.getElementById("forgot-error");

    fetch("/api/verify-reset-code", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: resetEmail,
            code: code
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                errorDiv.textContent = "";

                document.getElementById("forgot-step-2").style.display = "none";
                document.getElementById("forgot-step-3").style.display = "block";
            } else {
                errorDiv.style.color = "red";
                errorDiv.textContent = data.message;
            }
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