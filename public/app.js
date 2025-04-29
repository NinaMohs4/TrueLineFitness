// TrueLineFitness App Script - FINAL LOCKED IN VERSION

// Global Variables
let signupbtn = document.querySelector("#signupbtn");
let signup_modal = document.querySelector("#signup_modal");
let signup_modalbg = document.querySelector("#signup_modalbg");

let signinbtn = document.querySelector("#signinbtn");
let signin_modal = document.querySelector("#signin_modal");
let signin_modalbg = document.querySelector("#signin_modalbg");

let postReviewBtn = document.querySelector("#postReviewBtn");
let hidden_form = document.querySelector("#hidden_form");
let content = document.querySelector("#content");

// Firebase auth and db are assumed initialized in HTML already

// Helper function
function r_e(id) {
  return document.getElementById(id);
}

// Configure messages bar
function configure_messages_bar(msg) {
  const msgBar = r_e("messages");
  if (msgBar) {
    msgBar.classList.remove("is-hidden");
    msgBar.innerHTML = msg;
    setTimeout(() => {
      msgBar.classList.add("is-hidden");
      msgBar.innerHTML = "";
    }, 3000);
  }
}

// Configure navbar based on auth state
function configure_nav_bar(email) {
  let signedin = document.querySelectorAll(".signedin");
  let signedout = document.querySelectorAll(".signedout");
  if (email) {
    signedin.forEach((item) => (item.style.display = "block"));
    signedout.forEach((item) => (item.style.display = "none"));
    if (r_e("current_user")) r_e("current_user").textContent = email;
  } else {
    signedin.forEach((item) => (item.style.display = "none"));
    signedout.forEach((item) => (item.style.display = "block"));
    if (r_e("current_user")) r_e("current_user").textContent = "";
  }
}

// Firebase Auth Listeners
if (auth) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      configure_nav_bar(user.email);
      // Auto-load reviews if on the main page
      if (r_e("r_col")) {
        show_reviews();
      }
    } else {
      configure_nav_bar(null);
      if (r_e("r_col")) {
        r_e("r_col").innerHTML = "<p>Please sign in to see reviews.</p>";
      }
    }
  });
}

// Sign up
if (signupbtn) {
  signupbtn.addEventListener("click", () => {
    signup_modal.classList.add("is-active");
  });

  signup_modalbg.addEventListener("click", () => {
    signup_modal.classList.remove("is-active");
  });
}

// Sign in
if (signinbtn) {
  signinbtn.addEventListener("click", () => {
    signin_modal.classList.add("is-active");
  });

  signin_modalbg.addEventListener("click", () => {
    signin_modal.classList.remove("is-active");
  });
}

// Sign out
if (r_e("signoutbtn")) {
  r_e("signoutbtn").addEventListener("click", () => {
    auth
      .signOut()
      .then(() => {
        configure_messages_bar("Signed out successfully.");
      })
      .catch((error) => {
        configure_messages_bar("Error signing out: " + error.message);
      });
  });
}

// Sign Up Form Submit
if (r_e("signup_form")) {
  r_e("signup_form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = r_e("email").value.trim();
    const password = r_e("password").value.trim();

    auth
      .createUserWithEmailAndPassword(email, password)
      .then((cred) => {
        configure_messages_bar("Signed up successfully!");
        signup_modal.classList.remove("is-active");
        r_e("signup_form").reset();
      })
      .catch((error) => {
        configure_messages_bar("Sign up failed: " + error.message);
      });
  });
}

// Sign In Form Submit
if (r_e("signin_form")) {
  r_e("signin_form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = r_e("email_").value.trim();
    const password = r_e("password_").value.trim();

    auth
      .signInWithEmailAndPassword(email, password)
      .then((cred) => {
        configure_messages_bar("Signed in successfully!");
        signin_modal.classList.remove("is-active");
        r_e("signin_form").reset();
      })
      .catch((error) => {
        configure_messages_bar("Sign in failed: " + error.message);
      });
  });
}

// --- Reviews, Search, and Clear Search ---

