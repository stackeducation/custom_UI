function customizeB2CUI() {
    const signUpButton = document.getElementById('continue');
    if (signUpButton) {
        signUpButton.textContent = 'Sign Up';
    }
    

    const emailInput = document.getElementById("email");
    const verificationCodeInput = document.getElementById("emailVerificationCode");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("reenterPassword");
    const sendCodeButton = document.getElementById("emailVerificationControl_but_send_code");
    const verifyCodeButton = document.getElementById("emailVerificationControl_but_verify_code");
    const resendCodeButton = document.getElementById("emailVerificationControl_but_send_new_code");

    if (verifyCodeButton) {
        verifyCodeButton.textContent = "Verify";
    }

    if (resendCodeButton) {
        resendCodeButton.textContent = "Resend code";
    }

    const attachPasswordToggle = (input) => {
        if (!input || input.dataset.toggleAttached) {
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "password-field";

        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.className = "password-toggle";
        toggleButton.setAttribute("aria-label", "Show password");
        toggleButton.innerHTML =
            "<img src='https://stackeducation.github.io/custom_UI/v2/eye-open-icon.svg' alt='' aria-hidden='true' />";

        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        wrapper.appendChild(toggleButton);

        toggleButton.addEventListener("click", () => {
            const isHidden = input.type === "password";
            input.type = isHidden ? "text" : "password";
            toggleButton.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
            const icon = toggleButton.querySelector("img");
            if (icon) {
                icon.src = isHidden
                    ? "https://stackeducation.github.io/custom_UI/v2/eye-closed-icon.svg"
                    : "https://stackeducation.github.io/custom_UI/v2/eye-open-icon.svg";
            }
        });

        input.dataset.toggleAttached = "true";
    };

    attachPasswordToggle(newPasswordInput);
    attachPasswordToggle(confirmPasswordInput);

    const setButtonState = (button, enabled) => {
        if (!button) {
            return;
        }

        button.disabled = !enabled;
        button.style.backgroundColor = enabled ? "#094074" : "#E1DFD9";
        button.style.color = enabled ? "#FFFFFF" : "#a3a3a3";
        button.style.cursor = enabled ? "pointer" : "not-allowed";
    };

    const updateButtonState = () => {
        if (!emailInput) {
            return;
        }
        const hasEmail = emailInput.value.trim() !== "";
        const hasCode = verificationCodeInput && verificationCodeInput.value.trim() !== "";
        const hasPasswords = newPasswordInput && confirmPasswordInput
            ? newPasswordInput.value.trim() !== "" && confirmPasswordInput.value.trim() !== ""
            : false;
        setButtonState(sendCodeButton, hasEmail);
        setButtonState(verifyCodeButton, hasCode);
        setButtonState(signUpButton, hasPasswords);
    };

    const attachInputListener = (input) => {
        if (!input || input.dataset.stateListenerAttached) {
            return;
        }

        input.addEventListener("input", updateButtonState);
        input.dataset.stateListenerAttached = "true";
    };

    attachInputListener(emailInput);
    attachInputListener(verificationCodeInput);
    attachInputListener(newPasswordInput);
    attachInputListener(confirmPasswordInput);
    updateButtonState();
}

setTimeout(customizeB2CUI, 10);
// Backup retry
setTimeout(customizeB2CUI, 200);