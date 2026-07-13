"use client";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import NavLink from "../../../../components/ui/NavLink";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabaseBrowserClient as supabase } from "@/lib/supabase/browser";
import { HiMiniBars2 } from "react-icons/hi2";
import { MdArrowOutward } from "react-icons/md";

export default function NavMenu() {
  // state used for determining whether the user scrolled (navbar white background)
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const pathname = usePathname();

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const hasScroll =
      document.documentElement.scrollHeight > window.innerHeight;
    // if scroll position is 0.02 of the screen and there is a scrollbar on page, set scrolled = true
    setScrolled(latest > 0.02 && hasScroll);
  });

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Failed to sign out", { description: error.message });
      }
    } catch {
      toast.error("Failed to sign out", {
        description: "An unexpected error had occurred. Please try again",
      });
    }
  };

  return (
    <motion.nav>
      <motion.header
        className={`py-4 px-6 left-1/2 -translate-x-1/2 flex items-center justify-between gap-8 fixed w-full top-0 z-50 transition-all duration-700 bg-white ${
          scrolled || mobileNavOpen ? "drop-shadow-xs" : ""
        }`}
      >
        <aside className="flex items-center justify-center gap-6">
          <Link className="flex items-center gap-0.5" href="/">
            {/* <HiOutlineBookOpen size={24} className="text-neutral-700" /> */}
            <Image src="/logos/logo1.png" alt="logo" width={24} height={24} />
          </Link>
          <NavLink
            pathname={pathname}
            href="/dashboard"
            className="md:block! hidden!"
          >
            Dashboard
          </NavLink>
          <NavLink
            pathname={pathname}
            href="/calendar"
            className="md:block! hidden!"
          >
            Calendars
          </NavLink>
        </aside>
        <aside className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-6">
            <button
              className={cn(
                "text-sm text-red-700 flex items-center gap-1.5",
                mobileNavOpen ? "md:opacity-100 opacity-0" : null,
              )}
              onClick={handleSignOut}
            >
              Sign out <MdArrowOutward />
            </button>
            <button
              className="md:hidden block text-lg text-neutral-700 transition-all duration-300 cursor-pointer"
              onClick={() => setMobileNavOpen((prev) => !prev)}
            >
              <HiMiniBars2 />
            </button>
          </div>
        </aside>
      </motion.header>
      <MobileNavMenu
        pathname={pathname}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
        handleSignOut={handleSignOut}
      />
    </motion.nav>
  );
}
function MobileNavMenu({
  pathname,
  mobileNavOpen,
  setMobileNavOpen,
  handleSignOut,
}: {
  pathname: string;
  mobileNavOpen: boolean;
  setMobileNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSignOut: () => void;
}) {
  return (
    <section
      className={cn(
        "bg-white fixed top-13 w-full z-50 flex flex-col items-center justify-between transition-all duration-700 md:-left-full",
        !mobileNavOpen ? "-left-full" : "left-0",
      )}
      style={{ height: "calc(100dvh - 56px)" }}
    >
      <div className="flex flex-col items-center justify-between w-full p-4 gap-2 h-fit overflow-auto">
        <NavLink
          pathname={pathname}
          href="/dashboard"
          className={`w-full flex items-center justify-between p-4 transition-all duration-300 hover:bg-white/10 active:bg-white/10 text-base`}
          onClick={() => {
            setMobileNavOpen(false);
          }}
        >
          Dashboard <MdArrowOutward className="text-xl" />
        </NavLink>
        <NavLink
          pathname={pathname}
          href="/assignments"
          className={`w-full flex items-center justify-between p-4 transition-all duration-300 hover:bg-white/10 active:bg-white/10 text-base`}
          onClick={() => {
            setMobileNavOpen(false);
          }}
        >
          Assignments <MdArrowOutward className="text-xl" />
        </NavLink>
        <NavLink
          pathname={pathname}
          href="/calendar"
          className={`w-full flex items-center justify-between p-4 transition-all duration-300 hover:bg-white/10 active:bg-white/10 text-base`}
          onClick={() => {
            setMobileNavOpen(false);
          }}
        >
          Calendar <MdArrowOutward className="text-xl" />
        </NavLink>
        <NavLink
          pathname={pathname}
          href="/semesters"
          className={`w-full flex items-center justify-between p-4 transition-all duration-300 hover:bg-white/10 active:bg-white/10 text-base`}
          onClick={() => {
            setMobileNavOpen(false);
          }}
        >
          Semesters <MdArrowOutward className="text-xl" />
        </NavLink>
        <NavLink
          pathname={pathname}
          href="/classes"
          className={`w-full flex items-center justify-between p-4 transition-all duration-300 hover:bg-white/10 active:bg-white/10 text-base`}
          onClick={() => {
            setMobileNavOpen(false);
          }}
        >
          Classes <MdArrowOutward className="text-xl" />
        </NavLink>
      </div>
      <div className="p-4 w-full">
        <button
          className={cn("p-5 rounded-full bg-black w-full text-white")}
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </div>
    </section>
  );
}
