export const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5]

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
