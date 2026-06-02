const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const org = await prisma.organization.findUnique({
    where: { slug: 'gsis' }
  })
  
  console.log('Organization:', org.name)
  console.log('Theme Class:', org.portalTheme)
  console.log('Branding:', org.portalBranding)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
