import type { CSSProperties } from 'react'

import './MeteorTrail.css'

type MeteorState = {
  id: number
  startXPercent: number
  startYPercent: number
  deltaX: number
  deltaY: number
  angleDeg: number
  length: number
  durationMs: number
}

type MeteorTrailProps = {
  meteor: MeteorState | null
  onDone: () => void
}

function MeteorTrail({ meteor, onDone }: MeteorTrailProps) {
  if (!meteor) {
    return null
  }

  return (
    <div
      key={meteor.id}
      className="meteor-trail"
      style={
        {
          left: `${meteor.startXPercent}%`,
          top: `${meteor.startYPercent}%`,
          width: `${meteor.length}px`,
          '--meteor-angle': `${meteor.angleDeg}deg`,
          '--meteor-dx': `${meteor.deltaX}px`,
          '--meteor-dy': `${meteor.deltaY}px`,
          '--meteor-duration': `${meteor.durationMs}ms`,
        } as CSSProperties
      }
      onAnimationEnd={onDone}
      aria-hidden="true"
    />
  )
}

export type { MeteorState }
export default MeteorTrail
