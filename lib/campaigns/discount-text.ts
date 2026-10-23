// Builds the badge text shown on a campaign card/banner (e.g. "%20 indirim",
// "20 TL indirim", "Bedava ikram", "2 Al 1 Öde").
export function buildDiscountText(offerType: string | null, offerValue: number | null): string {
  if (offerType === 'discount_percent' && offerValue) return `%${offerValue} indirim`
  if (offerType === 'discount_fixed' && offerValue) return `${offerValue} TL indirim`
  if (offerType === 'bogo') return '2 Al 1 Öde'
  if (offerType === 'free_item') return 'Bedava ikram'
  return ''
}
