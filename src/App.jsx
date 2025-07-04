import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

function CollapsibleTreeContent({ width, height }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: width,
        height: height,
        backgroundColor: "darkblue",
      }}
    >
      <p>Hello, Collapsible Tree Content!!</p>
    </div>
  );
}

function CollapsibleTree() {
  const wrapperRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setSize({
        width: wrapperRef.current.clientWidth,
        height: wrapperRef.current.clientHeight,
      });
    });
    observer.observe(wrapperRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }}
    >
      <CollapsibleTreeContent width={size.width} height={size.height} />
    </div>
  );
}

function App() {
  useEffect(() => {
    (async () => {
      const response = await fetch("data/flare.csv");
      const data = d3.csvParse(await response.text());
    })();
  }, []);

  return (
    <div>
      <CollapsibleTree />
    </div>
  );
}

export default App;
