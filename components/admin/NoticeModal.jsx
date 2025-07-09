import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
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
      <DialogContent className="sm:max-w-4xl bg-white border-0 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {editingNotice ? "Edit Notice" : "Create New Notice"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleNoticeSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Title *
            </Label>
            <Input
              value={noticeForm.title}
              onChange={(e) =>
                setNoticeForm({ ...noticeForm, title: e.target.value })
              }
              required
              className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-xl"
              placeholder="Enter notice title"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Content *
            </Label>
            <RichTextEditor
              value={noticeForm.content}
              onChange={(value) => setNoticeForm({ ...noticeForm, content: value })}
              placeholder="Enter notice content with formatting..."
            />
          </div>
          <DialogFooter>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setNoticeModalOpen(false)}
              className="rounded-xl border-gray-300 hover:border-gray-400 transition-all duration-200 hover:shadow-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-green-600 hover:bg-green-700 transition-all duration-200 hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {editingNotice ? "Updating..." : "Creating..."}
                </>
              ) : (
                editingNotice ? "Update Notice" : "Create Notice"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}