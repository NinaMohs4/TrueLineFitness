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

  if (email) {
    // User is signed in
    signedin.forEach((element) => {
      element.classList.remove("is-hidden");
    });
    signedout.forEach((element) => {
      element.classList.add("is-hidden");
    });
  } else {
    // No user is signed in
    signedin.forEach((element) => {
      element.classList.add("is-hidden");
    });
    signedout.forEach((element) => {
      element.classList.remove("is-hidden");
    });
  }
}

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

// db.collection("housing")
//   .get()
//   .then((data) => {
//     console.log(
//       "Firestore collection data:",
//       data.docs.map((doc) => doc.data())
//     );
//   })
//   .catch((error) => console.error("Error fetching Firestore data:", error));

// search user added reviews

r_e("user_reviews").addEventListener("click", () => {
  search_housing("email", auth.currentUser.email);
});

document.getElementById("clear_filters").addEventListener("click", (event) => {
  event.preventDefault(); // Prevent form submission (if the button is inside a form)

  // Reset all filters
  document.getElementById("price").value = ""; // Reset dropdown
  const typeRadios = document.querySelectorAll('input[name="type"]');
  typeRadios.forEach((radio) => (radio.checked = false)); // Uncheck all radio buttons

  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => (checkbox.checked = false)); // Uncheck all checkboxes
  const contentDiv = document.getElementById("content");
  contentDiv.innerHTML = ""; // Clear existing content
  options.forEach((option) => {
    contentDiv.innerHTML += `
      <div class="box">
        <h3 class="title is-5">${option.name}</h3>
        <p>Type: ${option.type}</p>
        <p>Price: ${option.price}</p>
      </div>
    `;
  });
});

function r_e(id) {
  return document.querySelector(`#${id}`);
}

function loadContent(content) {
  r_e("main").innerHTML = content;
}

