const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { text } = require("body-parser");
chai.use(chaiHttp);

let deleteId;
suite("Functional Tests", function () {
  suite("First Tests", function () {
    test("#Create an issue with every field: POST request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .post("/api/issues/test")
        .set("content-type", "application/json")
        .send({
          assigned_to: "john",
          status_text: "testing",
          issue_title: "test1",
          issue_text: "is testing",
          created_by: "jon",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          deleteId = res.body._id;
          assert.equal(res.body.issue_title, "test1");
          assert.equal(res.body.assigned_to, "john");
          assert.equal(res.body.created_by, "jon");
          assert.equal(res.body.status_text, "testing");
          assert.equal(res.body.issue_text, "is testing");
          assert.equal(res.body.issue_title, "test1");
          done();
        });
    });
    test("#Create an issue with only required fields: POST request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .post("/api/issues/test")
        .set("content-type", "application/json")
        .send({
          issue_title: "test1",
          issue_text: "is testing",
          created_by: "jon",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "test1");
          assert.equal(res.body.created_by, "jon");
          assert.equal(res.body.issue_text, "is testing");
          assert.equal(res.body.issue_title, "test1");
          done();
        });
    });
    test("#Create an issue with missing required fields: POST request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .post("/api/issues/test")
        .set("content-type", "application/json")
        .send({
          issue_text: "is testing",
          created_by: "jon",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
    test("#View issues on a project: GET request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .get("/api/issues/project")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(
            res.text,
            '[{"_id":"62ffe315a8cb8e20ace825a6","assigned_to":"","status_text":"","open":true,"issue_title":"title","issue_text":"text","created_by":"me","created_on":"2022-08-19T19:23:01.782Z","updated_on":"2022-08-19T19:23:01.782Z"}]'
          );
          done();
        });
    });
    test("#View issues on a project with one filter: GET request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .get("/api/issues/project")
        .query({
          _id: "62ffe315a8cb8e20ace825a6",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(
            res.text,
            '[{"_id":"62ffe315a8cb8e20ace825a6","assigned_to":"","status_text":"","open":true,"issue_title":"title","issue_text":"text","created_by":"me","created_on":"2022-08-19T19:23:01.782Z","updated_on":"2022-08-19T19:23:01.782Z"}]'
          );
          done();
        });
    });
    test("#View issues on a project with multiple filters: GET request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .get("/api/issues/project")
        .query({
          issue_text: "text",
          created_by: "me",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(
            res.text,
            '[{"_id":"62ffe315a8cb8e20ace825a6","assigned_to":"","status_text":"","open":true,"issue_title":"title","issue_text":"text","created_by":"me","created_on":"2022-08-19T19:23:01.782Z","updated_on":"2022-08-19T19:23:01.782Z"}]'
          );
          done();
        });
    });
    test("#Update one field on an issue: PUT request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({
          _id: "62ffe90bdb910d245f8dd19c",
          issue_title: "aaaaaaaaa",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body._id, "62ffe90bdb910d245f8dd19c");
          assert.equal(res.body.result, "successfully updated");
          done();
        });
    });
    test("#Update one field on an issue: PUT request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({
          _id: "62ffe90bdb910d245f8dd19c",
          issue_title: "aaaaaaaaa",
          issue_text: "mmmmmmmm",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body._id, "62ffe90bdb910d245f8dd19c");
          assert.equal(res.body.result, "successfully updated");
          done();
        });
    });
    test("#Update an issue with missing _id: PUT request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({
          _id: "",
          issue_title: "aaaaaaaaa",
          issue_text: "mmmmmmmm",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
    test("#Update an issue with no fields to update: PUT request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({
          _id: "62ffe90bdb910d245f8dd19c",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "no update field(s) sent");
          done();
        });
    });
    test("#Update an issue with an invalid _id: PUT request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({
          _id: "62ffe90bdbg910d245f8dd19c",
          issue_title: "aaaaaaaaa",
          issue_text: "mmmmmmmm",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not update");
          done();
        });
    });

    test("#Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", () => {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .send({
          _id: "62ffe90bdbg910d245f8dd19c",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not delete");
        });
    });
    test("#Delete an issue with missing _id: DELETE request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .send({
          _id: "",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
  });
  suite("Last Test", function () {
    test("#Delete an issue: DELETE request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .delete("/api/issues/test")
        .send({
          _id: deleteId,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully deleted");
          done();
        });
    });
  });
});
