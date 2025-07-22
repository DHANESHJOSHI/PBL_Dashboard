"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

export default function UploadResultAlert({ uploadResult }) {
  const [showAlert, setShowAlert] = useState(true);

  if (!uploadResult || !showAlert) return null;

  const isSuccess = uploadResult.success;

  return (
    <Alert
      className={`relative mb-6 overflow-x-auto rounded-lg ${
        isSuccess ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
      }`}
    >
      {/* ❌ Close Button */}
      <button
        className="absolute top-2 right-2 text-sm text-gray-500 hover:text-gray-800"
        onClick={() => setShowAlert(false)}
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-2">
        <AlertCircle
          className={`mt-1 h-4 w-4 ${
            isSuccess ? "text-green-600" : "text-red-600"
          }`}
        />
        <div>
          <AlertTitle
            className={isSuccess ? "text-green-800" : "text-red-800"}
          >
            Upload {isSuccess ? "Completed" : "Failed"}
          </AlertTitle>

          <AlertDescription
            className={isSuccess ? "text-green-700" : "text-red-700"}
          >
            {uploadResult.message}

            {uploadResult.data && (
              <div className="mt-3 space-y-3">
                {/* ✅ Summary */}
                {uploadResult.data.successful > 0 && (
                  <p>✅ Successfully processed: {uploadResult.data.successful} teams</p>
                )}
                {uploadResult.data.failed > 0 && (
                  <p>❌ Failed: {uploadResult.data.failed} teams</p>
                )}

                {/* ✅ Error Table - Show All */}
                {uploadResult.data.errors &&
                  uploadResult.data.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold mb-1">Error Details:</p>
                      <div className="max-h-64 overflow-auto border border-gray-200 rounded-md">
                        <table className="w-full text-sm border-collapse">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="border px-3 py-2 text-left">Row</th>
                              <th className="border px-3 py-2 text-left">Email</th>
                              <th className="border px-3 py-2 text-left">Error</th>
                            </tr>
                          </thead>
                          <tbody>
                            {uploadResult.data.errors.map((error, index) => (
                              <tr key={index} className="bg-white">
                                <td className="border px-3 py-2">{error.row}</td>
                                <td className="border px-3 py-2">{error.email}</td>
                                <td className="border px-3 py-2">{error.error}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* ✅ Team Info */}
                {uploadResult.data.processedTeams &&
                  uploadResult.data.processedTeams.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold mb-1">
                        Successfully added teams:
                      </p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {uploadResult.data.processedTeams.map((team, index) => (
                          <li key={index}>
                            {team.teamID} - {team.leaderName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
