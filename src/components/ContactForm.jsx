import React, { useState } from 'react'
import InputField from './InputField'
import CurrencySelector from './CurrencySelector'
import { RATES_PER_USD, convert, formatMoney } from '../utils/currency'

// Адрес, куда отправляется заявка. По умолчанию — адрес из задания (заглушка example.com,
// настоящего сервера там нет, поэтому реальная отправка закончится ошибкой — это и есть
// проверка обработчика ошибок). Для проверки успеха можно задать VITE_SUBMIT_URL.
const SUBMIT_URL = import.meta.env.VITE_SUBMIT_URL || 'https://example.com/api/submit'

const EMPTY_FORM = { name: '', email: '', message: '', currency: 'USD', amount: '' }

// Проверка полей перед отправкой: возвращает объект { поле: 'текст ошибки' }
function validate(data) {
  const errors = {}
  if (!data.name.trim()) errors.name = 'Введите имя'
  if (!data.email.trim()) errors.email = 'Введите email'
  else if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.email = 'Некорректный email'
  if (!data.message.trim()) errors.message = 'Введите сообщение'
  if (!(Number(data.amount) > 0)) errors.amount = 'Введите сумму больше нуля'
  return errors
}

const ContactForm = () => {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({}) // ошибки валидации по полям
  const [status, setStatus] = useState(null) // { type: 'success' | 'error', text } — итог отправки
  const [sending, setSending] = useState(false)
  // Дочерние поля хранят своё значение сами; чтобы очистить их после успешной отправки,
  // меняем key — React создаёт компоненты заново с пустым состоянием.
  const [formKey, setFormKey] = useState(0)

  // Обновление текстовых полей. Функциональная форма setState берёт самое свежее состояние,
  // поэтому два быстрых обновления подряд не затирают друг друга.
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined })) // как только пользователь правит поле, убираем его ошибку
  }

  // Обновление валюты и суммы (К4)
  const handleCurrencyChange = (currency, amount) => {
    setFormData((prev) => ({ ...prev, currency, amount }))
    setErrors((prev) => ({ ...prev, amount: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault() // не даём браузеру перезагрузить страницу
    setStatus(null)

    // 1. Валидация: при ошибках показываем их под полями и не отправляем форму
    const newErrors = validate(formData)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    // 2. Собираем FormData (К3): ключ-значение для каждого поля формы
    const data = new FormData()
    Object.keys(formData).forEach((key) => data.append(key, formData[key]))
    // Дополнительно отправляем сумму в долларах — серверу удобно сравнивать заявки
    data.append('amountUsd', convert(formData.amount, formData.currency, 'USD').toFixed(2))

    setSending(true)
    try {
      // 3. Отправка через fetch (К3). Заголовок Content-Type для FormData ставить не нужно —
      // браузер сам добавит multipart/form-data с нужной границей.
      const response = await fetch(SUBMIT_URL, { method: 'POST', body: data })
      if (response.ok) {
        setStatus({ type: 'success', text: 'Форма успешно отправлена!' })
        setFormData(EMPTY_FORM) // очищаем данные формы
        setFormKey((k) => k + 1) // и сами поля
      } else {
        // Сервер ответил, но с кодом ошибки (4xx/5xx)
        setStatus({ type: 'error', text: `Ошибка при отправке формы (код ответа ${response.status}).` })
      }
    } catch (error) {
      // Сети нет, сервер недоступен или запрос заблокирован браузером (CORS)
      console.error('Ошибка:', error)
      setStatus({ type: 'error', text: 'Ошибка при отправке формы: не удалось связаться с сервером.' })
    } finally {
      setSending(false)
    }
  }

  // Расчёт для блока «Эквивалент»: переводим введённую сумму в две другие валюты (К4)
  const showConversion = Number(formData.amount) > 0
  const otherCurrencies = Object.keys(RATES_PER_USD).filter((c) => c !== formData.currency)

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <h2>Обмен валюты</h2>

      {/* key={formKey} — при смене ключа поля пересоздаются и очищаются */}
      <InputField
        key={`name-${formKey}`}
        label="Имя"
        type="text"
        name="name"
        placeholder="Введите ваше имя"
        onChange={handleInputChange}
        error={errors.name}
      />
      <InputField
        key={`email-${formKey}`}
        label="Email"
        type="email"
        name="email"
        placeholder="Введите ваш email"
        onChange={handleInputChange}
        error={errors.email}
      />
      <InputField
        key={`message-${formKey}`}
        label="Сообщение"
        type="text"
        name="message"
        placeholder="Введите сообщение"
        onChange={handleInputChange}
        error={errors.message}
      />
      <CurrencySelector key={`currency-${formKey}`} onCurrencyChange={handleCurrencyChange} error={errors.amount} />

      {showConversion && (
        <div className="conversion">
          <strong>
            {formatMoney(Number(formData.amount))} {formData.currency}
          </strong>{' '}
          =
          {otherCurrencies.map((code) => (
            <span key={code} className="conversion-item">
              {formatMoney(convert(formData.amount, formData.currency, code))} {code}
            </span>
          ))}
          <div className="conversion-note">Курсы учебные: 1 USD = 0,92 EUR = 95 RUB</div>
        </div>
      )}

      <button type="submit" disabled={sending}>
        {sending ? 'Отправка…' : 'Отправить заявку'}
      </button>

      {status && (
        <div className={`status ${status.type}`} role="status">
          {status.text}
        </div>
      )}
    </form>
  )
}

export default ContactForm
