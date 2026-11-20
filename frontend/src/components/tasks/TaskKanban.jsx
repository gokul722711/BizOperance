import React from 'react';
import {
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function TaskKanban({
  tasks = [],
  onStatusChange,
  onEditTask,
  onDeleteTask,
}) {
  const columns = [
    { id: 'todo', title: 'To Do', color: 'border-slate-300' },
    { id: 'in_progress', title: 'In Progress', color: 'border-blue-400' },
    { id: 'completed', title: 'Completed', color: 'border-emerald-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col min-h-[500px]"
          >
            {/* Column Header */}
            <div className={`pb-3 mb-3 border-b-2 ${col.color} flex items-center justify-between`}>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">{col.title}</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                {colTasks.length}
              </span>
            </div>

            {/* Task Cards Column */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
                  No tasks in this stage
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`bg-white border rounded-xl p-3.5 shadow-xs hover:shadow-sm transition-all space-y-2.5 ${
                      task.is_overdue
                        ? 'border-rose-300 ring-1 ring-rose-200'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Header: Priority & Overdue Indicator */}
                    <div className="flex items-center justify-between gap-1">
                      <StatusBadge status={task.priority} type="priority" />
                      {task.is_overdue && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <AlertCircle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                    </div>

                    {/* Task Title & Description */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Assigned & Due Date */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1 truncate max-w-[120px]">
                        <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{task.assigned_to}</span>
                      </div>
                      {task.due_date && (
                        <div
                          className={`flex items-center gap-1 ${
                            task.is_overdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
                          }`}
                        >
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>{task.due_date}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Move and Action buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      {/* Move status buttons */}
                      <div className="flex items-center gap-1">
                        {col.id !== 'todo' && (
                          <button
                            onClick={() => onStatusChange(task.id, 'todo')}
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium"
                          >
                            To Do
                          </button>
                        )}
                        {col.id !== 'in_progress' && (
                          <button
                            onClick={() => onStatusChange(task.id, 'in_progress')}
                            className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-medium"
                          >
                            Progress
                          </button>
                        )}
                        {col.id !== 'completed' && (
                          <button
                            onClick={() => onStatusChange(task.id, 'completed')}
                            className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-medium flex items-center gap-0.5"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" /> Done
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditTask(task)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
