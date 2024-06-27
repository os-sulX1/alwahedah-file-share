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

const FileCardAction = ({
	file,
	isFavorited,
}: { file: Doc<"files">; isFavorited: boolean }) => {
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const deleteFile = useMutation(api.files.deleteFile);
	const restoreFile = useMutation(api.files.restoreFile);
	const toggleFavorite = useMutation(api.files.toggleFavorite);

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
								fileId: file._id,
							});
						}}
					>
						{" "}
						{isFavorited ? (
							<>
								<StarIcon className="w-4 h-4 " /> <p>Unfavorite</p>
							</>
						) : (
							<>
								<StarHalf className="w-4 h-4 " /> <p>favorite</p>
							</>
						)}
					</DropdownMenuItem>

					{/* biome-ignore lint/a11y/useValidAriaRole: <explanation> */}
					<Protect role="org:admin" fallback={<div />}>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="flex gap-2 text-red-700 items-center cursor-pointer"
							onClick={() => {
								if (file.shouldDelete) {
									restoreFile({
										fileId: file._id,
									});
								} else {
									setIsConfirmOpen(true);
								}
							}}
						>
							{" "}
							{file.shouldDelete ? (
								<>
									<Undo2Icon className="w-4 h-4 text-green-500" />{" "}
									<p className="text-green-500">Restore</p>
								</>
							) : (
								<>
									<TrashIcon className="w-4 h-4 " />
									<p className="text-red-700">Delete</p>
								</>
							)}
						</DropdownMenuItem>
					</Protect>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};

export default FileCardAction;
