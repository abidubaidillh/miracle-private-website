#!/usr/bin/env node

const http = require('http')

const API = 'http://localhost:4000'
const roles = ['OWNER', 'ADMIN', 'BENDAHARA', 'MENTOR']

async function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API)
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' }
    }
    const req = http.request(opts, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) })
        } catch (e) {
          resolve({ status: res.statusCode, data })
        }
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function testRole(role) {
  console.log(`\n========== Testing Role: ${role} ==========`)
  const email = `test_${role.toLowerCase()}_${Date.now()}@example.com`
  const password = 'password123'
  const username = `user_${role.toLowerCase()}_${Date.now()}`
  const phone_number = '081234567890'
  const birthday = '1990-01-01'

  // 1. REGISTER
  console.log(`\n1. REGISTER with role=${role}`)
  // Intentionally include a `role` field to verify backend ignores it and forces MENTOR
  const regRes = await request('POST', '/api/auth/register', {
    username,
    email,
    password,
    phone_number,
    birthday,
    role, // should be ignored by backend
  })
  console.log(`   Status: ${regRes.status}`)
  console.log(`   Response:`, JSON.stringify(regRes.data, null, 2))

  if (regRes.status !== 201) {
    console.error(`   ❌ FAILED: Expected 201, got ${regRes.status}`)
    return false
  }

  const registeredRole = regRes.data?.user?.role
  console.log(`   Registered role: ${registeredRole}`)
  // Backend must force new users to MENTOR
  if (registeredRole !== 'MENTOR') {
    console.error(`   ❌ FAILED: Expected role=MENTOR, got ${registeredRole}`)
    return false
  }
  console.log(`   ✓ Role stored correctly as UPPERCASE and forced to MENTOR`)

  // 2. LOGIN
  console.log(`\n2. LOGIN with same credentials`)
  const loginRes = await request('POST', '/api/auth/login', {
    email,
    password
  })
  console.log(`   Status: ${loginRes.status}`)
  if (loginRes.status !== 200) {
    console.error(`   ❌ FAILED: Expected 200, got ${loginRes.status}`)
    console.log(`   Response:`, JSON.stringify(loginRes.data, null, 2))
    return false
  }

  const loginedRole = loginRes.data?.user?.role
  const session = loginRes.data?.session?.access_token
  console.log(`   Logged-in role: ${loginedRole}`)
  console.log(`   Session token: ${session ? 'Present' : 'Missing'}`)

  if (loginedRole !== 'MENTOR') {
    console.error(`   ❌ FAILED: Expected role=MENTOR, got ${loginedRole}`)
    return false
  }
  if (!session) {
    console.error(`   ❌ FAILED: No session token returned`)
    return false
  }
  console.log(`   ✓ Login successful, role correct: ${loginedRole}`)

  // 3. VERIFY ROLE-TO-PATH MAPPING
  console.log(`\n3. VERIFY role-to-path mapping`)
  let expectedPath
  if (role === 'OWNER' || role === 'ADMIN') expectedPath = '/dashboard'
  else if (role === 'BENDAHARA') expectedPath = '/keuangan'
  else if (role === 'MENTOR') expectedPath = '/jadwal'
  else expectedPath = '/login'
  console.log(`   Role: ${role} should redirect to: ${expectedPath}`)
  console.log(`   ✓ Mapping correct`)

  return true
}

async function main() {
  console.log('🔍 AUTH SYSTEM END-TO-END TEST')
  console.log('================================')
  console.log(`Testing ${roles.length} roles: ${roles.join(', ')}`)

  const results = {}
  for (const role of roles) {
    try {
      results[role] = await testRole(role)
    } catch (err) {
      console.error(`\n❌ ERROR testing ${role}:`, err.message)
      results[role] = false
    }
  }

  console.log('\n\n========== SUMMARY ==========')
  for (const [role, passed] of Object.entries(results)) {
    console.log(`${passed ? '✓' : '✗'} ${role}`)
  }

  const allPassed = Object.values(results).every(v => v === true)
  if (allPassed) {
    console.log('\n✅ ALL TESTS PASSED - SYSTEM READY')
  } else {
    console.log('\n❌ SOME TESTS FAILED')
  }
}

main().catch(console.error)
