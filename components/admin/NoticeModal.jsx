import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, X, Bell, Save } from "lucide-react";
import RichTextEditor from "@/components/rich-text-editor";

export default function NoticeModal({
  noticeModalOpen,
  setNoticeModalOpen,
  editingNotice,
  noticeForm,
  setNoticeForm,
  handleNoticeSubmit,
  isLoading
}) {
  return (
    <Dialog open={noticeModalOpen} onOpenChange={setNoticeModalOpen}>
      <DialogContent className="sm:max-w-3xl bg-white border-0 shadow-2xl rounded-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/20 rounded-xl">
              <Bell className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingNotice ? "Edit Notice" : "Create New Notice"}
              </h2>
              <p className="text-xs text-blue-100">
                {editingNotice ? "Update your announcement" : "Broadcast to all students"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setNoticeModalOpen(false)}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleNoticeSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Notice Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                required
                placeholder="e.g. Important: Feedback Form Submission"
                className="h-10 text-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl bg-gray-50/50 focus:bg-white transition-colors"
              />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Content <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={noticeForm.content}
                onChange={(value) => setNoticeForm({ ...noticeForm, content: value })}
                placeholder="Write your notice content here..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
            <button
              type="button"
              onClick={() => setNoticeModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{editingNotice ? "Updating..." : "Creating..."}</>
              ) : (
                <><Save className="h-4 w-4" />{editingNotice ? "Update Notice" : "Publish Notice"}</>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}