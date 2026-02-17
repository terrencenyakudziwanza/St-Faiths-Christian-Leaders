import "./styles/globals.css";
import "./styles/animations.css";
import "./styles/tailwind.css";
import Home from "./components/Home";
import gsap from "gsap";
import { CustomEase, Flip, SplitText } from "gsap/all";
import Next from "./components/Next";

gsap.registerPlugin(CustomEase, Flip, SplitText);

function App() {
  return (
    <>
      <Home />
      <Next/>
    </>
  );
}

export default App;
