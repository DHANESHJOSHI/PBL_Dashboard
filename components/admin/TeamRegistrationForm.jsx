import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

export default function TeamRegistrationForm({
  teamForm,
  setTeamForm,
  handleTeamFormSubmit,
  isLoading,
  addMember,
  removeMember,
  updateMember
}) {
  return (
    <Card className="shadow-xl border-0 rounded-2xl bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl p-4 lg:p-6">
        <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
          <Plus className="h-5 w-5" />
          Register New Team
        </CardTitle>
        <CardDescription className="text-blue-100">
          Step {teamForm.step} of 3
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 lg:p-6 bg-white">
        <form onSubmit={handleTeamFormSubmit}>
          {teamForm.step === 1 && (
            <div className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Team Name
                  </Label>
                  <Input
                    value={teamForm.data.teamName}
                    onChange={(e) =>
                      setTeamForm({
                        ...teamForm,
                        data: { ...teamForm.data, teamName: e.target.value },
                      })
                    }
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    placeholder="Enter team name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Internship Name
                  </Label>
                  <Input
                    value={teamForm.data.internshipName}
                    onChange={(e) =>
                      setTeamForm({
                        ...teamForm,
                        data: { ...teamForm.data, internshipName: e.target.value },
                      })
                    }
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    placeholder="Enter internship name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    College Name *
                  </Label>
                  <Input
                    value={teamForm.data.collegeName}
                    onChange={(e) =>
                      setTeamForm({
                        ...teamForm,
                        data: { ...teamForm.data, collegeName: e.target.value },
                      })
                    }
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    placeholder="Enter college name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    College Pincode
                  </Label>
                  <Input
                    value={teamForm.data.collegePincode}
                    onChange={(e) =>
                      setTeamForm({
                        ...teamForm,
                        data: {
                          ...teamForm.data,
                          collegePincode: e.target.value,
                        },
                      })
                    }
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    placeholder="Enter pincode"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    College ID *
                  </Label>
                  <Input
                    value={teamForm.data.collegeId}
                    onChange={(e) =>
                      setTeamForm({
                        ...teamForm,
                        data: { ...teamForm.data, collegeId: e.target.value },
                      })
                    }
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    placeholder="Enter college ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Total Members *
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={teamForm.data.totalMembers}
                    onChange={(e) =>
                      setTeamForm({
                        ...teamForm,
                        data: {
                          ...teamForm.data,
                          totalMembers: Number.parseInt(e.target.value) || 1,
                        },
                      })
                    }
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Total Female Members
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max={teamForm.data.totalMembers}
                    value={teamForm.data.totalFemaleMembers}
                    onChange={(e) =>
                      setTeamForm({
                        ...teamForm,
                        data: {
                          ...teamForm.data,
                          totalFemaleMembers:
                            Number.parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {teamForm.step === 2 && (
            <div className="space-y-4 lg:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Team Members
                </h3>
                <Button
                  type="button"
                  onClick={addMember}
                  disabled={teamForm.data.members.length >= 8}
                  className="flex items-center gap-2 rounded-xl transition-all duration-200 hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  Add Member
                </Button>
              </div>
              {teamForm.data.members.map((member, index) => (
                <div
                  key={index}
                  className="border border-gray-200 p-4 lg:p-6 rounded-2xl bg-white shadow-md"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h4 className="font-medium text-gray-900">
                      Member {index + 1} {member.isLeader && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 rounded-full">
                          Leader
                        </Badge>
                      )}
                    </h4>
                    {!member.isLeader && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMember(index)}
                        className="flex items-center gap-1 rounded-xl"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Full Name *
                      </Label>
                      <Input
                        value={member.fullName}
                        onChange={(e) =>
                          updateMember(index, "fullName", e.target.value)
                        }
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Email *
                      </Label>
                      <Input
                        type="email"
                        value={member.email}
                        onChange={(e) =>
                          updateMember(index, "email", e.target.value)
                        }
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        placeholder="Enter Gmail address"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {teamForm.step === 3 && (
            <div className="space-y-4 lg:space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Review Team Details
              </h3>
              <div className="bg-white p-4 lg:p-6 rounded-2xl border border-gray-200 shadow-md">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">
                      Team Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Team Name
                        </Label>
                        <p className="text-gray-900 font-medium">
                          {teamForm.data.teamName || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          College
                        </Label>
                        <p className="text-gray-900 font-medium">
                          {teamForm.data.collegeName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {teamForm.data.collegePincode} • {teamForm.data.collegeId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">
                      Team Members ({teamForm.data.members.length})
                    </h4>
                    <div className="space-y-3">
                      {teamForm.data.members.map((member, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-3">
                          <p className="font-medium text-gray-900">
                            {member.fullName || "Unnamed member"}
                            {member.isLeader && (
                              <Badge className="ml-2 bg-blue-100 text-blue-800 rounded-full text-xs">
                                Leader
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between mt-6 lg:mt-8 gap-4">
            {teamForm.step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setTeamForm({ ...teamForm, step: teamForm.step - 1 })
                }
                className="flex items-center gap-2 rounded-xl border-gray-300 hover:border-gray-400 transition-all duration-200 hover:shadow-md"
              >
                Previous
              </Button>
            )}
            {teamForm.step < 3 ? (
              <Button
                type="button"
                onClick={() =>
                  setTeamForm({ ...teamForm, step: teamForm.step + 1 })
                }
                className="sm:ml-auto bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 hover:shadow-lg"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="sm:ml-auto bg-green-600 hover:bg-green-700 rounded-xl transition-all duration-200 hover:shadow-lg"
              >
                {isLoading ? "Registering..." : "Register Team"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}