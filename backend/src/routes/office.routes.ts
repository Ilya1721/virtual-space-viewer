import { Router } from "express";
import { getMenuItems, searchMenuItems } from "../controllers/office.controller";

const router = Router();

router.get("/menu", getMenuItems);
router.post("/menu", searchMenuItems);

export default router;
