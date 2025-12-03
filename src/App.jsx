import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

function CollapsibleTreeContent({ data, width, height }) {
  //console.log(data);
  //console.log(width, height);

  // color
  // #585656
  // #b09b6a
  // #f25222

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

  const [nodes, links] = useMemo(() => {
    const stratify = d3.stratify();
    const root = d3.hierarchy(stratify(data), (item) =>
      collapsed[item.id] ? null : item.children
    );
    const tree = d3
      .tree()
      .size([
        height - margin.top - margin.bottom,
        width - margin.left - margin.right,
      ]);
    tree(root);
    const nodes = root.descendants().map((item) => {
      return { ...item.data.data, x: item.y, y: item.x };
    });
    const nodeIndices = {};
    nodes.forEach((node, i) => {
      nodeIndices[node.id] = i;
    });
    const links = root.links().map(({ source, target }) => {
      return {
        source: nodeIndices[source.data.data.id],
        target: nodeIndices[target.data.data.id],
      };
    });

    return [nodes, links];
  }, [data, width, height, margin, collapsed]);

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        <g>
          {links.map(({ source, target }) => {
            const sourceX = nodes[source].x;
            const sourceY = nodes[source].y;
            const targetX = nodes[target].x;
            const targetY = nodes[target].y;
            const d = `M ${sourceX} ${sourceY} C ${
              (sourceX + targetX) / 2
            } ${sourceY}, ${
              (sourceX + targetX) / 2
            } ${targetY}, ${targetX} ${targetY}`;
            return <path d={d} stroke="#585656" fill="none" />;
          })}
        </g>
        <g>
          {nodes.map((node) => {
            return (
              <circle
                key={node.id}
                cx={node.x}
                cy={node.y}
                r="5"
                fill="#b09b6a"
              />
            );
          })}
        </g>
      </g>
    </svg>
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
          data={data}
          width={size.width}
          height={size.height}
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
        item.value = Number(item.value) || null;
      }
      const stratify = d3.stratify();
      setData(
        stratify(data)
          .descendants()
          .map((item) => {
            return {
              ...item.data,
              height: item.height,
              depth: item.depth,
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
