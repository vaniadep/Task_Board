import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import styles from './TaskFormModal.module.scss';
import { useTaskStore } from '../store/useTaskStore';
import type { Task } from '../types';

interface TaskFormModalProps {
  task?: Task | null;
  defaultColumnId?: string;
  onClose: () => void;
}

const TaskFormModal = ({ task, defaultColumnId, onClose }: TaskFormModalProps) => {
  const { columns, addTask, updateTask } = useTaskStore();
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [columnId, setColumnId] = useState(task?.columnId ?? defaultColumnId ?? columns[0]?.id ?? '');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      if (task) {
        updateTask(task.id, {
          title: title.trim(),
          description: description.trim(),
          columnId,
        });
      } else {
        addTask({
          id: `task-${Date.now()}`,
          title: title.trim(),
          description: description.trim(),
          columnId,
        });
      }
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <form
        className={styles.form}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className={styles.formHeader}>
          <h3 className={styles.formTitle}>
            {task ? 'Редактировать задачу' : 'Новая задача'}
          </h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            title="Закрыть"
            aria-label="Закрыть модальное окно"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">
            Название
          </label>
          <input
            id="title"
            className={styles.input}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">
            Описание
          </label>
          <textarea
            id="description"
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="column">
            Колонка
          </label>
          <select
            id="column"
            className={styles.select}
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.primaryButton}>
            {task ? 'Сохранить' : 'Добавить'}
          </button>
          <button type="button" className={styles.button} onClick={onClose}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskFormModal;