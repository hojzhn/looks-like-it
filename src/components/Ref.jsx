import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const RefCtx = createContext(null);
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const WIDEN_MS = 550;
const CUT_HOLD_MS = 0;
const SWITCH_PAUSE_MS = 0;
const CUT_GAP_EM = 0.22;
const CUT_TOP_NUDGE_EM = 0.15;

export function RefProvider({ children }) {
  const [openId, setOpenId] = useState(null);
  const [active, setActive] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [snap, setSnap] = useState(false);
  const containerRef = useRef(null);
  const noteRef = useRef(null);
  const [noteH, setNoteH] = useState(0);
  const timersRef = useRef([]);
  const phaseRef = useRef("idle");
  const openIdRef = useRef(null);
  const snapRafRef = useRef(null);
  const wordRefs = useRef(new Map());

  const setOpenIdSafe = useCallback((id) => {
    openIdRef.current = id;
    setOpenId(id);
  }, []);

  const setPhaseSafe = useCallback((p) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  useLayoutEffect(() => {
    if (active && noteRef.current) {
      setNoteH(noteRef.current.offsetHeight);
    }
  }, [active]);

  useEffect(() => {
    const remeasure = () => {
      const id = openIdRef.current;
      if (id === null) return;
      const ref = wordRefs.current.get(id);
      if (!ref?.current || !containerRef.current) return;
      const rect = ref.current.getBoundingClientRect();
      const pRect = containerRef.current.getBoundingClientRect();
      const fontSize = parseFloat(
        window.getComputedStyle(ref.current).fontSize,
      );
      const newTop = rect.bottom - pRect.top - fontSize * CUT_TOP_NUDGE_EM;
      setSnap(true);
      setActive((prev) => {
        if (!prev) return prev;
        if (
          Math.abs(prev.top - newTop) < 0.5 &&
          Math.abs(prev.fontSize - fontSize) < 0.5
        ) {
          return prev;
        }
        return { ...prev, top: newTop, fontSize };
      });
      if (snapRafRef.current) cancelAnimationFrame(snapRafRef.current);
      snapRafRef.current = requestAnimationFrame(() => {
        snapRafRef.current = null;
        setSnap(false);
      });
    };
    window.addEventListener("resize", remeasure);
    return () => window.removeEventListener("resize", remeasure);
  }, []);

  const registerWordRef = useCallback((id, ref) => {
    if (ref === null) {
      wordRefs.current.delete(id);
    } else {
      wordRefs.current.set(id, ref);
    }
  }, []);

  const getWordRef = useCallback((id) => wordRefs.current.get(id), []);

  const open = useCallback(
    (id, data) => {
      if (openIdRef.current === id) return;
      clearTimers();

      const doOpen = () => {
        setActive(data);
        setOpenIdSafe(id);
        setPhaseSafe("cutting");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setPhaseSafe("widening"));
        });
      };

      if (phaseRef.current === "idle") {
        doOpen();
      } else {
        setPhaseSafe("closing");
        setOpenIdSafe(null);
        timersRef.current.push(
          setTimeout(() => {
            setPhaseSafe("idle");
            setActive(null);
            timersRef.current.push(setTimeout(doOpen, SWITCH_PAUSE_MS));
          }, WIDEN_MS),
        );
      }
    },
    [clearTimers, setPhaseSafe, setOpenIdSafe],
  );

  const close = useCallback(() => {
    clearTimers();
    setPhaseSafe("closing");
    setOpenIdSafe(null);
    timersRef.current.push(
      setTimeout(() => {
        setPhaseSafe("idle");
        setActive(null);
      }, WIDEN_MS),
    );
  }, [clearTimers, setPhaseSafe, setOpenIdSafe]);

  const clipped = phase !== "idle";
  const translateY = phase === "widening" ? noteH : 0;
  const animatedPhase = phase === "widening" || phase === "closing";
  const transitionsOn = animatedPhase && !snap;
  const paddingTransition = transitionsOn
    ? `padding ${WIDEN_MS}ms ${EASE}`
    : "none";
  const clipTransition = transitionsOn
    ? `clip-path ${WIDEN_MS}ms ${EASE}`
    : "none";
  const layer2Transition = transitionsOn
    ? `transform ${WIDEN_MS}ms ${EASE}, clip-path ${WIDEN_MS}ms ${EASE}`
    : "none";
  const noteTopTransition = transitionsOn ? `${WIDEN_MS}ms ${EASE}` : "0ms";

  const baseCtx = useMemo(
    () => ({
      openId,
      open,
      close,
      containerRef,
      registerWordRef,
      getWordRef,
      inLayer2: false,
    }),
    [openId, open, close, registerWordRef, getWordRef],
  );

  const layer2Ctx = useMemo(() => ({ ...baseCtx, inLayer2: true }), [baseCtx]);

  return (
    <RefCtx.Provider value={baseCtx}>
      <div
        ref={containerRef}
        className="relative"
        style={{
          paddingBottom: `${translateY}px`,
          transition: paddingTransition,
        }}
      >
        <div
          style={{
            clipPath: clipped
              ? `inset(0 0 calc(100% - ${active?.top}px) 0)`
              : "inset(0 0 0 0)",
            transition: clipTransition,
          }}
        >
          {children}
        </div>
        <RefCtx.Provider value={layer2Ctx}>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              clipPath: clipped
                ? `inset(${active?.top}px 0 0 0)`
                : "inset(100% 0 0 0)",
              transform: `translateY(${translateY}px)`,
              transition: layer2Transition,
            }}
          >
            {children}
          </div>
        </RefCtx.Provider>
        <div
          aria-hidden={!active}
          ref={noteRef}
          className="absolute left-0 right-0 pt-2 pb-4 mt-2 border-t-2 pointer-events-none"
          style={{
            top: active ? `${active.top}px` : "0px",
            opacity: phase === "widening" ? 1 : 0,
            borderTopColor:
              phase === "widening" ? "rgba(0,0,0,1)" : "rgba(0,0,0,0)",
            transition: `opacity 400ms ${EASE} ${phase === "widening" ? "180ms" : "0ms"}, top ${noteTopTransition}, border-top-color 500ms ${EASE} ${phase === "widening" ? "300ms" : "0ms"}`,
            fontSize: active ? `${active.fontSize}px` : undefined,
          }}
        >
          <div className="text-[0.5em] font-medium tracking-normal relative">
            {active && (
              <>
                <span className="mr-[0.4em] text-[0.4em] -top-[1em] relative font-sans font-medium tabular-nums opacity-70">
                  {active.n})
                </span>
                {active.content}
              </>
            )}
          </div>
        </div>
      </div>
    </RefCtx.Provider>
  );
}

