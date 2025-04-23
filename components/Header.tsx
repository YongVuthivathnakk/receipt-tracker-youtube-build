import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { Shield } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function Header() {
  return (
    <div className="p-4 flex justify-between items-center">
      <Link href="/" className='flex items-center'>
        <Shield className='w-6 h-6 mr-2 text-blue-500'/> 
        <h1 className='text-xl font-semibold'>Expencio</h1>
      </Link>
      <div>
        <SignedIn>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <SignInButton mode='modal'>
            
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  )
}

export default Header
