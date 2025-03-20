import { OFFICE_MENU_ITEMS } from "../models/office.model";

const menuItems: string[] = [
  OFFICE_MENU_ITEMS.TELEPORT_TO_OFFICE,
  OFFICE_MENU_ITEMS.NAVIGATE_TO_OFFICE,
];

export const getMenuItems = (): string[] => {
  return menuItems;
};

export const searchMenuItems = (query: string | undefined): string[] => {
  if (!query) {
    return menuItems;
  }

  return menuItems.filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  );
};
