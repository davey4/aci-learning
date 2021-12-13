const Router = require("express").Router();
const CoursesRouter = require("./coursesRoutes");

Router.use("/courses", CoursesRouter);

module.exports = Router;
