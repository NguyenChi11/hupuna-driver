"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ICONS } from "@/components/constants";
import Link from "next/link";
import { getProxyUrl } from "@/utils/utils";
import Image from "next/image";

export default function ProfilePage() {
  const { user, loading, logout } = useCurrentUser();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-gray-600">Bạn chưa đăng nhập</p>
        <Link
          href="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
        {typeof user.background === "string" && user.background && (
          <Image
            src={getProxyUrl(user.background)}
            alt={user.name as string}
            fill
            className="object-cover opacity-50"
            unoptimized
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/20" />

        <Link
          href="/"
          className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition"
        >
          <ICONS.ArrowLeft className="w-6 h-6" />
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg bg-gray-200 overflow-hidden flex items-center justify-center text-4xl font-bold text-gray-400">
                {user.avatar ? (
                  <Image
                    src={getProxyUrl(user.avatar as string)}
                    alt={user.name as string}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  (user.name as string)?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <div
                className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white ${
                  user.status === "online" ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
            </div>

            <div className="flex-1 text-center md:text-left mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {user.name as string}
              </h1>
              <p className="text-gray-500 text-lg">
                @{user.username as string}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                {user.role && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                    {user.role as string}
                  </span>
                )}
                {user.department && (
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100">
                    {user.department as string}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={logout}
              className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition flex items-center gap-2"
            >
              <ICONS.Logout className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-l-4 border-blue-500 pl-3">
                Thông tin cá nhân
              </h3>

              <div className="space-y-4">
                <InfoItem
                  icon={<ICONS.Mail className="w-5 h-5" />}
                  label="Email"
                  value={user.email as string}
                />
                <InfoItem
                  icon={<ICONS.Phone className="w-5 h-5" />}
                  label="Điện thoại"
                  value={user.phone as string}
                />
                <InfoItem
                  icon={<ICONS.MapPin className="w-5 h-5" />}
                  label="Địa chỉ"
                  value={user.address as string}
                />
                <InfoItem
                  icon={<ICONS.Calendar className="w-5 h-5" />}
                  label="Ngày sinh"
                  value={user.birthday as string}
                />
                <InfoItem
                  icon={<ICONS.User className="w-5 h-5" />}
                  label="Giới tính"
                  value={user.gender as string}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-l-4 border-purple-500 pl-3">
                Công việc & Khác
              </h3>
              <div className="space-y-4">
                <InfoItem
                  icon={<ICONS.Briefcase className="w-5 h-5" />}
                  label="Chức danh"
                  value={user.title as string}
                />
                <InfoItem
                  icon={<ICONS.Info className="w-5 h-5" />}
                  label="Bio"
                  value={user.bio as string}
                />
                <InfoItem
                  icon={<ICONS.Clock className="w-5 h-5" />}
                  label="Tham gia ngày"
                  value={
                    user.createdAt
                      ? new Date(user.createdAt as string).toLocaleDateString()
                      : "N/A"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
      <div className="text-gray-400 mt-1">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-gray-900 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}