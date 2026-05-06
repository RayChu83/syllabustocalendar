"use client";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import NavLink from "../../../../components/ui/NavLink";
import { AiOutlineMenu } from "react-icons/ai";
import { Tooltip, TooltipContent } from "../../../../components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { GoArrowRight } from "react-icons/go";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabaseBrowserClient as supabase } from "@/lib/supabase/browser";

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
        className={`py-4 px-6 flex items-center justify-between gap-8 fixed w-full top-0 z-50 transition-all duration-700 border-b border border-transparent ${
          scrolled || mobileNavOpen ? "backdrop-blur-lg" : ""
        }`}
      >
        <aside className="flex items-center justify-center gap-8">
          <Link className="flex items-center gap-0.5" href="/">
            <Image
              src="/logos/svg/advyna_colored_clear.svg"
              width={36}
              height={36}
              alt="Advyna Logo"
            />
            <h1 className="font-semibold text-xl text-neutral-700">Advyna</h1>
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
            href="/assignments"
            className="md:block! hidden!"
          >
            Assignments
          </NavLink>
          <NavLink
            pathname={pathname}
            href="/calendar"
            className="md:block! hidden!"
          >
            Calendar
          </NavLink>
        </aside>
        <aside className="flex items-center justify-center gap-8">
          <NavLink
            pathname={pathname}
            href="/semesters"
            className="md:block! hidden!"
          >
            Semesters
          </NavLink>
          <NavLink
            pathname={pathname}
            href="/classes"
            className="md:block! hidden!"
          >
            Classes
          </NavLink>
          <div className="flex items-center gap-4">
            <button
              className={cn(
                "rounded-full hover:brightness-90 text-sm px-5 py-2.5 bg-black text-white",
                mobileNavOpen ? "md:opacity-100 opacity-0" : null,
              )}
              onClick={handleSignOut}
            >
              Sign out
            </button>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="md:hidden block text-lg text-zinc-400 hover:text-zinc-300 active:text-zinc-300 transition-all duration-300 cursor-pointer"
                  onClick={() => setMobileNavOpen((prev) => !prev)}
                >
                  <AiOutlineMenu />
                </button>
              </TooltipTrigger>
              <TooltipContent>Show menu</TooltipContent>
            </Tooltip>
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
        "backdrop-blur-lg fixed top-17 w-full z-50 flex flex-col items-center justify-between transition-all duration-700 md:-left-full",
        !mobileNavOpen ? "-left-full" : "left-0",
      )}
      style={{ height: "calc(100dvh - 74px)" }}
    >
      <div className="flex flex-col items-center justify-between w-full p-4 gap-2">
        <NavLink
          pathname={pathname}
          href="/dashboard"
          className={`w-full flex items-center justify-between p-4 transition-all duration-300 hover:bg-white/10 active:bg-white/10`}
          onClick={() => {
            setMobileNavOpen(false);
          }}
        >
          Dashboard <GoArrowRight className="text-xl" />
        </NavLink>
        <NavLink
          pathname={pathname}
          href="/assignments"
          className={`w-full flex items-center justify-between p-4 transition-all duration-300 hover:bg-white/10 active:bg-white/10`}
          onClick={() => {
            setMobileNavOpen(false);
          }}
        >
          Assignments <GoArrowRight className="text-xl" />
        </NavLink>
        <NavLink
          pathname={pathname}
          href="/calendar"
          className={`w-full flex items-center justify-between p-4 transition-all duration-300 hover:bg-white/10 active:bg-white/10`}
          onClick={() => {
            setMobileNavOpen(false);
          }}
        >
          Calendar <GoArrowRight className="text-xl" />
        </NavLink>
        <NavLink
          pathname={pathname}
          href="/semesters"
          className={`w-full flex items-center justify-between p-4 transition-all duration-300 hover:bg-white/10 active:bg-white/10`}
          onClick={() => {
            setMobileNavOpen(false);
          }}
        >
          Semesters <GoArrowRight className="text-xl" />
        </NavLink>
        <NavLink
          pathname={pathname}
          href="/classes"
          className={`w-full flex items-center justify-between p-4 transition-all duration-300 hover:bg-white/10 active:bg-white/10`}
          onClick={() => {
            setMobileNavOpen(false);
          }}
        >
          Classes <GoArrowRight className="text-xl" />
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
