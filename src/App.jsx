import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

function CollapsibleTreeContent({ width, height, data }) {
  const margin = {
    top: 50,
    right: 250,
    bottom: 50,
    left: 50,
  };
  const [collapsed, setCollapsed] = useState({});
  useEffect(() => {
    const newCollapsed = {};
    for (const item of data) {
      newCollapsed[item.id] = item.depth >= 2;
    }
    setCollapsed(newCollapsed);
  }, [data]);
  console.log(collapsed);

  return (
    <div>
      <p>Hello, Collapsible Tree Content!!</p>
    </div>
  );
}

function CollapsibleTree({ data }) {
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
    <div ref={wrapperRef} className="collapsible-tree-wrapper">
      {data && (
        <CollapsibleTreeContent
          width={size.width}
          height={size.height}
          data={data}
        />
      )}
    </div>
  );
}

function App() {
  const [data, setData] = useState(null);
  useEffect(() => {
    (async () => {
      const response = await fetch("data/flare.csv");
      const data = d3.csvParse(await response.text());
      for (const item of data) {
        const segments = item.id.split(".");
        item.name = segments[segments.length - 1];
        item.parentId = segments.slice(0, -1).join(".") || null;
        item.value = Number(item) || null;
      }
      const stratify = d3.stratify();
      setData(
        stratify(data)
          .descendants()
          .map((item) => {
            return {
              ...item.data,
              depth: item.depth,
              height: item.height,
              childCount: item.children?.length || 0,
            };
          })
      );
    })();
  }, []);

  return (
    <div>
      <CollapsibleTree data={data} />
    </div>
  );
}

export default App;
