import { useEffect, useState } from "react";
import LayoutDashboard from "../layout";
import TambahDokumen from "./tambah-dokumen";
import { api } from "@/lib/api";
import LoadingPage from "@/components/ui/Loading-Page";
import Link from "next/link";
import { supabase } from "@/servers/supabase/supabaseClient";
import HapusDokumen from "./hapus-dokumen";
import { useRouter } from "next/router";
export default function Dokumen() {


  // UPLOAD FILE
  const [file, setFile] = useState<File>()
  const [showAddDocument, setShowAddDocument] = useState<boolean>(false)

  // Category And SubCategory
  const { data: categoryAndSubCategory, error, isLoading } = api.document.getCategoryAndSubCategory.useQuery();

  if (categoryAndSubCategory) {
    console.log(categoryAndSubCategory)
  }
  if (error) {
    console.log(error)
  }


  return (
    <LayoutDashboard>

      <TambahDokumen showAddDocument={showAddDocument} setShowAddDocument={setShowAddDocument} categoryAndSubCategory={categoryAndSubCategory} />

      <div className="flex flex-col gap-[4rem]">

        <div className="flex justify-between gap-[1rem]">
          <DocumentInfo />
        </div>

        <div className="flex flex-col gap-4">

          <HeadingTools setShowAddDocument={setShowAddDocument} />

          {/* Table */}
          <Table />

        </div>

      </div>

    </LayoutDashboard>
  );
}


const DocumentInfo = () => {

  const { data } = api.document.getDocumentInfo.useQuery()
  console.log("documentInfo:", data)

  return (
    <>
      {data?.map((item: any, i: number) => (
        <div className="bg-white p-[2rem] w-full rounded-[2rem]">
          <p className="text-[2rem] font-[300]">
            {item.Document.length}
          </p>
          <p className="text-main-gray-text">
            {item.name}
          </p>
        </div>
      ))}
    </>
  )
}

const HeadingTools = ({ setShowAddDocument }: { setShowAddDocument: any }) => {
  const router = useRouter();
  // HANDLE FILTER
  const [showFilter, setShowFilter] = useState<boolean>(false)
  const [showCategory, setShowCategory] = useState<boolean>(false)
  const [showSubCategory, setShowSubCategory] = useState<boolean>(false)
  return (
    <div className="flex w-full justify-between">

      <div className="flex gap-[1rem]">
        {showFilter &&
          <div className="fixed top-0 left-0 w-full h-full z-[1]"
            onClick={() => { setShowFilter(false) }}
          />
        }
        <div className="">
          <input type="text" placeholder="Cari document...." className="bg-white w-full outline-none rounded-[.7rem] h-full px-[1rem]" />
        </div>
        <div className="bg-white rounded-[.7rem] py-[.5rem] px-[1rem] font-[400] relative cursor-pointer z-[2] text-main-gray-text2 flex items-center"
          onClick={() => setShowFilter(!showFilter)}
        >
          <i className='bx bx-filter text-[1.5rem]' />
          Filter
          {showFilter &&
            <div className="absolute left-[calc(100%+.5rem)] top-[0] shadow-md border border-black flex flex-col bg-white">
              <div className="flex justify-between items-center gap-[3rem] hover:bg-black hover:text-white py-[.5rem] px-[.8rem] relative"
                onMouseOver={() => { setShowCategory(true) }}
                onMouseLeave={() => { setShowCategory(false) }}
              >
                <p>Category</p>
                <i className='bx bx-chevron-right text-[1.3rem]' ></i>
                {showCategory &&
                  <div className="absolute top-[-1px] left-[calc(100%)] bg-white border border-black">
                    <div className="flex gap-2 py-[.5rem] px-[.8rem] text-black pr-[3rem]">
                      <input type="checkbox" />
                      <p>SKD</p>
                    </div>
                    <div className="flex gap-2 py-[.5rem] px-[.8rem] text-black pr-[3rem]">
                      <input type="checkbox" />
                      <p>TWK</p>
                    </div>
                    <div className="flex gap-2 py-[.5rem] px-[.8rem] text-black pr-[3rem]">
                      <input type="checkbox" />
                      <p>TIU</p>
                    </div>
                  </div>
                }
              </div>
              <div className="flex justify-between items-center gap-[3rem] hover:bg-black hover:text-white py-[.5rem] px-[.8rem] relative"
                onMouseOver={() => { setShowSubCategory(true) }}
                onMouseLeave={() => { setShowSubCategory(false) }}
              >
                <p>SubCategory</p>
                <i className='bx bx-chevron-right text-[1.3rem]' ></i>
                {showSubCategory &&
                  <div className="absolute top-[-1px] left-[calc(100%)] bg-white border border-black">
                    <div className="flex gap-2 py-[.5rem] px-[.8rem] text-black pr-[3rem]">
                      <input type="checkbox" />
                      <p>Soal</p>
                    </div>
                    <div className="flex gap-2 py-[.5rem] px-[.8rem] text-black pr-[3rem]">
                      <input type="checkbox" />
                      <p>Kuiz</p>
                    </div>
                    <div className="flex gap-2 py-[.5rem] px-[.8rem] text-black pr-[3rem]">
                      <input type="checkbox" />
                      <p>Materi</p>
                    </div>
                  </div>
                }
              </div>
              <div className="flex gap-2  py-[.5rem] px-[.8rem]">
                <input type="checkbox" />
                <p>Judul</p>
              </div>
              <div className="flex gap-2  py-[.5rem] px-[.8rem]">
                <input type="checkbox" />
                <p>ID</p>
              </div>
            </div>
          }
        </div>
      </div>

      <div className="flex gap-[1rem]">
        <div className="bg-transparent duration-200 rounded-[.7rem] text-main-gray-text py-[.7rem] px-[1.5rem] font-[500] cursor-pointer"
          onClick={() => setShowAddDocument(true)}
        >
          Export CSV
        </div>
        <div className="bg-main hover:bg-main-hover duration-200 rounded-[.7rem] text-white py-[.7rem] px-[1.5rem] font-[400] cursor-pointer"
          onClick={() => setShowAddDocument(true)}
        >
          Tambah dokumen
        </div>
        {/* <div className="border border-black py-[.5rem] px-[3rem] font-[600] bg-black text-white cursor-pointer"
          onClick={() => router.push("/admin/dokumen/kelola-kategori")}
        >
          Kelola Category
        </div> */}
      </div>

    </div>
  )
}


