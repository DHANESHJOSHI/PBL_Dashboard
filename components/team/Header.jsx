import Image from "next/image"
import { HelpCircle } from "lucide-react"

export default function Header() {
    return (
        <div className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center">
                        <a
                            href="https://docs.google.com/document/d/1eaAUjrkLB3ZQ3Lj9ZsxRGX7sRvWxl_DuUDRjXtpXL5c/edit?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-800 hover:text-blue-600 font-bold text-xl transition-colors"
                        >
                            <HelpCircle className="h-6 w-6" />
                            FAQ
                        </a>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <Image
                            src="/bharatcares_original.png"
                            alt="BharatCares Logo"
                            width={180}
                            height={60}
                            className="object-contain"
                            style={{ maxHeight: "50px", width: "auto" }}
                            priority
                        />
                        <Image
                            src="/ibm_gap.png"
                            alt="IBM Logo"
                            width={180}
                            height={60}
                            className="object-contain"
                            style={{ maxHeight: "70px", width: "auto" }}
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}