import { OrganizationSwitcher, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import React from 'react'
import { Button } from './ui/button'

function Header() {
  return (
    <div className='border-b flex justify-between items-center  mx-8 pt-7'>
      <div className="container mx-auto uppercase font-extrabold">
        <p>AL-Wahedah file manger</p>
      </div>
      <div className=" flex  items-center justify-center  gap-12 p-2">
      <OrganizationSwitcher />
      <UserButton />

      <SignedOut>
        <SignInButton>
          <Button className='border-gray-600 border-2'>
            Sign IN
          </Button>
        </SignInButton>
      </SignedOut>

      </div>
    </div>
  )
}

export default Header