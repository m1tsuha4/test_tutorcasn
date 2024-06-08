import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { TRPCError } from "@trpc/server";
import { Spinner } from "@/components/ui/spinner";

interface PostUpKategoriModalProps {
  refetchCategories: () => void;
}

function PostUpKategoriModal({ refetchCategories }: PostUpKategoriModalProps ) {
  const [kategori, setKategori] = useState("");

  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);

  // ambil value dari input
  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKategori(e.target.value);
  };

 

  const { isLoading: isKategoriUploading, mutateAsync: addKategori } =api.category.addCategory.useMutation();

  const uploadKategori = async () => {
    if (!kategori) {
      toast({
        title: "Error",
        description: "Harap masukkan nama kategori.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addKategori({ name: kategori });
      toast({
        title: "Sukses",
        description: "Kategori berhasil ditambahkan.",
      });
      closeModal();
      setKategori("");
      refetchCategories()
    } catch (error) {
      if (error instanceof TRPCError) {
        toast({
          title: "Error",
          description: error.message || "Nama Kategori sudah ada.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat menambahkan kategori.",
          variant: "destructive",
        });
      }
      console.error("Failed to add category:", error);
    }
  };

  return (
    <>
      <div className="my-6 flex justify-end">
        <Dialog>
          <DialogTrigger>
            <div className={cn(buttonVariants())}>Tambah Kategori</div>
          </DialogTrigger>
          <DialogContent hideClose={true}>
            <DialogHeader>
              <DialogTitle>
                <p className="mb-4 text-center text-xl">Tambahkan Kategori</p>
              </DialogTitle>
              <div>
                <Input
                  value={kategori}
                  onChange={onTextChange}
                  placeholder={kategori ? "" : "Tryout"}
                  className="w-full"
                />
              </div>

              <div>
                <Button
                  disabled={!kategori || isKategoriUploading}
                  className="mt-4 w-full"
                  onClick={uploadKategori}
                >
                  {isKategoriUploading && <Spinner />}
                  Kirim
                </Button>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default PostUpKategoriModal;
