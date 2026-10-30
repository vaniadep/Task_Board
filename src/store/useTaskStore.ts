import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Column } from '../types';

interface TaskState {
  tasks: Record<string, Task>;
  columns: Column[];
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, fromColumnId: string, toColumnId: string) => void;
  moveTaskLeft: (taskId: string) => void;
  moveTaskRight: (taskId: string) => void;
  addColumn: (title: string) => void;
  removeColumn: (columnId: string) => void;
}

const initialTasks: Record<string, Task> = {
  'task-1': {
    id: 'task-1',
    title: 'Сформулировать требования',
    description: 'Описать функциональность TaskFlow',
    columnId: 'col-0',
  },
  'task-2': {
    id: 'task-2',
    title: 'Изучить Zustand',
    description: 'Прочитать документацию и примеры',
    columnId: 'col-1',
  },
  'task-3': {
    id: 'task-3',
    title: 'Создать проект',
    description: 'Инициализировать Vite + React',
    columnId: 'col-2',
  },
  'task-4': {
    id: 'task-4',
    title: 'Настроить стили',
    description: 'Подключить CSS-модули',
    columnId: 'col-3',
  },
};

const initialColumns: Column[] = [
  { id: 'col-0', title: 'В планах', taskIds: ['task-1'] },
  { id: 'col-1', title: 'К выполнению', taskIds: ['task-2'] },
  { id: 'col-2', title: 'В процессе', taskIds: ['task-3'] },
  { id: 'col-3', title: 'Готово', taskIds: ['task-4'] },
];

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,
      columns: initialColumns,

      addTask: (task) =>
        set((state) => ({
          tasks: { ...state.tasks, [task.id]: task },
          columns: state.columns.map((col) =>
            col.id === task.columnId
              ? { ...col, taskIds: [...col.taskIds, task.id] }
              : col
          ),
        })),

      updateTask: (taskId, updates) =>
        set((state) => {
          const oldTask = state.tasks[taskId];
          if (!oldTask) return state;

          const newTask = { ...oldTask, ...updates };

          if (updates.columnId && updates.columnId !== oldTask.columnId) {
            return {
              tasks: { ...state.tasks, [taskId]: newTask },
              columns: state.columns.map((col) => {
                if (col.id === oldTask.columnId) {
                  return {
                    ...col,
                    taskIds: col.taskIds.filter((id) => id !== taskId),
                  };
                }
                if (col.id === updates.columnId) {
                  return { ...col, taskIds: [...col.taskIds, taskId] };
                }
                return col;
              }),
            };
          }

          return {
            tasks: { ...state.tasks, [taskId]: newTask },
          };
        }),

      deleteTask: (taskId) =>
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;

          const newTasks = { ...state.tasks };
          delete newTasks[taskId];

          return {
            tasks: newTasks,
            columns: state.columns.map((col) =>
              col.id === task.columnId
                ? { ...col, taskIds: col.taskIds.filter((id) => id !== taskId) }
                : col
            ),
          };
        }),

      moveTask: (taskId, fromColumnId, toColumnId) =>
        set((state) => ({
          tasks: {
            ...state.tasks,
            [taskId]: { ...state.tasks[taskId], columnId: toColumnId },
          },
          columns: state.columns.map((col) => {
            if (col.id === fromColumnId) {
              return { ...col, taskIds: col.taskIds.filter((id) => id !== taskId) };
            }
            if (col.id === toColumnId) {
              return { ...col, taskIds: [...col.taskIds, taskId] };
            }
            return col;
          }),
        })),

      moveTaskLeft: (taskId) => {
        const state = get();
        const task = state.tasks[taskId];
        if (!task) return;

        const currentIndex = state.columns.findIndex(
          (col) => col.id === task.columnId
        );
        if (currentIndex <= 0) return;

        const targetColumn = state.columns[currentIndex - 1];
        state.moveTask(taskId, task.columnId, targetColumn.id);
      },

      moveTaskRight: (taskId) => {
        const state = get();
        const task = state.tasks[taskId];
        if (!task) return;

        const currentIndex = state.columns.findIndex(
          (col) => col.id === task.columnId
        );
        if (currentIndex >= state.columns.length - 1) return;

        const targetColumn = state.columns[currentIndex + 1];
        state.moveTask(taskId, task.columnId, targetColumn.id);
      },

      addColumn: (title) =>
        set((state) => ({
          columns: [
            ...state.columns,
            {
              id: `col-${Date.now()}`,
              title,
              taskIds: [],
            },
          ],
        })),

      removeColumn: (columnId) =>
        set((state) => {
          const column = state.columns.find((col) => col.id === columnId);
          if (!column || column.taskIds.length > 0) return state;
          return {
            columns: state.columns.filter((col) => col.id !== columnId),
          };
        }),
    }),
    {
      name: 'taskflow-storage',
      version: 1,
      migrate: (persistedState: unknown) => {
        const state = persistedState as TaskState;
        if (state?.columns) {
          const translations: Record<string, string> = {
            Backlog: 'В планах',
            'To Do': 'К выполнению',
            'In Progress': 'В процессе',
            Done: 'Готово',
          };
          state.columns = state.columns.map((column) => ({
            ...column,
            title: translations[column.title] ?? column.title,
          }));
        }
        return state;
      },
    }
  )
);