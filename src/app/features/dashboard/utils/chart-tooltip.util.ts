import { Chart, ChartType, TooltipModel } from 'chart.js';

const TOOLTIP_CLASS = 'app-chart-pill-tooltip';

function getTooltipEl(chart: Chart): HTMLDivElement {
  const parent = chart.canvas.parentNode as HTMLElement;
  let el = parent.querySelector<HTMLDivElement>(`:scope > .${TOOLTIP_CLASS}`);
  if (el) return el;

  el = document.createElement('div');
  el.className = TOOLTIP_CLASS;
  el.style.position = 'absolute';
  el.style.top = '0';
  el.style.left = '0';
  el.style.pointerEvents = 'none';
  el.style.transition = 'opacity 0.1s ease, transform 0.1s ease';
  el.style.zIndex = '10';
  parent.style.position = parent.style.position || 'relative';
  parent.appendChild(el);
  return el;
}

/**
 * Positions the pill at (x, y) centered above the caret, then clamps it back
 * inside the chart's container so it doesn't overflow/clip at the edges.
 */
function positionTooltip(el: HTMLDivElement, parent: HTMLElement, x: number, y: number): void {
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.transform = 'translate(-50%, calc(-100% - 10px))';

  const parentRect = parent.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();

  let shiftX = 0;
  if (elRect.left < parentRect.left) shiftX = parentRect.left - elRect.left;
  else if (elRect.right > parentRect.right) shiftX = parentRect.right - elRect.right;

  let shiftY = 0;
  if (elRect.top < parentRect.top) shiftY = parentRect.top - elRect.top;

  if (shiftX || shiftY) {
    el.style.transform = `translate(calc(-50% + ${shiftX}px), calc(-100% - 10px + ${shiftY}px))`;
  }
}

/**
 * Chart.js `external` tooltip callback rendering a pill: dot + label + bold value,
 * matching the shared dashboard chart tooltip design.
 */
export function pillTooltip<T extends ChartType>(context: { chart: Chart; tooltip: TooltipModel<T> }): void {
  const { chart, tooltip } = context;
  const el = getTooltipEl(chart);

  if (tooltip.opacity === 0) {
    el.style.opacity = '0';
    return;
  }

  const point = tooltip.dataPoints[0];
  const dataset = point.dataset as unknown as { backgroundColor?: string | string[]; borderColor?: string };
  const color = (Array.isArray(dataset.backgroundColor)
    ? dataset.backgroundColor[point.dataIndex]
    : dataset.backgroundColor) ?? dataset.borderColor;
  const label = point.label;
  const value = tooltip.body.map(b => b.lines.join(' ')).join(' ');

  el.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      gap: 10px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 9999px;
      padding: 8px 16px 8px 12px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
      font-family: 'IBM Plex Sans Thai', sans-serif;
      white-space: nowrap;
    ">
      <span style="width: 10px; height: 10px; border-radius: 9999px; background: ${color}; flex-shrink: 0;"></span>
      <span style="font-size: 13px; color: #475569;">${label}</span>
      <strong style="font-size: 13px; font-weight: 700; color: #1e293b;">${value}</strong>
    </div>
  `;

  const { offsetLeft, offsetTop } = chart.canvas;
  el.style.opacity = '1';
  positionTooltip(el, chart.canvas.parentNode as HTMLElement, offsetLeft + tooltip.caretX, offsetTop + tooltip.caretY);
}

/**
 * Chart.js `external` tooltip callback rendering a single card listing every
 * hovered dataPoint (dot/dash + label + bold value) under a title row —
 * for multi-series charts where all series should show at once on hover.
 */
export function pillTooltipMulti<T extends ChartType>(context: { chart: Chart; tooltip: TooltipModel<T> }): void {
  const { chart, tooltip } = context;
  const el = getTooltipEl(chart);

  if (tooltip.opacity === 0 || tooltip.dataPoints.length === 0) {
    el.style.opacity = '0';
    return;
  }

  const title = tooltip.title.join(' ');

  const rows = tooltip.dataPoints.map((point, i) => {
    const dataset = point.dataset as unknown as { backgroundColor?: string | string[]; borderColor?: string };
    const color = (Array.isArray(dataset.backgroundColor)
      ? dataset.backgroundColor[point.dataIndex]
      : dataset.backgroundColor) ?? dataset.borderColor;
    const line = tooltip.body[i]?.lines.join(' ') ?? '';
    const [label, value] = line.includes(':') ? line.split(/:(.+)/) : [point.label, line];

    return `
      <div style="display: flex; align-items: center; gap: 10px; padding: 6px 0;">
        <span style="width: 10px; height: 10px; border-radius: 9999px; background: ${color}; flex-shrink: 0;"></span>
        <span style="font-size: 13px; color: #475569; flex: 1;">${label.trim()}</span>
        <strong style="font-size: 13px; font-weight: 700; color: #1e293b;">${value.trim()}</strong>
      </div>
    `;
  });

  el.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      min-width: 200px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 16px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
      font-family: 'IBM Plex Sans Thai', sans-serif;
      white-space: nowrap;
    ">
      ${title ? `
        <div style="font-size: 13px; font-weight: 600; color: #1e293b; padding-bottom: 8px; margin-bottom: 4px; border-bottom: 1px solid #f1f5f9;">
          ${title}
        </div>
      ` : ''}
      ${rows.join('')}
    </div>
  `;

  const { offsetLeft, offsetTop } = chart.canvas;
  el.style.opacity = '1';
  positionTooltip(el, chart.canvas.parentNode as HTMLElement, offsetLeft + tooltip.caretX, offsetTop + tooltip.caretY);
}
