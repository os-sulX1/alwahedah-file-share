"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";

import { useToast } from "@/components/ui/use-toast";
import UploadButton from "@/components/UploadButton";
import FileCard from "@/components/FileCard";
import Image from "next/image";
import { Grid2X2Icon, Loader2, Table2Icon } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { useState } from "react";
import React from "react";
import { DataTable } from "./FileTable";
import { columns } from "./Columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Doc } from "@/convex/_generated/dataModel";

function FileBox({
	title,
	favoritesOnly,
	deletedOnly,
}: { title: string; favoritesOnly?: boolean; deletedOnly?: boolean }) {
	const { toast } = useToast();
	const { organization, isLoaded } = useOrganization();
	const { user, isLoaded: userIsLoaded } = useUser();
	let orgId: string | undefined = undefined;
	const [query, setQuery] = useState("");
	const [type , setType] = useState<Doc<'files'>['type'] | 'all'>('all')

	if (isLoaded && userIsLoaded) {
		orgId = organization?.id ?? user?.id;
	}

	const favorites = useQuery(
		api.files.getAllFavorites,
		orgId ? { orgId } : "skip",
	);
	const files = useQuery(
		api.files.getFiles,
		orgId
			? { orgId, type : type ==='all'? undefined : type, query, favorites: favoritesOnly, deletedOnly: deletedOnly }
			: "skip",
	);
	const isLoading = files === undefined;

	const modifiedFiles =
		files?.map((file) => ({
			...file,
			isFavorited: (favorites ?? []).some(
				(favorite) => favorite.fileId === file._id,
			),
		})) ?? [];

	return (
		<>
			{isLoading && (
				<div className="flex flex-col items-center justify-center pt-32 text-gray-400">
					<Loader2 className="w-32 h-32 animate-spin" />
					<p className="text-2xl">Loading your files ...</p>
				</div>
			)}
			{!isLoading && (
  <>
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-bold">{title}</h1>
      <SearchBar query={query} setQuery={setQuery} />
      <UploadButton />
    </div>
	
    <div className="p-4 rounded-lg">
      <Tabs defaultValue="grid">
        <TabsList className="flex justify-around relative">
          <TabsTrigger value="grid" className="p-4 bg-gray-800 text-white rounded-lg h-full" >
            <Grid2X2Icon className="w-3 h-3" />Grid View
          </TabsTrigger>
          <TabsTrigger value="table" className="p-4 bg-gray-800 text-white rounded-lg">
             <Table2Icon className="w-3 h-3" />  Table View
          </TabsTrigger>
        </TabsList>
				<div className=" grid-cols-4 flex justify-between pt-3 h-full">
					<div/>
						<div className="flex items-center gap-3">
							<h4 className="font-semibold">File type</h4>
							<Select  value={type} onValueChange={(newType => {
			setType(newType as any)
		})} >
  <SelectTrigger className="w-[180px]" defaultValue={'all'}  >
    <SelectValue  />
  </SelectTrigger>
  <SelectContent>
	<SelectItem value="all">All</SelectItem>
    <SelectItem value="image">Image</SelectItem>
    <SelectItem value="pdf">Pdf</SelectItem>
    <SelectItem value="csv">CSV</SelectItem>
  </SelectContent>
</Select>
						</div>

		</div>
        <TabsContent value="grid">
          <div className="grid grid-cols-3 gap-4 mt-4">
            {modifiedFiles?.map((file) => (
              <FileCard key={file._id} file={file} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="table">
          <div className="mt-4">
            <DataTable columns={columns} data={modifiedFiles}  />
          </div>
        </TabsContent>
      </Tabs>
    </div>
    {files?.length === 0 && <PlaceHolderState />}
  </>
)}

		</>
	);
}

export default FileBox;

const PlaceHolderState = () => {
	return (
		<div className="col-span-3">
			<Image
				alt="an Image of a picture and directory icon "
				height={"0"}
				width={"0"}
				sizes="100vw"
				style={{ width: "100%", height: "auto" }} // optional
				className=" h-72 w-72 cover"
				src={"/no-state.svg"}
			/>
			<p className=" text-4xl font-semibold text-center pt-3">
				You have no files , upload now{" "}
			</p>
			<div className="text-center mt-7">
				{" "}
				<UploadButton />
			</div>
		</div>
	);
};
