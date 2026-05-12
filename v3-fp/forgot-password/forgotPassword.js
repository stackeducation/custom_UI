document.addEventListener('DOMContentLoaded', function() {
    let verificationCode = ['', '', '', '', '', ''];
    let userEmail = '';
    
    // Get URL parameters to determine current step
    const urlParams = new URLSearchParams(window.location.search);
    const currentStep = urlParams.get('step') || 'email'; // email, verify, reset
    
    // Show the appropriate step
    showStep(currentStep);
    
    function showStep(step) {
        // Hide all steps
        document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
        
        // Show current step
        const currentStepElement = document.getElementById(`${step}-step`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }
        
        // Update heading and description based on step
        const headingElement = document.querySelector('.custom-heading h1');
        const descElement = document.querySelector('.custom-heading p');
        
        switch(step) {
            case 'email':
                headingElement.textContent = 'forgot your password?';
                descElement.textContent = 'verify your email to reset the password';
                break;
            case 'verify':
                headingElement.textContent = 'verify email';
                descElement.textContent = 'enter the 6-digit code sent to your email';
                // Set email from URL parameter or stored value
                const emailParam = urlParams.get('email') || userEmail;
                if (emailParam && document.getElementById('userEmail')) {
                    document.getElementById('userEmail').textContent = emailParam;
                    userEmail = emailParam;
                }
                break;
            case 'reset':
                headingElement.textContent = 'reset password';
                descElement.textContent = 'enter your new password';
                break;
        }
    }
    
    // Email Step Logic
    setTimeout(() => {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.placeholder = 'Enter your email';
        }

        const continueButton = document.getElementById('continue');
        if (continueButton) {
            continueButton.style.display = 'none';
        }

        const sendButton = document.querySelector('button[aria-label="Send verification code"]');
        if (sendButton) {
            sendButton.addEventListener('click', function(e) {
                e.preventDefault();
                const email = emailInput ? emailInput.value : '';
                if (email) {
                    userEmail = email;
                    // Redirect to verification step with email parameter
                    window.location.href = `forgotPassword.html?step=verify&email=${encodeURIComponent(email)}`;
                }
            });
        }

        const cancelButton = document.getElementById('cancel');
        if (cancelButton) {
            cancelButton.textContent = 'Back to Sign in';
            cancelButton.addEventListener('click', function() {
                window.location.href = '../sign-in/signIn.html';
            });
        }
    }, 100);
    
    // Verification Step Logic
    const inputs = document.querySelectorAll('.verification-inputs input');
    const verifyButton = document.getElementById('verify');
    
    inputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            const value = e.target.value;
            
            if (value.length === 1 && /^[0-9]$/.test(value)) {
                verificationCode[index] = value;
                input.classList.add('filled');
                
                // Move to next input
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            } else {
                verificationCode[index] = '';
                input.classList.remove('filled');
                e.target.value = '';
            }
            
            checkVerificationCompletion();
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                inputs[index - 1].focus();
            }
        });
        
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').slice(0, 6);
            const digits = pastedData.replace(/[^0-9]/g, '');
            
            digits.split('').forEach((digit, i) => {
                if (index + i < inputs.length) {
                    inputs[index + i].value = digit;
                    verificationCode[index + i] = digit;
                    inputs[index + i].classList.add('filled');
                }
            });
            
            checkVerificationCompletion();
        });
    });
    
    function checkVerificationCompletion() {
        const isComplete = verificationCode.every(digit => digit !== '');
        if (verifyButton) {
            verifyButton.disabled = !isComplete;
        }
    }
    
    // Handle verify button click
    if (verifyButton) {
        verifyButton.addEventListener('click', function() {
            const code = verificationCode.join('');
            console.log('Verification code:', code);
            // Here you would normally verify the code
            // For demo, redirect to reset password step
            window.location.href = `forgotPassword.html?step=reset&email=${encodeURIComponent(userEmail)}`;
        });
    }
    
    // Handle edit email link
    const editLink = document.querySelector('.edit-link');
    if (editLink) {
        editLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'forgotPassword.html?step=email';
        });
    }
    
    // Handle resend link
    const resendLink = document.querySelector('.resend-link');
    if (resendLink) {
        resendLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Resend verification code logic here
            alert('Verification code resent!');
        });
    }
    
    // Reset Password Step Logic
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const resetContinueButton = document.getElementById('continue');
    const requirements = {
        length: document.querySelector('.req-length'),
        uppercase: document.querySelector('.req-uppercase'),
        lowercase: document.querySelector('.req-lowercase'),
        number: document.querySelector('.req-number'),
        special: document.querySelector('.req-special')
    };
    
    function validatePassword(password) {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        // Update UI
        Object.keys(checks).forEach(key => {
            if (requirements[key]) {
                if (checks[key]) {
                    requirements[key].classList.add('valid');
                } else {
                    requirements[key].classList.remove('valid');
                }
            }
        });
        
        return Object.values(checks).every(check => check);
    }
    
    function checkResetFormCompletion() {
        const newPassword = newPasswordInput ? newPasswordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
        
        const isPasswordValid = validatePassword(newPassword);
        const doPasswordsMatch = newPassword === confirmPassword && newPassword.length > 0;
        
        if (resetContinueButton) {
            resetContinueButton.disabled = !(isPasswordValid && doPasswordsMatch);
        }
    }
    
    // Add event listeners for reset password
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', checkResetFormCompletion);
        newPasswordInput.placeholder = 'Enter new password';
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkResetFormCompletion);
        confirmPasswordInput.placeholder = 'Confirm new password';
    }
    
    // Handle continue button click for reset password
    if (resetContinueButton) {
        resetContinueButton.addEventListener('click', function() {
            const newPassword = newPasswordInput ? newPasswordInput.value : '';
            console.log('Password reset with:', newPassword);
            // Here you would normally submit the new password
            alert('Password has been reset successfully!');
            // Redirect to sign in page
            window.location.href = '../sign-in/signIn.html';
        });
    }
    
    // Handle cancel button for all steps
    const allCancelButtons = document.querySelectorAll('#cancel');
    allCancelButtons.forEach(button => {
        if (!button.hasAttribute('data-listener')) {
            button.setAttribute('data-listener', 'true');
            button.addEventListener('click', function() {
                window.location.href = '../sign-in/signIn.html';
            });
        }
    });
});
