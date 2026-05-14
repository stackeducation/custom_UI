function customizeB2CUI() {
    const emailInput = document.getElementById("email");
    const verificationCodeInput = document.getElementById("emailVerificationCode");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("reenterPassword");
    const sendCodeButton = document.getElementById("emailVerificationControl_but_send_code");
    const verifyCodeButton = document.getElementById("emailVerificationControl_but_verify_code");
    const resendCodeButton = document.getElementById("emailVerificationControl_but_send_new_code");
    const continueButton = document.getElementById("continue");
    const changeClaimsButton = document.getElementById("emailVerificationControl_but_change_claims");

    if (verifyCodeButton) {
        verifyCodeButton.textContent = "Verify";
    }

    if (resendCodeButton) {
        resendCodeButton.textContent = "Resend code";
    }

    if (verifyCodeButton && resendCodeButton && !resendCodeButton.dataset.repositioned) {
        const resendRow = document.createElement("div");
        resendRow.className = "resend-row";

        const helperText = document.createElement("span");
        helperText.className = "resend-helper";
        helperText.textContent = "Didn't receive the code?";

        resendCodeButton.classList.add("resend-link");

        resendRow.appendChild(helperText);
        resendRow.appendChild(resendCodeButton);
        verifyCodeButton.parentNode.insertBefore(resendRow, verifyCodeButton);
        resendCodeButton.dataset.repositioned = "true";
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

    const syncPasswordToggles = () => {
        attachPasswordToggle(document.getElementById("newPassword"));
        attachPasswordToggle(document.getElementById("reenterPassword"));
    };

    syncPasswordToggles();

    const setButtonState = (button, enabled) => {
        if (!button) {
            return;
        }
        button.disabled = !enabled;
        button.style.backgroundColor = enabled ? "#094074" : "#E1DFD9";
        button.style.color = enabled ? "#FFFFFF" : "#a3a3a3";
        button.style.cursor = enabled ? "pointer" : "not-allowed";

        const resendRow = button.closest(".resend-row");
        if (resendRow) {
            resendRow.style.display = getComputedStyle(button).display === "none" ? "none" : "flex";
        }
    };

    const updateResendRowVisibility = () => {
        if (!resendCodeButton) {
            return;
        }

        const resendRow = resendCodeButton.closest(".resend-row");
        if (resendRow) {
            resendRow.style.display = getComputedStyle(resendCodeButton).display === "none" ? "none" : "flex";
        }
    };

    const updateButtonState = () => {
        const currentEmailInput = document.getElementById("email");
        const currentVerificationCodeInput = document.getElementById("emailVerificationCode");
        const currentNewPasswordInput = document.getElementById("newPassword");
        const currentConfirmPasswordInput = document.getElementById("reenterPassword");
        const currentChangeClaimsButton = document.getElementById("emailVerificationControl_but_change_claims");

        if (!currentEmailInput && !currentVerificationCodeInput && !currentNewPasswordInput && !currentConfirmPasswordInput && !currentChangeClaimsButton) {
            return;
        }

        const hasEmail = currentEmailInput?.value.trim() !== "";
        const hasCode = currentVerificationCodeInput && currentVerificationCodeInput.value.trim() !== "";
        const hasPasswords = currentNewPasswordInput && currentConfirmPasswordInput
            ? currentNewPasswordInput.value.trim() !== "" && currentConfirmPasswordInput.value.trim() !== ""
            : false;
        const changeClaimsVisible = currentChangeClaimsButton
            ? getComputedStyle(changeClaimsButton).display !== "none"
            : false;
        syncPasswordToggles();
        setButtonState(sendCodeButton, hasEmail);
        setButtonState(verifyCodeButton, hasCode);
        setButtonState(continueButton, hasPasswords || changeClaimsVisible);
        updateResendRowVisibility();
    };

    if (emailInput && !emailInput.dataset.stateListenerAttached) {
        emailInput.addEventListener("input", updateButtonState);
        emailInput.dataset.stateListenerAttached = "true";
    }

    if (verificationCodeInput && !verificationCodeInput.dataset.stateListenerAttached) {
        verificationCodeInput.addEventListener("input", updateButtonState);
        verificationCodeInput.dataset.stateListenerAttached = "true";
    }

    if (newPasswordInput && !newPasswordInput.dataset.stateListenerAttached) {
        newPasswordInput.addEventListener("input", updateButtonState);
        newPasswordInput.dataset.stateListenerAttached = "true";
    }

    if (confirmPasswordInput && !confirmPasswordInput.dataset.stateListenerAttached) {
        confirmPasswordInput.addEventListener("input", updateButtonState);
        confirmPasswordInput.dataset.stateListenerAttached = "true";
    }

    if (!document.body.dataset.stateListenerAttached) {
        document.body.addEventListener("input", updateButtonState);
        document.body.dataset.stateListenerAttached = "true";
    }

    if (changeClaimsButton && !changeClaimsButton.dataset.stateObserverAttached) {
        const observer = new MutationObserver(() => updateButtonState());
        observer.observe(changeClaimsButton, {
            attributes: true,
            attributeFilter: ["style", "class", "aria-hidden"]
        });
        changeClaimsButton.dataset.stateObserverAttached = "true";
    }

    updateButtonState();

    const cancelBtn = document.getElementById("cancel");

    if (cancelBtn) {
        cancelBtn.textContent = "Back to Sign in";
    }
}

setTimeout(customizeB2CUI, 10);
// Backup retry
setTimeout(customizeB2CUI, 200);
