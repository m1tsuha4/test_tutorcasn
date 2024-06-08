import { api } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import image from "../../../_assest/image 36.png";
import Card from "../../_components/Card";

export default function DocumentByCategory({
  subCategoryId,
  docsData,
  setDocsData,
  sort
}: any) {
  const params = useParams();

  const [loading, setLoading] = useState<boolean>(true);

  // Get Data By CategoryId
  const {
    data: documentByCategory,
    error,
    isLoading,
  }: any = api.document.getDocumentByCategoryId.useQuery(`${params?.category}`);

  // Log any data fetched
  // if (documentByCategory) {
  //   console.log(documentByCategory);
  // }

  // Get Data By CategoryId and SubCategoryId
  const {
    data: documentByCategoryAndSubcategory,
    refetch,
    error: error2,
  }: any = api.document.getDocumentByCategoryAndSubId.useQuery({
    categoryId: `${params?.category}`,
    subCategoryId: subCategoryId,
  });

  // Handle errors for the second query
  if (error2) {
    console.log(error2);
  }

  // Log data if available
  if (documentByCategoryAndSubcategory) {
    console.log(documentByCategoryAndSubcategory);
  }

  // Refetch on subCategoryId change
  useEffect(() => {
    setLoading(true);
    refetch();
  }, [subCategoryId]);

  // Set document data accordingly if subCategoryId is provided or not

  useEffect(() => {
    if (!sort) {
      if (subCategoryId) {
        setDocsData(documentByCategoryAndSubcategory);
        setLoading(false);
      } else {
        setDocsData(documentByCategory);
        setLoading(false);
      }
    }

  }, [documentByCategory, documentByCategoryAndSubcategory]);

  // Constructing href, checking for undefined or empty values
  const constructHref = () => {
    if (!params?.category || !subCategoryId) {
      return `/bahanAjar/${params?.category || ''}${subCategoryId || ''}`;
    }
    return `/bahanAjar/${params.category}${subCategoryId}`;
  };

  return (
    <div className="grid grid-cols-4 gap-[1rem] font-[600]">
      {docsData?.length !== 0 ? (
        <Card data={docsData} href={`/bahanAjar/${params?.category}`} />
      ) : (
        <>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <p>Tidak ada dokumen yang sesuai...</p>
          )}
        </>
      )}
    </div>
  );
}