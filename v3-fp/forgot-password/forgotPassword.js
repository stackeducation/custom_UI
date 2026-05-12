// Single Page Forgot Password Flow
document.addEventListener('DOMContentLoaded', function() {
    let verificationCode = ['', '', '', '', '', ''];
    let userEmail = '';
    let currentStep = 'email'; // email, verify, reset
    
    // Get URL parameters to determine initial step
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    if (stepParam && ['email', 'verify', 'reset'].includes(stepParam)) {
        currentStep = stepParam;
    }
    
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
        
        // Update heading and description
        const headingElement = document.getElementById('page-heading');
        const descElement = document.getElementById('page-description');
        
        switch(step) {
            case 'email':
                headingElement.textContent = 'forgot your password?';
                descElement.textContent = 'verify your email to reset the password';
                initializeEmailStep();
                break;
            case 'verify':
                headingElement.textContent = 'verify email';
                descElement.textContent = 'enter the 6-digit code sent to your email';
                initializeVerificationStep();
                break;
            case 'reset':
                headingElement.textContent = 'reset password';
                descElement.textContent = 'enter your new password';
                initializeResetStep();
                break;
        }
        
        currentStep = step;
    }
    
    function initializeEmailStep() {
        setTimeout(() => {
            // Hide continue button
            const continueButton = document.getElementById('continue');
            if (continueButton) {
                continueButton.style.display = 'none';
            }
            
            // Update send verification button
            const sendButton = document.querySelector('button[aria-label="Send verification code"]') || 
                              document.querySelector('button:not([aria-disabled])');
            if (sendButton) {
                sendButton.textContent = 'SEND VERIFICATION CODE';
                sendButton.onclick = function(e) {
                    e.preventDefault();
                    
                    const emailInput = document.getElementById('email');
                    if (emailInput && emailInput.value) {
                        userEmail = emailInput.value;
                        sessionStorage.setItem('forgotPasswordEmail', userEmail);
                        
                        // For B2C, submit form first then redirect
                        const form = document.getElementById('localAccountForm') || document.querySelector('form');
                        if (form) {
                            // B2C will handle email sending
                            setTimeout(() => {
                                showStep('verify');
                            }, 2000);
                        } else {
                            showStep('verify');
                        }
                    } else {
                        alert('Please enter your email address');
                    }
                };
            }
            
            // Update cancel button text
            const cancelButton = document.getElementById('cancel');
            if (cancelButton) {
                cancelButton.textContent = 'Back to Sign in';
            }
        }, 100);
    }
    
    function initializeVerificationStep() {
        const codeInputs = document.querySelectorAll('.code-input');
        const verifyButton = document.getElementById('verifyButton');
        const resendLink = document.getElementById('resendLink');
        const cancelButton = document.getElementById('cancelButton');
        
        // Update cancel button text for verification step
        if (cancelButton) {
            cancelButton.textContent = 'Back to Sign in';
        }
        
        // Auto-focus first input
        if (codeInputs[0]) {
            codeInputs[0].focus();
        }
        
        // Handle input changes
        codeInputs.forEach((input, index) => {
            input.addEventListener('input', function(e) {
                const value = e.target.value;
                
                if (value.length === 1) {
                    verificationCode[index] = value;
                    input.classList.add('filled');
                    
                    // Move to next input
                    if (index < codeInputs.length - 1) {
                        codeInputs[index + 1].focus();
                    }
                } else {
                    verificationCode[index] = '';
                    input.classList.remove('filled');
                }
                
                // Check if all fields are filled
                const isComplete = verificationCode.every(code => code !== '');
                if (verifyButton) {
                    verifyButton.disabled = !isComplete;
                }
            });
            
            input.addEventListener('keydown', function(e) {
                // Handle backspace
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                    codeInputs[index - 1].focus();
                }
                
                // Handle paste
                if (e.key === 'Paste' || (e.ctrlKey && e.key === 'v')) {
                    e.preventDefault();
                    navigator.clipboard.readText().then(text => {
                        const pastedCode = text.replace(/\D/g, '').slice(0, 6);
                        for (let i = 0; i < pastedCode.length; i++) {
                            if (codeInputs[i]) {
                                codeInputs[i].value = pastedCode[i];
                                codeInputs[i].classList.add('filled');
                                verificationCode[i] = pastedCode[i];
                            }
                        }
                        if (verifyButton) {
                            verifyButton.disabled = verificationCode.some(code => code === '');
                        }
                    });
                }
            });
        });
        
        // Handle verification form submission
        const verificationForm = document.getElementById('verificationForm');
        if (verificationForm) {
            verificationForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const code = verificationCode.join('');
                console.log('Verifying code:', code);
                
                // In production, verify with backend
                // Simulate verification success
                setTimeout(() => {
                    showStep('reset');
                }, 1000);
            });
        }
        
        // Handle resend code
        if (resendLink) {
            resendLink.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Resending code...');
                
                // Clear inputs and reset
                codeInputs.forEach(input => {
                    input.value = '';
                    input.classList.remove('filled');
                });
                verificationCode = ['', '', '', '', '', ''];
                if (verifyButton) {
                    verifyButton.disabled = true;
                }
                codeInputs[0].focus();
            });
        }
        
        // Handle edit email
        if (editEmail) {
            editEmail.addEventListener('click', function(e) {
                e.preventDefault();
                showStep('email');
            });
        }
        
        // Handle cancel
        if (cancelButton) {
            cancelButton.addEventListener('click', function() {
                // Redirect to sign in
                window.location.href = '../v2/sign-in/signIn.html';
            });
        }
    }
    
    function initializeResetStep() {
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const resetButton = document.getElementById('resetButton');
        const cancelButton = document.getElementById('cancelButton');
        
        // Update cancel button text for reset step
        if (cancelButton) {
            cancelButton.textContent = 'Back to Sign in';
        }
        
        // Password requirements elements
        const lengthReq = document.getElementById('length');
        const uppercaseReq = document.getElementById('uppercase');
        const lowercaseReq = document.getElementById('lowercase');
        const numberReq = document.getElementById('number');
        
        function validatePassword(password) {
            const requirements = {
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /[0-9]/.test(password)
            };
            
            // Update UI
            if (lengthReq) {
                lengthReq.classList.toggle('valid', requirements.length);
            }
            if (uppercaseReq) {
                uppercaseReq.classList.toggle('valid', requirements.uppercase);
            }
            if (lowercaseReq) {
                lowercaseReq.classList.toggle('valid', requirements.lowercase);
            }
            if (numberReq) {
                numberReq.classList.toggle('valid', requirements.number);
            }
            
            return Object.values(requirements).every(req => req);
        }
        
        function checkPasswordsMatch() {
            return newPasswordInput.value === confirmPasswordInput.value && 
                   newPasswordInput.value !== '';
        }
        
        function updateResetButton() {
            const isValidPassword = validatePassword(newPasswordInput.value);
            const passwordsMatch = checkPasswordsMatch();
            
            if (resetButton) {
                resetButton.disabled = !(isValidPassword && passwordsMatch);
            }
        }
        
        // Event listeners
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', updateResetButton);
        }
        
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', updateResetButton);
        }
        
        // Handle form submission
        const resetPasswordForm = document.getElementById('resetPasswordForm');
        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const newPassword = newPasswordInput.value;
                console.log('Resetting password with:', newPassword);
                
                // In production, submit to backend
                alert('Password reset successfully! Redirecting to sign in...');
                
                // Redirect to sign in page
                setTimeout(() => {
                    window.location.href = '../v2/sign-in/signIn.html';
                }, 2000);
            });
        }
        
        // Handle cancel
        if (cancelButton) {
            cancelButton.addEventListener('click', function() {
                window.location.href = '../v2/sign-in/signIn.html';
            });
        }
    }
    
    // Make showStep globally accessible for testing
    window.showStep = showStep;
});
