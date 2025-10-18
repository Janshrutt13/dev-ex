"use client";

import { use, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage(){
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const token = searchParams.get('token');

        if(token){
            //Save to local storage
            localStorage.setItem('token', token);
            router.push('/feed');
        }else{
            router.push('/login?error=auth_failed');
        }
    } , [searchParams , router]);

    return(
        <div className='flex h-screen w-full items-center justfiy-center'>
            <Loader2 className='h-8 w-8 animate-spin' />
            <p className='ml-4'>Authenticating..</p>
        </div>
    );
}