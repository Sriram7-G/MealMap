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


    if (location === "") {

        alert("Please enter your location.");

        return;
    }


    if (eventType === "") {

        alert("Please select your event type.");

        return;
    }


    if (guests === "" || Number(guests) <= 0) {

        alert("Please enter the number of guests.");

        return;
    }


    alert(
        `Searching for caterers in ${location} ` +
        `for a ${eventType} with ${guests} guests.`
    );

}


/* =========================
   REGISTRATION MODAL
========================= */

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
   LOGIN MODAL
========================= */

function openLoginModal() {
    document.getElementById("loginModal").style.display = "flex";
}

function closeLoginModal() {
    document.getElementById("loginModal").style.display = "none";
}


/* =========================
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

        if (response.ok) {
            message.textContent = `Welcome back, ${data.user.name}!`;

            document.getElementById("loginForm").reset();

            setTimeout(function () {
                closeLoginModal();
                message.textContent = "";
            }, 1500);

        } else {
            message.textContent = data.message || "Login failed.";
        }

    } catch (error) {
        console.error("Login error:", error);
        message.textContent = "Unable to connect to the server.";
    }
});