// My Reviews button
if (r_e("user_reviews")) {
  r_e("user_reviews").addEventListener("click", () => {
    if (!auth.currentUser) {
      configure_messages_bar("You must be signed in to view your reviews.");
      return;
    }
    show_reviews(auth.currentUser.email);
  });
}

// Search button
if (r_e("search_btn")) {
  r_e("search_btn").addEventListener("click", () => {
    const searchTerm = r_e("search_bar").value.trim();
    if (searchTerm === "") {
      configure_messages_bar("Please enter something to search.");
      return;
    }
    search_reviews("desc", searchTerm);
  });
}

// Clear Search button
if (r_e("clear_search")) {
  r_e("clear_search").addEventListener("click", () => {
    r_e("search_bar").value = "";
    show_reviews();
  });
}

// Show reviews function
function show_reviews(email) {
  let reviewsRef = db.collection("reviews");
  if (email) {
    reviewsRef = reviewsRef.where("email", "==", email);
  }
  reviewsRef
    .get()
    .then((snapshot) => {
      let html = "";
      if (snapshot.empty) {
        html = "<p>No reviews found.</p>";
      } else {
        snapshot.forEach((doc) => {
          const data = doc.data();
          html += `
          <div class="box">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Rating:</strong> ${data.rating}</p>
            <p><strong>Review:</strong> ${data.desc}</p>
          </div>
        `;
        });
      }
      if (r_e("r_col")) {
        r_e("r_col").innerHTML = html;
      }
    })
    .catch((error) => {
      console.error("Error showing reviews:", error);
      if (r_e("r_col")) {
        r_e("r_col").innerHTML = "<p>Error loading reviews.</p>";
      }
    });
}

// Search reviews function
function search_reviews(field, val) {
  db.collection("reviews")
    .where(field, "==", val)
    .get()
    .then((snapshot) => {
      let html = "";
      if (snapshot.empty) {
        html = "<p>No reviews matched your search.</p>";
      } else {
        snapshot.forEach((doc) => {
          const data = doc.data();
          html += `
            <div class="box">
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Rating:</strong> ${data.rating}</p>
              <p><strong>Review:</strong> ${data.desc}</p>
            </div>
          `;
        });
      }
      if (r_e("r_col")) {
        r_e("r_col").innerHTML = html;
      }
    })
    .catch((error) => {
      console.error("Error searching reviews:", error);
      if (r_e("r_col")) {
        r_e("r_col").innerHTML = "<p>Error during search.</p>";
      }
    });
}

