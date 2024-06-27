'use client'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { FileIcon, StarIcon, Trash2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

function SideNav() {
  const pathname = usePathname()

  return (
    <div className="w-40 space-y-7">
    <Link href={'/dashboard/files'}>
    <Button variant={'link'} className={clsx('flex gap-3 justify-start',{
      'text-blue-600':pathname.includes('/dashboard/files')
    } )}><FileIcon /> All Files </Button>
    </Link>

    <Link href={'/dashboard/favorites'}>
    <Button variant={'link'} className={clsx('flex gap-3 justify-start',{
      'text-blue-600':pathname.includes('/dashboard/favorite')
    } )}><StarIcon /> Favorite </Button>
    </Link>

    <Link href={'/dashboard/trash'}>
    <Button variant={'link'} className={clsx('flex gap-3 justify-start',{
      'text-blue-600':pathname.includes('/dashboard/trash')
    } )}><Trash2 /> Trash </Button>
    </Link>
    
  </div>
  )
}

export default SideNav