const Table = () => {
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false)
  // Get All Dokumen
  let { data: documentData, error: error2, isLoading: isloading2 } = api.document.getAllDocument.useQuery();

  if (documentData) {
    console.log(documentData);
  }
  if (error2) {
    console.log(error2)
    documentData = []
  }

  // Download Supabase
  const fileDownload = async (fileName: string) => {
    try {
      const { data, error } = await supabase
        .storage
        .from('pdf')
        .download(`${fileName}`)

      if (data) {
        console.log(data)
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      if (error) {
        console.log(error)
      }
    } catch (error) {
      console.log("internal:", error)
    }
  }
  const [loading, setLoading] = useState<boolean>(false)
  const [deleteData, setDeleteData] = useState<any>({
    id: "",
    title: ""
  })

  const trpc = api.useUtils()
  const deleteDocument = api.document.deleteDocument.useMutation({
    onSettled: async (data, error, variables, context) => {
      await trpc.document.getAllDocument.invalidate()
      setLoading(false)
      setDeleteData({ id: "", title: "" })
    },
    onMutate(variables) {
    },
    onError(error, variables, context) {
      alert(error.message)
    },
    onSuccess(data, variables, context) {
      alert("Berhasil Delete Document From database")
    },
  })
  const removeDocument = async () => {
    try {
      setDeleteConfirmation(false)
      setLoading(true)
      console.log("Awdawd")
      const { data: pdf, error: pdfError } = await supabase.storage.from("pdf").remove([`${deleteData.title}`])
      const { data: img, error: imgError } = await supabase.storage.from("img").remove([`${deleteData.title}`])
      if (pdf && img) {
        deleteDocument.mutate({
          title: deleteData.title,
          id: deleteData.id,
        })
      }
      if (pdfError) {
        alert(pdfError.message)
        console.log("error :", pdfError)
      }
      if (imgError) {
        alert(imgError.message)
        console.log("error :", imgError)
      }
      setLoading(false)
      return;
    } catch (error) {
      console.log("Error pada Add Dokumen : ", error)
      setLoading(false)
      return error;
    }
  }

  return (
    <>
      <div className="w-full">
        <table className="w-full shadow-sm rounded-[.7rem]">
          <thead>
            <tr className="border-b border-main-gray-input">
              <th className="text-center p-[.7rem] font-[600] bg-white rounded-tl-[.7rem]">
                No.
              </th>
              <th className="text-start p-[.7rem] font-[600] bg-white">
                Judul
              </th>
              <th className="text-start p-[.7rem] font-[600] bg-white">
                Dipilih User
              </th>
              <th className="text-start p-[.7rem] font-[600] bg-white">
                Category
              </th>
              <th className="text-start p-[.7rem] font-[600] bg-white">
                Subcategory
              </th>
              <th className="text-center p-[.7rem] font-[600] bg-white rounded-tr-[.7rem]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {documentData && documentData.map((item: any, i: any) => (
              <tr className={`border-b border-main-gray-input ${i === documentData.length - 1 && "border-none"}`}>
                <td className={`bg-white text-center p-[.5rem] ${i === documentData.length - 1 && "rounded-bl-[.7rem]"}`}>
                  {i + 1}
                </td>
                <td className="bg-white p-[.5rem]">
                  <div className="flex justify-between items-center">
                    <p>{item.title}</p>
                  </div>
                </td>
                <td className="bg-white p-[.5rem]">
                  1000
                </td>
                <td className="bg-white p-[.5rem]">
                  <div className="bg-main rounded-[1rem] w-fit px-[.7rem] py-[.2rem] text-white">
                    {item.category.name}
                  </div>
                </td>
                <td className="bg-white p-[.5rem]">
                  <div className="bg-bg-workspace rounded-[1rem] w-fit px-[.7rem] py-[.2rem] text-black font-[500]">
                    {item.subCategory.name}
                  </div>
                </td>
                <td className={`bg-white p-[.5rem] ${i === documentData.length - 1 && "rounded-br-[.7rem]"}`}>
                  <div className="flex justify-center items-center gap-[.5rem]">
                    <div className="flex justify-center items-center gap-[.5rem]">
                      <div className="border border-black flex justify-center items-center p-[.5rem] text-[1.2rem]">
                        <a href={`${item.url}`} target="_blank" className="flex justify-center items-center">
                          <i className='bx bx-link-external' ></i>
                        </a>
                      </div>
                      <div className="border border-black flex justify-center items-center p-[.5rem] text-[1.2rem] cursor-pointer">
                        <i className='bx bx-download' onClick={() => fileDownload(item.title)}></i>
                      </div>
                    </div>
                    <HapusDokumen id={item.id} title={item.title} setDeleteConfirmation={setDeleteConfirmation} setDeleteData={setDeleteData} loading={loading} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!documentData && "Loading..."}

      <div id="pagination" className="w-full flex justify-between items-center">
        <div className="flex items-center gap-[1rem]">
          <p>Show</p>
          <div className="bg-white rounded-[.5rem] px-[1rem] py-[.5rem] text-main-gray-text flex items-center gap-[.5rem]">
            10
            <i className='bx bx-chevron-down text-[1.5rem]' />
          </div>
        </div>
        <div className="flex items-center gap-[1rem]">
          <i className='bx bx-left-arrow-alt' />
          <div className="flex gap-[.5rem]">
            {Array.from({ length: 8 }).map((item, i) => (
              <p key={i}>
                {i + 1}
              </p>
            ))}
          </div>
          <i className='bx bx-right-arrow-alt' />
        </div>
      </div>

      {deleteConfirmation &&
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-[#ffffff7a] z-[100]">
          <div className="bg-white p-[1rem] rounded-[1rem] flex flex-col gap-[1rem] shadow-lg">
            <p>Apakah anda yakin ingin menghapus dokumen "" ?</p>
            <div className="flex gap-[.5rem]">
              <button className="bg-blue-600 hover:bg-blue-500 rounded-[.3rem] text-white py-[.2rem] px-[1rem]"
                onClick={() => setDeleteConfirmation(false)}
              >
                No
              </button>
              <button className="bg-red-600 hover:bg-red-500 rounded-[.3rem] text-white py-[.2rem] px-[1rem]"
                onClick={() => removeDocument()}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      }
    </>
  )
}