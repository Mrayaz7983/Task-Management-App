// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCreY0yJPlnyY-RaONxxbKzACzVswtehqo",
//   authDomain: "task-management-8e279.firebaseapp.com",
//   projectId: "task-management-8e279",
//   storageBucket: "task-management-8e279.firebasestorage.app",
//   messagingSenderId: "1097228320616",
//   appId: "1:1097228320616:web:caf4a8bb587e1bca0aa0dd"
// };
// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();
// const db = firebase.firestore();

// // Global variable for snapshot unsubscribe
// let unsubscribeTasks = null;

// // UI Elements
// const loginModal = document.getElementById('login-modal');
// const dashboard = document.getElementById('dashboard');
// const userEmailSpan = document.getElementById('user-email');
// const loginError = document.getElementById('login-error');
// const loginSuccess = document.getElementById('login-success');
// const loginBtn = document.getElementById('login-btn');
// const registerBtn = document.getElementById('register-btn');
// const modalTitle = document.getElementById('modal-title');
// const registerPasswordField = document.getElementById('register-confirm-password');
// const switchToRegister = document.getElementById('switch-to-register');
// const switchToLogin = document.getElementById('switch-to-login');

// // Auth Check
// auth.onAuthStateChanged(user => {
//   if (user) {
//     // User is logged in
//     if (loginModal) loginModal.style.display = 'none';
//     if (dashboard) dashboard.style.display = 'block';
//     if (userEmailSpan) userEmailSpan.innerText = user.email;
//     clearAuthForms();
//     loadTasks();
//   } else {
//     // User is not logged in
//     if (loginModal) loginModal.style.display = 'block';
//     if (dashboard) dashboard.style.display = 'none';
//     if (userEmailSpan) userEmailSpan.innerText = '';
//     clearAuthForms();
//     showLogin();
//   }
// });

// // Login Function
// function login(event) {
//   if (event) event.preventDefault();
  
//   const email = document.getElementById('login-email').value.trim();
//   const password = document.getElementById('login-password').value;
  
//   if (loginError) loginError.textContent = '';
//   if (loginSuccess) loginSuccess.textContent = '';
  
//   if (!email || !password) {
//     if (loginError) loginError.textContent = 'Please enter both email and password';
//     return;
//   }
  
//   auth.signInWithEmailAndPassword(email, password)
//     .then(() => {
//       if (loginSuccess) loginSuccess.textContent = 'Login successful!';
//       console.log('Login successful');
//       if (document.getElementById('login-form')) {
//         document.getElementById('login-form').reset();
//       }
//     })
//     .catch(error => {
//       console.error('Login Error:', error);
//       if (loginError) loginError.textContent = error.message;
//     });
// }
    
// // Logout
// function logout() {
//   auth.signOut().then(() => {
//     console.log('Logout successful');
//   }).catch(error => {
//     console.error("Logout Error:", error);
//   });
// }

// // Create Task
// function createTask(event) {
//   event.preventDefault(); // Prevent form from reloading page
  
//   const title = document.getElementById("task-title").value.trim();
//   const description = document.getElementById("task-desc").value.trim();
//   const assignedTo = document.getElementById("assigned-to").value.trim();

//   if (title === "" || assignedTo === "") {
//     alert("Please fill all fields!");
//     return;
//   }

//   db.collection("tasks").add({
//     title,
//     description,
//     assignedTo,
//     status: "To Do",
//     createdAt: firebase.firestore.FieldValue.serverTimestamp()
//   }).then(() => {
//     clearTaskInputs();
//     alert("Task Created Successfully!");
//   }).catch(error => {
//     console.error("Error creating task:", error);
//   });
// }

// // Clear Input Fields
// function clearTaskInputs() {
//   document.getElementById("task-title").value = "";
//   document.getElementById("task-desc").value = "";
//   document.getElementById("assigned-to").value = "";
// }

// // Load Tasks
// function loadTasks() {
//   if (unsubscribeTasks) {
//     unsubscribeTasks(); // unsubscribe previous listener
//   }

//   unsubscribeTasks = db.collection("tasks").orderBy("createdAt").onSnapshot(snapshot => {
//     // Clear all columns first
//     document.getElementById("todo").innerHTML = "<h2>To Do</h2>";
//     document.getElementById("inprogress").innerHTML = "<h2>In Progress</h2>";
//     document.getElementById("done").innerHTML = "<h2>Done</h2>";

