import { Link } from "@tanstack/react-router";
import { ArrowUpLeft, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSiteSettings, defaultContent } from "@/lib/site-settings";
import { TranslateButton } from "@/components/TranslateButton";

export function Brand({ favicon }: { favicon?: string; isNavbar?: boolean }) {
  const defaultLogo = "https://skvdiqbhydwiwyxsjgzq.supabase.co/storage/v1/object/public/space-images/downlo1111ad.png";
  
  return (
    <Link to="/" className="flex items-center relative z-50 shrink-0" aria-label="الكيان - الصفحة الرئيسية">
      <img 
        src={favicon && favicon !== "" ? favicon : defaultLogo} 
        className="h-12 md:h-14 w-auto object-contain opacity-100" 
        alt="شعار الكيان" 
      />
    </Link>
  );
}

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(solid);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: content = defaultContent } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: fetchSiteSettings,
  });

  const navbar = content.navbar || defaultContent.navbar;

  useEffect(() => {
    if (solid) {
      setIsScrolled(true);
      return;
    }
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [solid]);

  const handleScrollToContact = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const contactSection = document.getElementById("contact-footer");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/#contact-footer";
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/20 backdrop-blur-md py-2 border-b border-primary/20 transition-all">
      <nav 
        className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8" 
        aria-label="التنقل الرئيسي"
      >
        <Brand favicon={content.seo?.favicon} isNavbar={true} />
        
        {/* Desktop Navigation */}
        <div className="hidden items-center gap-10 text-lg font-medium text-white/90 md:flex">
          <Link className="transition-colors hover:text-primary" to="/">{navbar.link1}</Link>
          <Link className="transition-colors hover:text-primary" to="/rooms">{navbar.link2}</Link>
          <Link className="transition-colors hover:text-primary" to="/" hash="features">{navbar.link3}</Link>
          <Link className="transition-colors hover:text-primary" to="/reels">جولة في الكيان</Link>
          <a href="#contact-footer" onClick={handleScrollToContact} className="transition-colors hover:text-primary cursor-pointer">{navbar.link4}</a>
        </div>

        {/* CTA Button (Desktop) & Translate & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
          <TranslateButton />

          <Button 
            asChild 
            className="hidden h-11 border-primary/50 text-primary bg-transparent hover:bg-primary/10 hover:border-primary transition-all px-5 text-sm md:text-base font-medium shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.25)] border md:flex shrink-0"
          >
            <Link to="/rooms">
              {navbar.cta} <ArrowUpLeft className="mr-2 size-5" />
            </Link>
          </Button>

          <button 
            className="flex p-1.5 sm:p-2 text-primary md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="افتح القائمة"
          >
            <Menu className="size-6 sm:size-7" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/80 backdrop-blur-md transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-full flex-col p-6">
          <div className="flex items-center justify-between">
            <Brand favicon={content.seo?.favicon} />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-primary hover:text-white"
              aria-label="أغلق القائمة"
            >
              <X className="size-8" />
            </button>
          </div>
          <div className="mt-12 flex flex-col gap-6 text-right text-2xl font-display text-white">
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/" className="active:text-primary">{navbar.link1}</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/rooms" className="active:text-primary">{navbar.link2}</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/" hash="features" className="active:text-primary">{navbar.link3}</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/reels" className="active:text-primary">جولة في الكيان</Link>
            <a onClick={handleScrollToContact} href="#contact-footer" className="active:text-primary cursor-pointer">{navbar.link4}</a>
          </div>
          
          <div className="mt-auto pb-8">
            <Button 
              asChild 
              className="w-full h-14 border-primary text-primary bg-primary/10 text-lg shadow-[0_0_15px_rgba(212,175,55,0.2)] border"
            >
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/rooms">
                {navbar.cta} <ArrowUpLeft className="mr-2 size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}