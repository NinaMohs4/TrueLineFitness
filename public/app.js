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
      show_reviews(auth.currentUser.email);
    });
}

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
                ? `<div class="has-text-right pr-2"><button class="button is-small is-danger" onclick="handleRemove('${d.id}')">Delete</button></div>`
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
  let myReviewBtn = document.querySelector("#user_reviews");

  if (email) {
    signedin.forEach((element) => {
      element.classList.remove("is-hidden");
    });
    signedout.forEach((element) => {
      element.classList.add("is-hidden");
    });

    if (myReviewBtn) {
      myReviewBtn.classList.remove("is-hidden");
    }
  } else {
    signedin.forEach((element) => {
      element.classList.add("is-hidden");
    });
    signedout.forEach((element) => {
      element.classList.remove("is-hidden");
    });

    if (myReviewBtn) {
      myReviewBtn.classList.add("is-hidden");
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  signupbtn.addEventListener("click", () => {
    signup_modal.classList.add("is-active");
  });

  signup_modalbg.addEventListener("click", () => {
    signup_modal.classList.remove("is-active");
  });

  signinbtn.addEventListener("click", () => {
    signin_modal.classList.add("is-active");
  });

  signin_modalbg.addEventListener("click", () => {
    signin_modal.classList.remove("is-active");
  });

  r_e("signup_form").addEventListener("submit", (e) => {
    e.preventDefault();
    let email = r_e("email").value;
    let pass = r_e("password").value;

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
            user_phone: "",
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
        configure_messages_bar("Error during sign-up: " + err.message);
      });
  });

  r_e("signin_form").addEventListener("submit", (e) => {
    e.preventDefault();
    let email = r_e("email_").value;
    let pass = r_e("password_").value;

    auth.signInWithEmailAndPassword(email, pass).then(() => {
      configure_messages_bar("Welcome back " + auth.currentUser.email + "!");
      r_e("signin_modal").classList.remove("is-active");
    });
  });

  r_e("signoutbtn").addEventListener("click", () => {
    auth.signOut().then(() => {
      configure_messages_bar("You are now logged out!");
    });
  });

  auth.onAuthStateChanged((user) => {
    if (user) {
      configure_nav_bar(auth.currentUser.email);
      show_reviews(auth.currentUser.email);

      // Check admin status
      db.collection("users")
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            if (userData.admin_status) {
              document
                .querySelectorAll(".admin")
                .forEach((el) => el.classList.remove("is-hidden"));
            } else {
              document
                .querySelectorAll(".admin")
                .forEach((el) => el.classList.add("is-hidden"));
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching admin status:", error);
        });
    } else {
      configure_nav_bar();
      show_reviews();

      // Always hide admin link if no user
      document
        .querySelectorAll(".admin")
        .forEach((el) => el.classList.add("is-hidden"));
    }
  });
});

function r_e(id) {
  return document.querySelector(`#${id}`);
}

function configure_messages_bar(msg) {
  r_e("messages").classList.remove("is-hidden");
  r_e("messages").innerHTML = msg;
  setTimeout(() => {
    r_e("messages").classList.add("is-hidden");
    r_e("messages").innerHTML = "";
  }, 3000);
}

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
