// components/Header.jsx
import Image from "next/image"
export default function Header() {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-blue-800 font-bold text-xl">FAQ</div>
              <Image
                src="/csrbox.png"
                alt="CSR IBM Logo"
                width={200} // add your desired width
                height={100} // add your desired height
              />
          </div>
          <Image
            src="/ibm.png"
            alt="CSR IBM Logo"
            width={200} // add your desired width
            height={100} // add your desired height
          />
        </div>
      </div>
    </div>
  )
}