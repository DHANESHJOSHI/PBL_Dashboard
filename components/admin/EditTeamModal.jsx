import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  User, 
  Plus, 
  Trash2, 
  Crown, 
  Mail, 
  Award, 
  FileText, 
  Link, 
  Github,
  Briefcase,
  Users,
  Building
} from "lucide-react";

export default function EditTeamModal({
  editModalOpen,
  setEditModalOpen,
  editingTeam,
  setEditingTeam,
  handleUpdateTeam
}) {
  const [localTeam, setLocalTeam] = useState(null);

  useEffect(() => {
    if (editingTeam) {
      setLocalTeam({
        ...editingTeam,
        members: editingTeam.members?.length > 0 ? [...editingTeam.members] : [
          {
            fullName: editingTeam.leaderName || '',
            email: editingTeam.email || '',
            learningPlanCompletion: "0%",
            currentMarks: "0",
            certificateLink: "",
            resumeLink: "",
            linkedinLink: "",
            portfolioLink: "",
            githubLink: "",
            additionalNotes: "",
            isLeader: true
          }
        ]
      });
    }
  }, [editingTeam]);

  const updateTeamField = (field, value) => {
    setLocalTeam(prev => ({ ...prev, [field]: value }));
  };

  const updateMember = (index, field, value) => {
    const updatedMembers = [...localTeam.members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    
    // If changing leader status, ensure only one leader
    if (field === 'isLeader' && value === true) {
      updatedMembers.forEach((member, i) => {
        if (i !== index) {
          updatedMembers[i].isLeader = false;
        }
      });
      
      // Update team leader info
      setLocalTeam(prev => ({
        ...prev,
        members: updatedMembers,
        leaderName: updatedMembers[index].fullName,
        email: updatedMembers[index].email
      }));
    } else {
      setLocalTeam(prev => ({ ...prev, members: updatedMembers }));
    }
  };

  const addMember = () => {
    const newMember = {
      fullName: "",
      email: "",
      learningPlanCompletion: "0%",
      currentMarks: "0",
      certificateLink: "",
      resumeLink: "",
      linkedinLink: "",
      portfolioLink: "",
      githubLink: "",
      additionalNotes: "",
      isLeader: false
    };
    
    setLocalTeam(prev => ({
      ...prev,
      members: [...prev.members, newMember],
      totalMembers: prev.members.length + 1
    }));
  };

  const removeMember = (index) => {
    if (localTeam.members.length <= 1) return; // Don't allow removing all members
    
    const updatedMembers = localTeam.members.filter((_, i) => i !== index);
    
    // If removed member was leader, make first member the leader
    if (localTeam.members[index].isLeader && updatedMembers.length > 0) {
      updatedMembers[0].isLeader = true;
      setLocalTeam(prev => ({
        ...prev,
        members: updatedMembers,
        totalMembers: updatedMembers.length,
        leaderName: updatedMembers[0].fullName,
        email: updatedMembers[0].email
      }));
    } else {
      setLocalTeam(prev => ({
        ...prev,
        members: updatedMembers,
        totalMembers: updatedMembers.length
      }));
    }
  };

  const handleSave = () => {
    if (localTeam) {
      setEditingTeam(localTeam);
      handleUpdateTeam(localTeam);
    }
  };

  if (!localTeam) return null;

  return (
    <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Edit Team: {localTeam.teamID}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="team-info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="team-info" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Team Information
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members ({localTeam.members?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          {/* Team Information Tab */}
          <TabsContent value="team-info" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Team ID</Label>
                <Input
                  value={localTeam.teamID || ''}
                  disabled
                  className="rounded-xl border-gray-300 bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Team Name</Label>
                <Input
                  value={localTeam.teamName || ''}
                  onChange={(e) => updateTeamField('teamName', e.target.value)}
                  className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label>Internship Name</Label>
                <Input
                  value={localTeam.internshipName || ''}
                  onChange={(e) => updateTeamField('internshipName', e.target.value)}
                  className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label>College Name</Label>
                <Input
                  value={localTeam.collegeName || ''}
                  onChange={(e) => updateTeamField('collegeName', e.target.value)}
                  className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label>College ID</Label>
                <Input
                  value={localTeam.collegeId || ''}
                  onChange={(e) => updateTeamField('collegeId', e.target.value)}
                  className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label>College Pincode</Label>
                <Input
                  value={localTeam.collegePincode || ''}
                  onChange={(e) => updateTeamField('collegePincode', e.target.value)}
                  className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label>Internship Name</Label>
                <Input
                  value={localTeam.internshipName || ''}
                  onChange={(e) => updateTeamField('internshipName', e.target.value)}
                  className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label>Total Female Members</Label>
                <Input
                  type="number"
                  min="0"
                  max={localTeam.members?.length || 1}
                  value={localTeam.totalFemaleMembers || 0}
                  onChange={(e) => updateTeamField('totalFemaleMembers', Number(e.target.value))}
                  className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={localTeam.folderStructureEnabled || false}
                    onCheckedChange={(checked) => updateTeamField('folderStructureEnabled', checked)}
                  />
                  Folder Structure Enabled
                </Label>
              </div>
            </div>
          </TabsContent>
          
          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
              <Button
                onClick={addMember}
                className="flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </div>
            
            <div className="space-y-4">
              {localTeam.members?.map((member, index) => (
                <Card key={index} className="border border-gray-200 rounded-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        Member {index + 1}
                        {member.isLeader && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Crown className="h-3 w-3 mr-1" />
                            Leader
                          </span>
                        )}
                      </CardTitle>
                      {localTeam.members.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeMember(index)}
                          className="h-8 w-8 p-0 rounded-full border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          Full Name *
                        </Label>
                        <Input
                          value={member.fullName || ''}
                          onChange={(e) => updateMember(index, 'fullName', e.target.value)}
                          className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          Email *
                        </Label>
                        <Input
                          type="email"
                          value={member.email || ''}
                          onChange={(e) => updateMember(index, 'email', e.target.value)}
                          className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Progress Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Award className="h-3 w-3" />
                          Learning Plan Completion
                        </Label>
                        <Input
                          value={member.learningPlanCompletion || '0%'}
                          onChange={(e) => updateMember(index, 'learningPlanCompletion', e.target.value)}
                          placeholder="e.g., 75%"
                          className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          Current Marks
                        </Label>
                        <Input
                          value={member.currentMarks || '0'}
                          onChange={(e) => updateMember(index, 'currentMarks', e.target.value)}
                          placeholder="e.g., 85"
                          className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    {/* Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Award className="h-3 w-3" />
                          Certificate Link
                        </Label>
                        <Input
                          type="url"
                          value={member.certificateLink || ''}
                          onChange={(e) => updateMember(index, 'certificateLink', e.target.value)}
                          placeholder="https://..."
                          className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          Resume Link
                        </Label>
                        <Input
                          type="url"
                          value={member.resumeLink || ''}
                          onChange={(e) => updateMember(index, 'resumeLink', e.target.value)}
                          placeholder="https://..."
                          className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Link className="h-3 w-3" />
                          LinkedIn
                        </Label>
                        <Input
                          type="url"
                          value={member.linkedinLink || ''}
                          onChange={(e) => updateMember(index, 'linkedinLink', e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                          className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Briefcase className="h-3 w-3" />
                          Portfolio
                        </Label>
                        <Input
                          type="url"
                          value={member.portfolioLink || ''}
                          onChange={(e) => updateMember(index, 'portfolioLink', e.target.value)}
                          placeholder="https://..."
                          className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Github className="h-3 w-3" />
                          GitHub
                        </Label>
                        <Input
                          type="url"
                          value={member.githubLink || ''}
                          onChange={(e) => updateMember(index, 'githubLink', e.target.value)}
                          placeholder="https://github.com/..."
                          className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    {/* Additional Notes */}
                    <div className="space-y-2">
                      <Label>Additional Notes</Label>
                      <Textarea
                        value={member.additionalNotes || ''}
                        onChange={(e) => updateMember(index, 'additionalNotes', e.target.value)}
                        placeholder="Any additional notes about this member..."
                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    
                    {/* Leader Checkbox */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={member.isLeader || false}
                        onCheckedChange={(checked) => updateMember(index, 'isLeader', checked)}
                      />
                      <Label className="flex items-center gap-2">
                        <Crown className="h-3 w-3 text-yellow-600" />
                        Team Leader
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => setEditModalOpen(false)}
            className="rounded-xl border-gray-300 hover:border-gray-400 transition-all duration-200 hover:shadow-md"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:shadow-lg"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog> 
  )
}