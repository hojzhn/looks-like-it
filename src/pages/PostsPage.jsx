import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import TextReader from "../components/TextReader";

const postModules = import.meta.glob("../data/posts/*.js", { eager: true });

const formatDate = (s) => {
  if (!s) return "";
  if (s.includes("T")) {
    const d = new Date(s);
    if (!isNaN(d)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}.${m}.${day}`;
    }
  }
  return s;
};

const posts = Object.entries(postModules)
  .map(([path, mod]) => {
    const data = mod.default || {};
    const raw = data.createdAt || data.date || "";
    return {
      id: path,
      ...data,
      _sort: raw,
      date: formatDate(raw),
      excerpt:
        data.excerpt ||
        (data.content
          ? data.content.replace(/\s+/g, " ").trim().slice(0, 120) + "…"
          : ""),
    };
  })
  .sort((a, b) => (a._sort < b._sort ? 1 : -1));

export default function PostsPage() {
  const scrollRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    if (selectedPost) return;
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setScrolled(el.scrollTop > 0);
      setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 1);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [selectedPost]);

  return (
    <div className="flex-1 relative overflow-hidden">
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-y-auto max-sm:px-1 sm:px-16 font-serif"
      >
        <ul className="flex flex-col ">
          {posts.map((p) => (
            <li
              key={p.id}
              onClick={() => setSelectedPost(p)}
              className="cursor-pointer transition-opacity hover:opacity-60"
            >
              <div className="flex flex-row items-baseline justify-between gap-4">
                <h2 className="text-[clamp(28px,max(3.6vw,3.6vh),80px)] font-black break-keep">
                  {p.title}
                </h2>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-[2em] z-10 transition-opacity duration-300 ease-out"
        style={{
          opacity: scrolled ? 1 : 0,
          background:
            "linear-gradient(to bottom, #ededec 0%, rgba(237,237,236,0) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2em] z-10 transition-opacity duration-300 ease-out"
        style={{
          opacity: atBottom ? 0 : 1,
          background:
            "linear-gradient(to top, #ededec 0%, rgba(237,237,236,0) 100%)",
        }}
      />
      <AnimatePresence>
        {selectedPost && (
          <TextReader
            key={selectedPost.id}
            title={selectedPost.title}
            markdown={
              selectedPost.content ||
              `# ${selectedPost.title}\n\n${selectedPost.excerpt}`
            }
            onClose={() => setSelectedPost(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
