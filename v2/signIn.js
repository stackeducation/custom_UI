function customizeB2CUI() {

    // Remove default B2C heading
    const b2cHeading = document.querySelector("#api .heading");

    if (b2cHeading) {
        b2cHeading.style.display = "none";
    }

    // Remove intro text
    const intro = document.querySelector(".intro");

    if (intro) {
        intro.style.display = "none";
    }

    // Update button text
    const signInButton = document.getElementById("next");

    if (signInButton) {
        signInButton.textContent = "SIGN IN";
    }

    // Update forgot password text
    const forgotPassword = document.getElementById("forgotPassword");

    if (forgotPassword) {
        forgotPassword.textContent = "Forgot password?";
    }

    // Update placeholders
    const emailInput = document.getElementById("email");

    if (emailInput) {
        emailInput.placeholder = "Enter your email";
    }

    const passwordInput = document.getElementById("password");

    if (passwordInput) {
        passwordInput.placeholder = "Enter Password";
    }
}

const observer = new MutationObserver(() => {
    customizeB2CUI();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

window.onload = customizeB2CUI;