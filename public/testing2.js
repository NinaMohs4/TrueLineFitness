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

  // provide information for sign up
  await page.type("#signup_name", "In-Class Test");
  await page.type("#signup_phone", "123-456-7890");
  await page.type("#email", "testing@gmail.com");
  await page.type("#password", "test123");

  //   click submit button
  await page.click("#signup_form > div:nth-child(5) > div > button");

  // force a delay
  await new Promise((r) => setTimeout(r, 1000));

  // click user page
  await page.click("#user-link");

  // LEAVE A REVIEW ********************************************
  await page.type("#review_name", "In-Class Test");
  await page.click("#review_rating");
  await page.type(
    "#fitness_review",
    "TEST! I loved my class with True Line Fitness!"
  );

  // click submit button
  await page.click(
    "#review_form > div.field.is-grouped.is-justify-content-center > div > button"
  );

  //   close browser
  //   browser.close();
}

// call go
go();
