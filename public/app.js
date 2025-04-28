// global variables

let signupbtn = document.querySelector("#signupbtn");
let signup_modal = document.querySelector("#signup_modal");
let signup_modalbg = document.querySelector("#signup_modalbg");

let signinbtn = document.querySelector("#signinbtn");
let signin_modal = document.querySelector("#signin_modal");
let signin_modalbg = document.querySelector("#signin_modalbg");

let postReviewBtn = document.querySelector("#postReviewBtn");
let hidden_form = document.querySelector("#hidden_form");
let content = document.querySelector("#content");

// functions

function del_doc(id) {
  db.collection("reviews")
    .doc(id)
    .delete()
    .then(() => {
      configure_messages_bar("TrueLineFitness review deleted successfully");
      // show updated list of reviews
      show_reviews(auth.currentUser.email);
    });
}

// search TrueLineFitness reviews
function search_reviews(field, val) {
  if (!val) {
    r_e("r_col").innerHTML = "<p>Please enter a search term</p>";
    return;
  }

  db.collection("reviews")
    .where(field, "==", val)
    .get()
    .then((data) => {
      let html = ``;
      const userEmail = auth.currentUser?.email;

      if (data.empty) {
        r_e("r_col").innerHTML = "<p>No results found</p>";
        return;
      }

      data.docs.forEach((d) => {
        const review = d.data();
        const isOwner = review.email === userEmail;

        html += `
          <div class="box has-background-info-light" id="${d.id}">
            <h1 class="has-background-white title is-5 p-2 has-text-centered mb-0 has-text-weight-bold">
              ${review.name}
            </h1>
            <p class="has-text-weight-semibold has-text-centered mt-1 mb-1">
              Rating: ${review.rating}/5 ⭐️
            </p>
            <p class="p-3">${review.desc}</p>
            ${
              isOwner
                ? `<div class="has-text-right pr-2">
                    <button class="button is-small is-danger" onclick="handleRemove('${d.id}')">Delete</button>
                  </div>`
                : ""
            }
          </div>`;
      });

      r_e("r_col").innerHTML = html;
    })
    .catch((error) => {
      console.error("Error fetching filtered reviews:", error);
      r_e("r_col").innerHTML = "<p>Error while searching reviews.</p>";
    });
}

