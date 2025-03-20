import { Request, Response } from "express";
import { OFFICE_MENU_ITEMS } from "../models/office.model";

const menuItems: string[] = [
  OFFICE_MENU_ITEMS.TELEPORT_TO_OFFICE,
  OFFICE_MENU_ITEMS.NAVIGATE_TO_OFFICE
];

export const getMenuItems = (_req: Request, res: Response<string[]>) => {
  res.json(menuItems);
};

export const searchMenuItems = (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query) {
    res.status(400).json({ error: "Search query is required" });
  }

  const filteredItems = menuItems.filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  res.json(filteredItems);
};