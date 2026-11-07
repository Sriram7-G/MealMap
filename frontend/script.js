
/* =========================
   SEARCH CATERERS
========================= */

function searchCaterers() {
    const location = document.getElementById("location").value.trim();
    const eventType = document.getElementById("eventType").value;
    const guests = document.getElementById("guests").value;

    if (!location) {
        alert("Please enter your location.");
        return;
    }

    if (!eventType) {
        alert("Please select your event type.");
        return;
    }

    if (guests === "" || Number(guests) <= 0) {
        alert("Please enter the number of guests.");
        return;
    }

    const mapFrame = document.getElementById("mealMapFrame");
    const mapSection = document.getElementById("map");

    if (mapFrame) {
        mapFrame.src =
            `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;
    }

    if (mapSection) {
        mapSection.scrollIntoView({ behavior: "smooth" });
    }
}


/* =========================
   CUSTOMER REGISTRATION MODAL
========================= */

function openRegisterModal() {
    const modal = document.getElementById("registerModal");

    if (modal) {
        modal.style.display = "flex";
    }
}

function closeRegisterModal() {
    const modal = document.getElementById("registerModal");

    if (modal) {
        modal.style.display = "none";
    }
}


/* =========================
   LOGIN MODAL
========================= */

function openLoginModal() {
    const modal = document.getElementById("loginModal");

    if (modal) {
        modal.style.display = "flex";
    }
}

function closeLoginModal() {
    const modal = document.getElementById("loginModal");

    if (modal) {
        modal.style.display = "none";
    }
}


/* =========================
   SERVICE PROVIDER MODAL
========================= */

function openProviderModal() {
    const modal = document.getElementById("providerModal");

    if (modal) {
        modal.style.display = "flex";
    }
}

function closeProviderModal() {
    const modal = document.getElementById("providerModal");

    if (modal) {
        modal.style.display = "none";
    }
}


/* =========================
   MODAL INITIALIZATION
========================= */

document.addEventListener("DOMContentLoaded", function () {

    // Close modals when clicking outside their content.
    window.addEventListener("click", function (event) {

        const registerModal = document.getElementById("registerModal");
        const loginModal = document.getElementById("loginModal");
        const providerModal = document.getElementById("providerModal");

        if (event.target === registerModal) {
            closeRegisterModal();
        }

        if (event.target === loginModal) {
            closeLoginModal();
        }

        if (event.target === providerModal) {
            closeProviderModal();
        }
    });


    /* =========================
       CUSTOMER REGISTRATION
    ========================= */

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const name = document.getElementById("registerName").value.trim();
            const email = document.getElementById("registerEmail").value.trim();
            const password = document.getElementById("registerPassword").value;

            const message = document.getElementById("registerMessage");
            const submitButton = registerForm.querySelector(".register-submit");

            message.textContent = "";
            message.style.color = "";

            if (!name || !email || !password) {
                message.textContent = "Please fill in all fields.";
                message.style.color = "#d93025";
                return;
            }

            if (password.length < 6) {
                message.textContent = "Password must be at least 6 characters.";
                message.style.color = "#d93025";
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = "Creating Account...";

            try {
                const response = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                });

                const data = await response.json();

                if (response.ok) {

                    message.textContent = "Account created successfully! 🎉";
                    message.style.color = "green";

                    registerForm.reset();

                    setTimeout(function () {
                        closeRegisterModal();
                        message.textContent = "";
                    }, 1500);

                } else {
                    message.textContent =
                        data.message || "Registration failed.";

                    message.style.color = "#d93025";
                }

            } catch (error) {
                console.error("Registration error:", error);

                message.textContent = "Unable to connect to the server.";
                message.style.color = "#d93025";

            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Create Account";
            }
        });
    }


    /* =========================
       SERVICE PROVIDER REGISTRATION
    ========================= */

    const providerForm = document.getElementById("providerForm");

    if (providerForm) {
        providerForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const businessName =
                document.getElementById("businessName").value.trim();

            const ownerName =
                document.getElementById("ownerName").value.trim();

            const email =
                document.getElementById("providerEmail").value.trim();

            const phone =
                document.getElementById("providerPhone").value.trim();

            const password =
                document.getElementById("providerPassword").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;

            const businessType =
                document.getElementById("businessType").value;

            const address =
                document.getElementById("providerAddress").value.trim();

            const city =
                document.getElementById("providerCity").value.trim();

            const description =
                document.getElementById("providerDescription").value.trim();

            const message =
                document.getElementById("providerMessage");

            const submitButton =
                providerForm.querySelector(".provider-submit");

            message.textContent = "";
            message.style.color = "";

            if (
                !businessName ||
                !ownerName ||
                !email ||
                !phone ||
                !password ||
                !confirmPassword ||
                !businessType ||
                !address ||
                !city ||
                !description
            ) {
                message.textContent = "Please fill in all fields.";
                message.style.color = "#d93025";
                return;
            }

            if (password.length < 6) {
                message.textContent =
                    "Password must be at least 6 characters.";

                message.style.color = "#d93025";
                return;
            }

            if (password !== confirmPassword) {
                message.textContent = "Passwords do not match.";
                message.style.color = "#d93025";
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = "Registering...";

            try {
                const response = await fetch("/api/provider/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        businessName,
                        ownerName,
                        email,
                        phone,
                        password,
                        confirmPassword,
                        businessType,
                        address,
                        city,
                        description
                    })
                });

                const data = await response.json();

                if (response.ok) {

                    message.textContent =
                        "Business registered successfully!";

                    message.style.color = "green";

                    providerForm.reset();

                    setTimeout(function () {
                        closeProviderModal();
                        message.textContent = "";
                    }, 1500);

                } else {
                    message.textContent =
                        data.message || "Registration failed.";

                    message.style.color = "#d93025";
                }

            } catch (error) {
                console.error("Provider registration error:", error);

                message.textContent = "Unable to connect to the server.";
                message.style.color = "#d93025";

            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Register Business";
            }
        });
    }


    /* =========================
       USER LOGIN
    ========================= */

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const email =
                document.getElementById("loginEmail").value.trim();

            const password =
                document.getElementById("loginPassword").value;

            const message =
                document.getElementById("loginMessage");

            message.textContent = "";
            message.style.color = "";

            if (!email || !password) {
                message.textContent =
                    "Please enter email and password.";

                message.style.color = "#d93025";
                return;
            }

            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });

                const data = await response.json();

                console.log("LOGIN RESPONSE:", {
                    success: response.ok,
                    role: data.user?.role,
                    tokenExists: !!data.token
                });

                if (response.ok) {

                    // Save authentication token.
                    localStorage.setItem("token", data.token);

                    // Save logged-in user information.
                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );

                    message.textContent =
                        `Welcome back, ${data.user.name}!`;

                    loginForm.reset();

                    setTimeout(function () {

                        closeLoginModal();

                        // Redirect according to user role.
                        if (data.user.role === "provider") {
                            window.location.href =
                                "/provider-dashboard.html";
                        } else {
                            window.location.href = "/index.html";
                        }

                    }, 1000);

                } else {
                    message.textContent =
                        data.message || "Login failed.";

                    message.style.color = "#d93025";
                }

            } catch (error) {
                console.error("Login error:", error);

                message.textContent =
                    "Unable to connect to the server.";

                message.style.color = "#d93025";
            }
        });
    }

});


/* =========================
   EXPOSE MODAL FUNCTIONS
   FOR INLINE HTML ONCLICK
========================= */

window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;

window.openRegisterModal = openRegisterModal;
window.closeRegisterModal = closeRegisterModal;

window.openProviderModal = openProviderModal;
window.closeProviderModal = closeProviderModal;
