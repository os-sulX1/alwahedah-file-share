import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import React, { useState } from "react";
import { Button } from "./ui/button";
import {  EllipsisVertical, TrashIcon } from "lucide-react";
import { mutation } from "@/convex/_generated/server";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "./ui/use-toast";

const FileCardAction = ({file}:{file:Doc<'files'>}) =>{
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const deleteFile = useMutation(api.files.deleteFile)
  const  {toast} = useToast()
  return(
   <>

<AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={()=>{
        deleteFile({
          fileId:file._id
        })
        toast({
          variant:'default',
          title:"you have successfully delete the file from the system"
        })

      }} >Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

   
   <DropdownMenu>
  <DropdownMenuTrigger><EllipsisVertical /></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="flex gap-2 text-red-700 items-center cursor-pointer" onClick={()=> setIsConfirmOpen(true)}> <TrashIcon className="w-4 h-4 " /> Delete</DropdownMenuItem>

  </DropdownMenuContent>
</DropdownMenu>
   </>

  )
}




const FileCard =({file}:{file:Doc<'files'>})=>{
	return (
		<Card>
			<CardHeader className="relative">
				<CardTitle>{file.name} </CardTitle>
        <div className="absolute top-1 right-1"><FileCardAction file={file} /></div>
			</CardHeader>
			<CardContent>
				<p>Card Content</p>
			</CardContent>
			<CardFooter>
				<p>Card Footer</p>
        <Button >Download</Button>
			</CardFooter>
		</Card>
	);
}

export default FileCard;
