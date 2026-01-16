'use client';

/**
 * PlacementControls Component
 *
 * UI controls for adjusting placement: rotation, scale, shadow toggle, perspective.
 */

export interface PlacementControlsProps {
  rotationY: number;
  scale: number;
  shadowEnabled: boolean;
  perspectivePitch: number;
  onRotationChange: (_v: number) => void;
  onScaleChange: (_v: number) => void;
  onShadowToggle: (_v: boolean) => void;
  onPerspectiveChange: (_v: number) => void;
  onExport: () => void;
}

export function PlacementControls({
  rotationY,
  scale,
  shadowEnabled,
  perspectivePitch,
  onRotationChange,
  onScaleChange,
  onShadowToggle,
  onPerspectiveChange,
  onExport,
}: PlacementControlsProps) {
  return (
    <div className="placement-controls">
      <div className="placement-controls__group">
        <label className="placement-controls__label">
          Rotation
          <input
            type="range"
            min={0}
            max={360}
            value={rotationY}
            onChange={(e) => onRotationChange(Number(e.target.value))}
            className="placement-controls__slider"
          />
          <span className="placement-controls__value">{rotationY}°</span>
        </label>
      </div>

      <div className="placement-controls__group">
        <label className="placement-controls__label">
          Scale
          <input
            type="range"
            min={0.1}
            max={3}
            step={0.1}
            value={scale}
            onChange={(e) => onScaleChange(Number(e.target.value))}
            className="placement-controls__slider"
          />
          <span className="placement-controls__value">{scale.toFixed(1)}x</span>
        </label>
      </div>

      <div className="placement-controls__group">
        <label className="placement-controls__label">
          Perspective
          <input
            type="range"
            min={-15}
            max={15}
            value={perspectivePitch}
            onChange={(e) => onPerspectiveChange(Number(e.target.value))}
            className="placement-controls__slider"
          />
          <span className="placement-controls__value">{perspectivePitch}°</span>
        </label>
      </div>

      <div className="placement-controls__group">
        <label className="placement-controls__checkbox">
          <input
            type="checkbox"
            checked={shadowEnabled}
            onChange={(e) => onShadowToggle(e.target.checked)}
          />
          Shadow
        </label>
      </div>

      <button
        type="button"
        onClick={onExport}
        className="placement-controls__export"
      >
        Export
      </button>
    </div>
  );
}
