import { useState } from "react";
import Layout from "../../layout";
import HeadingBahanAjar from "./heading";
import DocumentByCategory from "./DocumentByCategory";

export default function BahanAjarByCategory({ minimizeSidebar, setMinimizeSidebar }: any) {
    const [subCategoryId, setSubCategoryId] = useState<string>("");
    const [docsData, setDocsData] = useState<any[]>([]);
    const [sort, setSort] = useState<boolean>(false)

    return (
        <Layout minimizeSidebar={minimizeSidebar} setMinimizeSidebar={setMinimizeSidebar}>
            <div className="flex flex-col gap-2">
                <HeadingBahanAjar subCategoryId={subCategoryId} setSubCategoryId={setSubCategoryId} setDocsData={setDocsData} sort={sort} setSort={setSort} />
                <DocumentByCategory subCategoryId={subCategoryId} docsData={docsData} setDocsData={setDocsData} sort={sort} />
            </div>
        </Layout>
    );
}