//  ON CAMPUS
document.addEventListener("DOMContentLoaded", () => {
  r_e("oncampus-link").addEventListener("click", (event) => {
    event.preventDefault();
    loadContent(`
      <div id="oncampus">
        <div class="container">
          <h1 class="title has-text-centered mt-2 pt-2">On Campus Living</h1>
          
          <!-- Boxes -->
          <div class="box">
            <div class="columns">
              <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                <img src="ogg.jpg" alt="Ogg Residence Hall" style="height:200px; width:250px;" />
              </div>
              <div class="column">
                <p class="title is-5 mb-0">Ogg Residence Hall</p>
                <p class="mt-0 mb-3"> <b> $$ </b> - 35 W Dayton Street, Madison, WI 53706</p>
                <p>
                    Ogg Residence Hall, centrally located on the UW-Madison campus,
                    provides students with modern, air-conditioned double rooms, each
                    with private bathrooms and generous closet space. Built in 2006, it
                    features study lounges, community kitchens, and comfortable common
                    areas. With secure access, laundry facilities, and high-speed
                    internet throughout, Ogg offers a balanced mix of comfort and
                    convenience. Its proximity to academic buildings and downtown
                    Madison makes it a popular choice for students looking for an
                    active, urban campus experience.
                </p>
              </div>
            </div>
          </div>

          <div class="box has-background-grey-lighter">
            <div class="columns">
                <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                    <img src="waters.jpg" alt="Waters Residence Hall" style="height:200px; width:250px;"/>
              </div>
              <div class="column">
                <p class="title is-5 mb-0"> Waters Residence Hall</p>
                <p class="mt-0 mb-3"> <b> $ </b> - 1200 Observatory Drive, Madison, WI 53706</p>
                <p>
                    Waters Hall is located in the Lakeshore neighborhood offering a quieter, more nature-focused living environment. It provides traditional-style double rooms with shared bathrooms and access to common lounges and study areas. Waters Hall is ideal for students who prefer a serene setting, with easy access to walking trails along Lake Mendota. Residents enjoy the balance of peaceful lakeside living while still being within walking distance of academic buildings and campus services. 
                </p>
              </div>
            </div>
          </div>

                <div class="box">
                  <div class="columns">
                    <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                      <img src="witte.jpg" alt="Witte Residence Hall" style="height:200px; width:250px;" />
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0"> Witte Residence Hall</p>
                      <p class="mt-0 mb-3"> <b> $$ </b> - 615 W Johnson Street Madison, WI 53703</p>
                      <p>
                          Witte Residence Hall at UW-Madison is a bustling, high-rise dorm located in the Southeast neighborhood, near the Gordon Dining Hall. Recently renovated, Witte offers double rooms with modern furnishings and shared bathrooms. It includes amenities like air conditioning, spacious study areas, and a large fitness center. Witte's convenient location places it close to many academic buildings and campus dining options, making it an ideal choice for students who enjoy a vibrant campus life.
                      </p>
                    </div>
                  </div>
                </div>
            
                <div class="box has-background-grey-lighter">
                  <div class="columns">
                      <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                          <img src="sellery.jpg" alt="Sellery Residence Hall" style="height:200px; width:250px;"/>
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0"> Sellery Residence Hall</p>
                      <p class="mt-0 mb-3"> <b> $$ </b> - 821 W Johnson Street Madison, WI 53706</p>
                      <p>
                          This residence hall is large, lively, and a popular option for students, as it has been designed for students who enjoy a dynamic, social atmosphere. This building offers a variety of room sizes (singles, doubles, triples, and quads). Sellery was also recently rennovated in 2023, so it includes many new ammenities and updated living spaces. Its location near State Street makes it a great choice for students who want to be at the center of campus activity.
                      </p>
                    </div>
                  </div>
                </div>
      
                <div class="box">
                  <div class="columns">
                    <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                      <img src="lowell.jpg" alt="Lowell Center" style="height:200px; width:250px;" />
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0"> Lowell Residence Hall</p>
                      <p class="mt-0 mb-3"> <b> $$ </b> - 610 Langdon Street Madison, WI 53703</p>
                      <p>
                          Lowell Center at UW-Madison offers a unique blend of history and modern amenities. Located on Langdon Street, Lowell provides single and double rooms with shared bathrooms, offering a traditional yet comfortable living environment. Residents enjoy access to quiet study areas, social lounges, and kitchens. Its location near academic buildings, libraries, and campus landmarks makes Lowell an ideal choice for students who want to live close to their classes in a classic campus setting.
                      </p>
                    </div>
                  </div>
                </div>
            
                <div class="box has-background-grey-lighter">
                  <div class="columns">
                      <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                          <img src="kronshit.jpg" alt="Kroshage Residence Hall" style="height:200px; width:250px;"/>
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0"> Kronshage Residence Hall</p>
                      <p class="mt-0 mb-3"> <b> $ </b> - 1650 Kronshage Drive Madison, WI 53706</p>
                      <p>
                          Kronshage Hall, nestled along the shores of Lake Mendota, is a cluster of small houses that create a more intimate, community-focused residence hall experience. Each house offers double rooms, shared bathrooms, and common spaces, including kitchens and study lounges. Known for its scenic location in the Lakeshore neighborhood, Kronshage is ideal for students seeking a quieter, more relaxed atmosphere, surrounded by nature but still connected to campus life through nearby bus routes and walking paths.
                      </p>
                    </div>
                  </div>
                </div>
      
                <div class="box">
                  <div class="columns">
                    <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                      <img src="chad.jpg" alt="Chadbourne Residence Hall" style="height:200px; width:250px;" />
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0"> Chadbourne Residence Hall</p>
                      <p class="mt-0 mb-3"> <b> $ </b> - 420 N Park Street, Madison, WI 53706</p>
                      <p>
                          Chadbourne Hall, situated in the heart of the UW-Madison campus, is a popular option for students seeking a close-knit living-learning community. Known for its academic focus, Chadbourne offers double and single rooms with shared bathrooms, study spaces, and community lounges. The hall is home to the Chadbourne Residential College (CRC), which offers unique academic and social programming for residents. Its central location provides easy access to campus buildings, libraries, and student services.
                      </p>
                    </div>
                  </div>
                </div>
            
                <div class="box has-background-grey-lighter">
                  <div class="columns">
                      <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                          <img src="dejope.jpg" alt="Dejope Residence Hall" style="height:200px; width:250px;"/>
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0"> Dejope Residence Hall</p>
                      <p class="mt-0 mb-3"> <b> $$ </b> - 640 Elm Drive Madison, WI 53706</p>
                      <p>
                          Dejope Hall at UW-Madison, located in the Lakeshore neighborhood, offers stunning views of Lake Mendota and celebrates the area's Native American heritage. Opened in 2012, Dejope provides single and double rooms with air conditioning and shared bathrooms. It includes unique features such as the Ho-Chunk Fire Circle and cultural displays throughout the building. With an on-site dining hall, study spaces, and secure entry, Dejope is a modern, culturally rich residence hall that balances community living with academic focus.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div class="box">
                  <div class="columns">
                    <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                      <img src="leopold.jpg" alt="Leopold Residence Hall" style="height:200px; width:250px;" />
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0"> Leopold Residence Hall</p>
                      <p class="mt-0 mb-3"> <b> $$ </b> - 1635 Kronshage Drive Madison, WI 53706</p>
                      <p>
                          Leopold Hall, one of UW-Madison's more recently built dorms, is located in the Lakeshore neighborhood, providing a peaceful environment close to nature. It offers single and double rooms, all air-conditioned, with shared bathrooms. Residents benefit from quiet study spaces, comfortable lounges, and access to nearby walking and biking paths along Lake Mendota. Leopold Hall’s serene atmosphere is perfect for students who prefer a calm, focused living space while still being connected to the main campus.
                      </p>
                    </div>
                  </div>
                </div>
            
                <div class="box has-background-grey-lighter">
                  <div class="columns">
                      <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                          <img src="bradley.jpg" alt="Bradley Residence Hall" style="height:200px; width:250px;"/>
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0"> Bradley Residence Hall</p>
                      <p class="mt-0 mb-3"> <b> $ </b> - 650 Elm Drive Madison, WI 53706</p>
                      <p>
                          Bradley Hall, located in the Lakeshore neighborhood of UW–Madison, provides a traditional residence hall experience with double rooms and shared bathrooms. Known for its strong sense of community, Bradley offers cozy common areas, study lounges, and kitchens for residents. Its location near Lake Mendota offers easy access to outdoor activities and a quieter, more relaxed setting. Bradley Hall is well-suited for students who value a tight-knit living environment away from the busier parts of campus.
                      </p>
                    </div>
                  </div>
                </div>
        </div>
      </div>
          <footer class="footer is-flex is-justify-content-center mt-2 p-1">
      <div class="content has-text-centered" style="width: fit-content">
        <p>
          <b>Copyright &copy; 2024 Madison Area Housing</b><br />
          975 University Ave<br />
          Madison, WI 53715 <br />
          (608) 262-1550
        </p>
      </div>
    </footer>
    `);
  });

  // OFF CAMPUS
  r_e("offcampus-link").addEventListener("click", (event) => {
    event.preventDefault();
    loadContent(`
      <div id="offcampus">
        <div class="container">
          <h1 class="title has-text-centered mt-2 pt-2">Off Campus Living</h1>
  
          <!-- Boxes -->
          <div class="box">
            <div class="columns">
              <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                <img src="oliv.jpeg" alt="Oliv" style="height:200px; width:250px;" />
              </div>
              <div class="column">
                <p class="title is-5 mb-0">The Oliv</p>
                <p class="mt-0 mb-3"> <b> $$$ </b> - 339 W Gorham St, Madison, WI 53703</p>
                <p>
                  One of the newest apartments in Madison, located just steps from State Street,
                  Oliv provides a variety of units ranging from studios to 4-bedrooms, with premium
                  VIP and Mansion upgrades available. Each unit boasts energy-efficient appliances,
                  water-saving fixtures, and eco-friendly materials. The modern design focuses on
                  student life with private keyed bedrooms, blackout shades, walk-in closets, and
                  shared amenities like fully furnished common areas, state-of-the-art kitchen
                  appliances, and in-unit laundry. Residents can also enjoy high-end perks like
                  private outdoor terraces, hot tubs, and a communal atmosphere.
                </p>
              </div>
            </div>
          </div>
  
                <div class="box has-background-grey-lighter">
                  <div class="columns">
                      <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                          <img src="verve.jpeg" alt="Verve" style="height:200px; width:250px;"/>
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0">The Verve</p>
                      <p class="mt-0 mb-3"> <b> $$$ </b> - 506 W Johnson St, Madison, WI 53703</p>
                      <p>
                          The Verve stands out with its comprehensive set of amenities tailored for student convenience, including fully furnished 1 to 5-bedroom units with personal bathrooms and 55" SMART TVs. The apartments include features like keyless entry, Ecobee Smart Thermostats, and dimmable lighting. Outside the units, residents benefit from premium amenities like a game room, a modern fitness center, rooftop terrace, and spa-style showers in select units. The inviting balconies and private hot tubs add a touch of luxury, while the building’s prime location ensures easy access to campus life and State Street activities.
                      </p>
                    </div>
                  </div>
                </div>
                <div class="box">
                  <div class="columns">
                    <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                      <img src="embassy.jpeg" alt="Embassy" style="height:200px; width:250px;" />
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0">The Embassy</p>
                      <p class="mt-0 mb-3"> <b> $$ </b> - 505 University Ave, Madison, WI 53703</p>
                      <p>
                          Embassy Apartments cater to a range of living preferences with studio to 4-bedroom penthouses, emphasizing comfort with spacious layouts and individually keyed bedrooms. Fully furnished units come with high-speed internet, cable TV, and necessary kitchen appliances, making move-in seamless. Additional conveniences include on-site laundry, underground parking, a dedicated study room, and a secure location near the university and downtown attractions, creating a welcoming environment for both students and professionals.
                      </p>
                    </div>
                  </div>
                </div>
            
                <div class="box has-background-grey-lighter">
                  <div class="columns">
                      <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                          <img src="equinox.jpeg" alt="Equinox" style="height:200px; width:250px;"/>
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0">The Equinox</p>
                      <p class="mt-0 mb-3"> <b> $$ </b> - 409 W Gorham St, Madison, WI 53703</p>
                      <p>
                          This high-rise residence features modern, fully furnished studio to 4-bedroom penthouse units, with amenities like central air, dishwashers, and private balconies in select apartments. The building offers laundry facilities on every floor (except the first), heated underground parking, and secure entry with extensive surveillance systems for enhanced safety. Residents enjoy inclusive utilities, high-speed internet, and access to amenities like free moped and bicycle parking, making Equinox an ideal hassle-free living option near State Street and the Kohl Center.
                      </p>
                    </div>
                  </div>
                </div>
      
                <div class="box">
                  <div class="columns">
                    <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                      <img src="roundhouse.jpeg" alt="Roundhouse" style="height:200px; width:250px;" />
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0">Roundhouse</p>
                      <p class="mt-0 mb-3"> <b> $$ </b> - 626 Langdon St, Madison, WI 53703</p>
                      <p>
                          Roundhouse Apartments deliver a diverse range of unit sizes from studio to 4-bedrooms, designed with stainless steel appliances, walk-in closets, and large balconies that offer scenic views of Lake Mendota or the State Capitol. Amenities include on-site laundry, optional furnished units, and included heat. Its prime location near Memorial Union Terrace and other university sites makes it an excellent choice for students seeking a blend of convenience and modern living with quick access to Madison’s vibrant downtown scene.
                      </p>
                    </div>
                  </div>
                </div>
            
                <div class="box has-background-grey-lighter">
                  <div class="columns">
                      <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                          <img src="hub.jpg" alt="The Hub" style="height:200px; width:250px;"/>
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0">The Hub</p>
                      <p class="mt-0 mb-3"> <b> $$$ </b> - 432 W Gorham St, Madison, WI 53703</p>
                      <p>
                          The Hub houses a variety of apartment layouts designed for student living, including with studio through 5 bedroom units. These units come fully furnished and feature amenities like high-speed WiFi, fully equipped kitchens, walk-in closets, and in-unit washers and dryers. The complex also provides individual leases and roommate matching to simplify the living arrangements. The Hub also boasts a wide range of amenities, including a pool, cabanas, a clubhouse, a game room, and a golf simulator.
                      </p>
                    </div>
                  </div>
                </div>
      
                <div class="box">
                  <div class="columns">
                    <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                      <img src="420.jpg" alt="420 West" style="height:200px; width:250px;" />
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0">420 West</p>
                      <p class="mt-0 mb-3"> <b> $$ </b> - 420 W Gorham St, Madison, WI 53703</p>
                      <p>
                          This property features versatile units, from studios to 3-bedroom apartments with dens, equipped with modern amenities like controlled access and spacious balconies. Residents benefit from the building's location near the university, State Street, and the Kohl Center, making it a convenient base for both students and professionals who desire quick access to Madison's key spots and entertainment venues.
                      </p>
                    </div>
                  </div>
                </div>
            
                <div class="box has-background-grey-lighter">
                  <div class="columns">
                      <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                          <img src="505.jpeg" alt="505 N Carroll" style="height:200px; width:250px;"/>
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0">505 N Carroll</p>
                      <p class="mt-0 mb-3"> <b> $ </b> - 505 N Carroll, Madison, WI 53703</p>
                      <p>
                          Apartments at 505 N Carroll include options from studios to 5-bedroom units, with features designed for student living such as in-unit washers and dryers, stainless steel appliances, and ample walk-in closets. Its strategic location offers easy access to campus buildings, downtown Madison, and nearby amenities, creating an attractive choice for students who want a balance of convenience and comfort.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div class="box">
                  <div class="columns">
                    <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                      <img src="regent.jpg" alt="The Regent" style="height:200px; width:250px;" />
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0">The Regent Apartments</p>
                      <p class="mt-0 mb-3"> <b> $$ </b> - 1402 Regent St, Madison, WI 53711</p>
                      <p>
                          The Regent focuses on delivering a comprehensive student housing experience, with studio to 3-bedroom units available. Amenities include a fitness center, game room, study rooms, and a resident lounge equipped with a flat-screen TV. The outdoor common areas feature a grill station, fire pit, volleyball and basketball courts, adding to the community feel. Inclusive pricing covers all utilities, high-speed internet, and furniture, ensuring a smooth move-in process and a stress-free living environment close to the University.
                      </p>
                    </div>
                  </div>
                </div>
            
                <div class="box has-background-grey-lighter">
                  <div class="columns">
                      <div class="column is-one-third is-flex is-justify-content-center is-align-items-center">
                          <img src="james.jpg" alt="The James" style="height:200px; width:250px;"/>
                    </div>
                    <div class="column">
                      <p class="title is-5 mb-0">The James</p>
                      <p class="mt-0 mb-3"> <b> $$$ </b> - 432 W Gorham St, Madison, WI 53703</p>
                      <p>
                        The James delivers upscale student living with studio to 5-bedroom units, complete with stainless steel appliances, in-unit washers and dryers, and walk-in closets. Community amenities include a 24-hour fitness center, rooftop terrace, hot tub, swimming pool, and private study rooms. The building's close proximity to the University campus and downtown attractions enhances its appeal for students looking for a blend of luxury and convenience in their housing.
                    </p>
                    </div>
                  </div>
                </div>  
        </div>
      </div>
      <footer class="footer is-flex is-justify-content-center mt-2 p-1">
      <div class="content has-text-centered" style="width: fit-content">
        <p>
          <b>Copyright &copy; 2024 Madison Area Housing</b><br />
          975 University Ave<br />
          Madison, WI 53715 <br />
          (608) 262-1550
        </p>
      </div>
    </footer>
    `);
  });

  // Function to load content dynamically
  function loadContent(content) {
    document.querySelector("#main").innerHTML = content;
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
});
