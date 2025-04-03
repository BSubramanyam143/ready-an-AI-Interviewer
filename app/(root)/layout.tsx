import Link from "next/link";

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { LogOut, SparklesIcon } from "lucide-react";
import { signOut } from "@/components/lib/actions/auth.action";
import { isAuthenticated } from "@/components/lib/actions/auth.action";
import { Button } from "@/components/ui/button";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className="flex items-center gap-2 justify-between">
        <Link href="/" className="flex items-center gap-2 ">
          <SparklesIcon width={40} height={45} />
        </Link>
        <Button onClick={signOut} className="cursor-pointer font-semibold">
          <LogOut />
        </Button>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
