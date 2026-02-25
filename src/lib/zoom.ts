export const ZOOM_STEPS = [0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.60, 0.75, 0.90, 1.00, 1.10, 1.25, 1.50, 1.75, 2.00, 2.50, 3.00, 3.50, 4.00, 4.50, 5.00]

export function nearestStep(zoom: number, direction: 1 | -1): number {
  if (direction === 1) {
    return ZOOM_STEPS.find((s) => s > zoom + 0.001) ?? ZOOM_STEPS[ZOOM_STEPS.length - 1]
  } else {
    return [...ZOOM_STEPS].reverse().find((s) => s < zoom - 0.001) ?? ZOOM_STEPS[0]
  }
}

/** Snap an arbitrary zoom value to the closest named step. */
export function snapToNearest(zoom: number): number {
  return ZOOM_STEPS.reduce((prev, curr) =>
    Math.abs(curr - zoom) < Math.abs(prev - zoom) ? curr : prev
  )
}
