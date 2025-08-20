import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import CctvPlayer from "./CctvPlayer";

function NetworkMonitoringDetail({ isDarkMode, cctvInfo, onBack }) {
  const [timeRange, setTimeRange] = useState("24h");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "timestamp",
    direction: "desc",
  });
  const [visibleColumns, setVisibleColumns] = useState({
    timestamp: true,
    status: true,
    rttMax: true,
    rttAvg: true,
    rttMin: true,
    packetLoss: true,
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // 샘플 데이터 생성
  const generateSampleData = () => {
    const now = new Date();
    const data = [];
    const tableData = [];

    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const isOnline = Math.random() > 0.1; // 90% 온라인

      const chartPoint = {
        time: time.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fullTime: time.toISOString(),
        RTT_MAX: isOnline ? Math.floor(Math.random() * 20) + 30 : 0,
        RTT_AVG: isOnline ? Math.floor(Math.random() * 15) + 20 : 0,
        RTT_MIN: isOnline ? Math.floor(Math.random() * 10) + 10 : 0,
        PACKET_LOSS_RATE: isOnline ? Math.random() * 2 : 100,
        STATUS: isOnline ? 1 : 0,
      };
      data.push(chartPoint);

      // 테이블 데이터 (더 세분화된 시간)
      for (let j = 0; j < 6; j++) {
        const detailTime = new Date(time.getTime() + j * 10 * 60 * 1000);
        const detailStatus =
          Math.random() > 0.05
            ? "SUCCESS"
            : Math.random() > 0.5
            ? "FAIL"
            : "TIMEOUT";

        tableData.push({
          id: `${i}-${j}`,
          timestamp: detailTime.toISOString(),
          status: detailStatus,
          rttMax:
            detailStatus === "SUCCESS"
              ? Math.floor(Math.random() * 20) + 30
              : 0,
          rttAvg:
            detailStatus === "SUCCESS"
              ? Math.floor(Math.random() * 15) + 20
              : 0,
          rttMin:
            detailStatus === "SUCCESS"
              ? Math.floor(Math.random() * 10) + 10
              : 0,
          packetLoss:
            detailStatus === "SUCCESS"
              ? Math.random() * 2
              : detailStatus === "TIMEOUT"
              ? 100
              : Math.random() * 50,
        });
      }
    }

    return { chartData: data, tableData: tableData.reverse() };
  };

  useEffect(() => {
    setIsLoading(true);
    const { chartData, tableData } = generateSampleData();
    setData(chartData);
    setTableData(tableData);
    setIsLoading(false);
  }, [timeRange]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        const { chartData, tableData } = generateSampleData();
        setData(chartData);
        setTableData(tableData);
      }, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, timeRange]);

  // 로컬 스토리지에서 컬럼 설정 불러오기
  useEffect(() => {
    const savedColumns = localStorage.getItem("networkMonitoringColumns");
    if (savedColumns) {
      setVisibleColumns(JSON.parse(savedColumns));
    }
  }, []);

  // 컬럼 설정 저장
  const toggleColumn = (columnKey) => {
    const newVisibleColumns = {
      ...visibleColumns,
      [columnKey]: !visibleColumns[columnKey],
    };
    setVisibleColumns(newVisibleColumns);
    localStorage.setItem(
      "networkMonitoringColumns",
      JSON.stringify(newVisibleColumns)
    );
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const sortedTableData = [...tableData].sort((a, b) => {
    if (sortConfig.direction === "asc") {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  const paginatedData = sortedTableData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(sortedTableData.length / pageSize);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-3 rounded-lg border shadow-lg ${
            isDarkMode
              ? "bg-gray-800 border-gray-600"
              : "bg-white border-gray-200"
          }`}
        >
          <p
            className={`font-medium ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
              {entry.dataKey.includes("RTT")
                ? "ms"
                : entry.dataKey === "PACKET_LOSS_RATE"
                ? "%"
                : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getStatusBadge = (status) => {
    const baseClasses =
      "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case "SUCCESS":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "FAIL":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "TIMEOUT":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleRefresh = () => {
    setIsLoading(true);
    const { chartData, tableData } = generateSampleData();
    setData(chartData);
    setTableData(tableData);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div
        className={`rounded-lg border p-6 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {cctvInfo?.locationName || "CCTV 이름"} ({cctvInfo?.id || "001"}
                )
              </h1>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {cctvInfo?.locationAddress || "주소 정보"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* 기간 선택 */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="24h">최근 24시간</option>
              <option value="3d">최근 3일</option>
              <option value="7d">최근 7일</option>
              <option value="custom">사용자 지정</option>
            </select>

            {/* 자동 새로고침 토글 */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <span
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                자동 새로고침 (10초)
              </span>
            </label>

            {/* 새로고침 버튼 */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                  : "bg-white border-gray-300 hover:bg-gray-50 text-gray-900"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <svg
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 본문 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 프리뷰 패널 */}
        <div
          className={`rounded-lg border p-6 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            실시간 영상
          </h3>
          <div
            className={`w-full aspect-video rounded-lg overflow-hidden relative ${
              isDarkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            {cctvInfo?.status === "ACTIVE" && cctvInfo?.hlsAddress ? (
              <CctvPlayer key={cctvInfo.id} src={cctvInfo.hlsAddress} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className={`w-16 h-16 mx-auto mb-2 ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
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
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {cctvInfo?.status === "OFFLINE" ? "연결 끊김" : "영상 없음"}
                  </p>
                </div>
              </div>
            )}

            {/* 상태 뱃지 */}
            <div className="absolute top-2 left-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  cctvInfo?.status === "ACTIVE"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : cctvInfo?.status === "OFFLINE"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                }`}
              >
                {cctvInfo?.status === "ACTIVE"
                  ? "LIVE"
                  : cctvInfo?.status || "UNKNOWN"}
              </span>
            </div>

            {/* 녹화 표시 */}
            {cctvInfo?.status === "ACTIVE" && (
              <div className="absolute top-2 right-2">
                <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-red-400">REC</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 우측: 라인 차트 */}
        <div
          className={`col-span-2 rounded-lg border p-6 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              네트워크 상태 차트
            </h3>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span
                  className={isDarkMode ? "text-gray-300" : "text-gray-600"}
                >
                  업타임: {cctvInfo?.uptime || "99.2%"}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span
                  className={isDarkMode ? "text-gray-300" : "text-gray-600"}
                >
                  대역폭: {cctvInfo?.bandwidth || "10 Mbps"}
                </span>
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                />
                <XAxis
                  dataKey="time"
                  stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                  fontSize={12}
                />
                <YAxis
                  yAxisId="ms"
                  orientation="left"
                  stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                  fontSize={12}
                  label={{ value: "ms", angle: -90, position: "insideLeft" }}
                />
                <YAxis
                  yAxisId="percent"
                  orientation="right"
                  stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                  fontSize={12}
                  label={{ value: "%", angle: 90, position: "insideRight" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  yAxisId="ms"
                  type="monotone"
                  dataKey="RTT_MAX"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="RTT MAX"
                  dot={{ r: 2 }}
                />
                <Line
                  yAxisId="ms"
                  type="monotone"
                  dataKey="RTT_AVG"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="RTT AVG"
                  dot={{ r: 2 }}
                />
                <Line
                  yAxisId="ms"
                  type="monotone"
                  dataKey="RTT_MIN"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="RTT MIN"
                  dot={{ r: 2 }}
                />
                <Line
                  yAxisId="percent"
                  type="monotone"
                  dataKey="PACKET_LOSS_RATE"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="PACKET LOSS"
                  dot={{ r: 2 }}
                />
                <Line
                  yAxisId="ms"
                  type="stepAfter"
                  dataKey="STATUS"
                  stroke="#22c55e"
                  strokeWidth={3}
                  name="STATUS"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 테이블 */}
      <div
        className={`rounded-lg border ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } overflow-hidden`}
      >
        <div
          className={`px-6 py-4 border-b flex justify-between items-center ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h3
            className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            상세 모니터링 데이터
          </h3>

          {/* 컬럼 설정 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setShowColumnDropdown(!showColumnDropdown)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                  : "bg-white border-gray-300 hover:bg-gray-50 text-gray-900"
              }`}
            >
              Columns
            </button>
            {showColumnDropdown && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-lg border shadow-lg z-10 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="p-2">
                  {Object.entries({
                    timestamp: "요청시간",
                    status: "상태",
                    rttMax: "최대RTT",
                    rttAvg: "평균RTT",
                    rttMin: "최소RTT",
                    packetLoss: "패킷손실율",
                  }).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[key]}
                        onChange={() => toggleColumn(key)}
                        className="mr-2"
                      />
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
              <tr>
                {visibleColumns.timestamp && (
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                    onClick={() => handleSort("timestamp")}
                  >
                    요청시간
                    {sortConfig.key === "timestamp" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                )}
                {visibleColumns.status && (
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    상태
                  </th>
                )}
                {visibleColumns.rttMax && (
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                    onClick={() => handleSort("rttMax")}
                  >
                    최대RTT
                    {sortConfig.key === "rttMax" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                )}
                {visibleColumns.rttAvg && (
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                    onClick={() => handleSort("rttAvg")}
                  >
                    평균RTT
                    {sortConfig.key === "rttAvg" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                )}
                {visibleColumns.rttMin && (
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                    onClick={() => handleSort("rttMin")}
                  >
                    최소RTT
                    {sortConfig.key === "rttMin" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                )}
                {visibleColumns.packetLoss && (
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                    onClick={() => handleSort("packetLoss")}
                  >
                    패킷손실율
                    {sortConfig.key === "packetLoss" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                )}
              </tr>
            </thead>
            <tbody
              className={`${isDarkMode ? "bg-gray-800" : "bg-white"} divide-y ${
                isDarkMode ? "divide-gray-700" : "divide-gray-200"
              }`}
            >
              {paginatedData.map((row) => (
                <tr key={row.id}>
                  {visibleColumns.timestamp && (
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {formatTime(row.timestamp)}
                    </td>
                  )}
                  {visibleColumns.status && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(row.status)}>
                        {row.status}
                      </span>
                    </td>
                  )}
                  {visibleColumns.rttMax && (
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {row.rttMax}ms
                    </td>
                  )}
                  {visibleColumns.rttAvg && (
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {row.rttAvg}ms
                    </td>
                  )}
                  {visibleColumns.rttMin && (
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {row.rttMin}ms
                    </td>
                  )}
                  {visibleColumns.packetLoss && (
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {row.packetLoss.toFixed(1)}%
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div
          className={`px-6 py-4 border-t flex justify-between items-center ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            <span
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              페이지 크기:
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className={`px-2 py-1 rounded border text-sm ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded border text-sm ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              } ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              이전
            </button>
            <span
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded border text-sm ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              } ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkMonitoringDetail;
