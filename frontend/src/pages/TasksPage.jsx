import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  CheckSquare,
  LayoutGrid,
  List,
  Calendar,
  AlertCircle,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import TaskModal from '../components/tasks/TaskModal';
import TaskKanban from '../components/tasks/TaskKanban';
import { tasksApi } from '../api/endpoints';
import { useToast } from '../context/ToastContext';

export default function TasksPage() {
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // View mode
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Filters
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        tasksApi.list({
          search: search.trim() || undefined,
          priority: priorityFilter || undefined,
          status: statusFilter || undefined,
          overdue: overdueOnly ? 'true' : undefined,
          page_size: 100,
        }),
        tasksApi.summary(),
      ]);

      setTasks(listRes.data?.results || listRes.data || []);
      setSummary(sumRes.data || null);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [priorityFilter, statusFilter, overdueOnly]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksApi.changeStatus(taskId, newStatus);
      showToast('Task status updated', 'success');
      fetchTasks();
    } catch (err) {
      showToast('Failed to update task: ' + err.message, 'error');
    }
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const handleDeletePrompt = (task) => {
    setDeletingTask(task);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    setDeleting(true);
    try {
      await tasksApi.delete(deletingTask.id);
      showToast(`Task '${deletingTask.title}' removed`, 'success');
      setDeleteConfirmOpen(false);
      setDeletingTask(null);
      fetchTasks();
    } catch (err) {
      showToast('Failed to delete task: ' + err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const listColumns = [
    {
      header: 'Task Title',
      accessor: 'title',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            {row.title}
            {row.is_overdue && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200">
                <AlertCircle className="w-2.5 h-2.5" /> Overdue
              </span>
            )}
          </div>
          {row.description && (
            <div className="text-[11px] text-slate-400 truncate max-w-sm">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Assigned To',
      accessor: 'assigned_to',
      render: (row) => <span className="font-medium text-slate-700">{row.assigned_to}</span>,
    },
    {
      header: 'Priority',
      accessor: 'priority',
      align: 'center',
      render: (row) => <StatusBadge status={row.priority} type="priority" />,
    },
    {
      header: 'Due Date',
      accessor: 'due_date',
      render: (row) => (
        <span
          className={`text-xs ${
            row.is_overdue ? 'text-rose-600 font-bold' : 'text-slate-600'
          }`}
        >
          {row.due_date || 'No deadline'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} type="task" />,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {row.status !== 'completed' && (
            <button
              onClick={() => handleStatusChange(row.id, 'completed')}
              className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Mark Completed"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Done
            </button>
          )}
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Edit Task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeletePrompt(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tasks & Workflow</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal activity pipelines, operational assignments, and milestone tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedTask(null);
              setTaskModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Task
          </button>
        </div>
      </div>

      {/* Task Summary Stat Bar */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Tasks</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{summary.total_tasks}</div>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-blue-600">Pending Actions</span>
            <div className="text-2xl font-bold text-blue-600 mt-1">{summary.pending_tasks}</div>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-emerald-600">Completed</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{summary.completed_tasks}</div>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-rose-600">Overdue Deadlines</span>
            <div className="text-2xl font-bold text-rose-600 mt-1">{summary.overdue_tasks}</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title, description, or assigned person..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          >
            <option value="">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Status filter (useful especially in list mode) */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Overdue Only checkbox */}
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-500"
            />
            Overdue Only
          </label>
        </div>
      </div>

      {/* View Toggle Rendering */}
      {viewMode === 'kanban' ? (
        <TaskKanban
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onEditTask={handleEdit}
          onDeleteTask={handleDeletePrompt}
        />
      ) : (
        <DataTable
          columns={listColumns}
          data={tasks}
          loading={loading}
          emptyTitle="No tasks found"
          emptyMessage="No tasks match the active filters. Create a new task to get started."
          emptyIcon={CheckSquare}
        />
      )}

      {/* Task Add / Edit Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={selectedTask}
        onTaskSaved={fetchTasks}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Task "${deletingTask?.title}"?`}
        message="Are you sure you want to remove this operational task from the system?"
        confirmText="Confirm Delete"
        isDanger={true}
        isLoading={deleting}
      />
    </div>
  );
}
