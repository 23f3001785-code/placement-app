const StudentOpenRoles = {
    template: `
        <div>
            <h4 class="fw-bold mb-1">Open Roles</h4>
            <p class="text-secondary mb-3 small">Browse and apply to campus placement drives.</p>

            <div class="row mb-3 align-items-center g-3">
                <div class="col-md-5">
                    <div class="input-group">
                        <span class="input-group-text bg-white border-secondary-subtle rounded-start-pill ps-4"><i class="bi bi-search text-secondary"></i></span>
                        <input type="text" v-model="searchQuery" class="form-control border-start-0 border-secondary-subtle rounded-end-pill py-2" style="box-shadow: none;" placeholder="Search roles...">
                    </div>
                </div>
                <div class="col-md-4">
                    <select v-model="statusFilter" class="form-select rounded-pill border-secondary-subtle px-4 py-2 small fw-bold">
                        <option value="All">All Opportunities</option>
                        <option value="Applied">Already Applied</option>
                        <option value="Not Applied">Not Applied Yet</option>
                        <option value="Eligible">Only Eligible</option>
                    </select>
                </div>
                <div class="col-md-3 text-md-end">
                    <div class="form-check form-switch d-inline-flex align-items-center mb-0 gap-2 px-0 ms-2">
                        <input class="form-check-input mt-0" type="checkbox" role="switch" id="eligibleSwitch" v-model="showOnlyEligible" style="width: 2.5em; height: 1.25em; cursor: pointer;">
                        <label class="form-check-label fw-medium user-select-none small" for="eligibleSwitch" style="cursor: pointer;">Quick Eligible</label>
                    </div>
                </div>
            </div>

            <div class="table-responsive border rounded-4 overflow-hidden shadow-sm">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-light">
                        <tr>
                            <th class="ps-4 py-3 border-0 text-secondary small fw-bold text-uppercase">S.No</th>
                            <th class="py-3 border-0 text-secondary small fw-bold text-uppercase">Company</th>
                            <th class="py-3 border-0 text-secondary small fw-bold text-uppercase">Role</th>
                            <th class="py-3 border-0 text-secondary small fw-bold text-uppercase">Requirements</th>
                            <th class="py-3 border-0 text-secondary small fw-bold text-uppercase">Deadline</th>
                            <th class="pe-4 py-3 border-0 text-secondary small fw-bold text-uppercase text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(d, index) in filteredDrives" :key="d.id" :class="{'bg-success-subtle bg-opacity-10': hasApplied(d.id)}">
                            <td class="ps-4 fw-bold text-secondary">{{ index + 1 }}</td>
                            <td>
                                <div class="d-flex align-items-center gap-3">
                                    <div class="bg-light rounded-2 d-flex align-items-center justify-content-center fw-bold text-primary" style="width:32px; height:32px; font-size:0.8rem;">
                                        {{ d.company_name[0] }}
                                    </div>
                                    <span class="fw-bold text-dark">{{ d.company_name }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="fw-medium text-dark">{{ d.job_title }}</div>
                                <div class="d-flex align-items-center gap-2">
                                    <span class="badge bg-light text-dark border smaller" style="font-size: 0.65rem;">{{ d.interview_mode || 'In-Person' }}</span>
                                    <div class="text-secondary smaller text-truncate" style="max-width: 120px;">{{ d.job_description }}</div>
                                </div>
                            </td>
                            <td>
                                <span class="small d-block text-dark fw-medium">{{ d.required_degree || 'All Degrees' }}</span>
                                <span class="smaller text-secondary">{{ d.required_branch || 'All Branches' }} &bull; Min {{ d.min_cgpa }} CGPA</span>
                            </td>
                            <td>
                                <span class="badge rounded-pill px-3" :class="new Date(d.deadline) < new Date() ? 'bg-danger-subtle text-danger' : 'bg-light text-dark border'">
                                    {{ new Date(d.deadline).toLocaleDateString() }}
                                </span>
                            </td>
                            <td class="pe-4 text-end">
                                <div class="d-flex gap-2 justify-content-end">
                                    <button @click="$emit('viewDrive', d)" class="btn btn-sm btn-outline-dark rounded-pill px-3 border-0" title="View Details">
                                        <i class="bi bi-info-circle"></i>
                                    </button>
                                    <button v-if="!hasApplied(d.id)" 
                                            @click="$emit('apply', d.id)" 
                                            class="btn btn-sm rounded-pill px-4 shadow-sm"
                                            :class="!isEligible(d) ? 'btn-outline-danger' : (!profile.resume_url ? 'btn-outline-secondary' : 'btn-dark')"
                                            :disabled="!isEligible(d) || !profile.resume_url">
                                        {{ !isEligible(d) ? 'Not Eligible' : (!profile.resume_url ? 'Upload Resume to Apply' : 'Apply Now') }}
                                    </button>
                                    <span v-else class="badge bg-success text-white rounded-pill px-4 py-2 border-0 fw-bold">
                                        <i class="bi bi-check-circle-fill me-1"></i> Applied
                                    </span>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="filteredDrives.length === 0">
                            <td colspan="6" class="text-center py-5 text-secondary">
                                <div class="mb-2 fs-5">No opportunities found</div>
                                <div class="small">Try adjusting your search or filters to see more results.</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `,
    props: ['drives', 'profile', 'myApplications'],
    data() {
        return {
            searchQuery: '',
            statusFilter: 'All',
            showOnlyEligible: false
        };
    },
    computed: {
        filteredDrives() {
            return this.drives.filter(d => {
                const query = this.searchQuery.toLowerCase();
                const matchesSearch = d.job_title.toLowerCase().includes(query) || 
                                      d.company_name.toLowerCase().includes(query) || 
                                      (d.job_description || '').toLowerCase().includes(query);
                if (this.showOnlyEligible && !this.isEligible(d)) return false;
                if (this.statusFilter === 'Applied' && !this.hasApplied(d.id)) return false;
                if (this.statusFilter === 'Not Applied' && this.hasApplied(d.id)) return false;
                if (this.statusFilter === 'Eligible' && !this.isEligible(d)) return false;
                return matchesSearch;
            });
        }
    },
    methods: {
        isEligible(drive) {
            if (!this.profile.cgpa) return false;
            const meetsCGPA = parseFloat(this.profile.cgpa) >= parseFloat(drive.min_cgpa);
            const meetsDegree = !drive.required_degree || drive.required_degree === 'Any' || drive.required_degree === this.profile.degree;
            const meetsBranch = !drive.required_branch || drive.required_branch === 'Any' || drive.required_branch === this.profile.branch;
            return meetsCGPA && meetsDegree && meetsBranch;
        },
        hasApplied(driveId) {
            return (this.myApplications || []).some(a => a.drive_id === driveId);
        }
    }
};
