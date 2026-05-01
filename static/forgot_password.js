// Send email to request password reset
async function handleForgotSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('forgot-email').value;
    try {
        const response = await fetch('/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });
        const data = await response.text();
        alert(data);
    } catch (err) {
        alert('Error sending reset email.');
        console.error(err);
    }
}
