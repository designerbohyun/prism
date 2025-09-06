import React, { useState, useEffect } from "react";
// 목업 데이터 파일 경로: src/mocks/mockData.js (경로가 다르면 아래 경로를 맞춰주세요)
import { mockApi } from "../data/mockData";

// role(영문) → permission(한글) 매핑
const ROLE_LABEL = {
  admin: "관리자",
  network_admin: "네트워크 관리자",
  operator: "장치 관리자",
};

// ISO → 'YYYY-MM-DD HH:mm' 포맷
const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};

function UserManagement({ isDarkMode, onRegisterDrawerTrigger }) {
  const [searchTerm] = useState("");
  const [selectedPermission] = useState("전체");
  const [selectedStatus] = useState("전체");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  // ⬇️ 초기 하드코딩 배열 대신, 목업에서 가져오므로 빈 배열로 시작
  const [users, setUsers] = useState([]);

  // 사용자 등록/수정 폼 데이터
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    permission: "장치 관리자",
    password: "",
    confirmPassword: "",
    status: "활성",
  });

  const [isEditing, setIsEditing] = useState(false);

  // Dashboard에서 호출할 수 있도록 drawer 열기 함수 등록
  useEffect(() => {
    if (onRegisterDrawerTrigger) {
      onRegisterDrawerTrigger(() => openDrawer);
    }
  }, [onRegisterDrawerTrigger]);

  // ⬇️ 최초 마운트 시 목업 데이터에서 사용자 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      const raw = await mockApi.getUsers(); // [{id, name, email, role, department, lastLogin}, ...]
      if (!alive) return;
      const mapped = raw.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        permission: ROLE_LABEL[u.role] ?? "장치 관리자",
        status: "활성", // 서버 연동 시 해당 필드 사용
        lastLogin: formatDate(u.lastLogin),
        createdAt: "-", // 서버 연동 시 해당 필드 사용
      }));
      setUsers(mapped);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 필터링된 사용자 목록
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPermission =
      selectedPermission === "전체" || user.permission === selectedPermission;
    const matchesStatus =
      selectedStatus === "전체" || user.status === selectedStatus;

    return matchesSearch && matchesPermission && matchesStatus;
  });

  const permissions = ["전체", "관리자", "네트워크 관리자", "장치 관리자"];

  // 사용자 추가/수정 drawer 열기
  const openDrawer = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        permission: user.permission,
        password: "",
        confirmPassword: "",
        status: user.status,
      });
      setIsEditing(false);
    } else {
      setSelectedUser(null);
      setFormData({
        name: "",
        email: "",
        permission: "장치 관리자",
        password: "",
        confirmPassword: "",
        status: "활성",
      });
      setIsEditing(false);
    }
    setIsDrawerOpen(true);
  };

  // Drawer 닫기
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedUser(null);
    setIsEditing(false);
    setFormData({
      name: "",
      email: "",
      permission: "장치 관리자",
      password: "",
      confirmPassword: "",
      status: "활성",
    });
  };

  // 편집 모드 토글
  const handleEdit = () => {
    setIsEditing(true);
  };

  // 사용자 삭제
  const handleDelete = () => {
    if (selectedUser && window.confirm("정말 이 사용자를 삭제하시겠습니까?")) {
      setUsers(users.filter((user) => user.id !== selectedUser.id));
      closeDrawer();
    }
  };

  // 폼 제출 처리
  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedUser && isEditing) {
      // 수정
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                name: formData.name,
                email: formData.email,
                permission: formData.permission,
                status: formData.status,
              }
            : user
        )
      );
      setIsEditing(false);
    } else if (!selectedUser) {
      // 추가
      const newUser = {
        id: users.length + 1,
        name: formData.name,
        email: formData.email,
        permission: formData.permission,
        status: formData.status,
        lastLogin: "-",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setUsers([...users, newUser]);
      closeDrawer();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 사용자 목록 테이블 */}
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } rounded-xl border overflow-hidden flex-1`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className={`${
                isDarkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-50 border-gray-200"
              } border-b`}
            >
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  이름
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  이메일
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  권한
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  상태
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  마지막 로그인
                </th>
              </tr>
            </thead>
            <tbody
              className={`${
                isDarkMode ? "divide-gray-700" : "divide-gray-200"
              } divide-y`}
            >
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`${
                    isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  } transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isDarkMode
                            ? "bg-gray-600 text-gray-300"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <button
                          onClick={() => openDrawer(user)}
                          className={`text-sm font-medium ${
                            isDarkMode
                              ? "text-white hover:text-teal-400"
                              : "text-gray-900 hover:text-teal-600"
                          } transition-colors cursor-pointer`}
                        >
                          {user.name}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-900"
                      }`}
                    >
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-medium ${
                        isDarkMode ? " text-gray-400" : " text-gray-700"
                      }`}
                    >
                      {user.permission}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-sm font-medium rounded-full ${
                        user.status === "활성"
                          ? isDarkMode
                            ? "bg-green-500/20 text-green-400"
                            : "bg-green-100 text-green-700"
                          : isDarkMode
                          ? "bg-red-500/20 text-red-400"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {user.lastLogin}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 사용자 등록/수정 Drawer */}
      {isDrawerOpen && (
        <div
          className={`fixed inset-0 z-50 ${
            isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {/* 오버레이 */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              isDrawerOpen ? "opacity-50" : "opacity-0"
            }`}
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-md transform transition-transform duration-300 ${
              isDrawerOpen ? "translate-x-0" : "translate-x-full"
            } ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } shadow-xl overflow-y-auto`}
          >
            {/* Drawer 헤더 */}
            <div
              className={`flex items-center justify-between p-6 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="w-full flex items-center gap-1">
                <button
                  onClick={closeDrawer}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-400"
                      : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedUser
                    ? isEditing
                      ? "사용자 수정"
                      : "사용자 상세"
                    : "사용자 등록"}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {selectedUser && !isEditing && (
                  <button
                    onClick={handleEdit}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                        : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                    }`}
                    title="편집"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Drawer 내용 */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 이름 */}
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  이름 {!selectedUser && "*"}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required={!selectedUser}
                  readOnly={selectedUser && !isEditing}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    selectedUser && !isEditing
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                />
              </div>

              {/* 이메일 */}
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  이메일 {!selectedUser && "*"}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required={!selectedUser}
                  readOnly={selectedUser && !isEditing}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    selectedUser && !isEditing
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                />
              </div>

              {/* 권한 */}
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  권한 {!selectedUser && "*"}
                </label>
                <select
                  value={formData.permission}
                  onChange={(e) =>
                    setFormData({ ...formData, permission: e.target.value })
                  }
                  disabled={selectedUser && !isEditing}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    selectedUser && !isEditing
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                >
                  {permissions.slice(1).map((permission) => (
                    <option key={permission} value={permission}>
                      {permission}
                    </option>
                  ))}
                </select>
              </div>

              {/* 상태 */}
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  상태
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  disabled={selectedUser && !isEditing}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    selectedUser && !isEditing
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                >
                  <option value="활성">활성</option>
                  <option value="비활성">비활성</option>
                </select>
              </div>

              {/* 추가 정보 (상세 보기 시) */}
              {selectedUser && (
                <>
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      } mb-2`}
                    >
                      등록일
                    </label>
                    <input
                      type="text"
                      value={selectedUser.createdAt}
                      readOnly
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } cursor-not-allowed opacity-60`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      } mb-2`}
                    >
                      마지막 로그인
                    </label>
                    <input
                      type="text"
                      value={selectedUser.lastLogin}
                      readOnly
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } cursor-not-allowed opacity-60`}
                    />
                  </div>
                </>
              )}

              {/* 비밀번호 (신규 등록 시) */}
              {!selectedUser && (
                <>
                  <div>
                    <label
                      className={`block text.sm font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      } mb-2`}
                    >
                      비밀번호 *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required={!selectedUser}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      } mb-2`}
                    >
                      비밀번호 확인 *
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required={!selectedUser}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                </>
              )}

              {/* 버튼 그룹 */}
              <div className="flex flex-col space-y-3 pt-6">
                {!selectedUser ? (
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                    >
                      등록
                    </button>
                    <button
                      type="button"
                      onClick={closeDrawer}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      취소
                    </button>
                  </div>
                ) : isEditing ? (
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>삭제</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
