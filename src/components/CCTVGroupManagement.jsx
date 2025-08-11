// src/components/CCTVGroupManagement.jsx
import React, { useEffect, useState } from "react";
import Service from "../api/SubscriptionService";

const MANAGER_MAP = {
    101: "관리자",
    102: "담당자A",
    103: "담당자B",
    104: "담당자C",
    105: "담당자D",
};

export default function CCTVGroupManagement({ isDarkMode = false, onRegisterDrawerTrigger }) {
    const [groupList, setGroupList] = useState([]);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState("add"); // add | edit | view
    const [selectedGroup, setSelectedGroup] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentView, setCurrentView] = useState("groups"); // groups | cctvs
    const [selectedGroupForView, setSelectedGroupForView] = useState(null);

    const [formData, setFormData] = useState({
        groupName: "",
        description: "",
        selectedCctvs: [],
        managerId: "",
    });

    // 초기 로딩
    useEffect(() => { fetchGroups(); }, []);
    useEffect(() => {
        if (onRegisterDrawerTrigger) onRegisterDrawerTrigger(() => handleAddGroup);
    }, [onRegisterDrawerTrigger]);

    const fetchGroups = async () => {
        try {
            const data = await Service.listSubscriptions(); // GET /api/subscriptions
            setGroupList(data);
        } catch (e) {
            console.error("그룹 목록 불러오기 실패:", e);
            setGroupList([]); // 실패 시 빈 목록
        }
    };

    // ---- 폼/컨트롤 ----
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const handleCctvSelection = (id) => {
        setFormData((p) => ({
            ...p,
            selectedCctvs: p.selectedCctvs.includes(id)
                ? p.selectedCctvs.filter((x) => x !== id)
                : [...p.selectedCctvs, id],
        }));
    };

    const resetForm = () => {
        setFormData({ groupName: "", description: "", selectedCctvs: [], managerId: "" });
    };

    const getManagerName = (id) => MANAGER_MAP[id] || (id ?? "미지정");

    // ---- CRUD ----
    const handleSubmit = async (e) => {
        e.preventDefault();
        const body = {
            name: formData.groupName,
            description: formData.description,
            cctvIds: formData.selectedCctvs.map((n) => Number(n)),
            managerId: formData.managerId ? Number(formData.managerId) : null,
            active: selectedGroup?.active ?? true,
        };

        try {
            if (drawerMode === "edit" && selectedGroup) {
                await Service.updateSubscription(selectedGroup.id, body); // PUT /api/subscriptions/{id}
            } else {
                await Service.createSubscription(body); // POST /api/subscriptions
            }
            await fetchGroups();
            setIsDrawerOpen(false);
            resetForm();
        } catch (err) {
            console.error(err);
            alert(drawerMode === "edit" ? "그룹 수정 중 오류" : "그룹 등록 중 오류");
        }
    };

    const confirmDelete = async () => {
        if (!selectedGroup) return;
        try {
            await Service.deleteSubscription(selectedGroup.id); // DELETE
            await fetchGroups();
            setShowDeleteModal(false);
            setIsDrawerOpen(false);
            setSelectedGroup(null);
        } catch (err) {
            console.error("삭제 실패:", err);
            alert("그룹 삭제 중 오류가 발생했습니다.");
        }
    };

    // ---- 화면 전환/드로어 ----
    const handleViewGroup = (group) => { setSelectedGroup(group); setDrawerMode("view"); setIsDrawerOpen(true); };
    const handleEditGroup = () => {
        if (!selectedGroup) return;
        setFormData({
            groupName: selectedGroup.name || "",
            description: selectedGroup.description || "",
            selectedCctvs: selectedGroup.cctvIds || [],
            managerId: selectedGroup.managerId?.toString() || "",
        });
        setDrawerMode("edit");
    };
    const handleAddGroup = () => { setSelectedGroup(null); setDrawerMode("add"); resetForm(); setIsDrawerOpen(true); };

    // 카드 클릭 시 CCTV 목록 보기(이전 UI 유지)
    const handleGroupClick = (group) => { setSelectedGroupForView(group); setCurrentView("cctvs"); };
    const handleBackToGroups = () => { setCurrentView("groups"); setSelectedGroupForView(null); };

    // 현재는 cctv 상세 테이블을 별도 엔티티 없이 ID 리스트로 보여줌
    const getGroupCctvs = () => {
        if (!selectedGroupForView?.cctvIds) return [];
        return selectedGroupForView.cctvIds.map((id) => ({
            id,
            locationName: `CCTV-${id}`,
            locationAddress: "-",
            ipAddress: "-",
            status: "ONLINE",
        }));
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
                                    isDarkMode ? "bg-gray-800 border-gray-700 hover:border-teal-600"
                                        : "bg-white border-gray-200 hover:border-teal-500"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                        {group.name || "(이름없음)"}
                                    </h3>
                                    <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {group.active ? "사용" : "중지"}
                  </span>
                                </div>
                                <p className={`text-sm mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                    {group.description || "설명 없음"}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div>
                    <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      CCTV {group.cctvIds?.length || 0}대
                    </span>
                                        <br />
                                        <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      담당자: {getManagerName(group.managerId)}
                    </span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleViewGroup(group); }}
                                        className={`p-2 rounded-lg transition-colors ${
                                            isDarkMode ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                                                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
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
                            className={`flex items-center justify-center w-11 h-11 text-sm font-medium rounded-lg ${
                                isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h3 className={`text-md font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {selectedGroupForView?.name} - CCTV 목록
                        </h3>
                    </div>

                    <div className={`border rounded-lg overflow-hidden ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                                <tr>
                                    {["장치명","IP 주소","설치 위치","상태"].map((h) => (
                                        <th key={h} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className={`${isDarkMode ? "bg-gray-800 divide-gray-700" : "bg-white divide-gray-200"} divide-y`}>
                                {getGroupCctvs().map((c) => (
                                    <tr key={c.id}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{c.locationName}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{c.ipAddress}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{c.locationAddress}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            c.status?.toLowerCase() === "online"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}>
                          {c.status}
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
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsDrawerOpen(false)} />
                    <div className={`fixed right-0 top-0 h-full w-full max-w-md z-50 border-l shadow-xl overflow-y-auto transform transition-transform duration-300 ease-in-out ${
                        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}>
                        <div className={`px-6 py-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"} flex items-center justify-between`}>
                            <div className="flex items-center space-x-3">
                                {drawerMode === "view" && (
                                    <button onClick={() => setIsDrawerOpen(false)} className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-700 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"}`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                )}
                                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    {drawerMode === "add" ? "그룹 등록" : drawerMode === "edit" ? "그룹 수정" : "그룹 상세 정보"}
                                </h3>
                            </div>
                            {drawerMode === "view" ? (
                                <button onClick={handleEditGroup} className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-700 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"}`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                            ) : (
                                <button onClick={() => setIsDrawerOpen(false)} className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-700 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"}`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {drawerMode === "add" || drawerMode === "edit" ? (
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>그룹명 *</label>
                                    <input
                                        type="text"
                                        name="groupName"
                                        value={formData.groupName}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                        placeholder="그룹명을 입력해주세요"
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>설명</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                        placeholder="그룹 설명을 입력해주세요"
                                    />
                                </div>

                                {/* 예전 UI 유지용 – ID 기반 체크박스 */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>CCTV 선택(숫자 ID)</label>
                                    <div className={`border rounded-lg max-h-48 overflow-y-auto ${isDarkMode ? "border-gray-600" : "border-gray-300"}`}>
                                        {[1001,1002,1003,2001,2002,2003,3001,3002,3003,4001,4002,4003,5001,5002,5003].map((id) => (
                                            <label key={id} className={`flex items-center p-3 cursor-pointer ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                                                <input type="checkbox" checked={formData.selectedCctvs.includes(id)} onChange={() => handleCctvSelection(id)} className="mr-3" />
                                                <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>CCTV-{id}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>담당자</label>
                                    <select
                                        name="managerId"
                                        value={formData.managerId}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                    >
                                        <option value="">담당자를 선택해주세요</option>
                                        {Object.entries(MANAGER_MAP).map(([id, name]) => (
                                            <option key={id} value={id}>{name} (ID {id})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex space-x-4 pt-4">
                                    <button type="submit" className="flex-1 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700">
                                        {drawerMode === "edit" ? "수정" : "등록"}
                                    </button>
                                    <button type="button" onClick={() => setIsDrawerOpen(false)}
                                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border ${
                                                isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}>
                                        취소
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>그룹명</label>
                                    <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedGroup?.name}</p>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>설명</label>
                                    <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedGroup?.description || "설명 없음"}</p>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>담당자</label>
                                    <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>{getManagerName(selectedGroup?.managerId)}</p>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>포함된 CCTV(ID)</label>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {selectedGroup?.cctvIds?.map((id) => (
                                            <div key={id} className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"} p-3 rounded-lg`}>
                                                <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>CCTV-{id}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex pt-4">
                                    <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg">
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
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowDeleteModal(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className={`w-full max-w-md rounded-lg shadow-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                            <div className="p-6">
                                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>그룹 삭제 확인</h3>
                                <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"} text-sm mb-6`}>
                                    <span className="font-medium">{selectedGroup?.name}</span> 그룹을 삭제하시겠습니까?
                                    삭제된 데이터는 복구할 수 없습니다.
                                </p>
                                <div className="flex space-x-3">
                                    <button onClick={() => setShowDeleteModal(false)}
                                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border ${
                                                isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}>
                                        취소
                                    </button>
                                    <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg">
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
