// testing user sign up, sign in and creation of review

const puppeteer = require("puppeteer");

async function go() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 200,
  });

  const page = await browser.newPage();

  //   enter page URL
  await page.goto("https://is424project-79c6d.web.app/");

  // SIGN UP ********************************************
  await page.click("#signupbtn");

  // provide email and pw for sign-in
  await page.type("#email_", "testing@gmail.com");
  await page.type("#password_", "test123");

  //   click submit button
  await page.click("#signup_form > div:nth-child(3) > div > button");

  // force a delay
  await new Promise((r) => setTimeout(r, 1000));

  // SIGN IN ********************************************
  await page.click("#signinbtn");

  // provide email and pw for sign-in
  await page.type("#email_", "testing@gmail.com");
  await page.type("#password_", "test123");

  //   click submit button
  await page.click("#signin_form > div:nth-child(3) > div > button");

  // click user page
  await page.click("#userProfileBtn");

  // LEAVE A REVIEW ********************************************
  await page.type(
    "body > section > div > div > div:nth-child(3) > div > form > div:nth-child(1) > div > input",
    "In-Class Test"
  );
  await page.click(
    "body > section > div > div > div:nth-child(3) > div > form > div:nth-child(2) > div > label:nth-child(5) > input[type=radio]"
  );
  await page.type(
    "body > section > div > div > div:nth-child(3) > div > form > div:nth-child(3) > div > textarea",
    "TEST! I loved my class with True Line Fitness!"
  );

  // click submit button
  await page.click(
    "body > section > div > div > div:nth-child(3) > div > form > div.field.is-grouped.is-justify-content-center > div > button"
  );

  //   close browser
  //   browser.close();
}

// call go
go();
