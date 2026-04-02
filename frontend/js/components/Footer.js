const Footer = {
    template: `
        <footer class="bg-white border-top py-5 mt-5">
            <div class="container px-4 px-md-5">
                <div class="row g-4">
                    <div class="col-lg-4">
                        <router-link class="text-dark d-flex align-items-center gap-2 text-decoration-none mb-3" to="/">
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
                        <p class="text-secondary small pe-lg-5">
                            Revolutionizing campus placements by connecting the next generation of talent 
                            with world-class opportunities. Built for students, powered by innovation.
                        </p>
                        <div class="d-flex gap-3 mt-4">
                            <a href="#" class="text-secondary fs-5"><i class="bi bi-twitter-x"></i></a>
                            <a href="#" class="text-secondary fs-5"><i class="bi bi-linkedin"></i></a>
                            <a href="#" class="text-secondary fs-5"><i class="bi bi-github"></i></a>
                            <a href="#" class="text-secondary fs-5"><i class="bi bi-instagram"></i></a>
                        </div>
                    </div>
                    <div class="col-6 col-lg-2 ms-lg-auto">
                        <h6 class="fw-bold mb-3 small text-uppercase">For Candidates</h6>
                        <ul class="list-unstyled small">
                            <li class="mb-2"><router-link to="/register" class="text-secondary text-decoration-none">Create Profile</router-link></li>
                            <li class="mb-2"><router-link to="/login" class="text-secondary text-decoration-none">Browse Jobs</router-link></li>
                            <li class="mb-2"><a href="#" class="text-secondary text-decoration-none">Interview Prep</a></li>
                            <li class="mb-2"><a href="#" class="text-secondary text-decoration-none">Career Advice</a></li>
                        </ul>
                    </div>
                    <div class="col-6 col-lg-2">
                        <h6 class="fw-bold mb-3 small text-uppercase">For Companies</h6>
                        <ul class="list-unstyled small">
                            <li class="mb-2"><router-link to="/register" class="text-secondary text-decoration-none">Hire Talent</router-link></li>
                            <li class="mb-2"><a href="#" class="text-secondary text-decoration-none">Post a Job</a></li>
                            <li class="mb-2"><a href="#" class="text-secondary text-decoration-none">Recruitment Tools</a></li>
                            <li class="mb-2"><router-link to="/login" class="text-secondary text-decoration-none">Admin Login</router-link></li>
                        </ul>
                    </div>
                    <div class="col-6 col-lg-2">
                        <h6 class="fw-bold mb-3 small text-uppercase">Company</h6>
                        <ul class="list-unstyled small">
                            <li class="mb-2"><a href="#" class="text-secondary text-decoration-none">About Us</a></li>
                            <li class="mb-2"><a href="#" class="text-secondary text-decoration-none">Contact Support</a></li>
                            <li class="mb-2"><a href="#" class="text-secondary text-decoration-none">Privacy Policy</a></li>
                            <li class="mb-2"><a href="#" class="text-secondary text-decoration-none">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div class="row mt-5 pt-4 border-top">
                    <div class="col-md-6 text-center text-md-start">
                        <p class="text-secondary small mb-0">© 2026 Instihire Inc. All rights reserved.</p>
                    </div>
                    <div class="col-md-6 text-center text-md-end mt-2 mt-md-0">
                        <p class="text-secondary small mb-0 pe-1">Empowering careers through seamless recruitment.</p>
                    </div>
                </div>
            </div>
        </footer>
    `
};
