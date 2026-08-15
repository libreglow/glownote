import { useNavigation } from "./store/navigation-store";

import Welcome from "./pages/welcome/page";
import Home from "./pages/home/page";

import "./App.css";
import Editor from "./pages/editor/editor";

function App() {
  const current = useNavigation((state) => state.current);

  switch (current.name) {
    case "welcome":
      return <Editor id="1" />;

    case "home":
      return <Home />;

    default:
      return null;
  }
}

export default App;
