export function HeroSection() {
  return (
    <section
      className={'mx-auto max-w-7xl px-6 md:px-8 relative flex items-center justify-between mt-12 md:mt-16 mb-12'}
    >
      <div className={'text-center w-full '}>
        <h1
          className={
            'text-4xl leading-tight md:text-[80px] md:leading-[80px] tracking-tight md:tracking-[-1.6px] font-medium'
          }
        >
          চ্যালেঞ্জ সমাধান করো।
          <br />
          ফ্ল্যাগ জিতে নাও।
        </h1>
        <p className={'mt-6 text-base md:text-[20px] md:leading-[30px] max-w-3xl mx-auto'}>
          শিক্ষানবিস থেকে প্রো—প্রতিটি হ্যাকার টিমের জন্য মজার CTF প্রতিযোগিতা এবং অংশগ্রহণকারীদের জন্য অফিসিয়াল
          সার্টিফিকেট।
        </p>
      </div>
    </section>
  );
}
