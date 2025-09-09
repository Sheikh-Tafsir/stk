const express = require("express");
const cookieParser = require('cookie-parser');
const http = require('http');

const { CorsMiddleware } = require("./src/middleware/CorsMiddleware");
const TrimInput = require("./src/middleware/TrimInput");
const ErrorHandler = require("./src/middleware/ErrorHandler");
const SocketConfig = require("./src/config/SocketConfig");
const RateLimiter = require("./src/middleware/RateLimiter");

const CommonController = require("./src/controller/CommonController");
const AuthController = require("./src/controller/AuthController");
const UserController = require("./src/controller/UserController");
const ProfileController = require("./src/controller/ProfileController");
const ParticipantController = require("./src/controller/ParticipantController");
const CareGiverController = require("./src/controller/CareGiverController");
const ChatController = require("./src/controller/ChatController");
const TaskController = require("./src/controller/TaskController");
const ClassController = require("./src/controller/ClassController");
const BudgetController = require("./src/controller/BudgetController");
const GoalController = require("./src/controller/GoalController");
const QuizController = require("./src/controller/QuizController");

require("dotenv").config();
const app = express();

app.use(
  CorsMiddleware,
  express.json({ limit: '5mb' }),
  cookieParser(),
  TrimInput
);

if (process.env.NODE_ENV == "production") {
  app.use(RateLimiter.speedLimiter, RateLimiter.rateLimiter);
}

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use("/common", CommonController)
app.use("/auth", AuthController)
app.use("/users", UserController);
app.use("/profile", ProfileController);
app.use("/participants", ParticipantController);
app.use("/caregivers", CareGiverController);
app.use("/chats", ChatController);
app.use("/tasks", TaskController);
app.use("/class", ClassController);
app.use("/budget", BudgetController);
app.use("/goals", GoalController);
app.use("/quizes", QuizController);

app.use(ErrorHandler);

const server = http.createServer(app);
SocketConfig(server);

const listener = process.env.NODE_ENV == "production" ? app : server;

listener.listen(process.env.PORT, () => {
  console.info(`Server is running ${process.env.SERVER_PATH}.`);
});