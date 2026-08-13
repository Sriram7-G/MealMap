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

    if (guests === "" || guests <= 0) {
        alert("Please enter the number of guests.");
        return;
    }


    alert(
        `Searching for caterers in ${location} ` +
        `for a ${eventType} with ${guests} guests.`
    );
}