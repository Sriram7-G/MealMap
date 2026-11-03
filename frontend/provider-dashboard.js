
let editingMenuId = null;

/* =========================
   AUTHENTICATION
========================= */

function getAuthToken() {
    return localStorage.getItem("token");
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
        console.error("Unable to read stored user:", error);
        return null;
    }
}

/* =========================
   MESSAGE HANDLING
========================= */

function showMessage(element, message, success = false) {
    if (!element) return;

    element.textContent = message;
    element.style.color = success ? "green" : "#d93025";
}

/* =========================
   API REQUEST HANDLER
========================= */

async function menuRequest(url, options = {}) {
    const token = getAuthToken();

    if (!token) {
        throw new Error("Your session is missing. Please log in again.");
    }

    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
    };

    // Only add JSON content type when sending a JSON body.
    if (options.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    let response;

    try {
        response = await fetch(url, {
            ...options,
            headers
        });
    } catch (error) {
        console.error("API network error:", error);
        throw new Error("Unable to connect to the server. Please try again.");
    }

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("The server returned an invalid response.");
    }

    if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
    }

    if (response.status === 403) {
        throw new Error("You are not authorized to perform this action.");
    }

    if (!response.ok) {
        throw new Error(data.message || `Request failed (${response.status}).`);
    }

    return data;
}

/* =========================
   LOAD PROVIDER MENUS
========================= */

async function loadProviderMenus() {
    const list = document.getElementById("providerMenuList");
    const message = document.getElementById("menusMessage");

    if (!list || !message) {
        console.error("Provider menu HTML elements were not found.");
        return;
    }

    list.replaceChildren();
    message.textContent = "Loading your menus...";

    try {
        const data = await menuRequest("/api/menus/mine");
        const menus = Array.isArray(data.menus) ? data.menus : [];

        message.textContent = menus.length
            ? `${menus.length} menu(s) found`
            : "You haven't added any menus yet.";

        menus.forEach(menu => {
            const card = document.createElement("article");
            card.className = "provider-menu-card";

            if (menu.imageUrl) {
                try {
                    const url = new URL(menu.imageUrl);

                    if (["https:", "http:"].includes(url.protocol)) {
                        const image = document.createElement("img");
                        image.src = url.href;
                        image.alt = menu.name || "Menu image";
                        image.loading = "lazy";
                        image.className = "provider-menu-image";
                        card.appendChild(image);
                    }
                } catch {
                    console.warn("Invalid menu image URL:", menu.imageUrl);
                }
            }

            const title = document.createElement("h4");
            title.textContent = menu.name || "Untitled menu";

            const description = document.createElement("p");
            description.textContent =
                menu.description || "No description provided.";

            const details = document.createElement("p");
            details.textContent =
                `${menu.category || "Uncategorized"} · ` +
                `${menu.foodType || "Not specified"} · ` +
                `₹${menu.pricePerPlate ?? 0}/plate`;

            const guests = document.createElement("p");
            guests.textContent =
                `Minimum guests: ${menu.minGuests ?? "Not specified"}`;

            const availability = document.createElement("p");
            availability.textContent = menu.isAvailable
                ? "Available for booking"
                : "Currently unavailable";

            const actions = document.createElement("div");
            actions.className = "menu-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "login-btn";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => editMenu(menu));

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-menu-btn";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => {
                deleteMenu(menu._id);
            });

            actions.append(editButton, deleteButton);

            card.append(
                title,
                description,
                details,
                guests,
                availability,
                actions
            );

            list.appendChild(card);
        });

    } catch (error) {
        console.error("Loading menus failed:", error);
        message.textContent = error.message;
    }
}

/* =========================
   CREATE / UPDATE MENU
========================= */

function initializeMenuForm() {
    const menuForm = document.getElementById("menuForm");

    if (!menuForm) {
        console.error("Menu form not found.");
        return;
    }

    menuForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const message = document.getElementById("menuMessage");
        const submitButton = document.getElementById("menuSubmitButton");

        if (!submitButton) {
            showMessage(message, "Submit button not found.");
            return;
        }

        const menu = {
            name: document.getElementById("menuName")?.value.trim() || "",
            description:
                document.getElementById("menuDescription")?.value.trim() || "",
            category:
                document.getElementById("menuCategory")?.value || "",
            pricePerPlate: Number(
                document.getElementById("menuPrice")?.value
            ),
            foodType:
                document.getElementById("menuFoodType")?.value || "",
            minGuests: Number(
                document.getElementById("menuMinGuests")?.value
            ),
            imageUrl:
                document.getElementById("menuImageUrl")?.value.trim() || "",
            isAvailable:
                document.getElementById("menuAvailable")?.checked ?? true
        };

        if (
            !menu.name ||
            !menu.category ||
            !menu.foodType ||
            !Number.isFinite(menu.pricePerPlate) ||
            menu.pricePerPlate < 1 ||
            !Number.isFinite(menu.minGuests) ||
            menu.minGuests < 1
        ) {
            showMessage(message, "Please enter valid menu details.");
            return;
        }

        submitButton.disabled = true;

        try {
            const isEditing = Boolean(editingMenuId);

            const url = isEditing
                ? `/api/menus/${encodeURIComponent(editingMenuId)}`
                : "/api/menus";

            const data = await menuRequest(url, {
                method: isEditing ? "PUT" : "POST",
                body: JSON.stringify(menu)
            });

            showMessage(
                message,
                data.message ||
                    (isEditing ? "Menu updated successfully!" : "Menu added successfully!"),
                true
            );

            resetMenuForm();
            await loadProviderMenus();

        } catch (error) {
            console.error("Saving menu failed:", error);
            showMessage(message, error.message);

        } finally {
            submitButton.disabled = false;

            submitButton.textContent = editingMenuId
                ? "Save Changes"
                : "Add Menu";
        }
    });
}

