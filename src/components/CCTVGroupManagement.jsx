import React, { useState, useEffect } from "react";
import { API_BASE } from "../apiBase";

function CCTVGroupManagement({
  isDarkMode,
  onRegisterDrawerTrigger,
  onUpdateUndecidedCctvCount,
  onRefreshCctvs,
}) {
  const UNDECIDED_GROUP_ID = 2;
  const UNDECIDED_GROUP_NAME = "미정";
  const [groupList, setGroupList] = useState([]);
  const [cctvList, setCctvList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentView, setCurrentView] = useState("groups");
  const [selectedGroupForView, setSelectedGroupForView] = useState(null);
  const [selectedCctv, setSelectedCctv] = useState(null);
  const [cctvDrawerOpen, setCctvDrawerOpen] = useState(false);
  const getAvailableCctvs = () => {
    const assigned = new Set();

    groupList.forEach((group) => {
      if (group.id !== UNDECIDED_GROUP_ID && group.id !== selectedGroup?.id) {
        (group.cctvIds || []).forEach((id) => assigned.add(id));
      }
    });

    return cctvList.filter(
      (cctv) =>
        !assigned.has(cctv.id) || formData.selectedCctvs.includes(cctv.id)
    );
  };

  const [formData, setFormData] = useState({
    groupName: "",
    description: "",
    selectedCctvs: [],
    managerId: "",
  });

  useEffect(() => {
    fetchGroups();
    fetchCctvs();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (onRegisterDrawerTrigger) {
      onRegisterDrawerTrigger(() => handleAddGroup);
    }
  }, [onRegisterDrawerTrigger]);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE}/cctv-groups`);

      const data = await response.json();

      console.log("✅ groupList 응답:", data); // 여기서 구조를 확인하세요

      // 만약 data가 객체라면 → data.groups 같은 내부 배열로 바꿔줘야 합니다
      const extracted = Array.isArray(data) ? data : data.groups || [];

      setGroupList(extracted);
    } catch (err) {
      console.error("그룹 목록 불러오기 실패:", err);
      // 샘플 데이터 사용
      const sampleGroups = [
        {
          id: 1,
          name: "본사 1층",
          description: "본사 건물 1층 로비 및 복도 CCTV 그룹",
          cctvIds: [1, 2, 3],
          managerId: 1,
        },
        {
          id: 2,
          name: "본사 2층",
          description: "본사 건물 2층 사무실 및 회의실 CCTV 그룹",
          cctvIds: [4, 5],
          managerId: 2,
        },
        {
          id: 3,
          name: "주차장",
          description: "지하 및 지상 주차장 전체 CCTV 그룹",
          cctvIds: [6, 7, 8],
          managerId: 3,
        },
        {
          id: 4,
          name: "출입구",
          description: "건물 주출입구 및 비상구 CCTV 그룹",
          cctvIds: [9, 10],
          managerId: 1,
        },
      ];
      setGroupList(sampleGroups);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users`);
      const data = await response.json();

      const extracted = Array.isArray(data) ? data : data.users || [];

      setUserList(extracted);
    } catch (err) {
      console.error("사용자 목록 불러오기 실패:", err);
      // 샘플 데이터 사용
      const sampleUsers = [
        {
          id: 1,
          username: "admin",
          name: "관리자",
          email: "admin@prism.com",
          role: "admin",
        },
        {
          id: 2,
          username: "manager1",
          name: "김철수",
          email: "kim@prism.com",
          role: "manager",
        },
        {
          id: 3,
          username: "manager2",
          name: "이영희",
          email: "lee@prism.com",
          role: "manager",
        },
        {
          id: 4,
          username: "staff1",
          name: "박민수",
          email: "park@prism.com",
          role: "staff",
        },
      ];
      setUserList(sampleUsers);
    }
  };

  const fetchCctvs = async () => {
    try {
      const response = await fetch(`${API_BASE}/cctvs`);
      const data = await response.json();
      setCctvList(data);
    } catch (err) {
      console.error("CCTV 목록 불러오기 실패:", err);
      // 샘플 데이터 사용
      const sampleCctvs = [
        {
          id: 1,
          locationName: "1층 로비 CCTV-01",
          locationAddress: "본사 1층 정문 로비",
          ipAddress: "192.168.1.101",
          status: "ONLINE",
        },
        {
          id: 2,
          locationName: "1층 복도 CCTV-02",
          locationAddress: "본사 1층 중앙 복도",
          ipAddress: "192.168.1.102",
          status: "ONLINE",
        },
        {
          id: 3,
          locationName: "1층 엘리베이터 CCTV-03",
          locationAddress: "본사 1층 엘리베이터 앞",
          ipAddress: "192.168.1.103",
          status: "OFFLINE",
        },
        {
          id: 4,
          locationName: "2층 사무실 CCTV-04",
          locationAddress: "본사 2층 개발팀 사무실",
          ipAddress: "192.168.1.104",
          status: "ONLINE",
        },
        {
          id: 5,
          locationName: "2층 회의실 CCTV-05",
          locationAddress: "본사 2층 대회의실",
          ipAddress: "192.168.1.105",
          status: "ONLINE",
        },
        {
          id: 6,
          locationName: "지하주차장 A구역 CCTV-06",
          locationAddress: "지하 1층 주차장 A구역",
          ipAddress: "192.168.1.106",
          status: "ONLINE",
        },
        {
          id: 7,
          locationName: "지하주차장 B구역 CCTV-07",
          locationAddress: "지하 1층 주차장 B구역",
          ipAddress: "192.168.1.107",
          status: "OFFLINE",
        },
        {
          id: 8,
          locationName: "지상주차장 CCTV-08",
          locationAddress: "지상 주차장 입구",
          ipAddress: "192.168.1.108",
          status: "ONLINE",
        },
        {
          id: 9,
          locationName: "정문 CCTV-09",
          locationAddress: "건물 정문 출입구",
          ipAddress: "192.168.1.109",
          status: "ONLINE",
        },
        {
          id: 10,
          locationName: "후문 CCTV-10",
          locationAddress: "건물 후문 비상구",
          ipAddress: "192.168.1.110",
          status: "ONLINE",
        },
      ];
      setCctvList(sampleCctvs);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCctvSelection = (cctvId) => {
    setFormData((prev) => ({
      ...prev,
      selectedCctvs: prev.selectedCctvs.includes(cctvId)
        ? prev.selectedCctvs.filter((id) => id !== cctvId)
        : [...prev.selectedCctvs, cctvId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = formData.groupName.trim();
    if (trimmedName === UNDECIDED_GROUP_NAME) {
      alert('"미정"은 시스템 예약 그룹명으로 사용할 수 없습니다.');
      return;
    }

    const groupData = {
      name: formData.groupName,
      description: formData.description,
      cctvIds: formData.selectedCctvs,
      managerId: parseInt(formData.managerId) || null,
    };

    try {
      let response;
      if (drawerMode === "edit" && selectedGroup) {
        response = await fetch(`${API_BASE}/cctv-groups/${selectedGroup.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(groupData),
        });
      } else {
        response = await fetch(`${API_BASE}/cctv-groups`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(groupData),
        });
      }

      if (!response.ok) throw new Error("요청 실패");

      await fetchGroups(); // ✅ 자기 목록 갱신
      onRefreshCctvs?.(); // ✅ Dashboard도 갱신

      setIsDrawerOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert(
        drawerMode === "edit"
          ? "그룹 수정 중 오류 발생"
          : "그룹 등록 중 오류 발생"
      );
    }
  };

  const handleViewGroup = (group) => {
    setSelectedGroup(group);
    setDrawerMode("view");
    setIsDrawerOpen(true);
  };

  const handleEditGroup = () => {
    if (selectedGroup?.name === UNDECIDED_GROUP_NAME) {
      alert('"미정" 그룹은 수정할 수 없습니다.');
      return;
    }

    setFormData({
      groupName: selectedGroup.name || "",
      description: selectedGroup.description || "",
      selectedCctvs: selectedGroup.cctvIds || [],
      managerId: selectedGroup.managerId?.toString() || "",
    });
    setDrawerMode("edit");
  };

  const handleDeleteGroup = () => {
    if (selectedGroup?.name === UNDECIDED_GROUP_NAME) {
      alert("'미정' 그룹은 삭제할 수 없습니다.");
      return;
    }
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedGroup?.name === UNDECIDED_GROUP_NAME) {
      alert("'미정' 그룹은 삭제할 수 없습니다.");
      setShowDeleteModal(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/cctv-groups/${selectedGroup.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("삭제 실패");

      await fetchGroups(); // ✅ 자기 목록 갱신
      onRefreshCctvs?.(); // ✅ Dashboard도 갱신

      setShowDeleteModal(false);
      setIsDrawerOpen(false);
      setSelectedGroup(null);
    } catch (err) {
      console.error("삭제 요청 실패:", err);
      alert("그룹 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleAddGroup = () => {
    setSelectedGroup(null);
    setDrawerMode("add");
    resetForm();
    setIsDrawerOpen(true);
  };

  const resetForm = () => {
    setFormData({
      groupName: "",
      description: "",
      selectedCctvs: [],
      managerId: "",
    });
  };

  const getManagerName = (managerId) => {
    if (!Array.isArray(userList)) return "미지정";
    const manager = userList.find((user) => user.id === managerId);
    return manager ? manager.name : "미지정";
  };

  const handleGroupClick = (group) => {
    setSelectedGroupForView(group);
    setCurrentView("cctvs");
  };

  const handleBackToGroups = () => {
    setCurrentView("groups");
    setSelectedGroupForView(null);
  };

  const getGroupCctvs = () => {
    if (!selectedGroupForView) return [];
    return cctvList.filter((cctv) =>
      selectedGroupForView.cctvIds?.includes(cctv.id)
    );
  };

  const handleViewCctv = (cctv) => {
    setSelectedCctv(cctv);
    setCctvDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {currentView === "groups" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupList.map((group) => (
              <div
                key={group.id}
                onClick={() => handleGroupClick(group)}
                className={`p-6 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 hover:border-teal-600"
                    : "bg-white border-gray-200 hover:border-teal-500"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {group.name}
                  </h3>
                  <svg
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
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
                </div>
                <p
                  className={`text-sm mb-3 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {group.description || "설명 없음"}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      CCTV {group.cctvIds?.length || 0}대
                    </span>
                    <br />
                    <span
                      className={`text-xs ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      담당자: {getManagerName(group.managerId)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewGroup(group);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                        : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={handleBackToGroups}
              className={`flex items-center justify-center w-11 h-11 text-sm font-medium rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
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
            <h3
              className={`text-md font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {selectedGroupForView?.name} - CCTV 목록
            </h3>
          </div>
          <div
            className={`${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border rounded-lg overflow-hidden`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}
                >
                  <tr>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      장치명
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      IP 주소
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      설치 위치
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      상태
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
                  {getGroupCctvs().map((cctv) => (
                    <tr key={cctv.id}>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <button
                          onClick={() => handleViewCctv(cctv)}
                          className={`underline cursor-pointer font-semibold ${
                            isDarkMode
                              ? "text-gray-400 hover:text-gray-300"
                              : "text-gray-600 hover:text-gray-700"
                          }`}
                        >
                          {cctv.locationName}
                        </button>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {cctv.ipAddress}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {cctv.locationAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            cctv.status?.toLowerCase() === "online"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {cctv.status?.toLowerCase() === "online"
                            ? "ONLINE"
                            : "OFFLINE"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Drawer */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div
            className={`fixed right-0 top-0 h-full w-full max-w-md z-50 transform transition-transform duration-300 ease-in-out ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border-l shadow-xl overflow-y-auto`}
          >
            <div
              className={`px-6 py-4 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              } flex items-center justify-between`}
            >
              <div className="flex items-center space-x-3">
                {drawerMode === "view" && (
                  <button
                    onClick={() => setIsDrawerOpen(false)}
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
                )}
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {drawerMode === "add"
                    ? "그룹 등록"
                    : drawerMode === "edit"
                    ? "그룹 수정"
                    : "그룹 상세 정보"}
                </h3>
              </div>
              {drawerMode === "view" ? (
                <button
                  onClick={handleEditGroup}
                  disabled={selectedGroup?.name === UNDECIDED_GROUP_NAME} // 🔒 "미정"이면 수정 금지
                  className={`p-2 rounded-lg transition-colors ${
                    selectedGroup?.name === UNDECIDED_GROUP_NAME
                      ? "text-gray-400 cursor-not-allowed"
                      : isDarkMode
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => setIsDrawerOpen(false)}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {drawerMode === "add" || drawerMode === "edit" ? (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    그룹명 *
                  </label>
                  <input
                    type="text"
                    name="groupName"
                    value={formData.groupName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="그룹명을 입력해주세요"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    설명
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="그룹 설명을 입력해주세요"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    CCTV 선택
                  </label>
                  <div
                    className={`border rounded-lg max-h-48 overflow-y-auto ${
                      isDarkMode ? "border-gray-600" : "border-gray-300"
                    }`}
                  >
                    {getAvailableCctvs().map((cctv) => (
                      <label
                        key={cctv.id}
                        className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${
                          isDarkMode ? "hover:bg-gray-700" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedCctvs.includes(cctv.id)}
                          onChange={() => handleCctvSelection(cctv.id)}
                          className="mr-3"
                        />
                        <span
                          className={`text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {cctv.locationName} - {cctv.locationAddress}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    담당자
                  </label>
                  <select
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="">담당자를 선택해주세요</option>
                    {userList.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.username}) - {user.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    {drawerMode === "edit" ? "수정" : "등록"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      isDarkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    취소
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-6">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    그룹명
                  </label>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedGroup?.name}
                  </p>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    설명
                  </label>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedGroup?.description || "설명 없음"}
                  </p>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    담당자
                  </label>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {getManagerName(selectedGroup?.managerId)}
                  </p>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    포함된 CCTV
                  </label>
                  <div className={`space-y-2 max-h-64 overflow-y-auto`}>
                    {cctvList
                      .filter((cctv) =>
                        selectedGroup?.cctvIds?.includes(cctv.id)
                      )
                      .map((cctv) => (
                        <div
                          key={cctv.id}
                          className={`p-3 rounded-lg ${
                            isDarkMode ? "bg-gray-700" : "bg-gray-50"
                          }`}
                        >
                          <p
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {cctv.locationName}
                          </p>
                          <p
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {cctv.locationAddress}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex pt-4">
                  <button
                    onClick={handleDeleteGroup}
                    disabled={selectedGroup?.name === UNDECIDED_GROUP_NAME} // 🔒 미정이면 비활성화
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedGroup?.name === UNDECIDED_GROUP_NAME
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : isDarkMode
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className={`w-full max-w-md rounded-lg shadow-xl ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } border`}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <svg
                      className="w-6 h-6 text-red-600"
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
                  <h3
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    그룹 삭제 확인
                  </h3>
                </div>
                <p
                  className={`text-sm mb-6 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <span className="font-medium">{selectedGroup?.name}</span>{" "}
                  그룹을 정말 삭제하시겠습니까?
                  <br />
                  삭제된 데이터는 복구할 수 없습니다.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      isDarkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    취소
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CCTV 상세 정보 Drawer */}
      {cctvDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setCctvDrawerOpen(false)}
          />

          <div
            className={`fixed right-0 top-0 h-full w-full max-w-md z-50 transform transition-transform duration-300 ease-in-out ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border-l shadow-xl overflow-y-auto`}
          >
            <div
              className={`px-6 py-4 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              } flex items-center justify-between`}
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCctvDrawerOpen(false)}
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
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  CCTV 상세 정보
                </h3>
              </div>
              <button
                onClick={() => setCctvDrawerOpen(false)}
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  장치명
                </label>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedCctv?.locationName}
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  IP 주소
                </label>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedCctv?.ipAddress}
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  설치 위치
                </label>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedCctv?.locationAddress}
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  상태
                </label>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedCctv?.status?.toLowerCase() === "online"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {selectedCctv?.status?.toLowerCase() === "online"
                    ? "ONLINE"
                    : "OFFLINE"}
                </span>
              </div>

              {selectedCctv?.hlsAddress && (
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    HLS 스트리밍 URL
                  </label>
                  <p
                    className={`text-sm break-all ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedCctv.hlsAddress}
                  </p>
                </div>
              )}

              {(selectedCctv?.longitude || selectedCctv?.latitude) && (
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    좌표 (경도, 위도)
                  </label>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedCctv?.longitude || "N/A"},{" "}
                    {selectedCctv?.latitude || "N/A"}
                  </p>
                </div>
              )}

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  소속 그룹
                </label>
                <div className={`space-y-2`}>
                  {groupList
                    .filter((group) =>
                      group.cctvIds?.includes(selectedCctv?.id)
                    )
                    .map((group) => (
                      <div
                        key={group.id}
                        className={`p-3 rounded-lg ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-50"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {group.name}
                        </p>
                        <p
                          className={`text-xs ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {group.description}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CCTVGroupManagement;
