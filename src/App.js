import { useEffect } from "react";
import * as d3 from "d3";

function App() {
  useEffect(() => {
    (async () => {
      const response = await fetch("data/flare.csv");
      const data = d3.csvParse(await response.text());
      for (const item of data) {
        const segments = item.id.split(".");
        item.name = segments[segments.length - 1];
      }
    })();
  }, []);

  return (
    <>
      <div>Collapsible Tree</div>
    </>
  );
}

export default App;
