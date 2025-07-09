// components/Header.jsx
export default function Header() {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-blue-800 font-bold text-xl">FAQ</div>
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <div className="font-bold text-sm">CSRBOX</div>
              <div className="text-xs">Doing Good in a Better Way</div>
            </div>
          </div>
          <div className="text-gray-700 text-right">
            <div className="text-sm font-medium">In collaboration with</div>
            <div className="text-lg font-bold text-blue-800">IBM SkillsBuild</div>
          </div>
        </div>
      </div>
    </div>
  )
}