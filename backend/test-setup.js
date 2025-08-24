#!/usr/bin/env node

/**
 * Simple test script to verify backend setup
 * Run with: node test-setup.js
 */

const { PrismaClient } = require('@prisma/client')

async function testSetup() {
  console.log('🧪 Testing backend setup...\n')
  
  try {
    // Test database connection
    console.log('1. Testing database connection...')
    const prisma = new PrismaClient()
    await prisma.$connect()
    console.log('✅ Database connection successful\n')
    
    // Test Prisma client generation
    console.log('2. Testing Prisma client...')
    const userCount = await prisma.user.count()
    console.log(`✅ Prisma client working (${userCount} users found)\n`)
    
    // Test environment variables
    console.log('3. Testing environment variables...')
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ]
    
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    if (missing.length > 0) {
      console.log(`⚠️  Missing environment variables: ${missing.join(', ')}`)
      console.log('   Create a .env file with these variables\n')
    } else {
      console.log('✅ All required environment variables present\n')
    }
    
    await prisma.$disconnect()
    
    console.log('🎉 Backend setup test completed!')
    console.log('\nNext steps:')
    console.log('1. npm run dev (start development server)')
    console.log('2. Test API endpoints with Postman/curl')
    console.log('3. Update frontend VITE_USE_API=true to test integration')
    console.log('4. Test the Tulip dating app features')
    
  } catch (error) {
    console.error('❌ Setup test failed:', error.message)
    console.log('\nTroubleshooting:')
    console.log('1. Check DATABASE_URL is correct')
    console.log('2. Run: npm run db:generate')
    console.log('3. Run: npm run db:push')
    process.exit(1)
  }
}

testSetup()
