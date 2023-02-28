import React, { useState } from 'react'
import $ from './input.module.scss'

export default function Input({
  type,
  name,
  title,
  value,
  maxLength,
  placeholder,
  unit,
  inputRef,
  onKeyPress,
  onChange,
  id,
}) {
  return (
    <div className={$.input_box}>
      <input
        ref={inputRef}
        {...{ type, name, title, value, maxLength, placeholder, onKeyPress, onChange, id }}
      />
      {unit && <p className={$.unit}>{unit}</p>}
    </div>
  )
}
