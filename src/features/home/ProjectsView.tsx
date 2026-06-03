/**
 * ProjectsView - сторінка з картками проєктів (маршрут /projects)
 * Еталон: White.html fillHome (narr view)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useStoryStore } from '../../store/useStoryStore';
import type { Project } from '../../types';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import ProjectEditModal from './ProjectEditModal';
import './ProjectsView.css';

export default function ProjectsView() {
  const navigate = useNavigate();
  const { projects, setActiveProjectId, setProjects } = useStoryStore();
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  const [deleteHoldProgress, setDeleteHoldProgress] = useState(0);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleOpenProject = async (project: Project) => {
    await setActiveProjectId(project.id);
    navigate('/book');
  };

  const handleEditProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
  };

  const handleSaveProject = async (updates: Partial<Project>) => {
    if (!editingProject) return;

    try {
      // Update Firestore
      const projectRef = doc(db, 'projects', editingProject.id);
      await updateDoc(projectRef, updates);

      // Update local state
      setProjects(projects.map((p) => (p.id === editingProject.id ? { ...p, ...updates } : p)));

      console.log('[ProjectsView] Project updated:', editingProject.id);
    } catch (error) {
      console.error('[ProjectsView] Update error:', error);
      alert('❌ Помилка оновлення проєкту\n\n' + (error as Error).message);
    }
  };

  const handleDeleteStart = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingProject(projectId);
    setDeleteHoldProgress(0);

    // 5-second hold timer
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2; // 100% in 5 seconds (50 ticks * 2%)
      setDeleteHoldProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        handleDeleteConfirm(projectId);
      }
    }, 100);

    // Cleanup on release
    const cleanup = () => {
      clearInterval(interval);
      setDeletingProject(null);
      setDeleteHoldProgress(0);
      document.removeEventListener('mouseup', cleanup);
    };
    document.addEventListener('mouseup', cleanup);
  };

  const handleDeleteConfirm = async (projectId: string) => {
    // Final confirmation
    const confirmed = confirm('❌ Видалити всесвіт?\n\nЦя дія незворотна. Всі дані проєкту будуть втрачені.');
    if (confirmed) {
      try {
        // Delete from Firestore
        const projectRef = doc(db, 'projects', projectId);
        await deleteDoc(projectRef);

        // Update local state
        setProjects(projects.filter((p) => p.id !== projectId));

        console.log('[ProjectsView] Project deleted:', projectId);
      } catch (error) {
        console.error('[ProjectsView] Delete error:', error);
        alert('❌ Помилка видалення проєкту\n\n' + (error as Error).message);
      }
    }
    setDeletingProject(null);
    setDeleteHoldProgress(0);
  };

  return (
    <div className="projects-view">
      {/* Header */}
      <div className="projects-view__header">
        <h1 className="projects-view__title">Ваші Проєкти</h1>
        <p className="projects-view__subtitle">
          Всесвіти, які ви створили. Кожен — окрема історія зі своїм каноном.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {/* New Project Card */}
        <div className="project-card project-card--new" onClick={() => alert('＋ Новий всесвіт\n\n// TODO: Create project flow')}>
          <div className="project-card__new-icon">
            <Plus size={48} />
          </div>
          <h3 className="project-card__new-title">Новий всесвіт</h3>
          <p className="project-card__new-desc">Створіть нову історію</p>
        </div>

        {/* Project Cards */}
        {projects.map((project) => {
          const isDeleting = deletingProject === project.id;

          return (
            <div
              key={project.id}
              className={`project-card ${isDeleting ? 'project-card--deleting' : ''}`}
              onClick={() => handleOpenProject(project)}
            >
              {/* Cover */}
              <div className="project-card__cover">
                {/* TODO: Replace with project.cover when field added */}
                <img
                  src="/placeholders/ph-project.png"
                  alt={project.title}
                  className="project-card__cover-img"
                  onError={(e) => {
                    // Fallback to gradient if placeholder not found
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="project-card__cover-fallback">
                  <div className="project-card__cover-icon">📖</div>
                </div>

                {/* Status Badge */}
                {/* TODO: Add project.status field */}
                <div className="project-card__badge">активний</div>
              </div>

              {/* Body */}
              <div className="project-card__body">
                <h3 className="project-card__title">{project.title}</h3>

                {/* Meta */}
                {/* TODO: Add project.genre and project.scope fields */}
                <div className="project-card__meta">
                  {project.language === 'UA' ? 'Українська' : 'English'} · {project.tier}
                </div>

                {/* Description */}
                <p className="project-card__desc">
                  {project.description || 'Немає опису'}
                </p>

                {/* Action Button */}
                <button className="project-card__open-btn">
                  Відкрити всесвіт
                </button>
              </div>

              {/* Corner Actions */}
              <div className="project-card__actions">
                <button
                  className="project-card__action-btn project-card__action-btn--edit"
                  onClick={(e) => handleEditProject(project, e)}
                  title="Редагувати"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  className={`project-card__action-btn project-card__action-btn--delete ${isDeleting ? 'is-active' : ''}`}
                  onMouseDown={(e) => handleDeleteStart(project.id, e)}
                  title="Видалити (утримайте 5 сек)"
                >
                  <Trash2 size={14} />
                  {isDeleting && (
                    <div
                      className="project-card__delete-progress"
                      style={{ width: `${deleteHoldProgress}%` }}
                    />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="projects-view__empty">
          <div className="projects-view__empty-icon">✨</div>
          <h2 className="projects-view__empty-title">Почніть свою першу історію</h2>
          <p className="projects-view__empty-desc">
            Створіть новий всесвіт і занурте читачів у вашу розповідь.
          </p>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <ProjectEditModal
          project={editingProject}
          onSave={handleSaveProject}
          onClose={() => setEditingProject(null)}
        />
      )}
    </div>
  );
}
