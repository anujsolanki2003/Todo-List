const express = require("express");
const { Sequelize, DataTypes, Op } = require("sequelize");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../FE")));

// Set up Sequelize with MySQL
const sequelize = new Sequelize("todo", "root", "sol@4217", {
  host: "localhost",
  dialect: "mysql",
  logging: false, 
});

// Define User Model
const User = sequelize.define("User", {
  Name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    defaultValue: "Dehradun",
  },
});

// Define Todo Model
const Todo = sequelize.define("Todo", {
  task: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Pending",
    validate: {
      isIn: [["Pending", "In Progress", "Completed"]],
    },
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
    },
  },
});

User.hasMany(Todo, { foreignKey: 'createdBy' });
Todo.belongsTo(User, { foreignKey: 'createdBy' });
// Sync models with database
sequelize.sync().then(() => console.log("Database connected"));

// Register User
app.post("/api/register", async (req, res) => {
  const { Name, email, password, address } = req.body;
  if (!Name || !email || !password) {
    return res.status(400).json({ message: "Please provide all fields" });
  }
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(403)
        .json({ message: "Email already registered, please login" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      Name,
      email,
      password: hashedPassword,
      address,
    });
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
});

// Login User
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, "your_jwt_secret", {
      expiresIn: "1h",
    });
    res.json({ token ,Name:user.Name});
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, "your_jwt_secret", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Route to get all todos
app.get("/api/todos", authenticateToken, async (req, res) => {
  try {
    const todos = await Todo.findAll({
      where: { createdBy: req.user.id },
    });
    res.json(todos);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving todos", error: err.message });
  }
});

app.post("/api/todos", authenticateToken, async (req, res) => {
  const { task, description, status } = req.body;
  try {
    const newTodo = await Todo.create({
      task,
      description,
      status,
      createdBy: req.user.id,
    });
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put("/api/todos/:id", authenticateToken, async (req, res) => {
  const todoId = req.params.id;

  if (!todoId) return res.status(400).json({ message: "Todo ID is required" });

  try {
    const todo = await Todo.findOne({
      where: { id: todoId, createdBy: req.user.id },
    });

    if (!todo) {
      return res
        .status(404)
        .json({ message: "Todo not found or not authorized" });
    }

    await todo.update(req.body);
    res.json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/todos/:id", authenticateToken, async (req, res) => {
  const todoId = req.params.id;

  if (!todoId) return res.status(400).json({ message: "Todo ID is required" });

  try {
    const todo = await Todo.findOne({
      where: { id: todoId, createdBy: req.user.id },
    });

    if (!todo) {
      return res
        .status(404)
        .json({ message: "Todo not found or not authorized" });
    }

    await todo.destroy();
    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Inner Join
app.get("/api/todos/with-user", authenticateToken, async (req, res) => {
  try {
      const todos = await Todo.findAll({
          where: { createdBy: req.user.id }, 
          include: { model: User, attributes: ['Name', 'email'] } // Include User model and specify attributes
      });
      res.json(todos);
  } catch (err) {
      res.status(500).json({ message: "Error retrieving todos with user info", error: err.message });
  }
});



// Left Join
app.get("/api/users-with-todos", authenticateToken, async (req, res) => {
  try {
      const users = await User.findAll({
          where: { id: req.user.id }, // Filter to get only the logged-in user
          include: [{
              model: Todo,
              required: false
          }]
      });
      res.json(users);
  } catch (err) {
      res.status(500).json({ message: "Error retrieving users with todos", error: err.message });
  }
});



// Right Join 
// app.get("/api/todos-with-users", authenticateToken, async (req, res) => {
//   try {
//     const todos = await sequelize.query(
//       `SELECT * FROM Todos AS t
//        LEFT JOIN Users AS u ON t.createdBy = u.id`,
//       { type: Sequelize.QueryTypes.SELECT }
//     );
//     res.json(todos);
//   } catch (err) {
//     res.status(500).json({ message: "Error retrieving todos with users", error: err.message });
//   }
// });

// Route to search todos
app.get("/api/todos/search", authenticateToken, async (req, res) => {
  const query = req.query.q;
  console.log("Received search query:", req.user.id); // Log the query to check if it's being received correctly

  try {
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const todos = await Todo.findAll({
      where: {
        createdBy: req.user.id,
        [Op.or]: [
          { task: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
        ],
      },
    });
    res.json(todos);
  } catch (err) {
    console.error("Error searching todos:", err.message); // Log any errors
    res
      .status(500)
      .json({ message: "Error searching todos", error: err.message });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
