//Reusable Validation Function 
// This function is shared across multiple pages to ensure consistency
function validateSouthernEmail(email) {
    return email.toLowerCase().endsWith('@southernct.edu');
}
