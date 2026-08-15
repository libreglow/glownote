import { useNavigation } from "./store/navigation-store";
import Home from "./pages/home/page";
import "./App.css";
import Editor from "./pages/editor/editor";
import { useEffect } from "react";
import ConfiDB from "./storage/config-db";
import Welcome from "./pages/welcome/page";

function App() {
  const current = useNavigation((state) => state.current);

  useEffect(() => {
    ConfiDB();
  } , []);

  switch (current.name) {
    case "welcome":
      return <Welcome />;

    case "home":
      return <Home />;

    case "editor":
      return <Editor id="" />;

    default:
      return null;
  }
}

export default App;
