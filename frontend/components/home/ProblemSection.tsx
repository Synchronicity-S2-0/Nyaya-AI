export function ProblemSection() {
  return (
    <section 
      className="w-full py-section-gap bg-surface-container-lowest relative z-30" 
      id="the-problem" 
      style={{ background: 'linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(255, 252, 248) 100%)' }}
    >
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-gutter items-center">
          {/* Left Column (40%) */}
          <div className="md:col-span-5 flex flex-col justify-center order-2 md:order-1 text-left">
            <h2 className="font-instrument text-display-lg-mobile md:text-display-lg text-black tracking-wide mb-8 leading-[1.1]">
              <span className="text-primary italic">Most legal problems</span>{" "}
              <span className="text-secondary italic opacity-60">begin uncertainly.</span>
            </h2>
            <div className="font-body-lg text-body-lg text-secondary leading-[1.45]">
              <p>
                People receive notices, contracts, agreements and legal communications every day without knowing what they mean, how urgent they are, or what actions they require.
              </p>
            </div>
          </div>
          
          {/* Right Column (60%) */}
          <div className="md:col-span-7 order-1 md:order-2 flex justify-center">
            <img 
              alt="Abstract legal scales and pillars" 
              className="w-full h-auto object-cover rounded-[2rem]" 
              src="https://lh3.googleusercontent.com/aida/ADBb0uh2tnoFWUN2vUTTW9qKUYa2AObAlsMgmQTHgE73FhTdq-1RcC5mNPc9UtuFTBP8d0PvjOjXabJqpnvub-QGTB8ziburYaDQjjnjIfVfWm2nBu9MzYfXmmGDrNtUEkfVaRIh5l1uI7Y3zw538r10nW0vAsQSX2jgVvNIY1f5uarH9MeDP0CwT1h2wd8sRVa2_kMMxc-uNfTU0zELoaOWEZx11bkUBXrxAoPwb9ErhMgWh3UYK4W22m3nvg0" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
