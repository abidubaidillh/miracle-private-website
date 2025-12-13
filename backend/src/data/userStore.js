const fs = require('fs')
const path = require('path')

const FILE = path.resolve(__dirname, '../../.tmp_user_roles.json')
let store = new Map()

function load() {
  try {
    if (fs.existsSync(FILE)) {
      const raw = fs.readFileSync(FILE, 'utf8')
      const obj = JSON.parse(raw || '{}')
      store = new Map(Object.entries(obj))
    }
  } catch (e) {
    // ignore
    store = new Map()
  }
}

function persist() {
  try {
    const obj = Object.fromEntries(store)
    fs.writeFileSync(FILE, JSON.stringify(obj, null, 2), 'utf8')
  } catch (e) {
    // ignore
  }
}

load()

function saveRole(id, email, role) {
  if (!id) return false
  // NORMALIZE role to UPPERCASE
  const normalizedRole = (role || '').toUpperCase()
  store.set(id, { id, email, role: normalizedRole })
  persist()
  return true
}

function getRole(id) {
  const v = store.get(id)
  // Return role already normalized (stored in UPPERCASE)
  return v ? v.role : null
}

function getUser(id) {
  return store.get(id) || null
}

module.exports = { saveRole, getRole, getUser }
