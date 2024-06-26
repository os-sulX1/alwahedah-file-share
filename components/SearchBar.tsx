"use client";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";


import { z } from "zod";
import { Dispatch, SetStateAction, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, SearchIcon } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";

const formSchema = z.object({
	query: z.string().min(0).max(200),
});

const SearchBar = ({query ,setQuery} : {query:string , setQuery:Dispatch<SetStateAction<string>>}) => {
	const { toast } = useToast();
	const { organization, isLoaded } = useOrganization();
	const { user, isLoaded: userIsLoaded } = useUser();
	let orgId: string | undefined = undefined;
	if (isLoaded && userIsLoaded) {
		orgId = organization?.id ?? user?.id;
	}
	const generateUploadUrl = useMutation(api.files.generateUploadUrl);
	const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

	const createFile = useMutation(api.files.createFile);

	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			query: "",
		},
	});

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof formSchema>) {
		setQuery(values.query)
	}
  return (
    <div className="">
     	<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="flex gap-4"
							>
								<FormField
									control={form.control}
									name="query"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input placeholder="Your file name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								
								<Button
								size={'sm'}
									type="submit"
									disabled={form.formState.isSubmitting}
									className="flex gap-2"
								>
									{form.formState.isSubmitting && (
										<Loader2 className=" h-4 w-4 animate-spin" />
									)}
									<SearchIcon /> Search
								</Button>
							</form>
						</Form>
    </div>
  )
}

export default SearchBar