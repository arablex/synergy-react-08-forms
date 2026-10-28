import React, { useState } from 'react'

// Текстовое поле (stateful-компонент, К2): хранит своё значение в собственном состоянии
// и сообщает родителю об изменении через onChange(name, value).
// error — необязательный текст ошибки валидации, который показывается под полем (К5).
const InputField = ({ label, type, name, placeholder, onChange, error }) => {
  const [value, setValue] = useState('')

  const handleChange = (e) => {
    setValue(e.target.value) // обновляем локальное состояние поля
    onChange(name, e.target.value) // и передаём значение наверх, в ContactForm
  }

  return (
    <div className="input-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        className={error ? 'invalid' : ''}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  )
}

export default InputField
