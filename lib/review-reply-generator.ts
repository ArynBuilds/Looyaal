// lib/review-reply-generator.ts — Generates Turkish review replies
// MVP: template-based. Later: Claude Haiku API.

export function generateReviewReply(shopName: string, rating: number, reviewText: string): string {
  // 5-star: thank + invite back
  if (rating === 5) {
    const templates = [
      `Çok teşekkür ederiz! ${shopName} olarak sizleri ağırlamaktan mutluluk duyuyoruz. Tekrar bekleriz!`,
      `Harika yorumunuz için teşekkürler! Sizi yeniden görmek için sabırsızlanıyoruz.`,
      `Değerli yorumunuz bizi çok mutlu etti. ${shopName}'de her zaman yeriniz hazır!`,
    ]
    return templates[Math.floor(Math.random() * templates.length)]
  }

  // 4-star: thank + note we'll improve
  if (rating === 4) {
    return `Güzel yorumunuz için teşekkür ederiz! Sizin için daha da iyisini sunmak istiyoruz. ${shopName}'de tekrar görüşmek üzere!`
  }

  // 3-star: acknowledge + promise improvement
  if (rating === 3) {
    return `Değerlendirmeniz için teşekkürler. Deneyiminizi iyileştirmek için çalışıyoruz. Bir sonraki ziyaretinizde farkı göreceksiniz!`
  }

  // 1-2 star: apologize + offer to make it right
  if (reviewText && reviewText.length > 10) {
    return `Yaşadığınız deneyim için çok üzgünüz. Geri bildiriminiz bizim için çok değerli. Durumu düzeltmek istiyoruz — lütfen bize ulaşın.`
  }

  return `Değerlendirmeniz için teşekkürler. Müşteri memnuniyeti bizim için en önemli öncelik. Deneyiminizi iyileştirmek için buradayız.`
}
