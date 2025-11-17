// Improved Elegant Portfolio Login Form JavaScript
class ElegantPortfolioLoginForm {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.submitButton = this.form.querySelector('.signin-button');
        this.successMessage = document.getElementById('successMessage');
        this.socialButtons = document.querySelectorAll('.social-button');
        this.rememberCheckbox = document.getElementById('remember');

        // --- DEV: Temporary test credentials for local/testing only ---
        // Set DEV_MODE = false before shipping production.
        this.DEV_MODE = true;
        this.TEST_EMAIL = "test@barclays.com";
        this.TEST_PASSWORD = "Barclays123";
        // ---------------------------------------------------------------

        this.init();
    }

    init() {
        this.bindEvents();
        this.setupPasswordToggle();
        this.setupSocialButtons();
        this.hydrateRememberedEmail();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // CLEAR errors while typing
        this.emailInput.addEventListener('input', () => this.clearError('email'));
        this.passwordInput.addEventListener('input', () => this.clearError('password'));

        // For label animations (works with CSS input:not(:placeholder-shown))
        this.emailInput.setAttribute('placeholder', ' ');
        this.passwordInput.setAttribute('placeholder', ' ');
    }

    setupPasswordToggle() {
        // accessibility initial state
        this.passwordToggle.setAttribute('aria-pressed', 'false');
        this.passwordToggle.setAttribute('aria-label', 'Show password');

        this.passwordToggle.addEventListener('click', () => {
            const showing = this.passwordInput.type === 'text';
            const newType = showing ? 'password' : 'text';
            this.passwordInput.type = newType;

            // visual state
            this.passwordToggle.classList.toggle('reveal-active', newType === 'text');

            // accessibility state
            this.passwordToggle.setAttribute('aria-pressed', String(newType === 'text'));
            this.passwordToggle.setAttribute('aria-label', newType === 'text' ? 'Hide password' : 'Show password');
        });
    }

    setupSocialButtons() {
        this.socialButtons.forEach(button => {
            // ensure an accessible label
            const provider = (button.dataset.provider || button.textContent || 'Social').trim();
            button.setAttribute('aria-label', `Sign in with ${provider}`);

            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSocialLogin(provider, button);
            });
        });
    }

    hydrateRememberedEmail() {
        try {
            const remembered = localStorage.getItem('rememberedEmail');
            if (remembered) {
                this.emailInput.value = remembered;
                // Ensure label floats correctly (placeholder trick)
                this.emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                if (this.rememberCheckbox) this.rememberCheckbox.checked = true;
            }
        } catch (err) {
            // ignore storage errors (private mode, etc.)
            // console.warn('Could not access localStorage', err);
        }
    }

    validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            this.showError('email', 'Email address is required');
            return false;
        }

        if (!emailRegex.test(email)) {
            this.showError('email', 'Please enter a valid email address');
            return false;
        }

        this.clearError('email');
        return true;
    }

    validatePassword() {
        const password = this.passwordInput.value;

        if (!password) {
            this.showError('password', 'Password is required');
            return false;
        }

        if (password.length < 6) {
            this.showError('password', 'Password must be at least 6 characters long');
            return false;
        }

        this.clearError('password');
        return true;
    }

    showError(field, message) {
        const el = document.getElementById(field);
        if (!el) return;
        const formField = el.closest('.form-field');
        const errorElement = document.getElementById(`${field}Error`);
        if (formField) formField.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        // focus the field for quick correction
        el.focus();
    }

    clearError(field) {
        const el = document.getElementById(field);
        if (!el) return;
        const formField = el.closest('.form-field');
        const errorElement = document.getElementById(`${field}Error`);
        if (formField) formField.classList.remove('error');
        if (errorElement) {
            errorElement.classList.remove('show');
            setTimeout(() => { errorElement.textContent = ''; }, 200);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();

        if (!isEmailValid || !isPasswordValid) return;

        this.setLoading(true);

        try {
            // Simulate auth delay
            await new Promise(resolve => setTimeout(resolve, 1200));

            const email = this.emailInput.value.trim();
            const password = this.passwordInput.value;

            // DEV-mode test credential check (only if DEV_MODE === true)
            if (this.DEV_MODE && email === this.TEST_EMAIL && password === this.TEST_PASSWORD) {
                // Persist remember-me if requested
                try {
                    if (this.rememberCheckbox && this.rememberCheckbox.checked) {
                        localStorage.setItem('rememberedEmail', email);
                    } else {
                        localStorage.removeItem('rememberedEmail');
                    }
                } catch (err) {
                    // ignore storage errors
                }

                // Show success UI, then redirect shortly after
                this.showSuccess();
                setTimeout(() => {
                    window.location.href = 'trial.html';
                }, 2500);

                return;
            }

            // TODO: Replace this block with real authentication request (fetch/XHR)
            // For now, show auth error
            this.showError('password', 'Incorrect email or password');

        } catch (error) {
            this.showError('password', 'Authentication failed. Please try again.');
            console.error(error);
        } finally {
            // Clear loading unless we're about to navigate (if navigation happened, page unloads)
            this.setLoading(false);
        }
    }

    async handleSocialLogin(provider, button) {
        // simple loading UI using DOM APIs
        const originalDisabled = button.disabled;
        button.disabled = true;
        button.style.opacity = '0.7';

        const spinner = document.createElement('span');
        spinner.setAttribute('aria-hidden', 'true');
        spinner.style.display = 'inline-block';
        spinner.style.width = '16px';
        spinner.style.height = '16px';
        spinner.style.border = '2px solid #cbd5e0';
        spinner.style.borderTop = '2px solid #4a5568';
        spinner.style.borderRadius = '50%';
        spinner.style.marginRight = '8px';
        spinner.style.animation = 'spin 1s linear infinite';

        const originalText = button.textContent;
        button.textContent = ''; // clear
        button.appendChild(spinner);
        button.appendChild(document.createTextNode('Connecting...'));

        try {
            await new Promise(resolve => setTimeout(resolve, 1400));
            console.log(`(Simulated) redirect to ${provider} auth`);
            // window.location.href = `/auth/${provider.toLowerCase()}`;
        } catch (err) {
            console.error(`${provider} sign in failed`, err);
        } finally {
            // restore
            button.disabled = originalDisabled;
            button.style.opacity = '1';
            button.textContent = originalText;
        }
    }

    setLoading(loading) {
        this.submitButton.classList.toggle('loading', loading);
        this.submitButton.disabled = loading;

        this.socialButtons.forEach(button => {
            button.style.pointerEvents = loading ? 'none' : 'auto';
            button.style.opacity = loading ? '0.6' : '1';
        });
    }

    showSuccess() {
        // Hide form with smooth transition
        this.form.style.transform = 'scale(0.95)';
        this.form.style.opacity = '0';

        setTimeout(() => {
            this.form.style.display = 'none';
            const social = document.querySelector('.social-auth');
            if (social) social.style.display = 'none';
            const prompt = document.querySelector('.login-prompt');
            if (prompt) prompt.style.display = 'none';
            const divider = document.querySelector('.auth-divider');
            if (divider) divider.style.display = 'none';

            // Show success message
            if (this.successMessage) this.successMessage.classList.add('show');

        }, 300);
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ElegantPortfolioLoginForm();
});
