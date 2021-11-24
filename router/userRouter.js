const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const userController = require("../controllers/userController");

router.get("/get-user/:slug", auth, userController.getUser);
router.patch("/follow/:id", auth, userController.followUser);
router.patch("/unfollow/:id", auth, userController.unFollowUser);
router.put("/update", auth, userController.updateUser);
router.get("/suggest", auth, userController.suggestUser);
router.get("/search", auth, userController.searchUser);

module.exports = router;