//  BUY PASSES
document.addEventListener("DOMContentLoaded", () => {
  r_e("passes-link").addEventListener("click", (event) => {
    event.preventDefault();
    loadContent(`
      <div id="buypasses">
    <section class="section">
      <div class="container">
          <h1 class="title has-text-centered">Choose Your Pass!</h1>
          <p class="subtitle has-text-centered">Find one that works for you</p>
  
          <div class="columns is-multiline is-align-items-stretch">
              <div class="column is-one-third">
                  <div class="box is-fullheight">
                      <div class="columns">
                          <div class="column">
                              <h2 class="title is-4 has-text-centered mt-3 pt-3">Private Session</h2>
                          </div>
                      </div>
                      <h1 class=" title is-2 has-text-weight-bold has-text-centered">$95</h1>
                      <p class="has-text-centered">1 Session tailored to you!<br>Online or In Studio</p>
                      <br>
                  </div>
              </div>
  
              <div class="column is-one-third">
                <div class="box is-fullheight has-background-info-light">
                    <div class="columns">
                        <div class="column">
                            <h2 class="title is-4 has-text-centered mt-3 pt-3">First Class Free</h2>
                        </div>
                    </div>
                    <h1 class=" title is-2 has-text-weight-bold has-text-centered">$0</h1>
                    <p class="has-text-centered">For New Clients Only: First Class Free<br>Valid for One Month <br>Online or In Studio</p>
                </div>
            </div>

  
            <div class="column is-one-third">
              <div class="box is-fullheight">
                  <div class="columns">
                      <div class="column">
                          <h2 class="title is-4 has-text-centered mt-3 pt-3">Single Studio Class</h2>
                      </div>
                  </div>
                  <h1 class=" title is-2 has-text-weight-bold has-text-centered">$22</h1>
                  <p class="has-text-centered">One class at Studio Melt<br>Valid for one month<br>In Studio</p>
              </div>
          </div>
          <div class="column is-one-third">
            <div class="box is-fullheight has-background-info-light">
                <div class="columns">
                    <div class="column">
                        <h2 class="title is-4 has-text-centered mt-3 pt-3">Single ONLINE Class</h2>
                    </div>
                </div>
                <h1 class=" title is-2 has-text-weight-bold has-text-centered">$12</h1>
                <p class="has-text-centered">Jump in. What have you got to lose?<br>Valid for one month<br>Buy a bundle and save!</p>
            </div>
        </div>
        <div class="column is-one-third">
          <div class="box is-fullheight ">
              <div class="columns">
                  <div class="column">
                      <h2 class="title is-4 has-text-centered mt-3 pt-3">In Person Class x 5</h2>
                  </div>
              </div>
              <h1 class=" title is-2 has-text-weight-bold has-text-centered">$100</h1>
              <p class="has-text-centered">Five In Person Classes at Studio Melt<br>Valid for 6 months<br>In Studio</p>
          </div>
      </div>
      <div class="column is-one-third">
        <div class="box is-fullheight has-background-info-light">
            <div class="columns">
                <div class="column">
                    <h2 class="title is-4 has-text-centered mt-3 pt-3">In Person Class x 10</h2>
                </div>
            </div>
            <h1 class=" title is-2 has-text-weight-bold has-text-centered">$190</h1>
            <p class="has-text-centered">Ten In Person Classes at Studio Melt<br>Valid for 12 months<br>In Studio</p>
        </div>
    </div>
    <div class="column is-one-third">
      <div class="box is-fullheight">
          <div class="columns">
              <div class="column">
                  <h2 class="title is-4 has-text-centered mt-3 pt-3">5 Private Sessions</h2>
              </div>
          </div>
          <h1 class=" title is-2 has-text-weight-bold has-text-centered">$450</h1>
          <p class="has-text-centered">5 Sessions tailored to you!<br>Valid for 6 months<br>Online or In Studio</p>
      </div>
  </div>
  <div class="column is-one-third">
    <div class="box is-fullheight has-background-info-light">
        <div class="columns">
            <div class="column">
                <h2 class="title is-4 has-text-centered mt-3 pt-3">10 Private Sessions</h2>
            </div>
        </div>
        <h1 class=" title is-2 has-text-weight-bold has-text-centered">$850</h1>
        <p class="has-text-centered">10 Sessions tailored to you!<br>Valid for 6 months<br>Online or In Studio</p>
    </div>
</div>
<div class="column is-one-third">
  <div class="box is-fullheight">
      <div class="columns">
          <div class="column">
              <h2 class="title is-4 has-text-centered mt-3 pt-3">ONLINE x 5              </h2>
          </div>
      </div>
      <h1 class=" title is-2 has-text-weight-bold has-text-centered">$57</h1>
      <p class="has-text-centered">5 pack<br>Valid for 6 months<br>Save 5% on Online Classes!</p>
  </div>
</div>

          </div>
      </div>
      <br>
      <p class="has-text-centered">*Class Passes are for classes only. Workshops and other special events not included.
      </p>
  </section>
</div>

 <!-- footer -->
    <footer class="footer is-flex is-justify-content-center mt-2 p-1">
      <div class="content has-text-centered" style="width: fit-content">
        <p>
          <b>Copyright &copy; 2025 True Line Fitness</b><br />
          301 W Beltline Hwy Suite 103<br />
          Madison, WI 53713 <br />
          info@truelinefitness.com
        </p>
      </div>
    </footer>
       `);
  });
});

