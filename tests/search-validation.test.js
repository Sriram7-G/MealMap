
const { Builder, By, until } = require("selenium-webdriver");

async function testSearchValidation() {
    let driver;

    try {
        driver = await new Builder()
            .forBrowser("chrome")
            .build();

        await driver.get("http://localhost:8085");

        // Trigger search without entering any details.
        await driver.executeScript("searchCaterers()");

        // Verify the validation alert.
        const alert = await driver.wait(
            until.alertIsPresent(),
            5000
        );

        const alertText = await alert.getText();

        if (alertText === "Please enter your location.") {
            console.log("PASS: Search validation works correctly.");
        } else {
            throw new Error("Unexpected alert: " + alertText);
        }

        await alert.accept();

    } catch (error) {
        console.error("FAIL:", error.message);

    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

testSearchValidation();