function Ref({ id, n, note, children }) {
  const {
    openId,
    open,
    close,
    containerRef,
    registerWordRef,
    getWordRef,
    inLayer2,
  } = useContext(RefCtx);
  const isOpen = openId === id;
  const anyOpen = openId !== null;
  const wordRef = useRef(null);

  useLayoutEffect(() => {
    if (inLayer2) return;
    registerWordRef(id, wordRef);
    return () => registerWordRef(id, null);
  }, [id, inLayer2, registerWordRef]);

  const handleClick = () => {
    if (isOpen) {
      close();
      return;
    }
    const ref = getWordRef(id) || wordRef;
    if (!ref.current || !containerRef.current) return;
    const rect = ref.current.getBoundingClientRect();
    const pRect = containerRef.current.getBoundingClientRect();
    const fontSize = parseFloat(window.getComputedStyle(ref.current).fontSize);
    open(id, {
      top: rect.bottom - pRect.top - fontSize * CUT_TOP_NUDGE_EM,
      content: note,
      fontSize,
      n,
    });
  };

  return (
    <span
      ref={wordRef}
      onClick={handleClick}
      className={`cursor-pointer transition-[opacity,font-weight] duration-700 ease-out ${
        anyOpen && !isOpen ? "" : "opacity-100"
      }`}
    >
      <span
        className={`rounded-sm leading-none transition-colors duration-500 ease-out ${
          isOpen ? "text-amber-500" : ""
        }`}
      >
        <span className={`${isOpen && " "}`}>{children}</span>
        <span className="ml-[0.15em] inline text-[0.4em] font-sans font-medium tabular-nums text-neutral-500 relative -top-[1em]">
          {n})
        </span>
      </span>
    </span>
  );
}

export default Ref;
