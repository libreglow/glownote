import { useNavigation } from "./store/navigation-store";
import Home from "./pages/home/page";
import "./App.css";
import Editor from "./pages/editor/editor";
import { useEffect } from "react";
import ConfiDB from "./storage/config-db";

function App() {
  const current = useNavigation((state) => state.current);

  useEffect(() => {
    ConfiDB();
  } , []);

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
