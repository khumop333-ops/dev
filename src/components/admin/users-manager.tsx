"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createStaffUserAction,
  toggleUserActiveAction,
  changeOwnPasswordAction,
} from "@/server/actions/admin";
import { formatDateSAST } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@prisma/client";

export interface StaffUserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date | string;
}

export function UsersManager({
  users,
  currentUserId,
  currentUserRole,
}: {
  users: StaffUserRow[];
  currentUserId: string;
  currentUserRole: UserRole;
}) {
  const router = useRouter();
  const isAdmin = currentUserRole === "ADMIN";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STAFF");
  const [creating, setCreating] = useState(false);
  const [userFeedback, setUserFeedback] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwFeedback, setPwFeedback] = useState<string | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setUserFeedback(null);

    const res = await createStaffUserAction({
      name,
      email,
      password,
      role,
    });

    setCreating(false);
    if (!res.ok) {
      setUserFeedback(res.error || "Failed to create user");
      return;
    }

    setUserFeedback("Staff user created.");
    setName("");
    setEmail("");
    setPassword("");
    router.refresh();
  };

  const handleToggleActive = async (targetId: string) => {
    setUserFeedback(null);
    const res = await toggleUserActiveAction(targetId);
    if (!res.ok) {
      setUserFeedback(res.error || "Failed to update user");
      return;
    }
    router.refresh();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPw(true);
    setPwFeedback(null);

    const res = await changeOwnPasswordAction({
      currentPassword,
      newPassword,
    });

    setChangingPw(false);
    if (!res.ok) {
      setPwFeedback(res.error || "Failed to change password");
      return;
    }

    setPwFeedback("Your password has been updated.");
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="space-y-8">
      {userFeedback && (
        <div className="rounded-[6px] border border-[#D6CBB9] bg-white p-3.5 text-xs text-[#1C1C19]">
          {userFeedback}
        </div>
      )}

      {isAdmin ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Users Table */}
          <div className="lg:col-span-7 rounded-[8px] border border-[#D6CBB9] bg-white overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E7DECF]/60 border-b border-[#D6CBB9] text-[#5F5B52]">
                <tr>
                  <th className="py-3 px-4 font-medium">Name / Email</th>
                  <th className="py-3 px-4 font-medium">Role</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Created</th>
                  <th className="py-3 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6CBB9]">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#1C1C19]">{u.name}</p>
                      <p className="text-[#5F5B52]">{u.email}</p>
                    </td>
                    <td className="py-3 px-4 font-mono">{u.role}</td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          u.active
                            ? "rounded-[4px] border border-[#2F6B4F]/40 bg-[#2F6B4F]/10 px-2 py-0.5 text-[11px] text-[#2F6B4F]"
                            : "rounded-[4px] border border-[#9E3A32]/40 bg-[#9E3A32]/10 px-2 py-0.5 text-[11px] text-[#9E3A32]"
                        }
                      >
                        {u.active ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#5F5B52]">
                      {formatDateSAST(u.createdAt, false)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.id === currentUserId ? (
                        <span className="text-[#5F5B52] text-[11px]">
                          Current User
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u.id)}
                          className="text-[#23452F] underline font-medium"
                        >
                          {u.active ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Create Staff Form */}
          <form
            onSubmit={handleCreateUser}
            className="lg:col-span-5 rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4"
          >
            <h2 className="font-serif text-xl text-[#1C1C19] border-b border-[#D6CBB9] pb-2">
              Add Staff / Admin Account
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
                Initial Password (Min 8 chars) *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
              >
                <option value="STAFF">STAFF (Orders &amp; Catalogue)</option>
                <option value="ADMIN">ADMIN (Full Access)</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Account"}
            </Button>
          </form>
        </div>
      ) : (
        <div className="rounded-[8px] border border-[#956A1C] bg-[#956A1C]/10 p-5 text-xs text-[#956A1C]">
          Staff user management is restricted to <strong>ADMIN</strong>{" "}
          accounts. You may update your own account password below.
        </div>
      )}

      {/* Change Own Password */}
      <form
        onSubmit={handleChangePassword}
        className="max-w-md rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4"
      >
        <h2 className="font-serif text-xl text-[#1C1C19] border-b border-[#D6CBB9] pb-2">
          Change My Password
        </h2>

        {pwFeedback && (
          <p className="rounded-[4px] border border-[#D6CBB9] bg-[#F7F3EA] p-2.5 text-xs text-[#1C1C19]">
            {pwFeedback}
          </p>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
            Current Password *
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
            New Password (Min 8 characters) *
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
          />
        </div>

        <Button type="submit" variant="outline" size="md" disabled={changingPw}>
          {changingPw ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
