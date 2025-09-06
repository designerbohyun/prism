import React, { useState, useMemo } from "react";
import {
  notificationHistoryData,
  getUniqueGroups,
  getUniqueManagers,
} from "../data/notificationData";

const NotificationModal = ({ isOpen, onClose, isDarkMode }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [managerFilter, setManagerFilter] = useState("");

  // 더미 데이터
  const notifications = notificationHistoryData;

  // 고유한 그룹과 담당자 목록 추출
  const uniqueGroups = getUniqueGroups();
  const uniqueManagers = getUniqueManagers();

  // 필터링된 데이터
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        notification.cctvName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        notification.errorType
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        notification.groupName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        notification.manager.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGroup =
        !groupFilter || notification.groupName === groupFilter;
      const matchesManager =
        !managerFilter || notification.manager === managerFilter;

      return matchesSearch && matchesGroup && matchesManager;
    });
  }, [notifications, searchQuery, groupFilter, managerFilter]);

  // 심각도에 따른 스타일
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "error":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case "critical":
        return "심각";
      case "error":
        return "오류";
      case "warning":
        return "경고";
      default:
        return "정보";
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* 모달 컨텐츠 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-6xl mx-auto ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } rounded-xl shadow-2xl`}
        >
          {/* 모달 헤더 */}
          <div
            className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h2
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              알림 이력
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "text-gray-400 hover:text-white hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 모달 바디 */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* 검색 및 필터 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* 검색창 */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="검색..."
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* 그룹 필터 */}
              <div>
                <select
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                >
                  <option value="">모든 그룹</option>
                  {uniqueGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              {/* 담당자 필터 */}
              <div>
                <select
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={managerFilter}
                  onChange={(e) => setManagerFilter(e.target.value)}
                >
                  <option value="">모든 담당자</option>
                  {uniqueManagers.map((manager) => (
                    <option key={manager} value={manager}>
                      {manager}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 필터 결과 표시 및 초기화 버튼 */}
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                총 {filteredNotifications.length}건의 알림 이력
              </span>
              {(searchQuery || groupFilter || managerFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setGroupFilter("");
                    setManagerFilter("");
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  필터 초기화
                </button>
              )}
            </div>

            {/* 테이블 */}
            <div
              className={`border rounded-lg overflow-hidden ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
                    <tr>
                      <th
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        그룹명
                      </th>
                      <th
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        CCTV명
                      </th>
                      <th
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        담당자
                      </th>
                      <th
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        오류 유형
                      </th>
                      <th
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        발생 일시
                      </th>
                      <th
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        심각도
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    } divide-y ${
                      isDarkMode ? "divide-gray-700" : "divide-gray-200"
                    }`}
                  >
                    {filteredNotifications.slice(0, 10).map((notification) => (
                      <tr
                        key={notification.id}
                        className={`transition-colors duration-150 ${
                          isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                        }`}
                      >
                        <td
                          className={`px-4 py-3 text-sm font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {notification.groupName}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {notification.cctvName}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {notification.manager}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {notification.errorType}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {notification.occurredAt}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getSeverityStyle(
                              notification.severity
                            )}`}
                          >
                            {getSeverityText(notification.severity)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 데이터가 없을 때 */}
              {filteredNotifications.length === 0 && (
                <div className="text-center py-8">
                  <svg
                    className={`mx-auto h-12 w-12 ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3
                    className={`mt-2 text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    알림 이력이 없습니다
                  </h3>
                  <p
                    className={`mt-1 text-sm ${
                      isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {searchQuery || groupFilter || managerFilter
                      ? "검색 조건에 맞는 알림 이력이 없습니다."
                      : "아직 등록된 알림 이력이 없습니다."}
                  </p>
                </div>
              )}
            </div>

            {/* 통계 정보 */}
            {filteredNotifications.length > 0 && (
              <div className="mt-4 flex items-center justify-between text-xs">
                <span
                  className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                >
                  최근 10건만 표시됩니다.
                </span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                    >
                      심각:{" "}
                      {
                        filteredNotifications.filter(
                          (n) => n.severity === "critical"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-orange-500 rounded-full mr-2"></div>
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                    >
                      오류:{" "}
                      {
                        filteredNotifications.filter(
                          (n) => n.severity === "error"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                    >
                      경고:{" "}
                      {
                        filteredNotifications.filter(
                          (n) => n.severity === "warning"
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
