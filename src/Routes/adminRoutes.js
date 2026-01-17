const express = require("express");
const adminController = require("../Controller/admin.controller");
const { adminMiddleWare } = require("../MiddleWare/Auth.Middleware");

const Router = express.Router();

Router.post("/admin/register", adminController.adminRegister);
Router.post("/admin/login", adminController.adminLogin);
Router.get("/admin/logout", adminController.adminLogout);

Router.get("/admin/check", adminMiddleWare, adminController.checkAdmin);

module.exports = Router;
