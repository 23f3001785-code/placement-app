const StudentProfile = {
    template: `
        <div>
            <h4 class="fw-bold mb-1">My Profile</h4>
            <p class="text-secondary mb-4 small">Manage your academic details and resume.</p>

            <div class="row g-4">
                <!-- Profile Form -->
                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm rounded-4 p-4">
                        <form @submit.prevent="handleSave">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label small fw-bold">Full Name <span class="text-danger">*</span></label>
                                    <input v-model="form.full_name" class="form-control rounded-3" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small fw-bold">College Name</label>
                                    <input v-model="form.college_name" class="form-control rounded-3">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small fw-bold">Degree <span class="text-danger">*</span></label>
                                    <select v-model="selectedDegree" class="form-select rounded-3">
                                        <option v-for="d in degrees" :key="d" :value="d">{{ d }}</option>
                                    </select>
                                    <input v-if="selectedDegree === 'Other'" v-model="customDegree" class="form-control rounded-3 mt-2" placeholder="Enter degree...">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small fw-bold">Branch <span class="text-danger">*</span></label>
                                    <select v-model="selectedBranch" class="form-select rounded-3">
                                        <option v-for="b in branches" :key="b" :value="b">{{ b }}</option>
                                    </select>
                                    <input v-if="selectedBranch === 'Other'" v-model="customBranch" class="form-control rounded-3 mt-2" placeholder="Enter branch...">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small fw-bold">CGPA <span class="text-danger">*</span></label>
                                    <input v-model="form.cgpa" type="number" step="0.01" min="0" max="10" class="form-control rounded-3" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small fw-bold">Graduation Year <span class="text-danger">*</span></label>
                                    <input v-model="form.graduation_year" type="number" min="1900" max="2100" class="form-control rounded-3" required>
                                </div>
                                <div class="col-12">
                                    <label class="form-label small fw-bold">Resume (PDF)</label>
                                    <input type="file" @change="handleFile" class="form-control rounded-3" accept=".pdf">
                                </div>
                            </div>
                            <div class="d-flex gap-3 mt-4">
                                <button type="submit" class="btn btn-dark rounded-pill px-4 py-2 fw-semibold" :disabled="saving">
                                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Profile Summary Card -->
                <div class="col-lg-4">
                    <div class="card border-0 shadow-sm rounded-4 p-4 text-center">
                        <div class="mx-auto rounded-circle bg-dark d-flex align-items-center justify-content-center mb-3" style="width:72px;height:72px;">
                            <span class="text-white fw-bold fs-3">{{ (profile.full_name || '?')[0].toUpperCase() }}</span>
                        </div>
                        <h6 class="fw-bold">{{ profile.full_name || 'Your Name' }}</h6>
                        <p class="text-secondary small mb-3">{{ profile.degree || '—' }} · {{ profile.branch || '—' }}</p>
                        
                        <div class="bg-light rounded-3 p-3 text-start mb-3">
                            <div class="d-flex justify-content-between small mb-2">
                                <span class="text-secondary">College</span>
                                <span class="fw-bold text-dark">{{ profile.college_name || '—' }}</span>
                            </div>
                            <div class="d-flex justify-content-between small mb-2">
                                <span class="text-secondary">CGPA</span>
                                <span class="fw-bold text-dark">{{ profile.cgpa || '—' }}</span>
                            </div>
                            <div class="d-flex justify-content-between small">
                                <span class="text-secondary">Grad Year</span>
                                <span class="fw-bold text-dark">{{ profile.graduation_year || '—' }}</span>
                            </div>
                        </div>

                        <div v-if="profile.resume_url" class="d-grid">
                            <a :href="profile.resume_url" target="_blank" class="btn btn-outline-dark rounded-pill btn-sm">
                                <i class="bi bi-file-earmark-pdf me-1"></i> View Current Resume
                            </a>
                        </div>
                        <div v-else class="text-danger small fw-bold">
                            <i class="bi bi-exclamation-triangle me-1"></i> No resume uploaded
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    props: ['profile'],
    data() {
        return {
            form: {},
            resumeFile: null,
            saving: false,
            selectedDegree: '',
            selectedBranch: '',
            customDegree: '',
            customBranch: '',
            degrees: ['B.Tech', 'M.Tech', 'MBA', 'PhD', 'B.Sc', 'M.Sc', 'Other'],
            branches: ['Computer Science (CSE)', 'Electronics (ECE)', 'Mechanical (ME)', 'Information Technology (IT)', 'Civil (CE)', 'Electrical (EE)', 'Other']
        };
    },
    watch: {
        profile: {
            handler(p) {
                this.form = { ...p };
                this.selectedDegree = this.degrees.includes(p.degree) ? p.degree : 'Other';
                if (this.selectedDegree === 'Other') this.customDegree = p.degree;
                this.selectedBranch = this.branches.includes(p.branch) ? p.branch : 'Other';
                if (this.selectedBranch === 'Other') this.customBranch = p.branch;
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        handleFile(e) { this.resumeFile = e.target.files[0]; },
        async handleSave() {
            this.saving = true;
            try {
                this.form.degree = this.selectedDegree === 'Other' ? this.customDegree : this.selectedDegree;
                this.form.branch = this.selectedBranch === 'Other' ? this.customBranch : this.selectedBranch;
                
                const fd = new FormData();
                fd.append('full_name', this.form.full_name);
                fd.append('college_name', this.form.college_name || '');
                fd.append('degree', this.form.degree);
                fd.append('branch', this.form.branch);
                fd.append('cgpa', this.form.cgpa);
                fd.append('graduation_year', this.form.graduation_year);
                if (this.resumeFile) fd.append('resume', this.resumeFile);
                
                await axios.put('/api/student/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                this.$emit('saved');
            } catch (err) {
                this.$emit('error', err.response?.data?.message || err.message);
            } finally {
                this.saving = false;
            }
        }
    }
};
