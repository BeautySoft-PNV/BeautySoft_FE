import { create } from "zustand";

// Example of a store with a counter (just managing only one state)
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const useCouterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

// Example of a store with a list of items (managing multiple states)
interface User {
  name: string;
  age: number;
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface StoreState {
  count: number;
  user: User;
  todos: Todo[];
  increment: () => void;
  decrement: () => void;
  updateUser: (newUser: User) => void;
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: number) => void;
}

const useStore = create<StoreState>((set) => ({
  count: 0,
  user: { name: "John", age: 30 },
  todos: [],
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  updateUser: (newUser) => set({ user: newUser }),
  addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] })),
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    })),
}));

export { useCouterStore, useStore };
