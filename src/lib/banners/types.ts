// Клиент-безопасный тип баннера (без серверных импортов).
export type Banner = {
  id: string
  title: string
  subtitle: string
  bgColor: string
  textColor: "light" | "dark"
  image: string
  href: string
  isVisible: boolean
  sort: number
}
