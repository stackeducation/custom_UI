/*
 * Stack / incline - Azure AD B2C custom UI
 * Shared runtime for signIn, signUp and forgotPassword.
 *
 * B2C injects its form into #api asynchronously and re-renders parts of it as
 * the user moves through a journey, so every pass below re-queries the DOM
 * rather than holding element references across renders, and every DOM write
 * is change-guarded so re-running a pass is a no-op.
 *
 * The page selects its behaviour with <body data-page="...">.
 */
(function () {
    "use strict";

    const self = document.currentScript;
    const ASSET_BASE =
        (window.StackB2CAssets && window.StackB2CAssets.baseUrl) ||
        (self && self.src ? self.src.replace(/[^/]*$/, "") : "");

    const EYE_OPEN = ASSET_BASE + "eye-open-icon.svg";
    const EYE_CLOSED = ASSET_BASE + "eye-closed-icon.svg";

    /*
     * Which page this is, taken from this script's own ?page= parameter.
     * B2C serves <body> without our data-page attribute, so the URL is the one
     * carrier it cannot strip without failing to load the script at all.
     */
    const PAGE_FROM_SRC = (function () {
        const query = self && self.src ? self.src.split("?")[1] : "";

        return query ? new URLSearchParams(query).get("page") : null;
    })();

    const IDS = {
        email: "email",
        password: "password",
        code: "emailVerificationCode",
        newPassword: "newPassword",
        confirmPassword: "reenterPassword",
        sendCode: "emailVerificationControl_but_send_code",
        verifyCode: "emailVerificationControl_but_verify_code",
        resendCode: "emailVerificationControl_but_send_new_code",
        changeClaims: "emailVerificationControl_but_change_claims",
        continue: "continue",
        next: "next",
        cancel: "cancel",
        forgotPassword: "forgotPassword"
    };

    /* ------------------------------------------------------------- helpers */

    const byId = (id) => document.getElementById(id);

    const themeColor = (name) =>
        getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    /*
     * Guarded writers. Writing an attribute with the value it already has still
     * produces a MutationRecord, which would keep our own observer re-firing
     * forever. Comparing first lets a steady-state pass emit no mutations.
     */
    const setText = (node, value) => {
        if (node && node.textContent !== value) {
            node.textContent = value;
        }
    };

    const setStyle = (node, prop, value) => {
        if (node && node.style[prop] !== value) {
            node.style[prop] = value;
        }
    };

    const setAttr = (node, name, value) => {
        if (node && node.getAttribute(name) !== value) {
            node.setAttribute(name, value);
        }
    };

    const setDisabled = (node, value) => {
        if (node && node.disabled !== value) {
            node.disabled = value;
        }
    };

    const isVisible = (node) => {
        if (!node) {
            return false;
        }

        const style = getComputedStyle(node);

        return (
            node.offsetParent !== null &&
            style.display !== "none" &&
            style.visibility !== "hidden"
        );
    };

    /*
     * Visibility of the node itself, ignoring its ancestors. The resend button
     * is relocated into .resend-row, so asking whether it is *rendered* would
     * be circular - the row is hidden, therefore the button reads as hidden,
     * therefore the row stays hidden. B2C only ever toggles the button's own
     * display, which is what we read here.
     */
    const isSelfDisplayed = (node) => {
        if (!node) {
            return false;
        }

        const style = getComputedStyle(node);

        return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            node.getAttribute("aria-hidden") !== "true"
        );
    };

    // Explicit null check: `node?.value.trim() !== ""` evaluates to true when
    // the node is missing, which reads a missing field as "filled in".
    const hasValue = (node) => !!node && node.value.trim() !== "";

    // The code is always six digits, so a partially filled set of boxes must
    // not enable Verify.
    const isCompleteCode = (node) => !!node && /^\d{6}$/.test(node.value.trim());

    /* ------------------------------------------------------- button states */

    const setPrimaryState = (button, enabled) => {
        if (!button) {
            return;
        }

        setDisabled(button, !enabled);
        setStyle(button, "backgroundColor", enabled ? themeColor("--navy") : themeColor("--button-disabled"));
        setStyle(button, "color", enabled ? themeColor("--primary-button-text") : themeColor("--button-disabled-text"));
        setStyle(button, "cursor", enabled ? "pointer" : "not-allowed");
    };

    const showButton = (button, display) => {
        if (!button) {
            return;
        }

        setStyle(button, "display", display || "block");
    };

    const hideButton = (button) => {
        if (!button) {
            return;
        }

        setStyle(button, "display", "none");
        setDisabled(button, true);
    };

    /* ------------------------------------------------------ password toggle */

    const attachPasswordToggle = (input) => {
        if (!input || input.dataset.toggleAttached === "true") {
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "password-field";

        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.className = "password-toggle";
        toggleButton.setAttribute("aria-label", "Show password");
        toggleButton.innerHTML = "<img src='" + EYE_OPEN + "' alt='' aria-hidden='true' />";

        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        wrapper.appendChild(toggleButton);

        toggleButton.addEventListener("click", () => {
            const isHidden = input.type === "password";

            input.type = isHidden ? "text" : "password";
            toggleButton.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");

            const icon = toggleButton.querySelector("img");

            if (icon) {
                icon.src = isHidden ? EYE_CLOSED : EYE_OPEN;
            }
        });

        input.dataset.toggleAttached = "true";
    };

    const syncPasswordToggles = () => {
        attachPasswordToggle(byId(IDS.newPassword));
        attachPasswordToggle(byId(IDS.confirmPassword));
        attachPasswordToggle(byId(IDS.password));
    };

    /* ----------------------------------------------------------- resend row */

    const buildResendRow = () => {
        const verifyCode = byId(IDS.verifyCode);
        const resendCode = byId(IDS.resendCode);

        if (!verifyCode || !resendCode || resendCode.dataset.repositioned === "true") {
            return;
        }

        const resendRow = document.createElement("div");
        resendRow.className = "resend-row";

        const helperText = document.createElement("span");
        helperText.className = "resend-helper";
        helperText.textContent = "Didn't receive the code?";

        resendCode.classList.add("resend-link");

        resendRow.appendChild(helperText);
        resendRow.appendChild(resendCode);
        verifyCode.parentNode.insertBefore(resendRow, verifyCode);

        resendCode.dataset.repositioned = "true";
    };

    const setResendRowVisible = (visible) => {
        const resendCode = byId(IDS.resendCode);
        const resendRow = resendCode && resendCode.closest(".resend-row");

        if (!resendRow) {
            return;
        }

        setStyle(resendRow, "display", visible ? "flex" : "none");
    };

    /* ------------------------------------------------ 6-digit code entry UI */

    const attachVerificationBoxes = () => {
        const realInput = byId(IDS.code);

        if (!realInput) {
            /*
             * B2C drops the code input once the address is verified. Any wrapper
             * we injected next to it can outlive it, and a stale one still reads
             * as visible - which would pin stage detection on "verification".
             */
            document.querySelectorAll(".verification-code-wrapper").forEach((orphan) => {
                orphan.remove();
            });

            return;
        }

        const parent = realInput.parentNode;
        const existing = parent ? parent.querySelector(".verification-code-wrapper") : null;

        // Re-runs on every pass: if B2C swapped the input (or dropped our
        // wrapper) on a re-render, the boxes are rebuilt instead of silently
        // leaving the user with the raw single-field input.
        if (realInput.dataset.sixDigitAttached === "true" && existing) {
            return;
        }

        if (existing && existing.parentNode) {
            existing.parentNode.removeChild(existing);
        }

        realInput.dataset.sixDigitAttached = "true";
        realInput.classList.add("custom-hidden-verification-input");
        realInput.setAttribute("maxlength", "6");
        realInput.setAttribute("inputmode", "numeric");
        realInput.setAttribute("autocomplete", "one-time-code");

        const wrapper = document.createElement("div");
        wrapper.className = "verification-code-wrapper";
        wrapper.setAttribute("role", "group");
        wrapper.setAttribute("aria-label", "Enter 6 digit verification code");

        const boxes = [];

        const syncRealInput = () => {
            const code = boxes.map((box) => box.value).join("");

            if (realInput.value === code) {
                return;
            }

            realInput.value = code;
            realInput.dispatchEvent(new Event("input", { bubbles: true }));
            realInput.dispatchEvent(new Event("change", { bubbles: true }));
        };

        const existingDigits = realInput.value.replace(/\D/g, "").slice(0, 6).split("");

        for (let i = 0; i < 6; i++) {
            const box = document.createElement("input");

            box.type = "text";
            box.inputMode = "numeric";
            box.maxLength = 1;
            box.autocomplete = i === 0 ? "one-time-code" : "off";
            box.className = "verification-code-box";
            box.value = existingDigits[i] || "";
            box.setAttribute("aria-label", "Digit " + (i + 1) + " of verification code");

            box.addEventListener("input", (event) => {
                const digits = event.target.value.replace(/\D/g, "");

                event.target.value = digits.slice(-1);

                if (digits && i < boxes.length - 1) {
                    boxes[i + 1].focus();
                }

                syncRealInput();
            });

            box.addEventListener("keydown", (event) => {
                if (event.key === "Backspace" && !box.value && i > 0) {
                    boxes[i - 1].focus();
                }

                if (event.key === "ArrowLeft" && i > 0) {
                    boxes[i - 1].focus();
                }

                if (event.key === "ArrowRight" && i < boxes.length - 1) {
                    boxes[i + 1].focus();
                }
            });

            box.addEventListener("paste", (event) => {
                event.preventDefault();

                const pasted = (event.clipboardData || window.clipboardData)
                    .getData("text")
                    .replace(/\D/g, "")
                    .slice(0, 6);

                pasted.split("").forEach((digit, index) => {
                    if (boxes[index]) {
                        boxes[index].value = digit;
                    }
                });

                boxes[Math.min(pasted.length, boxes.length - 1)].focus();

                syncRealInput();
            });

            boxes.push(box);
            wrapper.appendChild(box);
        }

        parent.insertBefore(wrapper, realInput);
    };

    const setVerificationBoxesVisible = (visible) => {
        const wrapper = document.querySelector(".verification-code-wrapper");

        setStyle(wrapper, "display", visible ? "grid" : "none");
    };

    // Both journeys render the same widget, so they share its label copy rather
    // than keeping B2C's generic "Verification code" on one of them.
    const syncVerificationCodeLabel = () => {
        setText(
            document.querySelector("label[for='" + IDS.code + "']"),
            "Enter and Verify 6-digit code"
        );
    };

    /* --------------------------------------------------------------- errors */

    const syncPageLevelError = () => {
        const errorBox = document.querySelector(".error.pageLevel");

        if (!errorBox) {
            return;
        }

        const message = errorBox.querySelector("p");
        // A container with no <p> at all is empty, not an error to display.
        const hasMessage = !!message && message.textContent.trim() !== "";

        setStyle(errorBox, "display", hasMessage ? "block" : "none");
        setAttr(errorBox, "aria-hidden", hasMessage ? "false" : "true");
    };

    /* ----------------------------------------------------------- sign in UI */

    const customizeSignIn = () => {
        const forgotLink = byId(IDS.forgotPassword);
        const nextButton = byId(IDS.next);
        const emailInput = byId(IDS.email);
        const passwordInput = byId(IDS.password);

        setText(forgotLink, "Forgot Password?");

        if (emailInput && emailInput.placeholder !== "Enter your email") {
            emailInput.placeholder = "Enter your email";
        }

        if (passwordInput && passwordInput.placeholder !== "Enter Password") {
            passwordInput.placeholder = "Enter Password";
        }

        syncPasswordToggles();

        // Anchored to the password field rather than :nth-of-type(2), which
        // silently retargets whenever B2C changes the field order.
        const passwordItem = passwordInput && passwordInput.closest(".entry-item");

        if (passwordItem && forgotLink && passwordItem.lastElementChild !== forgotLink) {
            passwordItem.appendChild(forgotLink);
        }

        setPrimaryState(nextButton, hasValue(emailInput) && hasValue(passwordInput));
    };

    /* ----------------------------------------------------------- sign up UI */

    const customizeSignUp = () => {
        const emailInput = byId(IDS.email);
        const codeInput = byId(IDS.code);
        const newPassword = byId(IDS.newPassword);
        const confirmPassword = byId(IDS.confirmPassword);
        const sendCode = byId(IDS.sendCode);
        const verifyCode = byId(IDS.verifyCode);
        const resendCode = byId(IDS.resendCode);
        const signUpButton = byId(IDS.continue);

        setText(signUpButton, "Sign Up");
        setText(verifyCode, "Verify");
        setText(resendCode, "Resend code");

        buildResendRow();
        syncPasswordToggles();
        attachVerificationBoxes();
        syncVerificationCodeLabel();

        // The boxes stand in for the real code input, so they follow it exactly
        // - same signal the reset journey uses.
        setVerificationBoxesVisible(isVisible(codeInput));

        setPrimaryState(sendCode, hasValue(emailInput));
        setPrimaryState(verifyCode, isCompleteCode(codeInput));
        setPrimaryState(signUpButton, hasValue(newPassword) && hasValue(confirmPassword));

        setResendRowVisible(isSelfDisplayed(resendCode));
    };

    /* -------------------------------------------------- forgot password UI */

    /*
     * The reset journey is four screens rendered from one form. Stage is read
     * from what B2C currently shows, in this precedence order.
     */
    /*
     * Which step B2C is on, read only from elements B2C itself owns - never
     * from anything this script injects. Our 6-box wrapper is a sibling of the
     * real code input, so it stays visible when B2C hides just the input, which
     * would report the code step while the user is still typing their email.
     */
    const readResetStep = () => ({
        code: isVisible(byId(IDS.code)),
        changeClaims: isVisible(byId(IDS.changeClaims)),
        password: isVisible(byId(IDS.newPassword)) && isVisible(byId(IDS.confirmPassword))
    });

    const customizeForgotPassword = () => {
        const emailInput = byId(IDS.email);
        const codeInput = byId(IDS.code);
        const newPassword = byId(IDS.newPassword);
        const confirmPassword = byId(IDS.confirmPassword);
        const sendCode = byId(IDS.sendCode);
        const verifyCode = byId(IDS.verifyCode);
        const resendCode = byId(IDS.resendCode);
        const continueButton = byId(IDS.continue);
        const cancelButton = byId(IDS.cancel);

        setText(verifyCode, "Verify");
        setText(resendCode, "Resend code");
        setText(cancelButton, "Back to Sign in");

        buildResendRow();
        syncPasswordToggles();
        attachVerificationBoxes();
        syncVerificationCodeLabel();

        const step = readResetStep();

        // Per-button rules, matching v3-fp exactly rather than collapsing them
        // into one mutually exclusive stage - the two can disagree in the
        // in-between states B2C briefly renders.

        if (step.code || step.changeClaims) {
            hideButton(sendCode);
        } else {
            showButton(sendCode);
            setPrimaryState(sendCode, hasValue(emailInput));
        }

        if (step.code) {
            showButton(verifyCode);
            setPrimaryState(verifyCode, isCompleteCode(codeInput));
        } else {
            hideButton(verifyCode);
        }

        if (step.password) {
            showButton(continueButton);
            setPrimaryState(continueButton, hasValue(newPassword) && hasValue(confirmPassword));
        } else if (step.changeClaims) {
            showButton(continueButton);
            setPrimaryState(continueButton, true);
        } else {
            hideButton(continueButton);
        }

        // The boxes stand in for the real input, so they follow it exactly.
        setVerificationBoxesVisible(step.code);

        // Resend is left entirely to B2C - writing to its display would clobber
        // the signal the row's visibility is read from.
        setResendRowVisible(isSelfDisplayed(resendCode));
    };

    /* -------------------------------------------------------------- runtime */

    const PAGES = {
        signIn: customizeSignIn,
        signUp: customizeSignUp,
        forgotPassword: customizeForgotPassword
    };

    let running = false;
    let scheduled = false;

    /*
     * B2C confirmed to strip data-page from <body>, so the script URL is the
     * primary signal and the attributes are fallbacks (.card sits inside markup
     * B2C does preserve). Whatever resolves is written back onto <body>, which
     * is what the page-scoped CSS (body[data-page="..."]) selects on - without
     * this, rules like hiding #cancel on sign-up never apply.
     */
    const resolvePage = () => {
        const body = document.body;

        if (!body) {
            return null;
        }

        const marker = document.querySelector("[data-page]");
        const page =
            PAGE_FROM_SRC ||
            body.dataset.page ||
            (marker && marker.dataset.page) ||
            null;

        if (page && body.dataset.page !== page) {
            body.dataset.page = page;
        }

        return page;
    };

    let warnedNoPage = false;

    const runPass = () => {
        if (running) {
            return;
        }

        running = true;

        try {
            const page = resolvePage();
            const customize = PAGES[page];

            if (customize) {
                customize();
            } else if (!warnedNoPage) {
                warnedNoPage = true;
                if (window.console && window.console.warn) {
                    window.console.warn(
                        "[stack-b2c-ui] no data-page marker found; page customisation skipped"
                    );
                }
            }

            syncPageLevelError();
        } catch (error) {
            // One bad pass must not tear down the observer that drives the rest
            // of the journey.
            if (window.console && window.console.error) {
                window.console.error("[stack-b2c-ui]", error);
            }
        } finally {
            running = false;
        }
    };

    const schedule = () => {
        if (scheduled) {
            return;
        }

        scheduled = true;

        const run = () => {
            scheduled = false;
            runPass();
        };

        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(run);
        } else {
            window.setTimeout(run, 16);
        }
    };

    const start = () => {
        runPass();

        // Replaces the old fixed 10ms/200ms retries, which missed the form
        // whenever B2C took longer than that to inject it.
        new MutationObserver(schedule).observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["style", "class", "aria-hidden"]
        });

        document.addEventListener("input", schedule, true);
        document.addEventListener("click", schedule, true);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
})();