// SPLASH
document.addEventListener("DOMContentLoaded", () => {
  r_e("splash-link").addEventListener("click", (event) => {
    event.preventDefault();
    loadContent(` <div id="splash">
    <section class="section">
      <div class="container">
        <h1 class="title has-text-centered">Splash! <i class="fas fa-water fa-lg"></i></h1>          
        <p class="subtitle has-text-centered">Foundation Training for Swimmers</p>
  
          <div class="columns is-flex is-align-items-stretch">
              <!-- Workshop Box -->
              <div class="column">
                  <div class="box is-fullheight">
                      <div class="columns">
                          <div class="column">
                              <h2 class="title is-4 has-text-centered mt-3 pt-3 has-text-weight-bold has-text-info-dark">Workshop</h2>
                          </div>
                      </div>
                      <p class="has-text-weight-bold has-text-centered">For swimmers (and coaches).</p>
                      <p>Utilize Foundation Training to learn and practice healthy posture, breathing, and biomechanics. You will be guided through exercises that will specifically help you feel better in the water and in your life.</p>
                      <br><br><br> </div> 
              </div>
             

  
              <!-- Online Consult: Athletes -->
              <div class="column">
                  <div class="box is-fullheight">
                      <div class="columns">
                          <div class="column">
                              <h2 class="title is-4 has-text-centered mt-3 pt-3 has-text-weight-bold has-text-info-dark">Online Consult: Athletes</h2>
                          </div>
                      </div>
                      <p class="has-text-weight-bold has-text-centered">For up to two swimmers.</p>
                      <p>Foundation Training can help you reach your fitness and performance goals. This 30-minute consultation will provide you with personalized exercises that will improve your life in and out of the water. Incorporate FT into your daily training. Start today!</p>
                  <br><br></div>
              </div>
  
              <!-- Online Consult: Coaches -->
              <div class="column">
                  <div class="box is-fullheight">
                      <div class="columns">
                          <div class="column">
                              <h2 class="title is-4 has-text-centered mt-3 pt-3 has-text-weight-bold has-text-info-dark">Online Consult: Coaches</h2>
                          </div>
                      </div>
                      <p class="has-text-weight-bold has-text-centered">Individual.</p>
                      <p>Foundation Training can help your athletes reach and even exceed their current fitness and performance goals. This 30-minute consultation will introduce you to alignment and breathing practices that will help your athletes improve their times while reducing their risk for injury. Incorporate FT into your training program today!</p>
                  </div>
              </div>
            </div>

              <!-- NEW ROW OF 2 BOXES -->
<div class="columns is-flex is-align-items-stretch">
  <div class="column is-one-third">
    <div class="box is-fullheight has-text-centered">
      <!-- Image --><br>
      <figure class="image is-inline-block mb-4 mt-4" style="width: 200px; height: 200px;">
        <img class="is-rounded" src="Jenner.jpg" alt="Coach photo" style="object-fit: cover; width: 100%; height: 100%;">
      </figure>
            <!-- Bio -->
      <p class="has-text-weight-bold mb-2">Sixteen-Time All American</p>
      <p class="mb-2">Division III National Championship Team (2014, 2015, 2016)</p>
      <p class="mb-2">Kenyon College Team Captain (2017)</p>
      <p class="mb-2">Certified Instructor, Foundation Training since 2017</p>
      <p class="mb-2">BA Kenyon College</p>
      <p class="mb-2">MS University of Wisconsin–Madison<br>Educational Leadership & Policy Analysis</p>
      <p class="has-text-weight-bold mt-3">Owner, True Line Fitness</p> <br><br><br>
    </div>
  </div>
  

  <!-- Box 5 -->
  <div class="column is-two-thirds">
    <div class="box is-fullheight">
      <h2 class="title is-4 has-text-centered mt-3 pt-3 has-text-weight-bold has-text-info-dark">Meet Jenner!</h2>
      <p class="mb-2">“The water has always been my happy place”</p>
      <p class="mb-2"> My name is Jenner. People say that swimming is one of the best things we can do for our body, its low impact nature and cardio benefits are hard to beat. However, I would challenge that statement and say that adding Foundation Training to your swimming routine is the best thing you can do. 
      </p>
      <p class="mb-2">I began practicing Foundation Training in the summer of 2012 and I noticed immediate effects in the water. Could it have been a placebo effect? Perhaps. As a rising high school senior pursuing a collegiate swimming career I would have tried anything to keep me healthy. However, I knew Foundation Training was more than just another strength training exercise, it is a lifestyle choice that I knew would change the game. I noticed immediate improvements in my stroke through the postural, alignment, and breathing benefits of Foundation Training.
      </p>
      <p class="mb-2">For the remainder of my swimming career I used Foundation Training to not only prevent but recover from two serious injuries. I became addicted to its benefits that I became a certified instructor in 2017 and have been teaching for over five years.
      </p>
      <p class="mb-2">At the end of the day accolades do not matter. I like to remember the moments, the specific experiences growing up in the water. I give a lot of credit to Foundation Training for providing physical and mental clarity to make it through some long seasons and look back at my swimming career with fond memories despite some challenging times. 
      </p>
      <p class="mb-2">Swimming has always been a part of my life, both as an athlete and as a coach. I am excited to combine two of my  passions: swimming and Foundation Training to teach current swimmers and coaches how they can incorporate this work into their program. 
      </p>
      <p class="mb-2">EVERY body can benefit from Foundation Training. I look forward to connecting!
      </p>
    </div>
  </div>
</div>

          </div>
      </div>
    </div>
  </section>

 <!-- footer -->
    <footer class="footer is-flex is-justify-content-center mt-2 p-1">
      <div class="content has-text-centered" style="width: fit-content">
        <p>
          <b>Copyright &copy; 2025 True Line Fitness</b><br />
          301 W Beltline Hwy Suite 103<br />
          Madison, WI 53713 <br />
          info@truelinefitness.com
        </p>
      </div>
    </footer>
       `);
  });
});

