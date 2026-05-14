// Multi-step forgot password form
class ForgotPasswordForm {
    constructor() {
        this.currentPage = 1;
        this.userEmail = "";
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showPage(1);
    }

    setupEventListeners() {
        // Page 1 - Email Entry
        const emailInput = document.getElementById("emailInput");
        const sendCodeBtn = document.getElementById("sendCodeBtn");
        const cancelBtn1 = document.getElementById("cancelBtn1");

        if (emailInput) {
            emailInput.addEventListener("input", () => this.updatePage1ButtonState());
        }

        if (sendCodeBtn) {
            sendCodeBtn.addEventListener("click", () => this.handleSendCode());
        }

        if (cancelBtn1) {
            cancelBtn1.addEventListener("click", () => this.handleCancel());
        }

        // Page 2 - Verification Code
        const codeInput = document.getElementById("codeInput");
        const verifyCodeBtn = document.getElementById("verifyCodeBtn");
        const resendCodeBtn = document.getElementById("resendCodeBtn");
        const editEmailLink = document.getElementById("editEmailLink");
        const cancelBtn2 = document.getElementById("cancelBtn2");

        if (codeInput) {
            codeInput.addEventListener("input", () => this.updatePage2ButtonState());
            codeInput.addEventListener("keypress", (e) => {
                if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                }
            });
        }

        if (verifyCodeBtn) {
            verifyCodeBtn.addEventListener("click", () => this.handleVerifyCode());
        }

        if (resendCodeBtn) {
            resendCodeBtn.addEventListener("click", () => this.handleResendCode());
        }

        if (editEmailLink) {
            editEmailLink.addEventListener("click", (e) => {
                e.preventDefault();
                this.showPage(1);
            });
        }

        if (cancelBtn2) {
            cancelBtn2.addEventListener("click", () => this.handleCancel());
        }

        // Page 3 - Password Reset
        const newPasswordInput = document.getElementById("newPasswordInput");
        const confirmPasswordInput = document.getElementById("confirmPasswordInput");
        const resetPasswordBtn = document.getElementById("resetPasswordBtn");
        const cancelBtn3 = document.getElementById("cancelBtn3");

        if (newPasswordInput) {
            newPasswordInput.addEventListener("input", () => this.updatePage3ButtonState());
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener("input", () => this.updatePage3ButtonState());
        }

        if (resetPasswordBtn) {
            resetPasswordBtn.addEventListener("click", () => this.handleResetPassword());
        }

        if (cancelBtn3) {
            cancelBtn3.addEventListener("click", () => this.handleCancel());
        }

        // Password toggles
        this.setupPasswordToggles();
    }

    setupPasswordToggles() {
        const toggleButtons = document.querySelectorAll(".password-toggle");

        toggleButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const targetId = button.getAttribute("data-target");
                const input = document.getElementById(targetId);

                if (input) {
                    const isHidden = input.type === "password";
                    input.type = isHidden ? "text" : "password";
                    button.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");

                    const icon = button.querySelector("img");
                    if (icon) {
                        icon.src = isHidden
                            ? "https://stackeducation.github.io/custom_UI/v2/eye-closed-icon.svg"
                            : "https://stackeducation.github.io/custom_UI/v2/eye-open-icon.svg";
                    }
                }
            });
        });
    }

    showPage(pageNumber) {
        const page1 = document.getElementById("page1");
        const page2 = document.getElementById("page2");
        const page3 = document.getElementById("page3");

        // Hide all pages
        if (page1) page1.classList.add("hidden");
        if (page2) page2.classList.add("hidden");
        if (page3) page3.classList.add("hidden");

        // Show selected page
        if (pageNumber === 1 && page1) {
            page1.classList.remove("hidden");
            document.getElementById("emailInput")?.focus();
        } else if (pageNumber === 2 && page2) {
            page2.classList.remove("hidden");
            document.getElementById("codeInput")?.focus();
        } else if (pageNumber === 3 && page3) {
            page3.classList.remove("hidden");
            document.getElementById("newPasswordInput")?.focus();
        }

        this.currentPage = pageNumber;
    }

    updatePage1ButtonState() {
        const emailInput = document.getElementById("emailInput");
        const sendCodeBtn = document.getElementById("sendCodeBtn");

        if (!emailInput || !sendCodeBtn) return;

        const isValid = this.isValidEmail(emailInput.value.trim());
        this.setButtonState(sendCodeBtn, isValid);
    }

    updatePage2ButtonState() {
        const codeInput = document.getElementById("codeInput");
        const verifyCodeBtn = document.getElementById("verifyCodeBtn");

        if (!codeInput || !verifyCodeBtn) return;

        const isValid = codeInput.value.trim().length === 6;
        this.setButtonState(verifyCodeBtn, isValid);
    }

    updatePage3ButtonState() {
        const newPasswordInput = document.getElementById("newPasswordInput");
        const confirmPasswordInput = document.getElementById("confirmPasswordInput");
        const resetPasswordBtn = document.getElementById("resetPasswordBtn");

        if (!newPasswordInput || !confirmPasswordInput || !resetPasswordBtn) return;

        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        const isValid = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;
        this.setButtonState(resetPasswordBtn, isValid);
    }

    setButtonState(button, enabled) {
        if (!button) return;

        button.disabled = !enabled;
        button.style.backgroundColor = enabled ? "#094074" : "#E1DFD9";
        button.style.color = enabled ? "#FFFFFF" : "#a3a3a3";
        button.style.cursor = enabled ? "pointer" : "not-allowed";
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    handleSendCode() {
        const emailInput = document.getElementById("emailInput");

        if (!emailInput || !this.isValidEmail(emailInput.value.trim())) {
            alert("Please enter a valid email address");
            return;
        }

        this.userEmail = emailInput.value.trim();
        document.getElementById("emailDisplay").textContent = this.userEmail;

        // Here you would typically make an API call to send the verification code
        console.log("Sending verification code to:", this.userEmail);

        this.showPage(2);
    }

    handleVerifyCode() {
        const codeInput = document.getElementById("codeInput");

        if (!codeInput || codeInput.value.trim().length !== 6) {
            alert("Please enter a valid 6-digit code");
            return;
        }

        // Here you would typically make an API call to verify the code
        console.log("Verifying code:", codeInput.value.trim());

        this.showPage(3);
    }

    handleResetPassword() {
        const newPasswordInput = document.getElementById("newPasswordInput");
        const confirmPasswordInput = document.getElementById("confirmPasswordInput");

        if (!newPasswordInput || !confirmPasswordInput) return;

        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            alert("Password must be at least 8 characters long");
            return;
        }

        // Here you would typically make an API call to reset the password
        console.log("Resetting password for:", this.userEmail);

        alert("Password reset successfully! Redirecting to sign in...");
        // Redirect to sign in page
        window.location.href = "/signin";
    }

    handleResendCode() {
        // Here you would typically make an API call to resend the verification code
        console.log("Resending verification code to:", this.userEmail);
        alert("Verification code resent to " + this.userEmail);
    }

    handleCancel() {
        // Redirect to sign in page
        window.location.href = "/signin";
    }
}

// Initialize the form when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        new ForgotPasswordForm();
    });
} else {
    new ForgotPasswordForm();
}
