import {
	OrganizationSwitcher,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/nextjs";
import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";

function Header() {
	return (
		<div className="border-b flex  justify-between items-center  mx-8 pt-7 relative">
			<div className=" flex  w-60 container mx-auto uppercase font-extrabold">
			<Link href={'/'}>
      <div className="flex items-center gap-4">
				<Image width={40} height={40} alt="logo" src={"/logo.jpg"} />

					<p> file manger</p>
				</div>
      </Link>
			</div>
     
			<div className=" flex items-center justify-between gap-12 p-2 w-full">
        <div className="">
        <Button variant={"outline"} className="bg-slate-300" >
        <Link href={'/dashboard/files'} className="font-semibold" >Your file</Link>
      </Button>
        </div>
				<div className="">
        <OrganizationSwitcher />
				<UserButton />

				<SignedOut>
					<SignInButton>
						<Button className="border-gray-600 border-2">Sign IN</Button>
					</SignInButton>
				</SignedOut>
        </div>
			</div>
		</div>
	);
}

export default Header;