function show_reviews(email) {
  const rightColumn = r_e("r_col");

  if (email) {
    r_e("l_col").classList.remove("is-hidden");
    r_e("r_col").classList.remove("is-hidden");

    db.collection("reviews")
      .get()
      .then((data) => {
        let html = ``;
        const userEmail = auth.currentUser.email;

        data.docs.forEach((d) => {
          const review = d.data(); // Moved this inside the loop
          const isOwner = review.email === userEmail;

          html += `
            <div class="box has-background-info-light" id="${d.id}">
              <h1 class="has-background-white title is-5 p-2 has-text-centered mb-0 has-text-weight-bold">
                ${review.name}
              </h1>
              <p class="has-text-weight-semibold has-text-centered mt-1 mb-1">
                Rating: ${review.rating}/5 ⭐️
              </p>
              <p class="p-3">${review.desc}</p>
            </div>`;
        });

        rightColumn.innerHTML = html;
      })
      .catch((error) => {
        console.error("Error fetching TrueLineFitness Review data:", error);
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
    show_reviews(auth.currentUser.email);
  } else {
    configure_nav_bar();
    show_reviews();
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
postReviewBtn.addEventListener("click", () => {
  r_e("review_modal").classList.add("is-active");
});

// Close the modal when clicking the background or Cancel or submitting properly
r_e("review_modal_bg").addEventListener("click", () => {
  r_e("review_modal").classList.remove("is-active");
});

r_e("submit_review_btn").addEventListener("click", () => {
  r_e("review_modal").classList.remove("is-active");
});

r_e("cancel_review_btn").addEventListener("click", () => {
  r_e("review_modal").classList.remove("is-active");
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
  auth
    .createUserWithEmailAndPassword(email, pass)
    .then((cred) => {
      return db
        .collection("users")
        .doc(cred.user.uid)
        .set({
          user_id: cred.user.uid,
          user_email: email,
          user_name: email.split("@")[0],
          user_phone: "", // or collect this from the form
          admin_status: false,
        });
    })
    .then(() => {
      r_e("signup_modal").classList.remove("is-active");
      r_e("signup_form").reset();
      configure_messages_bar("Sign-up successful and user saved!");
    })
    .catch((err) => {
      console.error("Sign-up error:", err);
      configure_messages_bar("Error during sign-up");
    });
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

r_e("submit_review_btn").addEventListener("click", (e) => {
  e.preventDefault();
  let name = r_e("review_name").value; // Correctly fetch the name
  let rating = r_e("review_rating").value; // Correctly fetch the name
  let desc = r_e("fitness_review").value;

  // Validate form fields
  if (!name || !desc || !rating) {
    configure_messages_bar("All fields are required.");
    return;
  }

  let fitnessReview = {
    name: name,
    rating: rating,
    desc: desc,
    email: auth.currentUser.email,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  // Add the review to Firestore
  db.collection("reviews")
    .add(fitnessReview)
    .then(() => {
      r_e("review_name").value = ""; // Clear name field
      r_e("fitness_review").value = ""; // Clear review field
      r_e("review_rating").value = "";

      configure_messages_bar("TrueLineFitness review added!");

      // Show the new review in the right column
      show_reviews(auth.currentUser.email);

      // Hide the form and show content
      r_e("hidden_form").classList.add("is-hidden");
      r_e("content").classList.remove("is-hidden");
    })
    .catch((error) => {
      console.error("Error adding review:", error);
      configure_messages_bar("Failed to add TrueLineFitness review.");
    });
});

function handleRemove(docId) {
  if (confirm("Are you sure you want to delete this review?")) {
    db.collection("reviews")
      .doc(docId)
      .delete()
      .then(() => {
        configure_messages_bar("Deleted Review");
        show_reviews(auth.currentUser.email);
      })
      .catch((error) => {
        console.error("Error deleting review:", error);
        configure_messages_bar("Failed to delete review.");
      });
  }
}

// search
// r_e("search_btn").addEventListener("click", () => {
//   let val = r_e("search_bar").value;
//   search_reviews("title", val);
// });

// Event listener to allow for proper filtering, always make lowercase
//so that case is not a problem when filtering
document.addEventListener("DOMContentLoaded", function () {
  const searchBar = document.getElementById("search_bar");
  const searchBtn = document.getElementById("search_btn");

  //When search button is clicked, filter on whatever is currently stored
  //within the searchbox
  searchBtn.addEventListener("click", function () {
    const filteredPhrase = searchBar.value.toLowerCase();
    const reviewBoxes = document.querySelectorAll("#r_col .box");
    //For every single box from querySelectorAll, run a function on them
    //which makes all text lowercase and then checks if the filteredPhrase
    //is contained within (substring), if so then display it and if not then
    //do not display it
    reviewBoxes.forEach(function (box) {
      const text = box.textContent.toLowerCase();
      box.style.display = text.includes(filteredPhrase) ? "" : "none";
    });
  });
});

r_e("clear_search").addEventListener("click", () => {
  document.getElementById("search_bar").value = "";
  show_reviews(auth.currentUser.email);
});

r_e("user_reviews").addEventListener("click", () => {
  search_reviews("email", auth.currentUser.email);
});

function r_e(id) {
  return document.querySelector(`#${id}`);
}

// Function to load content dynamically
function loadContent(content) {
  document.querySelector("#dynamic_content").innerHTML = content;
}

// Creating Users, Enrollment, Reviews, and Classes Collections
let u1 = {
  user_id: 1,
  user_name: "saelliott2",
  user_email: "saelliott2@wisc.edu",
  user_phone: 9202775411,
  admin_status: true,
};

let e1 = {
  customer_id: 1,
  class_id: 1,
  order_date: Date("04/07/2025"),
};

let r1 = {
  review_id: 1,
  user_id: 1,
  rating: 5,
  review_text: "Great Instuctors",
};

let c1 = {
  class_id: 1,
  class_name: "Class Name",
  class_date: Date("04/07/2025"),
  instructor: "Linda Guanti",
};

db.collection("users").doc("u1").set(u1);
//db.collection("enrollment").doc("e1").set(e1);
//db.collection("reviews").doc("r1").set(r1);
//db.collection("classes").doc("c1").set(c1);

document.addEventListener("DOMContentLoaded", () => {
  const navbarBurger = document.getElementById("navbarBurger");
  const navbarMenu = document.getElementById("navbarMenu");

  if (navbarBurger && navbarMenu) {
    navbarBurger.addEventListener("click", () => {
      navbarBurger.classList.toggle("is-active");
      navbarMenu.classList.toggle("is-active");
    });
  }

  const addClassModal = document.getElementById("addClassModal");
  const addClassForm = document.getElementById("addClassForm");
  const classesTableBody = document.querySelector("#classes_table tbody");

  if (addClassForm && classesTableBody) {
    // Load existing classes from Firestore when page loads
    db.collection("classes")
      .orderBy("timestamp", "asc")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const classData = doc.data();
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
            <td>${classData.class_name}</td>
            <td>${classData.class_date}</td>
            <td>${classData.class_time}</td>
            <td><button class="button has-background-info-dark has-text-white" onclick="deleteClass('${doc.id}', this)">Delete</button></td>
          `;
          classesTableBody.appendChild(newRow);
        });
      })
      .catch((error) => {
        console.error("Error fetching classes:", error);
      });

    // When admin submits Add Class form
    addClassForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const className = addClassForm
        .querySelector('input[placeholder="e.g. Zumba"]')
        .value.trim();
      const classTime = addClassForm
        .querySelector('input[placeholder="e.g. 5:00 PM"]')
        .value.trim();
      const classDate = addClassForm
        .querySelector('input[placeholder="e.g. Thursday"]')
        .value.trim();

      if (className && classTime && classDate) {
        db.collection("classes")
          .add({
            class_name: className,
            class_time: classTime,
            class_date: classDate,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then((docRef) => {
            // Add the newly created class to the table immediately
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
              <td>${className}</td>
              <td>${classDate}</td>
              <td>${classTime}</td>
              <td><button class="button has-background-info-dark has-text-white" onclick="deleteClass('${docRef.id}', this)">Delete</button></td>
            `;
            classesTableBody.appendChild(newRow);

            addClassForm.reset();
            addClassModal.classList.remove("is-active");
          })
          .catch((error) => {
            console.error("Error adding class:", error);
          });
      }
    });
  }
});

function deleteClass(docId, buttonElement) {
  if (confirm("Are you sure you want to delete this class?")) {
    db.collection("classes")
      .doc(docId)
      .delete()
      .then(() => {
        // Remove the table row from the DOM
        const row = buttonElement.closest("tr");
        if (row) {
          row.remove();
        }
        configure_messages_bar("Class deleted successfully.");
      })
      .catch((error) => {
        console.error("Error deleting class:", error);
        configure_messages_bar("Failed to delete class.");
      });
  }
}
