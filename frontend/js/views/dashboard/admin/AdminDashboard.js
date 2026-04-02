const AdminDashboard = {
    template: `
        <div class="d-flex" style="min-height: calc(100vh - 72px);">
            <!-- Sidebar Navigation -->
            <div class="bg-white border-end d-flex flex-column py-4" style="width: 240px; min-width: 240px;">
                <div class="px-4 mb-4">
                    <h6 class="fw-bold text-uppercase small text-secondary mb-0">Management</h6>
                </div>
                <nav class="nav flex-column px-3 gap-1">
                    <a v-for="item in sidebarItems" :key="item.key"
                       class="nav-link rounded-3 px-3 py-2 d-flex align-items-center gap-3"
                       :class="activeSection === item.key ? 'bg-dark text-white' : 'text-dark'"
                       href="#" @click.prevent="activeSection = item.key"
                       style="transition: all 0.15s; font-weight: 500; font-size: 0.9rem;">
                        <i :class="item.icon" class="fs-6"></i>
                        <span>{{ item.label }}</span>
                        <span v-if="item.badge !== null" class="badge rounded-pill ms-auto" 
                              :class="activeSection === item.key ? 'bg-white text-dark' : 'bg-dark text-white'" 
                              style="font-size: 0.7rem;">{{ item.badge }}</span>
                    </a>
                </nav>
            </div>

            <!-- Main Content -->
            <div class="flex-grow-1 px-4 px-md-5 py-4 animated-entry" style="overflow-y: auto; background: #fafafa;">

                <!-- ========== OVERVIEW ========== -->
                <div v-show="activeSection === 'overview'">
                    <h4 class="fw-bold mb-1">Overview</h4>
                    <p class="text-secondary mb-4">A snapshot of your institute's placement ecosystem.</p>
                    <div class="row g-4 mb-4">
                        <div class="col-6 col-md-3" v-for="(stat, idx) in statCards" :key="idx">
                            <div class="card border-0 shadow-sm p-3 h-100" 
                                 style="cursor:pointer; transition: transform 0.2s;"
                                 @click="activeSection = stat.section"
                                 @mouseenter="$event.currentTarget.style.transform='translateY(-3px)'"
                                 @mouseleave="$event.currentTarget.style.transform='translateY(0)'">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="rounded-3 d-flex align-items-center justify-content-center" 
                                         :style="'width:44px;height:44px;background:' + stat.bg">
                                        <i :class="stat.icon" class="fs-5" :style="'color:' + stat.color"></i>
                                    </div>
                                    <div>
                                        <div class="text-secondary small fw-bold text-uppercase" style="font-size: 0.75rem;">{{ stat.label }}</div>
                                        <h3 class="fw-bold mb-0" style="letter-spacing: -0.5px;">{{ stat.value }}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row g-4">
                        <div class="col-lg-6">
                            <div class="card border-0 shadow-sm p-4 h-100">
                                <h6 class="fw-bold text-dark mb-3 text-uppercase small">Ecosystem Activity</h6>
                                <div class="row pt-1 w-100 m-0">
                                    <div class="col-6 mb-4">
                                        <div style="position: relative; height: 110px; width: 100%; display: flex; justify-content: center; align-items: center;">
                                            <canvas id="appChart"></canvas>
                                            <div v-if="applications.length === 0" class="position-absolute text-secondary small opacity-50" style="font-size: 0.7rem; pointer-events: none;">No Data</div>
                                        </div>
                                        <div class="text-center mt-3 text-secondary" style="font-size: 0.65rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">App Outcomes</div>
                                    </div>
                                    <div class="col-6 mb-4">
                                        <div style="position: relative; height: 110px; width: 100%; display: flex; justify-content: center; align-items: center;">
                                            <canvas id="companyChart"></canvas>
                                            <div v-if="companies.length === 0" class="position-absolute text-secondary small opacity-50" style="font-size: 0.7rem; pointer-events: none;">No Data</div>
                                        </div>
                                        <div class="text-center mt-3 text-secondary" style="font-size: 0.65rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">Company Status</div>
                                    </div>
                                    <div class="col-6">
                                        <div style="position: relative; height: 110px; width: 100%; display: flex; justify-content: center; align-items: center;">
                                            <canvas id="driveChart"></canvas>
                                            <div v-if="drives.length === 0" class="position-absolute text-secondary small opacity-50" style="font-size: 0.7rem; pointer-events: none;">No Data</div>
                                        </div>
                                        <div class="text-center mt-3 text-secondary" style="font-size: 0.65rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">Placement Drives</div>
                                    </div>
                                    <div class="col-6">
                                        <div style="position: relative; height: 110px; width: 100%; display: flex; justify-content: center; align-items: center;">
                                            <canvas id="studentChart"></canvas>
                                            <div v-if="students.length === 0" class="position-absolute text-secondary small opacity-50" style="font-size: 0.7rem; pointer-events: none;">No Data</div>
                                        </div>
                                        <div class="text-center mt-3 text-secondary" style="font-size: 0.65rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">Active Students</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="card border-0 shadow-sm p-4 h-100">
                                <h6 class="fw-bold text-dark mb-4 text-uppercase small">Placement Pipeline</h6>
                                
                                <div class="mb-4">
                                    <div class="d-flex justify-content-between mb-1">
                                        <span class="small fw-semibold text-secondary">Shortlisted Rate</span>
                                        <span class="small fw-bold text-dark" v-if="applications.length > 0">
                                            {{ applications.filter(a => a.status === 'Shortlisted' || a.status === 'Selected').length }} / {{ applications.length }}
                                            ({{ Math.round((applications.filter(a => a.status === 'Shortlisted' || a.status === 'Selected').length / applications.length) * 100) }}%)
                                        </span>
                                        <span v-else class="small text-secondary italic">No data yet</span>
                                    </div>
                                    <div class="progress" style="height: 8px; background-color: #f3f4f6;">
                                        <div class="progress-bar bg-primary rounded-pill" :style="'width: ' + (applications.length ? (applications.filter(a => a.status === 'Shortlisted' || a.status === 'Selected').length / applications.length) * 100 : 0) + '%'"></div>
                                    </div>
                                </div>

                                <div class="mb-4">
                                    <div class="d-flex justify-content-between mb-1">
                                        <span class="small fw-semibold text-secondary">Selection Rate (Offers)</span>
                                        <span class="small fw-bold text-success" v-if="applications.length > 0">
                                            {{ applications.filter(a => a.status === 'Selected').length }} / {{ applications.length }} 
                                            ({{ Math.round((applications.filter(a => a.status === 'Selected').length / applications.length) * 100) }}%)
                                        </span>
                                        <span v-else class="small text-secondary italic">No data yet</span>
                                    </div>
                                    <div class="progress" style="height: 8px; background-color: #f3f4f6;">
                                        <div class="progress-bar bg-success rounded-pill" :style="'width: ' + (applications.length ? (applications.filter(a => a.status === 'Selected').length / applications.length) * 100 : 0) + '%'"></div>
                                    </div>
                                </div>

                                <div class="mb-2">
                                    <div class="d-flex justify-content-between mb-1">
                                        <span class="small fw-semibold text-secondary">Approved Drives</span>
                                        <span class="small fw-bold text-warning-emphasis" v-if="drives.length > 0">
                                            {{ drives.filter(d => d.status === 'Approved').length }} / {{ drives.length }} 
                                            ({{ Math.round((drives.filter(d => d.status === 'Approved').length / drives.length) * 100) }}%)
                                        </span>
                                        <span v-else class="small text-secondary italic">No data yet</span>
                                    </div>
                                    <div class="progress" style="height: 8px; background-color: #f3f4f6;">
                                        <div class="progress-bar bg-warning rounded-pill" :style="'width: ' + (drives.length ? (drives.filter(d => d.status === 'Approved').length / drives.length) * 100 : 0) + '%'"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ========== COMPANIES ========== -->
                <div v-if="activeSection === 'companies'">
                    <div class="mb-4">
                        <h4 class="fw-bold mb-1">Companies</h4>
                        <p class="text-secondary mb-4">{{ companies.filter(c => !c.is_rejected).length }} registered</p>
                        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                            <div class="input-group shadow-sm" style="max-width: 350px;">
                                <span class="input-group-text bg-white border-end-0 rounded-start-pill ps-3"><i class="bi bi-search text-secondary"></i></span>
                                <input type="text" v-model="searchCompany" placeholder="Search companies..." class="form-control border-start-0 rounded-end-pill py-2" style="box-shadow: none;">
                            </div>
                            <div class="nav nav-pills bg-light p-1 rounded-pill shadow-sm" style="width: fit-content; overflow-x: auto; flex-wrap: nowrap;">
                                <button v-for="s in ['All', 'Approved', 'Pending', 'Rejected', 'Blacklisted']" :key="s" @click="companyFilter = s" class="nav-link rounded-pill px-4 py-2 border-0 small fw-bold flex-shrink-0" :class="companyFilter === s ? 'btn-dark text-white active' : 'text-secondary'">
                                    {{ s }} <span v-if="s !== 'All'" class="badge ms-1 rounded-pill" :class="companyFilter === s ? 'bg-white text-dark' : 'bg-secondary text-white'">
                                        {{ s === 'Approved' ? companies.filter(c => c.is_approved && c.is_active).length : s === 'Pending' ? companies.filter(c => !c.is_approved && !c.is_rejected).length : s === 'Rejected' ? companies.filter(c => c.is_rejected).length : companies.filter(c => !c.is_active).length }}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card border-0 shadow-sm overflow-hidden">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr><th class="ps-4 py-3">Company</th><th class="py-3">Approval</th><th class="py-3">Access</th><th class="py-3 pe-4 text-end">Actions</th></tr>
                                </thead>
                                <tbody>
                                    <tr v-for="c in paginatedCompanies" :key="c.id">
                                        <td class="ps-4 py-3">
                                            <div class="d-flex align-items-center gap-3">
                                                <div class="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold" 
                                                     style="width:38px;height:38px;min-width:38px;font-size:0.85rem;">{{ c.company_name[0] }}</div>
                                                <div>
                                                    <div class="fw-bold text-dark">{{ c.company_name }}</div>
                                                    <div class="text-secondary small">{{ c.hr_contact }} ({{ c.hr_phone }})</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="badge rounded-pill px-3 py-2" :class="c.is_approved ? 'bg-success-subtle text-success' : c.is_rejected ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning-emphasis'">
                                                {{ c.is_approved ? 'Approved' : c.is_rejected ? 'Rejected' : 'Pending' }}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge rounded-pill px-3 py-2" :class="!c.is_active || c.is_rejected ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'">
                                                {{ c.is_rejected ? 'Blocked' : c.is_active ? 'Active' : 'Blacklisted' }}
                                            </span>
                                        </td>
                                        <td class="pe-4 text-end">
                                            <div class="d-flex gap-2 justify-content-end">
                                                <button @click="viewDetail('company', c)" class="btn btn-sm btn-outline-secondary rounded-pill px-3" title="View Details">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                                <template v-if="!c.is_approved && !c.is_rejected">
                                                    <button @click="approveCompany(c.id)" class="btn btn-sm btn-dark rounded-pill px-3">Approve</button>
                                                    <button @click="rejectCompany(c.id)" class="btn btn-sm btn-outline-danger rounded-pill px-3">Reject</button>
                                                </template>
                                                <button v-if="c.is_approved" @click="blacklistUser(c.user_id)" class="btn btn-sm rounded-pill px-3" :class="c.is_active ? 'btn-outline-dark' : 'btn-dark'">
                                                    {{ c.is_active ? 'Blacklist' : 'Activate' }}
                                                </button>
                                                <button v-if="c.is_approved || c.is_rejected" @click="deleteRecord('company', c.id, c.company_name)" class="btn btn-sm btn-outline-danger rounded-pill px-3" title="Delete Company">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr v-if="filteredCompanies.length === 0"><td colspan="4" class="text-center py-5 text-secondary">No companies found.</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div v-if="filteredCompanies.length > pageSize" class="card-footer bg-white border-top d-flex justify-content-between align-items-center px-4 py-3">
                            <span class="text-secondary small">Showing {{ (companyPage - 1) * pageSize + 1 }}–{{ Math.min(companyPage * pageSize, filteredCompanies.length) }} of {{ filteredCompanies.length }}</span>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-outline-dark rounded-pill px-3" :disabled="companyPage <= 1" @click="companyPage--"><i class="bi bi-chevron-left"></i></button>
                                <button class="btn btn-sm btn-outline-dark rounded-pill px-3" :disabled="companyPage >= companyTotalPages" @click="companyPage++"><i class="bi bi-chevron-right"></i></button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ========== STUDENTS ========== -->
                <div v-if="activeSection === 'students'">
                    <div class="mb-4">
                        <h4 class="fw-bold mb-1">Students</h4>
                        <p class="text-secondary mb-4">{{ students.length }} enrolled</p>
                        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                            <div class="input-group shadow-sm" style="max-width: 350px;">
                                <span class="input-group-text bg-white border-end-0 rounded-start-pill ps-3"><i class="bi bi-search text-secondary"></i></span>
                                <input type="text" v-model="searchStudent" placeholder="Search students..." class="form-control border-start-0 rounded-end-pill py-2" style="box-shadow: none;">
                            </div>
                            <div class="nav nav-pills bg-light p-1 rounded-pill shadow-sm" style="width: fit-content; overflow-x: auto; flex-wrap: nowrap;">
                                <button v-for="s in ['All', 'Active', 'Blacklisted']" :key="s" @click="studentFilter = s" class="nav-link rounded-pill px-4 py-2 border-0 small fw-bold flex-shrink-0" :class="studentFilter === s ? 'btn-dark text-white active' : 'text-secondary'">
                                    {{ s }} <span v-if="s !== 'All'" class="badge ms-1 rounded-pill" :class="studentFilter === s ? 'bg-white text-dark' : 'bg-secondary text-white'">
                                        {{ s === 'Active' ? students.filter(student => student.is_active).length : students.filter(student => !student.is_active).length }}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card border-0 shadow-sm overflow-hidden">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr><th class="ps-4 py-3">Student</th><th class="py-3">Branch</th><th class="py-3">CGPA</th><th class="py-3">Status</th><th class="py-3 pe-4 text-end">Actions</th></tr>
                                </thead>
                                <tbody>
                                    <tr v-for="s in paginatedStudents" :key="s.id">
                                        <td class="ps-4 py-3">
                                            <div class="d-flex align-items-center gap-3">
                                                <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold" 
                                                     style="width:38px;height:38px;min-width:38px;background:#fce7f3;color:#db2777;font-size:0.85rem;">{{ s.full_name[0] }}</div>
                                                <div>
                                                    <div class="fw-bold text-dark">{{ s.full_name }}</div>
                                                    <div class="text-secondary small">Class of {{ s.graduation_year }}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="small fw-medium">{{ s.branch }}</td>
                                        <td><span class="badge bg-light text-dark border rounded-pill px-3 py-2">{{ s.cgpa }}</span></td>
                                        <td>
                                            <span class="badge rounded-pill px-3 py-2" :class="s.is_active ? 'bg-primary-subtle text-primary' : 'bg-danger-subtle text-danger'">
                                                {{ s.is_active ? 'Active' : 'Blacklisted' }}
                                            </span>
                                        </td>
                                        <td class="pe-4 text-end">
                                            <div class="d-flex gap-2 justify-content-end">
                                                <button @click="viewDetail('student', s)" class="btn btn-sm btn-outline-secondary rounded-pill px-3" title="View Details">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                                <button @click="blacklistUser(s.user_id)" class="btn btn-sm rounded-pill px-3" :class="s.is_active ? 'btn-outline-dark' : 'btn-dark'">
                                                    {{ s.is_active ? 'Blacklist' : 'Activate' }}
                                                </button>
                                                <button @click="deleteRecord('student', s.id, s.full_name)" class="btn btn-sm btn-outline-danger rounded-pill px-3" title="Delete Student">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr v-if="filteredStudents.length === 0"><td colspan="5" class="text-center py-5 text-secondary">No students found.</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div v-if="filteredStudents.length > pageSize" class="card-footer bg-white border-top d-flex justify-content-between align-items-center px-4 py-3">
                            <span class="text-secondary small">Showing {{ (studentPage - 1) * pageSize + 1 }}–{{ Math.min(studentPage * pageSize, filteredStudents.length) }} of {{ filteredStudents.length }}</span>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-outline-dark rounded-pill px-3" :disabled="studentPage <= 1" @click="studentPage--"><i class="bi bi-chevron-left"></i></button>
                                <button class="btn btn-sm btn-outline-dark rounded-pill px-3" :disabled="studentPage >= studentTotalPages" @click="studentPage++"><i class="bi bi-chevron-right"></i></button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ========== DRIVES ========== -->
                <div v-if="activeSection === 'drives'">
                    <div class="mb-4">
                        <h4 class="fw-bold mb-1">Placement Drives</h4>
                        <p class="text-secondary mb-4">{{ drives.length }} total · {{ drives.filter(d => d.status === 'Pending').length }} pending</p>
                        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                            <div class="input-group shadow-sm" style="max-width: 350px;">
                                <span class="input-group-text bg-white border-end-0 rounded-start-pill ps-3"><i class="bi bi-search text-secondary"></i></span>
                                <input type="text" v-model="searchDrive" placeholder="Search placement drives..." class="form-control border-start-0 rounded-end-pill py-2" style="box-shadow: none;">
                            </div>
                            <div class="nav nav-pills bg-light p-1 rounded-pill shadow-sm" style="width: fit-content; overflow-x: auto; flex-wrap: nowrap;">
                                <button v-for="s in ['All', 'Approved', 'Pending', 'Rejected']" :key="s" @click="driveFilter = s" class="nav-link rounded-pill px-4 py-2 border-0 small fw-bold flex-shrink-0" :class="driveFilter === s ? 'btn-dark text-white active' : 'text-secondary'">
                                    {{ s }} <span v-if="s !== 'All'" class="badge ms-1 rounded-pill" :class="driveFilter === s ? 'bg-white text-dark' : 'bg-secondary text-white'">
                                        {{ drives.filter(d => d.status === s).length }}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card border-0 shadow-sm overflow-hidden">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr><th class="ps-4 py-3">Job / Company</th><th class="py-3">Status</th><th class="py-3 pe-4 text-end">Actions</th></tr>
                                </thead>
                                <tbody>
                                    <tr v-for="d in paginatedDrives" :key="d.id">
                                        <td class="ps-4 py-3">
                                            <div class="d-flex align-items-center gap-3">
                                                <div class="rounded-3 bg-light d-flex align-items-center justify-content-center fw-bold" 
                                                     style="width:38px;height:38px;min-width:38px;font-size:0.85rem;">{{ d.company_name ? d.company_name[0] : '?' }}</div>
                                                <div>
                                                    <div class="fw-bold text-dark">{{ d.job_title }}</div>
                                                    <div class="text-secondary small">{{ d.company_name }}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="badge rounded-pill px-3 py-2" 
                                                  :class="d.status === 'Approved' ? 'bg-success-subtle text-success' : d.status === 'Rejected' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning-emphasis'">
                                                {{ d.status }}
                                            </span>
                                        </td>
                                        <td class="pe-4 text-end">
                                            <div class="d-flex gap-2 justify-content-end">
                                                <button @click="viewDetail('drive', d)" class="btn btn-sm btn-outline-secondary rounded-pill px-3" title="View Details">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                                <template v-if="d.status === 'Pending'">
                                                    <button @click="updateDrive(d.id, 'Approved')" class="btn btn-sm btn-dark rounded-pill px-3">Approve</button>
                                                    <button @click="updateDrive(d.id, 'Rejected')" class="btn btn-sm btn-outline-danger rounded-pill px-3">Reject</button>
                                                </template>
                                                <button v-if="d.status !== 'Pending'" @click="deleteRecord('drive', d.id, d.job_title)" class="btn btn-sm btn-outline-danger rounded-pill px-3" title="Delete Drive">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr v-if="filteredDrives.length === 0"><td colspan="3" class="text-center py-5 text-secondary">No drives found.</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div v-if="filteredDrives.length > pageSize" class="card-footer bg-white border-top d-flex justify-content-between align-items-center px-4 py-3">
                            <span class="text-secondary small">Showing {{ (drivePage - 1) * pageSize + 1 }}–{{ Math.min(drivePage * pageSize, filteredDrives.length) }} of {{ filteredDrives.length }}</span>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-outline-dark rounded-pill px-3" :disabled="drivePage <= 1" @click="drivePage--"><i class="bi bi-chevron-left"></i></button>
                                <button class="btn btn-sm btn-outline-dark rounded-pill px-3" :disabled="drivePage >= driveTotalPages" @click="drivePage++"><i class="bi bi-chevron-right"></i></button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ========== APPLICATIONS ========== -->
                <div v-if="activeSection === 'applications'">
                    <div class="mb-4">
                        <h4 class="fw-bold mb-1">All Applications</h4>
                        <p class="text-secondary mb-4">{{ applications.length }} total submissions</p>
                        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                            <div class="input-group shadow-sm" style="max-width: 350px;">
                                <span class="input-group-text bg-white border-end-0 rounded-start-pill ps-3"><i class="bi bi-search text-secondary"></i></span>
                                <input type="text" v-model="searchApplication" placeholder="Search applications..." class="form-control border-start-0 rounded-end-pill py-2" style="box-shadow: none;">
                            </div>
                            <div class="nav nav-pills bg-light p-1 rounded-pill shadow-sm" style="width: fit-content; overflow-x: auto; flex-wrap: nowrap;">
                                <button v-for="s in ['All', 'Applied', 'Shortlisted', 'Selected', 'Rejected']" :key="s" @click="appFilter = s" class="nav-link rounded-pill px-4 py-2 border-0 small fw-bold flex-shrink-0" :class="appFilter === s ? 'btn-dark text-white active' : 'text-secondary'">
                                    {{ s }} <span v-if="s !== 'All'" class="badge ms-1 rounded-pill" :class="appFilter === s ? 'bg-white text-dark' : 'bg-secondary text-white'">
                                        {{ applications.filter(a => a.status === s).length }}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card border-0 shadow-sm overflow-hidden">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr><th class="ps-4 py-3">Student</th><th class="py-3">Drive</th><th class="py-3">Status</th><th class="py-3 pe-4 text-end">Actions</th></tr>
                                </thead>
                                <tbody>
                                    <tr v-for="app in paginatedApplications" :key="app.id">
                                        <td class="ps-4 py-3">
                                            <div class="d-flex align-items-center gap-3">
                                                <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold" 
                                                     style="width:38px;height:38px;min-width:38px;background:#dbeafe;color:#2563eb;font-size:0.85rem;">{{ app.student_name ? app.student_name[0] : '?' }}</div>
                                                <div class="fw-bold text-dark">{{ app.student_name }}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="fw-medium text-dark">{{ app.job_title }}</div>
                                            <div class="text-secondary small">{{ app.company_name }}</div>
                                        </td>
                                        <td>
                                            <span class="badge rounded-pill px-3 py-2" 
                                                  :class="app.status === 'Selected' ? 'bg-success-subtle text-success' : app.status === 'Rejected' ? 'bg-danger-subtle text-danger' : 'bg-secondary-subtle text-secondary'">
                                                {{ app.status }}
                                            </span>
                                        </td>
                                        <td class="pe-4 text-end">
                                            <button @click="viewDetail('application', app)" class="btn btn-sm btn-outline-secondary rounded-pill px-3" title="View Details">
                                                <i class="bi bi-eye"></i>
                                            </button>
                                            <button @click="deleteRecord('application', app.id, app.student_name + ' @ ' + app.company_name)" class="btn btn-sm btn-outline-danger rounded-pill px-3" title="Delete Application">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="filteredApplications.length === 0"><td colspan="4" class="text-center py-5 text-secondary">No applications found matching your criteria.</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div v-if="filteredApplications.length > pageSize" class="card-footer bg-white border-top d-flex justify-content-between align-items-center px-4 py-3">
                            <span class="text-secondary small">Showing {{ (appPage - 1) * pageSize + 1 }}–{{ Math.min(appPage * pageSize, filteredApplications.length) }} of {{ filteredApplications.length }}</span>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-outline-dark rounded-pill px-3" :disabled="appPage <= 1" @click="appPage--"><i class="bi bi-chevron-left"></i></button>
                                <button class="btn btn-sm btn-outline-dark rounded-pill px-3" :disabled="appPage >= appTotalPages" @click="appPage++"><i class="bi bi-chevron-right"></i></button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- ========== DETAIL MODAL (Teleported) ========== -->
            <teleport to="body">
                <div v-if="detailItem" class="modal show d-block" style="background: rgba(0,0,0,0.45); overflow-y: auto; z-index: 2000;" @click.self="detailItem = null">
                    <div class="modal-dialog modal-dialog-centered" style="max-width: 520px;">
                        <div class="modal-content border-0 rounded-4 shadow-lg">
                            <!-- Header -->
                            <div class="modal-header border-0 px-4 pt-4 pb-2">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="rounded-3 d-flex align-items-center justify-content-center" 
                                         :style="'width:44px;height:44px;background:' + detailMeta.bg">
                                        <i :class="detailMeta.icon" class="fs-5" :style="'color:' + detailMeta.color"></i>
                                    </div>
                                    <div>
                                        <h5 class="fw-bold mb-0">{{ detailMeta.title }}</h5>
                                        <span class="text-secondary small">{{ detailMeta.subtitle }}</span>
                                    </div>
                                </div>
                                <button type="button" class="btn-close" @click="detailItem = null"></button>
                            </div>

                            <!-- Body -->
                            <div class="modal-body px-4 pb-4 pt-3">
                                <div class="d-flex flex-column gap-3">
                                    <div v-for="field in detailFields" :key="field.label" class="d-flex justify-content-between align-items-start py-2 border-bottom">
                                        <span class="text-secondary small fw-bold text-uppercase" style="min-width: 120px;">{{ field.label }}</span>
                                        <span class="text-dark fw-medium text-end" style="word-break: break-word; max-width: 300px;">
                                            <span v-if="field.badge" class="badge rounded-pill px-3 py-2" :class="field.badgeClass">{{ field.value }}</span>
                                            <a v-else-if="field.link" :href="field.href || field.value" target="_blank" class="text-primary fw-bold text-decoration-none d-inline-flex align-items-center gap-1 justify-content-end">
                                                <i v-if="field.icon" :class="field.icon"></i> {{ field.value }}
                                            </a>
                                            <span v-else>{{ field.value || 'N/A' }}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
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
                                <button @click="confirmModal.show = false" class="btn btn-light rounded-pill px-4 py-2 fw-medium" style="min-width: 120px;">Cancel</button>
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
            activeSection: 'overview',
            stats: { total_students: 0, total_companies: 0, total_drives: 0 },
            companies: [],
            students: [],
            drives: [],
            applications: [],
            searchCompany: '',
            searchStudent: '',
            searchDrive: '',
            searchApplication: '',
            companyFilter: 'All',
            studentFilter: 'All',
            driveFilter: 'All',
            appFilter: 'All',
            chartInstance: null,
            pageSize: 10,
            companyPage: 1,
            studentPage: 1,
            drivePage: 1,
            appPage: 1,
            detailItem: null,
            detailType: '',
            confirmModal: {
                show: false,
                title: '',
                message: '',
                icon: '',
                iconBg: '',
                iconColor: '',
                btnText: '',
                btnClass: '',
                action: null
            }
        }
    },
    computed: {
        sidebarItems() {
            return [
                { key: 'overview', label: 'Overview', icon: 'bi bi-grid-1x2-fill', badge: null },
                { key: 'companies', label: 'Companies', icon: 'bi bi-building', badge: null },
                { key: 'students', label: 'Students', icon: 'bi bi-mortarboard-fill', badge: null },
                { key: 'drives', label: 'Drives', icon: 'bi bi-briefcase-fill', badge: null },
                { key: 'applications', label: 'Applications', icon: 'bi bi-file-earmark-person-fill', badge: null }
            ];
        },
        statCards() {
            return [
                { label: 'Students', value: this.stats.total_students, icon: 'bi bi-mortarboard-fill', bg: '#fce7f3', color: '#db2777', section: 'students' },
                { label: 'Companies', value: this.stats.total_companies, icon: 'bi bi-building', bg: '#e0f2fe', color: '#0284c7', section: 'companies' },
                { label: 'Drives', value: this.stats.total_drives, icon: 'bi bi-briefcase-fill', bg: '#fef3c7', color: '#d97706', section: 'drives' },
                { label: 'Applications', value: this.applications.length, icon: 'bi bi-file-earmark-person-fill', bg: '#dbeafe', color: '#2563eb', section: 'applications' }
            ];
        },
        filteredCompanies() {
            let filtered = this.companies;
            if (this.companyFilter !== 'All') {
                if (this.companyFilter === 'Approved') filtered = filtered.filter(c => c.is_approved && c.is_active);
                else if (this.companyFilter === 'Pending') filtered = filtered.filter(c => !c.is_approved && !c.is_rejected);
                else if (this.companyFilter === 'Rejected') filtered = filtered.filter(c => c.is_rejected);
                else if (this.companyFilter === 'Blacklisted') filtered = filtered.filter(c => !c.is_active);
            }
            if (!this.searchCompany) return filtered;
            const q = this.searchCompany.toLowerCase();
            return filtered.filter(c => c.company_name.toLowerCase().includes(q) || c.hr_contact.toLowerCase().includes(q));
        },
        filteredStudents() {
            let filtered = this.students;
            if (this.studentFilter !== 'All') {
                if (this.studentFilter === 'Active') filtered = filtered.filter(s => s.is_active);
                else if (this.studentFilter === 'Blacklisted') filtered = filtered.filter(s => !s.is_active);
            }
            if (!this.searchStudent) return filtered;
            const q = this.searchStudent.toLowerCase();
            return filtered.filter(s => s.full_name.toLowerCase().includes(q) || s.branch.toLowerCase().includes(q));
        },
        filteredDrives() {
            let filtered = this.drives;
            if (this.driveFilter !== 'All') {
                filtered = filtered.filter(d => d.status === this.driveFilter);
            }
            if (!this.searchDrive) return filtered;
            const q = this.searchDrive.toLowerCase();
            return filtered.filter(d => d.job_title.toLowerCase().includes(q) || (d.company_name && d.company_name.toLowerCase().includes(q)));
        },
        filteredApplications() {
            let filtered = this.applications;
            if (this.appFilter !== 'All') {
                filtered = filtered.filter(a => a.status === this.appFilter);
            }
            if (!this.searchApplication) return filtered;
            const q = this.searchApplication.toLowerCase();
            return filtered.filter(a => 
                (a.student_name && a.student_name.toLowerCase().includes(q)) || 
                (a.job_title && a.job_title.toLowerCase().includes(q)) ||
                (a.company_name && a.company_name.toLowerCase().includes(q))
            );
        },
        companyTotalPages() { return Math.ceil(this.filteredCompanies.length / this.pageSize); },
        studentTotalPages() { return Math.ceil(this.filteredStudents.length / this.pageSize); },
        driveTotalPages() { return Math.ceil(this.filteredDrives.length / this.pageSize); },
        appTotalPages() { return Math.ceil(this.filteredApplications.length / this.pageSize); },
        paginatedCompanies() { return this.filteredCompanies.slice((this.companyPage - 1) * this.pageSize, this.companyPage * this.pageSize); },
        paginatedStudents() { return this.filteredStudents.slice((this.studentPage - 1) * this.pageSize, this.studentPage * this.pageSize); },
        paginatedDrives() { return this.filteredDrives.slice((this.drivePage - 1) * this.pageSize, this.drivePage * this.pageSize); },
        paginatedApplications() { return this.filteredApplications.slice((this.appPage - 1) * this.pageSize, this.appPage * this.pageSize); },

        detailMeta() {
            if (!this.detailItem) return {};
            const map = {
                company: { title: this.detailItem.company_name, subtitle: 'Company Details', icon: 'bi bi-building', bg: '#e0f2fe', color: '#0284c7' },
                student: { title: this.detailItem.full_name, subtitle: 'Student Profile', icon: 'bi bi-mortarboard-fill', bg: '#fce7f3', color: '#db2777' },
                drive: { title: this.detailItem.job_title, subtitle: 'Drive Details', icon: 'bi bi-briefcase-fill', bg: '#fef3c7', color: '#d97706' },
                application: { title: this.detailItem.student_name, subtitle: 'Application Details', icon: 'bi bi-file-earmark-person-fill', bg: '#dbeafe', color: '#2563eb' }
            };
            return map[this.detailType] || {};
        },
        detailFields() {
            if (!this.detailItem) return [];
            const d = this.detailItem;
            if (this.detailType === 'company') {
                return [
                    { label: 'Company Name', value: d.company_name },
                    { label: 'HR Contact', value: d.hr_contact + (d.hr_phone ? ' (' + d.hr_phone + ')' : '') },
                    { label: 'Website', value: d.website || 'Not provided', link: !!d.website },
                    { label: 'Approval', value: d.is_approved ? 'Approved' : d.is_rejected ? 'Rejected' : 'Pending', badge: true, badgeClass: d.is_approved ? 'bg-success-subtle text-success' : d.is_rejected ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning-emphasis' },
                    { label: 'Access', value: d.is_rejected ? 'Blocked' : d.is_active ? 'Active' : 'Blacklisted', badge: true, badgeClass: !d.is_active || d.is_rejected ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary' }
                ];
            }
            if (this.detailType === 'student') {
                return [
                    { label: 'Full Name', value: d.full_name },
                    { label: 'College', value: d.college_name || 'Not provided' },
                    { label: 'Degree', value: d.degree || 'N/A' },
                    { label: 'Branch', value: d.branch },
                    { label: 'CGPA', value: d.cgpa },
                    { label: 'Graduation', value: d.graduation_year },
                    { label: 'Resume', value: d.resume_url ? 'View Resume' : 'Not Uploaded', link: !!d.resume_url, href: d.resume_url, icon: 'bi bi-file-earmark-pdf' },
                    { label: 'Status', value: d.is_active ? 'Active' : 'Blacklisted', badge: true, badgeClass: d.is_active ? 'bg-primary-subtle text-primary' : 'bg-danger-subtle text-danger' }
                ];
            }
            if (this.detailType === 'drive') {
                return [
                    { label: 'Job Title', value: d.job_title },
                    { label: 'Company', value: d.company_name },
                    { label: 'Job Description', value: d.job_description || 'No description' },
                    { label: 'Interview Mode', value: d.interview_mode || 'In-Person', badge: true, badgeClass: 'bg-light text-dark border' },
                    { label: 'Degree Req.', value: d.required_degree || 'All Degrees' },
                    { label: 'Branch Req.', value: d.required_branch || 'All Branches' },
                    { label: 'Min CGPA', value: d.min_cgpa || '0' },
                    { label: 'Deadline', value: d.deadline ? new Date(d.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A' },
                    { label: 'Status', value: d.status, badge: true, badgeClass: d.status === 'Approved' ? 'bg-success-subtle text-success' : d.status === 'Rejected' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning-emphasis' }
                ];
            }
            if (this.detailType === 'application') {
                return [
                    { label: 'Student', value: d.student_name },
                    { label: 'College', value: d.college_name || 'Not provided' },
                    { label: 'Job Title', value: d.job_title },
                    { label: 'Company', value: d.company_name },
                    { label: 'Resume', value: d.resume_url ? 'View Resume' : 'Not Uploaded', link: !!d.resume_url, href: d.resume_url, icon: 'bi bi-file-earmark-pdf' },
                    { label: 'Applied On', value: d.applied_on ? new Date(d.applied_on).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : 'N/A' },
                    { label: 'Status', value: d.status, badge: true, badgeClass: d.status === 'Selected' ? 'bg-success-subtle text-success' : d.status === 'Rejected' ? 'bg-danger-subtle text-danger' : 'bg-secondary-subtle text-secondary' }
                ];
            }
            return [];
        }
    },
    watch: {
        searchCompany() { this.companyPage = 1; },
        searchStudent() { this.studentPage = 1; },
        searchDrive() { this.drivePage = 1; },
        searchApplication() { this.appPage = 1; }
    },
    async mounted() {
        await this.fetchData();
        this.$nextTick(() => { this.renderChart(); });
    },
    methods: {
        viewDetail(type, item) {
            this.detailType = type;
            this.detailItem = item;
        },
        async fetchData() {
            try {
                this.stats = (await axios.get('/api/admin/stats')).data;
                this.companies = (await axios.get('/api/admin/companies')).data;
                this.students = (await axios.get('/api/admin/students')).data;
                this.drives = (await axios.get('/api/admin/drives')).data;
                this.applications = (await axios.get('/api/admin/applications')).data;
                
                this.renderChart();
            } catch (err) {
                console.error(err);
            }
        },
        renderChart() {
            if (this.appChart) this.appChart.destroy();
            if (this.companyChart) this.companyChart.destroy();
            if (this.driveChart) this.driveChart.destroy();
            if (this.studentChart) this.studentChart.destroy();

            const commonOptions = {
                responsive: true, maintainAspectRatio: false, cutout: '75%',
                plugins: { legend: { display: false }, tooltip: { bodyFont: { family: 'Inter' }, callbacks: { label: function(c) { return ' ' + c.label + ': ' + c.raw; } } } }
            };

            const ctxApp = document.getElementById('appChart');
            if (ctxApp) {
                const appStats = ['Applied', 'Shortlisted', 'Selected', 'Rejected'].map(s => this.applications.filter(a => a.status === s).length);
                const hasData = appStats.reduce((a, b) => a + b, 0) > 0;
                this.appChart = new Chart(ctxApp, {
                    type: 'doughnut',
                    data: { 
                        labels: hasData ? ['Applied', 'Shortlisted', 'Selected', 'Rejected'] : ['No Data'],
                        datasets: [{ 
                            data: hasData ? appStats : [1], 
                            backgroundColor: hasData ? ['#9ca3af', '#3b82f6', '#10b981', '#ef4444'] : ['#f3f4f6'],
                            borderWidth: 0, hoverOffset: hasData ? 4 : 0 
                        }] 
                    },
                    options: commonOptions
                });
            }

            const ctxComp = document.getElementById('companyChart');
            if (ctxComp) {
                const compStats = [
                    this.companies.filter(c => c.is_approved && c.is_active).length,
                    this.companies.filter(c => !c.is_approved && !c.is_rejected).length,
                    this.companies.filter(c => !c.is_active).length
                ];
                const hasData = compStats.reduce((a, b) => a + b, 0) > 0;
                this.companyChart = new Chart(ctxComp, {
                    type: 'doughnut',
                    data: { 
                        labels: hasData ? ['Approved', 'Pending', 'Blacklisted'] : ['No Data'],
                        datasets: [{ 
                            data: hasData ? compStats : [1], 
                            backgroundColor: hasData ? ['#10b981', '#f59e0b', '#1f2937'] : ['#f3f4f6'],
                            borderWidth: 0, hoverOffset: hasData ? 4 : 0 
                        }] 
                    },
                    options: commonOptions
                });
            }

            const ctxDrive = document.getElementById('driveChart');
            if (ctxDrive) {
                const driveStats = ['Approved', 'Pending', 'Rejected'].map(s => this.drives.filter(d => d.status === s).length);
                const hasData = driveStats.reduce((a, b) => a + b, 0) > 0;
                this.driveChart = new Chart(ctxDrive, {
                    type: 'doughnut',
                    data: { 
                        labels: hasData ? ['Approved', 'Pending', 'Rejected'] : ['No Data'],
                        datasets: [{ 
                            data: hasData ? driveStats : [1], 
                            backgroundColor: hasData ? ['#10b981', '#f59e0b', '#ef4444'] : ['#f3f4f6'],
                            borderWidth: 0, hoverOffset: hasData ? 4 : 0 
                        }] 
                    },
                    options: commonOptions
                });
            }

            const ctxStudent = document.getElementById('studentChart');
            if (ctxStudent) {
                const studentStats = [this.students.filter(s => s.is_active).length, this.students.filter(s => !s.is_active).length];
                const hasData = studentStats.reduce((a, b) => a + b, 0) > 0;
                this.studentChart = new Chart(ctxStudent, {
                    type: 'doughnut',
                    data: { 
                        labels: hasData ? ['Active', 'Blacklisted'] : ['No Data'],
                        datasets: [{ 
                            data: hasData ? studentStats : [1], 
                            backgroundColor: hasData ? ['#3b82f6', '#ef4444'] : ['#f3f4f6'],
                            borderWidth: 0, hoverOffset: hasData ? 4 : 0 
                        }] 
                    },
                    options: commonOptions
                });
            }
        },
        showConfirm(opts) {
            this.confirmModal = { show: true, ...opts };
        },
        async executeConfirm() {
            if (this.confirmModal.action) await this.confirmModal.action();
            this.confirmModal.show = false;
            await this.fetchData();
        },
        deleteRecord(type, id, name) {
            const config = {
                company: { url: '/api/admin/companies/', label: 'Company' },
                student: { url: '/api/admin/students/', label: 'Student' },
                drive: { url: '/api/admin/drives/', label: 'Drive' },
                application: { url: '/api/admin/applications/', label: 'Application' }
            }[type];
            this.showConfirm({
                title: 'Delete ' + config.label,
                message: `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`,
                icon: 'bi bi-exclamation-triangle-fill', iconBg: '#fee2e2', iconColor: '#dc2626',
                btnText: 'Yes, Delete', btnClass: 'btn-danger',
                action: async () => { await axios.delete(config.url + id); }
            });
        },
        approveCompany(id) {
            this.showConfirm({
                title: 'Approve Company',
                message: 'This company will be able to post placement drives and recruit students. Proceed?',
                icon: 'bi bi-check-circle-fill', iconBg: '#dcfce7', iconColor: '#16a34a',
                btnText: 'Yes, Approve', btnClass: 'btn-dark',
                action: async () => { await axios.post('/api/admin/companies/' + id + '/approve'); }
            });
        },
        rejectCompany(id) {
            this.showConfirm({
                title: 'Reject Company',
                message: 'This company will be moved to the rejected list. You can still approve it later or delete it permanently.',
                icon: 'bi bi-x-circle-fill', iconBg: '#fee2e2', iconColor: '#dc2626',
                btnText: 'Yes, Reject', btnClass: 'btn-danger',
                action: async () => { await axios.post('/api/admin/companies/' + id + '/reject'); }
            });
        },
        blacklistUser(id) {
            const user = this.companies.find(c => c.user_id === id) || this.students.find(s => s.user_id === id);
            const isActive = user ? user.is_active : true;
            this.showConfirm({
                title: isActive ? 'Blacklist User' : 'Activate User',
                message: isActive
                    ? 'This user will lose access to the platform immediately. You can reactivate them later.'
                    : 'This user will regain full access to the platform.',
                icon: isActive ? 'bi bi-shield-slash' : 'bi bi-shield-check',
                iconBg: isActive ? '#fef3c7' : '#dcfce7',
                iconColor: isActive ? '#d97706' : '#16a34a',
                btnText: isActive ? 'Yes, Blacklist' : 'Yes, Activate',
                btnClass: isActive ? 'btn-dark' : 'btn-success',
                action: async () => { await axios.post('/api/admin/users/' + id + '/blacklist'); }
            });
        },
        updateDrive(id, status) {
            const isApprove = status === 'Approved';
            this.showConfirm({
                title: isApprove ? 'Approve Drive' : 'Reject Drive',
                message: isApprove
                    ? 'This drive will become visible to students and open for applications.'
                    : 'This drive will be moved to the rejected list. You can still approve it later or delete it permanently.',
                icon: isApprove ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill',
                iconBg: isApprove ? '#dcfce7' : '#fee2e2',
                iconColor: isApprove ? '#16a34a' : '#dc2626',
                btnText: isApprove ? 'Yes, Approve' : 'Yes, Reject',
                btnClass: isApprove ? 'btn-dark' : 'btn-danger',
                action: async () => { await axios.post('/api/admin/drives/' + id + '/' + status); }
            });
        }
    }
};