// CONTACT US
document.addEventListener("DOMContentLoaded", () => {
  r_e("contact-link").addEventListener("click", (event) => {
    event.preventDefault();
    loadContent(`<div id="contact">
    <section class="section">
        <div class="container">
            <h1 class="title has-text-centered">Contact Us</h1>
            <p class="subtitle has-text-centered">Meet our instructors and learn about our story.</p>
            
            <div class="columns">
              <!-- Jenner's Column -->
              <div class="column">
                  <div class="box is-fullheight">
                      <div class="columns is-vcentered">
                          <div class="column is-narrow">
                              <figure class="image is-128x128 mb-5 pb-5">
                                  <img src="jenner.avif" alt="Instructor 1">
                              </figure> 
                          </div>
                          <div class="column">
                              <h2 class="title is-4">Jenner McLeod</h2>
                              <p class="is-size-6 has-text-weight-bold">
                                  A dedicated instructor with a passion for education and experience as a competitive swimmer that makes her a pro!
                              </p>
                          </div>
                      </div>
                      <p>
                          As a former collegiate athlete, Jenner knows the importance of embracing both physical and mental elements of fitness. Since encountering Foundation Training in 2012, Jenner has experienced positive changes to her swimming stroke, posture, and overall well-being. Throughout her athletic career, she utilized Foundation Training as a tool in injury prevention and recovery. Today, Jenner’s practice continues to play an integral role in her daily life, as she finds it to be the most effective tool in grounding her body and focusing her mind. More specifically, the decompression breathing component of the practice has transformed her mental health, and she is forever grateful for the deep and lasting impacts of this work.
                      </p>
                      <br>
                      <a class="button" href="mailto:jenner@truelinefitness.com">Contact Jenner!</a>
                      <br><br><br><br><br><br><br><br>  
                  </div>
              </div>
          
              <!-- Linda's Column -->
              <div class="column">
                  <div class="box is-fullheight">
                      <div class="columns is-vcentered">
                          <div class="column is-narrow">
                              <figure class="image is-128x128 mb-5 pb-5">
                                  <img src="Linda.avif" alt="Instructor 2">
                              </figure>
                          </div>
                          <div class="column">
                              <h2 class="title is-4">Linda Guanti</h2>
                              <p class="is-size-6 has-text-weight-bold">
                                  A Certified Level 2 Foundation Training instructor with a lifelong love of movement and health. She is also an FRC Mobility Specialist, Certified Yoga Instructor, Medical Imaging Technologist, and Steward of Horses.
                              </p>
                          </div>
                      </div>
                      <p>
                          Linda Guanti is a Certified Level 2 Foundation Training Instructor, FRC Mobility Specialist, Certified Yoga Instructor, Medical Imaging Technologist, and Steward of Horses. Her journey into health care began with her own journey of healing from spinal fractures she incurred in her teens, the absence of rehabilitation, and the subsequent disc injuries afterward. The mainstream medical system's method of medication and potential surgery did not resonate with her, and she spent many years exploring different 'alternative' methods which offered some relief but left her limited and in pain. It wasn't until she found Foundation Training that her life truly turned around. She recognized its benefits almost immediately and went to one of the first Certification Trainings in 2013. After FT, she finally felt able to try new sports, be as active as she had dreamed, go through pregnancy, and have a child (now 7 years old). Linda believes that the human body is far more powerful and adaptive than you can imagine. Drawing on over 25 years of Health Care and teaching experience, she is passionate about sharing with others this invaluable information on what and why imbalances may be occurring in your body and these accessible tools that are for 'every body'.
                      </p>
                      <br>
                      <a class="button" href="mailto:linda@lindaguanti.com">Contact Linda!</a>
                  </div>
              </div>
          </div>
          
                      
          <div class="column">
            <div class="box is-fullheight">
                <div class="columns is-vcentered">
                    <div class="column is-narrow">
                        <figure class="image is-192x192 mb-5 pb-5">
                            <img src="mona.avif" alt="Mona">
                        </figure>
                    </div>
                    <div class="column">
        <h2 class="title is-4">Our Story, The Legacy of Mona Melms</h2>
                <p>True Line Fitness was founded with the goal of promoting holistic fitness through Foundation Training. Our mission is to help individuals achieve better posture, movement, and overall well-being.</p>
                <br>
                <p class="is-size-7">Mona Melms, RN, brought Foundation Training to the Madison area in 2012. Mona was a warrior, a bright light and a leader in fitness. She was a wife, mother of young children and a highly respected nurse when cancer first struck her. From that time on she added personal fitness to her many causes. Recognizing that life takes strength, purpose and risk, she opened her first studio, Melt Studio, where she taught group fitness classes and offered one-on-one personal training.
<br><br>In 2012, Mona attended the first ever Foundation Training instructor certification program, where she befriended Dr. Eric Goodman. Impressed with Foundation Training Method, Mona immediately began teaching it to others. She later opened a second studio, The Mona Method Studio, to better accommodate her growing group classes. It was in the studio setting that Jenner and Suzanne first encountered this beautiful powerhouse of a woman, and were drawn by her enthusiasm to Foundation Training.
<br><br>Forever the encourager and collaborator, Mona gave Jenner and Suzanne opportunities to teach right alongside her. Cancer struck Mona a second time in 2017, and then again in 2020. For three decades she'd fought the good fight. With great dignity she encouraged her fellow instructors to keep going.
<br><br>In 2019, Mona and Suzanne had met Linda Guanti while attending the Level 2 Foundation Training certification in Boulder, Colorado. Just weeks before she died, Mona achieved her Level 2 certification.
<br><br>As part of Mona's enduring legacy, and especially in appreciation of her collaborative spirit, Jenner, Linda and Suzanne have joined together to keep each other sharp and to bring you high quality Foundation Training instruction. 
<br><br><b>Keep shining, Mona! </b></p>
            </div>
        </div>
      </div>
    </section>
  
                                   
  <!-- footer -->
    <footer class="footer is-flex is-justify-content-center mt-2 p-1">
      <div class="content has-text-centered" style="width: fit-content">
        <p>
          <b>Copyright &copy; 2025 True Line Fitness</b><br />
          301 W Beltline Hwy Suite 103<br />
          Madison, WI 53713 <br />
          info@truelinefitness.com
        </p>
      </div>
    </footer>
       `);
  });
});

function loadContent(content) {
  document.querySelector("#main").innerHTML = content;
}
