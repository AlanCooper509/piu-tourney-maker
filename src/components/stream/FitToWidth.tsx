import { useLayoutEffect, useRef, useState } from "react";

import type { ReactNode } from "react";

/**
 * Lays its content out at natural size, then scales it down (never up) to
 * fit the available width, so a row that outgrows the OBS source shrinks as
 * a whole instead of squeezing or overlapping its items. Uses a transform,
 * which doesn't affect layout, so measuring never feeds back into itself.
 */
export function FitToWidth({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, height: 0 });

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const update = () => {
      const available = outer.clientWidth;
      const natural = inner.offsetWidth;
      const scale = natural > 0 && available > 0 ? Math.min(1, available / natural) : 1;
      setFit({ scale, height: inner.offsetHeight * scale });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outerRef} className="fit-to-width" style={{ width: "100%", height: fit.height || undefined }}>
      <div
        ref={innerRef}
        style={{
          width: "max-content",
          transform: `scale(${fit.scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
