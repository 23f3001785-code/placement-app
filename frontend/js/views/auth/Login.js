const Login = {
    template: `
        <div class="auth-split-container animated-entry">
            <div class="auth-form-side bg-white">
                <div class="mx-auto w-100" style="max-width: 400px;">
                    <h2 class="fw-bold mb-2">Login</h2>
                    <p class="text-secondary mb-4">Your next big opportunity is just a login away.</p>
                    
                    <div v-if="error" class="alert border-0 rounded-3 d-flex align-items-center gap-2 py-3 px-3 mb-4" 
                         :class="shaking ? 'login-shake' : ''"
                         style="background: #fee2e2; color: #991b1b; font-weight: 500; font-size: 0.92rem;">
                        <i class="bi bi-exclamation-circle-fill fs-5" style="color: #dc2626;"></i>
                        <span>{{ error }}</span>
                    </div>
                    
                    <form @submit.prevent="handleLogin" novalidate>
                        <div class="mb-3">
                            <label class="form-label fw-semibold small">Email Address <span class="text-danger">*</span></label>
                            <input type="email" v-model="username" class="form-control py-2 px-3 rounded-3" 
                                   :class="{'border-danger': fieldErrors.username, 'border-secondary-subtle': !fieldErrors.username}" 
                                   placeholder="you@example.com" @input="clearFieldError('username')">
                            <div v-if="fieldErrors.username" class="text-danger small mt-1"><i class="bi bi-exclamation-circle me-1"></i>{{ fieldErrors.username }}</div>
                        </div>
                        <div class="mb-4">
                            <label class="form-label fw-semibold small">Password <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <input :type="showPassword ? 'text' : 'password'" v-model="password" 
                                       class="form-control py-2 px-3 rounded-start-3" 
                                       :class="{'border-danger': fieldErrors.password, 'border-secondary-subtle': !fieldErrors.password}" 
                                       placeholder="Enter password" @input="clearFieldError('password')" style="border-right: none;">
                                <span class="input-group-text bg-white rounded-end-3" 
                                      :class="{'border-danger': fieldErrors.password, 'border-secondary-subtle': !fieldErrors.password}" 
                                      @click="showPassword = !showPassword" style="cursor: pointer; border-left: none;">
                                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                                </span>
                            </div>
                            <div v-if="fieldErrors.password" class="text-danger small mt-1"><i class="bi bi-exclamation-circle me-1"></i>{{ fieldErrors.password }}</div>
                        </div>
                        <button type="submit" class="btn btn-dark w-100 py-3 mb-4 rounded-3" :disabled="loading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                            Log in
                        </button>
                    </form>
                    
                    <p class="text-center small text-secondary">
                        Not registered? <router-link to="/register" class="text-dark fw-bold text-decoration-underline">Create an Account</router-link>
                    </p>
                </div>
            </div>
            <div class="auth-graphic-side d-none d-lg-flex">
                <div class="geometric-grid">
                    <div class="geo-box geo-pink geo-arch"></div>
                    <div class="geo-box geo-blue geo-circle"></div>
                    <div class="geo-box"></div>
                    <div class="geo-box geo-orange geo-triangle"></div>
                    
                    <div class="geo-box geo-yellow"></div>
                    <div class="geo-box"></div>
                    <div class="geo-box geo-green geo-circle"></div>
                    <div class="geo-box geo-pink"></div>
                    
                    <div class="geo-box geo-blue"></div>
                    <div class="geo-box geo-orange geo-arch"></div>
                    <div class="geo-box geo-yellow geo-circle"></div>
                    <div class="geo-box"></div>
                </div>
                <div class="position-absolute bottom-0 end-0 p-5 text-end">
                    <h1 class="display-4 fw-bold mb-0">The future of <br>campus hiring.</h1>
                </div>
            </div>
        </div>
        <style>
            @keyframes loginShake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-8px); }
                40%, 80% { transform: translateX(8px); }
            }
            .login-shake { animation: loginShake 0.4s ease-in-out; }
        </style>
    `,
    data() {
        return {
            username: '',
            password: '',
            showPassword: false,
            error: null,
            shaking: false,
            fieldErrors: {},
            loading: false
        }
    },
    methods: {
        clearFieldError(field) {
            if (this.fieldErrors[field]) {
                const copy = { ...this.fieldErrors };
                delete copy[field];
                this.fieldErrors = copy;
            }
            if (this.error) this.error = null;
        },
        validate() {
            const errors = {};
            if (!this.username || !this.username.trim()) {
                errors.username = 'Email is required.';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.username.trim())) {
                errors.username = 'Please enter a valid email address.';
            }
            if (!this.password) {
                errors.password = 'Password is required.';
            } else if (this.password.length < 4) {
                errors.password = 'Password must be at least 4 characters.';
            }
            this.fieldErrors = errors;
            return Object.keys(errors).length === 0;
        },
        triggerShake() {
            this.shaking = true;
            setTimeout(() => { this.shaking = false; }, 500);
        },
        async handleLogin() {
            this.error = null;
            if (!this.validate()) return;

            this.loading = true;
            try {
                const response = await axios.post('/api/auth/login', {
                    username: this.username.trim(),
                    password: this.password
                });
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.access_token;
                
                this.$root.isAuthenticated = true;
                this.$root.user = response.data.user;
                
                this.$router.push('/' + response.data.user.role);
            } catch (err) {
                if (err.response) {
                    const status = err.response.status;
                    const msg = err.response.data?.message;
                    if (status === 401) {
                        this.error = msg || 'Invalid email or password. Please try again.';
                    } else if (status === 403) {
                        this.error = msg || 'Your account has been deactivated. Contact admin for support.';
                    } else if (status === 400) {
                        this.error = msg || 'Please fill in all required fields.';
                    } else {
                        this.error = msg || 'Something went wrong. Please try again later.';
                    }
                } else if (err.request) {
                    this.error = 'Cannot reach the server. Please check your internet connection.';
                } else {
                    this.error = 'An unexpected error occurred. Please try again.';
                }
                this.triggerShake();
            } finally {
                this.loading = false;
            }
        }
    }
};
