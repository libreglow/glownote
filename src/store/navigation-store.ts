import { create } from "zustand";

export type Route = { name: "welcome" } | { name: "home" } | {name :"editor"};

interface NavigationStore {
  current: Route;
  history: Route[];
  historyIndex: number;

  navigate: (route: Route) => void;
  back: () => void;
  forward: () => void;
  replace: (route: Route) => void;
}

export const useNavigation = create<NavigationStore>((set) => ({
  current: { name: "welcome" },
  history: [{ name: "welcome" }],
  historyIndex: 0,

  navigate: (route) =>
    set((state) => {
      const newHistory = [
        ...state.history.slice(0, state.historyIndex + 1),
        route,
      ];

      return {
        current: route,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }),

  back: () =>
    set((state) => {
      if (state.historyIndex === 0) {
        return state;
      }

      const newIndex = state.historyIndex - 1;

      return {
        current: state.history[newIndex],
        historyIndex: newIndex,
      };
    }),

  forward: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) {
        return state;
      }

      const newIndex = state.historyIndex + 1;

      return {
        current: state.history[newIndex],
        historyIndex: newIndex,
      };
    }),

  replace: (route) =>
    set((state) => {
      const newHistory = [...state.history];
      newHistory[state.historyIndex] = route;

      return {
        current: route,
        history: newHistory,
      };
    }),
}));
