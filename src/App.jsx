import { useEffect, useRef, useState } from "react";

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
  console.log(size.width, size.height);

  return (
    <div ref={wrapperRef}>
      <p>Hello, Collapsible Tree!!</p>
    </div>
  );
}

function App() {
  return (
    <div>
      <CollapsibleTree />
    </div>
  );
}

export default App;
