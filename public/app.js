// global variables

let signupbtn = document.querySelector("#signupbtn");
let signup_modal = document.querySelector("#signup_modal");
let signup_modalbg = document.querySelector("#signup_modalbg");

let signinbtn = document.querySelector("#signinbtn");
let signin_modal = document.querySelector("#signin_modal");
let signin_modalbg = document.querySelector("#signin_modalbg");

let postHousingBtn = document.querySelector("#postHousingBtn");
let hidden_form = document.querySelector("#hidden_form");
let content = document.querySelector("#content");

// functions

function renderOptions(data) {
  const contentDiv = document.getElementById("content");
  contentDiv.innerHTML = ""; // Clear existing content

  if (data.length > 0) {
    data.forEach((option) => {
      contentDiv.innerHTML += `
        <div class="box">
          <h3 class="title is-5">${option.name}</h3>
          <p>Type: ${
            option.type.charAt(0).toUpperCase() + option.type.slice(1)
          }</p>
          <p>Price: ${option.price}</p>
          <p>Bedrooms: ${option.onebed ? "One bedroom/studio, " : ""}${
        option.twobed ? "Two bedrooms, " : ""
      }${option.threebed ? "Three bedrooms, " : ""}${
        option.fourbed ? "Four bedrooms, " : ""
      }${option.fiveplusbed ? "Five or more bedrooms" : ""}</p>
          <p>Amenities: ${Object.keys(option)
            .filter(
              (key) =>
                option[key] &&
                [
                  "ac",
                  "commonareas",
                  "laundry",
                  "gym",
                  "furnished",
                  "parking",
                  "dining",
                ].includes(key)
            )
            .map((key) => {
              switch (key) {
                case "ac":
                  return "Air Conditioning";
                case "commonareas":
                  return "Common Areas";
                case "laundry":
                  return "Laundry";
                case "gym":
                  return "Gym";
                case "furnished":
                  return "Furnished";
                case "parking":
                  return "Parking";
                case "dining":
                  return "Dining";
                default:
                  return key.replace(/_/g, " "); // Handles other cases if any
              }
            })
            .join(", ")}</p>

        </div>`;
    });
  } else {
    contentDiv.innerHTML = "<p>No matching results found.</p>";
  }
}

function del_doc(id) {
  db.collection("housing")
    .doc(id)
    .delete()
    .then(() => {
      configure_messages_bar("Housing review deleted successfully!");
      // show updated list of housing
      show_housing(auth.currentUser.email);
    });
}

// search housing
function search_housing(field, val) {
  if (!val) {
    r_e("r_col").innerHTML = "<p>Please enter a search term</p>";
    return;
  }

  db.collection("housing")
    .where(field, "==", val)
    .get()
    .then((data) => {
      let html = ``;
      let mydata = data.docs;

      if (mydata.length === 0) {
        r_e("r_col").innerHTML = "<p>No results found</p>";
        return;
      }

      mydata.forEach((d) => {
        html += `
          <div class="box" id="${d.id}">
                        <h1 class="has-background-light p-3 has-text-weight-bold">${
                          d.data().name
                        }</h1>
            <p class="p-3">${d.data().desc}</p>
          </div>`;
      });

      r_e("r_col").innerHTML = html;
    })
    .catch((error) => {
      console.error("Error fetching housing data:", error);
      r_e("r_col").innerHTML = "<p>An error occurred while searching</p>";
    });
}

function show_housing(email) {
  const rightColumn = r_e("r_col");
  if (email) {
    r_e("l_col").classList.remove("is-hidden");
    r_e("r_col").classList.remove("is-hidden");

    db.collection("housing")
      .get()
      .then((data) => {
        let html = ``;
        let mydata = data.docs;

        mydata.forEach((d) => {
          html += `
            <div class="box has-background-info-light" id="${d.id}">
              <h1 class="has-background-white title is-5 p-2 has-text-centered mb-0  has-text-weight-bold">${
                d.data().name
              }</h1>

              <p class="p-3">${d.data().desc}</p>
            </div>`;
        });

        // Append reviews to the right column
        rightColumn.innerHTML = html;
      })
      .catch((error) => {
        console.error("Error fetching housing data:", error);
        rightColumn.innerHTML =
          "<p>An error occurred while loading reviews</p>";
      });
  } else {
    r_e("content").innerHTML =
      "<p>You need to be signed in to view content</p>";
    r_e("l_col").classList.add("is-hidden");
    r_e("r_col").classList.add("is-hidden");
  }
}

function configure_nav_bar(email) {
  let signedin = document.querySelectorAll(".signedin");
  let signedout = document.querySelectorAll(".signedout");
  let myReviewBtn = document.querySelector("#user_reviews"); // Select the My Review button

  if (email) {
    // User is signed in
    signedin.forEach((element) => {
      element.classList.remove("is-hidden");
    });
    signedout.forEach((element) => {
      element.classList.add("is-hidden");
    });

    if (myReviewBtn) {
      myReviewBtn.classList.remove("is-hidden"); // Show My Review button
    }
  } else {
    // No user is signed in
    signedin.forEach((element) => {
      element.classList.add("is-hidden");
    });
    signedout.forEach((element) => {
      element.classList.remove("is-hidden");
    });

    if (myReviewBtn) {
      myReviewBtn.classList.add("is-hidden"); // Hide My Review button
    }
  }
}

