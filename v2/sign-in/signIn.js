function customizeB2CUI() {
    const forgotPasswordLink = document.getElementById('forgotPassword');

    const signInButton = document.getElementById('next');
    if (forgotPasswordLink) {
        forgotPasswordLink.textContent = 'Forgot Password?';
    }
    const emailInput = document.getElementById("email");

    if (emailInput) {
        emailInput.placeholder = "Enter your email";
    }

    const passwordInput = document.getElementById("password");

    if (passwordInput) {
        passwordInput.placeholder = "Enter Password";
    }

    const errorBox = document.querySelector(".error.pageLevel");
    const errorText = errorBox.querySelector("p");

    // check if text exists
    if (errorText.textContent.trim() !== "") {
        errorBox.style.display = "block";
        errorBox.setAttribute("aria-hidden", "false");
    } else {
        errorBox.style.display = "none";
        errorBox.setAttribute("aria-hidden", "true");
    }
}

setTimeout(customizeB2CUI, 10);
// Backup retry
setTimeout(customizeB2CUI, 200);

// function attachSignInHandler() {

//     const signInButton = document.getElementById("next");

//     if (!signInButton || signInButton.dataset.customAttached) {
//         return;
//     }

//     signInButton.dataset.customAttached = "true";

//     signInButton.addEventListener("click", () => {

//         // Your custom logic here
//         console.log("Custom logic before sign in");

//         // document.body.classList.add("loading");

//     });
// }

// const interval = setInterval(() => {

//     const signInButton = document.getElementById("next");

//     if (signInButton) {

//         attachSignInHandler();

//         clearInterval(interval);
//     }

// }, 200);