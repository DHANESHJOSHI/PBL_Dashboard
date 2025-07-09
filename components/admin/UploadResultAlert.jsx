import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function UploadResultAlert({ uploadResult }) {
  if (!uploadResult) return null;

  return (
    <Alert className={`mb-6 ${uploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <AlertCircle className={`h-4 w-4 ${uploadResult.success ? 'text-green-600' : 'text-red-600'}`} />
      <AlertTitle className={uploadResult.success ? 'text-green-800' : 'text-red-800'}>
        Upload {uploadResult.success ? 'Completed' : 'Failed'}
      </AlertTitle>
      <AlertDescription className={uploadResult.success ? 'text-green-700' : 'text-red-700'}>
        {uploadResult.message}
        {uploadResult.data && (
          <div className="mt-2 space-y-2">
            {uploadResult.data.successful > 0 && (
              <p>✅ Successfully processed: {uploadResult.data.successful} teams</p>
            )}
            {uploadResult.data.failed > 0 && (
              <p>❌ Failed: {uploadResult.data.failed} teams</p>
            )}
            {uploadResult.data.errors && uploadResult.data.errors.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Errors:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {uploadResult.data.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {uploadResult.data.errors.length > 5 && (
                    <li>... and {uploadResult.data.errors.length - 5} more errors</li>
                  )}
                </ul>
              </div>
            )}
            {uploadResult.data.processedTeams && uploadResult.data.processedTeams.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Successfully added teams:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {uploadResult.data.processedTeams.map((team, index) => (
                    <li key={index}>{team.teamID} - {team.leaderName}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}