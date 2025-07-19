import express from "express";
import {
  registerWrapper,
  loginWrapper,
  logoutWrapper,
  getCurrentUserWrapper,
  updateAvatarWrapper,
  getFollowersWrapper,
  getFollowingsWrapper,
  followUserWrapper,
  unfollowUserWrapper,
  getUserDetailsWrapper,
} from "../controllers/usersController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { avatarUploader } from "../middleware/uploadMiddleware.js";
import { paginationSchema } from "../schemas/paginationSchema.js";
import validateBody from "../helpers/validateBody.js";

const router = express.Router();

router.post("/register", registerWrapper);
router.post("/login", loginWrapper);
router.post("/logout", authMiddleware, logoutWrapper);
router.get("/current", authMiddleware, getCurrentUserWrapper);

// Route to update avatar by uploading a file
router.patch(
  "/avatar",
  authMiddleware,
  avatarUploader.single("avatar"),
  updateAvatarWrapper,
);
router.get(
  "/followers",
  validateBody(paginationSchema),
  authMiddleware,
  getFollowersWrapper,
);
router.get(
  "/followings",
  validateBody(paginationSchema),
  authMiddleware,
  getFollowingsWrapper,
);
router.post("/follow", authMiddleware, followUserWrapper);
router.delete("/follow", authMiddleware, unfollowUserWrapper);
router.get("/:userId/details", authMiddleware, getUserDetailsWrapper);

export default router;
