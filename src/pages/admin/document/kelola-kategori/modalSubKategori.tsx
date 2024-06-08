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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PostUpSubKategoriModalProps {
  refetchSubCategories: () => void;
}



function PostUpSubKategoriModal({ refetchSubCategories }: PostUpSubKategoriModalProps ) {
  const [kategori, setKategori] = useState<string>('');
  const [subKategori, setSubKategori] = useState<string>('');
  const [open, setOpen] = useState(false);

  const closeModal = () => setOpen(false);

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = api.category.getAllCategories.useQuery();

  const { isLoading: isSubKategoriUploading, mutateAsync: addSubkategori } = api.subcategory.addSubcategory.useMutation();

  const uploadSubkategori = async () => {
    if (!subKategori || !kategori) {
      toast({
        title: 'Error',
        description: 'Please enter both category and subcategory.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addSubkategori({ name: subKategori, categoryId: kategori });
      toast({
        title: 'Success',
        description: 'Subcategory added successfully.',
      });
      closeModal();
      setKategori('');
      setSubKategori('');
      refetchSubCategories();
    } catch (error) {
      const message = error instanceof TRPCError ? error.message : 'An error occurred while adding the subcategory.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  if (categoriesLoading) return <Spinner />;
  if (categoriesError) return <div>Error loading categories.</div>;

  return (
    <div className="my-6 flex justify-end">
      <Dialog>
        <DialogTrigger>
          <div className={cn(buttonVariants())}>Tambah SubKategori</div>
        </DialogTrigger>
        <DialogContent hideClose={true}>
          <DialogHeader>
            <DialogTitle>
              <p className="mb-4 text-center text-xl">Tambahkan Subkategori</p>
            </DialogTitle>
            <div className="flex flex-col gap-4">
              <label> Kategori</label>
              <Select value={kategori} onValueChange={setKategori}>
                <SelectTrigger className="w-full px-3">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id} 
                     onSelect={() =>{
                      setKategori(category.id)}
                    }
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label> Subkategori</label>
              <Input value={subKategori} onChange={(e) => setSubKategori(e.target.value)} placeholder="Subkategori" />
            </div>

            <div>
              <Button className="mt-4 w-full" onClick={uploadSubkategori} disabled={!subKategori || isSubKategoriUploading}>
                {isSubKategoriUploading ? <Spinner /> : 'Submit'}
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default PostUpSubKategoriModal;
