import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Plus, Trash2, Crown, Mail, Award, FileText, Link, Github, Briefcase, Users, Building2, Save, X } from "lucide-react";

function Field({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {Icon && <Icon className="h-3 w-3 text-blue-500" />}
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "h-9 text-sm rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-gray-50/50 focus:bg-white transition-colors";

export default function EditTeamModal({ editModalOpen, setEditModalOpen, editingTeam, setEditingTeam, handleUpdateTeam }) {
  const [localTeam, setLocalTeam] = useState(null);

  useEffect(() => {
    if (editingTeam) {
      setLocalTeam({
        ...editingTeam,
        members: editingTeam.members?.length > 0 ? [...editingTeam.members] : [{
          fullName: editingTeam.leaderName || '', email: editingTeam.email || '',
          learningPlanCompletion: "0%", currentMarks: "0",
          certificateLink: "", resumeLink: "", linkedinLink: "",
          portfolioLink: "", githubLink: "", additionalNotes: "", isLeader: true
        }]
      });
    }
  }, [editingTeam]);

  const updateTeamField = (field, value) => setLocalTeam(prev => ({ ...prev, [field]: value }));

  const updateMember = (index, field, value) => {
    const members = [...localTeam.members];
    members[index] = { ...members[index], [field]: value };
    if (field === 'isLeader' && value === true) {
      members.forEach((m, i) => { if (i !== index) members[i].isLeader = false; });
      setLocalTeam(prev => ({ ...prev, members, leaderName: members[index].fullName, email: members[index].email }));
    } else {
      setLocalTeam(prev => ({ ...prev, members }));
    }
  };

  const addMember = () => setLocalTeam(prev => ({
    ...prev,
    members: [...prev.members, { fullName: "", email: "", learningPlanCompletion: "0%", currentMarks: "0", certificateLink: "", resumeLink: "", linkedinLink: "", portfolioLink: "", githubLink: "", additionalNotes: "", isLeader: false }],
    totalMembers: prev.members.length + 1
  }));

  const removeMember = (index) => {
    if (localTeam.members.length <= 1) return;
    const members = localTeam.members.filter((_, i) => i !== index);
    if (localTeam.members[index].isLeader && members.length > 0) {
      members[0].isLeader = true;
      setLocalTeam(prev => ({ ...prev, members, totalMembers: members.length, leaderName: members[0].fullName, email: members[0].email }));
    } else {
      setLocalTeam(prev => ({ ...prev, members, totalMembers: members.length }));
    }
  };

  const handleSave = () => { if (localTeam) { setEditingTeam(localTeam); handleUpdateTeam(localTeam); } };

  if (!localTeam) return null;

  return (
    <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-white border-0 shadow-2xl rounded-2xl p-0">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Edit Team</h2>
              <p className="text-xs text-blue-100">{localTeam.teamID}</p>
            </div>
          </div>
          <button onClick={() => setEditModalOpen(false)} className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="team-info" className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="grid grid-cols-2 mx-6 mt-4 mb-0 rounded-xl bg-gray-100 p-1 h-9">
            <TabsTrigger value="team-info" className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Team Info
            </TabsTrigger>
            <TabsTrigger value="members" className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Members
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">{localTeam.members?.length || 0}</span>
            </TabsTrigger>
          </TabsList>

          {/* Team Info Tab */}
          <TabsContent value="team-info" className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Team ID" icon={Users}>
                <Input value={localTeam.teamID || ''} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
              </Field>
              <Field label="Team Name" icon={Users}>
                <Input value={localTeam.teamName || ''} onChange={e => updateTeamField('teamName', e.target.value)} className={inputCls} />
              </Field>
              <Field label="College Name" icon={Building2}>
                <Input value={localTeam.collegeName || ''} onChange={e => updateTeamField('collegeName', e.target.value)} className={inputCls} />
              </Field>
              <Field label="College ID" icon={Building2}>
                <Input value={localTeam.collegeId || ''} onChange={e => updateTeamField('collegeId', e.target.value)} className={inputCls} />
              </Field>
              <Field label="College Pincode" icon={Building2}>
                <Input value={localTeam.collegePincode || ''} onChange={e => updateTeamField('collegePincode', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Internship Name" icon={Briefcase}>
                <Input value={localTeam.internshipName || ''} onChange={e => updateTeamField('internshipName', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Total Female Members" icon={Users}>
                <Input type="number" min="0" max={localTeam.members?.length || 1} value={localTeam.totalFemaleMembers || 0} onChange={e => updateTeamField('totalFemaleMembers', Number(e.target.value))} className={inputCls} />
              </Field>
              <div className="flex items-center gap-3 pt-5">
                <Checkbox checked={localTeam.folderStructureEnabled || false} onCheckedChange={c => updateTeamField('folderStructureEnabled', c)} className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                <label className="text-sm text-gray-700 font-medium cursor-pointer">Folder Structure Enabled</label>
              </div>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="flex-1 overflow-y-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{localTeam.members?.length} member{localTeam.members?.length !== 1 ? 's' : ''}</p>
              <button
                onClick={addMember}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add Member
              </button>
            </div>

            <div className="space-y-4">
              {localTeam.members?.map((member, index) => (
                <div key={index} className={`border rounded-xl overflow-hidden ${member.isLeader ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200 bg-white'}`}>
                  {/* Member Header */}
                  <div className={`flex items-center justify-between px-4 py-2.5 ${member.isLeader ? 'bg-amber-50 border-b border-amber-100' : 'bg-gray-50 border-b border-gray-100'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${member.isLeader ? 'bg-amber-400 text-white' : 'bg-blue-100 text-blue-700'}`}>
                        {index + 1}
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{member.fullName || `Member ${index + 1}`}</span>
                      {member.isLeader && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200">
                          <Crown className="h-2.5 w-2.5" /> LEADER
                        </span>
                      )}
                    </div>
                    {localTeam.members.length > 1 && (
                      <button onClick={() => removeMember(index)} className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Member Fields */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Full Name" icon={User}>
                        <Input value={member.fullName || ''} onChange={e => updateMember(index, 'fullName', e.target.value)} className={inputCls} placeholder="Full name" />
                      </Field>
                      <Field label="Email" icon={Mail}>
                        <Input type="email" value={member.email || ''} onChange={e => updateMember(index, 'email', e.target.value)} className={inputCls} placeholder="email@example.com" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Learning Completion" icon={Award}>
                        <Input value={member.learningPlanCompletion || '0%'} onChange={e => updateMember(index, 'learningPlanCompletion', e.target.value)} className={inputCls} placeholder="e.g. 75%" />
                      </Field>
                      <Field label="Current Marks" icon={FileText}>
                        <Input value={member.currentMarks || '0'} onChange={e => updateMember(index, 'currentMarks', e.target.value)} className={inputCls} placeholder="e.g. 85" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Certificate Link" icon={Award}>
                        <Input type="url" value={member.certificateLink || ''} onChange={e => updateMember(index, 'certificateLink', e.target.value)} className={inputCls} placeholder="https://..." />
                      </Field>
                      <Field label="Resume Link" icon={FileText}>
                        <Input type="url" value={member.resumeLink || ''} onChange={e => updateMember(index, 'resumeLink', e.target.value)} className={inputCls} placeholder="https://..." />
                      </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="LinkedIn" icon={Link}>
                        <Input type="url" value={member.linkedinLink || ''} onChange={e => updateMember(index, 'linkedinLink', e.target.value)} className={inputCls} placeholder="linkedin.com/in/..." />
                      </Field>
                      <Field label="Portfolio" icon={Briefcase}>
                        <Input type="url" value={member.portfolioLink || ''} onChange={e => updateMember(index, 'portfolioLink', e.target.value)} className={inputCls} placeholder="https://..." />
                      </Field>
                      <Field label="GitHub" icon={Github}>
                        <Input type="url" value={member.githubLink || ''} onChange={e => updateMember(index, 'githubLink', e.target.value)} className={inputCls} placeholder="github.com/..." />
                      </Field>
                    </div>
                    <Field label="Additional Notes">
                      <Textarea value={member.additionalNotes || ''} onChange={e => updateMember(index, 'additionalNotes', e.target.value)} placeholder="Any additional notes..." className="text-sm rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 resize-none" rows={2} />
                    </Field>
                    <div className="flex items-center gap-2 pt-1">
                      <Checkbox checked={member.isLeader || false} onCheckedChange={c => updateMember(index, 'isLeader', c)} className="border-gray-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500" />
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 cursor-pointer">
                        <Crown className="h-3 w-3 text-amber-500" /> Set as Team Leader
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={addMember}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors w-full justify-center border-dashed"
              >
                <Plus className="h-4 w-4" /> Add Another Member
              </button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}