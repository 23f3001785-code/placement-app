const CompanyDashboard = {
    template: `
        <div class="container-fluid px-4 px-md-5 py-4 animated-entry">
            <!-- Pending State -->
            <template v-if="profile.company_name && profile.is_approved === false">
                <div class="d-flex flex-column align-items-center justify-content-center text-center py-5 animated-entry" style="min-height: 50vh;">
                    <div class="mb-4" style="font-size: 5rem; color: #f59e0b;">
                        <i class="bi bi-hourglass-split"></i>
                    </div>
                    <h1 class="fw-bold mb-3">Account Under Review</h1>
                    <p class="text-secondary mb-4" style="max-width: 500px; margin: 0 auto;">
                        Thank you for registering <strong>{{ profile.company_name }}</strong> with Instihire. Our administrative team is currently verifying your details. You will gain full access to the recruitment dashboard once your account is approved.
                    </p>
                    <button @click="fetchProfile" class="btn btn-outline-dark rounded-pill px-4 py-2 mt-2 fw-medium shadow-sm"><i class="bi bi-arrow-clockwise me-2"></i>Refresh Status</button>
                </div>
            </template>

            <!-- Active Dashboard State -->
            <template v-else-if="profile.company_name && profile.is_approved === true">
                <div class="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h1 class="fw-bold mb-1">{{ profile.company_name }}</h1>
                        <p class="text-secondary mb-0">Hiring Overview</p>
                    </div>
                    <router-link to="/company/drives" class="btn btn-dark rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2">
                        <i class="bi bi-briefcase-fill"></i> Manage Placement Drives
                    </router-link>
                </div>

                <div class="row g-4 mb-5">
                    <div class="col-md-3">
                        <div class="card p-4 border-0 shadow-sm h-100">
                            <h6 class="text-secondary small fw-bold text-uppercase mb-3">Live Drives</h6>
                            <h2 class="fw-bold">{{ drives.length }}</h2>
                        </div>
                    </div>
                    <div class="col-md-9">
                         <div class="card p-4 border-0 shadow-sm h-100">
                            <div class="d-flex justify-content-between">
                                 <h6 class="text-secondary small fw-bold text-uppercase mb-3">Company Information</h6>
                            </div>
                            <div class="row pt-2">
                                 <div class="col-3">
                                     <div class="text-secondary small">HR Contact</div>
                                     <div class="fw-bold">{{ profile.hr_contact }}</div>
                                 </div>
                                 <div class="col-3">
                                     <div class="text-secondary small">HR Phone</div>
                                     <div class="fw-bold">{{ profile.hr_phone || 'N/A' }}</div>
                                 </div>
                                 <div class="col-3">
                                     <div class="text-secondary small">Website</div>
                                     <div class="fw-bold text-truncate">
                                         <a v-if="profile.website" :href="profile.website" target="_blank" class="text-dark text-decoration-underline">{{ profile.website }}</a>
                                         <span v-else class="text-secondary small italic">Not provided</span>
                                     </div>
                                 </div>
                                 <div class="col-3">
                                     <div class="text-secondary small">Status</div>
                                     <div class="fw-bold text-success">{{ profile.is_approved ? 'Active Recruiter' : 'Under Review' }}</div>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- STATS ROW -->
                <div class="row g-4 mb-5" v-if="profile.stats">
                    <div class="col-md-4">
                        <div class="card p-4 border-0 shadow-sm h-100 bg-white" style="border-left: 4px solid #3b82f6 !important;">
                            <h6 class="text-secondary small fw-bold text-uppercase mb-2">Total Applicants</h6>
                            <div class="d-flex align-items-center">
                                <h3 class="fw-bold mb-0 me-2">{{ profile.stats.total_applicants || '—' }}</h3>
                                <span class="badge bg-primary-subtle text-primary rounded-pill">{{ profile.stats.total_applicants > 0 ? 'Across all drives' : 'No applications yet' }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card p-4 border-0 shadow-sm h-100 bg-white" style="border-left: 4px solid #8b5cf6 !important;">
                            <h6 class="text-secondary small fw-bold text-uppercase mb-2">Shortlisted Rate</h6>
                            <div class="d-flex align-items-center">
                                <h3 class="fw-bold mb-0 me-2">{{ profile.stats.total_applicants ? Math.round((profile.stats.total_shortlisted / profile.stats.total_applicants) * 100) + '%' : '—' }}</h3>
                                <span class="text-secondary small">{{ profile.stats.total_applicants > 0 ? profile.stats.total_shortlisted + ' Candidates' : 'Waiting for data' }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card p-4 border-0 shadow-sm h-100 bg-white" style="border-left: 4px solid #10b981 !important;">
                            <h6 class="text-secondary small fw-bold text-uppercase mb-2">Selection Rate</h6>
                            <div class="d-flex align-items-center">
                                <h3 class="fw-bold mb-0 me-2">{{ profile.stats.total_applicants ? Math.round((profile.stats.total_selected / profile.stats.total_applicants) * 100) + '%' : '—' }}</h3>
                                <span class="text-secondary small">{{ profile.stats.total_applicants > 0 ? profile.stats.total_selected + ' Hired' : 'Waiting for data' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- DRIVE PERFORMANCE SECTION -->
                <div class="mb-5" v-if="drives.length > 0">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h5 class="fw-bold mb-0">Active Drive Performance</h5>
                    </div>
                    <div class="row g-4">
                        <div v-for="d in drives" :key="d.id" class="col-md-4">
                            <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                                <div class="card-body p-4">
                                    <div class="d-flex justify-content-between align-items-start mb-3">
                                        <div class="flex-grow-1">
                                            <h6 class="fw-bold text-dark mb-1 text-truncate" style="max-width: 200px;">{{ d.job_title }}</h6>
                                            <div class="text-secondary small">{{ d.required_degree || 'Any' }} · {{ d.required_branch || 'Any' }}</div>
                                        </div>
                                        <div class="bg-dark text-white rounded-3 px-2 py-1 small fw-bold">
                                            {{ d.applicant_count }}
                                        </div>
                                    </div>

                                    <div class="mt-4 pt-3 border-top">
                                        <div class="d-flex align-items-center justify-content-between mb-2">
                                            <span class="text-secondary small">Recruitment funnel</span>
                                            <span class="text-dark fw-bold small">{{ d.applicant_count }} Total</span>
                                        </div>
                                        <div class="progress rounded-pill bg-light" style="height: 10px;">
                                            <div class="progress-bar bg-primary" :style="{ width: (d.status_counts.Applied / d.applicant_count * 100) + '%' }"></div>
                                            <div class="progress-bar bg-warning" :style="{ width: (d.status_counts.Shortlisted / d.applicant_count * 100) + '%' }"></div>
                                            <div class="progress-bar bg-success" :style="{ width: (d.status_counts.Selected / d.applicant_count * 100) + '%' }"></div>
                                            <div class="progress-bar bg-danger" :style="{ width: (d.status_counts.Rejected / d.applicant_count * 100) + '%' }"></div>
                                        </div>
                                        <div class="d-flex flex-wrap gap-3 mt-3">
                                            <div class="d-flex align-items-center gap-1" v-if="d.status_counts.Applied > 0 || d.applicant_count === 0">
                                                <div class="rounded-circle bg-primary" style="width: 8px; height: 8px;"></div>
                                                <span class="text-secondary" style="font-size: 0.75rem;">{{ d.status_counts.Applied }} Applied</span>
                                            </div>
                                            <div class="d-flex align-items-center gap-1" v-if="d.status_counts.Shortlisted > 0">
                                                <div class="rounded-circle bg-warning" style="width: 8px; height: 8px;"></div>
                                                <span class="text-secondary" style="font-size: 0.75rem;">{{ d.status_counts.Shortlisted }} Shortlisted</span>
                                            </div>
                                            <div class="d-flex align-items-center gap-1" v-if="d.status_counts.Selected > 0">
                                                <div class="rounded-circle bg-success" style="width: 8px; height: 8px;"></div>
                                                <span class="text-secondary" style="font-size: 0.75rem;">{{ d.status_counts.Selected }} Hired</span>
                                            </div>
                                            <div class="d-flex align-items-center gap-1" v-if="d.status_counts.Rejected > 0">
                                                <div class="rounded-circle bg-danger" style="width: 8px; height: 8px;"></div>
                                                <span class="text-secondary" style="font-size: 0.75rem;">{{ d.status_counts.Rejected }} Rejected</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="px-4 py-3 bg-light d-flex justify-content-between align-items-center mt-auto">
                                    <span class="text-secondary small italic">Updated just now</span>
                                    <router-link :to="'/company/drives/' + d.id + '/candidates'" class="btn btn-sm btn-link text-dark fw-bold text-decoration-none p-0">
                                        Review Candidates <i class="bi bi-arrow-right ms-1"></i>
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PIPELINE GRAPH / EMPTY STATE -->

            </template>
        </div>
    `,
    data() {
        return {
            profile: {},
            drives: [],
            chartInstance: null
        }
    },
    async mounted() {
        await this.fetchProfile();
        await this.fetchDrives();
    },
    methods: {
        async fetchProfile() {
            try {
                const res = await axios.get('/api/company/profile');
                this.profile = res.data;
                if (this.profile.is_approved && this.profile.stats && this.profile.stats.total_applicants > 0) {
                    this.$nextTick(() => {
                        this.renderChart();
                    });
                }
            } catch (err) {}
        },
        async fetchDrives() {
            try {
                const res = await axios.get('/api/company/drives');
                this.drives = res.data;
            } catch (e) {}
        },
        renderChart() {
            const ctx = document.getElementById('pipelineChart');
            if (!ctx) return;
            
            if (this.chartInstance) {
                this.chartInstance.destroy();
            }

            const stats = this.profile.stats;
            // The API logic evaluates: Application.status == 'Shortlisted', 'Selected'
            // Thus, these are mutually exclusive buckets. Total applicants who are just 'Applied' is total - (shortlisted + selected) 
            const appliedRaw = stats.total_applicants - (stats.total_shortlisted + stats.total_selected);
            
            this.chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Applied (Under Review)', 'Shortlisted (Interviewing)', 'Selected (Hired)'],
                    datasets: [{
                        data: [
                            appliedRaw, 
                            stats.total_shortlisted, 
                            stats.total_selected
                        ],
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.85)',  // Blue
                            'rgba(139, 92, 246, 0.85)',  // Purple
                            'rgba(16, 185, 129, 0.85)'   // Green
                        ],
                        borderWidth: 0,
                        hoverOffset: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: {
                        legend: { 
                            position: 'right',
                            labels: {
                                padding: 20,
                                font: {
                                    family: "'Inter', sans-serif",
                                    size: 13,
                                    weight: '500'
                                },
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: { size: 13 },
                            bodyFont: { size: 14, weight: 'bold' },
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return context.parsed + ' Candidates';
                                }
                            }
                        }
                    }
                }
            });
        }
    }
};
