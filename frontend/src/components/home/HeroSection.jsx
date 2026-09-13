export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#edf2f4] px-3 py-3 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex min-h-[500px] items-end justify-start px-1 sm:min-h-[560px] lg:min-h-[620px]">
            <h1 className="max-w-[540px] font-black leading-[0.82] tracking-[-0.06em] text-[#071d30]">
              <span className="block text-[3.6rem] sm:text-[4.2rem] md:text-[4.9rem] lg:text-[5.6rem] xl:text-[6.7rem]">
                Need
              </span>
              <span className="block text-[3.6rem] sm:text-[4.2rem] md:text-[4.9rem] lg:text-[5.6rem] xl:text-[6.7rem]">
                help
              </span>
              <span className="block text-[3.6rem] sm:text-[4.2rem] md:text-[4.9rem] lg:text-[5.6rem] xl:text-[6.7rem]">
                with
              </span>
              <span className="block text-[3.6rem] sm:text-[4.2rem] md:text-[4.9rem] lg:text-[5.6rem] xl:text-[6.7rem] text-[#1f9fe5]">
                your AI
              </span>
              <span className="block text-[3.6rem] sm:text-[4.2rem] md:text-[4.9rem] lg:text-[5.6rem] xl:text-[6.7rem]">
                job
              </span>
              <span className="block text-[3.6rem] sm:text-[4.2rem] md:text-[4.9rem] lg:text-[5.6rem] xl:text-[6.7rem]">
                matching?
              </span>
            </h1>
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-[1080px] px-2 pb-2 text-left text-[0.9rem] leading-relaxed text-slate-700 sm:text-[1rem]">
        <p>
          We help job seekers, employers, and administrators resolve account, profile, CV, and AI matching issues faster.
        </p>
      </div>
    </section>
  );
}