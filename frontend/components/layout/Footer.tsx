import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-surface dark:bg-surface-container-lowest w-full py-section-gap border-t border-surface-container dark:border-on-surface-variant/10 flat no shadows">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto gap-8 md:gap-0">
        <div className="font-headline-sm text-[24px] leading-[32px] text-primary">
          Nyaya AI
        </div>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          <Link
            href="#"
            className="font-label-md text-label-md text-secondary dark:text-on-secondary-container hover:text-primary dark:hover:text-primary-fixed underline-offset-4 hover:underline transition-opacity duration-300 uppercase tracking-widest"
          >
            Privacy
          </Link>
          <Link
            href="#"
            className="font-label-md text-label-md text-secondary dark:text-on-secondary-container hover:text-primary dark:hover:text-primary-fixed underline-offset-4 hover:underline transition-opacity duration-300 uppercase tracking-widest"
          >
            Terms
          </Link>
          <Link
            href="#"
            className="font-label-md text-label-md text-secondary dark:text-on-secondary-container hover:text-primary dark:hover:text-primary-fixed underline-offset-4 hover:underline transition-opacity duration-300 uppercase tracking-widest"
          >
            Ethical AI
          </Link>
          <Link
            href="#"
            className="font-label-md text-label-md text-secondary dark:text-on-secondary-container hover:text-primary dark:hover:text-primary-fixed underline-offset-4 hover:underline transition-opacity duration-300 uppercase tracking-widest"
          >
            Contact
          </Link>
        </div>
        <div className="font-label-md text-label-md text-secondary dark:text-on-secondary-container tracking-widest uppercase text-center md:text-right mt-8 md:mt-0">
          © 2024 Nyaya AI. Editorial Legal Intelligence.
        </div>
      </div>
    </footer>
  );
}
