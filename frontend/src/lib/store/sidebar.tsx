import { create } from "zustand";

type SidebarState = {
	sidebarOpen: boolean;
	setSidebarOpen: (isOpen: boolean) => void;
};

export const useSidebarStore = create<SidebarState>()((set) => ({
	sidebarOpen: true,
	setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
}));
