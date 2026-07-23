"use client";

import { useState } from "react";
import { LogoutModal } from "./LogoutModal";

interface LogoutWrapperProps {
  children: (openModal: () => void) => React.ReactNode;
  onConfirmLogout: () => void;
}

export function LogoutWrapper({ children, onConfirmLogout }: LogoutWrapperProps) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <>
      {children(() => setIsLogoutModalOpen(true))}

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={onConfirmLogout}
      />
    </>
  );
}