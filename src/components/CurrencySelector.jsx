import React, { useState } from 'react'

// Выбор валюты и ввод суммы (stateful-компонент, К2).
// При любом изменении вызывает onCurrencyChange(currency, amount) — родитель получает
// и валюту, и сумму сразу (К4).
const CurrencySelector = ({ onCurrencyChange, error }) => {
  const [currency, setCurrency] = useState('USD')
  const [amount, setAmount] = useState('')

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value)
    // Новую валюту передаём вместе с текущей суммой
    onCurrencyChange(e.target.value, amount)
  }

  const handleAmountChange = (e) => {
    setAmount(e.target.value)
    // Новую сумму передаём вместе с текущей валютой
    onCurrencyChange(currency, e.target.value)
  }

  return (
    <div className="currency-selector">
      <label htmlFor="currency">Валюта</label>
      <select id="currency" value={currency} onChange={handleCurrencyChange}>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="RUB">RUB</option>
      </select>
      <label htmlFor="amount">Сумма</label>
      <input
        id="amount"
        type="number"
        min="0"
        step="any"
        value={amount}
        onChange={handleAmountChange}
        placeholder="Введите сумму"
        className={error ? 'invalid' : ''}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  )
}

export default CurrencySelector
