import { useContext, useLayoutEffect, useRef, useState } from "react";

import { StreamCssContext } from "./StreamCssContext";

/**
 * Stream text that can carry layered, round-joined outlines, which CSS alone
 * can't draw (text-stroke eats into the glyphs and stacked shadows go blocky).
 *
 * Styling stays in the event's stream CSS. Set a `--text-outline` custom
 * property on the element listing outline layers innermost first, each a
 * width and a color:
 *
 *   .round-title { --text-outline: 1px #0C2DE8, 4px #F18DD8, 3px #fff, 6px #0C2DE8; }
 *
 * With it set, the text renders as SVG using the element's computed font,
 * size, weight, color and text-transform. Without it, it's plain text.
 */

interface OutlineLayer {
  width: number;
  color: string;
}

interface Measured {
  text: string;
  font: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fill: string;
  layers: OutlineLayer[];
}

// Splits on commas outside parentheses, so rgb()/rgba() colors survive.
function splitTopLevel(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of value) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function parseOutline(value: string): OutlineLayer[] {
  return splitTopLevel(value)
    .map((part) => {
      const match = part.match(/^(\d*\.?\d+)px\s+(.+)$/);
      return match ? { width: Number(match[1]), color: match[2].trim() } : null;
    })
    .filter((layer): layer is OutlineLayer => layer !== null && layer.width > 0);
}

function applyTextTransform(text: string, transform: string): string {
  if (transform === "uppercase") return text.toUpperCase();
  if (transform === "lowercase") return text.toLowerCase();
  if (transform === "capitalize") return text.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
  return text;
}

let measureCanvas: HTMLCanvasElement | null = null;
function measureTextWidth(text: string, font: string): number {
  measureCanvas ??= document.createElement("canvas");
  const ctx = measureCanvas.getContext("2d");
  if (!ctx) return 0;
  ctx.font = font;
  return ctx.measureText(text).width;
}

interface OutlinedTextProps {
  text: string;
  className: string;
  as?: "span" | "h1";
}

export function OutlinedText({ text, className, as: Tag = "span" }: OutlinedTextProps) {
  const styleKey = useContext(StreamCssContext);
  const ref = useRef<HTMLElement>(null);
  const [measured, setMeasured] = useState<Measured | null>(null);
  const [fontsReady, setFontsReady] = useState(0);

  useLayoutEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setFontsReady((n) => n + 1);
    });
    const onLoad = () => setFontsReady((n) => n + 1);
    document.fonts.addEventListener("loadingdone", onLoad);
    return () => {
      cancelled = true;
      document.fonts.removeEventListener("loadingdone", onLoad);
    };
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const style = getComputedStyle(el);
    const layers = parseOutline(style.getPropertyValue("--text-outline"));
    if (!layers.length) {
      setMeasured(null);
      return;
    }

    const fontSize = parseFloat(style.fontSize);
    const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    setMeasured({
      text: applyTextTransform(text, style.textTransform),
      font,
      fontFamily: style.fontFamily,
      fontSize,
      fontWeight: style.fontWeight,
      fill: style.color,
      layers,
    });
  }, [text, styleKey, fontsReady]);

  if (!measured) {
    return (
      <Tag ref={ref as never} className={className}>
        {text}
      </Tag>
    );
  }

  const { layers, fontSize } = measured;
  const radii = layers.reduce<number[]>(
    (acc, layer) => [...acc, (acc.at(-1) ?? 0) + layer.width],
    [],
  );
  const outerRadius = radii.at(-1) ?? 0;

  const textWidth = measureTextWidth(measured.text, measured.font) || fontSize * measured.text.length * 0.6;
  const pad = outerRadius + 4;
  const width = textWidth + pad * 2;
  const height = fontSize * 1.3 + pad * 2;

  const textProps = {
    x: width / 2,
    y: height / 2,
    textAnchor: "middle" as const,
    dominantBaseline: "central" as const,
    style: {
      fontFamily: measured.fontFamily,
      fontWeight: measured.fontWeight,
      fontSize: `${fontSize}px`,
    },
  };

  // Paint outermost first so each inner layer sits on top of the one outside it.
  const strokes = layers
    .map((layer, i) => ({ color: layer.color, strokeWidth: radii[i] * 2 }))
    .reverse();

  return (
    <Tag
      ref={ref as never}
      className={className}
      // The SVG does the drawing; keep any CSS stroke/shadow/filter from doubling it.
      style={{
        display: "inline-block",
        lineHeight: 0,
        WebkitTextStroke: 0,
        textShadow: "none",
        filter: "none",
      }}
      aria-label={text}
    >
      <svg
        width={width}
        height={height}
        style={{ display: "block", overflow: "visible" }}
        aria-hidden="true"
      >
        {strokes.map(({ color, strokeWidth }, i) => (
          <text
            key={i}
            {...textProps}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            {measured.text}
          </text>
        ))}
        <text {...textProps} fill={measured.fill}>
          {measured.text}
        </text>
      </svg>
    </Tag>
  );
}