/* =========================
   EDIT MENU
========================= */

function editMenu(menu) {
    if (!menu || !menu._id) {
        console.error("Invalid menu selected for editing.");
        return;
    }

    editingMenuId = menu._id;

    document.getElementById("menuName").value = menu.name || "";
    document.getElementById("menuDescription").value =
        menu.description || "";
    document.getElementById("menuCategory").value = menu.category || "";
    document.getElementById("menuPrice").value =
        menu.pricePerPlate ?? "";
    document.getElementById("menuFoodType").value = menu.foodType || "";
    document.getElementById("menuMinGuests").value =
        menu.minGuests ?? 10;
    document.getElementById("menuImageUrl").value = menu.imageUrl || "";
    document.getElementById("menuAvailable").checked =
        menu.isAvailable ?? true;

    document.getElementById("menuFormTitle").textContent = "Edit Menu";
    document.getElementById("menuSubmitButton").textContent = "Save Changes";
    document.getElementById("cancelMenuEdit").hidden = false;
    document.getElementById("menuMessage").textContent = "";

    document.getElementById("menuForm").scrollIntoView({
        behavior: "smooth"
    });
}

/* =========================
   RESET MENU FORM
========================= */

function resetMenuForm() {
    editingMenuId = null;

    const form = document.getElementById("menuForm");

    if (!form) return;

    form.reset();

    const minGuests = document.getElementById("menuMinGuests");
    const available = document.getElementById("menuAvailable");

    if (minGuests) minGuests.value = 10;
    if (available) available.checked = true;

    const title = document.getElementById("menuFormTitle");
    const submitButton = document.getElementById("menuSubmitButton");
    const cancelButton = document.getElementById("cancelMenuEdit");
    const message = document.getElementById("menuMessage");

    if (title) title.textContent = "Add a New Menu";
    if (submitButton) submitButton.textContent = "Add Menu";
    if (cancelButton) cancelButton.hidden = true;
    if (message) message.textContent = "";
}

/* =========================
   DELETE MENU
========================= */

async function deleteMenu(menuId) {
    if (!menuId) return;

    if (!confirm("Are you sure you want to delete this menu?")) {
        return;
    }

    const message = document.getElementById("menusMessage");

    try {
        const data = await menuRequest(
            `/api/menus/${encodeURIComponent(menuId)}`,
            { method: "DELETE" }
        );

        showMessage(
            message,
            data.message || "Menu deleted successfully.",
            true
        );

        if (String(editingMenuId) === String(menuId)) {
            resetMenuForm();
        }

        await loadProviderMenus();

    } catch (error) {
        console.error("Deleting menu failed:", error);
        showMessage(message, error.message);
    }
}

/* =========================
   LOGOUT
========================= */

  function logoutUser() {
    console.trace("LOGOUT WAS CALLED");
    alert("Unexpected logout call!");
}

// Support HTML inline onclick="logoutUser()"

/* =========================
   INITIALIZE PROVIDER DASHBOARD
========================= */

function initializeProviderDashboard() {
    console.log("🔥 PROVIDER DASHBOARD SCRIPT EXECUTED");
console.log("CURRENT URL:", window.location.href);
console.log("STORAGE:", {
    token: !!localStorage.getItem("token"),
    user: localStorage.getItem("user")
});
    console.log("PROVIDER DASHBOARD INITIALIZED");

    console.log("DASHBOARD SESSION:", {
        user: getCurrentUser(),
        tokenExists: Boolean(getAuthToken())
    });

    /*
       IMPORTANT:
       Do not redirect based on localStorage here.

       The backend endpoint /api/menus/mine validates
       the JWT and provider role.

       This avoids the previous redirect loop.
    */

    initializeMenuForm();

    const cancelEditButton = document.getElementById("cancelMenuEdit");

    if (cancelEditButton) {
        cancelEditButton.addEventListener("click", resetMenuForm);
    }

    loadProviderMenus();
}

// Works whether this script loads before or after DOMContentLoaded.
if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeProviderDashboard,
        { once: true }
    );
} else {
    initializeProviderDashboard();
}
