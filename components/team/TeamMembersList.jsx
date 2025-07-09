
import TeamMemberCard from './TeamMemberCard'

export default function TeamMembersList({ 
  teamData, 
  isLeader, 
  editingMember, 
  isSaving,
  handleEdit, 
  handleMemberUpdate, 
  handleSave, 
  handleSubmissionClick 
}) {
  return (
    <div className="space-y-6">
      {teamData.members.map((member, index) => (
        <TeamMemberCard
          key={index}
          member={member}
          index={index}
          isLeader={isLeader}
          editingMember={editingMember}
          isSaving={isSaving}
          teamData={teamData}
          handleEdit={handleEdit}
          handleMemberUpdate={handleMemberUpdate}
          handleSave={handleSave}
          handleSubmissionClick={handleSubmissionClick}
        />
      ))}
    </div>
  )
}