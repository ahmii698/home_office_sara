// src/components/Installments/SelectedRecovery.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Clock, CheckCircle, AlertCircle, Building, X,
  Eye, Edit2, ChevronLeft, ChevronRight, AlertTriangle,
  RefreshCw, Save, UserCheck, Lock, Filter
} from 'lucide-react';
import './Installments.css';
import { API_URL } from '../../../config';

// ============================================
// ✅ TOASTER COMPONENT - Right Side Bottom
// ============================================
const Toaster = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const colors = {
    success: { bg: '#d1fae5', border: '#22c55e', text: '#065f46', icon: CheckCircle },
    error: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', icon: AlertCircle },
    info: { bg: '#dbeafe', border: '#2563eb', text: '#1e40af', icon: CheckCircle },
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: AlertCircle },
  };

  const style = colors[type] || colors.success;
  const Icon = style.icon;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 99999,
      maxWidth: '420px',
      width: '100%',
      animation: 'toasterSlideIn 0.4s ease'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 18px',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.18)',
        borderLeft: `5px solid ${style.border}`,
        border: `1px solid ${style.border}`,
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: style.bg,
          color: style.text,
          flexShrink: 0,
          marginTop: '2px'
        }}>
          <Icon size={18} />
        </div>
        <div style={{
          flex: 1,
          fontSize: '13px',
          fontWeight: 600,
          color: style.text,
          lineHeight: 1.5
        }}>
          {message}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#9ca3af',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px'
          }}
        >
          <X size={18} />
        </button>
      </div>
      <style>{`
        @keyframes toasterSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes toasterSlideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// ============================================
// ✅ CONFIRMATION MODAL
// ============================================
const ConfirmModal = ({ isOpen, onConfirm, onCancel, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100000,
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        maxWidth: '420px',
        width: '100%',
        padding: '28px 32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'modalSlideUp 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertCircle size={20} style={{ color: '#dc2626' }} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A1628', margin: 0 }}>{title || 'Confirm Action'}</h3>
        </div>
        
        <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#4b5563', marginBottom: '24px', lineHeight: 1.6 }}>
          {message || 'Are you sure you want to perform this action?'}
        </p>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: '1.5px solid #d1d5db',
              background: 'transparent',
              color: '#6b7280',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 24px',
              borderRadius: '8px',
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.background = '#2563eb'}
          >
            <CheckCircle size={16} />
            {confirmText}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalSlideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

const SelectedRecovery = () => {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [userBranch, setUserBranch] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editPaymentData, setEditPaymentData] = useState({
    paid_amount: '',
    month: '',
    installment_id: null,
    due_amount: 0,
    current_paid: 0,
    balance: 0,
    customer_name: '',
    case_no: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [paymentDate, setPaymentDate] = useState('');

  // ============================================
  // ✅ TOASTER STATE
  // ============================================
  const [toaster, setToaster] = useState({ message: '', type: 'info', show: false });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    onConfirm: null,
    title: 'Confirm Action',
    message: 'Are you sure you want to perform this action?'
  });

  const showToaster = (message, type = 'info') => {
    setToaster({ message, type, show: true });
  };

  const hideToaster = () => {
    setToaster({ message: '', type: 'info', show: false });
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({
      isOpen: true,
      onConfirm,
      title,
      message
    });
  };

  const hideConfirm = () => {
    setConfirmModal({
      isOpen: false,
      onConfirm: null,
      title: 'Confirm Action',
      message: 'Are you sure you want to perform this action?'
    });
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserBranch(user.branch);
      setUserRole(user.role);
    }
    setPaymentDate(new Date().toISOString().split('T')[0]);
    fetchMyAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ============================================
  // ✅ Helper: current month string "YYYY-MM"
  // ============================================
  const getCurrentMonthStrGlobal = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // ============================================
  // ✅ FETCH - with dedup logic
  // ============================================
  const fetchMyAssignments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/recovery-assignments/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        const rawData = data.data || [];
        const currentMonthStr = getCurrentMonthStrGlobal();

        const uniqueMap = new Map();

        rawData.forEach(item => {
          const accountId = item.account_id || item.account?.id;
          if (!accountId) {
            if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
            return;
          }

          const existing = uniqueMap.get(accountId);
          if (!existing) {
            uniqueMap.set(accountId, item);
            return;
          }

          const itemMonth = item.month || '';
          const existingMonth = existing.month || '';

          const isItemCurrentMonth = itemMonth === currentMonthStr;
          const isExistingCurrentMonth = existingMonth === currentMonthStr;

          if (isItemCurrentMonth) {
            uniqueMap.set(accountId, item);
            return;
          }
          if (isExistingCurrentMonth) {
            return;
          }

          const itemUnpaid = parseFloat(item.balance || 0) > 0;
          const existingUnpaid = parseFloat(existing.balance || 0) > 0;

          if (itemUnpaid && existingUnpaid) {
            if (itemMonth < existingMonth) {
              uniqueMap.set(accountId, item);
            }
          } else if (itemUnpaid && !existingUnpaid) {
            uniqueMap.set(accountId, item);
          } else if (!itemUnpaid && !existingUnpaid) {
            if (itemMonth > existingMonth) {
              uniqueMap.set(accountId, item);
            }
          }
        });

        setInstallments(Array.from(uniqueMap.values()));
      }
    } catch (error) {
      console.error('Error fetching assigned recovery:', error);
      showToaster('Failed to load assigned recovery', 'error');
    } finally {
      setLoading(false);
    }
  };

  const monthsBetween = useCallback((fromMonth, toMonth) => {
    if (!fromMonth || !toMonth) return 0;
    const [fy, fm] = fromMonth.split('-').map(Number);
    const [ty, tm] = toMonth.split('-').map(Number);
    return (ty - fy) * 12 + (tm - fm);
  }, []);

  const getCurrentMonthStr = useCallback(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const getAgingMonths = useCallback((item) => {
    if (!item.month) return 1;
    const monthsDiff = monthsBetween(item.month, getCurrentMonthStr());
    if (monthsDiff < 0) return 0;
    return monthsDiff + 1;
  }, [monthsBetween, getCurrentMonthStr]);

  // ============================================
  // ✅ Single source of truth for status
  // ============================================
  const getItemStatusKey = useCallback((item) => {
    const balance = parseFloat(item.balance || 0);

    if (balance <= 0) return 'paid';
    if (!item.month) return 'unpaid';

    const monthsDiff = monthsBetween(item.month, getCurrentMonthStr());
    if (monthsDiff < 0) return 'unpaid';

    const agingCount = monthsDiff + 1;
    if (agingCount >= 4) return 'overdue';
    return 'aging';
  }, [monthsBetween, getCurrentMonthStr]);

  const getStatusBadge = (item) => {
    const statusKey = getItemStatusKey(item);
    const agingCount = getAgingMonths(item);

    switch (statusKey) {
      case 'paid':
        return <span className="badge badge-paid"><CheckCircle size={14} /> Paid</span>;
      case 'unpaid':
        return <span className="badge badge-unpaid"><Clock size={14} /> Unpaid</span>;
      case 'overdue':
        return <span className="badge badge-overdue"><AlertCircle size={14} /> Overdue</span>;
      case 'aging':
      default:
        return <span className="badge badge-aging"><AlertTriangle size={14} /> Aging ({agingCount}m)</span>;
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const getEmployeeAccount = (account) => {
    if (!account) return {};
    return account.employeeAccount || account.employee_account || {};
  };

  const employeeList = useMemo(() => {
    const map = new Map();
    installments.forEach(item => {
      const info = item.assignment_info;
      if (info && info.assigned_to_name) {
        const key = String(info.assigned_to_id ?? info.assigned_to_name);
        if (!map.has(key)) {
          map.set(key, { id: key, name: info.assigned_to_name });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [installments]);

  const filteredInstallments = useMemo(() => {
    const search = debouncedSearch.toLowerCase().trim();

    return installments.filter(item => {
      if (search) {
        const customer = item.customer || item.account?.customer || {};
        const customerName = (customer.name || item.customer_name || '').toLowerCase();
        const customerCnic = (customer.cnic || item.cnic || '').toLowerCase();
        const caseNo = (item.account?.case_no || item.case_no || '').toLowerCase();
        const matchesSearch = customerName.includes(search) || customerCnic.includes(search) || caseNo.includes(search);
        if (!matchesSearch) return false;
      }

      if (employeeFilter !== 'all') {
        const info = item.assignment_info;
        const key = info ? String(info.assigned_to_id ?? info.assigned_to_name) : null;
        if (key !== employeeFilter) return false;
      }

      if (statusFilter !== 'all') {
        if (getItemStatusKey(item) !== statusFilter) return false;
      }

      return true;
    });
  }, [installments, debouncedSearch, employeeFilter, statusFilter, getItemStatusKey]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = useMemo(
    () => filteredInstallments.slice(indexOfFirstItem, indexOfLastItem),
    [filteredInstallments, indexOfFirstItem, indexOfLastItem]
  );
  const totalPages = Math.ceil(filteredInstallments.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totals = useMemo(() => {
    let totalDue = 0, totalPaid = 0, totalBalance = 0;
    filteredInstallments.forEach(item => {
      totalDue += parseFloat(item.due_amount || 0);
      totalPaid += parseFloat(item.paid_amount || 0);
      totalBalance += parseFloat(item.balance || 0);
    });
    return { totalDue, totalPaid, totalBalance, count: filteredInstallments.length };
  }, [filteredInstallments]);

  const handlePayInstallment = async (installmentId) => {
    showConfirm(
      'Confirm Payment',
      'Are you sure you want to mark this installment as paid?',
      async () => {
        hideConfirm();
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/installments/pay`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ installment_id: installmentId, payment_date: new Date().toISOString().split('T')[0] })
          });
          const data = await response.json();
          if (data.success) {
            showToaster('✅ Installment marked as paid!', 'success');
            fetchMyAssignments();
          } else {
            showToaster('❌ Failed: ' + data.message, 'error');
          }
        } catch (error) {
          console.error(error);
          showToaster('Network error. Please try again.', 'error');
        }
      }
    );
  };

  const openEditModal = (item) => {
    const customer = item.customer || item.account?.customer || {};
    setEditPaymentData({
      paid_amount: '',
      month: item.month || '',
      installment_id: item.id,
      due_amount: item.due_amount || 0,
      current_paid: item.paid_amount || 0,
      balance: item.balance || 0,
      customer_name: customer.name || item.customer_name || 'N/A',
      case_no: item.account?.case_no || item.case_no || 'N/A'
    });
    setShowEditModal(true);
  };

  const handlePartialPaymentSubmit = async () => {
    if (!editPaymentData.paid_amount || parseFloat(editPaymentData.paid_amount) <= 0) {
      showToaster('Please enter a valid payment amount', 'warning');
      return;
    }
    const amount = parseFloat(editPaymentData.paid_amount);
    const maxPayable = parseFloat(editPaymentData.balance) || 0;
    if (amount > maxPayable) {
      showToaster(`Amount cannot exceed remaining balance of ${formatCurrency(maxPayable)}`, 'error');
      return;
    }

    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/installments/partial-pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          installment_id: editPaymentData.installment_id,
          paid_amount: amount,
          month: editPaymentData.month,
          payment_date: new Date().toISOString().split('T')[0]
        })
      });
      const data = await response.json();
      if (data.success) {
        showToaster(`✅ Payment of ${formatCurrency(amount)} recorded successfully!`, 'success');
        setShowEditModal(false);
        fetchMyAssignments();
      } else {
        showToaster('❌ Failed: ' + data.message, 'error');
      }
    } catch (error) {
      console.error(error);
      showToaster('Network error. Please try again.', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="installments-page">
      {/* ===== TOASTER ===== */}
      {toaster.show && (
        <Toaster
          message={toaster.message}
          type={toaster.type}
          onClose={hideToaster}
        />
      )}

      {/* ===== CONFIRM MODAL ===== */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onConfirm={() => {
          if (confirmModal.onConfirm) confirmModal.onConfirm();
        }}
        onCancel={hideConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Confirm"
        cancelText="Cancel"
      />

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-container edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <Edit2 size={24} className="modal-header-icon" />
                <div>
                  <h2 className="modal-title">Edit Payment</h2>
                  <p className="modal-subtitle">Case: {editPaymentData.case_no}</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body edit-modal-body">
              <div className="edit-summary">
                <div className="edit-summary-item">
                  <span className="label">Customer</span>
                  <span className="value" style={{fontWeight: '600', color: '#1a1a2e'}}>{editPaymentData.customer_name}</span>
                </div>
                <div className="edit-summary-item">
                  <span className="label">Monthly Installment</span>
                  <span className="value">{formatCurrency(editPaymentData.due_amount)}</span>
                </div>
                <div className="edit-summary-item">
                  <span className="label">Remaining Balance</span>
                  <span className="value" style={{color: '#ef4444', fontWeight: 'bold'}}>{formatCurrency(editPaymentData.balance)}</span>
                </div>
              </div>
              <div className="edit-form">
                <div className="form-group">
                  <label>Payment Amount (PKR) *</label>
                  <input
                    type="number"
                    value={editPaymentData.paid_amount}
                    onChange={(e) => setEditPaymentData({ ...editPaymentData, paid_amount: e.target.value })}
                    placeholder="Enter amount to pay"
                    className="form-input"
                    min="0"
                    max={editPaymentData.balance}
                    autoFocus
                  />
                  <small className="form-hint">Max payable: {formatCurrency(editPaymentData.balance)}</small>
                </div>
                <div className="form-group">
                  <label>Payment Date</label>
                  <input type="date" value={paymentDate} className="form-input" disabled />
                </div>
              </div>
              <div className="edit-modal-footer">
                <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn-save-payment" onClick={handlePartialPaymentSubmit} disabled={editLoading}>
                  {editLoading ? (<><RefreshCw size={16} className="spinning" /> Processing...</>) : (<><Save size={16} /> Record Payment</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="header-title-group">
          <h2 className="page-title">Selected Recovery</h2>
          <span className="live-badge">
            <UserCheck size={12} /> This Month
          </span>
        </div>
        {userBranch && (
          <div className="branch-badge">
            <Building size={14} />
            <span>Branch {userBranch}</span>
          </div>
        )}
      </div>

      <div className="stats-grid-4">
        <div className="stat-card-4">
          <div className="stat-card-4-icon total">
            <UserCheck size={22} />
          </div>
          <div className="stat-card-4-info">
            <span className="stat-card-4-label">Assigned Accounts</span>
            <span className="stat-card-4-value">{totals.count}</span>
          </div>
        </div>
        <div className="stat-card-4">
          <div className="stat-card-4-icon due">
            <AlertCircle size={22} />
          </div>
          <div className="stat-card-4-info">
            <span className="stat-card-4-label">Total Balance</span>
            <span className="stat-card-4-value">{formatCurrency(totals.totalBalance)}</span>
          </div>
        </div>
        <div className="stat-card-4">
          <div className="stat-card-4-icon paid">
            <CheckCircle size={22} />
          </div>
          <div className="stat-card-4-info">
            <span className="stat-card-4-label">Total Paid</span>
            <span className="stat-card-4-value">{formatCurrency(totals.totalPaid)}</span>
          </div>
        </div>
      </div>

      {/* ✅ FILTERS SECTION */}
      <div className="filters-section" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="filter-search" style={{ flex: '1 1 260px' }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, CNIC, case no..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="search-input"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserCheck size={16} style={{ color: '#6b7280' }} />
          <select
            value={employeeFilter}
            onChange={(e) => { setEmployeeFilter(e.target.value); setCurrentPage(1); }}
            className="form-input"
            style={{ minWidth: '180px' }}
          >
            <option value="all">All Employees</option>
            {employeeList.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={16} style={{ color: '#6b7280' }} />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="form-input"
            style={{ minWidth: '160px' }}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="aging">Aging</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading assigned recovery...</p>
          </div>
        ) : filteredInstallments.length === 0 ? (
          <div className="empty-state">
            <UserCheck size={48} />
            <h3>No accounts assigned to you yet</h3>
            <p>When admin/manager assigns you recovery, it will appear here</p>
          </div>
        ) : (
          <>
            <table className="installments-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Case No</th>
                  <th>Due Date</th>
                  <th>Installment</th>
                  <th>Balance</th>
                  <th>Mirror</th>
                  <th>Remarks</th>
                  <th>Status</th>
                  <th>Collected By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => {
                  const actualIndex = indexOfFirstItem + index + 1;
                  const customer = item.customer || item.account?.customer || {};
                  const customerName = customer.name || item.customer_name || 'N/A';
                  const customerCnic = customer.cnic || item.cnic || '';
                  const caseNo = item.account?.case_no || item.case_no || 'N/A';
                  const assignmentInfo = item.assignment_info || null;

                  const accountData = item.account || {};
                  const accountTotalBalance = accountData.balance || item.balance || 0;
                  const remarks = item.remarks || '';

                  return (
                    <tr key={item.id} className="installment-row">
                      <td className="text-center">{actualIndex}</td>
                      <td>
                        <div className="customer-info">
                          <strong style={{color: '#1a1a2e'}}>{customerName}</strong>
                          {customerCnic && <span className="customer-cnic">{customerCnic}</span>}
                        </div>
                      </td>
                      <td><span className="case-no">{caseNo}</span></td>
                      <td>
                        <span className="month-text" style={{fontWeight: '500', color: '#7c3aed'}}>
                          {item.due_date ? formatDate(item.due_date) : (item.month ? new Date(item.month + '-01').toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '-')}
                        </span>
                      </td>
                      <td className="text-right">{formatCurrency(item.due_amount)}</td>
                      <td className="text-right" style={{fontWeight: 'bold', color: '#dc2626', fontSize: '14px'}}>
                        {formatCurrency(accountTotalBalance)}
                      </td>
                      <td className="text-right" style={{color: item.balance > 0 ? '#ef4444' : '#10b981'}}>
                        {formatCurrency(item.balance)}
                      </td>
                      <td>
                        <span style={{fontSize: '12px', color: '#4b5563', maxWidth: '150px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={remarks || ''}>
                          {remarks || '-'}
                        </span>
                      </td>
                      <td>{getStatusBadge(item)}</td>
                      <td>
                        {assignmentInfo ? (
                          <div style={{ fontSize: '12px' }}>
                            <div style={{ fontWeight: 600, color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <UserCheck size={12} /> {assignmentInfo.assigned_to_name}
                            </div>
                            <div style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Lock size={10} /> till {assignmentInfo.unlock_date}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>N/A</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-edit" onClick={() => openEditModal(item)} title="Edit Payment">
                            <Edit2 size={14} />
                          </button>
                          {item.balance > 0 ? (
                            <button className="btn-pay" onClick={() => handlePayInstallment(item.id)} title="Pay Full">
                              <CheckCircle size={14} /> Pay
                            </button>
                          ) : (
                            <span className="paid-text">✓ Paid</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredInstallments.length)} of {filteredInstallments.length} entries
                </div>
                <div className="pagination-buttons">
                  <button className="pagination-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                    <ChevronLeft size={16} /> Previous
                  </button>
                  {[...Array(totalPages).keys()].map(number => (
                    <button
                      key={number + 1}
                      className={`pagination-btn ${currentPage === number + 1 ? 'active' : ''}`}
                      onClick={() => paginate(number + 1)}
                    >
                      {number + 1}
                    </button>
                  ))}
                  <button className="pagination-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SelectedRecovery;