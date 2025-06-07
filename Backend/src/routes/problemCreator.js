const express = require('express');
const problemRouter =  express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const userMiddleware = require("../middleware/adminMiddleware");
const { createProblem ,updateProblem,deleteProblem,getProblemById,getAllProblem} = require("../controllers/userProblem");

// Create
problemRouter.post("/create",adminMiddleware ,createProblem);
problemRouter.put("/update/:id",adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem);

problemRouter.get("/problemById/:id",userMiddleware,getProblemById);
problemRouter.get("/getAllProblem", getAllProblem);
// problemRouter.get("/problemSolvedByUser", userMiddleware,solvedAllProblemByUser);


module.exports = problemRouter;