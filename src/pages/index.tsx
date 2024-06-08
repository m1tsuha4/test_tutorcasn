import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Balancer from "react-wrap-balancer";
import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import LoadingPage from "@/components/ui/Loading-Page";
import { api } from "@/lib/api";
import Hero from "./_assest/Hero.png";
import Image from "next/image";
import Footer from "@/components/footer";

interface auth {
  login: boolean,
  signUp: boolean
}

export default function Home() {
  const [showAuth, setShowAuth] = useState<auth>({
    login: false,
    signUp: false
  })
  useEffect(() => {
    if (showAuth.login || showAuth.signUp) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showAuth]);
  return (
    <>
      <Navbar showAuth={showAuth} setShowAuth={setShowAuth} />
      {showAuth.login && <Login showAuth={showAuth} setShowAuth={setShowAuth} />}
      {showAuth.signUp && <SignUp showAuth={showAuth} setShowAuth={setShowAuth} />}
      <div className="relative">
        <div className="absolute top-0 -z-10 h-full w-full bg-white">
          <div className="absolute bottom-auto left-auto right-32 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(109,244,152,0.53)] opacity-60 blur-[80px]" />
        </div>
        <div className="py-2">
          <div className="min-h-screen">
            <div className="flex flex-col gap-[5rem] w-full pt-[5rem]">
              <HeroSection setShowAuth={setShowAuth} />
              <Fitur />
              <RevolusiBelajar />
              <Testimoni />
              <Faq />
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const HeroSection = ({ setShowAuth }: any) => {
  const router = useRouter();
  const { data: session } = useSession()

  return (
    <div id="hero" className="flex justify-between max-w-[1024px] mx-auto">
      <div className="flex flex-col justify-center gap-[1rem] shrink-0">
        <div className="">
          <div className="flex flex-col text-[3rem]">
            <h1 className="font-[700]">
              Belajar Tes ASN
            </h1>
            <h1 className="font-[700]">
              Jadi Mudah Dengan AI✨
            </h1>
          </div>
        </div>
        <p className="text-main-gray-text py-[1rem]">
          Optimalkan persiapan ASN/PNS-mu dengan dukungan AI Personal
        </p>
        <div className="flex gap-[1rem]">
          <button id="test" className="bg-main py-[.8rem] px-[1.3rem] rounded-[2rem] text-white"
            onClick={() => {
              if (!session) {
                setShowAuth((prev: any) => ({ ...prev, login: true }))
              } else {
                router.push("/beranda")
              }
            }}
          >
            Coba sekarang, gratis
          </button>
          <button className="py-[.8rem] px-[1.3rem] rounded-[2rem] text-main-gray-text">
            Pelajari lebih lanjut
          </button>
        </div>
      </div>
      <div className="">
        <Image src={Hero} alt="" />
      </div>
    </div>
  );
};


const Fitur = () => {
  return (
    <div id="fitur" className="grid grid-cols-4 gap-[1rem] py-[3rem] w-full max-w-[1024px] mx-auto">
      {Array.from({ length: 4 }).map((item: any, i: number) => (
        <div id="border" className="bg-white h-[300px] rounded-[.8rem] flex justify-center items-center">
          Ganti fitur fitur utama
        </div>
      ))}
    </div>
  )
}

const RevolusiBelajar = () => {
  return (
    <div className="w-full max-w-[1024px] mx-auto">
      <h1 className="text-[3rem] font-[500] text-center mb-[1rem]">
        Revolusi belajar tes ASN dengan AI
      </h1>
      <div className="grid grid-cols-2 gap-[1rem]">
        {Array.from({ length: 4 }).map((item: any, i: number) => (
          <div id="border" className="bg-white h-[300px] rounded-[.8rem] flex justify-center items-center">
            Revolusi belajar
          </div>
        ))}
      </div>
    </div>
  )
}

const dummyTestimoni: any = [
  {
    start: 5,
    comment: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum voluptate laboriosam temporibus ducimus non velit est! Nostrum corrupti minus magnam?",
    name: "Wanda"
  },
  {
    start: 5,
    comment: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum voluptate laboriosam temporibus ducimus non velit est! Nostrum corrupti minus magnam?",
    name: "Wanda"
  },
  {
    start: 5,
    comment: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum voluptate laboriosam temporibus ducimus non velit est! Nostrum corrupti minus magnam?",
    name: "Wanda"
  },
]

const Testimoni = () => {
  return (
    <div id="testimoni" className="bg-[#EFF3F8] ">
      <div className="grid grid-cols-3 py-[3rem] justify-center gap-[1rem] px-[1.5rem] max-w-[1024px] mx-auto">
        {dummyTestimoni.map((item: any, i: number) => (
          <div id="border" className="flex flex-col justify-between bg-white rounded-[1rem] h-[300px] p-[1.5rem]">
            <div className="flex flex-col gap-[1rem]">
              <div className="flex gap-[.5rem] items-center">
                <div className="flex">
                  <i className='bx bxs-star' />
                  <i className='bx bxs-star' />
                  <i className='bx bxs-star' />
                  <i className='bx bxs-star' />
                  <i className='bx bxs-star' />
                </div>
                <p>{item.start.toFixed(1)} <span className="text-main-gray-text">/ 5.0</span></p>
              </div>
              <p>{item.comment}</p>
            </div>
            <p className="font-[600]">
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </div>

  )
}

const Faq = () => {
  return (
    <div id="faq" className="">
      <h1 className="max-w-[1024px] mx-auto font-[700] text-[3rem] mb-[2rem]">
        FAQ
      </h1>
      <div className="w-full bg-blue-600 flex justify-center items-center py-[3rem]">
        <div className="bg-white w-full max-w-[1024px] mx-auto rounded-[2rem] flex flex-col items-center gap-[1rem] text-center py-[2rem]">
          <h1 className="text-[3rem] font-[700]">
            Lorem Ipsum
          </h1>
          <p>Lorem Ipsum</p>
          <button className="bg-main text-white py-[.5rem] px-[1rem] rounded-[.5rem]">
            Mulai Sekarang
          </button>
        </div>
      </div>
    </div>
  )
}





const Login = ({ showAuth, setShowAuth }: any) => {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const handleSubmit = async (e: any) => {
    setLoading(true)
    e.preventDefault()
    try {
      const res = await signIn("credentials", {
        email: email, password: password, redirect: false
      })
      console.log(res)

      if (res?.error) {
        alert("Invalid Credentials");
      } else {
        router.push("/beranda")
      }
      setLoading(false)
    } catch (error) {
      console.log("error:", error)
      setLoading(false)
      return
    }
  };
  return (
    <div id="login" className="fixed top-0 left-0 w-full h-full bg-[#d8d8d85e] backdrop-blur-[8px] z-[100] flex justify-center items-center">
      {loading && <LoadingPage />}
      {showAuth &&
        <div className="fixed bg-transparent top-0 left-0 w-full h-full z-[1]"
          onClick={() => setShowAuth((prev: any) => ({ ...prev, login: false }))}
        />
      }

      <div className="bg-[#ffffffce] p-[2rem] w-[500px] rounded-[1rem] flex flex-col gap-[2rem] z-[2]">

        <div className="flex flex-col gap-[.5rem]">
          <h1 className="text-[1.5rem] font-[400]">
            Selamat <span className="text-main">datang!</span>
          </h1>
          <p className="text-main-gray-text">
            Masuk dengan akunmu
          </p>
        </div>

        <form className="flex flex-col gap-[1.5rem]" onSubmit={(e: any) => handleSubmit(e)}>

          <div id="email" className="">
            <input type="text" placeholder="Email...." className="border border-main-gray-input text-[.9rem] rounded-[.5rem] outline-none py-[.8rem] px-[1rem] w-full" onChange={(e) => setEmail(e.target.value)} value={email} />
          </div>

          <div id="password" className="relative flex items-center">
            <input type={`${showPassword ? "text" : "password"}`} placeholder="Password...." className="border border-main-gray-input text-[.9rem] rounded-[.5rem] outline-none py-[.8rem] px-[1rem] w-full" onChange={(e) => setPassword(e.target.value)} value={password} />
            <i className={`bx ${!showPassword ? "bxs-hide" : "bxs-show"} absolute right-[1rem] text-[1.5rem] text-[#5A5D66] cursor-pointer`}
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <button className="bg-gradient rounded-[.5rem] py-[.8rem] font-[400] text-white">
            Masuk
          </button>

        </form>

        <div className="flex flex-col items-center gap-[1rem]">
          <p className=" font-[400]">Belum punya akun? <span className="underline text-main cursor-pointer"
            onClick={() => setShowAuth((prev: any) => ({ signUp: true, login: false }))}
          >daftar sekarang</span></p>
          <p className="text-center text-[.8rem] font-[400]">Dengan melanjutkan, kamu setuju dengan ketentuan Layanan dan Kebijakan Privasi Tutor CASN</p>
        </div>

      </div>
    </div>
  )
}

const SignUp = ({ showAuth, setShowAuth }: any) => {
  const router = useRouter();
  const createUsers = api.user.createUser.useMutation({
    onMutate(variables) {
      setLoading(true)
    },
    onSettled(data, error, variables, context) {
      if (!error) {
        setLoading(false)
        setShowAuth({ login: true, signUp: false })
      }
    },
    onError(error, variables, context) {
      alert(error.message)
      setLoading(false)
    },
  })

  const [loading, setLoading] = useState<boolean>(false)
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      createUsers.mutate({
        name: name,
        password: password,
        email: email
      })
      setLoading(false)
    } catch (error) {
      console.log("error:", error)
      alert({ error })
      setLoading(false)
      return
    }
  };
  return (
    <div id="login" className="fixed top-0 left-0 w-full h-full bg-[#d8d8d85e] backdrop-blur-[8px] z-[100] flex justify-center items-center">
      {loading && <LoadingPage />}
      {showAuth &&
        <div className="fixed bg-transparent top-0 left-0 w-full h-full z-[1]"
          onClick={() => setShowAuth((prev: any) => ({ ...prev, signUp: false }))}
        />
      }

      <div className="bg-[#ffffffce] p-[2rem] w-[500px] rounded-[1rem] flex flex-col gap-[2rem] z-[2]">

        <div className="flex flex-col gap-[.5rem]">
          <h1 className="text-[1.5rem] font-[400]">
            Mulai <span className="text-main">sekarang</span>
          </h1>
          <p className="text-main-gray-text">
            Daftarkan akunmu
          </p>
        </div>

        <form className="flex flex-col gap-[1.5rem]" onSubmit={(e: any) => handleSubmit(e)}>

          <div id="nama" className="">
            <input type="text" placeholder="Nama Lengkap...." className="border border-main-gray-input text-[.9rem] rounded-[.5rem] outline-none py-[.8rem] px-[1rem] w-full" onChange={(e) => setName(e.target.value)} value={name} />
          </div>

          <div id="email" className="">
            <input type="text" placeholder="Email...." className="border border-main-gray-input text-[.9rem] rounded-[.5rem] outline-none py-[.8rem] px-[1rem] w-full" onChange={(e) => setEmail(e.target.value)} value={email} />
          </div>

          <div id="password" className="relative flex items-center">
            <input type={`${showPassword ? "text" : "password"}`} placeholder="Password...." className="border border-main-gray-input text-[.9rem] rounded-[.5rem] outline-none py-[.8rem] px-[1rem] w-full" onChange={(e) => setPassword(e.target.value)} value={password} />
            <i className={`bx ${!showPassword ? "bxs-hide" : "bxs-show"} absolute right-[1rem] text-[1.5rem] text-[#5A5D66] cursor-pointer`}
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <button className="bg-gradient rounded-[.5rem] py-[.8rem] font-[400] text-white">
            Daftar Akun
          </button>

        </form>

        <div className="flex flex-col items-center gap-[1rem]">
          <p className=" font-[400]">Sudah punya akun? <span className="underline text-main cursor-pointer"
            onClick={() => setShowAuth((prev: any) => ({ signUp: false, login: true }))}
          >masuk sekarang</span></p>
          <p className="text-center text-[.8rem] font-[400]">Dengan melanjutkan, kamu setuju dengan ketentuan Layanan dan Kebijakan Privasi Tutor CASN</p>
        </div>

      </div>
    </div>
  )
}