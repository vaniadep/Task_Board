import { useState } from 'react';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import styles from './Column.module.scss';
import TaskCard from './TaskCard';
import { useTaskStore } from '../store/useTaskStore';
import type { Column as ColumnType, Task } from '../types';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onAddTask: () => void;
}

const Column = ({ column, tasks, onEditTask, onAddTask }: ColumnProps) => {
  const { moveTask, removeColumn } = useTaskStore();
  const isEmpty = tasks.length === 0;
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    const fromColumnId = e.dataTransfer.getData('fromColumnId');
    if (taskId && fromColumnId !== column.id) {
      moveTask(taskId, fromColumnId, column.id);
    }
  };

  return (
    <div
      className={`${styles.column} ${isDragOver ? styles.dragOver : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={styles.columnHeader}>
        <h3 className={styles.columnTitle}>{column.title}</h3>
        <div className={styles.columnActions}>
          <button
            type="button"
            className={styles.actionButton}
            title="Добавить задачу в колонку"
            aria-label="Добавить задачу в колонку"
            onClick={onAddTask}
          >
            <FiPlus size={16} />
          </button>
          <button
            type="button"
            className={styles.actionButton}
            title={isEmpty ? 'Удалить колонку' : 'Колонка содержит задачи'}
            aria-label={isEmpty ? 'Удалить колонку' : 'Колонка содержит задачи'}
            disabled={!isEmpty}
            onClick={() => {
              if (window.confirm(`Удалить колонку «${column.title}»?`)) removeColumn(column.id);
            }}
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className={styles.empty}>
          <p className={styles.emptyHint}>Нет задач</p>
        </div>
      ) : (
        tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEditTask} />
        ))
      )}
    </div>
  );
};

export default Column;