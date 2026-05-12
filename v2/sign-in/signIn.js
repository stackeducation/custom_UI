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

    if (passwordInput && !passwordInput.dataset.toggleAttached) {
        const wrapper = document.createElement("div");
        wrapper.className = "password-field";

        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.className = "password-toggle";
        toggleButton.setAttribute("aria-label", "Show password");
        toggleButton.innerHTML =
            "<img src='https://stackeducation.github.io/custom_UI/v2/eye-open-icon.svg' alt='' aria-hidden='true' />";

        passwordInput.parentNode.insertBefore(wrapper, passwordInput);
        wrapper.appendChild(passwordInput);
        wrapper.appendChild(toggleButton);

        toggleButton.addEventListener("click", () => {
            const isHidden = passwordInput.type === "password";
            passwordInput.type = isHidden ? "text" : "password";
            toggleButton.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
            const icon = toggleButton.querySelector("img");
            if (icon) {
                icon.src = isHidden
                    ? "https://stackeducation.github.io/custom_UI/v2/eye-closed-icon.svg"
                    : "https://stackeducation.github.io/custom_UI/v2/eye-open-icon.svg";
            }
        });

        passwordInput.dataset.toggleAttached = "true";
    }

    const updateButtonState = () => {
        if (!signInButton || !emailInput || !passwordInput) {
            return;
        }

        const isReady = emailInput.value.trim() !== "" && passwordInput.value.trim() !== "";
        if (isReady) {
            signInButton.disabled = false;
            signInButton.style.backgroundColor = "#094074";
            signInButton.style.color = "#FFFFFF";
            signInButton.style.cursor = "pointer";
        } else {
            signInButton.disabled = true;
            signInButton.style.backgroundColor = "#E1DFD9";
            signInButton.style.color = "#a3a3a3";
            signInButton.style.cursor = "not-allowed";
        }
    };

    if (emailInput && passwordInput) {
        if (!emailInput.dataset.stateListenerAttached) {
            emailInput.addEventListener("input", updateButtonState);
            emailInput.dataset.stateListenerAttached = "true";
        }

        if (!passwordInput.dataset.stateListenerAttached) {
            passwordInput.addEventListener("input", updateButtonState);
            passwordInput.dataset.stateListenerAttached = "true";
        }
    }

    updateButtonState();

    const passwordEntryItem = document.querySelector(".entry .entry-item:nth-of-type(2)");
    if (passwordEntryItem && forgotPasswordLink) {
        if (forgotPasswordLink.parentElement !== passwordEntryItem) {
            passwordEntryItem.appendChild(forgotPasswordLink);
        } else if (passwordEntryItem.lastElementChild !== forgotPasswordLink) {
            passwordEntryItem.appendChild(forgotPasswordLink);
        }
    }

    const errorBox = document.querySelector(".error.pageLevel");
    const errorText = errorBox.querySelector("p");

    // check if text exists
    if (errorText?.textContent?.trim() !== "") {
        errorBox.style.display = "block";
        errorBox.setAttribute("aria-hidden", "false");
    } else {
        errorBox.style.display = "none";
        errorBox.setAttribute("aria-hidden", "true");
    }


    if (!signInButton || signInButton.dataset.customAttached) {
        return;
    }

    signInButton.dataset.customAttached = "true";

    signInButton.addEventListener("click", (data) => {

        // Your custom logic here
        console.log("Custom logic before sign in", data);

        // document.body.classList.add("loading");

    });
}

setTimeout(customizeB2CUI, 10);
// Backup retry
setTimeout(customizeB2CUI, 200);