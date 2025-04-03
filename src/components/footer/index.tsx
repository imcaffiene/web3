import Link from "next/link";
import React from "react";

export function Footer() {
  return (
    <footer className='max-w-7xl mx-auto border-t px-4'>
      <div className='flex justify-between py-8'>
        <p className='text-primary tracking-tight'>
          Designed and Developed by{" "}
          <Link
            href={"https://github.com/nothing-available"}
            className='font-bold'>
            Sumit
          </Link>
        </p>
      </div>
    </footer>
  );
  
}
