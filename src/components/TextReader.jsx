import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
} from "react";

const SAMPLE_MARKDOWN = `The Long Crossing

The ferry pulled out of the harbor at a quarter past four, and Maren stayed on deck until the lights of the town had thinned to a single yellow smear along the horizon. She had not expected the cold. She had not expected, either, the way the engine's vibration would travel up through the soles of her boots and settle, after an hour or so, into the small bones of her jaw.

She thought about the letter folded in her coat pocket. She thought about not thinking about it.

## I.

`;

// Inline tokenizer for **bold**, *italic*, `code`, [link](url).
function renderInline(text, keyBase = "i") {
  const out = [];
  let i = 0;
  let buf = "";
  let k = 0;

  const flush = () => {
    if (buf) {
      out.push(buf);
      buf = "";
    }
  };

  while (i < text.length) {
    const rest = text.slice(i);

    const bold = rest.match(/^\*\*([^*\n]+)\*\*/);
    if (bold) {
      flush();
      out.push(<strong key={`${keyBase}-${k++}`}>{bold[1]}</strong>);
      i += bold[0].length;
      continue;
    }
    const italic = rest.match(/^\*([^*\n]+)\*/);
    if (italic) {
      flush();
      out.push(<em key={`${keyBase}-${k++}`}>{italic[1]}</em>);
      i += italic[0].length;
      continue;
    }
    const code = rest.match(/^`([^`\n]+)`/);
    if (code) {
      flush();
      out.push(<code key={`${keyBase}-${k++}`}>{code[1]}</code>);
      i += code[0].length;
      continue;
    }
    const link = rest.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (link) {
      flush();
      out.push(
        <a
          key={`${keyBase}-${k++}`}
          href={link[2]}
          target="_blank"
          rel="noreferrer"
        >
          {link[1]}
        </a>,
      );
      i += link[0].length;
      continue;
    }
    buf += text[i];
    i++;
  }
  flush();
  return out;
}

function parseMarkdown(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  let para = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={key++}>{renderInline(line.slice(4), `h3${key}`)}</h3>,
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={key++}>{renderInline(line.slice(3), `h2${key}`)}</h2>,
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push(
        <h1 key={key++}>{renderInline(line.slice(2), `h1${key}`)}</h1>,
      );
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre key={key++}>
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }
    if (line.startsWith("> ")) {
      const qLines = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        qLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <blockquote key={key++}>
          {renderInline(qLines.join(" "), `bq${key}`)}
        </blockquote>,
      );
      continue;
    }
    if (/^[-*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++}>
          {items.map((t, j) => (
            <li key={j}>{renderInline(t, `li${key}-${j}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++}>
          {items.map((t, j) => (
            <li key={j}>{renderInline(t, `oli${key}-${j}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }
    if (/^-{3,}$/.test(line.trim())) {
      blocks.push(<hr key={key++} />);
      i++;
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    // Paragraph: collect until blank or block starter
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,3}\s|>\s|```|-{3,}$|[-*]\s|\d+\.\s)/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    const isFirstPara = para === 0;
    para++;
    blocks.push(
      <p key={key++} className={isFirstPara ? "dropcap" : ""}>
        {renderInline(paraLines.join(" "), `p${key}`)}
      </p>,
    );
  }
  return blocks;
}

export default function TextReader({ markdown = SAMPLE_MARKDOWN, title }) {
  const outerRef = useRef(null);
  const pageAreaRef = useRef(null);
  const contentRef = useRef(null);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [wheelLock, setWheelLock] = useState(false);

  // Track the page area dimensions.
  useLayoutEffect(() => {
    if (!pageAreaRef.current) return;
    const el = pageAreaRef.current;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Recompute total page count when size or content changes.
  useLayoutEffect(() => {
    if (!contentRef.current || size.w === 0) return;
    // Reset transform briefly so scrollWidth reads true total width.
    const node = contentRef.current;
    const prevTransform = node.style.transform;
    node.style.transition = "none";
    node.style.transform = "translateX(0)";
    // Force reflow.
    void node.offsetWidth;
    const sw = node.scrollWidth;
    const count = Math.max(1, Math.ceil(sw / size.w));
    setPageCount(count);
    setPage((p) => Math.min(p, count - 1));
    // Restore.
    node.style.transform = prevTransform;
    requestAnimationFrame(() => {
      node.style.transition = "";
    });
  }, [size.w, size.h, markdown]);

  const go = useCallback(
    (delta) => {
      setPage((p) => Math.max(0, Math.min(pageCount - 1, p + delta)));
    },
    [pageCount],
  );

  // Keyboard.
  useEffect(() => {
    const onKey = (e) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Home") {
        setPage(0);
      } else if (e.key === "End") {
        setPage(Math.max(0, pageCount - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, pageCount]);

  // Wheel: each gesture advances one page, with a short lock to avoid runaway.
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      const v = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(v) < 12) return;
      e.preventDefault();
      if (wheelLock) return;
      setWheelLock(true);
      go(v > 0 ? 1 : -1);
      setTimeout(() => setWheelLock(false), 500);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [go, wheelLock]);

  // Touch swipe.
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    let startX = 0;
    let startY = 0;
    let tracking = false;
    const onStart = (e) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      tracking = true;
    };
    const onEnd = (e) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        go(dx < 0 ? 1 : -1);
      }
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [go]);

  const parsed = useMemo(() => parseMarkdown(markdown), [markdown]);
  const progress = pageCount > 1 ? page / (pageCount - 1) : 0;

  return (
    <div ref={outerRef} className="fixed inset-0 select-none overflow-hidden">
      <style>{`

        .ebook-content {
          font-family: 'Noto Serif KR';
          font-size: clamp(16px, calc(max(var(--page-w), var(--page-h)) * 0.02), 64px);
          line-height: 1.6;
        }
        .ebook-content h1, .ebook-content h2, .ebook-content h3 {
          font-family: serif;
          font-weight: 600;
        }
        .ebook-content h1 {
          font-size: 2.4em;
          font-weight: 800;
          margin: 0.2em 0 0.8em;
          letter-spacing: -0.02em;
        }
        .ebook-content h2 {
          font-size: 1.55em;
          margin: 1.6em 0 0.5em;
          letter-spacing: -0.01em;
          color: #5a4322;
        }
        .ebook-content h3 {
          font-size: 1.18em;
          margin: 1.3em 0 0.3em;
        }
        .ebook-content p {
          text-align: justify;
          hyphens: auto;
          orphans: 3;
          widows: 3;
        }

        .ebook-content blockquote {
          border-left: 2px solid #b09167;
          margin: 1.3em 0;
          padding: 0.1em 0 0.1em 1.1em;
          font-style: italic;
        }
        .ebook-content blockquote p { text-align: left; }
        .ebook-content code {
          font-family: ui-monospace, 'SF Mono', 'Menlo', monospace;
          background: rgba(80, 60, 30, 0.09);
          padding: 1px 6px;
          border-radius: 3px;
          font-size: 0.88em;
        }
        .ebook-content pre {
          background: rgba(80, 60, 30, 0.08);
          padding: 0.9em 1.1em;
          border-radius: 4px;
          font-size: 0.88em;
          overflow: hidden;
          break-inside: avoid;
        }
        .ebook-content pre code {
          background: none;
          padding: 0;
          font-size: 1em;
        }
        .ebook-content ul, .ebook-content ol {
          padding-left: 1.5em;
          margin: 0 0 1em;
        }
        .ebook-content li { margin: 0.2em 0; }
        .ebook-content a {
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 2px;
        }
        .ebook-content strong { font-weight: 600; }
        .ebook-content hr {
          border: none;
          height: 1.5em;
          margin: 1.6em 0;
          text-align: center;
        }
        .ebook-content hr::before {
          content: '\\00a7';
          font-size: 1.2em;
        }

        .ebook-nav-arrow {
          font-size: 2.2em;
          font-weight: 300;
        }
      `}</style>

      {/* Page area (the visible "page" with margins). */}
      <div
        ref={pageAreaRef}
        className="absolute overflow-hidden top-[7vh] bottom-[9vh] left-[clamp(24px,9vw,140px)] right-[clamp(24px,9vw,140px)]"
      >
        <div
          ref={contentRef}
          className="ebook-content h-full will-change-transform [column-gap:0] [column-fill:auto]"
          style={{
            "--page-w": `${size.w}px`,
            "--page-h": `${size.h}px`,
            columnWidth: size.w > 0 ? `${size.w}px` : "100%",
            transform: `translate3d(-${page * size.w}px, 0, 0)`,
            transition: "transform 460ms cubic-bezier(0.22, 0.8, 0.28, 1)",
          }}
        >
          <div className="font-black ml-[1em] mb-[2em]"> {title}</div>
          {parsed}
        </div>
      </div>

      {/* Click zone: previous. */}
      <button
        aria-label="Previous page"
        onClick={() => go(-1)}
        disabled={page === 0}
        className="absolute top-0 bottom-0 left-0 w-[clamp(24px,9vw,140px)] bg-transparent border-0 outline-none group"
        style={{
          cursor: page === 0 ? "default" : "w-resize",
        }}
      >
        <span
          className="ebook-nav-arrow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 ease-out"
          onMouseEnter={(e) =>
            (e.currentTarget.style.opacity = page === 0 ? 0 : 0.55)
          }
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
        >
          ‹
        </span>
      </button>

      {/* Click zone: next. */}
      <button
        aria-label="Next page"
        onClick={() => go(1)}
        disabled={page >= pageCount - 1}
        className="absolute top-0 bottom-0 right-0 w-[clamp(24px,9vw,140px)] bg-transparent border-0 outline-none"
        style={{
          cursor: page >= pageCount - 1 ? "default" : "e-resize",
        }}
      >
        <span
          className="ebook-nav-arrow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 ease-out"
          onMouseEnter={(e) =>
            (e.currentTarget.style.opacity = page >= pageCount - 1 ? 0 : 0.55)
          }
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
        >
          ›
        </span>
      </button>

      {/* Bottom indicator: progress bar and page count. */}
      <div className="absolute flex flex-row items-center bottom-[clamp(30px,6vh,60px)] gap-[10px] w-full justify-end pr-[clamp(24px,9vw,140px)]">
        {page + 1}
      </div>

      {/* Subtle hint, top-right. */}
    </div>
  );
}
