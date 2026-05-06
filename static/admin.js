async function handleAdminLogin(event) {
    event.preventDefault();

    const username = document.getElementById("admin-username").value;
    const password = document.getElementById("admin-password").value;

    const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    });

    const result = await response.json();

    if (result.success) {
        window.location.href = "/admin";
    } else {
        document.getElementById("admin-login-error").textContent = result.message;
    }
}


async function toggleBan(accountId) {
    const response = await fetch(`/api/admin/toggle-ban/${accountId}`, {
        method: "POST"
    });

    const result = await response.json();

    alert(result.message);

    if (result.success) {
        location.reload();
    }
}


async function deletePost(postId) {
    const confirmed = confirm("Are you sure you want to delete this listing?");

    if (!confirmed) return;

    const response = await fetch(`/api/admin/delete-post/${postId}`, {
        method: "POST"
    });

    const result = await response.json();

    alert(result.message);

    if (result.success) {
        location.reload();
    }
}


async function toggleClaimed(postId) {
    const response = await fetch(`/api/admin/toggle-claimed/${postId}`, {
        method: "POST"
    });

    const result = await response.json();

    alert(result.message);

    if (result.success) {
        location.reload();
    }
}