auth.onAuthStateChanged((user) => {
  if (user) {
    configure_nav_bar(auth.currentUser.email);
    show_housing(auth.currentUser.email);
    renderOptions(options);
  } else {
    configure_nav_bar();
    show_housing();
  }
});

function r_e(id) {
  return document.querySelector(`#${id}`);
}

function configure_messages_bar(msg) {
  // show the messages bar
  r_e("messages").classList.remove("is-hidden");

  // set the msg as innerHTML of the messages bar
  r_e("messages").innerHTML = msg;

  // hide the messages bar after 3 seconds

  setTimeout(() => {
    r_e("messages").classList.add("is-hidden");
    r_e("messages").innerHTML = "";
  }, 3000);
}

// sign-up modal link
signupbtn.addEventListener("click", () => {
  signup_modal.classList.add("is-active");
});

signup_modalbg.addEventListener("click", () => {
  signup_modal.classList.remove("is-active");
});

// sign-in modal link
signinbtn.addEventListener("click", () => {
  signin_modal.classList.add("is-active");
});

signin_modalbg.addEventListener("click", () => {
  signin_modal.classList.remove("is-active");
});

// post review nav bar link
postHousingBtn.addEventListener("click", () => {
  hidden_form.classList.remove("is-hidden");
  content.classList.add("is-hidden");
});

// user sign up
r_e("signup_form").addEventListener("submit", (e) => {
  // prevent page refresh
  e.preventDefault();

  // get the email and password from the form

  let email = r_e("email").value;
  let pass = r_e("password").value;

  // check
  // console.log(email, pass);

  // send the user info to FB
  auth.createUserWithEmailAndPassword(email, pass).then(() => {
    // hide the modal
    r_e("signup_modal").classList.remove("is-active");

    // reset the sign up form
    r_e("signup_form").reset();
  });
});

auth.onAuthStateChanged((user) => {
  if (user) {
    configure_nav_bar(auth.currentUser.email);
    show_housing(auth.currentUser.email);
    renderOptions(options);
  } else {
    configure_nav_bar();
    show_housing();
  }
});

// sign in

r_e("signin_form").addEventListener("submit", (e) => {
  // disallow auto page refresh
  e.preventDefault();

  // get the email and password from form

  let email = r_e("email_").value;
  let pass = r_e("password_").value;

  // send email/pass to FB to check authentication
  auth.signInWithEmailAndPassword(email, pass).then(() => {
    configure_messages_bar("Welcome back " + auth.currentUser.email + "!");

    // hide the modal
    r_e("signin_modal").classList.remove("is-active");
  });
});

// sign out

r_e("signoutbtn").addEventListener("click", () => {
  auth.signOut().then(() => {
    configure_messages_bar("You are now logged out!");
  });
});

// add / post review

r_e("submit_housing_btn").addEventListener("click", (e) => {
  e.preventDefault();
  let name = r_e("review_name").value; // Correctly fetch the name
  let desc = r_e("housing_review").value;

  // Validate form fields
  if (!name || !desc) {
    configure_messages_bar("All fields are required.");
    return;
  }

  let housingReview = {
    name: name,
    desc: desc,
    email: auth.currentUser.email,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  // Add the review to Firestore
  db.collection("housing")
    .add(housingReview)
    .then(() => {
      r_e("review_name").value = ""; // Clear name field
      r_e("housing_review").value = ""; // Clear review field

      configure_messages_bar("Housing review added!");

      // Show the new review in the right column
      show_housing(auth.currentUser.email);

      // Hide the form and show content
      r_e("hidden_form").classList.add("is-hidden");
      r_e("content").classList.remove("is-hidden");
    })
    .catch((error) => {
      console.error("Error adding review:", error);
      configure_messages_bar("Failed to add housing review.");
    });
});

// search
r_e("search_btn").addEventListener("click", () => {
  let val = r_e("search_bar").value;
  search_housing("title", val);
});

r_e("clear_search").addEventListener("click", () => {
  document.getElementById("search_bar").value = "";
  show_housing(auth.currentUser.email);
});

r_e("user_reviews").addEventListener("click", () => {
  search_housing("email", auth.currentUser.email);
});

function r_e(id) {
  return document.querySelector(`#${id}`);
}

// Function to load content dynamically
function loadContent(content) {
  document.querySelector("#dynamic_content").innerHTML = content;
}

// Toggle navbar menu visibility on small screens
document.addEventListener("DOMContentLoaded", () => {
  const navbarBurger = document.getElementById("navbarBurger");
  const navbarMenu = document.getElementById("navbarMenu");

  navbarBurger.addEventListener("click", () => {
    // Toggle the "is-active" class on both the navbar burger and the menu
    navbarBurger.classList.toggle("is-active");
    navbarMenu.classList.toggle("is-active");
  });
});
