import { useEffect, useRef } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

export function GoogleTranslate() {
  const ref = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Expose the callback Google Translate requires
    window.googleTranslateElementInit = () => {
      if (!ref.current || !window.google?.translate) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "ar",
          includedLanguages: "en,ar",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        ref.current
      );
    };

    // Inject script only once
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Script already loaded (e.g. HMR), call init manually
      window.googleTranslateElementInit?.();
    }

    return () => {
      // Clean up the global callback on unmount
      delete window.googleTranslateElementInit;
    };
  }, []);

  return (
    <div
      className="flex items-center"
      style={{ direction: "ltr" }}
      title="Translate page"
    >
      {/* The Google Translate widget will render inside this div */}
      <div
        id="google_translate_element"
        ref={ref}
        className="[&_.goog-te-gadget-simple]:!bg-transparent [&_.goog-te-gadget-simple]:!border-none [&_.goog-te-gadget-simple_span]:!text-primary [&_.goog-te-gadget-simple_a]:!text-primary [&_.goog-te-gadget-simple]:!text-xs"
      />
    </div>
  );
}
