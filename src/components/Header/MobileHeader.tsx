import { useState } from "react";
import { Squash as Hamburger } from "hamburger-react";
import {
  SignUpButton,
  SignInButton,
  useAuth,
  useUser,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "../ui/button";
import { useRouter } from "next/router";
import { FaGuitar } from "react-icons/fa";
import { IoTelescopeOutline } from "react-icons/io5";

function MobileHeader() {
  const [isOpen, setOpen] = useState(false);
  const { userId, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const { asPath } = useRouter();

  return (
    <div
      style={{
        height: isOpen ? "15.75rem" : "4rem",
        boxShadow: isOpen
          ? // these are roughly tailwind shadow-md values
            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
          : "0 4px 6px -1px transparent, 0 2px 4px -2px transparent",
      }}
      className="absolute flex h-full w-full items-start justify-between overflow-clip p-2 transition-all md:hidden"
    >
      <Link
        href={"/"}
        className="rounded-md bg-pink-800 px-10 py-2 text-2xl"
        onClick={() => setOpen(false)}
      >
        Tabsly
      </Link>
      <Hamburger
        toggled={isOpen}
        toggle={setOpen}
        color="#fdf2f8"
        rounded
        size={28}
      />

      <div className="mobileNavbarGlassmorphic absolute left-0 top-16 h-48 w-full transition-all">
        <div className="baseVertFlex h-full items-center justify-center gap-4">
          <Button
            variant={"navigation"}
            size={"lg"}
            style={{
              backgroundColor: asPath.includes("/explore")
                ? "#831843"
                : undefined,
              color: asPath.includes("/explore") ? "#fbcfe8" : undefined,
            }}
            onClick={() => setOpen(false)}
          >
            <Link href={"/explore"} className="baseFlex gap-2 text-lg">
              <IoTelescopeOutline className="h-6 w-6" />
              Explore
            </Link>
          </Button>

          <Button
            variant={"navigation"}
            size={"lg"}
            style={{
              backgroundColor: asPath.includes("/create")
                ? "#831843"
                : undefined,
              color: asPath.includes("/create") ? "#fbcfe8" : undefined,
            }}
            onClick={() => setOpen(false)}
          >
            <Link href={"/create"} className="baseFlex gap-2 text-lg">
              <FaGuitar className="h-6 w-6" />
              Create
            </Link>
          </Button>

          {/* opting for double "&&" instead of ternary for better readability */}
          {!isSignedIn && (
            <div className="baseFlex gap-2 lg:gap-4">
              {/* how to maybe get colors to match theme + also have an option to specify username? */}
              <SignUpButton
                mode="modal"
                afterSignUpUrl="http://localhost:3000/postSignUpRegistration"
              >
                <Button size={"lg"} className="hidden lg:block">
                  Sign up
                </Button>
              </SignUpButton>
              <SignInButton
                mode="modal"
                afterSignUpUrl="http://localhost:3000/postSignUpRegistration"
              >
                <Button variant={"secondary"} className="h-11">
                  Sign in
                </Button>
              </SignInButton>
            </div>
          )}

          {isSignedIn && (
            <div className="baseFlex gap-2 lg:gap-4">
              <Button variant={"ghost"}>
                <Link
                  href={`/artist/${user?.username ?? ""}/preferences`}
                  className="baseFlex gap-4 text-lg"
                  // hmm  closes even when clicking on the UserButton...
                  onClick={() => setOpen(false)}
                >
                  {user?.username}
                  {/* will need to be based on env url */}
                  <UserButton afterSignOutUrl="http://localhost:3000" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MobileHeader;