//     snapshot.forEach(doc => {
//       const task = doc.data();
//       const id = doc.id;
//       renderTask(id, task);
//     });
//   });
// }

// // Render Task Card
// function renderTask(id, task) {
//   const div = document.createElement("div");
//   div.className = "task-card-item";

//   div.innerHTML = `
//     <h4>${task.title}</h4>
//     <p>${task.description || "No Description"}</p>
//     <small>Assigned to: ${task.assignedTo}</small>
//     <div style="margin-top: 10px;">
//       ${task.status !== "In Progress" ? `<button onclick="moveTask('${id}', 'In Progress')">Move to In Progress</button>` : ""}
//       ${task.status !== "Done" ? `<button onclick="moveTask('${id}', 'Done')">Move to Done</button>` : ""}
//       <button onclick="deleteTask('${id}')">Delete</button>
//     </div>
//   `;

//   const statusColumnId = task.status.toLowerCase().replace(/\s/g, '');
//   const statusColumn = document.getElementById(statusColumnId);

//   if (statusColumn) {
//     statusColumn.appendChild(div);
//   } else {
//     console.warn(`Status column not found: ${statusColumnId}`);
//   }
// }

// // Move Task
// function moveTask(id, newStatus) {
//   db.collection("tasks").doc(id).update({
//     status: newStatus
//   }).then(() => {
//     console.log(`Task moved to ${newStatus}`);
//   }).catch(error => {
//     console.error("Error moving task:", error);
//   });
// }

// // Delete Task
// function deleteTask(id) {
//   if (confirm("Are you sure you want to delete this task?")) {
//     db.collection("tasks").doc(id).delete().then(() => {
//       console.log("Task deleted successfully!");
//     }).catch(error => {
//       console.error("Error deleting task:", error);
//     });
//   }
// }

// // Today's Date
// const today = new Date();
// if (document.getElementById("today-date")) {
//   document.getElementById("today-date").innerText = today.toDateString();
// }

// // Toggle between Login and Register UI
// function showRegister() {
//   if (modalTitle) modalTitle.textContent = "Register";
//   if (loginBtn) loginBtn.style.display = "none";
//   if (registerBtn) registerBtn.style.display = "block";
//   if (registerPasswordField) registerPasswordField.style.display = "block";
//   if (switchToRegister) switchToRegister.style.display = "none";
//   if (switchToLogin) switchToLogin.style.display = "inline";
//   clearAuthForms();
// }

// function showLogin() {
//   if (modalTitle) modalTitle.textContent = "Login";
//   if (loginBtn) loginBtn.style.display = "block";
//   if (registerBtn) registerBtn.style.display = "none";
//   if (registerPasswordField) registerPasswordField.style.display = "none";
//   if (switchToRegister) switchToRegister.style.display = "inline";
//   if (switchToLogin) switchToLogin.style.display = "none";
//   clearAuthForms();
// }

// function clearAuthForms() {
//   if (loginError) loginError.textContent = "";
//   if (loginSuccess) loginSuccess.textContent = "";
//   const passwordField = document.getElementById('login-password');
//   if (passwordField) passwordField.value = "";
//   if (registerPasswordField) registerPasswordField.value = "";
// }

// // Register new user
// function register(event) {
//   if (event) event.preventDefault();
  
//   const email = document.getElementById('login-email').value.trim();
//   const password = document.getElementById('login-password').value;
//   const confirmPassword = document.getElementById('register-confirm-password').value;
  
//   if (loginError) loginError.textContent = '';
//   if (loginSuccess) loginSuccess.textContent = '';
  
//   if (!email || !password || !confirmPassword) {
//     if (loginError) loginError.textContent = 'Please fill all fields';
//     return;
//   }
  
//   if (password !== confirmPassword) {
//     if (loginError) loginError.textContent = 'Passwords do not match';
//     return;
//   }
  
//   if (password.length < 6) {
//     if (loginError) loginError.textContent = 'Password should be at least 6 characters';
//     return;
//   }
  
//   auth.createUserWithEmailAndPassword(email, password)
//     .then(() => {
//       if (loginSuccess) loginSuccess.textContent = 'Registration successful! Logging in...';
//       console.log('Registration successful');
//       setTimeout(() => {
//         showLogin();
//       }, 1200);
//     })
//     .catch(error => {
//       console.error('Registration Error:', error);
//       if (loginError) loginError.textContent = error.message;
//     });
// }
