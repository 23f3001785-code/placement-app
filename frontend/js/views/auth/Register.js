const Register = {
    template: `
        <div class="auth-split-container animated-entry">
            <div class="auth-form-side bg-white">
                <div class="mx-auto w-100" style="max-width: 450px;">
                    <h2 class="fw-bold mb-4">Join Instihire</h2>
                    
                    <div v-if="error" class="alert border-0 rounded-3 d-flex align-items-center gap-2 py-3 px-3 mb-3" 
                         style="background: #fee2e2; color: #991b1b; font-weight: 500; font-size: 0.92rem;">
                        <i class="bi bi-exclamation-circle-fill fs-5" style="color: #dc2626;"></i>
                        <span>{{ error }}</span>
                    </div>
                    <div v-if="success" class="alert alert-success border-0 rounded-3 small">{{ success }}</div>
                    
                    <div class="btn-group w-100 mb-4 rounded-pill overflow-hidden border p-1" style="background: #f9fafb;">
                        <button class="btn border-0 py-2 rounded-pill px-4" 
                                :class="role === 'student' ? 'btn-dark' : 'btn-link text-dark text-decoration-none'" 
                                @click="role = 'student'">I'm looking for a job</button>
                        <button class="btn border-0 py-2 rounded-pill px-4" 
                                :class="role === 'company' ? 'btn-dark' : 'btn-link text-dark text-decoration-none'" 
                                @click="role = 'company'">I'm hiring candidates</button>
                    </div>

                    <form @submit.prevent="handleRegister">
                        <div class="row g-3 mb-3">
                            <div class="col-6">
                                <label class="form-label fw-semibold small">Email Address <span class="text-danger">*</span></label>
                                <input type="email" v-model="form.username" class="form-control py-2 px-3 rounded-3" 
                                       :class="{'border-danger': fieldErrors.username, 'border-secondary-subtle': !fieldErrors.username}" 
                                       placeholder="you@example.com" @input="clearFieldError('username')">
                                <div v-if="fieldErrors.username" class="text-danger small mt-1"><i class="bi bi-exclamation-circle me-1"></i>{{ fieldErrors.username }}</div>
                            </div>
                            <div class="col-6">
                                <label class="form-label fw-semibold small">Password <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <input :type="showPassword ? 'text' : 'password'" v-model="form.password" class="form-control py-2 px-3 rounded-start-3" 
                                           :class="{'border-danger': fieldErrors.password, 'border-secondary-subtle': !fieldErrors.password}" 
                                           @input="clearFieldError('password')" style="border-right: none;">
                                    <span class="input-group-text bg-white rounded-end-3" 
                                          :class="{'border-danger': fieldErrors.password, 'border-secondary-subtle': !fieldErrors.password}" 
                                          @click="showPassword = !showPassword" style="cursor: pointer; border-left: none;">
                                        <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                                    </span>
                                </div>
                                <div v-if="fieldErrors.password" class="text-danger small mt-1"><i class="bi bi-exclamation-circle me-1"></i>{{ fieldErrors.password }}</div>
                            </div>
                        </div>

                        <div v-if="role === 'student'">
                            <div class="row g-3 mb-3">
                                <div class="col-6">
                                    <label class="form-label fw-semibold small">Full Name <span class="text-danger">*</span></label>
                                    <input type="text" v-model="form.full_name" class="form-control py-2 px-3 rounded-3" 
                                           :class="{'border-danger': fieldErrors.full_name, 'border-secondary-subtle': !fieldErrors.full_name}" 
                                           @input="clearFieldError('full_name')" required>
                                    <div v-if="fieldErrors.full_name" class="text-danger small mt-1"><i class="bi bi-exclamation-circle me-1"></i>{{ fieldErrors.full_name }}</div>
                                </div>
                                <div class="col-6">
                                    <label class="form-label fw-semibold small">College Name <span class="text-danger">*</span></label>
                                    <input type="text" v-model="form.college_name" class="form-control py-2 px-3 rounded-3" 
                                           :class="{'border-danger': fieldErrors.college_name, 'border-secondary-subtle': !fieldErrors.college_name}" 
                                           @input="clearFieldError('college_name')" required>
                                    <div v-if="fieldErrors.college_name" class="text-danger small mt-1"><i class="bi bi-exclamation-circle me-1"></i>{{ fieldErrors.college_name }}</div>
                                </div>
                            </div>
                            <div class="row g-3 mb-3">
                                <div class="col-6">
                                    <label class="form-label fw-semibold small">Degree <span class="text-danger">*</span></label>
                                    <select v-model="selectedDegree" class="form-select py-2 border-secondary-subtle rounded-3" required>
                                        <option v-for="d in degrees" :key="d" :value="d">{{ d }}</option>
                                    </select>
                                    <input v-if="selectedDegree === 'Other'" type="text" v-model="customDegree" placeholder="Enter degree" class="form-control mt-2 py-2 border-secondary-subtle rounded-3" required>
                                </div>
                                <div class="col-6">
                                    <label class="form-label fw-semibold small">Branch <span class="text-danger">*</span></label>
                                    <select v-model="selectedBranch" class="form-select py-2 border-secondary-subtle rounded-3" required>
                                        <option v-for="b in branches" :key="b" :value="b">{{ b }}</option>
                                    </select>
                                    <input v-if="selectedBranch === 'Other'" type="text" v-model="customBranch" placeholder="Enter branch" class="form-control mt-2 py-2 border-secondary-subtle rounded-3" required>
                                </div>
                            </div>
                            <div class="row g-3 mb-3">
                                <div class="col-6">
                                    <label class="form-label fw-semibold small">CGPA <span class="text-danger">*</span></label>
                                    <input type="number" step="0.01" min="0" max="10" v-model="form.cgpa" class="form-control py-2 px-3 rounded-3" 
                                           :class="{'border-danger': fieldErrors.cgpa, 'border-secondary-subtle': !fieldErrors.cgpa}" 
                                           @input="clearFieldError('cgpa')" required>
                                    <div v-if="fieldErrors.cgpa" class="text-danger small mt-1"><i class="bi bi-exclamation-circle me-1"></i>{{ fieldErrors.cgpa }}</div>
                                </div>
                                <div class="col-6">
                                    <label class="form-label fw-semibold small">Graduation Year <span class="text-danger">*</span></label>
                                    <input type="number" v-model="form.graduation_year" class="form-control py-2 px-3 rounded-3" 
                                           :class="{'border-danger': fieldErrors.graduation_year, 'border-secondary-subtle': !fieldErrors.graduation_year}" 
                                           :placeholder="new Date().getFullYear()" @input="clearFieldError('graduation_year')" required>
                                    <div v-if="fieldErrors.graduation_year" class="text-danger small mt-1"><i class="bi bi-exclamation-circle me-1"></i>{{ fieldErrors.graduation_year }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Company Fields -->
                        <div v-if="role === 'company'">
                            <div class="mb-3">
                                <label class="form-label fw-semibold small">Company Name <span class="text-danger">*</span></label>
                                <input type="text" v-model="form.company_name" class="form-control py-2 px-3 rounded-3" 
                                       :class="{'border-danger': fieldErrors.company_name, 'border-secondary-subtle': !fieldErrors.company_name}" 
                                       @input="clearFieldError('company_name')" required>
                                <div v-if="fieldErrors.company_name" class="text-danger small mt-1"><i class="bi bi-exclamation-circle me-1"></i>{{ fieldErrors.company_name }}</div>
                            </div>
                            <div class="row g-3 mb-3">
                                <div class="col-6">
                                    <label class="form-label fw-semibold small">HR Contact Name <span class="text-danger">*</span></label>
                                    <input type="text" v-model="form.hr_contact" class="form-control py-2 px-3 rounded-3" 
                                           :class="{'border-danger': fieldErrors.hr_contact, 'border-secondary-subtle': !fieldErrors.hr_contact}" 
                                           @input="clearFieldError('hr_contact')" required>
                                    <div v-if="fieldErrors.hr_contact" class="text-danger small mt-1"><i class="bi bi-exclamation-circle me-1"></i>{{ fieldErrors.hr_contact }}</div>
                                </div>
                                <div class="col-6">
                                    <label class="form-label fw-semibold small">HR Contact Phone <span class="text-danger">*</span></label>
                                    <input type="text" v-model="form.hr_phone" class="form-control py-2 px-3 rounded-3" 
                                           :class="{'border-danger': fieldErrors.hr_phone, 'border-secondary-subtle': !fieldErrors.hr_phone}" 
                                           @input="clearFieldError('hr_phone')" required>
                                    <div v-if="fieldErrors.hr_phone" class="text-danger small mt-1"><i class="bi bi-exclamation-circle me-1"></i>{{ fieldErrors.hr_phone }}</div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-semibold small">Website</label>
                                <input type="url" v-model="form.website" class="form-control py-2 px-3 border-secondary-subtle rounded-3">
                            </div>
                        </div>

                        <button type="submit" class="btn btn-dark w-100 py-3 mt-4 rounded-3" :disabled="loading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                            Create account
                        </button>
                    </form>
                    
                    <p class="text-center small text-secondary mt-4">
                        Already have an account? <router-link to="/login" class="text-dark fw-bold text-decoration-underline">Log in</router-link>
                    </p>
                </div>
            </div>
            <div class="auth-graphic-side d-none d-lg-flex">
                 <div class="geometric-grid">
                    <div class="geo-box geo-blue geo-arch"></div>
                    <div class="geo-box geo-pink geo-circle"></div>
                    <div class="geo-box geo-yellow"></div>
                    <div class="geo-box geo-green geo-triangle"></div>
                    
                    <div class="geo-box"></div>
                    <div class="geo-box geo-orange geo-circle"></div>
                    <div class="geo-box geo-blue"></div>
                    <div class="geo-box geo-pink geo-arch"></div>
                    
                    <div class="geo-box geo-green"></div>
                    <div class="geo-box geo-yellow geo-circle"></div>
                    <div class="geo-box"></div>
                    <div class="geo-box geo-orange"></div>
                </div>
                <div class="position-absolute bottom-0 end-0 p-5 text-end">
                    <h1 class="display-4 fw-bold mb-0">Join the elite <br>talent pool.</h1>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            role: 'student',
            showPassword: false,
            degrees: ['B.Tech', 'M.Tech', 'MBA', 'PhD', 'B.Sc', 'M.Sc', 'Other'],
            branches: ['Computer Science (CSE)', 'Electronics (ECE)', 'Mechanical (ME)', 'Information Technology (IT)', 'Civil (CE)', 'Electrical (EE)', 'Other'],
            selectedDegree: 'B.Tech',
            selectedBranch: 'Computer Science (CSE)',
            customDegree: '',
            customBranch: '',
            form: {
                username: '',
                password: '',
                full_name: '',
                college_name: '',
                degree: '',
                branch: '',
                cgpa: '',
                graduation_year: '',
                company_name: '',
                hr_contact: '',
                hr_phone: '',
                website: ''
            },
            error: null,
            success: null,
            fieldErrors: {},
            loading: false
        }
    },
    methods: {
        validate() {
            const errors = {};
            const f = this.form;
            
            // Common fields
            if (!f.username || !f.username.trim()) {
                errors.username = 'Email is required.';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.username.trim())) {
                errors.username = 'Please enter a valid email address.';
            }
            if (!f.password) {
                errors.password = 'Password is required.';
            } else if (f.password.length < 6) {
                errors.password = 'Password must be at least 6 characters.';
            }
            
            if (this.role === 'student') {
                if (!f.full_name || !f.full_name.trim()) errors.full_name = 'Full name is required.';
                if (!f.college_name || !f.college_name.trim()) errors.college_name = 'College name is required.';
                
                const degree = this.selectedDegree === 'Other' ? this.customDegree : this.selectedDegree;
                if (!degree || !degree.trim()) errors.degree = 'Degree is required.';
                
                const branch = this.selectedBranch === 'Other' ? this.customBranch : this.selectedBranch;
                if (!branch || !branch.trim()) errors.branch = 'Branch is required.';
                
                if (!f.cgpa && f.cgpa !== 0) {
                    errors.cgpa = 'CGPA is required.';
                } else if (parseFloat(f.cgpa) < 0 || parseFloat(f.cgpa) > 10) {
                    errors.cgpa = 'CGPA must be between 0 and 10.';
                }
                if (!f.graduation_year) {
                    errors.graduation_year = 'Graduation year is required.';
                } else {
                    const year = parseInt(f.graduation_year);
                    const currentYear = new Date().getFullYear();
                    if (year < currentYear - 15 || year > currentYear + 4) {
                        errors.graduation_year = `Year must be between ${currentYear - 15} and ${currentYear + 4}.`;
                    }
                }
            }
            
            if (this.role === 'company') {
                if (!f.company_name || !f.company_name.trim()) errors.company_name = 'Company name is required.';
                if (!f.hr_contact || !f.hr_contact.trim()) errors.hr_contact = 'HR contact name is required.';
                if (!f.hr_phone || !f.hr_phone.trim()) {
                    errors.hr_phone = 'HR phone number is required.';
                } else if (!/^\d{10}$/.test(f.hr_phone.trim())) {
                    errors.hr_phone = 'HR phone must be exactly 10 digits.';
                }
            }
            
            this.fieldErrors = errors;
            return Object.keys(errors).length === 0;
        },
        clearFieldError(field) {
            if (this.fieldErrors[field]) {
                const copy = { ...this.fieldErrors };
                delete copy[field];
                this.fieldErrors = copy;
            }
            if (this.error) this.error = null;
        },
        async handleRegister() {
            this.error = null;
            this.success = null;
            
            if (this.role === 'student') {
                this.form.degree = this.selectedDegree === 'Other' ? this.customDegree : this.selectedDegree;
                this.form.branch = this.selectedBranch === 'Other' ? this.customBranch : this.selectedBranch;
            }
            
            if (!this.validate()) return;

            this.loading = true;
            const endpoint = this.role === 'student' ? '/api/auth/register/student' : '/api/auth/register/company';
            try {
                const response = await axios.post(endpoint, {
                    ...this.form,
                    username: this.form.username.trim()
                });
                this.success = response.data.message + " Redirecting into platform...";
                
                // Auto-login newly registered user
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.access_token;
                
                this.$root.isAuthenticated = true;
                this.$root.user = response.data.user;
                
                setTimeout(() => {
                    this.$router.push('/' + response.data.user.role);
                }, 1500);
            } catch (err) {
                if (err.response) {
                    const status = err.response.status;
                    const msg = err.response.data?.message;
                    if (status === 409) {
                        this.error = msg || 'An account with this email already exists.';
                    } else if (status === 400) {
                        this.error = msg || 'Please fill in all required fields correctly.';
                    } else {
                        this.error = msg || 'Registration failed. Please try again later.';
                    }
                } else if (err.request) {
                    this.error = 'Cannot reach the server. Please check your internet connection.';
                } else {
                    this.error = 'An unexpected error occurred. Please try again.';
                }
            } finally {
                this.loading = false;
            }
        }
    }
};
