"use client";

import { createContext, useContext, useState } from "react";

interface NavExpandContextValue {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavExpandContext = createContext<NavExpandContextValue>({
  isExpanded: false,
  setIsExpanded: () => {},
});

export function NavExpandProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <NavExpandContext.Provider value={{ isExpanded, setIsExpanded }}>
      {children}
    </NavExpandContext.Provider>
  );
}

export function useNavExpand() {
  return useContext(NavExpandContext);
}
