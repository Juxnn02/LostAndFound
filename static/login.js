function handleLoginSubmit(event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const errorMessage = document.getElementById("login-error");

    fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = "/dashboard";
            } else {
                errorMessage.textContent = data.message;
            }
        })
        .catch(error => {
            errorMessage.textContent = "Login failed. Please try again.";
        });
}
