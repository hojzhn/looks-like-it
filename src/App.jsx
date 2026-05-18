import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Loader from "./components/Loader";
import MainPage from "./pages/MainPage";
import PostsPage from "./pages/PostsPage";
import ProfilePage from "./pages/ProfilePage";

const pageVariants = {
  initial: (dir) => ({ y: dir > 0 ? "100%" : "-100%" }),
  animate: { y: 0 },
  exit: (dir) => ({ y: dir > 0 ? "-100%" : "100%" }),
};

const pageOrder = { main: 0, posts: 1, profile: 2 };

function App() {
  const [page, setPage] = useState("main");
  const [dir, setDir] = useState(1);
  const [lastNonProfile, setLastNonProfile] = useState("main");

  const goTo = (next) => {
    if (next === page) return;
    let newDir;
    if (next === "profile") {
      // Entering profile: profile slides DOWN from the top.
      newDir = -1;
    } else if (page === "profile") {
      // Leaving profile: profile slides UP out the top.
      newDir = 1;
    } else {
      newDir = pageOrder[next] > pageOrder[page] ? 1 : -1;
    }
    setDir(newDir);
    if (page !== "profile") setLastNonProfile(page);
    setPage(next);
  };

  // Bottom button keeps the label/target it had before entering profile.
  const effectivePage = page === "profile" ? lastNonProfile : page;
  const bottomLabel = effectivePage === "main" ? "글" : "인물";
  const bottomTarget = effectivePage === "main" ? "posts" : "main";
  const swap = () => goTo(bottomTarget);

  // On profile, the title turns into a nav button whose label is the OPPOSITE
  // of the bottom button, and routes to that opposite page.
  const oppositeLabel = bottomLabel === "글" ? "인물" : "글";
  const oppositeTarget = bottomTarget === "posts" ? "main" : "posts";

  return (
    <>
      <Loader />
      <main className="p-[1em] flex flex-col h-[100dvh] overflow-hidden">
        <div className="justify-between flex flex-0 flex-row items-center mb-4 max-sm:text-[1em] sm:text-[1.6em]">
          {page === "profile" ? (
            <button
              type="button"
              onClick={() => goTo(oppositeTarget)}
              className="font-sans font-bold cursor-pointer transition-opacity hover:opacity-60"
            >
              {oppositeLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goTo("profile")}
              className="font-sans font-bold cursor-pointer transition-opacity hover:opacity-60"
            >
              그래보여 · 이름있는왕
            </button>
          )}
          <div className="font-sans"> @CTLABA</div>
        </div>
        <div className="flex-1 min-h-0 relative overflow-hidden">
          <AnimatePresence custom={dir} initial={false}>
            <motion.div
              key={page}
              custom={dir}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                duration: 0.45,
                ease: [0.22, 0.8, 0.28, 1],
              }}
              className="absolute inset-0 flex flex-row min-h-0 gap-4"
            >
              {page === "main" && <MainPage />}
              {page === "posts" && <PostsPage />}
              {page === "profile" && <ProfilePage />}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="text-[2em] flex-row justify-between flex mt-4 max-sm:text-[1em] sm:text-[1.6em]">
          <button
            type="button"
            onClick={swap}
            className="font-bold cursor-pointer transition-opacity hover:opacity-60"
          >
            {bottomLabel}
          </button>
          <div className="flex flex-row gap-[0.5em] text-[0.9em]">
            <i className="fa-sharp fa-regular fa-clock"></i>
            <i className="fa-sharp fa-solid fa-plane"></i>
            <i className="fa-sharp fa-solid fa-battery-full"></i>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
