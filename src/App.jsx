import { useEffect, useMemo, useRef, useState } from "react";
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
  const [nodes, links] = useMemo(() => {
    const stratify = d3.stratify();
    const root = d3.hierarchy(stratify(data), (item) => {
      return collapsed[item.id] ? null : item.children;
    });
    const tree = d3
      .tree()
      .size([
        height - margin.top - margin.bottom,
        width - margin.right - margin.left,
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
    <svg
      width={width}
      height={height}
      style={{ display: "block" }}
      className="collapsible-tree"
    >
      <g transform={`translate(${margin.left},${margin.top})`}>
        <g>
          {links.map((link) => {
            const sourcePoint = {
              x: nodes[link.source].x,
              y: nodes[link.source].y,
            };
            const targetPoint = {
              x: nodes[link.target].x,
              y: nodes[link.target].y,
            };
            const path = `M ${sourcePoint.x} ${sourcePoint.y} C ${
              (sourcePoint.x + targetPoint.x) / 2
            } ${sourcePoint.y}, ${(sourcePoint.x + targetPoint.x) / 2} ${
              targetPoint.y
            }, ${targetPoint.x} ${targetPoint.y}`;

            return (
              <g
                key={`${nodes[link.source].id}:${nodes[link.target].id}`}
                className="link"
              >
                <path d={path} stroke="#747F7F" fill="none"></path>
              </g>
            );
          })}
        </g>
        <g>
          {nodes.map((node) => {
            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                onClick={() => {
                  setCollapsed({
                    ...collapsed,
                    [node.id]: !collapsed[node.id],
                  });
                }}
                className={node.childCount > 0 ? "node clickable" : "node"}
              >
                <circle
                  r="5"
                  fill={
                    collapsed[node.id] && node.childCount > 0
                      ? "#FF4858"
                      : "#747F7F"
                  }
                ></circle>
                <text
                  x="8"
                  textAnchor="begin"
                  dominantBaseline="central"
                  fontSize="14"
                  fontWeight="bold"
                  fill="#747F7F"
                  transform="rotate(-30)"
                >
                  {node.name}
                </text>
              </g>
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
