import { useEffect, useRef, useState } from "react";
import { useProgress } from "./hooks/useProgress";
import Sidebar from "./components/Sidebar";
import LessonView from "./components/LessonView";
import { Roadmap, GraphPage, Guide, Resources } from "./components/Pages";
import "./App.css";

// Routes live in the URL hash (#/roadmap, #/lesson/<id>) so refresh and the back button work.
function useRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash.replace(/^#\/?/, "") || "roadmap";
}

function App() {
  const route = useRoute();
  const [view, id] = route.split("/");
  const { done, toggle } = useProgress();
  const main = useRef(null);

  useEffect(() => {
    main.current.scrollTop = 0;
  }, [route]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <a href="#/roadmap">System Design, zero to SDE-2</a>
      </header>
      <div className="app-body">
        <Sidebar view={view} id={id} done={done} />
        <main ref={main}>
          {view === "lesson" && <LessonView key={id} id={id} done={done} toggle={toggle} />}
          {view === "graph" && <GraphPage done={done} />}
          {view === "guide" && <Guide />}
          {view === "resources" && <Resources />}
          {!["lesson", "graph", "guide", "resources"].includes(view) && <Roadmap done={done} />}
        </main>
      </div>
    </div>
  );
}

export default App;
