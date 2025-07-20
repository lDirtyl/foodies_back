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
  getUserFollowersWrapper,
  uploadImageWrapper, // Import the new wrapper
} from "../controllers/usersController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { avatarUploader, recipeImageUploader } from "../middlewares/imageUploader.js"; // Import the new universal uploaders
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
  avatarUploader.single("avatar"), // Uses the new avatarUploader
  updateAvatarWrapper,
);
router.get(
  "/followers",
  validateBody(paginationSchema),
  authMiddleware,
  getFollowersWrapper,
);
router.get(
  "/:userId/followers",
  validateBody(paginationSchema),
  authMiddleware,
  getUserFollowersWrapper,
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

// Route for uploading a generic image (e.g., for recipes)
router.post('/upload-image', authMiddleware, recipeImageUploader.single('image'), uploadImageWrapper); // Uses the new recipeImageUploader

export default router;
