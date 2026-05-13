function customizeB2CUI() {
    const emailInput = document.getElementById("email");
    const sendCodeButton = document.getElementById("emailVerificationControl_but_send_code");

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
        setButtonState(sendCodeButton, hasEmail);
    };

    if (emailInput && !emailInput.dataset.stateListenerAttached) {
        emailInput.addEventListener("input", updateButtonState);
        emailInput.dataset.stateListenerAttached = "true";
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