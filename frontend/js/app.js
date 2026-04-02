const NotFound = {
    template: `
        <div class="d-flex flex-column align-items-center justify-content-center text-center py-5 animated-entry" style="min-height: 60vh;">
            <div class="mb-4" style="font-size: 5rem; color: #dc2626;">
                <i class="bi bi-shield-lock-fill"></i>
            </div>
            <h1 class="fw-bold mb-3">Access Denied / Not Found</h1>
            <p class="text-secondary mb-4" style="max-width: 450px; margin: 0 auto;">
                The dashboard or page you are trying to access does not exist, or you do not have the required authorization to view it.
            </p>
            <router-link to="/" class="btn btn-dark rounded-pill px-5 py-3 fw-bold shadow-sm">Return to Safety</router-link>
        </div>
    `
};

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login, meta: { guest: true } },
    { path: '/register', component: Register, meta: { guest: true } },
    { path: '/admin', component: AdminDashboard, meta: { requiresAuth: true, role: 'admin' } },
    { path: '/company', component: CompanyDashboard, meta: { requiresAuth: true, role: 'company' } },
    { path: '/company/drives', component: ManageDrives, meta: { requiresAuth: true, role: 'company' } },
    { path: '/company/drives/:id/candidates', component: ReviewCandidates, meta: { requiresAuth: true, role: 'company' } },
    { path: '/student', component: StudentDashboard, meta: { requiresAuth: true, role: 'student' } },
    { path: '/:pathMatch(.*)*', component: NotFound }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (to.meta.requiresAuth && (!token || !user)) {
        next('/login');
    } else if (to.meta.guest && token && user) {
        next('/' + user.role);
    } else if (to.meta.requiresAuth && to.meta.role && user && to.meta.role !== user.role) {
        next('/' + user.role);
    } else {
        next();
    }
});

axios.interceptors.response.use(response => response, error => {
    if (error.response && (error.response.status === 401 || error.response.status === 422)) {
        // Don't redirect if the error came from an auth endpoint (login/register) —
        // those pages handle their own error display.
        const url = error.config?.url || '';
        if (!url.includes('/api/auth/')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});

const app = Vue.createApp({
    data() {
        return {
            isAuthenticated: false,
            user: null
        }
    },
    computed: {
        dashboardRoute() {
            if (!this.user) return '/login';
            return `/${this.user.role}`;
        },
        showFooter() {
            const path = this.$route.path;
            return !(path.startsWith('/admin') || path.startsWith('/company') || path.startsWith('/student'));
        }
    },
    created() {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            this.isAuthenticated = true;
            this.user = JSON.parse(userStr);
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        }
    },
    methods: {
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.isAuthenticated = false;
            this.user = null;
            delete axios.defaults.headers.common['Authorization'];
            this.$router.push('/login');
        }
    }
});

app.use(router);
app.component('navbar', Navbar);
app.component('app-footer', Footer);
app.mount('#app');
