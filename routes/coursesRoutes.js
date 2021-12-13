const Router = require("express").Router();
const controller = require("../controllers/coursesController");

Router.get("/", controller.getAll);
Router.get("/:id", controller.getOne);

Router.post("/", controller.createCourse);

Router.put("/:id", controller.updateCourse);

Router.delete("/:id", controller.deleteCourse);

module.exports = Router;
