import { Request, Response } from "express";
import { getMenuItems, searchMenuItems } from "../services/office.service";

export const getMenuItemsReq = (_req: Request, res: Response) => {
  res.json(getMenuItems());
};

export const searchMenuItemsReq = (req: Request, res: Response) => {
  const filteredItems = searchMenuItems(req.body.query);
  res.json(filteredItems);
};
