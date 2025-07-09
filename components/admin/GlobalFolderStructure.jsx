import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderTree, Settings } from "lucide-react";

export default function GlobalFolderStructure({ setGlobalFolderStructureModalOpen }) {
  return (
    <Card className="shadow-xl border-0 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-2xl p-4 lg:p-6">
        <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
          <FolderTree className="h-5 w-5" />
          Global Folder Structure
        </CardTitle>
        <CardDescription className="text-purple-100">
          This structure applies to all new team folders
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 lg:p-6">
        <div className="bg-white rounded-xl p-4 border">
          <div className="font-mono text-sm space-y-1 text-gray-700">
            <div className="flex items-center gap-2">
              <span>📁</span>
              <span className="font-semibold text-blue-600">IBM_SkillsBuild_Teams</span>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span>📁</span>
              <span className="font-semibold text-green-600">[TEAM_ID]_[TEAM_NAME]</span>
            </div>
            <div className="ml-8 space-y-1">
              <div className="flex items-center gap-2">
                <span>📁</span>
                <span>Concept_Note</span>
              </div>
              <div className="ml-4 space-y-1 text-xs text-purple-600">
                <div>📁 Problem_Statement</div>
                <div>📁 Solution_Approach</div>
                <div>📁 Technical_Architecture</div>
                <div>📁 Implementation_Plan</div>
                <div>📁 Team_Roles</div>
              </div>
              <div className="flex items-center gap-2">
                <span>📁</span>
                <span>Final_Deliverable</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📁</span>
                <span>Member_Submissions</span>
              </div>
              <div className="ml-4 space-y-1 text-xs text-orange-600">
                <div>📁 Member_1_[NAME]</div>
                <div className="ml-4 space-y-1 text-xs">
                  <div>📁 Certificates</div>
                  <div>📁 Resume_LinkedIn</div>
                </div>
                <div>📁 Member_2_[NAME] ...</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <Button
            onClick={() => setGlobalFolderStructureModalOpen(true)}
            variant="outline"
            className="rounded-xl border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Customize Structure
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}