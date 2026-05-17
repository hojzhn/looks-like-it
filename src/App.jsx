import R from "./components/R";
import { RefProvider } from "./components/Ref";

function App() {
  return (
    <main className="p-[1em] flex flex-col h-screen overflow-hidden">
      <div className="justify-between flex flex-0 flex-row items-center mb-4 max-sm:text-[1em] sm:text-[2em]">
        <div className="font-sans"> 그래보여 · 이름있는왕</div>
        <div className="font-sans"> @CLTABA</div>
      </div>{" "}
      <div className="flex-1 overflow-y-auto max-sm:px-1 sm:px-16 text-[clamp(28px,max(3.6vw,3.6vh),80px)] font-serif text-justify font-black break-all hyphens-auto">
        <RefProvider>
          2026. 움츠리면 끝. <R i={0} />. 2025. 无法触及无法生存无法死去. 壬午.
          벨라미 란. CERTIFIED HOEMAXXER. <R i={1} />. 제물은 돈─은총은 마약.
          커크 새터필드. 너무 쉬워. <R i={2} />. 트위기. 2024. 기억할 필요 없어
          그게 아름다운 점이지. 마테이 야보르닉. 시빅. 2023. 그가 말을 하지 않는
          이유는 폭소를 간신히 참고 있기 때문이다. 누스랏 시슬랴니코프. 무하.
          비로소 보이는군 대낮처럼 훤히. <R i={3} />. 조지 베일리. 선셋.
          山曰く/全部投げろ、掃け/一本勝負だ。 弁天橋 · バイロン。 2022. 백 색
          왜성. 데시데리오 소사. 골드 맨 맨해튼. 아뇰로 트리폴리.
        </RefProvider>{" "}
      </div>
      <div className="text-[2em] flex-row justify-between flex mt-4 max-sm:text-[1em] sm:text-[2em]">
        <div className="font-bold">메뉴(준비중)</div>
        <div className="flex flex-row gap-[0.5em] text-[0.9em]">
          <i class="fa-sharp fa-regular fa-clock"></i>
          <i class="fa-sharp fa-solid fa-plane"></i>
          <i class="fa-sharp fa-solid fa-battery-full"></i>
        </div>
      </div>
    </main>
  );
}

export default App;
