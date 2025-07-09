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

export default function EditTeamModal({
  editModalOpen,
  setEditModalOpen,
  editingTeam,
  setEditingTeam,
  handleUpdateTeam
}) {
  return (
    <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
      <DialogContent className="sm:max-w-2xl bg-white border-0 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Edit Team Details</DialogTitle>
        </DialogHeader>
        {editingTeam && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 py-4">
            <div className="space-y-2">
              <Label>Team Name</Label>
              <Input
                value={editingTeam.teamName || ''}
                onChange={(e) =>
                  setEditingTeam({ ...editingTeam, teamName: e.target.value })
                }
                className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label>College Name</Label>
              <Input
                value={editingTeam.collegeName || ''}
                onChange={(e) =>
                  setEditingTeam({ ...editingTeam, collegeName: e.target.value })
                }
                className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label>College ID</Label>
              <Input
                value={editingTeam.collegeId || ''}
                onChange={(e) =>
                  setEditingTeam({ ...editingTeam, collegeId: e.target.value })
                }
                className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label>Leader Name</Label>
              <Input
                value={editingTeam.leaderName || ''}
                onChange={(e) =>
                  setEditingTeam({ ...editingTeam, leaderName: e.target.value })
                }
                className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label>Leader Email</Label>
              <Input
                value={editingTeam.email || ''}
                onChange={(e) =>
                  setEditingTeam({ ...editingTeam, email: e.target.value })
                }
                className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label>Total Members</Label>
              <Input
                type="number"
                min="1"
                max="8"
                value={editingTeam.totalMembers || 1}
                onChange={(e) =>
                  setEditingTeam({ ...editingTeam, totalMembers: Number(e.target.value) })
                }
                className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setEditModalOpen(false)}
            className="rounded-xl border-gray-300 hover:border-gray-400 transition-all duration-200 hover:shadow-md"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateTeam}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:shadow-lg"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog> 
  )
}