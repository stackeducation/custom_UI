function customizeB2CUI() {
    const signUpButton = document.getElementById('continue');
    if (signUpButton) {
        signUpButton.textContent = 'Sign Up';
    }
    

    const emailInput = document.getElementById("email");
    const verificationCodeInput = document.getElementById("emailVerificationCode");
    const sendCodeButton = document.getElementById("emailVerificationControl_but_send_code");
    const verifyCodeButton = document.getElementById("emailVerificationControl_but_verify_code");
    const resendCodeButton = document.getElementById("emailVerificationControl_but_send_new_code");

    if (verifyCodeButton) {
        verifyCodeButton.textContent = "Verify";
    }

    if (resendCodeButton) {
        resendCodeButton.textContent = "Resend code";
    }

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
        setButtonState(sendCodeButton, hasEmail);
        setButtonState(verifyCodeButton, hasCode);
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
    updateButtonState();
}

setTimeout(customizeB2CUI, 10);
// Backup retry
setTimeout(customizeB2CUI, 200);