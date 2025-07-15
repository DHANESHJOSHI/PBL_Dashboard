
import Image from "next/image"

export default function Footer({ handleLogout }) {
  return (
    <div className="mt-12 flex flex-col lg:flex-row justify-between items-center bg-white rounded-2xl shadow-xl border-0 p-6 gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
          <Image
            src="/csrbox.png"
            alt="CSR IBM Logo"
            width={200} // add your desired width
            height={100} // add your desired height
          />
        <Image
            src="/ibm.png"
            alt="CSR IBM Logo"
            width={200} // add your desired width
            height={100} // add your desired height
          />
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