import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { getMe } from '../../services/Authservice';
import { getAllEmployees } from '../../services/Userservice';
import { getTasks, addTask, assignTask, updateTask, deleteTask } from '../../services/Taskservice';
import toast from 'react-hot-toast';
import { 
  HiPlus, 
  HiTrash, 
  HiPencil, 
  HiCalendar, 
  HiClipboardCheck, 
  HiX,
  HiSearch
} from 'react-icons/hi';

export default function Task() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [permissions, setPermissions] = useState([]);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    status: 'pending'
  });

  // Permission helpers
  const userRole = currentUser?.role?.toLowerCase() || '';
  const canAssign = permissions.includes('assign_task') || ['admin', 'hr', 'manager'].includes(userRole);
  const canDelete = permissions.includes('delete_task') || userRole === 'admin';

  // Load User, Permissions & Employees
  useEffect(() => {
    const initData = async () => {
      try {
        const userRes = await getMe();
        if (userRes.data?.user) {
          setCurrentUser(userRes.data.user);
          setPermissions(userRes.data.permissions || []);
        }

        const role = userRes.data?.user?.role?.toLowerCase();
        const perms = userRes.data?.permissions || [];
        if (perms.includes('assign_task') || ['admin', 'hr', 'manager'].includes(role)) {
          const empRes = await getAllEmployees(1, 100);
          setEmployees(empRes.data?.user || []);
        }
      } catch (err) {
        console.error('Failed to load user info:', err);
      }
    };

    initData();
  }, []);

  // Fetch Tasks
  const fetchTasksData = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data?.tasks || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch tasks');
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, []);

  // Modal Open Handlers
  const handleOpenModal = () => {
    setSelectedTask(null);
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      dueDate: '',
      status: 'pending'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      assignedTo: task.assignedTo || '',
      priority: task.priority || 'medium',
      dueDate: task.dueDate || '',
      status: task.status || 'pending'
    });
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return toast.error('Task title is required');
    }

    try {
      setSubmitting(true);
      if (selectedTask) {
        // Edit Task
        const payload = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          dueDate: formData.dueDate || null,
          status: formData.status
        };
        if (canAssign && formData.assignedTo) {
          payload.assignedTo = Number(formData.assignedTo);
        }
        const res = await updateTask(selectedTask.id, payload);
        toast.success(res.data?.message || 'Task updated successfully');
      } else {
        // Create Task
        const payload = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          dueDate: formData.dueDate || null
        };

        let res;
        if (canAssign && formData.assignedTo) {
          payload.assignedTo = Number(formData.assignedTo);
          res = await assignTask(payload);
        } else {
          res = await addTask(payload);
        }
        toast.success(res.data?.message || 'Task created successfully');
      }

      setIsModalOpen(false);
      fetchTasksData();
    } catch (err) {
      console.error('Task submit error:', err);
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Status Change directly from Table
  const handleQuickStatusChange = async (task, newStatus) => {
    if (task.status === newStatus) return;
    try {
      const res = await updateTask(task.id, { status: newStatus });
      toast.success(res.data?.message || `Status updated to ${newStatus}`);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  // Direct Delete Handler
  const handleDeleteTask = async (taskId) => {
    try {
      const res = await deleteTask(taskId);
      toast.success(res.data?.message || 'Task deleted successfully');
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  // Priority Badge Helper
  const getPriorityBadge = (priority) => {
    const p = priority?.toLowerCase();
    if (p === 'high') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          High
        </span>
      );
    }
    if (p === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        Low
      </span>
    );
  };

  // Check if task is overdue
  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed') return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  };

  // Filtered Tasks (Search + Status + Priority)
  const filteredTasks = tasks.filter((task) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      task.title?.toLowerCase().includes(term) ||
      task.description?.toLowerCase().includes(term) ||
      task.assignee?.username?.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'all' || task.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesPriority =
      priorityFilter === 'all' || task.priority?.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Task Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create, track, and manage your tasks
            </p>
          </div>

          <button
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <HiPlus className="text-lg" />
            Add Task
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" />
              <input
                type="text"
                placeholder="Search tasks by title, description, or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded transition cursor-pointer"
                  title="Clear search"
                >
                  <HiX className="text-sm" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="w-full md:w-44">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 cursor-pointer"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition whitespace-nowrap cursor-pointer text-center"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-6 py-4">Task Details</th>
                  <th className="text-left px-6 py-4">Assigned To</th>
                  <th className="text-left px-6 py-4">Assigned By</th>
                  <th className="text-left px-6 py-4">Priority</th>
                  <th className="text-left px-6 py-4">Due Date</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th className="text-center px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const assigneeName = task.assignee?.username || 'Unassigned';
                    const assignerName = task.assigner?.username || 'System';
                    const overdue = isOverdue(task.dueDate, task.status);

                    // User can update if Admin/HR/Manager OR task creator
                    const canEdit = canAssign || Number(task.assignedBy) === Number(currentUser?.id);

                    return (
                      <tr key={task.id} className="hover:bg-gray-50/80 transition">
                        {/* Task Title & Description */}
                        <td className="px-6 py-4 max-w-xs">
                          <p className="font-semibold text-gray-900 leading-snug">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2" title={task.description}>
                              {task.description}
                            </p>
                          )}
                        </td>

                        {/* Assignee */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {assigneeName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{assigneeName}</p>
                              {task.assignee?.email && (
                                <p className="text-[11px] text-gray-400">{task.assignee.email}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Assigned By (Creator) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                            {assignerName}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPriorityBadge(task.priority)}
                        </td>

                        {/* Due Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs">
                            <HiCalendar className={`text-sm ${overdue ? 'text-rose-500' : 'text-gray-400'}`} />
                            <span className={overdue ? 'text-rose-600 font-semibold' : 'text-gray-600'}>
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                            </span>
                            {overdue && (
                              <span className="text-[10px] uppercase font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
                                Overdue
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Dropdown */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={task.status}
                            onChange={(e) => handleQuickStatusChange(task, e.target.value)}
                            className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border outline-none cursor-pointer transition ${
                              task.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : task.status === 'in-progress'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit Button */}
                            {canEdit && (
                              <button
                                onClick={() => handleOpenEditModal(task)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                                title="Edit Task"
                              >
                                <HiPencil className="text-base" />
                              </button>
                            )}

                            {/* Delete Button (Admin only) */}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Delete Task"
                              >
                                <HiTrash className="text-base" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center text-2xl mb-3">
                          <HiClipboardCheck />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {tasks.length === 0 ? 'No tasks found' : 'No matching tasks'}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm">
                          {tasks.length === 0
                            ? 'Get started by creating your first task.'
                            : 'Try adjusting your search query or changing the filter options.'}
                        </p>
                        {tasks.length === 0 ? (
                          <button
                            onClick={handleOpenModal}
                            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                          >
                            Add Task
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setStatusFilter('all');
                              setPriorityFilter('all');
                            }}
                            className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-xl transition cursor-pointer"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── CREATE / EDIT TASK MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedTask ? 'Edit Task' : 'Add New Task'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedTask
                    ? 'Update the details and progress of this task'
                    : 'Create a personal task or assign it to a team member'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <HiX className="text-lg" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Task Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Update company website landing page"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Add details, instructions or requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
                ></textarea>
              </div>

              {/* Assign To (Only if Admin/HR/Manager) */}
              {canAssign && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Assign To <span className="text-gray-400 font-normal lowercase">(optional - leave blank for self)</span>
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Self (Assign to me)</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.username} ({emp.email}) - {emp.Role?.name || 'Staff'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Grid: Priority & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              {/* Status (Only on Edit mode) */}
              {selectedTask && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {submitting
                    ? 'Saving...'
                    : selectedTask
                    ? 'Update Task'
                    : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}