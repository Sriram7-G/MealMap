
const { Builder, By, until } = require("selenium-webdriver");

async function testHomepage() {
    let driver;

    try {
        driver = await new Builder()
            .forBrowser("chrome")
            .build();

        console.log("Opening MealMap...");

        await driver.get("http://localhost:8085");

        await driver.wait(
            until.elementLocated(By.css("body")),
            10000
        );

        const title = await driver.getTitle();

        console.log("Page title:", title);

        const heading = await driver.findElement(By.css("h1"));
        console.log("Homepage heading:", await heading.getText());

        console.log("PASS: MealMap homepage loaded successfully.");

    } catch (error) {
        console.error("FAIL:", error.message);

    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

testHomepage();
