import React, { useState, useEffect } from "react";
import { API_BASE } from "../apiBase";
import CctvPlayer from "./CctvPlayer";

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
  const [viewMode, setViewMode] = useState("list"); // list or card
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState("");
  
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
    managerIds: [],
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
      const extracted = Array.isArray(data) ? data : data.groups || [];
      
      // 등록일자 추가 (샘플용)
      const groupsWithDate = extracted.map((group, index) => ({
        ...group,
        createdAt: group.createdAt || new Date(Date.now() - index * 86400000).toISOString()
      }));
      
      setGroupList(groupsWithDate);
    } catch (err) {
      console.error("그룹 목록 불러오기 실패:", err);
      // 샘플 데이터 사용
      const sampleGroups = [
        {
          id: 1,
          name: "본사 1층",
          description: "본사 건물 1층 로비 및 복도 CCTV 그룹",
          cctvIds: [1, 2, 3, 4],
          managerId: 1,
          createdAt: "2024-01-15T09:00:00Z",
          managers: [1, 2] // 담당자 여러명
        },
        {
          id: 2,
          name: "본사 2층",
          description: "본사 건물 2층 사무실 및 회의실 CCTV 그룹",
          cctvIds: [5, 6],
          managerId: 2,
          createdAt: "2024-01-16T10:30:00Z",
          managers: [2]
        },
        {
          id: 3,
          name: "주차장",
          description: "지하 및 지상 주차장 전체 CCTV 그룹",
          cctvIds: [7, 8, 9],
          managerId: 3,
          createdAt: "2024-01-17T14:00:00Z",
          managers: [3, 4]
        },
        {
          id: 4,
          name: "출입구",
          description: "건물 주출입구 및 비상구 CCTV 그룹",
          cctvIds: [10, 11],
          managerId: 1,
          createdAt: "2024-01-18T08:00:00Z",
          managers: [1]
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
          status: "ACTIVE",
          hlsAddress: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        },
        {
          id: 2,
          locationName: "1층 복도 CCTV-02",
          locationAddress: "본사 1층 중앙 복도",
          ipAddress: "192.168.1.102",
          status: "ACTIVE",
          hlsAddress: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
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
          locationName: "1층 비상구 CCTV-04",
          locationAddress: "본사 1층 비상구",
          ipAddress: "192.168.1.104",
          status: "ACTIVE",
          hlsAddress: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        },
        {
          id: 5,
          locationName: "2층 사무실 CCTV-05",
          locationAddress: "본사 2층 개발팀 사무실",
          ipAddress: "192.168.1.105",
          status: "ACTIVE",
          hlsAddress: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        },
        {
          id: 6,
          locationName: "2층 회의실 CCTV-06",
          locationAddress: "본사 2층 대회의실",
          ipAddress: "192.168.1.106",
          status: "ACTIVE",
        },
        {
          id: 7,
          locationName: "지하주차장 A구역 CCTV-07",
          locationAddress: "지하 1층 주차장 A구역",
          ipAddress: "192.168.1.107",
          status: "ACTIVE",
        },
        {
          id: 8,
          locationName: "지하주차장 B구역 CCTV-08",
          locationAddress: "지하 1층 주차장 B구역",
          ipAddress: "192.168.1.108",
          status: "OFFLINE",
        },
        {
          id: 9,
          locationName: "지상주차장 CCTV-09",
          locationAddress: "지상 주차장 입구",
          ipAddress: "192.168.1.109",
          status: "ACTIVE",
        },
        {
          id: 10,
          locationName: "정문 CCTV-10",
          locationAddress: "건물 정문 출입구",
          ipAddress: "192.168.1.110",
          status: "ACTIVE",
          hlsAddress: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        },
        {
          id: 11,
          locationName: "후문 CCTV-11",
          locationAddress: "건물 후문 비상구",
          ipAddress: "192.168.1.111",
          status: "ACTIVE",
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
      managerId: formData.managerIds.length > 0 ? formData.managerIds[0] : null, // 첫 번째 담당자를 주 담당자로
      managers: formData.managerIds,
      createdAt: new Date().toISOString(),
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

      await fetchGroups();
      onRefreshCctvs?.();

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
      managerIds: selectedGroup.managers || (selectedGroup.managerId ? [selectedGroup.managerId] : []),
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

      await fetchGroups();
      onRefreshCctvs?.();

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
      managerIds: [],
    });
  };

  const getManagerNames = (managerIds = []) => {
    if (!Array.isArray(userList) || !managerIds.length) return "미지정";
    const managers = userList.filter((user) => managerIds.includes(user.id));
    return managers.length > 0 ? managers.map(m => m.name).join(", ") : "미지정";
  };

  const getManagersCount = (group) => {
    return group.managers?.length || (group.managerId ? 1 : 0);
  };

  const handleManagerSelection = (managerId) => {
    setFormData((prev) => ({
      ...prev,
      managerIds: prev.managerIds.includes(managerId)
        ? prev.managerIds.filter((id) => id !== managerId)
        : [...prev.managerIds, managerId],
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  // 검색 필터링
  const filteredGroups = groupList.filter((group) => {
    const matchesName = group.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !searchDate || formatDate(group.createdAt).includes(searchDate);
    return matchesName && matchesDate;
  });

  // 그룹의 CCTV 4개 가져오기
  const getGroupCctvs = (group, limit = 4) => {
    const groupCctvs = cctvList.filter((cctv) => 
      group.cctvIds?.includes(cctv.id)
    );
    return groupCctvs.slice(0, limit);
  };

  return (
    <div className="space-y-6">
      {/* 검색 및 뷰 모드 토글 */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="그룹명 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list"
                ? "bg-teal-600 text-white"
                : isDarkMode
                ? "bg-gray-700 text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-gray-900"
            }`}
            title="리스트 보기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "card"
                ? "bg-teal-600 text-white"
                : isDarkMode
                ? "bg-gray-700 text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-gray-900"
            }`}
            title="카드 보기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 데이터가 없는 경우 */}
      {filteredGroups.length === 0 ? (
        <div className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border rounded-lg p-16`}>
          <div className="flex flex-col items-center justify-center">
            <svg
              className={`w-20 h-20 ${
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
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            <h4
              className={`text-lg font-medium ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              } mb-2`}
            >
              등록된 그룹이 없습니다
            </h4>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-500" : "text-gray-500"
              } text-center max-w-md mb-6`}
            >
              {searchQuery || searchDate 
                ? "검색 조건에 맞는 그룹이 없습니다."
                : "상단의 '그룹 추가' 버튼을 클릭하여 새로운 CCTV 그룹을 등록해주세요."}
            </p>
            {!(searchQuery || searchDate) && (
              <button
                onClick={handleAddGroup}
                className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
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
                <span>그룹 추가</span>
              </button>
            )}
          </div>
        </div>
      ) : viewMode === "list" ? (
        /* 리스트 뷰 */
        <div className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border rounded-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    순번
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    그룹명
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    할당된 CCTV
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    담당자 수
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    등록일자
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? "bg-gray-800" : "bg-white"} divide-y ${
                isDarkMode ? "divide-gray-700" : "divide-gray-200"
              }`}>
                {filteredGroups.map((group, index) => (
                  <tr key={group.id} className="hover:cursor-pointer" onClick={() => handleViewGroup(group)}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                      {index + 1}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      isDarkMode ? "text-white hover:text-teal-400" : "text-gray-900 hover:text-teal-600"
                    } transition-colors underline`}>
                      {group.name}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                      {group.cctvIds?.length || 0}대
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                      {getManagersCount(group)}명
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                      {formatDate(group.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 카드 뷰 */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className={`rounded-lg border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } overflow-hidden`}
            >
              {/* 카드 헤더 */}
              <div className={`p-4 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    {group.name}
                  </h3>
                  <button
                    onClick={() => handleViewGroup(group)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                        : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
                <p className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  {group.description || "설명 없음"}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                    CCTV {group.cctvIds?.length || 0}대
                  </span>
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                    담당자 {getManagersCount(group)}명
                  </span>
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                    {formatDate(group.createdAt)}
                  </span>
                </div>
              </div>
              
              {/* CCTV 미리보기 그리드 */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {getGroupCctvs(group).map((cctv) => (
                    <div key={cctv.id} className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      {cctv.status === "ACTIVE" && cctv.hlsAddress ? (
                        <div className="relative w-full h-full">
                          <CctvPlayer src={cctv.hlsAddress} />
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {cctv.locationName}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <svg className="w-8 h-8 text-gray-600 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs text-gray-600">
                              {cctv.status === "OFFLINE" ? "오프라인" : "신호 없음"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* 빈 슬롯 채우기 */}
                  {Array.from({ length: Math.max(0, 4 - getGroupCctvs(group).length) }).map((_, index) => (
                    <div key={`empty-${index}`} className={`aspect-video rounded-lg flex items-center justify-center ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}>
                      <span className={`text-xs ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}>
                        빈 슬롯
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
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
                  disabled={selectedGroup?.name === UNDECIDED_GROUP_NAME}
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
                    담당자 ({formData.managerIds.length}명 선택됨)
                  </label>
                  <div
                    className={`border rounded-lg max-h-48 overflow-y-auto ${
                      isDarkMode ? "border-gray-600" : "border-gray-300"
                    }`}
                  >
                    {userList.map((user) => (
                      <label
                        key={user.id}
                        className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${
                          isDarkMode ? "hover:bg-gray-700" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.managerIds.includes(user.id)}
                          onChange={() => handleManagerSelection(user.id)}
                          className="mr-3"
                        />
                        <span
                          className={`text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {user.name} ({user.username}) - {user.role}
                        </span>
                      </label>
                    ))}
                  </div>
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
                    담당자 ({getManagersCount(selectedGroup)}명)
                  </label>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {getManagerNames(selectedGroup?.managers || (selectedGroup?.managerId ? [selectedGroup.managerId] : []))}
                  </p>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    등록일자
                  </label>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedGroup?.createdAt ? formatDate(selectedGroup.createdAt) : "미지정"}
                  </p>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    포함된 CCTV ({selectedGroup?.cctvIds?.length || 0}대)
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
                    disabled={selectedGroup?.name === UNDECIDED_GROUP_NAME}
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
    </div>
  );
}

export default CCTVGroupManagement;