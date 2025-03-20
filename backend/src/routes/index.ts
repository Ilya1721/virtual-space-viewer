import { Router } from "express";
import officeRoutes from "./office.routes";

const router = Router();

router.use("/office", officeRoutes);

export default router;