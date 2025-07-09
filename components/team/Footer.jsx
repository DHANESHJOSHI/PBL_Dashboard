
export default function Footer({ handleLogout }) {
  return (
    <div className="mt-12 flex flex-col lg:flex-row justify-between items-center bg-white rounded-2xl shadow-xl border-0 p-6 gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="bg-blue-600 text-white p-3 rounded-xl">
          <div className="font-bold text-sm">CSRBOX</div>
          <div className="text-xs">Doing Good in a Better Way</div>
        </div>
        <div className="text-gray-700 text-center sm:text-left">
          <div className="text-sm font-medium">In collaboration with</div>
          <div className="font-bold text-blue-800">IBM SkillsBuild</div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-all duration-200 hover:shadow-lg text-sm lg:text-base"
      >
        LOG OUT
      </button>
    </div>
  )
}