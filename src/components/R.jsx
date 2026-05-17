import Ref from "./Ref";
import { refs } from "../data/refs";

function R({ i }) {
  const { label, note } = refs[i];
  return (
    <Ref id={i} n={i + 1} note={note}>
      {label}
    </Ref>
  );
}

export default R;
