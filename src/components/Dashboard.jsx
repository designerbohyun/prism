import React, { useState, useEffect, useMemo } from "react";
import CCTVManagement from "./CCTVManagement";
import CCTVGroupManagement from "./CCTVGroupManagement";
import UserManagement from "./UserManagement";
import PrismLightLogo from "../assets/PrismLightLogo";
import PrismDarkLogo from "../assets/PrismDarkLogo";
import CctvPlayer from "./CctvPlayer";
import { API_BASE } from "../apiBase";

function Dashboard({ onLogout }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 등록 drawer 트리거 함수들
  const [cctvDrawerTrigger, setCctvDrawerTrigger] = useState(null);
  const [cctvGroupDrawerTrigger, setCctvGroupDrawerTrigger] = useState(null);
  const [userDrawerTrigger, setUserDrawerTrigger] = useState(null);

  const [cctvList, setCctvList] = useState([]);
  const hasCctvInUnassignedGroup = useMemo(() => {
    return cctvList.some((cctv) => cctv.groupId === 2);
  }, [cctvList]);
  const [undecidedCount, setUndecidedCount] = useState(0);
  const [increaseRate, setIncreaseRate] = useState(0);

  const fetchCctvList = () => {
    fetch(`${API_BASE}/cctvs`)
      .then((res) => res.json())
      .then((data) => {
        setCctvList(data);
      })
      .catch((err) => console.error("CCTV 목록 오류:", err));
  };

  const fetchDailyCounts = () => {
    fetch(`${API_BASE}/cctvs/daily-count`)
      .then((res) => res.json())
      .then((data) => {
        const today = data.today || 0;
        const yesterday = data.yesterday || 0;
        const rate =
          yesterday > 0
            ? ((today - yesterday) / yesterday) * 100
            : today > 0
            ? 100
            : 0;
        setIncreaseRate(rate);
      })
      .catch((err) => console.error("일일 증가율 오류:", err));
  };

  const refreshCctvStats = () => {
    fetchCctvList(); // CCTVManagement용 목록 // Sidebar용 상태 아이콘 (예: '미정' 그룹 있음 여부)
    fetchDailyCounts(); // 통계 카드
  };

  useEffect(() => {
    refreshCctvStats();
  }, []);

  // ✅ 실제 통계 계산 (useMemo로 최적화)
  const { totalCount, onlineCount, offlineCount, warningCount } =
    useMemo(() => {
      const total = cctvList.length;
      const online = cctvList.filter((c) => c.status === "ACTIVE").length;
      const offline = cctvList.filter((c) => c.status === "OFFLINE").length;
      const warning = cctvList.filter((c) => c.status === "WARNING").length;
      return {
        totalCount: total,
        onlineCount: online,
        offlineCount: offline,
        warningCount: warning,
      };
    }, [cctvList]);

  const menuItems = [
    {
      id: "dashboard",
      label: "대시보드",
      icon: (
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      id: "cctv-group",
      label: (
        <span className="flex items-center gap-1">
          CCTV 그룹 관리
          {hasCctvInUnassignedGroup && (
            <span className="w-2 h-2 bg-red-500 rounded-full" />
          )}
        </span>
      ),
      icon: (
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
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "cctv",
      label: "CCTV 관리",
      icon: (
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
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "alerts",
      label: "장애&알림",
      icon: (
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
    {
      id: "users",
      label: "사용자 관리",
      icon: (
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      } flex relative overflow-hidden`}
    >
      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-r transition-transform duration-300 ease-in-out lg:transition-none`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 w-[80px]">
            {isDarkMode ? <PrismDarkLogo /> : <PrismLightLogo />}
          </div>
        </div>
        <nav className="mt-4 px-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full px-4 py-3 mb-1 rounded-lg text-left flex items-center space-x-3 transition-all duration-200 ${
                activeMenu === item.id
                  ? isDarkMode
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                    : "bg-teal-50 text-teal-600"
                  : isDarkMode
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span
                className={
                  activeMenu === item.id
                    ? isDarkMode
                      ? "text-white"
                      : "text-teal-600"
                    : isDarkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }
              >
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div
          className={`absolute bottom-0 w-64 p-4 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {/* 다크모드 토글 */}
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 w-full">
              <div
                className={`w-8 h-8 ${
                  isDarkMode ? "bg-gray-600" : "bg-gray-200"
                } rounded-full flex items-center justify-center`}
              >
                <svg
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  관리자
                </p>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  admin@prism.com
                </p>
              </div>
            </div>
            <div className="mb-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isDarkMode
                    ? " hover:bg-gray-600 text-gray-400 hover:text-gray-300"
                    : " hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                }`}
                title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
              >
                {isDarkMode ? (
                  // 태양 아이콘 (라이트 모드로 전환)
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  // 달 아이콘 (다크 모드로 전환)
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            onClick={onLogout}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isDarkMode
                ? "text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600"
                : "text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col h-full">
        {/* 헤더 */}
        <header
          className={`${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border-b`}
        >
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 모바일 햄버거 버튼 */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`lg:hidden p-2 rounded-md ${
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h2
                className={`text-lg sm:text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {menuItems.find((item) => item.id === activeMenu)?.label}
              </h2>
            </div>

            {/* 등록 버튼들 */}
            <div className="flex items-center space-x-3">
              {/* CCTV 그룹 등록 버튼 */}
              {activeMenu === "cctv-group" && (
                <button
                  onClick={() =>
                    cctvGroupDrawerTrigger && cctvGroupDrawerTrigger()
                  }
                  className={`px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isDarkMode
                      ? "bg-teal-600 text-white hover:bg-teal-700"
                      : "bg-teal-600 text-white hover:bg-teal-700"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="hidden sm:inline">그룹 추가</span>
                </button>
              )}

              {/* CCTV 등록 버튼 */}
              {activeMenu === "cctv" && (
                <button
                  onClick={() => cctvDrawerTrigger && cctvDrawerTrigger()}
                  className={`px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isDarkMode
                      ? "bg-teal-600 text-white hover:bg-teal-700"
                      : "bg-teal-600 text-white hover:bg-teal-700"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="hidden sm:inline">CCTV 등록</span>
                </button>
              )}

              {/* 사용자 등록 버튼 */}
              {activeMenu === "users" && (
                <button
                  onClick={() => userDrawerTrigger && userDrawerTrigger()}
                  className={`px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isDarkMode
                      ? "bg-teal-600 text-white hover:bg-teal-700"
                      : "bg-teal-600 text-white hover:bg-teal-700"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="hidden sm:inline">사용자 등록</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main
          className={`flex-1 p-4 sm:p-6 overflow-y-auto h-0 ${
            isDarkMode ? "" : "bg-gray-50"
          }`}
        >
          {activeMenu === "cctv-group" ? (
            <CCTVGroupManagement
              isDarkMode={isDarkMode}
              onRegisterDrawerTrigger={setCctvGroupDrawerTrigger}
              onUpdateUndecidedCctvCount={setUndecidedCount}
              onRefreshCctvs={refreshCctvStats}
            />
          ) : activeMenu === "cctv" ? (
            <CCTVManagement
              isDarkMode={isDarkMode}
              onRegisterDrawerTrigger={setCctvDrawerTrigger}
              onRefreshCctvs={refreshCctvStats}
            />
          ) : activeMenu === "users" ? (
            <UserManagement
              isDarkMode={isDarkMode}
              onRegisterDrawerTrigger={setUserDrawerTrigger}
            />
          ) : (
            <>
              {/* 통계 카드들 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* 전체 CCTV 카드 */}
                <div
                  className={`${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } rounded-xl border p-6`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-2 rounded-lg ${
                        isDarkMode ? "bg-teal-500/10" : "bg-teal-100"
                      }`}
                    >
                      <svg
                        className={`w-6 h-6 ${
                          isDarkMode ? "text-teal-400" : "text-teal-600"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 font-medium flex items-center">
                      {increaseRate > 0 ? (
                        <svg
                          className="w-3 h-3 mr-1 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : increaseRate < 0 ? (
                        <svg
                          className="w-3 h-3 mr-1 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M14.707 10.293a1 1 0 00-1.414 0L11 12.586V5a1 1 0 10-2 0v7.586l-2.293-2.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : null}
                      <span>
                        {increaseRate > 0 && "+"}
                        {increaseRate.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      전체 CCTV
                    </h3>
                    <p
                      className={`text-2xl font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      } mt-1`}
                    >
                      {totalCount}
                    </p>
                  </div>
                </div>

                {/* 온라인 상태 카드 */}
                <div
                  className={`${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } rounded-xl border p-6`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-2 rounded-lg ${
                        isDarkMode ? "bg-green-500/10" : "bg-green-100"
                      }`}
                    >
                      <svg
                        className={`w-6 h-6 ${
                          isDarkMode ? "text-green-400" : "text-green-600"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 font-medium flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      +1.4%
                    </span>
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      온라인 상태
                    </h3>
                    <p
                      className={`text-2xl font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      } mt-1`}
                    >
                      {onlineCount}
                    </p>
                  </div>
                </div>

                {/* 장애 발생 카드 */}
                <div
                  className={`${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } rounded-xl border p-6`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-2 rounded-lg ${
                        isDarkMode ? "bg-red-500/10" : "bg-red-100"
                      }`}
                    >
                      <svg
                        className={`w-6 h-6 ${
                          isDarkMode ? "text-red-400" : "text-red-600"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 font-medium flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      -25.0%
                    </span>
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      장애 발생
                    </h3>
                    <p
                      className={`text-2xl font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      } mt-1`}
                    >
                      {offlineCount}
                    </p>
                  </div>
                </div>

                {/* 주의 필요 카드 */}
                <div
                  className={`${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } rounded-xl border p-6`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-2 rounded-lg ${
                        isDarkMode ? "bg-yellow-500/10" : "bg-yellow-100"
                      }`}
                    >
                      <svg
                        className={`w-6 h-6 ${
                          isDarkMode ? "text-yellow-400" : "text-yellow-600"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 font-medium flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      +66.7%
                    </span>
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      주의 필요
                    </h3>
                    <p
                      className={`text-2xl font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      } mt-1`}
                    >
                      {warningCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
                {/* 실시간 CCTV 목록 */}
                <div
                  className={`${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } rounded-xl border w-full h-full xl:w-2/3`}
                >
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b ${
                      isDarkMode ? "border-gray-700" : "border-gray-200"
                    } gap-2`}
                  >
                    <h3
                      className={`text-base sm:text-lg font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      실시간 CCTV 목록
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs sm:text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        총 {totalCount}대
                      </span>
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-xs sm:text-sm text-green-400 font-medium">
                        LIVE
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 ">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {cctvList.map((cctv) => {
                        const validHls =
                          cctv.hlsAddress && cctv.hlsAddress.startsWith("http");

                        return (
                          <div
                            key={cctv.id}
                            className={`${
                              isDarkMode ? "bg-gray-700" : "bg-gray-50"
                            } rounded-lg p-4 relative`}
                          >
                            <div className="aspect-video bg-black rounded-lg mb-3 overflow-hidden relative">
                              {cctv.status === "ACTIVE" &&
                              cctv.hlsAddress?.includes("http") ? (
                                <CctvPlayer
                                  key={cctv.id}
                                  src={cctv.hlsAddress}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg
                                    className="w-12 h-12 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                              )}

                              {/* 상태 뱃지 */}
                              <div className="absolute top-2 left-2">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    cctv.status === "ACTIVE"
                                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                      : cctv.status === "offline"
                                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  }`}
                                >
                                  {cctv.status.toUpperCase()}
                                </span>
                              </div>

                              {/* 위치 뱃지 */}
                              <div className="absolute top-2 right-2">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    isDarkMode
                                      ? "bg-gray-600 text-gray-300"
                                      : "bg-white text-gray-700"
                                  }`}
                                >
                                  {cctv.locationName}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <h4
                                  className={`font-medium text-sm ${
                                    isDarkMode ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {cctv.locationName}
                                </h4>
                                <p
                                  className={`text-xs ${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  } mt-1`}
                                >
                                  {cctv.ipAddress}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 장애 알림 */}
                <div
                  className={`${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } rounded-xl border w-full xl:w-1/3`}
                >
                  <div
                    className={`px-6 py-4 border-b ${
                      isDarkMode ? "border-gray-700" : "border-gray-200"
                    } flex items-center justify-between`}
                  >
                    <h3
                      className={`text-lg font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      장애 알림
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        isDarkMode
                          ? "bg-red-500/20 text-red-400"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      3 활성
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div
                        className={`rounded-lg p-4 ${
                          isDarkMode
                            ? "bg-red-500/10 border border-red-500/20"
                            : "bg-red-50 border border-red-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4
                              className={`text-sm font-medium ${
                                isDarkMode ? "text-red-400" : "text-red-700"
                              }`}
                            >
                              높음
                            </h4>
                            <p
                              className={`text-sm ${
                                isDarkMode ? "text-gray-300" : "text-gray-700"
                              } mt-1`}
                            >
                              API 서버 응답 지연
                            </p>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              } mt-2`}
                            >
                              10분 전 발생
                            </p>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`rounded-lg p-4 ${
                          isDarkMode
                            ? "bg-yellow-500/10 border border-yellow-500/20"
                            : "bg-yellow-50 border border-yellow-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4
                              className={`text-sm font-medium ${
                                isDarkMode
                                  ? "text-yellow-400"
                                  : "text-yellow-700"
                              }`}
                            >
                              중간
                            </h4>
                            <p
                              className={`text-sm ${
                                isDarkMode ? "text-gray-300" : "text-gray-700"
                              } mt-1`}
                            >
                              메모리 사용율 경고
                            </p>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              } mt-2`}
                            >
                              25분 전 발생
                            </p>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`rounded-lg p-4 ${
                          isDarkMode
                            ? "bg-yellow-500/10 border border-yellow-500/20"
                            : "bg-yellow-50 border border-yellow-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4
                              className={`text-sm font-medium ${
                                isDarkMode
                                  ? "text-yellow-400"
                                  : "text-yellow-700"
                              }`}
                            >
                              낮음
                            </h4>
                            <p
                              className={`text-sm ${
                                isDarkMode ? "text-gray-300" : "text-gray-700"
                              } mt-1`}
                            >
                              디스크 공간 부족 경고
                            </p>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              } mt-2`}
                            >
                              1시간 전 발생
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
