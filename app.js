 // ==== Firebase Config ====
 const firebaseConfig = {
    apiKey: "AIzaSyCreY0yJPlnyY-RaONxxbKzACzVswtehqo",
    authDomain: "task-management-8e279.firebaseapp.com",
    projectId: "task-management-8e279",
    storageBucket: "task-management-8e279.appspot.com",
    messagingSenderId: "1097228320616",
    appId: "1:1097228320616:web:caf4a8bb587e1bca0aa0dd"
  };
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  // ==== UI Elements ====
  const loginModal = document.getElementById('login-modal');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  const userEmailSpan = document.getElementById('user-email');
  const loginError = document.getElementById('login-error');
  const loginSuccess = document.getElementById('login-success');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const modalTitle = document.getElementById('modal-title');
  const password2 = document.getElementById('register-password2');
  const switchToRegister = document.getElementById('switch-to-register');
  const switchToLogin = document.getElementById('switch-to-login');
  const taskError = document.getElementById('task-error');
  const taskSuccess = document.getElementById('task-success');
  const loadingTasks = document.getElementById('loading-tasks');
  const addTaskTitle = document.getElementById('add-task-title');
  const createTaskBtn = document.getElementById('create-task-btn');
  const updateTaskBtn = document.getElementById('update-task-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const profileEmail = document.getElementById('profile-email');
  const profileUid = document.getElementById('profile-uid');

  let unsubscribeTasks = null;
  let editingTaskId = null;

  // ==== Section Show/Hide Logic ====
  function showSection(section) {
    document.getElementById('section-dashboard').style.display = section === 'dashboard' ? '' : 'none';
    document.getElementById('section-add-task').style.display = section === 'add-task' ? '' : 'none';
    document.getElementById('section-task-board').style.display = section === 'task-board' ? '' : 'none';
    document.getElementById('section-profile').style.display = section === 'profile' ? '' : 'none';
    // If profile, update info
    if (section === 'profile' && auth.currentUser) {
      profileEmail.textContent = auth.currentUser.email;
      profileUid.textContent = auth.currentUser.uid;
    }
  }

  // ==== Auth State Listener ====
  auth.onAuthStateChanged(user => {
    if (user) {
      loginModal.style.display = 'none';
      sidebar.style.display = 'block';
      mainContent.style.display = 'block';
      userEmailSpan.textContent = user.email;
      clearModal();
      subscribeTasks();
      showSection('dashboard'); // Default to dashboard on login
    } else {
      loginModal.style.display = 'block';
      sidebar.style.display = 'none';
      mainContent.style.display = 'none';
      userEmailSpan.textContent = '';
      clearModal();
      showLogin();
      if (unsubscribeTasks) unsubscribeTasks();
      // Clear dashboard tasks on logout
      const dashboardTasks = document.getElementById('dashboard-tasks');
      if (dashboardTasks) dashboardTasks.innerHTML = "";
      // Clear task board columns on logout
      ['todo-tasks', 'inprogress-tasks', 'done-tasks'].forEach(id => {
        const col = document.getElementById(id);
        if (col) col.innerHTML = "";
      });
    }
  });

  // ==== Login Function ====
  window.login = function() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    loginError.textContent = '';
    loginSuccess.textContent = '';
    if (!email || !password) {
      loginError.textContent = "Please enter email and password.";
      return;
    }
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        loginSuccess.textContent = "Login successful!";
      })
      .catch(error => {
        loginError.textContent = error.message;
      });
  };

  // ==== Register Function ====
  window.register = function() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const passwordConfirm = document.getElementById('register-password2').value;
    loginError.textContent = '';
    loginSuccess.textContent = '';
    if (!email || !password || !passwordConfirm) {
      loginError.textContent = "Please fill all fields.";
      return;
    }
    if (password !== passwordConfirm) {
      loginError.textContent = "Passwords do not match.";
      return;
    }
    if (password.length < 6) {
      loginError.textContent = "Password should be at least 6 characters.";
      return;
    }
    auth.createUserWithEmailAndPassword(email, password)
      .then(() => {
        loginSuccess.textContent = "Registration successful!";
      })
      .catch(error => {
        loginError.textContent = error.message;
      });
  };

  // ==== Logout Function ====
  window.logout = function() {
    auth.signOut();
  };

  // ==== Toggle Modal: Login/Register ====
  window.showRegister = function() {
    modalTitle.textContent = "Register";
    loginBtn.style.display = "none";
    registerBtn.style.display = "block";
    password2.style.display = "block";
    switchToRegister.style.display = "none";
    switchToLogin.style.display = "inline";
    clearModal();
  };
  window.showLogin = function() {
    modalTitle.textContent = "Login";
    loginBtn.style.display = "block";
    registerBtn.style.display = "none";
    password2.style.display = "none";
    switchToRegister.style.display = "inline";
    switchToLogin.style.display = "none";
    clearModal();
  };
  function clearModal() {
    loginError.textContent = "";
    loginSuccess.textContent = "";
    document.getElementById('login-password').value = "";
    if (password2) password2.value = "";
  }

  // ==== Today's Date ====
  document.addEventListener('DOMContentLoaded', () => {
    const todayDate = document.getElementById('today-date');
    if (todayDate) {
      const today = new Date();
      todayDate.textContent = today.toLocaleDateString();
    }
  });

  // ==== Create Task ====
  window.createTask = async function(event) {
    taskError.textContent = "";
    taskSuccess.textContent = "";
    const title = document.getElementById('task-title').value.trim();
    const desc = document.getElementById('task-desc').value.trim();
    const assignedTo = document.getElementById('assigned-to').value.trim();
    if (!title || !desc || !assignedTo) {
      taskError.textContent = "Please fill all fields.";
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      taskError.textContent = "You must be logged in.";
      return;
    }
    createTaskBtn.disabled = true;
    try {
      await db.collection('tasks').add({
        title,
        desc,
        assignedTo,
        status: 'todo',
        createdBy: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      document.getElementById('task-title').value = "";
      document.getElementById('task-desc').value = "";
      document.getElementById('assigned-to').value = "";
      taskSuccess.textContent = "Task created!";
    } catch (err) {
      taskError.textContent = "Error creating task: " + err.message;
    }
    createTaskBtn.disabled = false;
  };

  // ==== Edit Task ====
  window.editTask = function(taskId, task) {
    editingTaskId = taskId;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-desc').value = task.desc;
    document.getElementById('assigned-to').value = task.assignedTo;
    addTaskTitle.textContent = "Edit Task";
    createTaskBtn.style.display = "none";
    updateTaskBtn.style.display = "inline-block";
    cancelEditBtn.style.display = "inline-block";
    taskError.textContent = "";
    taskSuccess.textContent = "";
    showSection('add-task');
  };

  window.cancelEdit = function() {
    editingTaskId = null;
    document.getElementById('task-title').value = "";
    document.getElementById('task-desc').value = "";
    document.getElementById('assigned-to').value = "";
    addTaskTitle.textContent = "Add New Task";
    createTaskBtn.style.display = "inline-block";
    updateTaskBtn.style.display = "none";
    cancelEditBtn.style.display = "none";
    taskError.textContent = "";
    taskSuccess.textContent = "";
  };

  window.updateTask = async function(event) {
    taskError.textContent = "";
    taskSuccess.textContent = "";
    if (!editingTaskId) return;
    const title = document.getElementById('task-title').value.trim();
    const desc = document.getElementById('task-desc').value.trim();
    const assignedTo = document.getElementById('assigned-to').value.trim();
    if (!title || !desc || !assignedTo) {
      taskError.textContent = "Please fill all fields.";
      return;
    }
    updateTaskBtn.disabled = true;
    try {
      await db.collection('tasks').doc(editingTaskId).update({
        title, desc, assignedTo
      });
      taskSuccess.textContent = "Task updated!";
      window.cancelEdit();
    } catch (err) {
      taskError.textContent = "Error updating task: " + err.message;
    }
    updateTaskBtn.disabled = false;
  };

  // ==== Real-time Task Subscription ====
  function subscribeTasks() {
const user = auth.currentUser;
if (!user) return;
loadingTasks.style.display = "block";
if (unsubscribeTasks) unsubscribeTasks();
unsubscribeTasks = db.collection('tasks')
  .where('createdBy', '==', user.uid)
  .orderBy('createdAt', 'desc')
  .onSnapshot(snapshot => {
    // Always clear columns if they exist
    const todoTasksDiv = document.getElementById('todo-tasks');
    const inprogressTasksDiv = document.getElementById('inprogress-tasks');
    const doneTasksDiv = document.getElementById('done-tasks');
    if (todoTasksDiv) todoTasksDiv.innerHTML = "";
    if (inprogressTasksDiv) inprogressTasksDiv.innerHTML = "";
    if (doneTasksDiv) doneTasksDiv.innerHTML = "";

    // Collect tasks for dashboard and board
    let tasks = [];
    snapshot.forEach(doc => {
      const task = doc.data();
      const taskWithId = { ...task, id: doc.id };
      tasks.push(taskWithId);

      // Render to Task Board columns if present
      let colDiv = null;
      if (task.status === 'todo') colDiv = todoTasksDiv;
      else if (task.status === 'inprogress') colDiv = inprogressTasksDiv;
      else if (task.status === 'done') colDiv = doneTasksDiv;
      if (colDiv) {
        const taskDiv = document.createElement('div');
        taskDiv.className = "task-item";
        taskDiv.innerHTML = `
          <strong>${escapeHtml(task.title)}</strong><br>
          <span>${escapeHtml(task.desc)}</span><br>
          <small>Assigned to: ${escapeHtml(task.assignedTo)}</small><br>
          <div class="task-actions">
            <button onclick="editTask('${doc.id}', ${JSON.stringify(taskWithId).replace(/"/g, '&quot;')})">Edit</button>
            ${task.status !== 'todo' ? `<button onclick="updateTaskStatus('${doc.id}', 'todo')">To Do</button>` : ''}
            ${task.status !== 'inprogress' ? `<button onclick="updateTaskStatus('${doc.id}', 'inprogress')">In Progress</button>` : ''}
            ${task.status !== 'done' ? `<button onclick="updateTaskStatus('${doc.id}', 'done')">Done</button>` : ''}
            <button onclick="deleteTask('${doc.id}')">Delete</button>
          </div>
        `;
        colDiv.appendChild(taskDiv);
      }
    });
    showDashboardTasks(tasks);
    loadingTasks.style.display = "none";
  }, err => {
    loadingTasks.style.display = "none";
    alert("Error loading tasks: " + err.message);
  });
}

  // ==== HTML Escape Utility ====
  function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/[&<>"']/g, function(m) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m];
    });
  }
  
// ==== Update Task Status ====
window.updateTaskStatus = async function(taskId, newStatus) {
try {
  await db.collection('tasks').doc(taskId).update({
    status: newStatus
  });
  // Optionally, show a success message or visual feedback
} catch (err) {
  alert("Error updating task status: " + err.message);
}
};

// ==== Delete Task ====
window.deleteTask = async function(taskId) {
if (!confirm("Are you sure you want to delete this task?")) return;
try {
  await db.collection('tasks').doc(taskId).delete();
  // Optionally, show a success message or visual feedback
} catch (err) {
  alert("Error deleting task: " + err.message);
}
};