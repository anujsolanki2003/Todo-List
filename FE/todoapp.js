const apiUrl = "http://localhost:5000/api";

// Handle document ready state
document.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem("Name");

  // Registration Form
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const Name = document.getElementById("Name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const address = document.getElementById("address").value.trim();

      if (!Name || !email || !password || !address) {
        alert("All fields are required.");
        return;
      }

      if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Name, email, password, address }),
        });
        const data = await response.json();
        alert(data.message);
        if (response.ok) {
          window.location.href = "login.html";
        }
      } catch (err) {
        alert("Registration failed: " + err.message);
      }
    });
  }

  // Login Form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (!email || !password) {
        alert("Both email and password are required.");
        return;
      }

      if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("Name", data.Name);
          window.location.href = "todos.html";
        } else {
          alert(data.message);
        }
      } catch (err) {
        alert("Login failed: " + err.message);
      }
    });
  }

  // Todos Page
  const todoList = document.getElementById("todoList");
  if (todoList) {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "login.html";
    }

    document.getElementById("greet").textContent = `Hi, ${name}`;

    // Fetch all todos
    const fetchTodos = async () => {
      try {
        const response = await fetch(`${apiUrl}/todos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const todos = await response.json();
        todoList.innerHTML = "";
        todos.forEach((todo) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <span>${todo.task} - ${todo.description} - ${todo.status}</span>
            <button class="update" data-id="${todo.id}">Update</button>
            <button class="delete" data-id="${todo.id}">Delete</button>
          `;
          todoList.appendChild(li);
        });
      } catch (err) {
        alert("Failed to fetch todos: " + err.message);
      }
    };

    // Fetch todos on page load
    fetchTodos();

    // Handle todo form submission
    document.getElementById("todoForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const task = document.getElementById("task").value.trim();
      const description = document.getElementById("description").value.trim();
      const status = document.getElementById("status").value.trim();

      if (!task || !description || !status) {
        alert("All fields are required.");
        return;
      }

      if (!["Pending", "In Progress", "Completed"].includes(status)) {
        alert("Status must be one of: Pending, In Progress, Completed.");
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/todos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ task, description, status }),
        });
        await response.json();
        fetchTodos(); // Refresh the todo list
      } catch (err) {
        alert("Failed to add todo: " + err.message);
      }
    });

    // Handle todo list interactions (update and delete)
    todoList.addEventListener("click", async (e) => {
      if (e.target.classList.contains("delete")) {
        const todoId = e.target.dataset.id;
        if (confirm("Are you sure you want to delete this task?")) {
          try {
            await fetch(`${apiUrl}/todos/${todoId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            fetchTodos(); // Refresh the todo list
          } catch (err) {
            alert("Failed to delete todo: " + err.message);
          }
        }
      } else if (e.target.classList.contains("update")) {
        const todoId = e.target.dataset.id;
        const newTask = prompt("Enter new task:");
        const newDescription = prompt("Enter new description:");
        const newStatus = prompt(
          "Enter new status (Pending, In Progress, Completed):"
        );

        if (!newTask || !newDescription || !newStatus) {
          alert("Please provide all the details.");
          return;
        }

        if (!["Pending", "In Progress", "Completed"].includes(newStatus)) {
          alert("Status must be one of: Pending, In Progress, Completed.");
          return;
        }

        try {
          await fetch(`${apiUrl}/todos/${todoId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              task: newTask,
              description: newDescription,
              status: newStatus,
            }),
          });
          fetchTodos(); // Refresh the todo list
        } catch (err) {
          alert("Failed to update todo: " + err.message);
        }
      }
    });

    // Fetch todos with search query
    const fetchTodosWithSearch = async (query = "") => {
      try {
        const response = await fetch(
          `${apiUrl}/todos/search?q=${encodeURIComponent(query)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const todos = await response.json();
        todoList.innerHTML = "";
        todos.forEach((todo) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <span>${todo.task} - ${todo.description} - ${todo.status}</span>
            <button class="update" data-id="${todo.id}">Update</button>
            <button class="delete" data-id="${todo.id}">Delete</button>
          `;
          todoList.appendChild(li);
        });
      } catch (err) {
        alert("Failed to fetch todos: " + err.message);
      }
    };

    // Handle search form submission
    document.getElementById("searchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const query = document.getElementById("searchQuery").value.trim();
      fetchTodosWithSearch(query);
    });

    // Handle logout
    document.getElementById("logout").addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    });

    // Handle fetchTodosWithUser button click
    document.getElementById("fetchTodosWithUser").addEventListener("click", async () => {
      try {
        const response = await fetch(`${apiUrl}/todos/with-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const todos = await response.json();
        todoList.innerHTML = "";
        todos.forEach((todo) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <span>${todo.task} - ${todo.description} - ${todo.status} - Created by: ${todo.User.Name} - ${todo.User.email}</span>
          `;
          todoList.appendChild(li);
        });
      } catch (err) {
        alert("Failed to fetch todos with user info: " + err.message);
      }
    });

    // Handle fetchUsersWithTodos button click
    document.getElementById("fetchUsersWithTodos").addEventListener("click", async () => {
      try {
        const response = await fetch(`${apiUrl}/todos/with-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const todos = await response.json();
        todoList.innerHTML = "";
        
        todos.forEach(todo => {
          const li = document.createElement("li");
          li.innerHTML = `
            <strong>${todo.User.Name} (${todo.User.email})</strong>
            <ul>
              <li>${todo.task} - ${todo.description} - ${todo.status}</li>
            </ul>
          `;
          todoList.appendChild(li);
        });
      } catch (err) {
        alert("Failed to fetch todos with user info: " + err.message);
      }
    });
  }
});
