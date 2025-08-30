import * as React from "react"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked, onCheckedChange, ...props }, ref) => {
    return (
      <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={e => onCheckedChange?.(e.target.checked)}
          style={{ display: "none" }}
          {...props}
        />
        <span
          style={{
            width: 36,
            height: 20,
            background: checked ? "#4f46e5" : "#e5e7eb",
            borderRadius: 9999,
            position: "relative",
            transition: "background 0.2s",
            display: "inline-block"
          }}
        >
          <span
            style={{
              position: "absolute",
              left: checked ? 18 : 2,
              top: 2,
              width: 16,
              height: 16,
              background: "#fff",
              borderRadius: "50%",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              transition: "left 0.2s"
            }}
          />
        </span>
      </label>
    )
  }
)

Switch.displayName = "Switch"
