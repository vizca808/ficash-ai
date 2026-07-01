
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultCategories = [
  // EXPENSE
  { id: 'cat_food', name: 'Makan & Minum', icon: '🍔', color: '#FF6B6B', type: 'EXPENSE', sortOrder: 1 },
  { id: 'cat_transport', name: 'Transportasi', icon: '🚗', color: '#4ECDC4', type: 'EXPENSE', sortOrder: 2 },
  { id: 'cat_shopping', name: 'Belanja', icon: '🛒', color: '#45B7D1', type: 'EXPENSE', sortOrder: 3 },
  { id: 'cat_entertainment', name: 'Hiburan', icon: '🎮', color: '#96CEB4', type: 'EXPENSE', sortOrder: 4 },
  { id: 'cat_bills', name: 'Tagihan & Utilitas', icon: '💡', color: '#FFEAA7', type: 'EXPENSE', sortOrder: 5 },
  { id: 'cat_health', name: 'Kesehatan', icon: '🏥', color: '#DDA0DD', type: 'EXPENSE', sortOrder: 6 },
  { id: 'cat_education', name: 'Pendidikan', icon: '📚', color: '#98D8C8', type: 'EXPENSE', sortOrder: 7 },
  { id: 'cat_household', name: 'Rumah Tangga', icon: '🏠', color: '#F7DC6F', type: 'EXPENSE', sortOrder: 8 },
  { id: 'cat_fashion', name: 'Fashion', icon: '👕', color: '#BB8FCE', type: 'EXPENSE', sortOrder: 9 },
  { id: 'cat_subscription', name: 'Langganan Digital', icon: '📱', color: '#85C1E9', type: 'EXPENSE', sortOrder: 10 },
  { id: 'cat_other_expense', name: 'Lainnya', icon: '❓', color: '#AEB6BF', type: 'EXPENSE', sortOrder: 11 },
  // INCOME
  { id: 'cat_salary', name: 'Gaji', icon: '💰', color: '#2ECC71', type: 'INCOME', sortOrder: 1 },
  { id: 'cat_freelance', name: 'Freelance', icon: '💼', color: '#27AE60', type: 'INCOME', sortOrder: 2 },
  { id: 'cat_bonus', name: 'Bonus', icon: '🎁', color: '#1ABC9C', type: 'INCOME', sortOrder: 3 },
  { id: 'cat_investment', name: 'Investasi', icon: '📈', color: '#16A085', type: 'INCOME', sortOrder: 4 },
  { id: 'cat_other_income', name: 'Lainnya (Pemasukan)', icon: '💵', color: '#82E0AA', type: 'INCOME', sortOrder: 5 },
]

async function main() {
  console.log(`Start seeding ...`)
  
  // Clean up existing data first
  await prisma.transaction.deleteMany()
  await prisma.aiInsight.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()
  
  // 1. Seed Categories
  for (const c of defaultCategories) {
    const category = await prisma.category.create({
      data: c,
    })
    console.log(`Created category with id: ${category.id}`)
  }
  
  // Dummy data has been removed so the dashboard starts fresh for new users.

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
