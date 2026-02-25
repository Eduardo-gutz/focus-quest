import { create } from 'zustand';

interface PermissionModalStoreState {
  visible: boolean;
}

interface PermissionModalStoreActions {
  show: () => void;
  hide: () => void;
}

interface PermissionModalStore
  extends PermissionModalStoreState,
    PermissionModalStoreActions {}

export const usePermissionModalStore = create<PermissionModalStore>()((set) => ({
  visible: false,

  show: () => set({ visible: true }),
  hide: () => set({ visible: false }),
}));
