const Home = {
    template: `
        <div class="container-fluid px-4 px-md-5 py-5">
            <div class="row align-items-center min-vh-75">
                <div class="col-lg-7 text-center text-lg-start mb-5 mb-lg-0">
                    <h1 class="display-3 fw-bold mb-4">Elevate your <br>career path.</h1>
                    <p class="lead text-secondary mb-5 fs-4">
                        The definitive bridge between ambitious students and industry leaders. <br>
                        Simplify your recruitment process with a platform built for the future of hiring.
                    </p>
                    <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                        <router-link to="/register" class="btn btn-dark btn-lg px-5 py-3">Create your profile</router-link>
                        <router-link to="/login" class="btn btn-outline-dark btn-lg px-5 py-3">Browse jobs</router-link>
                    </div>
                </div>
                <div class="col-lg-5 position-relative">
                    <div class="pill-container">
                        <div class="floating-pill" style="top: 10%; left: 10%; transition-delay: 0.1s;">Software Engineer</div>
                        <div class="floating-pill" style="top: 30%; right: 5%; transition-delay: 0.5s;">Product Manager</div>
                        <div class="floating-pill" style="bottom: 20%; left: 15%; transition-delay: 0.9s;">Data Scientist</div>
                        <div class="floating-pill" style="top: 60%; left: 5%; transition-delay: 1.3s;">UX Designer</div>
                        <div class="floating-pill" style="bottom: 40%; right: 10%; transition-delay: 1.7s;">Frontend Dev</div>
                        <div class="floating-pill" style="top: 15%; right: 30%; transition-delay: 2.1s;">Backend Expert</div>
                    </div>
                </div>
            </div>

            <div class="row mt-5 pt-5 border-top">
                <div class="col-12 text-center">
                    <h2 class="fw-bold mb-4">Where startups and job seekers connect</h2>
                    <div class="d-flex flex-wrap justify-content-center gap-4 py-4">
                        <div class="p-3 border rounded-3 bg-light px-4 fw-medium text-secondary">Web3</div>
                        <div class="p-3 border rounded-3 bg-light px-4 fw-medium text-secondary">SaaS</div>
                        <div class="p-3 border rounded-3 bg-light px-4 fw-medium text-secondary">Fintech</div>
                        <div class="p-3 border rounded-3 bg-light px-4 fw-medium text-secondary">E-commerce</div>
                        <div class="p-3 border rounded-3 bg-light px-4 fw-medium text-secondary">AI / ML</div>
                    </div>
                </div>
            </div>
        </div>
    `
};
