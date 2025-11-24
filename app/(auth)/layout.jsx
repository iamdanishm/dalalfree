import Image from "next/image";
import Link from "next/link";
import "../globals.css";

export const metadata = {
  title: "Dalal Free | Login & Signup",
  description:
    "Login or create your Dalal Free account to buy, sell, or rent properties with 100% transparency.",
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background text-foreground font-sans px-4 py-10">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 mb-1">
        <Image
          src="/t-logo2.png"
          alt="Dalal Free Logo"
          width={200}
          height={70}
          className="rounded-full"
        />
      </Link>

      {/* Auth Card */}
      <div className="w-full max-w-[95vw] lg:max-w-[1400px] p-6 lg:p-8">
        {children}
      </div>

      {/* Footer line */}
      <p className="text-xs text-gray-500 mt-8 text-center">
        © {new Date().getFullYear()} Dalal Free. Built for Transparent Real
        Estate.
      </p>
    </div>
  );
}
