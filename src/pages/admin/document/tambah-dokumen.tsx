import LoadingPage from "@/components/ui/Loading-Page";
import { toast } from "@/components/ui/use-toast"
import { env } from "@/env.mjs";
import { api } from "@/lib/api";
import { supabase } from "@/servers/supabase/supabaseClient";
import { useEffect, useState } from "react"
import uploadFile from "../../_assest/icon/uploadDokumen.png"
import Image from "next/image";



export default function TambahDokumen({ showAddDocument, setShowAddDocument, categoryAndSubCategory }: any) {

    // Loading
    const [loading, setLoading] = useState<boolean>(false)

    // Hook Dokumen 
    const [file, setFile] = useState<File | undefined>()
    const [thumbnail, setThumbnail] = useState<File | undefined>()

    const [fileName, setFileName] = useState<string>("")
    const [option, setOption] = useState<string>("doc")
    const [parse, setParse] = useState<string>("")
    const [category, setCategory] = useState<string>("")
    const [subCategory, setSubCategory] = useState<string>("")

    console.log("Add", categoryAndSubCategory?.category)

    //Get SubCategoryByCategoryId
    const { data: subCategoryData, refetch, error, isLoading } = api.subcategory.getAllSubcategoryByCategoryId.useQuery(category)

    if (subCategoryData) {
        console.log("Sub:", subCategoryData)
    }
    useEffect(() => {
        refetch()
    }, [category])

    const trpc = api.useUtils()
    // 
    const addDokumen = api.document.addDocument.useMutation({
        onSettled: async (data, error, variables, context) => {
            await trpc.document.getAllDocument.invalidate()
            setShowAddDocument(false)
            setFile(undefined)
            setThumbnail(undefined)
            setCategory("")
            setSubCategory("")
            setOption("Doc")
            setFileName("")
        },
        onMutate(variables) {
        },
        onError(error, variables, context) {
            alert(error.message)
            setLoading(false)
        },
        onSuccess(data, variables, context) {
            alert("Berhasil Upload to database")
            setLoading(false)
        },
    })

    const AddDokumen = async () => {
        try {
            setLoading(true)
            console.log("Awdawd")
            if (file && thumbnail) {
                // console.log("kirim:", {
                //     title: fileName !== "" ? fileName : file.name,
                //     categoryId: category,
                //     subCategoryId: subCategory,
                //     url: `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pdf/${fileName !== "" ? fileName : file.name}`,
                //     img: `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/img/${fileName !== "" ? fileName : file.name}`
                // })
                if (category === "" || subCategory === "") {
                    setLoading(false)
                    alert("Pilih Category dan SubCategory")
                    return;
                }
                const { data: pdf, error: pdfError } = await supabase.storage.from("pdf").upload(`${fileName !== "" ? fileName : file.name}`, file)
                const { data: img, error: imgError } = await supabase.storage.from("img").upload(`${fileName !== "" ? fileName : file.name}`, thumbnail)
                if (pdf && img) {
                    alert("Berhasil Upload File")
                    addDokumen.mutate({
                        title: fileName !== "" ? fileName : file.name,
                        categoryId: category,
                        subCategoryId: subCategory,
                        url: `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pdf/${fileName !== "" ? fileName.replace(/ /g, "%20") : file.name.replace(/ /g, "%20")}`,
                        img: `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/img/${fileName !== "" ? fileName : file.name}`
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
            } else {
                if (!file) {
                    alert("Upload Dokumen")
                }
                if (!thumbnail) {
                    alert("Upload Thumbnail")
                }
                setLoading(false)
            }
            return;
        } catch (error) {
            console.log("Error pada Add Dokumen : ", error)
            setLoading(false)
            return error;
        }
    }

    // console.log(previewThumbnail)

    return (
        <>
            {showAddDocument &&
                <div className="fixed top-0 left-0 w-full h-full z-[49]"
                    onClick={() => { setShowAddDocument(false) }}
                />
            }
            <div id="tambah-dokumen" className={`fixed top-0 w-[400px] h-full bg-white border-main-gray-input border z-[50] duration-300 ${showAddDocument ? "right-0 " : "right-[-420px]"} overflow-y-auto`}>
                {loading && <LoadingPage />}
                <div className="flex flex-col gap-[1rem] p-[2rem]">
                    <h1 className="font-[600] text-[1.2rem]">Tambah Bahan Ajar</h1>
                    <div className="flex flex-col gap-[1rem] text-[.9rem] font-[500]">
                        <div id="file">
                            <UploadFile
                                heading="Dokumen"
                                contentText="Pilih dokumen untuk diupload (.pdf, max 5MB)"
                                inputId="documentFile"
                                buttonText="Upload Dokumen"
                                file={file}
                                setFile={setFile}
                            />
                        </div>
                        <div id="name-file" className="flex flex-col gap-[.5rem]">
                            <p>
                                Judul dokumen <span className="text-main-gray-text">(opsional)</span>
                            </p>
                            <input type="text" className="border border-main-gray-input rounded-[.5rem] outline-none text-black py-[.5rem] px-[1rem] w-full font-[400]" placeholder="Masukan judul dokumen" onChange={(e) => setFileName(e.target.value)} value={fileName} />
                        </div>
                        <div id="category" className="flex flex-col gap-[.5rem]">
                            <p>
                                Kategori
                            </p>
                            <div className="flex gap-[1rem] w-full justify-between">
                                {categoryAndSubCategory?.category.map((item: any, i: any) => (
                                    <div key={i} className={`border border-main-gray-input w-full text-center py-[.5rem] cursor-pointer duration-200 text-main-gray-text hover:bg-main-hover hover:border-transparent hover:text-white rounded-[.5rem] ${category === item.id && "text-white bg-main border-main"}`}
                                        onClick={() => setCategory(item.id)}
                                    >
                                        {item.name}
                                    </div>
                                ))
                                }
                            </div>
                        </div>
                        <div id="subCategory" className="flex flex-col gap-[.5rem]">
                            <p>
                                Subkategori
                            </p>
                            <div className="flex gap-[1rem] w-full justify-between">
                                {subCategoryData?.map((item: any, i: any) => (
                                    <div key={i} className={`border border-main-gray-input w-full text-center py-[.5rem] cursor-pointer duration-200 text-main-gray-text hover:bg-main-hover hover:border-transparent hover:text-white rounded-[.5rem] ${subCategory === item.id && "text-white bg-main border-main"}`}
                                        onClick={() => setSubCategory(item.id)}
                                    >
                                        {item.name}
                                    </div>
                                ))
                                }
                            </div>
                        </div>
                        <div id="line" className="h-[1px] w-full bg-main-gray-input my-[0]" />
                        <div className="flex gap-[1rem] w-full justify-between">
                            <div className={`border border-main-gray-input w-full text-center py-[.5rem] cursor-pointer duration-200 text-main-gray-text hover:bg-main-hover hover:border-transparent hover:text-white rounded-[.5rem] ${option === "doc" && "text-white bg-main border-main"}`}
                                onClick={() => setOption("doc")}
                            >
                                Dokumen
                            </div>
                            <div className={`border border-main-gray-input w-full text-center py-[.5rem] cursor-pointer duration-200 text-main-gray-text hover:bg-main-hover hover:border-transparent hover:text-white rounded-[.5rem] ${option === "video" && "text-white bg-main border-main"}`}
                                onClick={() => setOption("video")}
                            >
                                Video
                            </div>
                        </div>
                        {option === "doc" &&
                            <div id="thumbnail">
                                <UploadFile
                                    heading="Thumbnail Dokumen"
                                    contentText="Pilih thumbnail untuk diupload (.jpg, max 5MB)"
                                    inputId="thumbnailFile"
                                    buttonText="Upload Thumbnail"
                                    file={thumbnail}
                                    image
                                    setFile={setThumbnail}
                                />
                            </div>
                        }
                        <div id="action" className="flex gap-[1rem] mt-[1rem]">
                            <button className="border border-main-gray-input rounded-[.5rem] text-main-gray-text py-[.6rem] w-full hover:bg-main-hover hover:text-white hover:border-transparent duration-300"
                                onClick={() => { setShowAddDocument(false) }}
                            >
                                Batalkan
                            </button>
                            <button type="submit" className="border border-main bg-main rounded-[.5rem] text-white py-[.6rem] w-full"
                                onClick={() => AddDokumen()}
                            >
                                Tambah bahan ajar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}


const UploadFile = ({ file, setFile, heading, buttonText, contentText, inputId, image }: any) => {

    const [previewHover, setPreviewHover] = useState<boolean>(false)
    const [previewImage, setPreviewImage] = useState<string>("")


    useEffect(() => {
        console.log("22", file);
        setPreviewImage("")
        if (image && file) {
            const reader = new FileReader();
            // console.log(file);

            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviewImage(result);
            };

            reader.readAsDataURL(file);
        }
    }, [file])

    // console.log("12A", previewImage)

    return (
        <div className="relative">
            <p className="font-[500] text-[.9rem] mb-[.5rem] ml-[.5rem]">
                {heading}
            </p>
            <input id={`${inputId}`} type="file" onChange={(e: any) => setFile(e.target.files[0])} className="absolute top-0 right-0 w-0 h-0" />
            <div className="border-2 border-main-gray-input border-dashed rounded-[1rem] p-[1rem] flex flex-col gap-[1rem] relative">
                {!image ?
                    <>
                        <div className="flex flex-col text-center items-center gap-[.5rem]">
                            <Image src={uploadFile} alt="" />
                            <p className="text-main-gray-text text-[.8rem]">
                                {!file ?
                                    `${contentText}`
                                    :
                                    `${file.name}`
                                }
                            </p>
                        </div>
                        <button className="border border-main-gray-input rounded-[.5rem] w-full text-[.8rem] py-[.5rem] text-main-gray-text hover:border-main hover:bg-main active:bg-main-hover hover:text-white duration-300"
                            onClick={() => {
                                document.getElementById(`${inputId}`)?.click()
                            }}
                        >
                            {buttonText}
                        </button>
                    </>
                    :
                    <>
                        {!previewImage ?
                            <>
                                <div className="flex flex-col text-center items-center gap-[.5rem]">
                                    <Image src={uploadFile} alt="" />
                                    <p className="text-main-gray-text text-[.8rem]">
                                        {!file ?
                                            `${contentText}`
                                            :
                                            `${file.name}`
                                        }
                                    </p>
                                </div>
                                <button className="border border-main-gray-input rounded-[.5rem] w-full text-[.8rem] py-[.5rem] text-main-gray-text hover:border-main hover:bg-main active:bg-main-hover hover:text-white duration-300"
                                    onClick={() => {
                                        document.getElementById(`${inputId}`)?.click()
                                    }}
                                >
                                    {buttonText}
                                </button>
                            </>
                            :
                            <>
                                <div className={`relative ${previewHover ? "z-[4]" : "z-[6]"}`}>
                                    <img src={previewImage} alt=""
                                        onMouseOver={() => {
                                            if (previewImage) {
                                                setPreviewHover(true)
                                            }
                                        }}
                                    />
                                </div>
                                <div className="absolute top-0 left-0 w-full h-full bg-[#ffffffc4] flex justify-center items-center z-[5] p-[1rem]">
                                    <div className="w-full h-full flex justify-center items-center"
                                        onClick={() => {
                                            document.getElementById(`${inputId}`)?.click()
                                        }}
                                        onMouseLeave={() => {
                                            if (previewImage) {
                                                setPreviewHover(false)
                                            }
                                        }}
                                    >
                                        <div className="flex flex-col items-center text-center text-main-gray-text">
                                            <i className='bx bx-upload text-[1.5rem]' />
                                            <p>Ganti Thumbnail</p>
                                        </div>
                                    </div>
                                </div>

                            </>
                        }
                    </>
                }
            </div>
        </div>
    )
}