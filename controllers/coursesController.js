const { courses } = require("../models");
const { Op } = require("sequelize");

exports.getAll = async (req, res) => {
  try {
    const data = await courses.findAll({
      // sequelize puts in order but if needed
      order: [["created_at", "ASC"]],
      attributes: [
        ["id", "id"],
        ["name", "name"],
      ],
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(`An error has occurred: ${error}`);
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;

    // check if course has been deleted
    const deleted = await courses.findOne({
      where: { id: id, deleted_at: { [Op.not]: null } },
      paranoid: false,
    });
    if (deleted) {
      return res
        .status(410)
        .json(`Course with id: ${id} has already been deleted`);
    }

    const data = await courses.findOne({
      where: { id: id },
      attributes: { exclude: ["deleted_at"] },
    });

    // check if course exists
    if (!data) {
      return res.status(404).json(`Couldn't find course with id: ${id}`);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(`An error has occurred: ${error}`);
  }
};

exports.createCourse = async (req, res) => {
  try {
    const body = req.body;

    // check for requirements
    if (!body.name) {
      return res.status(400).json("A course name is required");
    }
    if (
      body.status != "scheduled" &&
      body.status != "in_production" &&
      body.status != "available"
    ) {
      return res
        .status(400)
        .json("Status must be one of: scheduled, in_production, or available");
    }

    // create course
    const data = {
      name: body.name,
      status: body.status,
    };

    const created = await courses.create(data);

    // set location header
    res.setHeader("Location", `/courses/${created.id}`);

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json(`An error has occurred: ${error}`);
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    // check if course has already been deleted
    const deleted = await courses.findOne({
      where: { id: id, deleted_at: { [Op.not]: null } },
      paranoid: false,
    });
    if (deleted) {
      return res
        .status(410)
        .json(`Course with id: ${id} has already been deleted`);
    }

    // check if course exists
    const found = await courses.findByPk(id);
    if (!found) {
      return res.status(404).json(`Couldn't find course with id: ${id}`);
    }

    // check for requirements
    if (!body.name) {
      return res.status(400).json("A course name is required");
    }
    if (
      body.status != "available" &&
      body.status != "in_production" &&
      body.status != "available"
    ) {
      return res
        .status(400)
        .json("Status must be one of: scheduled, in_production, or available");
    }

    // update course
    const data = {
      name: body.name,
      status: body.status,
    };

    const updated = await courses.update(data, { where: { id: id } });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json(`An error has occurred: ${error}`);
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // check if course has already been deleted
    const deleted = await courses.findOne({
      where: { id: id, deleted_at: { [Op.not]: null } },
      paranoid: false,
    });
    if (deleted) {
      return res
        .status(410)
        .json(`Course with id: ${id} has already been deleted`);
    }

    // check if course exists
    const found = await courses.findOne({ where: { id: id } });
    if (!found) {
      return res.status(404).json(`Course with id: ${id} doesn't exist`);
    }

    // delete course
    await courses.destroy({ where: { id: id } });

    res.status(204).json();
  } catch (error) {
    res.status(500).json(`An error has occurred: ${error}`);
  }
};
