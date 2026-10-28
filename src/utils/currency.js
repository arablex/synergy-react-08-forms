// Учебные курсы валют: сколько единиц валюты стоит 1 доллар США.
// (В реальном проекте курсы приходят с сервера; здесь они фиксированные, чтобы расчёт был предсказуемым.)
export const RATES_PER_USD = {
  USD: 1,
  EUR: 0.92,
  RUB: 95,
}

// Перевод суммы из одной валюты в другую через доллар:
// сначала переводим в USD (делим на курс исходной валюты), затем в нужную (умножаем на её курс).
export function convert(amount, from, to) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return 0
  return (value / RATES_PER_USD[from]) * RATES_PER_USD[to]
}

// Красивый вывод числа: 2 знака после запятой и разделители тысяч
export function formatMoney(value) {
  return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
