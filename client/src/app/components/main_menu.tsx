"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./main_menu.module.css";
import { MatterportSDK } from "../lib/matterportSDK";
import { Tag } from "../../../public/third_party/matterportSDK/sdk";

interface MenuItem {
  label: string;
  onClick: () => Promise<void>;
}

enum OFFICE_MENU_ITEMS {
  TELEPORT_TO_OFFICE = "Teleport to office",
  NAVIGATE_TO_OFFICE = "Navigate to office"
}

interface MainMenuProps {
  mpSDK: MatterportSDK | null;
  officeTag: Tag.Descriptor | null;
}

const MainMenu: React.FC<MainMenuProps> = ({ mpSDK, officeTag }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    await getMenuItemsByQuery(event.target.value);
  };

  const teleportToOffice = useCallback(async () => {
    await mpSDK?.teleportToOffice(officeTag?.id ?? '');
  }, [mpSDK, officeTag]);

  const navigateToOffice = useCallback(async () => {
    await mpSDK?.navigateToOffice(officeTag);
  }, [mpSDK, officeTag]);

  const menuItemMap = useMemo(() => {
    return new Map<string, () => Promise<void>>([
      [OFFICE_MENU_ITEMS.TELEPORT_TO_OFFICE, teleportToOffice],
      [OFFICE_MENU_ITEMS.NAVIGATE_TO_OFFICE, navigateToOffice],
    ]);
  }, [teleportToOffice, navigateToOffice]);

  const mapMenuItemsFromBackend = useCallback((menuItems: string[]): MenuItem[] => {
    return menuItems.map((menuItem: string): MenuItem => ({
      label: menuItem,
      onClick: menuItemMap.get(menuItem)!
    }));
  }, [menuItemMap]);

  const getMenuItems = useCallback(async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/office/menu`);
    if (!response.ok) {
      throw new Error("Failed to fetch menu items");
    }

    setMenuItems(mapMenuItemsFromBackend(await response.json()));
  }, [mapMenuItemsFromBackend]);

  const getMenuItemsByQuery = useCallback(async (query: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/office/menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      console.log("Failed to fetch menu items");
      return;
    }

    setMenuItems(mapMenuItemsFromBackend(await response.json()));
  }, [mapMenuItemsFromBackend]);

  useEffect(() => {
    getMenuItems();
  }, [getMenuItems, mpSDK, navigateToOffice, teleportToOffice]);

  return (
    <div className={styles["main-menu"]}>
      <input
        type="search"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search..."
      />
      <ul>
        {menuItems.map((menuItem, index) => (
          <li key={index}>
            <button onClick={menuItem.onClick}>{menuItem.label}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MainMenu;
