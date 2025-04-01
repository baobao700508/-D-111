interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  onLabel?: string
  offLabel?: string
  disabled?: boolean
}

const ToggleSwitch = ({ 
  checked, 
  onChange, 
  onLabel = 'On', 
  offLabel = 'Off', 
  disabled = false 
}: ToggleSwitchProps) => {
  return (
    <div className="flex items-center">
      <label className="relative inline-block h-6 w-11">
        <input 
          type="checkbox" 
          className="peer h-0 w-0 opacity-0"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span 
          className={`absolute left-0 right-0 bottom-0 top-0 cursor-pointer rounded-full 
            transition-all duration-300 ease-in-out
            ${checked ? 'bg-blue-500' : 'bg-gray-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <span 
            className={`absolute bottom-1 h-4 w-4 rounded-full bg-white 
              transition-all duration-300 ease-in-out
              ${checked ? 'left-6' : 'left-1'}`}
          >
          </span>
        </span>
      </label>
      <span className="ml-2 text-sm text-zinc-300">
        {checked ? onLabel : offLabel}
      </span>
    </div>
  )
}

export default ToggleSwitch 