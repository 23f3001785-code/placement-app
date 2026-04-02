const Navbar = {
    template: `
        <nav class="navbar navbar-expand-lg bg-white sticky-top wf-navbar py-3 border-bottom">
            <div class="container-fluid px-4 px-md-5">
                <router-link class="navbar-brand text-dark me-5 d-flex align-items-center gap-2 text-decoration-none" to="/">
                    <div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#1ea7fd,#2563eb);display:flex;align-items:center;justify-content:center;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L3 7v2h18V7l-9-5z" fill="white" opacity="0.9"/>
                            <rect x="5" y="11" width="4" height="9" rx="1" fill="white" opacity="0.7"/>
                            <rect x="10" y="11" width="4" height="9" rx="1" fill="white"/>
                            <rect x="15" y="11" width="4" height="9" rx="1" fill="white" opacity="0.7"/>
                        </svg>
                    </div>
                    <span style="font-size:1.35rem;font-weight:800;letter-spacing:-0.03em;">Insti<span style="background:linear-gradient(135deg,#1ea7fd,#2563eb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">hire</span></span>
                </router-link>
                
                <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <div class="collapse navbar-collapse" id="navbarContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0 wf-nav-links">
                        <li class="nav-item">
                            <router-link class="nav-link text-dark fw-medium mx-2" to="/">Explore</router-link>
                        </li>
                        <li v-if="!isAuthenticated" class="nav-item">
                            <router-link class="nav-link text-dark fw-medium mx-2" to="/register">Candidates</router-link>
                        </li>
                        <li v-if="!isAuthenticated" class="nav-item">
                            <router-link class="nav-link text-dark fw-medium mx-2" to="/register">Recruiters</router-link>
                        </li>
                        <li v-if="isAuthenticated" class="nav-item">
                            <router-link class="nav-link text-dark fw-medium mx-2" :to="dashboardRoute">Dashboard</router-link>
                        </li>
                    </ul>
                    
                    <div class="d-flex align-items-center auth-buttons">
                        <template v-if="!isAuthenticated">
                            <router-link to="/login" class="btn btn-outline-dark fw-semibold mx-2 rounded-pill px-4">Log In</router-link>
                            <router-link to="/register" class="btn btn-dark fw-semibold rounded-pill px-4">Sign Up</router-link>
                        </template>
                        <template v-else>
                            <span class="me-3 fw-medium text-dark"><i class="bi bi-person-circle"></i> {{ user.username }} ({{ user.role }})</span>
                            <button @click="logout" class="btn btn-outline-dark fw-semibold rounded-pill px-4">Logout</button>
                        </template>
                    </div>
                </div>
            </div>
        </nav>
    `,
    computed: {
        isAuthenticated() {
            return this.$root.isAuthenticated;
        },
        user() {
            return this.$root.user;
        },
        dashboardRoute() {
            return this.$root.dashboardRoute;
        }
    },
    methods: {
        logout() {
            this.$root.logout();
        }
    }
};
