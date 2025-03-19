"use client";

import React, { useCallback, useEffect, useState } from "react";
import styles from "./main_menu.module.css";
import { MatterportSDK } from "../lib/matterportSDK";
import { Tag } from "../../../public/third_party/matterportSDK/sdk";

interface MenuItem {
  label: string;
  onClick: () => void;
}

interface MainMenuProps {
  mpSDK: MatterportSDK | null;
  officeTag: Tag.Descriptor | null;
}

const MainMenu: React.FC<MainMenuProps> = ({ mpSDK, officeTag }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const teleportToOffice = useCallback(async () => {
    await mpSDK?.teleportToOffice(officeTag?.id ?? '');
  }, [mpSDK, officeTag]);

  const navigateToOffice = useCallback(async () => {
    await mpSDK?.navigateToOffice(officeTag);
  }, [mpSDK, officeTag]);

  useEffect(() => {
    setMenuItems([
      { label: "Teleport to office", onClick: teleportToOffice },
      { label: "Navigate to office", onClick: navigateToOffice },
    ]);
  }, [mpSDK, navigateToOffice, teleportToOffice]);

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
