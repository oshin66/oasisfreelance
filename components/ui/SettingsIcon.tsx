'use client'

type Props = {
  size?: number
  className?: string
}

export default function SettingsIcon({ size = 16, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="coSettingsGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#EFE6FF" />
          <stop offset="55%" stopColor="#B47CFF" />
          <stop offset="100%" stopColor="#6D2CCB" />
        </radialGradient>
      </defs>
      <path
        d="M10.713 2.073a1.5 1.5 0 0 1 2.574 0l.738 1.278a1.5 1.5 0 0 0 1.57.715l1.447-.27a1.5 1.5 0 0 1 2.046 1.563l-.144 1.47a1.5 1.5 0 0 0 .84 1.496l1.324.654a1.5 1.5 0 0 1 .79 2.452l-1.01 1.078a1.5 1.5 0 0 0-.327 1.684l.586 1.355a1.5 1.5 0 0 1-1.03 2.365l-1.45.251a1.5 1.5 0 0 0-1.162 1.261l-.193 1.464a1.5 1.5 0 0 1-2.289 1.053l-1.247-.79a1.5 1.5 0 0 0-1.716 0l-1.247.79a1.5 1.5 0 0 1-2.289-1.053l-.193-1.464a1.5 1.5 0 0 0-1.162-1.261l-1.45-.25a1.5 1.5 0 0 1-1.03-2.366l.586-1.355a1.5 1.5 0 0 0-.327-1.684l-1.01-1.078a1.5 1.5 0 0 1 .79-2.452l1.324-.654a1.5 1.5 0 0 0 .84-1.496l-.144-1.47a1.5 1.5 0 0 1 2.046-1.563l1.447.27a1.5 1.5 0 0 0 1.57-.715l.738-1.278Z"
        fill="url(#coSettingsGrad)"
      />
      <circle cx="12" cy="12" r="3.3" fill="#F5EEFF" />
    </svg>
  )
}
