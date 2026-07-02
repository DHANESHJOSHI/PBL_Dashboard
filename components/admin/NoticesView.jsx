import { Plus, Edit, Trash2, Bell, BellOff, Clock, RefreshCw, Megaphone } from "lucide-react";
import NoticeModal from "./NoticeModal";

export default function NoticesView({
  notices,
  noticeModalOpen,
  setNoticeModalOpen,
  editingNotice,
  setEditingNotice,
  noticeForm,
  setNoticeForm,
  handleNoticeSubmit,
  handleEditNotice,
  handleDeleteNotice,
  isLoading
}) {
  const openCreate = () => {
    setEditingNotice(null);
    setNoticeForm({ title: "", content: "" });
    setNoticeModalOpen(true);
  };

  const getRelativeTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  // Accent colors cycling for notice cards
  const accents = [
    { bg: "from-blue-500 to-indigo-600", badge: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    { bg: "from-violet-500 to-purple-600", badge: "bg-violet-100 text-violet-700 border-violet-200", dot: "bg-violet-500" },
    { bg: "from-amber-500 to-orange-500", badge: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    { bg: "from-emerald-500 to-teal-600", badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    { bg: "from-rose-500 to-pink-600", badge: "bg-rose-100 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Megaphone className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage announcements for students</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
        >
          <Plus className="h-4 w-4" />
          Create Notice
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-blue-100">
          <Bell className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-800">
            {notices.length} Active Notice{notices.length !== 1 ? "s" : ""}
          </div>
          <div className="text-xs text-gray-500">Visible to all students on login page</div>
        </div>
      </div>

      {/* Notices List */}
      {notices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <BellOff className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-base font-bold text-gray-600">No notices yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">Create your first notice to inform students</p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          >
            <Plus className="h-4 w-4" />
            Create First Notice
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice, index) => {
            const accent = accents[index % accents.length];
            return (
              <div
                key={notice._id}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                {/* Colored top accent bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${accent.bg}`} />

                {/* Notice Header */}
                <div className="flex items-start justify-between px-5 pt-4 pb-3 gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Number badge */}
                    <div className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${accent.bg} shadow-sm`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug">{notice.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${accent.badge}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                          Active
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Clock className="h-3 w-3" />
                          {getRelativeTime(notice.createdAt)}
                        </span>
                        {notice.updatedAt !== notice.createdAt && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <RefreshCw className="h-3 w-3" />
                            Updated {getRelativeTime(notice.updatedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditNotice(notice)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-150 hover:shadow-sm"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNotice(notice._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all duration-150 hover:shadow-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Notice Content */}
                <div className="px-5 pb-4">
                  <div
                    className="text-sm text-gray-600 prose prose-sm max-w-none leading-relaxed bg-gray-50 rounded-xl p-3.5 border border-gray-100"
                    dangerouslySetInnerHTML={{ __html: notice.content }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notice Modal */}
      <NoticeModal
        noticeModalOpen={noticeModalOpen}
        setNoticeModalOpen={setNoticeModalOpen}
        editingNotice={editingNotice}
        noticeForm={noticeForm}
        setNoticeForm={setNoticeForm}
        handleNoticeSubmit={handleNoticeSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}