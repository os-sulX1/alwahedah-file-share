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
import { format, formatDistance, formatRelative, subDays } from "date-fns";

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
	Undo2Icon,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useToast } from "./ui/use-toast";
import Image from "next/image";
import { api } from "@/convex/_generated/api";
import type { GenericId } from "convex/values";
import { Protect, UserProfile } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { formatRevalidate } from "next/dist/server/lib/revalidate";
import FileCardAction from "./FileActions";



const FileCard = ({
	file,
}: { file: Doc<"files"> &{isFavorited:boolean}}) => {
	const typeIcon = {
		image: <ImageIcon />,
		pdf: <TextIcon />,
		csv: <GanttChartIcon />,
	} as Record<Doc<"files">["type"], ReactNode>;

	const fileUrl = useQuery(api.files.getFilesImageURL, { fileId: file.fileId });

	const userProfile = useQuery(api.users.getUserprofile, {
		userId: file.userId,
	});

	

	return (
		<Card>
			<CardHeader className="relative  ">
				<CardTitle className="flex gap-2 text-base font-normal">
					<p>{typeIcon[file.type]}</p>

					{file.name}
				</CardTitle>
				<div className="absolute top-1 right-1">
					<FileCardAction isFavorited={file.isFavorited} file={file} />
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
				<div className="flex flex-col gap-y-8 w-full">
					<div className="flex items-center justify-center ">
						<Button onClick={() => window.open(fileUrl as string, "_blank")}>
							Download
						</Button>
					</div>

					<div className="flex w-full justify-between items-center ">
						<div className="flex items-center gap-1.5 ">
							<Avatar>
								<AvatarImage src={userProfile?.image} />
								<AvatarFallback>CN</AvatarFallback>
							</Avatar>

							<h4 className="text-xs font-bold">{userProfile?.name}</h4>
						</div>
						<div className="">
							<p className="text-xs font-semibold">
								{formatRelative(new Date(file._creationTime), new Date())}
							</p>
						</div>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
};

export default FileCard;
