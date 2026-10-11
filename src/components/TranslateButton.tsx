import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

export function TranslateButton() {
  const [currentLang, setCurrentLang] = useState<"ar" | "en">("ar");

  useEffect(() => {
    // Check initial language from cookie or document
    const checkLang = () => {
      const match = document.cookie.match(/googtrans=\/([^/]+)\/([^;]+)/);
      if (match && match[2] === "en") {
        setCurrentLang("en");
        document.documentElement.lang = "en";
        document.documentElement.dir = "ltr";
      } else {
        const docLang = document.documentElement.lang;
        if (docLang && docLang.toLowerCase().startsWith("en")) {
          setCurrentLang("en");
          document.documentElement.dir = "ltr";
        } else {
          setCurrentLang("ar");
          document.documentElement.lang = "ar";
          document.documentElement.dir = "rtl";
        }
      }
    };

    checkLang();

    // Define the callback function required by Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "ar",
            includedLanguages: "ar,en",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    // Inject script if not present
    const scriptId = "google-translate-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "text/javascript";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate) {
      window.googleTranslateElementInit();
    }

    // Observer to detect when Google Translate modifies html tag or class
    const observer = new MutationObserver(() => {
      const isEnglish = 
        document.documentElement.classList.contains("translated-ltr") ||
        document.documentElement.lang.toLowerCase().startsWith("en");
      
      setCurrentLang(isEnglish ? "en" : "ar");
      document.documentElement.dir = isEnglish ? "ltr" : "rtl";
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "lang"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const toggleLanguage = () => {
    const nextLang = currentLang === "ar" ? "en" : "ar";

    // 1. Search for hidden <select class="goog-te-combo"> element
    const selectElem = document.querySelector<HTMLSelectElement>(".goog-te-combo");

    if (selectElem) {
      selectElem.value = nextLang;
      selectElem.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      // Fallback if select is not rendered yet: update cookies
      const domain = window.location.hostname;
      if (nextLang === "en") {
        document.cookie = `googtrans=/ar/en; path=/;`;
        document.cookie = `googtrans=/ar/en; domain=${domain}; path=/;`;
      } else {
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${domain}; path=/;`;
      }
      window.location.reload();
      return;
    }

    // Update state & HTML attributes instantly without reload
    setCurrentLang(nextLang);
    document.documentElement.lang = nextLang;
    document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
  };

  return (
    <>
      {/* Hidden native Google Translate element */}
      <div id="google_translate_element" className="hidden" aria-hidden="true" style={{ display: "none" }} />

      {/* Embedded In-Header Translate Toggle Button */}
      <button
        type="button"
        onClick={toggleLanguage}
        className="flex items-center gap-2 h-11 md:h-12 bg-black/60 backdrop-blur-md border border-[#D4AF37]/50 hover:border-[#D4AF37] text-[#D4AF37] text-sm md:text-base font-semibold px-4 md:px-5 rounded-xl shadow-md hover:bg-[#D4AF37] hover:text-black transition-all duration-300 cursor-pointer select-none shrink-0"
        aria-label="تبديل اللغة / Toggle Language"
      >
        <Globe className="size-4 md:size-5 shrink-0" />
        <span>{currentLang === "ar" ? "English" : "عربي"}</span>
      </button>
    </>
  );
}

export default TranslateButton;
