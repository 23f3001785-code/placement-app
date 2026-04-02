const ManageDrives = {
    template: `
        <div class="container-fluid px-4 px-md-5 py-4 animated-entry">
            <div class="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 class="fw-bold mb-1">Manage Placement Drives</h1>
                    <p class="text-secondary mb-0">
                        <router-link to="/company" class="text-dark text-decoration-none"><i class="bi bi-arrow-left me-1"></i> Back to Dashboard</router-link>
                    </p>
                </div>
                <button @click="showCreateModal = true" class="btn btn-dark rounded-pill px-4">Post a new Job</button>
            </div>

            <div class="card border-0 shadow-sm overflow-hidden mb-5">
                <div class="card-header bg-white border-bottom-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                     <h5 class="fw-bold mb-0">All Drives</h5>
                     <div class="input-group" style="max-width: 250px;">
                         <span class="input-group-text bg-light border-0 rounded-start-pill ps-3"><i class="bi bi-search text-secondary"></i></span>
                         <input type="text" v-model="searchDrive" placeholder="Search roles..." class="form-control bg-light border-0 rounded-end-pill py-2">
                     </div>
                </div>
                <div class="card-body p-4">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="table-light border-top">
                                <tr><th>Position & Job Description</th><th>Interview Mode</th><th>Target Eligibility</th><th>Status</th><th>Applicants</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                <tr v-for="d in filteredDrives" :key="d.id">
                                    <td class="py-3">
                                        <div class="fw-bold text-dark">{{ d.job_title }}</div>
                                        <div class="text-secondary small text-truncate" style="max-width: 250px;">{{ d.job_description }}</div>
                                    </td>
                                    <td>
                                        <span class="badge rounded-pill bg-light text-dark border small">
                                            {{ d.interview_mode || 'In-Person' }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="small fw-medium">{{ d.required_degree || 'Any Degree' }} • {{ d.required_branch || 'Any Branch' }}</div>
                                        <div class="text-secondary small">Min CGPA: {{ d.min_cgpa }}</div>
                                    </td>
                                    <td>
                                        <span class="badge rounded-pill px-3" :class="d.status === 'Approved' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'">{{ d.status }}</span>
                                    </td>
                                    <td>
                                        <template v-if="d.applicant_count > 0">
                                            <div class="d-flex flex-wrap gap-1 mb-1" style="max-width: 150px;">
                                                <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle small px-2 py-1" style="font-size: 0.65rem;" title="Applied">A: {{ d.status_counts.Applied }}</span>
                                                <span class="badge bg-primary-subtle text-primary border border-primary-subtle small px-2 py-1" style="font-size: 0.65rem;" title="Shortlisted">S: {{ d.status_counts.Shortlisted }}</span>
                                                <span class="badge bg-success-subtle text-success border border-success-subtle small px-2 py-1" style="font-size: 0.65rem;" title="Selected">Se: {{ d.status_counts.Selected }}</span>
                                                <span class="badge bg-danger-subtle text-danger border border-danger-subtle small px-2 py-1" style="font-size: 0.65rem;" title="Rejected">R: {{ d.status_counts.Rejected }}</span>
                                            </div>
                                            <div class="fw-bold text-dark small">{{ d.applicant_count }} Total</div>
                                        </template>
                                        <template v-else>
                                            <span class="text-secondary small italic">No applicants yet</span>
                                        </template>
                                    </td>
                                    <td>
                                        <div class="d-flex gap-2">
                                            <button @click="openDriveDetail(d)" class="btn btn-sm btn-outline-dark rounded-pill px-3" title="View Details"><i class="bi bi-eye"></i></button>
                                            <router-link :to="'/company/drives/' + d.id + '/candidates'" class="btn btn-sm btn-dark rounded-pill px-3 shadow-sm">Review Candidates</router-link>
                                            <button @click="openEditDeadline(d)" class="btn btn-sm btn-outline-secondary rounded-pill px-2" title="Edit Deadline"><i class="bi bi-calendar-event"></i></button>
                                            <button @click="confirmDelete(d)" class="btn btn-sm btn-outline-danger rounded-pill px-2" title="Delete Drive"><i class="bi bi-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="filteredDrives.length === 0"><td colspan="5" class="text-center py-5 text-secondary">No drives found. Click 'Post a new Job' to begin.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Drive Detail Modal -->
            <teleport to="body">
                <div v-if="driveDetail" class="modal show d-block" style="background: rgba(0,0,0,0.5); overflow-y: auto; z-index: 2000;" @click.self="driveDetail = null">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                            <div class="modal-header border-0 px-4 pt-4 pb-0">
                                <h5 class="fw-bold mb-0">Drive Details</h5>
                                <button type="button" class="btn-close" @click="driveDetail = null"></button>
                            </div>
                            <div class="modal-body p-4">
                                <div class="mb-4">
                                    <h4 class="fw-bold text-primary mb-1">{{ driveDetail.job_title }}</h4>
                                    <span class="badge rounded-pill px-3" :class="driveDetail.status === 'Approved' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'">{{ driveDetail.status }}</span>
                                </div>
                                <div class="mb-4">
                                    <h6 class="text-secondary small fw-bold text-uppercase mb-2">Job Description</h6>
                                    <p class="text-dark mb-0" style="white-space: pre-wrap;">{{ driveDetail.job_description }}</p>
                                </div>
                                <div class="mb-4">
                                    <h6 class="text-secondary small fw-bold text-uppercase mb-2">Interview Mode</h6>
                                    <span class="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">
                                        <i class="bi bi-camera-video me-1" v-if="driveDetail.interview_mode === 'Remote'"></i>
                                        <i class="bi bi-geo-alt me-1" v-else-if="driveDetail.interview_mode === 'In-Person'"></i>
                                        <i class="bi bi-shuffle me-1" v-else></i>
                                        {{ driveDetail.interview_mode || 'In-Person' }}
                                    </span>
                                </div>
                                <div class="row g-3">
                                    <div class="col-6">
                                        <h6 class="text-secondary small fw-bold text-uppercase mb-1">Target Degree</h6>
                                        <div class="fw-medium">{{ driveDetail.required_degree || 'Any Degree' }}</div>
                                    </div>
                                    <div class="col-6">
                                        <h6 class="text-secondary small fw-bold text-uppercase mb-1">Target Branch</h6>
                                        <div class="fw-medium">{{ driveDetail.required_branch || 'Any Branch' }}</div>
                                    </div>
                                    <div class="col-6">
                                        <h6 class="text-secondary small fw-bold text-uppercase mb-1">Min CGPA</h6>
                                        <div class="fw-medium">{{ driveDetail.min_cgpa }}</div>
                                    </div>
                                    <div class="col-6">
                                        <h6 class="text-secondary small fw-bold text-uppercase mb-1">Deadline</h6>
                                        <div class="fw-medium">{{ formatDate(driveDetail.deadline) }}</div>
                                    </div>
                                </div>
                                <div class="mt-4 p-3 bg-light rounded-3 text-center">
                                    <h6 class="text-secondary small fw-bold text-uppercase mb-3">Applicant Breakdown</h6>
                                    <div class="row g-2">
                                        <div class="col-3">
                                            <div class="fw-bold h5 mb-0">{{ driveDetail.status_counts.Applied }}</div>
                                            <div class="text-secondary" style="font-size: 0.7rem;">Applied</div>
                                        </div>
                                        <div class="col-3 border-start">
                                            <div class="fw-bold h5 mb-0 text-primary">{{ driveDetail.status_counts.Shortlisted }}</div>
                                            <div class="text-secondary" style="font-size: 0.7rem;">Shortlisted</div>
                                        </div>
                                        <div class="col-3 border-start">
                                            <div class="fw-bold h5 mb-0 text-success">{{ driveDetail.status_counts.Selected }}</div>
                                            <div class="text-secondary" style="font-size: 0.7rem;">Selected</div>
                                        </div>
                                        <div class="col-3 border-start">
                                            <div class="fw-bold h5 mb-0 text-danger">{{ driveDetail.status_counts.Rejected }}</div>
                                            <div class="text-secondary" style="font-size: 0.7rem;">Rejected</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer border-0 p-4 pt-0">
                                <button @click="driveDetail = null" class="btn btn-dark w-100 rounded-pill py-2 fw-bold">Close View</button>
                            </div>
                        </div>
                    </div>
                </div>
            </teleport>

            <!-- Create Drive Modal -->
            <teleport to="body">
                <div v-if="showCreateModal" class="modal show d-block" style="background: rgba(0,0,0,0.5); overflow-y: auto; z-index: 2000;">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content border-0 rounded-4 shadow p-3">
                            <div class="modal-header border-0">
                                <h4 class="fw-bold">Post Global Job Drive</h4>
                                <button type="button" class="btn-close" @click="showCreateModal = false"></button>
                            </div>
                            <div class="modal-body">
                                <form @submit.prevent="createDrive">
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold small">Job Title <span class="text-danger">*</span></label>
                                        <input type="text" v-model="newDrive.job_title" class="form-control rounded-3" placeholder="e.g. Backend Developer" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold small">Job Description *</label>
                                        <textarea v-model="newDrive.job_description" class="form-control rounded-3" rows="3" required></textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold small">Interview Mode <span class="text-danger">*</span></label>
                                        <select v-model="newDrive.interview_mode" class="form-select rounded-3 shadow-sm border-0 bg-light">
                                            <option value="In-Person">In-Person (On-Campus)</option>
                                            <option value="Remote">Remote (Online)</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div class="row g-3 mb-3">
                                        <div class="col-6">
                                            <label class="form-label fw-semibold small">Required Degree</label>
                                            <select v-model="selectedDegree" class="form-select rounded-3">
                                                <option v-for="d in ['Any', ...degrees]" :key="d" :value="d">{{ d === 'Any' ? 'Any Degree (Open to all)' : d }}</option>
                                            </select>
                                            <input v-if="selectedDegree === 'Other'" type="text" v-model="customDegree" placeholder="Specify degree..." class="form-control mt-2 rounded-3" required>
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label fw-semibold small">Required Branch</label>
                                            <select v-model="selectedBranch" class="form-select rounded-3">
                                                <option v-for="b in ['Any', ...branches]" :key="b" :value="b">{{ b === 'Any' ? 'Any Branch (Open to all)' : b }}</option>
                                            </select>
                                            <input v-if="selectedBranch === 'Other'" type="text" v-model="customBranch" placeholder="Specify branch..." class="form-control mt-2 rounded-3" required>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold small">Min CGPA</label>
                                        <input type="number" step="0.01" min="0" max="10" v-model="newDrive.min_cgpa" class="form-control rounded-3">
                                    </div>
                                    <div class="mb-4">
                                        <label class="form-label fw-semibold small">Application Deadline <span class="text-danger">*</span></label>
                                        <input type="date" v-model="newDrive.deadline" :min="todayDate" class="form-control rounded-3" required>
                                    </div>
                                    <button type="submit" class="btn btn-dark w-100 py-3 rounded-pill fw-bold">Submit for Approval</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </teleport>

            <!-- Update Deadline Modal -->
            <teleport to="body">
                <div v-if="editingDrive" class="modal show d-block" style="background: rgba(0,0,0,0.5); z-index: 2000;" @click.self="editingDrive = null">
                    <div class="modal-dialog modal-sm modal-dialog-centered">
                        <div class="modal-content border-0 rounded-4 shadow-lg p-3">
                            <div class="modal-header border-0 pb-0">
                                <h5 class="fw-bold mb-0">Update Deadline</h5>
                                <button type="button" class="btn-close" @click="editingDrive = null"></button>
                            </div>
                            <div class="modal-body">
                                <form @submit.prevent="submitDeadlineUpdate">
                                    <div class="mb-4">
                                        <label class="form-label text-secondary small">New valid-thru date</label>
                                        <input type="date" v-model="editDeadlineValue" :min="todayDate" class="form-control rounded-3" required>
                                    </div>
                                    <button type="submit" class="btn btn-dark w-100 py-2 rounded-pill fw-bold">Confirm Extension</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </teleport>

            <!-- ========== NOTIFICATION MODAL ========== -->
            <teleport to="body">
                <div v-if="notificationModal.show" class="modal show d-block" style="background: rgba(0,0,0,0.45); z-index: 2200;" @click.self="notificationModal.show = false">
                    <div class="modal-dialog modal-dialog-centered" style="max-width: 420px;">
                        <div class="modal-content border-0 rounded-4 shadow-lg text-center p-4">
                            <div class="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center" 
                                 :style="'width:64px;height:64px;background:' + notificationModal.iconBg">
                                <i :class="notificationModal.icon" class="fs-3" :style="'color:' + notificationModal.iconColor"></i>
                            </div>
                            <h5 class="fw-bold mb-2">{{ notificationModal.title }}</h5>
                            <p class="text-secondary mb-4" style="font-size: 0.95rem;">{{ notificationModal.message }}</p>
                            <button @click="notificationModal.show = false" class="btn rounded-pill px-4 py-2 fw-medium mx-auto" :class="notificationModal.btnClass" style="min-width: 120px;">OK</button>
                        </div>
                    </div>
                </div>
            </teleport>

            <!-- ========== CONFIRM MODAL ========== -->
            <teleport to="body">
                <div v-if="confirmModal.show" class="modal show d-block" style="background: rgba(0,0,0,0.45); z-index: 2100;" @click.self="confirmModal.show = false">
                    <div class="modal-dialog modal-dialog-centered" style="max-width: 420px;">
                        <div class="modal-content border-0 rounded-4 shadow-lg text-center p-4">
                            <div class="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center" 
                                 :style="'width:64px;height:64px;background:' + confirmModal.iconBg">
                                <i :class="confirmModal.icon" class="fs-3" :style="'color:' + confirmModal.iconColor"></i>
                            </div>
                            <h5 class="fw-bold mb-2">{{ confirmModal.title }}</h5>
                            <p class="text-secondary mb-4" style="font-size: 0.95rem;">{{ confirmModal.message }}</p>
                            <div class="d-flex gap-3 justify-content-center">
                                <button @click="confirmModal.show = false" class="btn btn-light rounded-pill px-4 py-2 fw-medium border" style="min-width: 120px;">Cancel</button>
                                <button @click="executeConfirm" class="btn rounded-pill px-4 py-2 fw-medium" :class="confirmModal.btnClass" style="min-width: 120px;">{{ confirmModal.btnText }}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </teleport>
        </div>
    `,
    data() {
        return {
            drives: [],
            searchDrive: '',
            driveDetail: null,
            showCreateModal: false,
            editingDrive: null,
            editDeadlineValue: '',
            notificationModal: {
                show: false, title: '', message: '', icon: '', iconBg: '', iconColor: '', btnClass: ''
            },
            confirmModal: {
                show: false, title: '', message: '', icon: '', iconBg: '', iconColor: '', btnText: '', btnClass: '', action: null
            },
            newDrive: {
                job_title: '',
                job_description: '',
                required_degree: 'Any',
                required_branch: 'Any',
                min_cgpa: 0,
                deadline: '',
                interview_mode: 'In-Person'
            },
            degrees: ['B.Tech', 'M.Tech', 'MBA', 'PhD', 'B.Sc', 'M.Sc', 'Other'],
            branches: ['Computer Science (CSE)', 'Electronics (ECE)', 'Mechanical (ME)', 'Information Technology (IT)', 'Civil (CE)', 'Electrical (EE)', 'Other'],
            selectedDegree: 'Any',
            selectedBranch: 'Any',
            customDegree: '',
            customBranch: ''
        }
    },
    computed: {
        todayDate() {
            const tzoffset = (new Date()).getTimezoneOffset() * 60000;
            return (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
        },
        filteredDrives() {
            if (!this.searchDrive) return this.drives;
            const q = this.searchDrive.toLowerCase();
            return this.drives.filter(d =>
                d.job_title.toLowerCase().includes(q) ||
                (d.job_description && d.job_description.toLowerCase().includes(q))
            );
        }
    },
    async mounted() {
        await this.fetchDrives();
    },
    methods: {
        showNotification(opts) {
            this.notificationModal = { show: true, ...opts };
        },
        async fetchDrives() {
            try {
                const res = await axios.get('/api/company/drives');
                this.drives = res.data;
            } catch (e) { }
        },
        formatDate(dateStr) {
            if (!dateStr) return 'N/A';
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
        openDriveDetail(drive) {
            this.driveDetail = drive;
        },
        async createDrive() {
            try {
                this.newDrive.required_degree = this.selectedDegree === 'Other' ? this.customDegree : this.selectedDegree;
                this.newDrive.required_branch = this.selectedBranch === 'Other' ? this.customBranch : this.selectedBranch;
                await axios.post('/api/company/drives', this.newDrive);
                this.showCreateModal = false;
                await this.fetchDrives();
                this.newDrive = { job_title: '', job_description: '', required_degree: 'Any', required_branch: 'Any', min_cgpa: 0, deadline: '' };
                this.selectedDegree = 'Any';
                this.selectedBranch = 'Any';
                this.customDegree = '';
                this.customBranch = '';
                this.showNotification({
                    title: 'Drive Published',
                    message: 'Your placement drive is now live and awaiting student applications.',
                    icon: 'bi bi-megaphone-fill', iconBg: '#dcfce7', iconColor: '#16a34a', btnClass: 'btn-dark'
                });
            } catch (err) {
                this.showNotification({
                    title: 'Posting Failed',
                    message: err.response?.data?.message || 'Could not create drive.',
                    icon: 'bi bi-exclamation-triangle-fill', iconBg: '#fee2e2', iconColor: '#dc2626', btnClass: 'btn-danger'
                });
            }
        },
        openEditDeadline(drive) {
            this.editingDrive = drive;
            this.editDeadlineValue = drive.deadline.split('T')[0];
        },
        async submitDeadlineUpdate() {
            try {
                await axios.put('/api/company/drives/' + this.editingDrive.id + '/deadline', {
                    deadline: this.editDeadlineValue
                });
                this.editingDrive = null;
                await this.fetchDrives();
                this.showNotification({
                    title: 'Deadline Updated',
                    message: 'The placement drive deadline has been updated successfully.',
                    icon: 'bi bi-calendar-check', iconBg: '#dcfce7', iconColor: '#16a34a', btnClass: 'btn-dark'
                });
            } catch (err) {
                this.showNotification({
                    title: 'Update Failed',
                    message: err.response?.data?.message || 'Failed to update deadline.',
                    icon: 'bi bi-x-circle-fill', iconBg: '#fee2e2', iconColor: '#dc2626', btnClass: 'btn-danger'
                });
            }
        },
        async confirmDelete(drive) {
            this.showConfirm({
                title: 'Delete Drive',
                message: `Are you sure you want to delete "${drive.job_title}"? This will also delete all applications associated with this drive.`,
                icon: 'bi bi-trash-fill', iconBg: '#fee2e2', iconColor: '#dc2626',
                btnText: 'Yes, Delete', btnClass: 'btn-danger',
                action: async () => { await this.deleteDrive(drive.id); }
            });
        },
        showConfirm(opts) {
            this.confirmModal = { show: true, ...opts };
        },
        async executeConfirm() {
            if (this.confirmModal.action) await this.confirmModal.action();
            this.confirmModal.show = false;
        },
        async deleteDrive(driveId) {
            try {
                await axios.delete('/api/company/drives/' + driveId);
                await this.fetchDrives();
                this.showNotification({
                    title: 'Drive Deleted',
                    message: 'The placement drive and all associated applications have been removed.',
                    icon: 'bi bi-trash-fill', iconBg: '#fee2e2', iconColor: '#dc2626', btnClass: 'btn-danger'
                });
            } catch (err) {
                this.showNotification({
                    title: 'Deletion Failed',
                    message: err.response?.data?.message || 'Failed to delete drive.',
                    icon: 'bi bi-x-circle-fill', iconBg: '#fee2e2', iconColor: '#dc2626', btnClass: 'btn-danger'
                });
            }
        }
    }
};
