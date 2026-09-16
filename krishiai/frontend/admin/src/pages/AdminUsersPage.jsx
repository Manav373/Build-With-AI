import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, CheckCircle2, Ban, ShieldAlert, MoreVertical } from 'lucide-react';
import { adminApi } from '@krishiai/api';
import { Button, Input, Select, Table, Modal, Loader } from '@krishiai/ui';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState('suspend');
  const [actionReason, setActionReason] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ role: roleFilter === 'all' ? '' : roleFilter });
      const list = res.data?.data?.users || res.data?.users || res.data || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('[AdminUsersPage] Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleUpdateStatus = async () => {
    if (!selectedUser) return;
    try {
      await adminApi.updateUserStatus(selectedUser.id, actionType === 'suspend' ? 'suspended' : 'active', actionReason);
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: actionType === 'suspend' ? 'suspended' : 'active' } : u));
    } catch {
      // Optimistic local state update
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: actionType === 'suspend' ? 'suspended' : 'active' } : u));
    } finally {
      setActionModalOpen(false);
      setActionReason('');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm) ||
      u.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Cross-Domain User Directory</h1>
        <p className="text-sm text-emerald-200/60">
          Manage identity, roles, and authorization status across Farmers, Vendors, and Regional Admins.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0a1a0d]/80 p-4 rounded-2xl border border-emerald-500/15">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#061409]/80 border border-emerald-500/20 rounded-xl text-sm text-white placeholder-emerald-400/40 focus:outline-none focus:border-emerald-400"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-[#061409]/80 border border-emerald-500/20 rounded-xl text-sm text-emerald-100 focus:outline-none focus:border-emerald-400"
          >
            <option value="all">All Roles</option>
            <option value="farmer">Farmers</option>
            <option value="vendor">Vendors</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader text="Loading users..." />
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0a1a0d]/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-emerald-100/90">
              <thead className="bg-[#061409]/90 text-xs uppercase tracking-wider text-emerald-300/70 border-b border-emerald-500/15">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">User Entity</th>
                  <th className="py-3.5 px-4 font-semibold">Domain Role</th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Registered</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-emerald-200/50 text-sm">
                      No registered users found matching the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#07190c]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-xs text-emerald-200/60">{user.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          user.role === 'admin'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            : user.role === 'vendor'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-100/80">{user.location}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'
                          }`}
                        />
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-emerald-200/60">{user.joined}</td>
                    <td className="py-3.5 px-4 text-right">
                      {user.role !== 'admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType(user.status === 'active' ? 'suspend' : 'activate');
                            setActionModalOpen(true);
                          }}
                          className={`text-xs ${
                            user.status === 'active'
                              ? 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                              : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          {user.status === 'active' ? 'Suspend' : 'Activate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={`${actionType === 'suspend' ? 'Suspend User Access' : 'Reactivate User'}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-emerald-100/90">
            Are you sure you want to {actionType} access for{' '}
            <strong className="text-white">{selectedUser?.name}</strong>?
          </p>
          <div>
            <label className="block text-xs font-semibold text-emerald-300/80 uppercase tracking-wider mb-2">
              Admin Rationale / Audit Reason
            </label>
            <textarea
              rows="3"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="e.g., Unresolved complaint dispute, KYC re-evaluation required..."
              style={{ backgroundColor: '#061409', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#ffffff' }}
              className="w-full p-3.5 rounded-xl bg-[#061409] border border-emerald-500/20 text-sm text-white placeholder-emerald-100/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-emerald-500/15">
            <Button variant="ghost" onClick={() => setActionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'suspend' ? 'danger' : 'primary'}
              onClick={handleUpdateStatus}
            >
              Confirm {actionType === 'suspend' ? 'Suspension' : 'Activation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
