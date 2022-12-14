"use strict";

const { ObjectId } = require("mongoose");

module.exports = function (app) {
  const express = require("express");
  const cors = require("cors");
  require("dotenv").config();
  const mongoose = require("mongoose");
  const objId = mongoose.Types.ObjectId;
  app.use(cors());
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const issueShecma = new mongoose.Schema({
    assigned_to: String,
    status_text: String,
    open: Boolean,
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    created_on: Date,
    updated_on: Date,
  });

  let Issue = mongoose.model("Issue", issueShecma);

  const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    issues: [issueShecma],
  });
  let Project = mongoose.model("Project", projectSchema);

  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;

      const {
        _id,
        open,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.query;

      Project.aggregate([
        { $match: { name: project } },
        { $unwind: "$issues" },
        _id != undefined
          ? { $match: { "issues._id": objId(_id) } }
          : { $match: {} },
        open != undefined
          ? { $match: { "issues.open": open } }
          : { $match: {} },
        issue_title != undefined
          ? { $match: { "issues.issue_title": issue_title } }
          : { $match: {} },
        issue_text != undefined
          ? { $match: { "issues.issue_text": issue_text } }
          : { $match: {} },
        created_by != undefined
          ? { $match: { "issues.created_by": created_by } }
          : { $match: {} },
        assigned_to != undefined
          ? { $match: { "issues.assigned_to": assigned_to } }
          : { $match: {} },
        status_text != undefined
          ? { $match: { "issues.status_text": status_text } }
          : { $match: {} },
      ]).exec((err, data) => {
        if (!data) {
          res.json([]);
        } else {
          let mappedData = data.map((item) => item.issues);
          res.json(mappedData);
        }
      });
    })

    .post(function (req, res) {
      let project = req.params.project;
      const rb = req.body;
      if (!rb.issue_title || !rb.issue_text || !rb.created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }
      const issue = new Issue({
        assigned_to: rb.assigned_to || "",
        status_text: rb.status_text || "",
        open: rb.open || true,
        issue_title: rb.issue_title || "",
        issue_text: rb.issue_text || "",
        created_by: rb.created_by || "",
        created_on: new Date(),
        updated_on: new Date(),
      });
      Project.findOne({ name: project }, (err, data) => {
        if (!data) {
          const newProject = new Project({ name: project });
          newProject.issues.push(issue);
          newProject.save((err, data) => {
            if (err || !data) {
              res.send("There was an error");
            } else {
              res.json(issue);
            }
          });
        } else {
          data.issues.push(issue);
          data.save((err, data) => {
            if (err || !data) {
              res.send("There was an error");
            } else {
              res.json(issue);
            }
          });
        }
      });
    })

    .put(function (req, res) {
      let project = req.params.project;
      const {
        _id,
        open,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;
      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }
      if (
        !open &&
        !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text
      ) {
        res.json({ error: "no update field(s) sent", _id: _id });
        return;
      }

      Project.findOne({ name: project }, (err, data) => {
        if (!data || err) {
          res.json({ error: "could not update", _id: _id });
        } else {
          const issueData = data.issues.id(_id);
          if (!issueData) {
            res.json({ error: "could not update", _id: _id });
            return;
          }
          issueData.issue_title = issue_title || issueData.issue_title;
          issueData.issue_text = issue_text || issueData.issue_text;
          issueData.created_by = created_by || issueData.created_by;
          issueData.assigned_to = assigned_to || issueData.assigned_to;
          issueData.status_text = status_text || issueData.status_text;
          issueData.updated_on = new Date();
          issueData.open = open;
          data.save((err, data) => {
            if (err || !data) {
              res.json({ error: "could not update", _id: _id });
            } else {
              res.json({ result: "successfully updated", _id: _id });
            }
          });
        }
      });
    })
    .delete(function (req, res) {
      let project = req.params.project;
      const { _id } = req.body;
      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }
      Project.findOne({ name: project }, (err, data) => {
        if (!data || err) {
          res.json({ error: "could not delete", _id: _id });
        } else {
          const issueData = data.issues.id(_id);
          if (!issueData) {
            res.json({ error: "could not delete", _id: _id });
            return;
          }
          issueData.remove();

          data.save((err, data) => {
            if (err || !data) {
              res.json({ error: "could not delete", _id: _id });
            } else {
              res.json({ result: "successfully deleted", _id: _id });
            }
          });
        }
      });
    });
};
