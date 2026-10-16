import React, { useEffect, useState } from 'react';
import {
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  getAllLeaveTypes,
  archiveLeaveType
} from '../../services/Leavetypeservice';
import { getAllDepartments } from '../../services/Departmentservice';
import toast from 'react-hot-toast';
import Sidebar from '../Components/Sidebar';
import {
  HiPlus,
  HiPencil,
  HiRefresh,
  HiArchive,
  HiCalendar,
  HiCheckCircle
} from 'react-icons/hi';

// Helper component to display Department / Designation pills cleanly
function PillList({ items, empty = 'All' }) {
  const list = Array.isArray(items) ? items : items ? [items] : [];

  if (!list.length) {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/60">
        {empty}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((item, idx) => (
        <span
          key={idx}
          className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 border border-slate-200"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// Helper component for summary statistics cards
function SummaryCard({ label, value, detail, icon }) {
  const renderIcon = () => {
    switch (icon) {
      case 'calendar':
        return <HiCalendar className="h-5 w-5 text-blue-600" />;
      case 'check':
        return <HiCheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'archive':
        return <HiArchive className="h-5 w-5 text-slate-500" />;
      default:
        return <HiCalendar className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
          {renderIcon()}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

// Form Field Wrapper
function FormField({ label, required, children }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label} {required && <span className="text-rose-500">*</span>}
      {children}
    </label>
  );
}

const inputClass =
  'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

// Modal component for Add / Edit Leave Type
function LeaveModal({ leave, onClose, onSave, availableDepartments = [] }) {
  const [activeTab, setActiveTab] = useState('General');
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(leave?.name || '');
  const [allotmentType, setAllotmentType] = useState(leave?.allotmentType || 'Monthly Leave');
  const [monthlyLimit, setMonthlyLimit] = useState(leave?.monthlyLimit ?? 1);
  const [paidStatus, setPaidStatus] = useState(leave?.paidStatus || 'Paid');
  const [color, setColor] = useState(leave?.color || '#16813D');
  const [noOfLeaves, setNoOfLeaves] = useState(
    leave?.noOfLeaves !== undefined ? leave.noOfLeaves : leave?.leaves ?? 12
  );
  const [selectedDepts, setSelectedDepts] = useState(
    Array.isArray(leave?.departments) ? leave.departments : []
  );
  const [designations, setDesignations] = useState(
    Array.isArray(leave?.designations) ? leave.designations : []
  );
  const [designationInput, setDesignationInput] = useState('');

  const toggleDept = (dept) => {
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const handleDesignationKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = designationInput.trim().replace(/,$/, '');
      if (trimmed && !designations.includes(trimmed)) {
        setDesignations((prev) => [...prev, trimmed]);
      }
      setDesignationInput('');
    }
  };

  const removeDesignation = (chip) => {
    setDesignations((prev) => prev.filter((c) => c !== chip));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) {
      toast.error('Leave Type name is required');
      return;
    }
    setIsSaving(true);
    const formData = {
      name: name.trim(),
      allotmentType,
      monthlyLimit: Number(monthlyLimit),
      paidStatus,
      color,
      noOfLeaves: Number(noOfLeaves),
      departments: selectedDepts,
      designations,
    };
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  }

  const TABS = ['General', 'Entitlement', 'Applicability'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-modal-title"
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 id="leave-modal-title" className="text-xl font-bold text-slate-900">
              {leave ? 'Edit Leave Type' : 'Add New Leave Type'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Fill in the details below</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-8 border-b border-slate-200 px-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 pt-4 text-sm font-medium transition border-b-2 cursor-pointer ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* TAB 1 – GENERAL */}
          {activeTab === 'General' && (
            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
              <FormField label="Leave Type" required>
                <input
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sick Leave, Casual Leave"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Leave Allotment Type">
                <select
                  value={allotmentType}
                  onChange={(e) => setAllotmentType(e.target.value)}
                  className={inputClass}
                >
                  <option value="Monthly Leave">Monthly Leave</option>
                  <option value="Yearly Leave">Yearly Leave</option>
                </select>
              </FormField>

              <FormField label="No. of Monthly Leaves" required>
                <input
                  type="number"
                  min="0"
                  required
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Leave Paid Status">
                <select
                  value={paidStatus}
                  onChange={(e) => setPaidStatus(e.target.value)}
                  className={inputClass}
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </FormField>

              <FormField label="Color Code" required>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 p-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    aria-label="Select leave color"
                    className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent"
                  />
                  <span className="text-sm font-medium text-slate-700">{color.toUpperCase()}</span>
                  <div className="ml-auto flex items-center gap-1.5 pr-1">
                    {[
                      { label: 'Red', hex: '#DC2626' },
                      { label: 'Green', hex: '#16813D' },
                      { label: 'Gray', hex: '#64748B' },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        title={c.label}
                        onClick={() => setColor(c.hex)}
                        className={`h-6 w-6 rounded-md border-2 transition cursor-pointer ${
                          color.toLowerCase() === c.hex.toLowerCase()
                            ? 'border-blue-600 scale-110'
                            : 'border-slate-200 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              </FormField>
            </div>
          )}

          {/* TAB 2 – ENTITLEMENT */}
          {activeTab === 'Entitlement' && (
            <div className="p-6">
              <p className="mb-5 text-sm text-slate-500">
                Set the maximum number of leaves an employee can take for this leave type in a year.
              </p>
              <div className="max-w-xs">
                <FormField label="Total Annual Leaves (Quota)" required>
                  <input
                    type="number"
                    min="0"
                    required
                    value={noOfLeaves}
                    onChange={(e) => setNoOfLeaves(e.target.value)}
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* TAB 3 – APPLICABILITY */}
          {activeTab === 'Applicability' && (
            <div className="space-y-6 p-6">
              <p className="text-sm text-slate-500">
                Choose which department and job designations this leave type applies to.
              </p>

              <FormField label="Departments">
                <p className="mt-1 mb-3 text-xs text-slate-400">
                  Click a department to select it. Click again to remove it.
                </p>

                <div className="flex flex-wrap gap-2">
                  {availableDepartments.length === 0 ? (
                    <p className="text-xs text-slate-400">No departments found.</p>
                  ) : (
                    availableDepartments.map((dept) => {
                      const isSelected = selectedDepts.includes(dept);
                      return (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => toggleDept(dept)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                        >
                          {isSelected && <span className="mr-1">✓</span>}
                          {dept}
                        </button>
                      );
                    })
                  )}
                </div>

                {selectedDepts.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedDepts.map((dept) => (
                      <span
                        key={dept}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-100 border border-blue-200 px-2.5 py-1 text-xs font-medium text-blue-700"
                      >
                        {dept}
                        <button
                          type="button"
                          onClick={() => toggleDept(dept)}
                          className="text-blue-400 hover:text-red-500 cursor-pointer ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </FormField>

              <FormField label="Applicable Designations">
                <input
                  type="text"
                  placeholder="Type a role and press Enter (e.g. Manager)"
                  value={designationInput}
                  onChange={(e) => setDesignationInput(e.target.value)}
                  onKeyDown={handleDesignationKey}
                  className={inputClass + ' max-w-md'}
                />
                <p className="mt-1 text-xs text-slate-400">
                  Press Enter or comma after each designation to add it.
                </p>
                {designations.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {designations.map((chip) => (
                      <span
                        key={chip}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700"
                      >
                        {chip}
                        <button
                          type="button"
                          onClick={() => removeDesignation(chip)}
                          className="text-slate-400 hover:text-red-500 cursor-pointer ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </FormField>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Leavetypesetting() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archived'
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [modal, setModal] = useState(null); // null | { leave: null | object }

  const fetchleavetype = async () => {
    try {
      const response = await getAllLeaveTypes();
      if (response.data?.leaveTypes) {
        setLeaveTypes(response.data.leaveTypes);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch leave types');
    }
  };

  const toggleArchive = async (leave) => {
    try {
      const response = await archiveLeaveType(leave.id);
      toast.success(
        response.data?.message ||
          (leave.isArchived ? 'Leave type restored' : 'Leave type archived')
      );
      fetchleavetype();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error updating leave type');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getAllDepartments();
      const raw = response.data?.department || response.data?.departments || [];
      const names = raw
        .map((d) => (typeof d === 'string' ? d : d.departmentName))
        .filter(Boolean);
      setAvailableDepartments(names);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch departments');
    }
  };

  const handleSaveLeaveType = async (formData) => {
    try {
      if (modal?.leave?.id) {
        // Edit mode
        const response = await updateLeaveType(modal.leave.id, formData);
        toast.success(response.data?.message || 'Leave type updated successfully');
      } else {
        // Create mode
        const response = await createLeaveType(formData);
        toast.success(response.data?.message || 'Leave type created successfully');
      }
      setModal(null);
      fetchleavetype();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save leave type');
      throw err;
    }
  };

  useEffect(() => {
    fetchleavetype();
    fetchDepartments();
  }, []);

  let activeCount = 0;
  let archivedCount = 0;
  let paidCount = 0;
  const totalCount = leaveTypes.length;

  leaveTypes.forEach((leave) => {
    if (leave.isArchived) {
      archivedCount++;
    } else {
      activeCount++;
      if (leave.paidStatus === 'Paid') {
        paidCount++;
      }
    }
  });

  // Filter leaves based on activeTab
  const visibleLeaves = leaveTypes.filter((leave) => {
    const isArchived = Boolean(leave.isArchived);
    if (activeTab === 'active' && isArchived) return false;
    if (activeTab === 'archived' && !isArchived) return false;
    return true;
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Leave Type Settings
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Configure company leave quotas, paid policies, and department rules.
              </p>
            </div>
            <button
              onClick={() => setModal({ leave: null })}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 cursor-pointer"
            >
              <HiPlus className="h-4 w-4" /> Add Leave Type
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Total leave types"
              value={totalCount}
              detail={`${activeCount} active, ${archivedCount} archived`}
              icon="calendar"
            />
            <SummaryCard
              label="Paid leave types"
              value={paidCount}
              detail="With paid status enabled"
              icon="check"
            />
            <SummaryCard
              label="Archived types"
              value={archivedCount}
              detail="Not available for new requests"
              icon="archive"
            />
          </div>

          {/* Table Section */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 pt-5 sm:px-6">
              {/* Tabs */}
              <div className="flex flex-wrap items-center gap-6">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`border-b-2 pb-3 text-sm font-semibold transition cursor-pointer ${
                    activeTab === 'active'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Active leave types{' '}
                  <span className="ml-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-xs">
                    {activeCount}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('archived')}
                  className={`border-b-2 pb-3 text-sm font-semibold transition cursor-pointer ${
                    activeTab === 'archived'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Archived{' '}
                  <span className="ml-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-xs">
                    {archivedCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Leave type</th>
                    <th className="px-5 py-4">Leave Allotment Type</th>
                    <th className="px-5 py-4">No. of Leaves</th>
                    <th className="px-5 py-4">Monthly limit</th>
                    <th className="px-5 py-4">Leave Paid status</th>
                    <th className="px-5 py-4">Departments</th>
                    <th className="px-5 py-4">Designations</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleLeaves.map((leave) => {
                    const isArchived = Boolean(leave.isArchived);
                    const leavesCount =
                      leave.noOfLeaves !== undefined ? leave.noOfLeaves : leave.leaves || 0;
                    return (
                      <tr key={leave.id} className="align-top transition hover:bg-slate-50/70">
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-3">
                            <span
                              className="mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ring-slate-100"
                              style={{ backgroundColor: leave.color || '#16813D' }}
                            />
                            <div>
                              <p className="font-semibold text-slate-900">{leave.name}</p>
                              <p className="mt-1 text-xs text-slate-400 font-medium">
                                {leave.color === '#DC2626'
                                  ? 'RED'
                                  : leave.color === '#64748B'
                                  ? 'GRAY'
                                  : 'GREEN'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                            {leave.allotmentType || 'Yearly'}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-sm font-semibold tabular-nums text-slate-800">
                          {leavesCount}
                        </td>
                        <td className="px-5 py-5 text-sm tabular-nums text-slate-600">
                          {leave.monthlyLimit ?? 1}
                        </td>
                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              leave.paidStatus === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                leave.paidStatus === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            {leave.paidStatus || 'Paid'}
                          </span>
                        </td>
                        <td className="max-w-[210px] px-5 py-5">
                          <PillList items={leave.departments} empty="All" />
                        </td>
                        <td className="max-w-[230px] px-5 py-5">
                          <PillList items={leave.designations} empty="All" />
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            {!isArchived && (
                              <button
                                onClick={() => setModal({ leave })}
                                title={`Edit ${leave.name}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                              >
                                <HiPencil className="h-3.5 w-3.5" /> Edit
                              </button>
                            )}
                            <button
                              onClick={() => toggleArchive(leave)}
                              title={isArchived ? `Restore ${leave.name}` : `Archive ${leave.name}`}
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                                isArchived
                                  ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                  : 'border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700'
                              }`}
                            >
                              {isArchived ? (
                                <HiRefresh className="h-3.5 w-3.5" />
                              ) : (
                                <HiArchive className="h-3.5 w-3.5" />
                              )}{' '}
                              {isArchived ? 'Restore' : 'Archive'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {visibleLeaves.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-sm text-slate-500">
                        No leave types found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Table Footer */}
              <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
                <p>
                  Showing{' '}
                  <span className="font-semibold text-slate-700">{visibleLeaves.length}</span> of{' '}
                  <span className="font-semibold text-slate-700">
                    {activeTab === 'archived' ? archivedCount : activeCount}
                  </span>{' '}
                  leave types
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Leave Type Modal (Add / Edit) */}
      {modal && (
        <LeaveModal
          leave={modal.leave}
          availableDepartments={availableDepartments}
          onClose={() => setModal(null)}
          onSave={handleSaveLeaveType}
        />
      )}
    </div>
  );
}

export default Leavetypesetting;