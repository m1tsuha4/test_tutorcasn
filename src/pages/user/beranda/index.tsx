
import { api } from "@/lib/api";
import Layout from "../layout";
import Terbaru from "./terbaru";
import card1 from "../../_assest/card1.png";
import card2 from "../../_assest/card2.png";
import card3 from "../../_assest/card3.png";
import Image from "next/image";
import Link from "next/link";
import image from "../../_assest/image 36.png"
import Trending from "./trending";
import Riwayat from "./riwayat";

const Beranda = ({ minimizeSidebar, setMinimizeSidebar }: any) => {
  const { data: category, error, isLoading } = api.category.getAllCategories.useQuery();

  let categoryData: any = [];

  const getImage = (parameter: number) => {
    if (parameter === 1) {
      return card1;
    } else if (parameter === 2) {
      return card2;
    } else if (parameter === 3) {
      return card3;
    } else {
      return card1
    }
  }
  const getDescriptions = (parameter: string) => {
    if (parameter === "TWK") {
      return "Tes Wawasan Kenegaraan";
    } else if (parameter === "TIU") {
      return "Tes Intelegensi Umum";
    } else if (parameter === "TKP") {
      return "Tes Karakteristik Pribadi";
    } else {
      return "Descriptions...."
    }
  }

  if (category) {
    console.log(category, category?.length)
    categoryData = category.map((item, i) => {
      return {
        ...item,
        image: getImage(i + 1),
        descriptions: getDescriptions(item.name)
      }
    })
  }
  if (error) {
    console.log(error)
  }


  return (
    <Layout minimizeSidebar={minimizeSidebar} setMinimizeSidebar={setMinimizeSidebar}>
      <div className="flex flex-col gap-[2rem]">

        <div className={`flex justify-between gap-[.5rem]`}>

          {categoryData?.map((item: any, i: any) => (
            <div key={i} id="border" className="w-full flex justify-center items-center bg-white rounded-[.8rem] relative overflow-hidden">
              <Image src={item.image} alt="" className="w-full" />
              <div className="text-center col-span-1 absolute top-0 left-0 w-full h-full flex items-end justify-start">
                <div className="flex flex-col items-start justify-end w-full p-[1rem] bg-[#ffffff75] backdrop-blur-[8px] gap-[.5rem]">
                  <h1 className="text-[1.5rem] font-[400]">{item.name}</h1>
                  <p className="font-400 text-main-gray-text">{item.descriptions}</p>
                </div>
              </div>
            </div>
          ))}

        </div>

        <div className="flex flex-col font-[600] gap-[.5rem]">
          <Terbaru />
        </div>

        <div className="flex flex-col font-[600] gap-[.5rem]">
          <Trending />
        </div>

        <div className="flex flex-col font-[600] gap-[.5rem]">
          <Riwayat />
        </div>

      </div>
    </Layout>
  );
}

export default Beranda;
