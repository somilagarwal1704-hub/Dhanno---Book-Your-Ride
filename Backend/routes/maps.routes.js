import express from "express";
import { getSuggestions, reverseController } from "../controllers/maps.controller.js";

const router = express.Router();

router.get("/suggestions", getSuggestions);
router.get("/reverse", reverseController);

export default router;
