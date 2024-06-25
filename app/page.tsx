"use client";

import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";

import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import UploadButton from "@/components/UploadButton";
import FileCard from "@/components/FileCard";
import Image from "next/image";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
	title: z.string().min(5).max(200),
	file: z
		.custom<FileList>((val) => val instanceof FileList, "Required")
		.refine((files) => files.length > 0, "Required"),
});

export default function Home() {
	const { toast } = useToast();
	const { organization, isLoaded } = useOrganization();
	const { user, isLoaded: userIsLoaded } = useUser();
	let orgId: string | undefined = undefined;
	if (isLoaded && userIsLoaded) {
		orgId = organization?.id ?? user?.id;
	}

	const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");

	return (
		<main className="container mx-auto pt-12 ">
			{files === undefined && (
				<div className="flex flex-col items-center justify-center pt-32 text-gray-400">
					<Loader2 className="w-32 h-32 animate-spin" />
				<p className="text-2xl">Loading ...</p>
				</div>
			
			)}
			{files && files.length > 0 && (
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-4xl font-bold">Your Files</h1>

					<UploadButton />
				</div>
			)}

			<div className="grid grid-cols-3 gap-4  ">
				{files && files.length === 0 && (
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
				)}
				{files?.map((file) => {
					return <FileCard key={file._id} file={file} />;
				})}
			</div>
		</main>
	);
}
