'use client';

import { useState, useRef, useEffect } from 'react';
import { Project } from '../types';
import { getProjectStatusConfig } from '../utils/statusConfig';

interface ProjectCardProps {
  project: Project;
  onClick?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onArchive?: (project: Project) => void;
  onUnarchive?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onViewDetails?: (project: Project) => void;
}

export const ProjectCard = ({
  project,
  onClick,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  onViewDetails,
}: ProjectCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const statusConfig = getProjectStatusConfig(project.status);

  const handleClick = () => {
    if (!isMenuOpen) {
      onClick?.(project);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    action();
  };

  return (
    <article
      className={`group bg-white dark:bg-slate-900 rounded-xl border ${
        project.isOverdue
          ? 'border-red-200 dark:border-red-900/30'
          : 'border-slate-200 dark:border-slate-800'
      } p-5 shadow-sm hover:shadow-md ${statusConfig.borderColor} transition-all cursor-pointer relative`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${project.name} project - ${statusConfig.label}`}
    >
      {project.isOverdue && (
        <div className="absolute -right-8 top-4 bg-red-500 text-white text-[10px] py-1 px-8 rotate-45 font-bold uppercase tracking-wider shadow-sm">
          Overdue
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div className={project.isOverdue ? 'pr-6' : ''}>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-slate-500 mt-1">{project.client}</p>
        </div>
        <div className="relative z-10">
          <button
            ref={buttonRef}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={handleMenuToggle}
            onMouseEnter={() => setIsMenuOpen(true)}
            aria-label={`More options for ${project.name}`}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
          >
            <span className="material-symbols-outlined">more_horiz</span>
          </button>

          {isMenuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-[100]"
              onMouseLeave={() => setIsMenuOpen(false)}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                onClick={(e) =>
                  handleMenuAction(e, () => {
                    onViewDetails?.(project);
                    onClick?.(project);
                  })
                }
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                <span>View Details</span>
              </button>
              {onEdit && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                  onClick={(e) => handleMenuAction(e, () => onEdit?.(project))}
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  <span>Edit</span>
                </button>
              )}
              {project.isArchived ? (
                onUnarchive && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                    onClick={(e) => handleMenuAction(e, () => onUnarchive?.(project))}
                  >
                    <span className="material-symbols-outlined text-[18px]">unarchive</span>
                    <span>Unarchive</span>
                  </button>
                )
              ) : (
                onArchive && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                    onClick={(e) => handleMenuAction(e, () => onArchive?.(project))}
                  >
                    <span className="material-symbols-outlined text-[18px]">archive</span>
                    <span>Archive</span>
                  </button>
                )
              )}
              {onDelete && (
                <>
                  <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                    onClick={(e) => handleMenuAction(e, () => onDelete?.(project))}
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor}`}
        >
          <span className={`w-1.5 h-1.5 mr-1.5 ${statusConfig.dotColor} rounded-full`}></span>
          {statusConfig.label}
        </span>
        {project.isOverdue && (
          <span
            className="material-symbols-outlined text-red-500 text-[20px]"
            title="Action Required"
            aria-label="Action Required"
          >
            error
          </span>
        )}
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500 font-medium">Progress</span>
          <span className="text-slate-900 dark:text-white font-bold">{project.progress}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
          <div
            className={`${statusConfig.progressColor} h-2 rounded-full transition-all`}
            style={{ width: `${project.progress}%` }}
            role="progressbar"
            aria-valuenow={project.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${project.name} progress: ${project.progress}%`}
          ></div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex -space-x-2 overflow-hidden">
          {project.teamMembers.slice(0, 2).map((avatar, index) => (
            <div
              key={index}
              className="h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900 bg-cover bg-center"
              style={{ backgroundImage: `url('${avatar}')` }}
              role="img"
              aria-label={`Team member ${index + 1}`}
            ></div>
          ))}
          {project.teamMembers.length > 2 && (
            <div className="h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-medium">
              +{project.teamMembers.length - 2}
            </div>
          )}
        </div>
        <div
          className={`flex items-center gap-3 text-xs font-medium ${
            project.isOverdue
              ? 'text-red-500 font-bold'
              : 'text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
            <span>{project.taskCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            <span>{project.dueDate}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
