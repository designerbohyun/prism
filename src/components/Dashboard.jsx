import React, { useState, useEffect, useMemo } from "react";
import CCTVManagement from "./CCTVManagement";
import CCTVGroupManagement from "./CCTVGroupManagement";
import UserManagement from "./UserManagement";
import CCTVAlertHistory from "./CCTVAlertHistory";
import NetworkMonitoringDetail from "./NetworkMonitoringDetail";
import PrismLightLogo from "../assets/PrismLightLogo";
import PrismDarkLogo from "../assets/PrismDarkLogo";
import CctvPlayer from "./CctvPlayer";
import { API_BASE } from "../apiBase";
import { mockApi } from "../data/mockData";

function Dashboard({ onLogout, userInfo }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCctv, setSelectedCctv] = useState(null);

  // 사용자 권한 확인
  const userRole = userInfo?.role || "operator";

  // 등록 drawer 트리거 함수들
  const [cctvDrawerTrigger, setCctvDrawerTrigger] = useState(null);
  const [cctvGroupDrawerTrigger, setCctvGroupDrawerTrigger] = useState(null);
  const [userDrawerTrigger, setUserDrawerTrigger] = useState(null);

  const [cctvList, setCctvList] = useState([]);
  const hasCctvInUnassignedGroup = useMemo(() => {
    return cctvList.some((cctv) => cctv.groupId === 2);
  }, [cctvList]);
  const [alertHistory, setAlertHistory] = useState([]);

  const [increaseRate, setIncreaseRate] = useState(0); // 전체 CCTV 카드에 사용
  const [statusRates, setStatusRates] = useState({
    total: 0,
    active: 0,
    warning: 0,
    error: 0,
  });

  // 오늘(현재) 실제 개수
  const [countsNow, setCountsNow] = useState({
    total: 0,
    active: 0,
    error: 0,
    warning: 0,
  });

  const fetchCctvList = () => {
    fetch(`${API_BASE}/cctvs`)
      .then((res) => res.json())
      .then((data) => {
        setCctvList(data);
      })
      .catch((err) => console.error("CCTV 목록 오류:", err));
  };

  // KST 기준 어제 날짜(YYYY-MM-DD) 구하기
  const getYesterdayKstYmd = () => {
    const now = new Date();
    const kstNow = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    );
    kstNow.setDate(kstNow.getDate() - 1);
    const yyyy = kstNow.getFullYear();
    const mm = String(kstNow.getMonth() + 1).padStart(2, "0");
    const dd = String(kstNow.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const calcRate = (t, p) => {
    const tn = Number(t) || 0;
    const pn = Number(p) || 0;
    if (pn === 0) return tn === 0 ? 0 : tn * 100; // 전일 0이면 캡 없이 t×100
    return ((tn - pn) / pn) * 100;
  };

  const fetchDailyCounts = async () => {
    try {
      const ymd = getYesterdayKstYmd();

      const [todayRes, yRes] = await Promise.all([
        fetch(`${API_BASE}/cctvs/status-counts`).then((r) => r.json()),
        fetch(`${API_BASE}/cctvs/status-counts-daily?date=${ymd}`).then((r) =>
          r.json()
        ),
      ]);

      // 안전가드
      const today = todayRes || {};
      const yesterday = yRes || {};

      // total 없으면 합산해서 계산 (offline이 있으면 포함)
      const sum = (obj = {}) =>
        (obj.active ?? 0) +
        (obj.error ?? 0) +
        (obj.warning ?? 0) +
        (obj.offline ?? 0);

      const todayTotal = (today.total ?? 0) || sum(today);
      const yTotal = (yesterday.total ?? 0) || sum(yesterday);

      // 현재 카운트 상태 반영
      setCountsNow({
        total: todayTotal,
        active: today.active ?? 0,
        error: today.error ?? 0,
        warning: today.warning ?? 0,
      });

      // 증감률 계산 (전일 0이면 t×100으로 100% 초과도 그대로 표기)
      const rate = (t, p) => {
        const tn = Number(t) || 0;
        const pn = Number(p) || 0;
        if (pn === 0) return tn === 0 ? 0 : tn * 100;
        return ((tn - pn) / pn) * 100;
      };

      const rates = {
        total: rate(todayTotal, yTotal),
        active: rate(today.active, yesterday.active),
        error: rate(today.error, yesterday.error),
        warning: rate(today.warning, yesterday.warning),
      };

      setStatusRates(rates);
      setIncreaseRate(rates.total); // 전체 CCTV 카드에 사용
    } catch (e) {
      console.error("상태 퍼센트 계산 오류:", e);
    }
  };

  // 대시보드 진입 시 한번 불러오기
  useEffect(() => {
    fetchDailyCounts();
    fetchCctvList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // JS 버전의 컴포넌트(타입 제거)
  const Trend = ({ value = 0 }) => {
    const n = Number(value) || 0;
    const up = n >= 0;
    const cls = `text-xs font-medium flex items-center ${
      up ? "text-green-500" : "text-red-500"
    }`;
    return (
      <span className={cls}>
        {up ? (
          <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 15l10-10v6h2V3h-8v2h6L5 15z" />
          </svg>
        ) : (
          <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 5L5 15v-6H3v8h8v-2H5l10-10z" />
          </svg>
        )}
        {Math.abs(n).toFixed(1)}%
      </span>
    );
  };

  const fetchAlertHistory = () => {
    // 목업 데이터 사용 (실제 API 대신)
    mockApi
      .getAlertHistory()
      .then((data) => {
        setAlertHistory(data);
      })
      .catch((err) => {
        console.error("장애 이력 불러오기 실패:", err);
      });
  };

  const refreshCctvStats = () => {
    fetchCctvList(); // CCTVManagement용 목록 // Sidebar용 상태 아이콘 (예: '미정' 그룹 있음 여부)
    fetchDailyCounts(); // 통계 카드
    fetchAlertHistory(); // 장애 이력
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

  // 심각도별 배지 색상 함수
  const getSeverityBadgeClasses = (severity) => {
    const badgeClasses = {
      위험: {
        bg: isDarkMode
          ? "bg-red-500/10 border border-red-500/20"
          : "bg-red-50 border border-red-200",
        text: isDarkMode ? "text-red-400" : "text-red-700",
      },
      심각: {
        bg: isDarkMode
          ? "bg-orange-500/10 border border-orange-500/20"
          : "bg-orange-50 border border-orange-200",
        text: isDarkMode ? "text-orange-400" : "text-orange-700",
      },
      주의: {
        bg: isDarkMode
          ? "bg-yellow-500/10 border border-yellow-500/20"
          : "bg-yellow-50 border border-yellow-200",
        text: isDarkMode ? "text-yellow-400" : "text-yellow-700",
      },
      경고: {
        bg: isDarkMode
          ? "bg-gray-500/10 border border-gray-500/20"
          : "bg-gray-50 border border-gray-200",
        text: isDarkMode ? "text-gray-400" : "text-gray-700",
      },
    };

    return badgeClasses[severity] || badgeClasses["경고"];
  };

  // 시간 차이 계산 함수
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const alertTime = new Date(dateString);
    const diffInMinutes = Math.floor((now - alertTime) / (1000 * 60));

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}일 전`;
  };

  // 최신 장애 알림 3개 (위험, 심각 우선)
  const recentAlerts = useMemo(() => {
    const severityPriority = { 위험: 4, 심각: 3, 주의: 2, 경고: 1 };

    return alertHistory
      .filter((alert) => alert.severity !== "경고") // 경고는 제외하고 실제 문제가 있는 것만
      .sort((a, b) => {
        // 먼저 심각도 순, 그 다음 시간 순
        const severityDiff =
          severityPriority[b.severity] - severityPriority[a.severity];
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.occurrenceTime) - new Date(a.occurrenceTime);
      })
      .slice(0, 3);
  }, [alertHistory]);

  // 권한별 메뉴 아이템 정의
  const getMenuItems = () => {
    const baseMenuItems = [
      {
        id: "dashboard",
        label:
          userRole === "network_admin" ? "CCTV 네트워크 모니터링" : "대시보드",
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
    ];

    // 관리자 전용 메뉴
    if (userRole === "admin") {
      return [
        ...baseMenuItems,
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
          label: "CCTV 장애 이력",
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
    }

    // 네트워크 관리자 메뉴 - 대시보드만
    if (userRole === "network_admin") {
      return baseMenuItems; // 대시보드만 표시
    }

    // 관제사 메뉴 - 대시보드만
    return baseMenuItems;
  };

  const menuItems = getMenuItems();

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
                  {userInfo?.name || "사용자"}
                </p>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {userInfo?.email || "user@prism.com"}
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

            {/* 등록 버튼들 - 관리자만 표시 */}
            <div className="flex items-center space-x-3">
              {/* CCTV 그룹 등록 버튼 */}
              {userRole === "admin" && activeMenu === "cctv-group" && (
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
              {userRole === "admin" && activeMenu === "cctv" && (
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
              {userRole === "admin" && activeMenu === "users" && (
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
          ) : activeMenu === "alerts" ? (
            <CCTVAlertHistory isDarkMode={isDarkMode} />
          ) : (
            <>
              {/* 네트워크 관리자용 상세 페이지 */}
              {userRole === "network_admin" && selectedCctv ? (
                <NetworkMonitoringDetail
                  isDarkMode={isDarkMode}
                  cctvInfo={selectedCctv}
                  onBack={() => setSelectedCctv(null)}
                />
              ) : userRole === "network_admin" ? (
                <>
                  {/* 네트워크 관리자용 CCTV 영상 목록 - 헤더 없음 */}
                  {cctvList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <svg
                        className={`w-16 h-16 ${
                          isDarkMode ? "text-gray-600" : "text-gray-400"
                        } mb-4`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <h4
                        className={`text-base font-medium ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        } mb-2`}
                      >
                        등록된 CCTV가 없습니다
                      </h4>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-500" : "text-gray-500"
                        } text-center max-w-sm`}
                      >
                        CCTV 관리 메뉴에서 새로운 CCTV를 등록해주세요.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {cctvList.map((cctv) => {
                        const ping =
                          cctv.status === "ACTIVE"
                            ? Math.floor(Math.random() * 50) + 10
                            : 0;
                        const packetLoss =
                          cctv.status === "ACTIVE" ? Math.random() * 2 : 100;
                        return (
                          <div
                            key={cctv.id}
                            className={`${
                              isDarkMode ? "bg-gray-700" : "bg-gray-50"
                            } rounded-lg p-4 relative hover:shadow-lg transition-shadow cursor-pointer`}
                            onClick={() => setSelectedCctv(cctv)}
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
                                      : cctv.status === "OFFLINE"
                                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  }`}
                                >
                                  {cctv.status.toUpperCase()}
                                </span>
                              </div>

                              {/* 네트워크 상태 표시 */}
                              <div className="absolute top-2 right-2">
                                <div
                                  className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                                    ping < 30
                                      ? "bg-green-500/20 border border-green-500/30"
                                      : ping < 60
                                      ? "bg-yellow-500/20 border border-yellow-500/30"
                                      : "bg-red-500/20 border border-red-500/30"
                                  }`}
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      ping < 30
                                        ? "bg-green-500"
                                        : ping < 60
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                  ></div>
                                  <span
                                    className={`text-xs font-medium ${
                                      ping < 30
                                        ? "text-green-400"
                                        : ping < 60
                                        ? "text-yellow-400"
                                        : "text-red-400"
                                    }`}
                                  >
                                    {cctv.status === "ACTIVE"
                                      ? `${ping}ms`
                                      : "OFFLINE"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
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
                                  }`}
                                >
                                  {cctv.ipAddress}
                                </p>
                              </div>

                              {/* 네트워크 상세 정보 */}
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span
                                    className={`${
                                      isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    패킷 손실
                                  </span>
                                  <p
                                    className={`font-medium ${
                                      packetLoss < 1
                                        ? "text-green-400"
                                        : packetLoss < 5
                                        ? "text-yellow-400"
                                        : "text-red-400"
                                    }`}
                                  >
                                    {packetLoss.toFixed(1)}%
                                  </p>
                                </div>
                                <div>
                                  <span
                                    className={`${
                                      isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    대역폭
                                  </span>
                                  <p
                                    className={`font-medium ${
                                      isDarkMode
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {cctv.status === "ACTIVE"
                                      ? "2.4 Mbps"
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>

                              {/* 마지막 확인 시간 */}
                              <div className="flex items-center justify-between text-xs">
                                <span
                                  className={`${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  마지막 확인
                                </span>
                                <span
                                  className={`${
                                    cctv.status === "ACTIVE"
                                      ? "text-green-400"
                                      : isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {cctv.status === "ACTIVE"
                                    ? "방금 전"
                                    : "연결 끊김"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : userRole === "admin" ? (
                <>
                  {/* 관리자 대시보드 통계 카드들 */}
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
                              viewBox="0 0 20 20"
                              fill="currentColor"
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
                              viewBox="0 0 20 20"
                              fill="currentColor"
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
                          {countsNow.total}
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
                          {statusRates.active > 0 ? (
                            <svg
                              className="w-3 h-3 mr-1 text-green-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" />
                            </svg>
                          ) : statusRates.active < 0 ? (
                            <svg
                              className="w-3 h-3 mr-1 text-red-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M14.707 10.293a1 1 0 00-1.414 0L11 12.586V5a1 1 0 10-2 0v7.586l-2.293-2.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" />
                            </svg>
                          ) : null}
                          <span>
                            {statusRates.active > 0 && "+"}
                            {statusRates.active.toFixed(1)}%
                          </span>
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
                          {countsNow.active}
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
                          {statusRates.error > 0 ? (
                            <svg
                              className="w-3 h-3 mr-1 text-green-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" />
                            </svg>
                          ) : statusRates.error < 0 ? (
                            <svg
                              className="w-3 h-3 mr-1 text-red-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M14.707 10.293a1 1 0 00-1.414 0L11 12.586V5a1 1 0 10-2 0v7.586l-2.293-2.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" />
                            </svg>
                          ) : null}
                          <span>
                            {statusRates.error > 0 && "+"}
                            {statusRates.error.toFixed(1)}%
                          </span>
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
                          {countsNow.error}
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
                          {statusRates.warning > 0 ? (
                            <svg
                              className="w-3 h-3 mr-1 text-green-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" />
                            </svg>
                          ) : statusRates.warning < 0 ? (
                            <svg
                              className="w-3 h-3 mr-1 text-red-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M14.707 10.293a1 1 0 00-1.414 0L11 12.586V5a1 1 0 10-2 0v7.586l-2.293-2.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" />
                            </svg>
                          ) : null}
                          <span>
                            {statusRates.warning > 0 && "+"}
                            {statusRates.warning.toFixed(1)}%
                          </span>
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
                          {countsNow.warning}
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
                        {cctvList.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <svg
                              className={`w-16 h-16 ${
                                isDarkMode ? "text-gray-600" : "text-gray-400"
                              } mb-4`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            <h4
                              className={`text-base font-medium ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              } mb-2`}
                            >
                              등록된 CCTV가 없습니다
                            </h4>
                            <p
                              className={`text-sm ${
                                isDarkMode ? "text-gray-500" : "text-gray-500"
                              } text-center max-w-sm`}
                            >
                              CCTV 관리 메뉴에서 새로운 CCTV를 등록해주세요.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {cctvList.map((cctv) => {
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
                                            : cctv.status === "OFFLINE"
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
                                          isDarkMode
                                            ? "text-white"
                                            : "text-gray-900"
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
                        )}
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
                          {recentAlerts.length} 활성
                        </span>
                      </div>
                      <div className="p-6">
                        {recentAlerts.length === 0 ? (
                          <div className="text-center py-8">
                            <svg
                              className={`w-12 h-12 ${
                                isDarkMode ? "text-gray-600" : "text-gray-400"
                              } mx-auto mb-3`}
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
                            <p
                              className={`text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              현재 활성 장애가 없습니다
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {recentAlerts.map((alert) => {
                              const badgeClasses = getSeverityBadgeClasses(
                                alert.severity
                              );
                              return (
                                <div
                                  key={alert.id}
                                  className={`rounded-lg p-4 ${badgeClasses.bg}`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4
                                          className={`text-sm font-medium ${badgeClasses.text}`}
                                        >
                                          {alert.severity}
                                        </h4>
                                        <span
                                          className={`px-2 py-0.5 text-xs rounded-full bg-gray-500/20 ${
                                            isDarkMode
                                              ? "text-gray-300"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          {alert.cctvGroupName}
                                        </span>
                                      </div>
                                      <p
                                        className={`text-sm ${
                                          isDarkMode
                                            ? "text-gray-300"
                                            : "text-gray-700"
                                        } mb-1`}
                                      >
                                        {alert.cctvName} -{" "}
                                        {alert.failureCriteria}
                                      </p>
                                      <p
                                        className={`text-xs ${
                                          isDarkMode
                                            ? "text-gray-500"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        {getTimeAgo(alert.occurrenceTime)} 발생
                                        | 담당자: {alert.managerName}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Operator 대시보드 통계 카드들 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                    {/* HLS 스트림 카드 */}
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
                            isDarkMode ? "bg-blue-500/10" : "bg-blue-100"
                          }`}
                        >
                          <svg
                            className={`w-6 h-6 ${
                              isDarkMode ? "text-blue-400" : "text-blue-600"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10v18a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h14a2 2 0 012 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-500 font-medium flex items-center">
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
                          +2.4%
                        </span>
                      </div>
                      <div>
                        <h3
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          HLS 스트림
                        </h3>
                        <p
                          className={`text-2xl font-bold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          } mt-1`}
                        >
                          {
                            cctvList.filter(
                              (cctv) =>
                                cctv.status === "ACTIVE" && cctv.hlsAddress
                            ).length
                          }
                        </p>
                      </div>
                    </div>

                    {/* 응답시간 카드 */}
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
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-500 font-medium flex items-center">
                          <svg
                            className="w-3 h-3 mr-1 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          -8.2ms
                        </span>
                      </div>
                      <div>
                        <h3
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          평균 응답시간
                        </h3>
                        <p
                          className={`text-2xl font-bold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          } mt-1`}
                        >
                          28ms
                        </p>
                      </div>
                    </div>

                    {/* 화질 정상 카드 */}
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
                            isDarkMode ? "bg-emerald-500/10" : "bg-emerald-100"
                          }`}
                        >
                          <svg
                            className={`w-6 h-6 ${
                              isDarkMode
                                ? "text-emerald-400"
                                : "text-emerald-600"
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
                          +1.2%
                        </span>
                      </div>
                      <div>
                        <h3
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          화질 정상
                        </h3>
                        <p
                          className={`text-2xl font-bold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          } mt-1`}
                        >
                          {
                            cctvList.filter((cctv) => cctv.status === "ACTIVE")
                              .length
                          }
                        </p>
                      </div>
                    </div>

                    {/* 점검 필요 카드 */}
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
                            isDarkMode ? "bg-orange-500/10" : "bg-orange-100"
                          }`}
                        >
                          <svg
                            className={`w-6 h-6 ${
                              isDarkMode ? "text-orange-400" : "text-orange-600"
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
                            className="w-3 h-3 mr-1 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          +2
                        </span>
                      </div>
                      <div>
                        <h3
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          점검 필요
                        </h3>
                        <p
                          className={`text-2xl font-bold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          } mt-1`}
                        >
                          {
                            cctvList.filter(
                              (cctv) =>
                                cctv.status === "WARNING" ||
                                cctv.status === "OFFLINE"
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CCTV 기기 상태 - 1열 전체 */}
                  <div className="mb-6">
                    {/* CCTV 기기 상태 */}
                    <div
                      className={`${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      } rounded-xl border`}
                    >
                      <div
                        className={`px-6 py-4 border-b ${
                          isDarkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                      >
                        <h3
                          className={`text-lg font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          CCTV 기기 상태
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {cctvList.map((cctv, index) => {
                            const cctvCode = `CCTV-${String(cctv.id).padStart(
                              3,
                              "0"
                            )}`;
                            const hlsStatus =
                              cctv.status === "ACTIVE"
                                ? "정상"
                                : cctv.status === "OFFLINE"
                                ? "끊김"
                                : "화질 저하";
                            const quality =
                              cctv.status === "ACTIVE"
                                ? "1080p"
                                : cctv.status === "OFFLINE"
                                ? "연결 안됨"
                                : "720p";
                            const responseTime =
                              cctv.status === "ACTIVE"
                                ? Math.floor(Math.random() * 50) + 20
                                : 0;
                            const lastCheck = `2025-01-${String(
                              Math.floor(Math.random() * 27) + 1
                            ).padStart(2, "0")}`;

                            return (
                              <div
                                key={cctv.id}
                                className={`p-4 rounded-lg border ${
                                  isDarkMode
                                    ? "bg-gray-700 border-gray-600"
                                    : "bg-gray-50 border-gray-200"
                                }`}
                              >
                                {/* Header: 상태 표시와 기본 정보 */}
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-start space-x-3 flex-1">
                                    <div
                                      className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                                        cctv.status === "ACTIVE"
                                          ? "bg-green-500"
                                          : cctv.status === "OFFLINE"
                                          ? "bg-red-500"
                                          : "bg-yellow-500"
                                      }`}
                                    ></div>
                                    <div className="flex-1 min-w-0">
                                      <h4
                                        className={`font-semibold text-sm ${
                                          isDarkMode
                                            ? "text-white"
                                            : "text-gray-900"
                                        } truncate`}
                                      >
                                        {cctv.locationName}
                                      </h4>
                                      <p
                                        className={`text-xs ${
                                          isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                        } mt-0.5`}
                                      >
                                        {cctvCode}
                                      </p>
                                      <p
                                        className={`text-xs ${
                                          isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                        } mt-0.5 truncate`}
                                      >
                                        {cctv.locationAddress ||
                                          "서울시 강남구 테헤란로 123"}
                                      </p>
                                    </div>
                                  </div>
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${
                                      cctv.status === "ACTIVE"
                                        ? "bg-green-500/20 text-green-400"
                                        : cctv.status === "OFFLINE"
                                        ? "bg-red-500/20 text-red-400"
                                        : "bg-yellow-500/20 text-yellow-400"
                                    }`}
                                  >
                                    {cctv.status === "ACTIVE"
                                      ? "정상"
                                      : cctv.status === "OFFLINE"
                                      ? "오프라인"
                                      : "점검필요"}
                                  </span>
                                </div>

                                {/* Content: 영상과 상세 정보 */}
                                <div className="flex flex-col gap-4 mb-4">
                                  {/* 영상 미리보기 */}
                                  <div className="w-full">
                                    <div className="w-full aspect-video bg-black rounded-md overflow-hidden relative">
                                      {cctv.status === "ACTIVE" &&
                                      cctv.hlsAddress?.includes("http") ? (
                                        <CctvPlayer
                                          key={cctv.id}
                                          src={cctv.hlsAddress}
                                        />
                                      ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <svg
                                            className="w-5 h-5 text-gray-600"
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

                                      {/* LIVE 뱃지 */}
                                      {cctv.status === "ACTIVE" && (
                                        <div className="absolute top-1 right-1">
                                          <div className="flex items-center space-x-0.5 px-1 py-0.5 rounded bg-red-500/90">
                                            <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                                            <span className="text-[9px] font-medium text-white">
                                              LIVE
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* 상세 정보 */}
                                  <div className="w-full grid grid-cols-1 gap-2 text-xs">
                                    <div className="flex justify-between">
                                      <span
                                        className={`${
                                          isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        HLS 상태
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          hlsStatus === "정상"
                                            ? "text-green-400"
                                            : hlsStatus === "끊김"
                                            ? "text-red-400"
                                            : "text-yellow-400"
                                        }`}
                                      >
                                        {hlsStatus}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span
                                        className={`${
                                          isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        화질
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          isDarkMode
                                            ? "text-white"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {quality}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span
                                        className={`${
                                          isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        응답시간
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          responseTime < 50
                                            ? "text-green-400"
                                            : responseTime < 100
                                            ? "text-yellow-400"
                                            : "text-red-400"
                                        }`}
                                      >
                                        {responseTime > 0
                                          ? `${responseTime}ms`
                                          : "측정 불가"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span
                                        className={`${
                                          isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        마지막 점검
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          isDarkMode
                                            ? "text-white"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {lastCheck}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions: 버튼들 */}
                                <div
                                  className={`flex gap-2 flex-wrap pt-2 border-t ${
                                    isDarkMode
                                      ? "border-gray-600"
                                      : "border-gray-200"
                                  }`}
                                >
                                  {cctv.status === "ACTIVE" ? (
                                    <>
                                      <button
                                        className={`px-3 py-1.5 text-xs border rounded-md transition-colors ${
                                          isDarkMode
                                            ? "border-gray-500 text-gray-300 hover:bg-gray-500/10"
                                            : "border-gray-400 text-gray-600 hover:bg-gray-400/10"
                                        }`}
                                      >
                                        일시정지
                                      </button>
                                      <button
                                        className={`px-3 py-1.5 text-xs border rounded-md transition-colors ${
                                          isDarkMode
                                            ? "border-gray-500 text-gray-300 hover:bg-gray-500/10"
                                            : "border-gray-400 text-gray-600 hover:bg-gray-400/10"
                                        }`}
                                      >
                                        재시작
                                      </button>
                                    </>
                                  ) : cctv.status === "OFFLINE" ? (
                                    <>
                                      <button
                                        className={`px-3 py-1.5 text-xs border rounded-md transition-colors ${
                                          isDarkMode
                                            ? "border-gray-500 text-gray-300 hover:bg-gray-500/10"
                                            : "border-gray-400 text-gray-600 hover:bg-gray-400/10"
                                        }`}
                                      >
                                        스트림 시작
                                      </button>
                                      <button
                                        className={`px-3 py-1.5 text-xs border rounded-md transition-colors ${
                                          isDarkMode
                                            ? "border-gray-500 text-gray-300 hover:bg-gray-500/10"
                                            : "border-gray-400 text-gray-600 hover:bg-gray-400/10"
                                        }`}
                                      >
                                        수리 요청
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        className={`px-3 py-1.5 text-xs border rounded-md transition-colors ${
                                          isDarkMode
                                            ? "border-gray-500 text-gray-300 hover:bg-gray-500/10"
                                            : "border-gray-400 text-gray-600 hover:bg-gray-400/10"
                                        }`}
                                      >
                                        재시작
                                      </button>
                                      <button
                                        className={`px-3 py-1.5 text-xs border rounded-md transition-colors ${
                                          isDarkMode
                                            ? "border-gray-500 text-gray-300 hover:bg-gray-500/10"
                                            : "border-gray-400 text-gray-600 hover:bg-gray-400/10"
                                        }`}
                                      >
                                        수리 요청
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 정비 일정과 도구 목록 - 2열 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 정비 일정 */}
                    <div
                      className={`${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      } rounded-xl border`}
                    >
                      <div
                        className={`px-6 py-4 border-b ${
                          isDarkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                      >
                        <h3
                          className={`text-lg font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          정비 일정 목록
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {/* 예정된 정비 항목들 */}
                          <div
                            className={`p-4 rounded-lg border ${
                              isDarkMode
                                ? "bg-gray-700 border-gray-600"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4
                                  className={`font-medium text-sm ${
                                    isDarkMode ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  CCTV-001 • 본사 1층 로비
                                </h4>
                                <p
                                  className={`text-xs ${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  } mt-1`}
                                >
                                  정기 점검 - 렌즈 청소, 각도 조정, 케이블 점검
                                </p>
                              </div>
                              <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded-full">
                                예정
                              </span>
                            </div>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              📅 2025-01-30 14:00
                            </p>
                          </div>

                          <div
                            className={`p-4 rounded-lg border ${
                              isDarkMode
                                ? "bg-gray-700 border-gray-600"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4
                                  className={`font-medium text-sm ${
                                    isDarkMode ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  CCTV-004 • 지하주차장 B구역
                                </h4>
                                <p
                                  className={`text-xs ${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  } mt-1`}
                                >
                                  렌즈 교체 - 화질 저하 문제 해결
                                </p>
                              </div>
                              <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                                진행중
                              </span>
                            </div>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              📅 2025-01-28 09:00
                            </p>
                          </div>

                          <div
                            className={`p-4 rounded-lg border ${
                              isDarkMode
                                ? "bg-gray-700 border-gray-600"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4
                                  className={`font-medium text-sm ${
                                    isDarkMode ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  CCTV-005 • 정문 출입구
                                </h4>
                                <p
                                  className={`text-xs ${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  } mt-1`}
                                >
                                  하드웨어 업그레이드 - 4K 해상도 지원
                                </p>
                              </div>
                              <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded-full">
                                예정
                              </span>
                            </div>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              📅 2025-02-05 10:00
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 정비 도구 목록 */}
                    <div
                      className={`${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      } rounded-xl border`}
                    >
                      <div
                        className={`px-6 py-4 border-b ${
                          isDarkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                      >
                        <h3
                          className={`text-lg font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          정비 도구 목록
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-3">
                          <button
                            className={`w-full text-left p-3 rounded-lg border hover:shadow-md transition-all ${
                              isDarkMode
                                ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                                : "bg-gray-50 border-gray-200 hover:bg-white"
                            }`}
                          >
                            <h4
                              className={`font-medium text-sm ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              🔧 CCTV 진단 도구
                            </h4>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              } mt-1`}
                            >
                              네트워크 연결 상태 및 하드웨어 상태 진단
                            </p>
                          </button>

                          <button
                            className={`w-full text-left p-3 rounded-lg border hover:shadow-md transition-all ${
                              isDarkMode
                                ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                                : "bg-gray-50 border-gray-200 hover:bg-white"
                            }`}
                          >
                            <h4
                              className={`font-medium text-sm ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              📋 정비 체크리스트
                            </h4>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              } mt-1`}
                            >
                              표준 정비 절차 및 체크리스트 관리
                            </p>
                          </button>

                          <button
                            className={`w-full text-left p-3 rounded-lg border hover:shadow-md transition-all ${
                              isDarkMode
                                ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                                : "bg-gray-50 border-gray-200 hover:bg-white"
                            }`}
                          >
                            <h4
                              className={`font-medium text-sm ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              📊 성능 모니터링
                            </h4>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              } mt-1`}
                            >
                              실시간 성능 지표 및 트렌드 분석
                            </p>
                          </button>

                          <button
                            className={`w-full text-left p-3 rounded-lg border hover:shadow-md transition-all ${
                              isDarkMode
                                ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                                : "bg-gray-50 border-gray-200 hover:bg-white"
                            }`}
                          >
                            <h4
                              className={`font-medium text-sm ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              🔄 펌웨어 관리
                            </h4>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              } mt-1`}
                            >
                              펌웨어 업데이트 및 버전 관리
                            </p>
                          </button>

                          <button
                            className={`w-full text-left p-3 rounded-lg border hover:shadow-md transition-all ${
                              isDarkMode
                                ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                                : "bg-gray-50 border-gray-200 hover:bg-white"
                            }`}
                          >
                            <h4
                              className={`font-medium text-sm ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              📝 작업 보고서
                            </h4>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              } mt-1`}
                            >
                              정비 작업 결과 기록 및 보고서 생성
                            </p>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
