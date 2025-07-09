import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
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
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Notice Board Management
          </h2>
          <p className="text-gray-600 mt-1">
            Create and manage notices for students
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingNotice(null);
            setNoticeForm({ title: "", content: "" });
            setNoticeModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 transition-all duration-200 hover:shadow-lg w-full lg:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Notice
        </Button>
      </div>

      {/* Notices List */}
      <Card className="shadow-xl border-0 rounded-2xl">
        <CardHeader className="bg-gray-50 border-b rounded-t-2xl p-4 lg:p-6">
          <CardTitle className="text-lg lg:text-xl text-gray-900">
            Active Notices ({notices.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          <div className="space-y-4">
            {notices.map((notice, index) => (
              <div
                key={notice._id}
                className="border border-gray-200 p-4 lg:p-6 rounded-2xl bg-white hover:shadow-lg transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      #{index + 1}
                    </span>
                    <h4 className="font-semibold text-gray-900 text-base lg:text-lg">
                      {notice.title}
                    </h4>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditNotice(notice)}
                      className="flex items-center gap-1 rounded-xl border-gray-300 hover:border-gray-400 transition-all duration-200 hover:shadow-md"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteNotice(notice._id)}
                      className="flex items-center gap-1 rounded-xl transition-all duration-200 hover:shadow-md"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
                <div 
                  className="text-gray-600 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: notice.content }}
                />
                <p className="text-xs text-gray-500 mt-4 pt-4 border-t">
                  Created: {new Date(notice.createdAt).toLocaleDateString()}
                  {notice.updatedAt !== notice.createdAt && (
                    <span> • Updated: {new Date(notice.updatedAt).toLocaleDateString()}</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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