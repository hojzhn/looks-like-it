import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Loader from "./components/Loader";
import MainPage from "./pages/MainPage";
import PostsPage from "./pages/PostsPage";

const pageVariants = {
  initial: (dir) => ({ y: dir > 0 ? "100%" : "-100%" }),
  animate: { y: 0 },
  exit: (dir) => ({ y: dir > 0 ? "-100%" : "100%" }),
};

function App() {
  const [page, setPage] = useState("main");
  const [dir, setDir] = useState(1);

  const swap = () => {
    setDir(page === "main" ? 1 : -1);
    setPage(page === "main" ? "posts" : "main");
  };

  return (
    <>
      <Loader />
      <main className="p-[1em] flex flex-col h-[100dvh] overflow-hidden">
        <div className="justify-between flex flex-0 flex-row items-center mb-4 max-sm:text-[1em] sm:text-[1.6em]">
          <div className="font-sans font-bold"> 그래보여 · 이름있는왕</div>
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
              {page === "main" ? <MainPage /> : <PostsPage />}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="text-[2em] flex-row justify-between flex mt-4 max-sm:text-[1em] sm:text-[1.6em]">
          <button
            type="button"
            onClick={swap}
            className="font-bold cursor-pointer transition-opacity hover:opacity-60"
          >
            {page === "main" ? "글" : "인물"}
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
