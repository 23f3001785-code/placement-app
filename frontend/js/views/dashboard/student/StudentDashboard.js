const StudentDashboard = {
    components: {
        'student-overview': StudentOverview,
        'student-open-roles': StudentOpenRoles,
        'student-my-apps': StudentMyApps,
        'student-profile': StudentProfile
    },
    template: `
        <div class="d-flex" style="min-height: calc(100vh - 72px);">
            <!-- Sidebar -->
            <div class="bg-white border-end d-flex flex-column py-4" style="width: 230px; min-width: 230px;">
                <div class="px-4 mb-4">
                    <h6 class="fw-bold text-uppercase small text-secondary mb-0">Student Portal</h6>
                </div>
                
                <!-- Resume Quick Access -->
                <div class="px-3 mb-4">
                    <div class="bg-light rounded-3 p-3 position-relative">
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <div class="d-flex align-items-center gap-2">
                                <i class="bi bi-file-earmark-pdf text-primary"></i>
                                <span class="small fw-bold text-dark">Resume</span>
                            </div>
                            <button @click="triggerResumeUpload" class="btn btn-sm btn-link p-0 text-dark" title="Update Resume">
                                <i class="bi bi-cloud-arrow-up-fill fs-6"></i>
                            </button>
                        </div>
                        <input type="file" ref="resumeInput" class="d-none" accept=".pdf" @change="handleResumeUpload">
                        
                        <div v-if="uploadingResume" class="text-center py-1">
                            <div class="spinner-border spinner-border-sm text-dark" role="status"></div>
                        </div>
                        <div v-else-if="profile.resume_url">
                            <a :href="profile.resume_url" target="_blank" class="btn btn-sm btn-outline-dark rounded-pill w-100 py-1" style="font-size:0.78rem;">
                                <i class="bi bi-eye me-1"></i> View CV
                            </a>
                        </div>
                        <div v-else class="small text-danger fw-medium d-flex align-items-center gap-1">
                            <i class="bi bi-exclamation-triangle"></i> Not uploaded
                        </div>
                    </div>
                </div>
                <nav class="nav flex-column px-3 gap-1">
                    <a v-for="item in sidebarItems" :key="item.key"
                       class="nav-link rounded-3 px-3 py-2 d-flex align-items-center gap-3"
                       :class="activeSection === item.key ? 'bg-dark text-white' : 'text-dark'"
                       href="#" @click.prevent="switchTab(item.key)"
                       style="transition: all 0.15s; font-weight: 500; font-size: 0.9rem;">
                        <i :class="item.icon" class="fs-6"></i>
                        <span>{{ item.label }}</span>
                        <span v-if="getBadgeCount(item.key) !== null" class="badge rounded-pill ms-auto" 
                              :class="activeSection === item.key ? 'bg-white text-dark' : 'bg-dark text-white'" 
                              style="font-size: 0.7rem;">{{ getBadgeCount(item.key) }}</span>
                    </a>
                </nav>


            </div>

            <!-- Main Content -->
            <div class="flex-grow-1 px-4 px-md-5 py-4 animated-entry" style="overflow-y: auto; background: #fafafa;">
                <!-- Overview -->
                <student-overview v-if="activeSection === 'overview'" 
                    :profile="profile" :drives="drives" :my-applications="myApplications"
                    @navigate="handleNav">
                </student-overview>

                <!-- Open Roles -->
                <student-open-roles v-if="activeSection === 'roles'"
                    :profile="profile" :drives="drives" :my-applications="myApplications"
                    @viewDrive="selectedDrive = $event"
                    @apply="apply">
                </student-open-roles>

                <!-- My Applications -->
                <student-my-apps v-if="activeSection === 'apps'"
                    :my-applications="myApplications"
                    @viewDriveByApp="openDriveDetailByApp"
                    @exportHistory="exportHistory">
                </student-my-apps>

                <!-- My Profile -->
                <student-profile v-if="activeSection === 'profile'"
                    :profile="profile"
                    @saved="onProfileSaved"
                    @error="onProfileError">
                </student-profile>
            </div>

            <!-- Drive Detail Modal -->
            <teleport to="body">
                <div v-if="selectedDrive" class="modal show d-block" style="background: rgba(0,0,0,0.5); overflow-y: auto; z-index: 2000;">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content border-0 rounded-4 shadow-lg p-4">
                            <div class="d-flex justify-content-between">
                                <h5 class="fw-bold mb-0">{{ selectedDrive.job_title }}</h5>
                                <button type="button" class="btn-close" @click="selectedDrive = null"></button>
                            </div>
                            <p class="text-primary fw-semibold small mb-3">{{ selectedDrive.company_name }}</p>
                            <div class="mb-3">
                                <h6 class="text-secondary small fw-bold text-uppercase mb-1">Job Description</h6>
                                <p class="text-dark small mb-0" style="white-space: pre-wrap;">{{ selectedDrive.job_description }}</p>
                            </div>
                            <div class="bg-light rounded-3 p-3 mb-3">
                                <div class="row g-2 small">
                                    <div class="col-6"><span class="text-secondary">Degree:</span> <strong>{{ selectedDrive.required_degree || 'Any' }}</strong></div>
                                    <div class="col-6"><span class="text-secondary">Branch:</span> <strong>{{ selectedDrive.required_branch || 'Any' }}</strong></div>
                                    <div class="col-6"><span class="text-secondary">Min CGPA:</span> <strong>{{ selectedDrive.min_cgpa }}</strong></div>
                                    <div class="col-6"><span class="text-secondary">Interview:</span> <strong class="text-primary">{{ selectedDrive.interview_mode || 'In-Person' }}</strong></div>
                                    <div class="col-12 mt-2"><span class="text-secondary">Deadline:</span> <strong>{{ new Date(selectedDrive.deadline).toLocaleDateString() }}</strong></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </teleport>

            <!-- Notification Modal -->
            <teleport to="body">
                <div v-if="notificationModal.show" class="modal show d-block" style="background: rgba(0,0,0,0.4); z-index: 3000;">
                    <div class="modal-dialog modal-dialog-centered modal-sm">
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
            activeSection: 'overview',
            profile: {},
            drives: [],
            myApplications: [],
            selectedDrive: null,
            notificationModal: { show: false, title: '', message: '', icon: '', iconBg: '', iconColor: '', btnClass: '' },
            uploadingResume: false,
            sidebarItems: [
                { key: 'overview', label: 'Overview', icon: 'bi bi-grid-1x2-fill', badge: null },
                { key: 'roles', label: 'Open Roles', icon: 'bi bi-briefcase-fill', badge: null },
                { key: 'apps', label: 'My Applications', icon: 'bi bi-kanban-fill', badge: null },
                { key: 'profile', label: 'My Profile', icon: 'bi bi-person-fill', badge: null }
            ]
        };
    },
    async mounted() {
        await this.fetchProfile();
        await this.fetchDrives();
        await this.fetchMyApplications();
        // Update badges
        this.sidebarItems[1].badge = this.drives.length || null;
        this.sidebarItems[2].badge = this.myApplications.length || null;
    },
    methods: {
        triggerResumeUpload() {
            this.$refs.resumeInput.click();
        },
        async handleResumeUpload(e) {
            const file = e.target.files[0];
            if (!file) return;
            if (file.type !== 'application/pdf') {
                this.showNotification({
                    title: 'Invalid File',
                    message: 'Please select a PDF file for your resume.',
                    icon: 'bi bi-exclamation-triangle-fill', iconBg: '#fee2e2', iconColor: '#dc2626', btnClass: 'btn-danger'
                });
                return;
            }

            this.uploadingResume = true;
            try {
                const fd = new FormData();
                // Send profile fields to satisfy backend validation
                fd.append('full_name', this.profile.full_name);
                fd.append('degree', this.profile.degree);
                fd.append('branch', this.profile.branch);
                fd.append('resume', file);

                await axios.put('/api/student/profile', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                await this.fetchProfile();
                this.showNotification({
                    title: 'Resume Uploaded',
                    message: 'Your CV has been updated successfully and is ready for applications!',
                    icon: 'bi bi-check-circle-fill', iconBg: '#dcfce7', iconColor: '#16a34a', btnClass: 'btn-dark'
                });
            } catch (err) {
                this.showNotification({
                    title: 'Upload Failed',
                    message: err.response?.data?.message || 'Could not upload resume.',
                    icon: 'bi bi-x-circle-fill', iconBg: '#fee2e2', iconColor: '#dc2626', btnClass: 'btn-danger'
                });
            } finally {
                this.uploadingResume = false;
                e.target.value = ''; // Reset input
            }
        },
        async fetchProfile() {
            try {
                const res = await axios.get('/api/student/profile');
                this.profile = res.data;
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            }
        },
        async fetchDrives() {
            try {
                const res = await axios.get('/api/student/drives');
                this.drives = res.data;
            } catch (err) {
                console.error('Failed to fetch drives:', err);
            }
        },
        async fetchMyApplications() {
            try {
                const res = await axios.get('/api/student/applications');
                this.myApplications = res.data;
            } catch (err) {
                console.error('Failed to fetch applications:', err);
            }
        },
        handleNav(section) {
            this.activeSection = section;
        },
        getBadgeCount(key) {
            if (key === 'roles') return this.drives.length || null;
            if (key === 'apps') return this.myApplications.length || null;
            return null;
        },
        async switchTab(tabKey) {
            this.activeSection = tabKey;
            if (tabKey === 'roles') {
                await this.fetchDrives();
            } else if (tabKey === 'apps') {
                await this.fetchMyApplications();
            } else if (tabKey === 'overview') {
                await this.fetchDrives();
                await this.fetchMyApplications();
            }
        },
        showNotification(opts) {
            this.notificationModal = { show: true, ...opts };
        },
        async apply(driveId) {
            try {
                await axios.post(`/api/student/drives/${driveId}/apply`);
                await this.fetchMyApplications();
                this.sidebarItems[2].badge = this.myApplications.length || null;
                this.showNotification({
                    title: 'Application Successful',
                    message: 'Your profile and resume have been submitted to the company!',
                    icon: 'bi bi-check-circle-fill', iconBg: '#dcfce7', iconColor: '#16a34a', btnClass: 'btn-dark'
                });
            } catch (err) {
                this.showNotification({
                    title: 'Application Failed',
                    message: err.response?.data?.message || 'Could not fulfill application request.',
                    icon: 'bi bi-x-circle-fill', iconBg: '#fee2e2', iconColor: '#dc2626', btnClass: 'btn-danger'
                });
            }
        },
        handleApply(driveId) {
            this.selectedDrive = this.drives.find(d => d.id === driveId);
        },
        openDriveDetailByApp(app) {
            const drive = this.drives.find(d => d.id === app.drive_id);
            if (drive) {
                this.selectedDrive = drive;
            } else {
                this.showNotification({
                    title: 'Drive Not Found',
                    message: 'The details for this drive are no longer available in the active list.',
                    icon: 'bi bi-info-circle', iconBg: '#f3f4f6', iconColor: '#6b7280', btnClass: 'btn-dark'
                });
            }
        },
        async onProfileSaved() {
            await this.fetchProfile();
            this.showNotification({
                title: 'Profile Updated',
                message: 'Your academic details and resume were successfully saved.',
                icon: 'bi bi-check-circle-fill', iconBg: '#dcfce7', iconColor: '#16a34a', btnClass: 'btn-dark'
            });
        },
        onProfileError(msg) {
            this.showNotification({
                title: 'Update Failed',
                message: msg,
                icon: 'bi bi-x-circle-fill', iconBg: '#fee2e2', iconColor: '#dc2626', btnClass: 'btn-danger'
            });
        },
        async exportHistory() {
            try {
                // Fetch CSV directly as blob
                const res = await axios.post('/api/student/export', {}, { responseType: 'blob' });
                
                // Create a temporary link to trigger immediate download
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'my_applications.csv');
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                
                this.showNotification({
                    title: 'Export Complete',
                    message: 'Your CSV file has been downloaded successfully.',
                    icon: 'bi bi-check-circle-fill', iconBg: '#dcfce7', iconColor: '#16a34a', btnClass: 'btn-dark'
                });
            } catch (err) {
                this.showNotification({
                    title: 'Export Failed',
                    message: 'Could not download the file. Please try again later.',
                    icon: 'bi bi-x-circle-fill', iconBg: '#fee2e2', iconColor: '#dc2626', btnClass: 'btn-danger'
                });
            }
        }
    }
};
