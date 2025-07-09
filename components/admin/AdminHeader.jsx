import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminHeader({ logout }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white shadow-sm">
      <SidebarTrigger className="-ml-1" />
      <div className="flex items-center gap-2 flex-1">
        <h1 className="text-base lg:text-lg font-semibold text-gray-900">
          IBM SkillsBuild Admin Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 rounded-full"
        >
          Admin
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-xl transition-all duration-200 hover:shadow-md"
        >
          Logout
        </Button>
      </div>
    </header>
  );
}