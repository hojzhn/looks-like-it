export default function ProfilePage() {
  return (
    <div className="flex-1 relative overflow-hidden">
      <div className="absolute inset-0 overflow-y-auto max-sm:px-1 sm:px-16 max-sm:px-1 sm:px-16 font-serif text-[clamp(28px,max(3.6vw,3.6vh),80px)] font-bold">
        닉네임: 그래보여
        <br />
        취미: 춤, 영화감상, 제빵
        <br />
        좋아하는 것: 비둘기
        <br />
        싫어하는 것: 가지
        <br />
        한마디: 절대로 변하지 마세요.
      </div>
    </div>
  );
}
