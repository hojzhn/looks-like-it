import { useEffect, useState } from "react";

function Loader() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const finish = () => {
      setFontsLoaded(true);
      setTimeout(() => setMounted(false), 600);
    };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(finish);
    } else {
      finish();
    }
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-50 bg-white transition-opacity duration-500 ease-out"
      style={{
        opacity: fontsLoaded ? 0 : 1,
        pointerEvents: fontsLoaded ? "none" : "auto",
      }}
    />
  );
}

export default Loader;
