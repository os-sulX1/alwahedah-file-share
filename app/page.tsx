"use client";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { api } from "@/convex/_generated/api";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/clerk-react";
import { SignInButton, useOrganization , useUser} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


import { z } from "zod"
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(5).max(200),
	file:z.custom<FileList >((val) => val instanceof FileList , 'Required').refine(files => files.length > 0 , 'Required'),
})




export default function Home() {
	const {toast} = useToast()
	const { organization , isLoaded } = useOrganization();
	const {user ,isLoaded : userIsLoaded}= useUser()
  let orgId : string  | undefined= undefined
  if(isLoaded  && userIsLoaded){
    orgId = organization?.id ?? user?.id
  }
	const generateUploadUrl = useMutation(api.files.generateUploadUrl)
	const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)

	const createFile = useMutation(api.files.createFile);
	const files = useQuery(api.files.getFiles, orgId  ? {orgId} : 'skip' );


	// 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
			file:undefined
    },
  })
	

  // 2. Define a submit handler.
 async function onSubmit(values: z.infer<typeof formSchema>) {
    const postUrl = await generateUploadUrl()
		const result = await fetch(postUrl,{
			method:'POST',
			headers:{'Content-Type':values.file[0].type},
			body:values.file[0]
		})
		const {storageId} = await result.json()
		if(!orgId) return
		await createFile({ name: values.title, fileId:storageId ,orgId, });
		form.reset()
		setIsFileDialogOpen(false)
		toast({
      variant:'success',
			title:'File uploaded successfully',
			description:'Now everyone can view your file'
		})
  }
const fileRef = form.register('file')





	return (
		<main className="container mx-auto pt-12 ">
			<div className="flex justify-between items-center">
			<h1 className="text-4xl font-bold">Your Files</h1>

			<Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
  <DialogTrigger asChild>
	<Button 
				onClick={() => {
          if(!orgId) return
					
				}}
			>
				Upload file
			</Button>
	</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="mb-8">Upload your file</DialogTitle>
      <DialogDescription>
			<Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="add your title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
				 <FormField
          control={form.control}
          name="file"
          render={() => (
						<FormItem>
							<FormLabel>
								File
							</FormLabel>
							<FormControl>
								<Input type="file" {...fileRef} />
							</FormControl>
							<FormMessage />
						</FormItem>
            
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting} className="flex gap-2">
          {form.formState.isSubmitting && (
            <Loader2 className=" h-4 w-4 animate-spin"/>
          )}
          
          Submit</Button>
      </form>
    </Form>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>



			
			</div>
      
			
			{files?.map((file) => {
				return (
					<div className="" key={file._id}>
						{file.name}
					</div>
				);
			})}
		</main>
	);
}
