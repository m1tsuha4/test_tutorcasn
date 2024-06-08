import Image from "next/image";
import logo from "../../pages/_assest/logo.svg";
import Link from "next/link";

export default function Footer() {
    return (
        <div id="footer" className="w-full max-w-[1024px] mx-auto">
            <div className="flex w-full justify-between items-center">
                <div className="">
                    <Image src={logo} alt="" />
                </div>
                <div className="flex items-center text-[1.5rem] gap-[1rem]">
                    <i className='bx bxl-instagram text-blue-600' />
                    <i className='bx bxl-tiktok text-blue-600' />
                </div>
            </div>
            <div className="flex gap-[1rem] justify-center w-full py-[2rem] border-b-2 border-[#B6B9C3]">
                <Link href="#" className="text-main-gray-text font-[500]">
                    Beranda
                </Link>
                <Link href="#" className="text-main-gray-text font-[500]">
                    Manfaat
                </Link>
                <Link href="#" className="text-main-gray-text font-[500]">
                    Fitur
                </Link>
                <Link href="#" className="text-main-gray-text font-[500]">
                    Testimoni
                </Link>
                <Link href="#" className="text-main-gray-text font-[500]">
                    FAQ
                </Link>
            </div>
            <div className="flex text-center justify-center w-full py-[2rem] text-main-gray-text">
                <p>©2024 Tutor CASN. All Right Reserved</p>
            </div>
        </div>
    )
}