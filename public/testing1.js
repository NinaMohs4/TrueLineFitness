// admin sign in and creation of new class

const puppeteer = require("puppeteer");

async function go() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
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
  await page.click("#admin-link");

  // CREATE A CLASS ********************************************
  await page.click(
    "#admin > section > div > div > div > div.box.is-fullheight > div.has-text-centered.mt-4 > button"
  );
  await page.type(
    "#addClassForm > div:nth-child(1) > div > input",
    "Test Class"
  );
  await page.type("#addClassForm > div:nth-child(2) > div > input", "2:30 PM");
  await page.type("#new_class_date", "05012025");
  await page.type("#new_class_instructor", "Jenner McLeod");

  // click submit button
  await page.click(
    "#addClassForm > div.field.is-grouped.is-justify-content-center > div:nth-child(1) > button"
  );

  //   close browser
  //   browser.close();
}

// call go
go();
