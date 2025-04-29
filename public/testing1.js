// admin sign in and creation of new class

const puppeteer = require("puppeteer");

async function go() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 200,
  });

  const page = await browser.newPage();

  //   enter page URL
  await page.goto("https://is424project-79c6d.web.app/");

  // force a delay
  await new Promise((r) => setTimeout(r, 1000));

  // ADMIN SIGN IN ********************************************
  await page.click("#signinbtn");

  // provide email and pw for sign in
  await page.type("#email_", "admin@gmail.com");
  await page.type("#password_", "admin123");

  //   click submit button
  await page.click("#signin_form > div:nth-child(3) > div > button");

  // click admin page
  await page.click("#adminProfileBtn");

  // CREATE A CLASS ********************************************
  await page.click(
    "body > section > div > div > div:nth-child(1) > div > div.has-text-centered.mt-4 > button"
  );
  await page.type(
    "#addClassModal > div.modal-content.box > form > div:nth-child(1) > div > input",
    "Test Class"
  );
  await page.type(
    "#addClassModal > div.modal-content.box > form > div:nth-child(2) > div > input",
    "2:30 PM"
  );
  await page.type(
    "#addClassModal > div.modal-content.box > form > div:nth-child(3) > div > input",
    "2025-05-01"
  );

  // click submit button
  await page.click(
    "#addClassModal > div.modal-content.box > form > div.field.is-grouped.is-justify-content-center > div:nth-child(1) > button"
  );

  //   close browser
  //   browser.close();
}

// call go
go();
