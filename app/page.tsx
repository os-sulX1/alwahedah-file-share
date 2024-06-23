"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/clerk-react";
import { SignInButton, useOrganization , useUser} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";

/**
 * 
 * 
 * 
 * <SignedIn>
				<SignOutButton />
			</SignedIn>

			<SignedOut>
				<SignInButton mode="modal" />
			</SignedOut>
 */

export default function Home() {
	const { organization , isLoaded } = useOrganization();
	const {user ,isLoaded : userIsLoaded}= useUser()
  let orgId : string  | undefined= undefined
  if(isLoaded  && userIsLoaded){
    orgId = organization?.id ?? user?.id
  }

	const createFile = useMutation(api.files.createFile);
	const files = useQuery(api.files.getFiles, orgId  ? {orgId} : 'skip' );
	return (
		<main className="flex gap-2.5 min-h-screen flex-col items-center justify-center">
      
			
			{files?.map((file) => {
				return (
					<div className="" key={file._id}>
						{file.name}
					</div>
				);
			})}

			<Button
				onClick={() => {
          if(!orgId) return
					createFile({ name: "hi, all", orgId });
				}}
			>
				Click me
			</Button>
		</main>
	);
}
