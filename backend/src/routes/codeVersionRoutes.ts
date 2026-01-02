import { Router } from "express";
import { 
  uploadVersion, 
  getVersions, 
  getVersionById,
  deleteVersion,
  renameVersion
} from "../controllers/codeVersionController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/versions/project/:projectId - Upload new version for a project
router.post("/project/:projectId", uploadVersion);

// GET /api/versions/project/:projectId - List versions for a project
router.get("/project/:projectId", getVersions);

// GET /api/versions/:id - Get version by ID
router.get("/:id", getVersionById);

// DELETE /api/versions/:id - Delete a version
router.delete("/:id", deleteVersion);

// PATCH /api/versions/:id - Rename a version
router.patch("/:id", renameVersion);

export default router;
