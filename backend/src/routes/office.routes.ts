import { Router } from "express";
import { getMenuItemsReq, searchMenuItemsReq } from "../controllers/office.controller";

const router = Router();

router.get("/menu", getMenuItemsReq);
router.post("/menu", searchMenuItemsReq);

export default router;
