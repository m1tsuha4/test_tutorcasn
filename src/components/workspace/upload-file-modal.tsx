import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useCallback, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { XIcon } from "lucide-react";
import { api } from "@/lib/api";
import { string, z } from "zod";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

const UploadFileModal = ({
  refetchUserDocs,
}: {
  refetchUserDocs: () => void;
}) => {
  const [file, setFile] = useState<File>();

  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  

  const { data: categories } = api.category.getAllCategories.useQuery();

  const addCategoryToDocumentMutation =
    api.document.addCategoryToDocument.useMutation();

  const { isLoading: isUrlUploading, mutateAsync: mutateAddDocumentByLink } =
    api.document.addDocumentByLink.useMutation();

  const uploadFile = async () => {
    if ((file && url) || (!file && !url) || !selectedCategoryId) {
      toast({
        title: "Error",
        description: "Tambahkan file dan kategori.",
        variant: "destructive",
      });
      return;
    }
    try {
      let documentUrl: string | undefined;

      if (file) {
        const uploadResponse = await startUpload([file]);
        console.log(uploadResponse[0]);

        // kemudian ambil url nya simapn di documentUrl
        documentUrl = uploadResponse[0]?.url;
      } else if (url) {
        const urlSchema = z.string().url();
        try {
          urlSchema.parse(url);
        } catch (err) {
          toast({
            title: "Error",
            description: "Invalid URL",
            variant: "destructive",
          });
          return;
        }

        const res = await fetch(url);
        const contentType = res.headers.get("Content-Type");
        if (contentType !== "application/pdf") {
          toast({
            title: "Error",
            description: "URL is not a PDF",
            variant: "destructive",
          });
          return;
        }

        const fileName =
          res.headers.get("Content-Disposition")?.split("filename=")[1] ||
          url.split("/").pop();

        await mutateAddDocumentByLink({
          title: fileName ?? "Untitled",
          url,
        });

        toast({
          title: "Success",
          description: "File uploaded successfully.",
        });
      }
      if (documentUrl && selectedCategoryId) {
        await addCategoryToDocumentMutation.mutateAsync({
          documentUrl,
          categoryId: selectedCategoryId,
        });

        toast({
          title: "Success",
          description: "File uploaded and category added successfully.",
          variant: "default",
        });
      } else {
        throw new Error(
          "Failed to obtain document ID or category ID is missing."
        );
      }
    } catch (err: any) {
      console.log("error", err.message);
      toast({
        title: "Error",
        description: "Error occurred while uploading",
        variant: "destructive",
      });
    } finally {
      closeModal();
      setFile(undefined);
      refetchUserDocs();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
      <DialogTrigger>
        <div className={cn(buttonVariants())}>Upload File</div>
      </DialogTrigger>
      <DialogContent hideClose={true}>
        <DialogHeader>
          <DialogTitle>
            <p className="text-xl">Tambahkan File</p>
            <p className="text-sm font-normal text-gray-500">
              Pilih file dibawah 6 halaman(untuk saat ini)
            </p>
          </DialogTitle>

          <div className="mb-2" />

          <Uploader
            permittedFileInfo={permittedFileInfo}
            setUrl={setUrl}
            setFile={setFile}
            file={file}
          />

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="mx-3 flex-shrink text-xs text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

         
          <div className="mt-2">
            <p className="mb-2">Tambahkan Kategori</p>

            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full rounded border p-1 "
            >
              <option value="">Pilih Kategori</option>
              {categories?.map((category) => (
                <option className="m-2" key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Button
              disabled={(!file && !url) || isUrlUploading}
              className="mt-4 w-full"
              onClick={uploadFile}
            >
              {isUrlUploading && <Spinner />}
              Kirim
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
export default UploadFileModal;

const Uploader = ({
  setFile,
  file,
  permittedFileInfo,
}: {
  setFile: (file?: File) => void;
  file?: File;
  permittedFileInfo: any;
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length !== 1 || !acceptedFiles[0]) {
      toast({
        title: "Error",
        description: "Please upload a single file.",
        variant: "destructive",
      });
      return;
    }

    setFile(acceptedFiles[0]);
  }, []);

  const fileTypes = permittedFileInfo?.config
    ? Object.keys(permittedFileInfo?.config)
    : [];

  const { getRootProps, getInputProps } = useDropzone({
    disabled: !!file,
    onDrop,
    maxFiles: 1,
    maxSize: 8 * 1024 * 1024,
    multiple: false,
    accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-col items-center justify-center gap-4 rounded-md border-[0.75px] border-gray-300 px-4 py-12"
    >
      <input {...getInputProps()} />

      {file ? (
        <div className="my-5 flex items-center gap-2">
          <p>{file.name}</p>
          <XIcon
            onClick={() => setFile()}
            className="h-4 w-4 text-gray-500 hover:cursor-pointer"
          />
        </div>
      ) : (
        <>
          <p>Upload PDF</p>
          <p className="text-sm text-gray-500">Single PDF upto 8MB</p>
        </>
      )}
    </div>
  );
};
