document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.getElementById("hamburger");
    const navUl = document.querySelector("nav ul");

    if (hamburger && navUl) {
        // Buat overlay jika belum ada di DOM
        let overlay = document.querySelector(".nav-overlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "nav-overlay";
            document.body.appendChild(overlay);
        }

        function toggleMenu() {
            const isOpen = navUl.classList.toggle("show");
            overlay.classList.toggle("show", isOpen);
            hamburger.textContent = isOpen ? "✕" : "☰";
            hamburger.setAttribute("aria-expanded", isOpen);
        }

        hamburger.addEventListener("click", toggleMenu);
        overlay.addEventListener("click", toggleMenu);

        // Tutup menu jika tautan navigasi di dalamnya diklik
        const navLinks = navUl.querySelectorAll("a");
        navLinks.forEach(function (link) {
            link.addEventListener("click", function () {
                if (navUl.classList.contains("show")) {
                    toggleMenu();
                }
            });
        });
    }
});
