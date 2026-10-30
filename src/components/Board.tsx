import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import styles from './Board.module.scss';
import { useTaskStore } from '../store/useTaskStore';
import Column from './Column';
import TaskFormModal from './TaskFormModal';
import type { Task } from '../types';

const Board = () => {
  const { tasks, columns, addColumn } = useTaskStore();
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskColumnId, setNewTaskColumnId] = useState<string | undefined>();

  const openNewTask = (columnId?: string) => {
    setNewTaskColumnId(columnId);
    setIsAddingTask(true);
  };
  const handleAddColumn = () => {
    const title = newColumnTitle.trim();
    if (title) {
      addColumn(title);
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddColumn();
    if (e.key === 'Escape') {
      setIsAddingColumn(false);
      setNewColumnTitle('');
    }
  };

  return (
    <>
      <div className={styles.board}>
        {columns.map((column) => {
          const columnTasks = column.taskIds.map((id) => tasks[id]).filter(Boolean);
          return (
            <Column
              key={column.id}
              column={column}
              tasks={columnTasks}
              onEditTask={setEditingTask}
              onAddTask={() => openNewTask(column.id)}
            />
          );
        })}
        <div className={styles.addColumnWrap}>
          {isAddingColumn ? (
            <div className={styles.newColumnForm}>
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Название колонки"
                autoFocus
              />
              <div className={styles.formActions}>
                <button type="button" onClick={handleAddColumn}>Добавить</button>
                <button type="button" className={styles.secondaryButton} onClick={() => {
                  setIsAddingColumn(false);
                  setNewColumnTitle('');
                }}>Отмена</button>
              </div>
            </div>
          ) : (
            <button type="button" className={styles.addColumnButton} onClick={() => setIsAddingColumn(true)}>
              <FiPlus size={16} /> Добавить колонку
            </button>
          )}
        </div>
      </div>

      <button type="button" className={styles.floatingAdd} onClick={() => openNewTask()}>
        <FiPlus size={18} /> Добавить задачу
      </button>

      {isAddingTask && (
        <TaskFormModal defaultColumnId={newTaskColumnId} onClose={() => setIsAddingTask(false)} />
      )}
      {editingTask && (
        <TaskFormModal task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </>
  );
};

export default Board;
