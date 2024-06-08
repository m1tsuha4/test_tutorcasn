"use client"
import { useParams, usePathname } from "next/navigation";
import Layout from "../layout";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import Card from "../_components/Card";
import DocumentSearch from "./DocumentSearch";


export default function SearchDocs({ minimizeSidebar, setMinimizeSidebar }: any) {


    return (
        <Layout minimizeSidebar={minimizeSidebar} setMinimizeSidebar={setMinimizeSidebar}>
            <DocumentSearch />
        </Layout>
    )
}