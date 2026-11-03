
/* =========================
   SEARCH CATERERS
========================= */

function searchCaterers() {
    const location =
        document.getElementById("location").value.trim();

    const eventType =
        document.getElementById("eventType").value;

    const guests =
        document.getElementById("guests").value;

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

    const query = encodeURIComponent(
        `caterers near ${location}`
    );

   const mapsUrl =
    `https://www.google.com/search?q=${query}`;
document.getElementById("mealMapFrame").src =
    `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;

document.getElementById("map").scrollIntoView({
    behavior: "smooth"
});


/* =========================
   REGISTRATION MODAL
=========function search================ */

function openRegisterModal() {

    const modal =
        document.getElementById("registerModal");

    modal.style.display = "flex";

}


function closeRegisterModal() {

    const modal =
        document.getElementById("registerModal");

    modal.style.display = "none";

}


/* =========================
   CLOSE MODAL OUTSIDE
========================= */

window.addEventListener("click", function (event) {

    const modal =
        document.getElementById("registerModal");

    if (event.target === modal) {

        closeRegisterModal();

    }

});


/* =========================
   USER REGISTRATION
========================= */

document
    .getElementById("registerForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();


        const name =
            document
                .getElementById("registerName")
                .value
                .trim();


        const email =
            document
                .getElementById("registerEmail")
                .value
                .trim();


        const password =
            document
                .getElementById("registerPassword")
                .value;


        const message =
            document.getElementById("registerMessage");


        const submitButton =
            document.querySelector(".register-submit");


        /* Clear previous message */

        message.textContent = "";

        message.style.color = "";


        /* Frontend validation */

        if (!name || !email || !password) {

            message.textContent =
                "Please fill in all fields.";

            message.style.color = "#d93025";

            return;
        }


        if (password.length < 6) {

            message.textContent =
                "Password must be at least 6 characters.";

            message.style.color = "#d93025";

            return;
        }


        /* Disable button */

        submitButton.disabled = true;

        submitButton.textContent =
            "Creating Account...";


        try {

            const response =
                await fetch("/api/auth/register", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        email: email,

                        password: password

                    })

                });


            const data =
                await response.json();


            /* Successful registration */

            if (response.ok) {

                message.textContent =
                    "Account created successfully! 🎉";

                message.style.color = "green";


                document
                    .getElementById("registerForm")
                    .reset();


                setTimeout(function () {

                    closeRegisterModal();

                    message.textContent = "";

                }, 1500);

            }


            /* Registration failed */

            else {

                message.textContent =
                    data.message ||
                    "Registration failed.";

                message.style.color =
                    "#d93025";

            }


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            message.textContent =
                "Unable to connect to the server.";

            message.style.color =
                "#d93025";

        }


        finally {

            submitButton.disabled = false;

            submitButton.textContent =
                "Create Account";

        }

    });
    
/* =========================
   SERVICE PROVIDER MODAL
========================= */

function openProviderModal() {
    document.getElementById("providerModal").style.display = "flex";
}

function closeProviderModal() {
    document.getElementById("providerModal").style.display = "none";
}
    /* =========================
   LOGIN MODAL
========================= */

function openLoginModal() {
    document.getElementById("loginModal").style.display = "flex";
}

function closeLoginModal() {
    document.getElementById("loginModal").style.display = "none";
}


/* =========================
   CLOSE PROVIDER MODAL
========================= */

window.addEventListener("click", function (event) {
    const modal = document.getElementById("providerModal");

    if (event.target === modal) {
        closeProviderModal();
    }
});


/* =========================
   SERVICE PROVIDER REGISTRATION
========================= */

document
    .getElementById("providerForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const businessName = document.getElementById("businessName").value.trim();
        const ownerName = document.getElementById("ownerName").value.trim();
        const email = document.getElementById("providerEmail").value.trim();
        const phone = document.getElementById("providerPhone").value.trim();
        const password = document.getElementById("providerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const businessType = document.getElementById("businessType").value;
        const address = document.getElementById("providerAddress").value.trim();
        const city = document.getElementById("providerCity").value.trim();
        const description = document.getElementById("providerDescription").value.trim();

        const message = document.getElementById("providerMessage");
        const submitButton = document.querySelector(".provider-submit");

        message.textContent = "";
        message.style.color = "";

        // Validate fields
        if (
            !businessName || !ownerName || !email ||
            !phone || !password || !confirmPassword ||
            !businessType || !address || !city || !description
        ) {
            message.textContent = "Please fill in all fields.";
            message.style.color = "#d93025";
            return;
        }

        if (password.length < 6) {
            message.textContent = "Password must be at least 6 characters.";
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
                message.textContent = "Business registered successfully!";
                message.style.color = "green";

                document.getElementById("providerForm").reset();

                setTimeout(function () {
                    closeProviderModal();
                    message.textContent = "";
                }, 1500);

            } else {
                message.textContent = data.message || "Registration failed.";
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
   LOGIN
========================= */

document.getElementById("loginForm").addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");

    if (!email || !password) {
        message.textContent = "Please enter email and password.";
        return;
    }

   
try {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    const data = await response.json();
    console.log("LOGIN RESPONSE:", {
    success: response.ok,
    role: data.user?.role,
    tokenExists: !!data.token
});

    if (response.ok) {

        // Save authentication token
        localStorage.setItem("token", data.token);

        // Save logged-in user information
        localStorage.setItem("user", JSON.stringify(data.user));

        message.textContent = `Welcome back, ${data.user.name}!`;

        document.getElementById("loginForm").reset();

        setTimeout(function () {
            closeLoginModal();

            // Redirect according to user role
            if (data.user.role === "provider") {
                window.location.href = "/provider-dashboard.html";
            } else {
                window.location.href = "/index.html";
            }

        }, 1000);

    } else {
        message.textContent = data.message || "Login failed.";
    }

} catch (error) {
    console.error("Login error:", error);
    message.textContent = "Unable to connect to the server.";
}
});
