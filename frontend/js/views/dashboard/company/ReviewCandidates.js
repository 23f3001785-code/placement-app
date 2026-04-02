const ReviewCandidates = {
    template: `
        <div class="container-fluid px-4 px-md-5 py-3 animated-entry">
            <!-- Header -->
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <div class="d-flex align-items-center gap-3 mb-1">
                        <router-link to="/company/drives" class="btn btn-sm btn-outline-dark rounded-pill px-3 py-1">
                            <i class="bi bi-arrow-left me-1"></i> Drives
                        </router-link>
                        <h5 class="fw-bold mb-0">
                            Applicants for {{ driveDetails ? driveDetails.job_title : 'Drive #' + driveId }}
                        </h5>
                        <span class="badge bg-dark rounded-pill">{{ applications.length }}</span>
                    </div>
                </div>
            </div>

            <!-- Pipeline Container -->
            <div class="card border-0 rounded-4 shadow-sm mb-4">
                <div class="card-body p-4 pt-3">
                    <!-- Controls Row: Search + Filters inline -->
                    <div class="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center mb-3 gap-2">
                        <div class="input-group shadow-sm" style="max-width: 300px;">
                            <span class="input-group-text bg-white border-end-0 rounded-start-pill ps-3"><i class="bi bi-search text-secondary"></i></span>
                            <input type="text" v-model="searchQuery" placeholder="Search candidate..." class="form-control border-start-0 rounded-end-pill py-1" style="box-shadow: none; font-size:0.88rem;">
                        </div>
                        <div class="nav nav-pills bg-light p-1 rounded-pill shadow-sm" style="width: fit-content; overflow-x: auto; flex-wrap: nowrap;">
                            <button v-for="s in ['All', 'Applied', 'Shortlisted', 'Selected', 'Rejected']" :key="s" @click="filterStatus = s" class="nav-link rounded-pill px-3 py-1 border-0 small fw-bold flex-shrink-0" :class="filterStatus === s ? 'btn-dark text-white active' : 'text-secondary'">
                                {{ s }} <span v-if="s !== 'All'" class="badge ms-1 rounded-pill" :class="filterStatus === s ? 'bg-white text-dark' : 'bg-secondary text-white'">{{ applications.filter(a => a.status === s).length }}</span>
                            </button>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-hover align-middle border-top">
                            <thead class="bg-light">
                                <tr>
                                    <th class="border-0">Candidate Details</th>
                                    <th class="border-0">Academic Profile</th>
                                    <th class="border-0">Resume</th>
                                    <th class="border-0">Status</th>
                                    <th class="border-0 text-end">Pipeline Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="app in filteredApplications" :key="app.application_id">
                                    <td class="py-3"><div class="fw-bold text-dark">{{ app.student_name }}</div></td>
                                    <td>
                                        <div class="small fw-medium">{{ app.branch }}</div>
                                        <div class="text-secondary small">Degree: {{ app.degree || 'B.Tech' }} • CGPA: {{ app.cgpa }}</div>
                                    </td>
                                    <td>
                                        <a :href="app.resume_url" target="_blank" class="btn btn-sm btn-outline-dark rounded-pill px-3">
                                            <i class="bi bi-file-earmark-pdf me-1"></i> View CV
                                        </a>
                                    </td>
                                    <td>
                                        <span class="badge rounded-pill px-3" :class="{
                                            'bg-success-subtle text-success': app.status === 'Selected',
                                            'bg-primary-subtle text-primary': app.status === 'Shortlisted',
                                            'bg-danger-subtle text-danger': app.status === 'Rejected',
                                            'bg-secondary-subtle text-secondary': app.status === 'Applied'
                                        }">{{ app.status }}</span>
                                    </td>
                                    <td class="text-end">
                                        <div class="d-flex gap-2 justify-content-end">
                                            <button @click="openCandidateModal(app)" class="btn btn-sm btn-outline-dark rounded-pill px-3" title="View Full Profile"><i class="bi bi-person-lines-fill"></i> Details</button>
                                            <button v-if="app.status !== 'Rejected' && app.status !== 'Shortlisted' && app.status !== 'Selected'" @click="updateStatus(app.application_id, 'Shortlisted')" class="btn btn-sm btn-dark rounded-pill px-3">Shortlist</button>
                                            <button v-if="app.status !== 'Rejected' && app.status !== 'Selected'" @click="updateStatus(app.application_id, 'Selected')" class="btn btn-sm btn-outline-success rounded-pill px-3">Select</button>
                                            <button v-if="app.status !== 'Rejected'" @click="updateStatus(app.application_id, 'Rejected')" class="btn btn-sm btn-outline-danger rounded-pill px-3">Reject</button>
                                            <button v-if="app.status === 'Rejected'" @click="promptDelete(app.application_id)" class="btn btn-sm btn-danger rounded-pill px-3" title="Remove permanently">
                                                <i class="bi bi-trash"></i> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="filteredApplications.length === 0">
                                    <td colspan="5" class="text-center py-5 text-secondary">No candidates found in this stage.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ========== CANDIDATE DETAIL MODAL ========== -->
            <teleport to="body">
                <div v-if="showCandidateModal && selectedCandidate" class="modal show d-block" style="background: rgba(0,0,0,0.5); overflow-y: auto; z-index: 2100;" @click.self="showCandidateModal = false">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                            <div class="modal-header border-0 px-4 pt-4 pb-0">
                                <h5 class="fw-bold mb-0">Applicant Profile</h5>
                                <button type="button" class="btn-close" @click="showCandidateModal = false"></button>
                            </div>
                            <div class="modal-body p-4">
                                <div class="d-flex align-items-center mb-4 gap-3">
                                    <div class="bg-light rounded-circle d-flex align-items-center justify-content-center fw-bold text-dark fs-3 shadow-sm border" style="width: 70px; height: 70px;">
                                        {{ selectedCandidate.student_name[0].toUpperCase() }}
                                    </div>
                                    <div>
                                        <h4 class="fw-bold mb-1">{{ selectedCandidate.student_name }}</h4>
                                        <span class="badge rounded-pill px-3" :class="{
                                            'bg-success-subtle text-success': selectedCandidate.status === 'Selected',
                                            'bg-primary-subtle text-primary': selectedCandidate.status === 'Shortlisted',
                                            'bg-danger-subtle text-danger': selectedCandidate.status === 'Rejected',
                                            'bg-secondary-subtle text-secondary': selectedCandidate.status === 'Applied'
                                        }">{{ selectedCandidate.status }}</span>
                                    </div>
                                </div>
                                <div class="row g-3 bg-light rounded-3 p-3 mx-0 mb-4">
                                    <div class="col-6 border-end">
                                        <h6 class="text-secondary small fw-bold text-uppercase mb-1">Academic Setup</h6>
                                        <div class="fw-bold text-dark mb-1">{{ selectedCandidate.degree || 'B.Tech' }} in {{ selectedCandidate.branch }}</div>
                                        <div class="text-primary fw-bold"><i class="bi bi-graph-up me-1"></i> {{ selectedCandidate.cgpa }} CGPA</div>
                                    </div>
                                    <div class="col-6 ps-3">
                                        <h6 class="text-secondary small fw-bold text-uppercase mb-1">Institution</h6>
                                        <div class="fw-medium text-dark">{{ selectedCandidate.college_name || 'Not provided' }}</div>
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <h6 class="text-secondary small fw-bold text-uppercase mb-2">Application Timeline</h6>
                                    <p class="text-dark mb-0 fw-medium"><i class="bi bi-calendar-check text-secondary me-2"></i> Applied on {{ formatDateTime(selectedCandidate.applied_on) }}</p>
                                </div>
                            </div>
                            <div class="modal-footer border-0 p-4 pt-0">
                                <a :href="selectedCandidate.resume_url" target="_blank" class="btn btn-dark w-100 rounded-pill py-3 fw-bold shadow-sm">
                                    <i class="bi bi-file-earmark-pdf me-2"></i> Open Full Resume
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </teleport>

            <!-- ========== DELETE CONFIRMATION MODAL ========== -->
            <teleport to="body">
                <div v-if="deleteModal.show" class="modal show d-block" style="background: rgba(0,0,0,0.5); z-index: 2300;" @click.self="deleteModal.show = false">
                    <div class="modal-dialog modal-dialog-centered" style="max-width: 400px;">
                        <div class="modal-content border-0 rounded-4 shadow-lg text-center p-4">
                            <div class="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center bg-danger-subtle text-danger" style="width:64px;height:64px;">
                                <i class="bi bi-exclamation-triangle-fill fs-3"></i>
                            </div>
                            <h5 class="fw-bold mb-2 text-dark">Remove Candidate?</h5>
                            <p class="text-secondary mb-4" style="font-size: 0.95rem;">This action is permanent and cannot be undone. Are you sure you want to delete this application?</p>
                            <div class="d-flex gap-2 justify-content-center w-100">
                                <button @click="deleteModal.show = false" class="btn btn-light rounded-pill fw-bold w-50 border">Cancel</button>
                                <button @click="executeDelete" class="btn btn-danger rounded-pill fw-bold w-50 shadow-sm">Delete</button>
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
        </div>
    `,
    data() {
        return {
            driveId: this.$route.params.id,
            driveDetails: null,
            applications: [],
            filterStatus: 'All',
            searchQuery: '',
            selectedCandidate: null,
            showCandidateModal: false,
            deleteModal: { show: false, appId: null },
            notificationModal: {
                show: false, title: '', message: '', icon: '', iconBg: '', iconColor: '', btnClass: ''
            }
        };
    },
    computed: {
        filteredApplications() {
            let filtered = this.applications;
            if (this.filterStatus !== 'All') {
                filtered = filtered.filter(a => a.status === this.filterStatus);
            }
            if (this.searchQuery.trim()) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(a =>
                    a.student_name.toLowerCase().includes(query) ||
                    (a.college_name || '').toLowerCase().includes(query) ||
                    (a.branch || '').toLowerCase().includes(query)
                );
            }
            return filtered;
        }
    },
    async mounted() {
        await this.fetchDriveDetails();
        await this.fetchApplications();
    },
    methods: {
        formatDateTime(dateStr) {
            if (!dateStr) return 'N/A';
            return new Date(dateStr).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        },
        openCandidateModal(app) {
            this.selectedCandidate = app;
            this.showCandidateModal = true;
        },
        showNotification(opts) {
            this.notificationModal = { show: true, ...opts };
        },
        async fetchDriveDetails() {
            try {
                const res = await axios.get('/api/company/drives');
                this.driveDetails = res.data.find(d => d.id == this.driveId);
            } catch (err) { }
        },
        async fetchApplications() {
            try {
                const res = await axios.get('/api/company/drives/' + this.driveId + '/applications');
                this.applications = res.data;
            } catch (err) {
                this.showNotification({
                    title: 'Error Loading Pipeline',
                    message: "Could not load candidate applications for this drive.",
                    icon: 'bi bi-x-circle-fill', iconBg: '#fee2e2', iconColor: '#dc2626', btnClass: 'btn-danger'
                });
            }
        },
        async updateStatus(appId, status) {
            try {
                await axios.post('/api/company/applications/' + appId + '/status', { status });
                this.showNotification({
                    title: 'Status Updated',
                    message: "Candidate has been moved to " + status + ".",
                    icon: 'bi bi-check-circle-fill', iconBg: '#dcfce7', iconColor: '#16a34a', btnClass: 'btn-dark'
                });
                await this.fetchApplications();
            } catch (err) {
                this.showNotification({
                    title: 'Update Failed',
                    message: "Could not update the candidate's status.",
                    icon: 'bi bi-x-circle-fill', iconBg: '#fee2e2', iconColor: '#dc2626', btnClass: 'btn-danger'
                });
            }
        },
        promptDelete(appId) {
            this.deleteModal.appId = appId;
            this.deleteModal.show = true;
        },
        async executeDelete() {
            const appId = this.deleteModal.appId;
            this.deleteModal.show = false;
            try {
                await axios.delete('/api/company/applications/' + appId);
                this.showNotification({
                    title: 'Candidate Removed',
                    message: "The application has been permanently deleted.",
                    icon: 'bi bi-trash-fill', iconBg: '#fee2e2', iconColor: '#dc2626', btnClass: 'btn-danger'
                });
                await this.fetchApplications();
            } catch (err) {
                this.showNotification({
                    title: 'Delete Failed',
                    message: "Could not remove the candidate's application.",
                    icon: 'bi bi-x-circle-fill', iconBg: '#fee2e2', iconColor: '#dc2626', btnClass: 'btn-danger'
                });
            }
        }
    }
};
