"use strict";

module.exports = function (app) {
  const mongoose = require("mongoose");
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const projectShema = new mongoose.Schema({
    assigned_to: String,
    status_text: String,
    open: Boolean,
    issue_title: String,
    issue_text: String,
    created_by: String,
    created_on: Date,
    updated_on: Date,
  });

  let Project = mongoose.model("Project", projectShema);

  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
    })

    .post(function (req, res) {
      let project = req.params.project;
      console.log(req.body.issue_title);
    })

    .put(function (req, res) {
      let project = req.params.project;
    })

    .delete(function (req, res) {
      let project = req.params.project;
    });
};
