const StudentMyApps = {
    template: `
        <div>
            <h4 class="fw-bold mb-1">My Applications</h4>
            <p class="text-secondary mb-3 small">Track the status of every role you've applied to.</p>

            <!-- Compact Stats + Filter Bar -->
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div class="d-flex gap-2 flex-wrap">
                    <button v-for="f in ['All', 'Applied', 'Shortlisted', 'Selected', 'Rejected']" :key="f"
                            class="btn btn-sm rounded-pill px-3 fw-medium"
                            :class="historyFilter === f ? 'btn-dark' : 'bg-light text-dark border-0'"
                            @click="historyFilter = f">
                        {{ f === 'Applied' ? 'Under Review' : f }}
                        <span class="badge rounded-pill ms-1" :class="{
                            'bg-light text-dark': historyFilter === f,
                            'bg-secondary-subtle text-secondary': historyFilter !== f && f === 'All',
                            'bg-warning-subtle text-warning': historyFilter !== f && f === 'Applied',
                            'bg-primary-subtle text-primary': historyFilter !== f && f === 'Shortlisted',
                            'bg-success-subtle text-success': historyFilter !== f && f === 'Selected',
                            'bg-danger-subtle text-danger': historyFilter !== f && f === 'Rejected'
                        }">
                            {{ f === 'All' ? myApplications.length : myApplications.filter(a => a.status === f).length }}
                        </span>
                    </button>
                </div>
                <div class="d-flex gap-3">
                    <div class="d-flex align-items-center gap-1 small">
                        <i class="bi bi-trophy-fill text-success"></i>
                        <span class="fw-bold text-success">{{ myApplications.filter(a => a.status === 'Selected').length }}</span>
                        <span class="text-secondary">selected</span>
                    </div>
                    <div class="d-flex align-items-center gap-1 small">
                        <i class="bi bi-bookmark-star-fill text-primary"></i>
                        <span class="fw-bold text-primary">{{ myApplications.filter(a => a.status === 'Shortlisted').length }}</span>
                        <span class="text-secondary">shortlisted</span>
                    </div>
                    <button @click="$emit('exportHistory')" class="btn btn-sm btn-dark rounded-pill px-3 ms-2 d-flex align-items-center gap-2 shadow-sm" :disabled="myApplications.length === 0">
                        <i class="bi bi-file-earmark-arrow-down-fill"></i> Export CSV
                    </button>
                </div>
            </div>

            <!-- Results Table -->
            <div class="table-responsive border rounded-4 overflow-hidden shadow-sm">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-light">
                        <tr>
                            <th class="ps-4 py-3 border-0 text-secondary small fw-bold text-uppercase">Company</th>
                            <th class="py-3 border-0 text-secondary small fw-bold text-uppercase">Position</th>
                            <th class="py-3 border-0 text-secondary small fw-bold text-uppercase">Result</th>
                            <th class="py-3 border-0 text-secondary small fw-bold text-uppercase">Applied On</th>
                            <th class="pe-4 py-3 border-0 text-secondary small fw-bold text-uppercase text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="app in filteredHistory" :key="app.application_id" 
                            :class="{
                                'border-start border-3 border-success': app.status === 'Selected',
                                'border-start border-3 border-primary': app.status === 'Shortlisted',
                                'border-start border-3 border-danger': app.status === 'Rejected'
                            }">
                            <td class="ps-4">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="rounded-2 d-flex align-items-center justify-content-center fw-bold" 
                                         style="width:36px; height:36px; font-size:0.8rem;"
                                         :style="'background:' + (app.status === 'Selected' ? '#dcfce7' : app.status === 'Shortlisted' ? '#dbeafe' : app.status === 'Rejected' ? '#fee2e2' : '#f3f4f6') + ';color:' + (app.status === 'Selected' ? '#16a34a' : app.status === 'Shortlisted' ? '#2563eb' : app.status === 'Rejected' ? '#dc2626' : '#6b7280')">
                                        {{ app.company_name[0] }}
                                    </div>
                                    <span class="fw-bold text-dark">{{ app.company_name }}</span>
                                </div>
                            </td>
                            <td><div class="fw-medium text-dark">{{ app.job_title }}</div></td>
                            <td>
                                <span class="badge rounded-pill px-3 py-2 fw-bold" :class="{
                                    'bg-success text-white': app.status === 'Selected',
                                    'bg-primary text-white': app.status === 'Shortlisted',
                                    'bg-danger text-white': app.status === 'Rejected',
                                    'bg-secondary-subtle text-secondary': app.status === 'Applied'
                                }">
                                    <i class="bi me-1" :class="{
                                        'bi-trophy-fill': app.status === 'Selected',
                                        'bi-bookmark-star-fill': app.status === 'Shortlisted',
                                        'bi-x-circle-fill': app.status === 'Rejected',
                                        'bi-clock': app.status === 'Applied'
                                    }"></i>
                                    {{ app.status === 'Applied' ? 'Under Review' : app.status }}
                                </span>
                            </td>
                            <td class="text-secondary small">{{ formatDateTime(app.applied_on) }}</td>
                            <td class="pe-4 text-end">
                                <button @click="$emit('viewDriveByApp', app)" class="btn btn-sm btn-outline-dark rounded-pill px-3" title="View Drive Details">
                                    <i class="bi bi-eye me-1"></i> Details
                                </button>
                            </td>
                        </tr>
                        <tr v-if="filteredHistory.length === 0">
                            <td colspan="5" class="text-center py-5 text-secondary">
                                <div class="mb-2"><i class="bi bi-inbox fs-1 text-secondary"></i></div>
                                <div class="fw-medium">No applications found</div>
                                <div class="small" v-if="historyFilter !== 'All'">Try switching to "All" to see all your applications.</div>
                                <div class="small" v-else>Browse open roles to get started.</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `,
    props: ['myApplications'],
    data() {
        return { historyFilter: 'All' };
    },
    computed: {
        filteredHistory() {
            if (this.historyFilter === 'All') return this.myApplications;
            return this.myApplications.filter(a => a.status === this.historyFilter);
        }
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
        }
    }
};
