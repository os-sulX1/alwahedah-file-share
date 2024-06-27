import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import React, { type ReactNode, useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
	EllipsisVertical,
	GanttChartIcon,
	ImageIcon,
	StarHalf,
	StarIcon,
	TextIcon,
	TrashIcon,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useToast } from "./ui/use-toast";
import Image from "next/image";
import { api } from "@/convex/_generated/api";
import type { GenericId } from "convex/values";
import { Protect } from "@clerk/nextjs";


const FileCardAction = ({ file ,isFavorites }: { file: Doc<"files">,isFavorites:boolean }) => {
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const deleteFile = useMutation(api.files.deleteFile);
	const toggleFavorite = useMutation(api.files.toggleFavorite)
	const { toast } = useToast();
	return (
		<>
			<AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete your
							account and remove your data from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								deleteFile({
									fileId: file._id,
								});
								toast({
									variant: "default",
									title:
										"you have successfully delete the file from the system",
								});
							}}
						>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<DropdownMenu>
				<DropdownMenuTrigger>
					<EllipsisVertical />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="flex gap-2 text-black items-center cursor-pointer"
						onClick={() => {
							toggleFavorite({
								fileId:file._id
							})
						}}
					>
						{" "}
						{ isFavorites ? (
							<>
														<StarIcon className="w-4 h-4 " /> <p>Unfavorite</p>

							</>
						) : (
							<>
							<StarHalf className="w-4 h-4 " /> <p>favorite</p>

</>						)
						}
					</DropdownMenuItem>
					{/* biome-ignore lint/a11y/useValidAriaRole: <explanation> */}
					{
						/*
						{<Protect
					role="org:admin"
					fallback={<div />}
					 >
						
						**/
					}

							<DropdownMenuSeparator />
					<DropdownMenuItem
						className="flex gap-2 text-red-700 items-center cursor-pointer"
						onClick={() => setIsConfirmOpen(true)}
					>
						{" "}
						<TrashIcon className="w-4 h-4 " /> Delete
					</DropdownMenuItem>
						{/**
						 * 	</Protect>}
						 * 
						 */}
					
				
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};

const FileCard = ({ file ,favorites }: { file: Doc<"files">,favorites:Doc<"favorites"> }) => {
	const typeIcon = {
		image: <ImageIcon />,
		pdf: <TextIcon />,
		csv: <GanttChartIcon />,
	} as Record<Doc<"files">["type"], ReactNode>;

	const fileUrl = useQuery(api.files.getFilesImageURL, { fileId: file.fileId });

	const isFavorites = favorites.some((favorites: { fileId: GenericId<"files">; }) => favorites.fileId === file._id)

	return (
		<Card>
			<CardHeader className="relative  ">
				<CardTitle className="flex gap-2">
					<p>{typeIcon[file.type]}</p>

					{file.name}
				</CardTitle>
				<div className="absolute top-1 right-1">
					<FileCardAction isFavorites={isFavorites} file={file} />
				</div>
			</CardHeader>
			<CardContent className="relative h-52 flex items-center justify-center">
				{file.type === "image" && (
					<Image alt={file.name} fill src={fileUrl as string} />
				)}

				{file.type === "csv" && <GanttChartIcon className="w-20 h-20" />}
				{file.type === "pdf" && <TextIcon className="w-40 h-40 " />}
			</CardContent>
			<CardFooter className="flex justify-center items-center">
				<p>Card Footer</p>
				<Button onClick={() => window.open(fileUrl as string, "_blank")}>
					Download
				</Button>
			</CardFooter>
		</Card>
	);
};

export default FileCard;
