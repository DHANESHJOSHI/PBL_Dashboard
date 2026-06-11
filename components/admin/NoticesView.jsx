import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Bell, BellOff, Clock, RefreshCw } from "lucide-react";
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

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage announcements for students</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Create Notice
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl">
          <Bell className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-xs font-semibold text-blue-700">{notices.length} Active Notice{notices.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Notices List */}
      {notices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            <BellOff className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-600">No notices yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Create your first notice to inform students</p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
          >
            <Plus className="h-4 w-4" /> Create First Notice
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice, index) => (
            <div
              key={notice._id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Notice Header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full text-white text-xs font-bold shrink-0">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{notice.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditNotice(notice)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNotice(notice._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>

              {/* Notice Content */}
              <div className="px-5 py-4">
                <div
                  className="text-sm text-gray-700 prose prose-sm max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: notice.content }}
                />
              </div>

              {/* Notice Footer */}
              <div className="flex items-center gap-4 px-5 py-2.5 bg-gray-50/60 border-t border-gray-100">
                <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Clock className="h-3 w-3" />
                  Created: {new Date(notice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                {notice.updatedAt !== notice.createdAt && (
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <RefreshCw className="h-3 w-3" />
                    Updated: {new Date(notice.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          ))}
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