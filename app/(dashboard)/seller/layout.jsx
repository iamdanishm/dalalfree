"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import {
  FiHome,
  FiPlusCircle,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

export default function SellerLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const navItems = [
    { name: "Dashboard", href: "/seller", icon: <FiHome /> },
    { name: "My Properties", href: "/seller/properties", icon: <FiFileText /> },
    { name: "Post Property", href: "/seller/post", icon: <FiPlusCircle /> },
    { name: "KYC", href: "/seller/kyc", icon: <FiSettings /> },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${open ? "w-64" : "w-20"} 
          lg:relative fixed left-0 top-0 h-screen z-50
          bg-white border-r border-border flex flex-col transition-all duration-300 shadow-soft
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="flex items-center justify-between px-4 lg:px-6 h-16 border-b border-border">
          <div className="flex items-center">
            <Image
              src="/t-logo2.png"
              alt="Dalal Free"
              width={140}
              height={40}
              className="object-contain h-10 w-auto"
            />
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-surface transition-colors text-muted hover:text-heading hidden lg:flex"
          >
            <FiMenu size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface transition-colors text-sm font-medium text-body group"
            >
              <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-primary/20 transition-colors">
                {item.icon}
              </div>
              {open && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={() => {
              signOut();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface/80 transition-colors text-sm font-medium text-body group"
          >
            <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-error/20 transition-colors">
              <FiLogOut />
            </div>
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setOpen(true); // Ensure sidebar is expanded on mobile
              }}
              className="p-2 rounded-lg hover:bg-surface transition-colors text-muted hover:text-heading lg:hidden"
            >
              {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>

            <div className="flex flex-col">
              <h2 className="text-lg lg:text-xl font-semibold text-heading">
                Seller Dashboard
              </h2>
              <p className="text-xs lg:text-sm text-muted">
                Welcome back, {session?.user?.name || "Seller"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-heading">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-muted capitalize">
                {session?.user?.role || "Seller"}
              </p>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">
                {session?.user?.name?.charAt(0)?.toUpperCase() || "S"}
              </span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-background">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
