"use client";


import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { Shield } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import React from 'react'

function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  return (
    <div className={`p-4 flex justify-between items-center 
      ${isHomePage ? "bg-blue-50" : "bg-white border-b border-blue-50"}
    `}>
      <Link href="/" className='flex items-center'>
        <Shield className='w-6 h-6 mr-2 text-blue-500'/> 
        <h1 className='text-xl font-semibold'>Expencio</h1>
      </Link>
      <div className='flex items-center space-x-4'>
        <SignedIn>
          <Link href="/receipts">
            <button className="border bg-white border-gray-300 px-4 py-2 rounded-[5px] cursor-pointer text-sm">My Reciepts</button>
          </Link>

          <Link href="/manage-plan">
            <button className="bg-black text-white px-4 py-2 rounded-[5px] cursor-pointer text-sm">Manage Plan</button>
          </Link>


          <UserButton />
        </SignedIn>

        <SignedOut>
          <SignInButton mode='modal'>
            <button className="bg-black text-white px-4 py-2 rounded-[5px] cursor-pointer text-sm">Login</button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  )
}

export default Header
