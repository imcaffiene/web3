
import React from 'react';
import Link from 'next/link';


const Hero = () => {


  return (

    <section className='relative h-full'>

      {/* Updated hero content */}
      <div className="relative z-10 flex flex-col h-full justify-center flex-grow p-16">
        <div className="text-white max-w-2xl">
          <p className="font-manrope text-md mb-6 text-white/80">
            Innovate without boundaries.
          </p>

          <h1 className="font-libre-caslon font-light text-5xl md:text-6xl lg:text-[4.5rem] leading-tight mb-8 text-left">
            Future-Proof Your <br />
            Digital Infrastructure
          </h1>
        </div>
      </div>

      {/* Updated footer text */}
      <div className="relative flex items-end justify-between z-10 text-white text-left p-16 pt-0">

        <p className="font-manrope text-sm text-white/70 max-w-md leading-relaxed text-left">
          Design and Developed by{" "}
          <Link
            href={"https://github.com/imcaffiene"}
            className="font-bold hover:underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sumit
          </Link>
        </p>
      </div>

    </section>


  );
};

export default Hero;

