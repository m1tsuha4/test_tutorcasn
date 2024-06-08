import LayoutDashboard from "../../layout";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import PostUpKategoriModal from "./modalKategori";
import PostUpSubKategoriModal from "./modalSubKategori";

export default function Kategori() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<
    string | null
  >(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    refetch: refetchCategories,
  } = api.category.getAllCategories.useQuery();

  const { data: subcategories, refetch: refetchSubCategories } =
    api.subcategory.getAllSubcategories.useQuery();

  const deleteCategoryMutation = api.category.deleteCategory.useMutation();
  const deleteSubCategoryMutation =
    api.subcategory.deleteSubcategory.useMutation();

  const handleDelete = async () => {
    if (selectedCategoryId) {
      try {
        await deleteCategoryMutation.mutateAsync({ id: selectedCategoryId });
        refetchCategories();
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
      closeAndClear();
    }
  };

  const handleDeleteSub = async () => {
    if (selectedSubCategoryId) {
      try {
        await deleteSubCategoryMutation.mutateAsync({
          id: selectedSubCategoryId,
        });
        refetchSubCategories();
      } catch (error) {
        console.error("Failed to delete subcategory:", error);
      }
      closeAndClear();
    }
  };

  const closeAndClear = () => {
    setIsOpen(false);
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
  };

  if (isCategoriesLoading) return <Spinner />;

  return (
    <LayoutDashboard>
      <div className="mx-auto flex w-full max-w-5xl flex-col  ">
        <div className="flex  justify-between items-center">
          <h1 className="  font-bold text-3xl"> Kategori</h1>
          <span className="flex gap-3">
            <PostUpKategoriModal refetchCategories={refetchCategories} />
            <PostUpSubKategoriModal
              refetchSubCategories={refetchSubCategories}
            />
          </span>
        </div>
        {/* kategori */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">No</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((category, index) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell className="text-right">
                  <button
                    className="p-1 duration-300 ease-in-out active:scale-110"
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setIsOpen(true);
                    }}
                  >
                    <Trash2 size={20} color="red" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <h1 className="mt-12 font-bold text-3xl">Subkategori</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">No</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Subkategori</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subcategories.map((cat, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{cat.category.name}</TableCell> 
                <TableCell>{cat.name}</TableCell> 
                <TableCell className="text-right">
                  <button
                    className="p-1 duration-300 ease-in-out active:scale-110"
                    onClick={() => {
                      setSelectedSubCategoryId(cat.id);
                      setIsOpen(true);
                    }}
                  >
                    <Trash2 size={20} color="red" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-lg">
              <p>Are you sure you want to delete this category?</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <button
                  className="w-full rounded bg-neutral-300 px-4 py-2 text-black hover:bg-gray-300"
                  onClick={closeAndClear}
                >
                  Cancel
                </button>
                <button
                  className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-700"
                  onClick={() => {
                    selectedCategoryId ? handleDelete() : handleDeleteSub();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutDashboard>
  );
}
