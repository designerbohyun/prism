import React, { useState, useEffect, useMemo } from "react";
import { API_BASE } from "../apiBase";
import CctvPlayer from "./CctvPlayer";

function CCTVGroupManagement({
  isDarkMode,
  onRegisterDrawerTrigger,
  onRefreshCctvs,
}) {
  const UNDECIDED_GROUP_ID = 2;
  const UNDECIDED_GROUP_NAME = "미정";

  const [groupList, setGroupList] = useState([]);
  const [cctvList, setCctvList] = useState([]);
  const [userList, setUserList] = useState([]);

  const [managersByGroup, setManagersByGroup] = useState({}); // { [groupId]: number[] }

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add"); // add | edit | view
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewMode, setViewMode] = useState("card"); // list or card
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const [formData, setFormData] = useState({
    groupName: "",
    description: "",
    selectedCctvs: [],
    managerIds: [],
  });

  useEffect(() => {
    // 초기 로딩
    (async () => {
      await Promise.all([fetchUsers(), fetchCctvs()]);
      await fetchGroups(); // 그룹 로딩 후 내부에서 managers도 채움
    })();
  }, []);

  useEffect(() => {
    if (onRegisterDrawerTrigger) {
      onRegisterDrawerTrigger(() => handleAddGroup);
    }
  }, [onRegisterDrawerTrigger]);

  /** 공통 fetch helpers */
  const fetchJson = async (url, init) => {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`${init?.method || "GET"} ${url} failed`);
    return res.json();
  };

  /** 사용자 목록 */
  const fetchUsers = async () => {
    try {
      const data = await fetchJson(`${API_BASE}/users`);
      const extracted = Array.isArray(data) ? data : data.users || [];
      setUserList(extracted);
    } catch (err) {
      console.error("사용자 목록 불러오기 실패:", err);
      setUserList([]);
      alert("사용자 목록을 불러오지 못했습니다.");
    }
  };

  /** CCTV 목록 */
  const fetchCctvs = async () => {
    try {
      const data = await fetchJson(`${API_BASE}/cctvs`);
      setCctvList(Array.isArray(data) ? data : data.cctvs || []);
    } catch (err) {
      console.error("CCTV 목록 불러오기 실패:", err);
      setCctvList([]);
      alert("CCTV 목록을 불러오지 못했습니다.");
    }
  };

  /** 그룹 목록 + 그룹별 담당자 매핑 */
  const fetchGroups = async () => {
    try {
      const data = await fetchJson(`${API_BASE}/cctv-groups`);
      const groups = Array.isArray(data) ? data : data.groups || [];
      setGroupList(groups);

      // 그룹별 담당자 동시 조회
      const pairs = await Promise.all(
        groups.map(async (g) => {
          try {
            const subs = await fetchJson(
              `${API_BASE}/subscriptions/by-group/${g.id}`
            );
            // [FIX] 숫자 배열(List<Long>)과 객체 배열({userId}) 모두 허용
            const list = Array.isArray(subs)
              ? subs
              : subs.subscriptions || subs.items || [];
            const ids = list
              .map((s) => (typeof s === "number" ? s : s?.userId))
              .filter((v) => typeof v === "number");
            return [g.id, ids];
          } catch (e) {
            console.warn(`그룹(${g.id}) 담당자 조회 실패:`, e);
            return [g.id, []];
          }
        })
      );

      const map = {};
      for (const [gid, ids] of pairs) map[gid] = ids;
      setManagersByGroup(map);
    } catch (err) {
      console.error("그룹 목록 불러오기 실패:", err);
      setGroupList([]);
      setManagersByGroup({});
      alert("그룹 목록을 불러오지 못했습니다.");
    }
  };

  /** 특정 그룹 담당자 새로고침 */
  const refreshGroupManagers = async (groupId) => {
    try {
      const subs = await fetchJson(
        `${API_BASE}/subscriptions/by-group/${groupId}`
      );
      // [FIX] 숫자 배열(List<Long>)과 객체 배열({userId}) 모두 허용
      const list = Array.isArray(subs)
        ? subs
        : subs.subscriptions || subs.items || [];
      const ids = list
        .map((s) => (typeof s === "number" ? s : s?.userId))
        .filter((v) => typeof v === "number");
      setManagersByGroup((prev) => ({ ...prev, [groupId]: ids }));
    } catch (e) {
      console.warn(`그룹(${groupId}) 담당자 새로고침 실패:`, e);
      setManagersByGroup((prev) => ({ ...prev, [groupId]: [] }));
    }
  };

  /** 폼/선택 핸들러들 */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCctvSelection = (cctvId) => {
    setFormData((prev) => ({
      ...prev,
      selectedCctvs: prev.selectedCctvs.includes(cctvId)
        ? prev.selectedCctvs.filter((id) => id !== cctvId)
        : [...prev.selectedCctvs, cctvId],
    }));
  };

  const handleManagerSelection = (managerId) => {
    setFormData((prev) => ({
      ...prev,
      managerIds: prev.managerIds.includes(managerId)
        ? prev.managerIds.filter((id) => id !== managerId)
        : [...prev.managerIds, managerId],
    }));
  };

  /** 사용 가능한 CCTV(다른 그룹에 묶여 있지 않은 CCTV + 현재 편집 중인 그룹의 기존 CCTV) */
  const getAvailableCctvs = () => {
    const assigned = new Set();
    groupList.forEach((group) => {
      if (group.id !== UNDECIDED_GROUP_ID && group.id !== selectedGroup?.id) {
        (group.cctvIds || []).forEach((id) => assigned.add(id));
      }
    });
    return (cctvList || []).filter(
      (cctv) =>
        !assigned.has(cctv.id) || formData.selectedCctvs.includes(cctv.id)
    );
  };

  // [ADD] 사용 가능한 담당자: "미정(2)" + "현재 그룹 배정자"만
  const getAvailableManagers = () => {
    const unassigned = new Set(managersByGroup[UNDECIDED_GROUP_ID] || []);
    const current =
      selectedGroup?.id != null
        ? new Set(managersByGroup[selectedGroup.id] || [])
        : new Set();
    const allowed = new Set([...unassigned, ...current]);
    return (userList || []).filter((u) => allowed.has(u.id));
  };

  /** 등록/수정 제출 */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = formData.groupName.trim();
    if (!trimmedName) {
      alert("그룹명을 입력해주세요.");
      return;
    }
    if (trimmedName === UNDECIDED_GROUP_NAME) {
      alert('"미정"은 시스템 예약 그룹명으로 사용할 수 없습니다.');
      return;
    }

    const groupPayload = {
      name: trimmedName,
      description: formData.description || "",
      cctvIds: formData.selectedCctvs || [],
    };

    try {
      let savedGroupId = null;

      if (drawerMode === "edit" && selectedGroup) {
        // 그룹 정보 수정
        await fetchJson(`${API_BASE}/cctv-groups/${selectedGroup.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(groupPayload),
        });
        savedGroupId = selectedGroup.id;
      } else {
        // 그룹 생성
        const created = await fetchJson(`${API_BASE}/cctv-groups`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(groupPayload),
        });
        // 생성 응답에서 id 확인
        const createdGroup =
          typeof created === "object" && created
            ? created
            : { id: created?.id };
        if (!createdGroup?.id) {
          throw new Error("생성된 그룹 ID를 확인할 수 없습니다.");
        }
        savedGroupId = createdGroup.id;
      }

      // === 담당자 diff 계산 후 /subscriptions 호출 ===
      const prevManagerIds = managersByGroup[savedGroupId] || [];
      const nextManagerIds = formData.managerIds || [];

      const prevSet = new Set(prevManagerIds);
      const nextSet = new Set(nextManagerIds);

      const toAssign = nextManagerIds.filter((id) => !prevSet.has(id));
      const toUnassign = prevManagerIds.filter((id) => !nextSet.has(id));

      // 배정
      await Promise.all(
        toAssign.map((userId) =>
          fetchJson(`${API_BASE}/subscriptions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId: savedGroupId, userId }),
          })
        )
      );

      // 해제 (백엔드가 자동으로 group_id=2로 이동)
      await Promise.all(
        toUnassign.map((userId) =>
          fetch(
            `${API_BASE}/subscriptions?groupId=${savedGroupId}&userId=${userId}`,
            { method: "DELETE" }
          ).then((res) => {
            if (!res.ok) throw new Error("DELETE /subscriptions 실패");
          })
        )
      );

      // 최신화
      await Promise.all([fetchGroups(), onRefreshCctvs?.()]);

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

  /** 보기/수정/삭제 흐름 */
  const handleViewGroup = async (group) => {
    setSelectedGroup(group);
    setDrawerMode("view");
    setIsDrawerOpen(true);
    // [ADD] 미정과 대상 그룹의 배정 목록을 함께 보장 로드
    await Promise.all([
      refreshGroupManagers(UNDECIDED_GROUP_ID),
      refreshGroupManagers(group.id),
    ]);
  };

  const handleEditGroup = () => {
    if (selectedGroup?.name === UNDECIDED_GROUP_NAME) {
      alert('"미정" 그룹은 수정할 수 없습니다.');
      return;
    }
    setFormData({
      groupName: selectedGroup?.name || "",
      description: selectedGroup?.description || "",
      selectedCctvs: selectedGroup?.cctvIds || [],
      managerIds: managersByGroup[selectedGroup?.id] || [],
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
    if (!selectedGroup) return;
    if (selectedGroup?.name === UNDECIDED_GROUP_NAME) {
      alert("'미정' 그룹은 삭제할 수 없습니다.");
      setShowDeleteModal(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/cctv-groups/${selectedGroup.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("삭제 실패");
      await Promise.all([fetchGroups(), onRefreshCctvs?.()]);
      setShowDeleteModal(false);
      setIsDrawerOpen(false);
      setSelectedGroup(null);
    } catch (err) {
      console.error("삭제 요청 실패:", err);
      alert("그룹 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleAddGroup = async () => {
    setSelectedGroup(null);
    setDrawerMode("add");
    resetForm();
    // [ADD] 새 그룹 등록 시에는 ‘미정(2)’ 사용자만 보여야 하므로 미정 그룹 매핑을 보장 로드
    await refreshGroupManagers(UNDECIDED_GROUP_ID);
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

  /** 유틸 */
  const usersById = useMemo(() => {
    const map = new Map();
    (userList || []).forEach((u) => map.set(u.id, u));
    return map;
  }, [userList]);

  const getManagerNames = (managerIds = []) => {
    if (!Array.isArray(userList) || !managerIds.length) return "미지정";
    const managers = managerIds.map((id) => usersById.get(id)).filter(Boolean);
    return managers.length > 0
      ? managers.map((m) => m.name || m.username || m.email).join(", ")
      : "미지정";
  };

  const getManagersCount = (group) => {
    const ids = managersByGroup[group.id] || [];
    return ids.length;
  };

  // createdAt 키 이름 폴백
  const getCreatedAtVal = (g) =>
    g?.createdAt ?? g?.created_at ?? g?.createdDate ?? g?.created ?? null;

  // 안전 포맷터: ISO / epoch / MySQL "YYYY-MM-DD HH:mm:ss" 지원
  const formatDate = (raw) => {
    if (raw === null || raw === undefined) return "";
    let d;

    if (raw instanceof Date) d = raw;
    else if (typeof raw === "number") d = new Date(raw);
    else if (typeof raw === "string") {
      const s =
        raw.includes(" ") && !raw.includes("T") ? raw.replace(" ", "T") : raw;
      d = new Date(s);
      if (isNaN(d.getTime())) {
        const m = raw.match(
          /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/
        );
        if (m) {
          d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
        }
      }
    }

    if (!d || isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  };

  // 검색 필터링
  const filteredGroups = groupList.filter((group) => {
    const name = (group.name || "").toLowerCase();
    const matchesName = name.includes((searchQuery || "").toLowerCase());

    const createdStr = formatDate(getCreatedAtVal(group));
    const matchesDate =
      !searchDate || (createdStr && createdStr.includes(searchDate));

    return matchesName && matchesDate;
  });

  // 그룹의 CCTV 4개 가져오기
  const getGroupCctvs = (group, limit = 4) => {
    const groupCctvs = (cctvList || []).filter((cctv) =>
      (group.cctvIds || []).includes(cctv.id)
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
                d="M4 6h16M4 12h16M4 18h16"
              />
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
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 데이터가 없는 경우 */}
      {filteredGroups.length === 0 ? (
        <div
          className={`${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border rounded-lg p-16`}
        >
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
        <div
          className={`${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border rounded-lg overflow-hidden`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <tr>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    순번
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    그룹명
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    할당된 CCTV
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    담당자 수
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    등록일자
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
                {filteredGroups.map((group, index) => (
                  <tr
                    key={group.id}
                    className="hover:cursor-pointer"
                    onClick={() => handleViewGroup(group)}
                  >
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        isDarkMode
                          ? "text-white hover:text-teal-400"
                          : "text-gray-900 hover:text-teal-600"
                      } transition-colors underline`}
                    >
                      {group.name}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {group.cctvIds?.length || 0}대
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {getManagersCount(group)}명
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {formatDate(getCreatedAtVal(group)) || "미지정"}
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
              <div
                className={`p-4 border-b ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
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
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                </div>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {group.description || "설명 없음"}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span
                    className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                  >
                    CCTV {group.cctvIds?.length || 0}대
                  </span>
                  <span
                    className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                  >
                    담당자 {getManagersCount(group)}명
                  </span>
                  <span
                    className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                  >
                    {formatDate(getCreatedAtVal(group)) || "미지정"}
                  </span>
                </div>
              </div>

              {/* CCTV 미리보기 그리드 */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {getGroupCctvs(group).map((cctv) => (
                    <div
                      key={cctv.id}
                      className="relative aspect-video bg-black rounded-lg overflow-hidden"
                    >
                      {["ACTIVE", "WARNING"].includes(
                        (cctv.status || "").toUpperCase()
                      ) && cctv.hlsAddress ? (
                        <div className="relative w-full h-full">
                          <CctvPlayer src={cctv.hlsAddress} />
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {cctv.locationName}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <svg
                              className="w-8 h-8 text-gray-600 mx-auto mb-1"
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
                            <p className="text-xs text-gray-600">
                              {cctv.status === "OFFLINE"
                                ? "오프라인"
                                : "신호 없음"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* 빈 슬롯 채우기 */}
                  {Array.from({
                    length: Math.max(0, 4 - getGroupCctvs(group).length),
                  }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className={`aspect-video rounded-lg flex items-center justify-center ${
                        isDarkMode ? "bg-gray-707" : "bg-gray-100"
                      }`}
                    >
                      <span
                        className={`text-xs ${
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
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
                    {getAvailableCctvs().length === 0 && (
                      <div
                        className={`p-3 text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        선택 가능한 CCTV가 없습니다.
                      </div>
                    )}
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
                    {/* [CHANGE] 전체 사용자 → 사용 가능(미정+현재그룹) 사용자만 */}
                    {getAvailableManagers().map((user) => (
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
                          {user.name || user.username} ({user.username}) -{" "}
                          {user.role}
                        </span>
                      </label>
                    ))}
                    {getAvailableManagers().length === 0 && (
                      <div
                        className={`p-3 text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        표시할 사용자가 없습니다.
                      </div>
                    )}
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
                    {getManagerNames(managersByGroup[selectedGroup?.id] || [])}
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
                    {formatDate(getCreatedAtVal(selectedGroup)) || "미지정"}
                  </p>
                </div>

                <div>
                  <label
                    className={`block text.sm font-medium mb-1 ${
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
