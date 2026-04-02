const StudentOverview = {
    template: `
        <div>
            <h4 class="fw-bold mb-1">Overview</h4>
            <p class="text-secondary mb-3 small">Your placement journey at a glance.</p>

            <!-- Journey Pipeline + Quick Actions -->
            <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div v-for="(step, i) in journeySteps" :key="i" class="text-center flex-fill position-relative">
                        <div class="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-2 position-relative" 
                             :style="'width:50px;height:50px;background:' + step.bg + ';border: 3px solid ' + (step.count > 0 ? step.color : '#e5e7eb')">
                            <i :class="step.icon" class="fs-6" :style="'color:' + step.color"></i>
                        </div>
                        <div class="fw-bold" style="font-size: 1.2rem;" :style="'color:' + step.color">{{ step.count }}</div>
                        <div class="text-secondary" style="font-size:0.75rem;" >{{ step.label }}</div>
                        <div v-if="i < journeySteps.length - 1" class="position-absolute top-50 start-100" 
                             style="transform: translate(-50%, -25px); z-index:1;">
                            <i class="bi bi-chevron-right text-secondary"></i>
                        </div>
                    </div>
                </div>
                <hr class="my-2 text-secondary-subtle">
                <div class="d-flex gap-2 pt-2 flex-wrap">
                    <button @click="$emit('navigate', 'roles')" class="btn btn-dark rounded-pill px-3 py-1 fw-medium" style="font-size:0.82rem;">
                        <i class="bi bi-search me-1"></i>Browse Roles
                    </button>
                    <button @click="$emit('navigate', 'apps')" class="btn btn-outline-dark rounded-pill px-3 py-1 fw-medium" style="font-size:0.82rem;">
                        <i class="bi bi-kanban me-1"></i>My Applications
                    </button>
                    <button @click="$emit('navigate', 'profile')" class="btn btn-outline-dark rounded-pill px-3 py-1 fw-medium" style="font-size:0.82rem;">
                        <i class="bi bi-person-gear me-1"></i>Edit Profile
                    </button>
                </div>
            </div>

            <div class="row g-4 mb-4">
                <!-- Application Activity Line Chart -->
                <div class="col-lg-7">
                    <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="fw-bold text-dark mb-0 text-uppercase small">Application Activity</h6>
                            <span class="badge bg-light text-secondary rounded-pill px-3 py-1 small">Last 7 days</span>
                        </div>
                        <div style="position: relative; height: 200px;">
                            <canvas id="studentActivityChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Status Breakdown Doughnut -->
                <div class="col-lg-5">
                    <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
                        <h6 class="fw-bold text-dark mb-3 text-uppercase small">Application Status</h6>
                        <div style="position: relative; height: 180px; display: flex; justify-content: center;">
                            <canvas id="studentStatusChart"></canvas>
                        </div>
                        <div class="d-flex justify-content-center gap-3 mt-3 flex-wrap">
                            <span class="d-flex align-items-center gap-1 small" v-for="s in statusLegend" :key="s.label">
                                <span class="rounded-circle d-inline-block" :style="'width:10px;height:10px;background:' + s.color"></span>
                                <span class="text-secondary">{{ s.label }}</span>
                                <span class="fw-bold">{{ s.count }}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-4 mb-4">
                <!-- Eligibility Meter (narrower) -->
                <div class="col-lg-4">
                    <div class="card border-0 shadow-sm rounded-4 p-4">
                        <h6 class="fw-bold text-dark mb-3 text-uppercase small">Eligibility</h6>
                        <div class="text-center mb-2">
                            <div class="position-relative d-inline-block" style="width: 100px; height: 100px;">
                                <svg viewBox="0 0 36 36" style="width:100px;height:100px;transform:rotate(-90deg)">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                          fill="none" stroke="#e5e7eb" stroke-width="3"/>
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                          fill="none" stroke="#10b981" stroke-width="3" 
                                          :stroke-dasharray="eligiblePercent + ', 100'"
                                          style="transition: stroke-dasharray 0.6s ease;"/>
                                </svg>
                                <div class="position-absolute top-50 start-50 translate-middle text-center">
                                    <div class="fw-bold" style="font-size:1.3rem;color:#10b981">{{ eligiblePercent }}%</div>
                                </div>
                            </div>
                        </div>
                        <div class="text-center small text-secondary mb-3">
                            <strong class="text-dark">{{ eligibleCount }}</strong> / <strong class="text-dark">{{ totalDrives }}</strong> drives
                        </div>
                        <div class="bg-light rounded-3 p-2">
                            <div class="d-flex justify-content-between small mb-1">
                                <span class="text-secondary">CGPA</span>
                                <span class="fw-bold text-dark">{{ profile.cgpa || '—' }}</span>
                            </div>
                            <div class="d-flex justify-content-between small mb-1">
                                <span class="text-secondary">Degree</span>
                                <span class="fw-bold text-dark">{{ profile.degree || '—' }}</span>
                            </div>
                            <div class="d-flex justify-content-between small">
                                <span class="text-secondary">Branch</span>
                                <span class="fw-bold text-dark text-truncate" style="max-width:140px;">{{ profile.branch || '—' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Smart Suggestions (wider, natural height) -->
                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm rounded-4 p-4">
                        <h6 class="fw-bold text-dark mb-3 text-uppercase small"><i class="bi bi-lightbulb-fill text-warning me-2"></i>Smart Suggestions</h6>
                        <div class="d-flex flex-column gap-2">
                            <div v-for="(tip, i) in suggestions" :key="i" 
                                 class="d-flex align-items-center gap-3 p-3 rounded-3"
                                 :style="'background:' + tip.bg">
                                <div class="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0" 
                                     style="width:34px;height:34px;"
                                     :style="'background:' + tip.iconBg">
                                    <i :class="tip.icon" :style="'color:' + tip.iconColor"></i>
                                </div>
                                <div class="flex-grow-1">
                                    <span class="fw-bold small text-dark">{{ tip.title }}</span>
                                    <span class="text-secondary ms-1" style="font-size: 0.82rem;">{{ tip.message }}</span>
                                    <a v-if="tip.action" href="#" @click.prevent="$emit('navigate', tip.action)" class="ms-2 fw-bold text-decoration-none small" :style="'color:' + tip.iconColor">{{ tip.actionLabel }} →</a>
                                </div>
                            </div>
                            <div v-if="suggestions.length === 0" class="text-center py-2 text-secondary small">
                                <i class="bi bi-check-circle-fill text-success me-1"></i>
                                You're all set! No pending suggestions.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    props: ['profile', 'drives', 'myApplications'],
    computed: {
        journeySteps() {
            const apps = this.myApplications || [];
            return [
                { label: 'Applied', count: apps.length, icon: 'bi bi-send-fill', color: '#6b7280', bg: '#f3f4f6' },
                { label: 'Shortlisted', count: apps.filter(a => a.status === 'Shortlisted').length, icon: 'bi bi-bookmark-star-fill', color: '#2563eb', bg: '#dbeafe' },
                { label: 'Selected', count: apps.filter(a => a.status === 'Selected').length, icon: 'bi bi-trophy-fill', color: '#16a34a', bg: '#dcfce7' },
                { label: 'Rejected', count: apps.filter(a => a.status === 'Rejected').length, icon: 'bi bi-x-circle-fill', color: '#dc2626', bg: '#fee2e2' }
            ];
        },
        statusLegend() {
            const apps = this.myApplications || [];
            return [
                { label: 'Review', count: apps.filter(a => a.status === 'Applied').length, color: '#9ca3af' },
                { label: 'Shortlisted', count: apps.filter(a => a.status === 'Shortlisted').length, color: '#3b82f6' },
                { label: 'Selected', count: apps.filter(a => a.status === 'Selected').length, color: '#22c55e' },
                { label: 'Rejected', count: apps.filter(a => a.status === 'Rejected').length, color: '#ef4444' }
            ];
        },
        eligibleCount() {
            if (!this.profile?.cgpa) return 0;
            return (this.drives || []).filter(d => {
                const meetsCGPA = parseFloat(this.profile.cgpa) >= parseFloat(d.min_cgpa);
                const meetsDegree = !d.required_degree || d.required_degree === 'Any' || d.required_degree === this.profile.degree;
                const meetsBranch = !d.required_branch || d.required_branch === 'Any' || d.required_branch === this.profile.branch;
                return meetsCGPA && meetsDegree && meetsBranch;
            }).length;
        },
        totalDrives() { return (this.drives || []).length; },
        eligiblePercent() {
            if (!this.totalDrives) return 0;
            return Math.round((this.eligibleCount / this.totalDrives) * 100);
        },
        suggestions() {
            const tips = [];
            if (!this.profile?.resume_url) {
                tips.push({ title: 'Upload Your Resume', message: 'A resume is required before you can apply to any placement drive.', icon: 'bi bi-file-earmark-arrow-up', iconColor: '#dc2626', iconBg: '#fee2e2', bg: '#fef2f2', action: 'profile', actionLabel: 'Go to Profile' });
            }
            if (!this.profile?.cgpa) {
                tips.push({ title: 'Complete Your Profile', message: 'Add your CGPA and academic details to see which drives you\'re eligible for.', icon: 'bi bi-person-exclamation', iconColor: '#f59e0b', iconBg: '#fef3c7', bg: '#fffbeb', action: 'profile', actionLabel: 'Go to Profile' });
            }
            const notAppliedEligible = (this.drives || []).filter(d => {
                if (!this.profile?.cgpa) return false;
                const meetsCGPA = parseFloat(this.profile.cgpa) >= parseFloat(d.min_cgpa);
                const meetsDegree = !d.required_degree || d.required_degree === 'Any' || d.required_degree === this.profile.degree;
                const meetsBranch = !d.required_branch || d.required_branch === 'Any' || d.required_branch === this.profile.branch;
                const applied = (this.myApplications || []).some(a => a.drive_id === d.id);
                return (meetsCGPA && meetsDegree && meetsBranch) && !applied;
            }).length;
            if (notAppliedEligible > 0) {
                tips.push({ title: `${notAppliedEligible} Eligible Drive${notAppliedEligible > 1 ? 's' : ''} Waiting`, message: `You haven't applied to ${notAppliedEligible} drive${notAppliedEligible > 1 ? 's' : ''} you qualify for. Don't miss out!`, icon: 'bi bi-lightning-fill', iconColor: '#2563eb', iconBg: '#dbeafe', bg: '#eff6ff', action: 'roles', actionLabel: 'View Drives' });
            }
            const selected = (this.myApplications || []).filter(a => a.status === 'Selected').length;
            if (selected > 0) {
                tips.push({ title: `Congratulations! 🎉`, message: `You've been selected in ${selected} placement drive${selected > 1 ? 's' : ''}. Check "My Applications" for details.`, icon: 'bi bi-trophy-fill', iconColor: '#16a34a', iconBg: '#dcfce7', bg: '#f0fdf4', action: 'apps', actionLabel: 'View Results' });
            }
            return tips;
        }
    },
    mounted() {
        this.$nextTick(() => { this.renderCharts(); });
    },
    watch: {
        myApplications: { handler() { this.$nextTick(() => this.renderCharts()); }, deep: true }
    },
    methods: {
        renderCharts() {
            this.renderLineChart();
            this.renderDoughnut();
        },
        renderLineChart() {
            const canvas = document.getElementById('studentActivityChart');
            if (!canvas) return;
            if (this._lineChart) this._lineChart.destroy();
            
            // Build last 7 days data from applications
            const labels = [];
            const appliedData = [];
            const resultData = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                labels.push(dateStr);
                
                const dayStr = d.toISOString().slice(0, 10);
                const applied = (this.myApplications || []).filter(a => a.applied_on && a.applied_on.slice(0, 10) === dayStr).length;
                const results = (this.myApplications || []).filter(a => 
                    a.applied_on && a.applied_on.slice(0, 10) === dayStr && (a.status === 'Selected' || a.status === 'Shortlisted')
                ).length;
                appliedData.push(applied);
                resultData.push(results);
            }
            
            this._lineChart = new Chart(canvas, {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Applications',
                            data: appliedData,
                            borderColor: '#111827',
                            backgroundColor: 'rgba(17,24,39,0.08)',
                            borderWidth: 2.5,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointBackgroundColor: '#111827',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2
                        },
                        {
                            label: 'Shortlisted / Selected',
                            data: resultData,
                            borderColor: '#22c55e',
                            backgroundColor: 'rgba(34,197,94,0.08)',
                            borderWidth: 2.5,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointBackgroundColor: '#22c55e',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { size: 11, weight: '600' } } }
                    },
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: '#f3f4f6' } },
                        x: { ticks: { font: { size: 10 } }, grid: { display: false } }
                    }
                }
            });
        },
        renderDoughnut() {
            const canvas = document.getElementById('studentStatusChart');
            if (!canvas) return;
            if (this._doughnutChart) this._doughnutChart.destroy();
            
            const apps = this.myApplications || [];
            const data = [
                apps.filter(a => a.status === 'Applied').length,
                apps.filter(a => a.status === 'Shortlisted').length,
                apps.filter(a => a.status === 'Selected').length,
                apps.filter(a => a.status === 'Rejected').length
            ];
            
            // If all zeros, show placeholder
            const hasData = data.some(d => d > 0);
            
            this._doughnutChart = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: ['Under Review', 'Shortlisted', 'Selected', 'Rejected'],
                    datasets: [{
                        data: hasData ? data : [1],
                        backgroundColor: hasData ? ['#9ca3af', '#3b82f6', '#22c55e', '#ef4444'] : ['#e5e7eb'],
                        borderWidth: 0,
                        spacing: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: hasData }
                    }
                }
            });
        }
    }
};
