import { StrictMode, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createPortal } from 'react-dom'
import agencyLogo from '../assets/logo-peternakan.png'
import {
  Activity,
  ArrowDownToLine,
  ArrowUpDown,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  ClipboardList,
  Copy,
  Database,
  Eye,
  EyeOff,
  FileCog,
  Filter,
  Gauge,
  Grid2X2,
  Leaf,
  LogOut,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  Trash2,
  UserRound,
  UsersRound,
  Upload,
  X,
} from 'lucide-react'
import './styles.css'

const initialFields = [
  { id: 'f1', label: 'Nama kelompok penerima', key: 'nama_kelompok', type: 'text', required: true, active: true, options: '' },
  { id: 'f2', label: 'Komoditas ternak', key: 'komoditas_ternak', type: 'checklist', required: true, active: true, options: 'Sapi;Kambing;Domba;Ayam' },
  { id: 'f3', label: 'Wilayah', key: 'wilayah', type: 'list', required: true, active: true, options: 'Kab. Bandung;Kab. Garut;Kab. Sumedang;Kab. Tasikmalaya' },
  { id: 'f4', label: 'Tanggal pengajuan', key: 'tanggal_pengajuan', type: 'date', required: true, active: true, options: '' },
  { id: 'f5', label: 'Nilai bantuan (Rp)', key: 'nilai_bantuan', type: 'number', required: true, active: true, options: '' },
  { id: 'f6', label: 'Catatan verifikasi', key: 'catatan_verifikasi', type: 'paragraph', required: false, active: true, options: '' },
]

const initialRecords = [
  { id: 1, noId: 'ID-0000000001', status: 'Disetujui', createdAt: '12 Sep 2026', values: { nama_kelompok: 'Koperasi Ternak Makmur', komoditas_ternak: ['Sapi'], wilayah: 'Kab. Bandung', tanggal_pengajuan: '2026-09-12', nilai_bantuan: '125000000', catatan_verifikasi: 'Dokumen lengkap dan telah diverifikasi.' } },
  { id: 2, noId: 'ID-0000000002', status: 'Menunggu', createdAt: '10 Sep 2026', values: { nama_kelompok: 'Kelompok Domba Sejahtera', komoditas_ternak: ['Domba', 'Kambing'], wilayah: 'Kab. Garut', tanggal_pengajuan: '2026-09-10', nilai_bantuan: '85000000', catatan_verifikasi: 'Menunggu kunjungan lapangan.' } },
  { id: 3, noId: 'ID-0000000003', status: 'Disetujui', createdAt: '08 Sep 2026', values: { nama_kelompok: 'Sentra Ayam Mandiri', komoditas_ternak: ['Ayam'], wilayah: 'Kab. Sumedang', tanggal_pengajuan: '2026-09-08', nilai_bantuan: '67500000', catatan_verifikasi: 'Rekomendasi teknis tersedia.' } },
  { id: 4, noId: 'ID-0000000004', status: 'Review', createdAt: '05 Sep 2026', values: { nama_kelompok: 'Peternak Muda Lestari', komoditas_ternak: ['Sapi', 'Kambing'], wilayah: 'Kab. Tasikmalaya', tanggal_pengajuan: '2026-09-05', nilai_bantuan: '145000000', catatan_verifikasi: 'Perlu penyesuaian rencana anggaran.' } },
]

const initialUsers = [
  { id: 'u1', name: 'Admin Sistem', username: 'admin', email: 'admin@dinas.go.id', password: 'admin123', role: 'superadmin', status: 'Aktif' },
  { id: 'u2', name: 'Rina Kurnia', username: 'rina', email: 'rina@dinas.go.id', password: 'rina123', role: 'user', status: 'Aktif' },
  { id: 'u3', name: 'Bagus Pratama', username: 'bagus', email: 'bagus@dinas.go.id', password: 'bagus123', role: 'user', status: 'Nonaktif' },
]

const databaseStateProperties = {
  'hibah-fields': 'fields',
  'hibah-records': 'records',
  'hibah-verification-fields': 'verificationFields',
  'hibah-verifications': 'verifications',
}

const typeLabels = { text: 'Teks singkat', paragraph: 'Paragraf', number: 'Angka', currency: 'Anggaran', header: 'Header', separator: 'Separator', date: 'Tanggal', time: 'Waktu', checklist: 'Checklist', list: 'Pilihan list' }
const navItems = [
  { id: 'overview', label: 'Ringkasan', icon: Gauge },
  { id: 'database', label: 'Database hibah', icon: Database },
  { id: 'fields', label: 'Config field', icon: FileCog, admin: true },
  { id: 'verification-database', label: 'Database Verifikasi Hibah', icon: ClipboardCheck },
  { id: 'verification-config', label: 'Config Form Verifikasi', icon: FileCog, admin: true },
]

function usePersistedState(key, fallback) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  })
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value])
  return [value, setValue]
}

function applySyncEvents(current, events, collection) {
  let next = current
  for (const event of events) {
    if (event.collection !== collection) continue
    const identity = collection === 'verifications' ? 'hibahId' : 'id'
    const entityId = String(event.entityId)
    if (event.operation === 'delete') {
      next = next.filter((item) => String(item[identity]) !== entityId)
      continue
    }
    if (!event.payload) continue
    const incoming = event.payload
    const index = next.findIndex((item) => String(item[identity]) === String(incoming[identity]))
    if (index < 0) {
      next = collection === 'records' || collection === 'verifications'
        ? [incoming, ...next]
        : [...next, incoming]
    } else {
      next = next.map((item, itemIndex) => itemIndex === index ? { ...item, ...incoming } : item)
    }
  }

  if (collection === 'fields' || collection === 'verification-fields') {
    next = [...next].sort((left, right) => Number(left.order || 0) - Number(right.order || 0))
  } else if (collection === 'users') {
    next = [...next].sort((left, right) => left.name.localeCompare(right.name))
  }
  return next
}

function useDatabaseState(key, fallback, endpoint) {
  const [value, setValue] = useState(fallback)
  const [ready, setReady] = useState(false)
  const lastDatabaseValue = useRef(null)
  const syncCursor = useRef(0)
  const valueRef = useRef(value)
  const saveQueue = useRef(Promise.resolve())
  valueRef.current = value
  const collection = endpoint
  const saveValue = (nextValue) => {
    const serialized = JSON.stringify(nextValue)
    if (serialized === lastDatabaseValue.current) return Promise.resolve(true)
    const save = saveQueue.current.catch(() => {}).then(async () => {
      const response = await fetch(`/api/index.php?action=${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [endpoint]: nextValue }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`)
      lastDatabaseValue.current = serialized
      window.dispatchEvent(new CustomEvent('hibah:sync-saved', { detail: { key, savedAt: Date.now() } }))
      return true
    })
    saveQueue.current = save
    return save
  }

  useEffect(() => {
    let cancelled = false
    const saved = localStorage.getItem(key)
    const legacyValue = saved ? JSON.parse(saved) : fallback

    fetch('/api/index.php?action=state')
      .then(async (response) => {
        const state = await response.json()
        if (!response.ok) throw new Error(state.error || 'Database tidak dapat dibaca.')
        syncCursor.current = Number(state.syncCursor || 0)
        if (key === 'hibah-users') {
          if (state.usersInitialized) {
            lastDatabaseValue.current = JSON.stringify(state.users)
            if (!cancelled) setValue(state.users)
            return
          }

          const initializeResponse = await fetch('/api/index.php?action=users-initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users: legacyValue }),
          })
          const initializedUsers = await initializeResponse.json()
          if (!initializeResponse.ok) throw new Error(initializedUsers.error || 'Migrasi pengguna gagal.')
          lastDatabaseValue.current = JSON.stringify(initializedUsers.users)
          if (!cancelled) setValue(initializedUsers.users)
          return
        }
        if (state.initialized) {
          const databaseValue = state[databaseStateProperties[key]]
          lastDatabaseValue.current = JSON.stringify(databaseValue)
          if (!cancelled) setValue(databaseValue)
          return
        }

        const initialState = { fields: key === 'hibah-fields' ? legacyValue : initialFields, records: key === 'hibah-records' ? legacyValue : initialRecords }
        const initializeResponse = await fetch('/api/index.php?action=initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(initialState),
        })
        const initializedState = await initializeResponse.json()
        if (!initializeResponse.ok) throw new Error(initializedState.error || 'Migrasi data gagal.')
        const databaseValue = initializedState[databaseStateProperties[key]]
        lastDatabaseValue.current = JSON.stringify(databaseValue)
        if (!cancelled) setValue(databaseValue)
      })
      .catch((error) => {
        console.error(`Database ${key} tidak tersedia:`, error)
        if (!cancelled) setValue(legacyValue)
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })

    return () => { cancelled = true }
  }, [key])

  useEffect(() => {
    if (!ready) return
    let cancelled = false
    let pullPromise = null
    const pullChanges = (force = false) => {
      if (cancelled) return Promise.resolve(true)
      if (pullPromise) return pullPromise
      pullPromise = (async () => {
        try {
        if (!force && JSON.stringify(valueRef.current) !== lastDatabaseValue.current) return true
        let hasMore = true
        while (hasMore && !cancelled) {
          const response = await fetch(`/api/index.php?action=sync&since=${syncCursor.current}&limit=200`)
          const batch = await response.json()
          if (!response.ok) throw new Error(batch.error || `HTTP ${response.status}`)
          if (cancelled) return true

          if (batch.events?.length) {
            const updated = applySyncEvents(valueRef.current, batch.events, collection)
            const serialized = JSON.stringify(updated)
            lastDatabaseValue.current = serialized
            valueRef.current = updated
            setValue(updated)
          }
          syncCursor.current = Number(batch.cursor ?? syncCursor.current)
          hasMore = Boolean(batch.hasMore)
        }
        window.dispatchEvent(new CustomEvent('hibah:sync-pulled', { detail: { key, pulledAt: Date.now() } }))
        return true
      } catch (error) {
        console.error(`Gagal menarik perubahan ${key} dari database:`, error)
        if (!cancelled) window.dispatchEvent(new CustomEvent('hibah:sync-error', { detail: error.message }))
        return false
        }
      })().finally(() => { pullPromise = null })
      return pullPromise
    }

    const handleManualSync = (event) => {
      const task = (async () => {
        try {
          await saveValue(valueRef.current)
          return await pullChanges(true)
        } catch (error) {
          console.error(`Gagal menyimpan atau menarik perubahan ${key}:`, error)
          window.dispatchEvent(new CustomEvent('hibah:sync-error', { detail: error.message }))
          return false
        }
      })()
      event.detail?.tasks?.push(task)
    }
    const interval = window.setInterval(pullChanges, 3000)
    window.addEventListener('hibah:sync-now', handleManualSync)
    return () => { cancelled = true; window.clearInterval(interval); window.removeEventListener('hibah:sync-now', handleManualSync) }
  }, [collection, endpoint, key, ready])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(key, JSON.stringify(value))
    saveValue(value).catch((error) => {
      console.error(`Gagal menyimpan ${key} ke database:`, error)
      window.dispatchEvent(new CustomEvent('hibah:sync-error', { detail: error.message }))
    })
  }, [endpoint, key, ready, value])

  return [value, setValue]
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(value || 0))
}

function formatBudget(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits ? `Rp ${formatCurrency(digits)}` : ''
}

function parseBudget(value) {
  return String(value).replace(/\D/g, '')
}

function isDataField(field) {
  return !['nama_kelompok', 'catatan_verifikasi'].includes(field.key) && !['header', 'separator'].includes(field.type)
}

function formatGrantId(number) {
  return `ID-${String(number).padStart(10, '0')}`
}

function getUserInitials(user) {
  return user?.name?.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'AS'
}

function getNextGrantId(records) {
  const highest = records.reduce((max, record) => {
    const number = Number(String(record.noId || '').replace(/^ID-/, ''))
    return Number.isFinite(number) ? Math.max(max, number) : max
  }, 0)
  return formatGrantId(highest + 1)
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('hibah-auth') === 'true')
  const [role, setRole] = usePersistedState('hibah-role', 'superadmin')
  const [theme, setTheme] = usePersistedState('hibah-theme', 'green')
  const [language, setLanguage] = usePersistedState('hibah-language', 'id')
  const [records, setRecords] = useDatabaseState('hibah-records', initialRecords, 'records')
  const [fields, setFields] = useDatabaseState('hibah-fields', initialFields, 'fields')
  const [verificationFields, setVerificationFields] = useDatabaseState('hibah-verification-fields', [], 'verification-fields')
  const [verifications, setVerifications] = useDatabaseState('hibah-verifications', [], 'verifications')
  const [users, setUsers] = useDatabaseState('hibah-users', initialUsers, 'users')
  const [activeUserId, setActiveUserId] = useState(() => localStorage.getItem('hibah-user-id'))
  const [sidebarCollapsed, setSidebarCollapsed] = usePersistedState('hibah-sidebar-collapsed', false)
  const [activePage, setActivePage] = useState('overview')
  const [loginError, setLoginError] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [loginSuccessName, setLoginSuccessName] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState('idle')
  const [lastSyncAt, setLastSyncAt] = useState(null)
  useEffect(() => {
    const handleSyncError = () => setSyncStatus('error')
    const handleSyncSuccess = () => {
      setSyncStatus((current) => current === 'syncing' ? current : 'synced')
      setLastSyncAt(new Date())
    }
    window.addEventListener('hibah:sync-error', handleSyncError)
    window.addEventListener('hibah:sync-pulled', handleSyncSuccess)
    window.addEventListener('hibah:sync-saved', handleSyncSuccess)
    return () => {
      window.removeEventListener('hibah:sync-error', handleSyncError)
      window.removeEventListener('hibah:sync-pulled', handleSyncSuccess)
      window.removeEventListener('hibah:sync-saved', handleSyncSuccess)
    }
  }, [])
  const syncNow = () => {
    const tasks = []
    setSyncStatus('syncing')
    window.dispatchEvent(new CustomEvent('hibah:sync-now', { detail: { tasks } }))
    if (!tasks.length) {
      setSyncStatus('synced')
      setLastSyncAt(new Date())
      return
    }
    Promise.all(tasks).then((results) => {
      setSyncStatus(results.every(Boolean) ? 'synced' : 'error')
      if (results.every(Boolean)) setLastSyncAt(new Date())
    })
  }
  useEffect(() => {
    const handleProfileEdit = (event) => {
      if (event.target.closest('button')?.textContent.trim() === 'Edit profil') setAccountModalOpen(true)
    }
    document.addEventListener('click', handleProfileEdit)
    return () => document.removeEventListener('click', handleProfileEdit)
  }, [])
  useEffect(() => {
    const migratedRecords = records.map((record, index) => ({ ...record, noId: record.noId || formatGrantId(index + 1) }))
    if (migratedRecords.some((record, index) => record.noId !== records[index].noId)) setRecords(migratedRecords)
  }, [records, setRecords])

  const login = async (event) => {
    event.preventDefault()
    if (isLoggingIn) return
    const data = new FormData(event.currentTarget)
    const identifier = String(data.get('email') || '').trim().toLowerCase()
    const password = String(data.get('password') || '')
    if (!identifier || !password) return setLoginError(language === 'id' ? 'Isi username/email dan kata sandi terlebih dahulu.' : 'Enter your username/email and password first.')
    setLoginError('')
    setIsLoggingIn(true)
    try {
      const response = await fetch('/api/index.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Username/email atau password tidak sesuai.')
      const user = result.user
      setLoginSuccessName(user.name)
      window.setTimeout(() => {
        localStorage.setItem('hibah-auth', 'true')
        localStorage.setItem('hibah-user-id', user.id)
        setActiveUserId(user.id)
        setRole(user.role)
        setActivePage('overview')
        setShowLogoutConfirm(false)
        setIsLoggedIn(true)
        setIsLoggingIn(false)
        setLoginSuccessName('')
      }, 1100)
    } catch (error) {
      setLoginError(error.message || 'Username/email atau password tidak sesuai.')
      setIsLoggingIn(false)
    }
  }

  const logout = () => { fetch('/api/index.php?action=logout', { method: 'POST' }).catch((error) => console.error('Gagal mengakhiri sesi server:', error)); localStorage.removeItem('hibah-auth'); localStorage.removeItem('hibah-user-id'); setActiveUserId(null); setIsLoggedIn(false) }
  const activeUser = users.find((user) => user.id === activeUserId) || users.filter((user) => user.role === role && user.status === 'Aktif').at(-1) || users[0]
  const visibleFields = fields.filter((field) => field.active)
  const translations = language === 'id' ? { dashboard: 'Ringkasan', database: 'Database hibah', fields: 'Config field', settings: 'Pengaturan', welcome: 'Selamat datang kembali', records: 'Total pengajuan', approved: 'Disetujui', pending: 'Dalam proses', value: 'Total nilai bantuan', recent: 'Pengajuan terbaru' } : { dashboard: 'Overview', database: 'Grant database', fields: 'Field config', settings: 'Settings', welcome: 'Welcome back', records: 'Total applications', approved: 'Approved', pending: 'In progress', value: 'Total grant value', recent: 'Recent applications' }

  if (!isLoggedIn) return <LoginScreen onSubmit={login} error={loginError} isLoggingIn={isLoggingIn} loginSuccessName={loginSuccessName} role={role} setRole={setRole} />

  return (
    <div className={`app-shell theme-${theme}`} style={{ '--user-initials': `'${getUserInitials(activeUser)}'`, '--user-avatar-content': activeUser?.photo ? 'none' : `'${getUserInitials(activeUser)}'`, '--user-photo': activeUser?.photo ? `url("${activeUser.photo}")` : 'none', '--user-name': `'${activeUser?.name || 'Pengguna'}'`, '--user-role': `'${activeUser?.role === 'superadmin' ? 'Superadmin' : 'Operator data'}'` }}>
      <Sidebar activePage={activePage} setActivePage={(page) => { setActivePage(page); setMobileMenuOpen(false) }} role={role} user={activeUser} t={translations} onLogout={() => setShowLogoutConfirm(true)} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((current) => !current)} mobileOpen={mobileMenuOpen} />
      <main className="main-content">
        <Topbar onMenu={() => setMobileMenuOpen((current) => !current)} user={activeUser} theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} t={translations} profileMenuOpen={profileMenuOpen} onProfileMenu={() => setProfileMenuOpen((current) => !current)} onManageAccount={() => { setProfileMenuOpen(false); setAccountModalOpen(true) }} onLogout={() => { setProfileMenuOpen(false); setShowLogoutConfirm(true) }} onSync={syncNow} syncStatus={syncStatus} lastSyncAt={lastSyncAt} />
        <div className="content-wrap" data-page={activePage}>
          {activePage === 'overview' && <Overview records={records} fields={visibleFields} user={activeUser} t={translations} onNavigate={setActivePage} />}
          {activePage === 'database' && <DatabasePage records={records} setRecords={setRecords} fields={visibleFields} allFields={fields} verificationFields={verificationFields} verifications={verifications} setVerifications={setVerifications} user={activeUser} role={role} t={translations} />}
          {activePage === 'fields' && role === 'superadmin' && <FieldsPageBackup fields={fields} setFields={setFields} />}
          {activePage === 'fields' && role !== 'superadmin' && <AccessDenied onBack={() => setActivePage('overview')} />}
          {activePage === 'verification-config' && role === 'superadmin' && <VerificationFieldsPage fields={verificationFields} setFields={setVerificationFields} />}
          {activePage === 'verification-config' && role !== 'superadmin' && <AccessDenied onBack={() => setActivePage('overview')} />}
          {activePage === 'verification-database' && <VerificationDatabasePage records={records} verifications={verifications} setVerifications={setVerifications} verificationFields={verificationFields} hibahFields={visibleFields} user={activeUser} />}
          {activePage === 'settings' && <SettingsPage user={activeUser} onEditAccount={() => setAccountModalOpen(true)} theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} />}
          {activePage === 'users' && role === 'superadmin' && <UsersPage users={users} setUsers={setUsers} />}
          {activePage === 'users' && role !== 'superadmin' && <AccessDenied onBack={() => setActivePage('overview')} />}
        </div>
        <footer className="app-footer">© Dinas Pertanian dan Peternakan Provinsi Jawa Tengah - Bidang Peternakan - 2026</footer>
      </main>
      {showLogoutConfirm && <LogoutConfirm onCancel={() => setShowLogoutConfirm(false)} onConfirm={logout} />}
      {accountModalOpen && <AccountModal user={activeUser} onClose={() => setAccountModalOpen(false)} onSave={(updatedUser) => { setUsers((current) => current.map((user) => user.id === updatedUser.id ? updatedUser : user)); setAccountModalOpen(false) }} />}
    </div>
  )
}

function LoginScreen({ onSubmit, error, isLoggingIn, loginSuccessName, role, setRole }) {
  const [showPassword, setShowPassword] = useState(false)
  return <div className="login-page">
    <div className="login-art"><div className="art-top"><span className="logo-shell"><img className="agency-logo" src={agencyLogo} alt="Logo Dinas Pertanian dan Peternakan Provinsi Jawa Tengah" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement.querySelector('svg').style.display = 'block' }} /><Leaf size={31} /></span></div><div className="art-copy"><p className="eyebrow">SISTEM INFORMASI HIBAH</p><h1>HIBAH UANG<br /><em>BIDANG PETERNAKAN</em></h1><span className="art-rule" /><p className="art-quote">&quot;Ya TUHAN, berikan kami kejernihan dan ketenangan hati dalam menjalani tugas pengelolaan data hibah.&quot;</p></div><div className="agency-name">DINAS PERTANIAN DAN PETERNAKAN<br /><strong>PROVINSI JAWA TENGAH</strong></div></div>
    <div className="login-panel"><div className="login-box"><div className="mobile-brand"><span className="brand-mark"><Leaf size={18} /></span><span>Hibah Peternakan</span></div><p className="eyebrow">SILAKAN LOGIN KE AKUN ANDA</p><h2>SELAMAT DATANG</h2><form onSubmit={onSubmit}><label>USERNAME<div className="aero-input"><UserRound size={16} /><input name="email" type="text" placeholder="Masukkan username" autoComplete="username" /></div></label><label>PASSWORD<div className="aero-input password-wrap"><KeyIcon /><input name="password" type={showPassword ? 'text' : 'password'} placeholder="Masukkan password" autoComplete="current-password" /><button type="button" className="password-toggle" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>{error && <div className="form-error">{error}</div>}<button className={`primary-btn login-btn ${isLoggingIn ? 'is-loading' : ''}`} type="submit" disabled={isLoggingIn}>{isLoggingIn ? <><span className="login-spinner" /> MEMERIKSA AKUN...</> : <>MASUK APLIKASI <span>→</span></>}</button></form><div className="demo-login"><span>Mode demo:</span><button type="button" className={role === 'superadmin' ? 'active' : ''} onClick={() => setRole('superadmin')}>Superadmin</button><button type="button" className={role === 'user' ? 'active' : ''} onClick={() => setRole('user')}>User</button></div><p className="login-foot">© 2026 HIBAH BIDANG PETERNAKAN ·<br /> DINAS PERTANIAN DAN PETERNAKAN</p></div></div>{loginSuccessName && <div className="login-success-toast" role="status"><span className="success-check"><Check size={17} /></span><span><strong>Selamat datang, {loginSuccessName}</strong><small>Login berhasil, menyiapkan dashboard...</small></span></div>}
  </div>
}

function KeyIcon() { return <span className="key-icon"><ShieldCheck size={15} /></span> }

function LogoutConfirm({ onCancel, onConfirm }) {
  return <div className="logout-backdrop" role="presentation" onClick={onCancel}><section className="logout-modal" role="dialog" aria-modal="true" aria-labelledby="logout-title" onClick={(event) => event.stopPropagation()}><div className="logout-icon"><LogOut size={21} /></div><h2 id="logout-title">Apakah anda yakin untuk keluar aplikasi?</h2><p>Sesi Anda akan diakhiri dan Anda perlu login kembali untuk masuk.</p><div className="logout-actions"><button className="cancel-logout" onClick={onCancel}>Batal</button><button className="confirm-logout" onClick={onConfirm}>Ya Keluar</button></div></section></div>
}

function Sidebar({ activePage, setActivePage, role, user, t, onLogout, collapsed, onToggle, mobileOpen }) {
  return <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}><div className="sidebar-brand"><span className="brand-mark logo-brand"><img src={agencyLogo} alt="Logo E-HIBAH" /></span><div><strong>E-HIBAH</strong><small>Hibah Bidang Peternakan</small></div></div><button className="sidebar-toggle" onClick={onToggle} aria-label={collapsed ? 'Tampilkan menu' : 'Sembunyikan menu'} title={collapsed ? 'Tampilkan menu' : 'Sembunyikan menu'}>{collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button><div className="workspace-switch"><span className="workspace-icon"><Grid2X2 size={16} /></span><span><small>WORKSPACE</small><strong>Jawa Tengah</strong></span><ChevronDown size={15} /></div><nav><p className="nav-caption">Menu utama</p>{navItems.filter((item) => !item.admin || role === 'superadmin').map((item) => {
    const Icon = item.icon
    const label = item.id === 'overview' ? t.dashboard : item.id === 'database' ? t.database : item.id === 'fields' ? t.fields : item.label
    return <button key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)} title={collapsed ? label : undefined}><Icon size={18} /><span>{label}</span>{item.id === 'database' && <span className="nav-count">4</span>}</button>
  })}<p className="nav-caption second">Sistem</p><button className={`nav-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => setActivePage('settings')} title={collapsed ? t.settings : undefined}><Settings size={18} /><span>{t.settings}</span></button>{role === 'superadmin' && <button className={`nav-item ${activePage === 'users' ? 'active' : ''}`} onClick={() => setActivePage('users')} title={collapsed ? 'Manajemen user' : undefined}><UsersRound size={18} /><span>Manajemen user</span></button>}</nav><div className="sidebar-bottom"><button className="profile-mini" onClick={onLogout} title={collapsed ? 'Keluar' : undefined}><span className="avatar">AS</span><span><strong>Admin Sistem</strong><small>{role === 'superadmin' ? 'Superadmin' : 'Operator data'}</small></span><LogOut size={16} /></button></div></aside>
}

function TopbarLegacy({ onMenu, user, theme, setTheme, language, setLanguage, t }) {
  return <header className="topbar"><div className="mobile-menu"><Menu size={20} /></div><div className="breadcrumb"><span>Workspace</span><span>/</span><strong>{t.dashboard}</strong></div><div className="top-actions"><button className="icon-btn notification" aria-label="Notifikasi"><Bell size={18} /><i /></button><select className="compact-select" value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Bahasa"><option value="id">ID</option><option value="en">EN</option></select><select className="compact-select theme-select" value={theme} onChange={(event) => setTheme(event.target.value)} aria-label="Tema"><option value="green">Green</option><option value="light">Light</option><option value="dark">Dark</option><option value="blue">Blue</option></select><span className="top-avatar">AS</span></div></header>
}

function Topbar({ onMenu, user, theme, setTheme, language, setLanguage, t, profileMenuOpen, onProfileMenu, onManageAccount, onLogout, onSync, syncStatus, lastSyncAt }) {
  return <header className="topbar"><button className="mobile-menu" onClick={onMenu} aria-label="Buka menu navigasi"><Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><span>/</span><strong>{t.dashboard}</strong></div><div className="top-actions"><button className={`sync-button ${syncStatus}`} onClick={onSync} disabled={syncStatus === 'syncing'} title={lastSyncAt ? `Terakhir sinkron ${lastSyncAt.toLocaleTimeString('id-ID')}` : 'Tarik perubahan terbaru dari server'} aria-label="Sinkronisasi data"><RefreshCw size={15} className={syncStatus === 'syncing' ? 'sync-spinning' : ''} /><span>{syncStatus === 'syncing' ? 'Menyinkronkan...' : syncStatus === 'error' ? 'Sinkronisasi gagal' : 'Sinkronisasi'}</span></button><button className="icon-btn notification" aria-label="Notifikasi"><Bell size={18} /><i /></button><select className="compact-select" value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Bahasa"><option value="id">ID</option><option value="en">EN</option></select><select className="compact-select theme-select" value={theme} onChange={(event) => setTheme(event.target.value)} aria-label="Tema"><option value="green">Green</option><option value="light">Light</option><option value="dark">Dark</option><option value="blue">Blue</option></select><div className="profile-menu-wrap"><button className="top-avatar profile-trigger" onClick={onProfileMenu} aria-label="Buka menu akun" aria-expanded={profileMenuOpen}>{getUserInitials(user)}</button>{profileMenuOpen && <div className="profile-dropdown"><div className="profile-dropdown-head"><strong>{user?.name || 'Pengguna'}</strong><small>{user?.email || ''}</small></div><button onClick={onManageAccount}><UserRound size={16} /> Kelola akun</button><button onClick={onLogout} className="dropdown-logout"><LogOut size={16} /> Logout</button></div>}</div></div></header>
}

function AccountModal({ user, onClose, onSave }) {
  const [value, setValue] = useState({ ...user, password: '' })
  const update = (key, next) => setValue((current) => ({ ...current, [key]: next }))
  const handlePhoto = (event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => update('photo', reader.result); reader.readAsDataURL(file) }
  return <div className="modal-backdrop"><div className="modal account-modal"><div className="modal-head"><div><p className="eyebrow">PENGELOLAAN AKUN</p><h2>Kelola akun</h2></div><button className="close-btn" onClick={onClose} aria-label="Tutup"><X size={19} /></button></div><form onSubmit={(event) => { event.preventDefault(); onSave({ ...value, password: value.password || user.password }) }}><div className="account-form"><div className="account-photo-preview">{value.photo ? <img src={value.photo} alt="Foto profil" /> : getUserInitials(value)}</div><label className="field-group">Foto profil<input type="file" accept="image/*" onChange={handlePhoto} /></label><label className="field-group">Username <b>*</b><input required value={value.username || ''} onChange={(event) => update('username', event.target.value.toLowerCase().replace(/\s/g, ''))} /></label><label className="field-group">Email <b>*</b><input required type="email" value={value.email || ''} onChange={(event) => update('email', event.target.value)} /></label><label className="field-group full-span">Password baru<small className="field-hint">Kosongkan jika password tidak diubah.</small><input type="password" value={value.password || ''} onChange={(event) => update('password', event.target.value)} placeholder="Masukkan password baru" /></label></div><div className="modal-foot"><button type="button" className="secondary-btn" onClick={onClose}>Batal</button><button type="submit" className="primary-btn"><Check size={16} /> Simpan akun</button></div></form></div></div>
}

function Overview({ records, fields, user, t, onNavigate }) {
  const approved = records.filter((record) => record.status === 'Disetujui').length
  const pending = records.filter((record) => record.status !== 'Disetujui').length
  const total = records.reduce((sum, record) => sum + Number(record.values.nilai_bantuan || 0), 0)
  const max = Math.max(...records.map((record) => Number(record.values.nilai_bantuan || 0)), 1)
  return <><section className="page-heading"><div><p className="eyebrow">MONITORING PROGRAM</p><h1>{t.welcome}, Admin <span className="heading-leaf">✦</span></h1><p className="muted">Pantau perkembangan penyaluran hibah di seluruh wilayah Jawa Tengah.</p></div><div className="heading-actions"><button className="secondary-btn" onClick={() => alert('Laporan siap diunduh pada integrasi berikutnya.')}><ArrowDownToLine size={16} /> Unduh laporan</button><button className="primary-btn" onClick={() => onNavigate('database')}><Plus size={16} /> Pengajuan baru</button></div></section><section className="stat-grid"><StatCard icon={ClipboardList} label={t.records} value={records.length} change="+12.5%" tone="mint" /><StatCard icon={Check} label={t.approved} value={approved} change="+8.2%" tone="yellow" /><StatCard icon={Activity} label={t.pending} value={pending} change="-3.1%" tone="pink" negative /><StatCard icon={BarChart3} label={t.value} value={`Rp ${formatCurrency(total)}`} change="+16.8%" tone="blue" /></section><section className="dashboard-grid"><div className="panel chart-panel"><div className="panel-head"><div><h2>Nilai penyaluran hibah</h2><p className="muted">Perbandingan nilai bantuan berdasarkan pengajuan</p></div><button className="filter-button">Bulan ini <ChevronDown size={15} /></button></div><div className="chart-area"><div className="chart-y"><span>150 jt</span><span>100 jt</span><span>50 jt</span><span>0</span></div><div className="bars">{records.map((record) => <div className="bar-column" key={record.id}><div className="bar-value">{Math.round(Number(record.values.nilai_bantuan) / 1000000)} jt</div><div className="bar" style={{ height: `${Math.max(12, Number(record.values.nilai_bantuan) / max * 160)}px` }} /><span>{record.values.nama_kelompok.split(' ').slice(-1)[0]}</span></div>)}</div></div></div><div className="panel insight-panel"><div className="panel-head"><div><h2>Insight cepat</h2><p className="muted">Ringkasan performa hari ini</p></div><MoreHorizontal size={18} /></div><div className="insight-highlight"><div className="insight-icon"><Activity size={18} /></div><div><strong>92%</strong><span>kelengkapan data</span></div><span className="trend-up">+4.6%</span></div><div className="progress-line"><span style={{ width: '92%' }} /></div><div className="insight-list"><div><span className="dot green-dot" />Pengajuan dengan dokumen lengkap<strong>24</strong></div><div><span className="dot orange-dot" />Menunggu verifikasi<strong>{pending}</strong></div><div><span className="dot blue-dot" />Wilayah aktif<strong>12</strong></div></div></div></section><section className="panel recent-panel"><div className="panel-head"><div><h2>{t.recent}</h2><p className="muted">Aktivitas terbaru dalam sistem</p></div><button className="text-btn" onClick={() => onNavigate('database')}>Lihat semua <span>→</span></button></div><RecordTable records={records.slice(0, 4)} fields={fields} compact /></section></>
}

function StatCard({ icon: Icon, label, value, change, tone, negative }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19} /></div><div className="stat-body"><span>{label}</span><strong>{value}</strong><small className={negative ? 'negative' : ''}><span>{negative ? '↓' : '↑'}</span> {change} <em>dari bulan lalu</em></small></div><MoreHorizontal className="stat-more" size={17} /></div> }
function VerificationFieldsPage({ fields, setFields }) {
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const save = (field) => {
    setFields((current) => editing
      ? current.map((item) => item.id === editing.id ? { ...field, id: editing.id, order: item.order } : item)
      : [...current, { ...field, id: `vf${Date.now()}`, order: current.length }])
    setEditing(null)
    setShowForm(false)
  }
  const remove = (field) => {
    if (!window.confirm(`Hapus pertanyaan "${field.label}" dari form verifikasi?`)) return
    setFields((current) => current.filter((item) => item.id !== field.id).map((item, order) => ({ ...item, order })))
  }
  const toggle = (field) => setFields((current) => current.map((item) => item.id === field.id ? { ...item, active: !item.active } : item))
  const move = (index, direction) => setFields((current) => {
    const next = [...current]
    const target = index + direction
    if (target < 0 || target >= next.length) return current
    ;[next[index], next[target]] = [next[target], next[index]]
    return next.map((field, order) => ({ ...field, order }))
  })
  const reorder = (targetId) => {
    if (!draggedId || draggedId === targetId) return
    setFields((current) => {
      const next = [...current]
      const from = next.findIndex((field) => field.id === draggedId)
      const to = next.findIndex((field) => field.id === targetId)
      if (from < 0 || to < 0) return current
      const [dragged] = next.splice(from, 1)
      next.splice(to, 0, dragged)
      return next.map((field, order) => ({ ...field, order }))
    })
  }
  const duplicate = (field) => {
    const baseKey = `${field.key}_copy`
    let key = baseKey
    let suffix = 2
    while (fields.some((item) => item.key === key)) key = `${baseKey}_${suffix++}`
    const index = fields.findIndex((item) => item.id === field.id)
    const copy = { ...field, id: `vf${Date.now()}`, key, label: `${field.label} (salinan)` }
    setFields((current) => {
      const next = [...current]
      next.splice(index + 1, 0, copy)
      return next.map((item, order) => ({ ...item, order }))
    })
  }
  const actions = <div className="verification-config-actions"><button className="secondary-btn" onClick={() => setShowPreview(true)}><Eye size={16} /> Preview form</button><button className="primary-btn" onClick={() => { setEditing(null); setShowForm(true) }}><Plus size={16} /> Tambah pertanyaan</button></div>
  return <><section className="page-heading compact-heading"><div><p className="eyebrow">PENGATURAN VERIFIKASI</p><h1>Config Form Verifikasi</h1><p className="muted">Atur pertanyaan yang muncul saat memverifikasi pengajuan Hibah.</p></div>{actions}</section><div className="field-summary"><div><ClipboardCheck size={18} /><span><strong>{fields.length}</strong> Total pertanyaan</span></div><div><Check size={18} /><span><strong>{fields.filter((field) => field.active).length}</strong> Pertanyaan aktif</span></div></div><section className="panel fields-panel"><div className="panel-head"><div><h2>Form verifikasi data kelompok</h2><p className="muted">Seret handle untuk mengubah urutan. Pertanyaan aktif tampil di popup verifikasi.</p></div></div><div className="field-list verification-field-list">{fields.map((field, index) => <div className={`field-row ${!field.active ? 'inactive' : ''} ${dragOverId === field.id ? 'drag-over' : ''}`} key={field.id} onDragOver={(event) => { event.preventDefault(); setDragOverId(field.id) }} onDrop={(event) => { event.preventDefault(); reorder(field.id); setDraggedId(null); setDragOverId(null) }} onDragLeave={() => setDragOverId((current) => current === field.id ? null : current)} onDragEnd={() => { reorder(dragOverId); setDraggedId(null); setDragOverId(null) }}><button className="drag-handle verification-drag-handle" draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = 'move'; setDraggedId(field.id) }} title="Seret untuk mengubah urutan" aria-label={`Seret ${field.label}`}><span /><span /><span /></button><div className="field-order">{String(index + 1).padStart(2, '0')}</div><div className="field-info"><strong>{field.label}</strong><small>{field.key} · {typeLabels[field.type]}</small></div><span className="field-type">{typeLabels[field.type]}</span>{field.required && <span className="required-tag">Wajib</span>}<button className={`toggle ${field.active ? 'on' : ''}`} onClick={() => toggle(field)} aria-label={`${field.active ? 'Nonaktifkan' : 'Aktifkan'} ${field.label}`}><span /></button><div className="field-actions"><button onClick={() => duplicate(field)} title="Duplikat pertanyaan" aria-label={`Duplikat ${field.label}`}><Copy size={14} /></button><button onClick={() => { setEditing(field); setShowForm(true) }} title="Edit pertanyaan" aria-label={`Edit ${field.label}`}><Pencil size={14} /></button><button onClick={() => remove(field)} title="Hapus pertanyaan" aria-label={`Hapus ${field.label}`}><Trash2 size={14} /></button></div></div>)}{!fields.length && <div className="empty-state">Belum ada pertanyaan. Tambahkan pertanyaan untuk membentuk Form Verifikasi.</div>}</div></section>{showForm && <VerificationFieldForm field={editing} onClose={() => { setShowForm(false); setEditing(null) }} onSave={save} />}{showPreview && <VerificationFormPreview fields={fields} onClose={() => setShowPreview(false)} />}</>
}

function VerificationFormPreview({ fields, onClose }) {
  const activeFields = fields.filter((field) => field.active)
  const [values, setValues] = useState(() => Object.fromEntries(activeFields.map((field) => [field.key, field.type === 'checklist' ? [] : ''])))
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }))
  return <div className="modal-backdrop"><div className="modal verification-modal"><div className="modal-head"><div><p className="eyebrow">PRATINJAU</p><h2>Form Verifikasi Data Kelompok</h2><p className="muted">Contoh tampilan berdasarkan pertanyaan aktif saat ini.</p></div><button className="close-btn" onClick={onClose} aria-label="Tutup preview"><X size={19} /></button></div><div className="verification-controls verification-preview-controls">{activeFields.map((field) => <DynamicInputProfessional key={field.id} field={field} value={values[field.key]} onChange={(value) => update(field.key, value)} />)}{!activeFields.length && <div className="empty-state">Tidak ada pertanyaan aktif untuk ditampilkan.</div>}</div><div className="modal-foot"><button className="secondary-btn" onClick={onClose}>Tutup preview</button><button className="primary-btn" onClick={onClose}><Check size={16} /> Selesai</button></div></div></div>
}

function VerificationFieldForm({ field, onClose, onSave }) {
  const [value, setValue] = useState(field || { label: '', key: '', type: 'text', options: '', placeholder: '', description: '', required: false, active: true })
  const update = (key, next) => setValue((current) => ({ ...current, [key]: next }))
  return <div className="modal-backdrop">
    <div className="modal field-modal">
      <div className="modal-head"><div><p className="eyebrow">CONFIG FORM VERIFIKASI</p><h2>{field ? 'Edit pertanyaan' : 'Tambah pertanyaan'}</h2></div><button className="close-btn" onClick={onClose} aria-label="Tutup"><X size={19} /></button></div>
      <form onSubmit={(event) => { event.preventDefault(); onSave(value) }}>
        <div className="dynamic-form">
          <label className="field-group full-span">Label pertanyaan <b>*</b><textarea rows="4" required value={value.label} onChange={(event) => update('label', event.target.value)} placeholder="Contoh: Kesesuaian dokumen" /></label>
          <label className="field-group">Field key <b>*</b><input required value={value.key} onChange={(event) => update('key', event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))} placeholder="kesesuaian_dokumen" /></label>
          <label className="field-group">Tipe jawaban <b>*</b><select value={value.type} onChange={(event) => update('type', event.target.value)}>{Object.entries(typeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label className="field-group">Placeholder<input value={value.placeholder || ''} onChange={(event) => update('placeholder', event.target.value)} placeholder="Contoh: Masukkan catatan" /></label>
          <label className="field-group full-span">Deskripsi<textarea rows="3" value={value.description || ''} onChange={(event) => update('description', event.target.value)} placeholder="Petunjuk untuk verifikator" /></label>
          {['checklist', 'list'].includes(value.type) && <label className="field-group full-span">Daftar opsi <b>*</b><textarea rows="4" required value={value.options || ''} onChange={(event) => update('options', event.target.value)} placeholder="Pisahkan opsi dengan titik koma (;)" /></label>}
          <label className="switch-label"><input type="checkbox" checked={Boolean(value.required)} onChange={(event) => update('required', event.target.checked)} /><span>Jawaban wajib diisi</span></label>
        </div>
        <div className="modal-foot"><button type="button" className="secondary-btn" onClick={onClose}>Batal</button><button type="submit" className="primary-btn"><Check size={16} /> Simpan pertanyaan</button></div>
      </form>
    </div>
  </div>
}

function VerificationFormModal({ record, hibahFields, fields, verification, onClose, onSave }) {
  const [values, setValues] = useState(verification?.values || Object.fromEntries(fields.map((field) => [field.key, field.type === 'checklist' ? [] : ''])))
  const [status, setStatus] = useState(verification?.status || 'Terverifikasi')
  const visibleFields = fields.filter((field) => field.active)
  const sourceFields = hibahFields.filter((field) => field.active && !['header', 'separator'].includes(field.type))
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }))
  const submit = (event) => {
    event.preventDefault()
    const missing = visibleFields.find((field) => field.required && (field.type === 'checklist' ? !values[field.key]?.length : !String(values[field.key] ?? '').trim()))
    if (missing) {
      window.alert(`Pertanyaan "${missing.label}" wajib diisi.`)
      return
    }
    onSave({ id: verification?.id, hibahId: record.id, noId: record.noId, status, values })
  }
  return <div className="modal-backdrop"><div className="modal verification-modal"><div className="modal-head"><div><p className="eyebrow">FORM VERIFIKASI</p><h2>{verification ? 'Perbarui verifikasi' : 'Verifikasi data kelompok'}</h2><p className="muted">{record.noId} · {record.values.nama_kelompok || 'Kelompok hibah'}</p></div><button className="close-btn" onClick={onClose} aria-label="Tutup"><X size={19} /></button></div><form onSubmit={submit}><div className="verification-form-content"><section className="verification-source"><h3>Data pengajuan dari Database Hibah</h3><div className="verification-source-grid">{sourceFields.map((field) => <div key={field.id}><span>{field.label}</span><strong>{formatVerificationValue(record.values[field.key], field)}</strong></div>)}</div></section><div className="verification-controls"><label className="field-group">Hasil verifikasi <b>*</b><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Terverifikasi</option><option>Perlu Perbaikan</option><option>Ditolak</option></select></label>{visibleFields.map((field) => <DynamicInputProfessional key={field.id} field={field} value={values[field.key]} onChange={(value) => update(field.key, value)} />)}{!visibleFields.length && <p className="muted">Belum ada pertanyaan aktif pada Config Form Verifikasi.</p>}</div></div><div className="modal-foot"><button type="button" className="secondary-btn" onClick={onClose}>Batal</button><button type="submit" className="primary-btn"><ClipboardCheck size={16} /> {verification ? 'Simpan perubahan' : 'Simpan verifikasi'}</button></div></form></div></div>
}

function formatVerificationValue(value, field) {
  if (value === undefined || value === null || value === '') return '-'
  if (field.type === 'currency' || field.key.includes('anggaran') || field.key.includes('nilai')) return formatBudget(value)
  return Array.isArray(value) ? value.join(', ') : String(value)
}

function VerificationDatabasePage({ records, verifications, setVerifications, verificationFields, hibahFields, user }) {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const filtered = verifications.filter((item) => `${item.noId} ${item.hibahSnapshot?.nama_kelompok || ''} ${item.status} ${item.verifiedByName || ''}`.toLowerCase().includes(search.toLowerCase()))
  const openEdit = (verification) => {
    const source = records.find((record) => String(record.id) === String(verification.hibahId))
    if (!source) return window.alert('Data Hibah sumber tidak ditemukan.')
    setEditing({ verification, source })
  }
  const save = (nextVerification) => {
    setVerifications((current) => {
      const existing = current.find((item) => item.hibahId === nextVerification.hibahId)
      const saved = { ...nextVerification, id: existing?.id || `v${Date.now()}`, noId: verificationTarget.noId, hibahSnapshot: verificationTarget.values, verifiedBy: user?.id, verifiedByName: user?.name, createdAt: existing?.createdAt || new Date().toLocaleString('id-ID') }
      return existing ? current.map((item) => item.hibahId === saved.hibahId ? saved : item) : [saved, ...current]
    })
    setVerificationTarget(null)
  }
  const remove = () => {
    if (!deleteTarget) return
    setVerifications((current) => current.filter((item) => item.id !== deleteTarget.id))
    setDeleteTarget(null)
  }
  return <><section className="page-heading compact-heading"><div><p className="eyebrow">ARSIP PEMERIKSAAN</p><h1>Database Verifikasi Hibah</h1><p className="muted">Hasil verifikasi tersimpan dan tertaut pada data pengajuan asal.</p></div><span className="saved-badge"><ClipboardCheck size={14} /> {verifications.length} hasil verifikasi</span></section><div className="database-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari No ID, kelompok, status..." /></div><span className="toolbar-count">{filtered.length} dari {verifications.length} hasil</span></div><div className="panel table-panel"><div className="table-scroll"><table className="verification-table"><thead><tr><th>No</th><th>No ID Hibah</th><th>Kelompok penerima</th><th>Hasil verifikasi</th><th>Verifikator</th><th>Terakhir diperbarui</th><th>Aksi</th></tr></thead><tbody>{filtered.map((item, index) => <tr key={item.id}><td>{index + 1}</td><td>{item.noId}</td><td><strong>{item.hibahSnapshot?.nama_kelompok || '-'}</strong></td><td><span className={`verification-status verification-${item.status.toLowerCase().replace(/\s/g, '-')}`}>{item.status}</span></td><td>{item.verifiedByName || '-'}</td><td>{item.updatedAt || item.createdAt || '-'}</td><td><div className="row-actions"><button onClick={() => openEdit(item)} title="Edit verifikasi" aria-label={`Edit verifikasi ${item.noId}`}><Pencil size={15} /></button><button onClick={() => setDeleteTarget(item)} title="Hapus verifikasi" aria-label={`Hapus verifikasi ${item.noId}`}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table>{!filtered.length && <div className="empty-state">{verifications.length ? 'Tidak ada hasil yang cocok dengan pencarian.' : 'Belum ada hasil verifikasi. Mulai dari tombol Verifikasi data pada Database Hibah.'}</div>}</div></div>{editing && <VerificationFormModal record={editing.source} hibahFields={hibahFields} fields={verificationFields} verification={editing.verification} onClose={() => setEditing(null)} onSave={save} />}{deleteTarget && <div className="logout-backdrop" role="presentation" onClick={() => setDeleteTarget(null)}><section className="logout-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><div className="logout-icon"><Trash2 size={21} /></div><h2>Hapus hasil verifikasi?</h2><p>Hasil verifikasi {deleteTarget.noId} akan dihapus. Data pengajuan Hibah tetap tersimpan.</p><div className="logout-actions"><button className="cancel-logout" onClick={() => setDeleteTarget(null)}>Batal</button><button className="confirm-logout" onClick={remove}>Hapus hasil</button></div></section></div>}</>
}

function DatabasePage({ records, setRecords, fields, allFields, verificationFields, verifications, setVerifications, user, role, t }) {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selected, setSelected] = useState(null)
  const [verificationTarget, setVerificationTarget] = useState(null)
  const filtered = records.filter((record) => JSON.stringify(record.values).toLowerCase().includes(search.toLowerCase()))
  const openForm = (record = null) => { setEditing(record); setShowForm(true) }
  const save = (values, noId) => { if (editing) setRecords(records.map((record) => record.id === editing.id ? { ...record, noId: role === 'superadmin' ? noId : record.noId, values } : record)); else setRecords([{ id: Date.now(), noId: getNextGrantId(records), status: 'Menunggu', createdAt: 'Hari ini', values }, ...records]); setShowForm(false); setEditing(null) }
  const remove = (id) => { if (window.confirm('Hapus data pengajuan ini?')) setRecords(records.filter((record) => record.id !== id)) }
  const saveVerification = (nextVerification) => {
    setVerifications((current) => {
      const existing = current.find((item) => item.hibahId === nextVerification.hibahId)
      const saved = { ...nextVerification, id: existing?.id || `v${Date.now()}`, noId: verificationTarget.noId, hibahSnapshot: verificationTarget.values, verifiedBy: user?.id, verifiedByName: user?.name, createdAt: existing?.createdAt || new Date().toLocaleString('id-ID') }
      return existing ? current.map((item) => item.hibahId === saved.hibahId ? saved : item) : [saved, ...current]
    })
    setVerificationTarget(null)
  }
  return <><section className="page-heading compact-heading"><div><p className="eyebrow">DATA UTAMA</p><h1>{t.database}</h1><p className="muted">Kelola seluruh pengajuan hibah dengan field yang fleksibel.</p></div><button className="primary-btn" onClick={() => openForm()}><Plus size={16} /> Tambah pengajuan</button></section><div className="database-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama kelompok, wilayah..." /></div><button className="secondary-btn"><Filter size={16} /> Filter</button><button className="secondary-btn"><ArrowDownToLine size={16} /> Export</button><span className="toolbar-count">{filtered.length} dari {records.length} data</span></div><div className="panel table-panel"><RecordTable records={filtered} fields={fields} onEdit={openForm} onDelete={remove} onSelect={setSelected} onVerify={(record) => setVerificationTarget(record)} verifications={verifications} /></div>{showForm && <RecordFormWithId fields={allFields.filter((field) => field.active)} record={editing} role={role} nextNoId={getNextGrantId(records)} onClose={() => setShowForm(false)} onSave={save} />}{selected && <DetailModal record={selected} fields={fields} onClose={() => setSelected(null)} />}{verificationTarget && <VerificationFormModal record={verificationTarget} hibahFields={allFields} fields={verificationFields} verification={verifications.find((item) => String(item.hibahId) === String(verificationTarget.id))} onClose={() => setVerificationTarget(null)} onSave={saveVerification} />}</>
}

function RecordTable({ records, fields, onEdit, onDelete, onSelect, onVerify, verifications = [], compact }) {
  const tableFields = fields.filter(isDataField)
  return <div className={`table-scroll ${compact ? 'compact-table' : ''}`}><table><thead><tr><th className="select-column"><input type="checkbox" /></th>{!compact && <th className="actions-column">Aksi</th>}<th className="row-number-column">No Urut</th><th className="grant-id-column">No ID</th><th>Nama kelompok <ArrowUpDown size={13} /></th>{tableFields.slice(0, compact ? 2 : 4).map((field) => <th key={field.id}>{field.label} <ArrowUpDown size={13} /></th>)}<th>Status</th></tr></thead><tbody>{records.map((record, index) => {
    const verification = verifications.find((item) => item.hibahId === record.id)
    return <tr key={record.id} onClick={() => onSelect?.(record)}><td className="select-column"><input type="checkbox" onClick={(event) => event.stopPropagation()} /></td>{!compact && <td className="actions-column"><div className="row-actions"><button onClick={(event) => { event.stopPropagation(); onVerify?.(record) }} title={verification ? 'Edit verifikasi data' : 'Verifikasi data'} aria-label={`${verification ? 'Edit verifikasi data' : 'Verifikasi data'} ${record.values.nama_kelompok}`}><ClipboardCheck size={15} /></button><button onClick={(event) => { event.stopPropagation(); onEdit(record) }} title="Edit" aria-label={`Edit ${record.values.nama_kelompok}`}><Pencil size={15} /></button><button onClick={(event) => { event.stopPropagation(); onDelete(record.id) }} title="Hapus" aria-label={`Hapus ${record.values.nama_kelompok}`}><Trash2 size={15} /></button></div></td>}<td className="row-number-column">{index + 1}</td><td className="grant-id-column">{record.noId || formatGrantId(index + 1)}</td><td><div className="name-cell"><span className="record-avatar">{record.values.nama_kelompok?.slice(0, 2).toUpperCase()}</span><span><strong>{record.values.nama_kelompok}</strong><small>Dibuat {record.createdAt}</small></span></div></td>{tableFields.slice(0, compact ? 2 : 4).map((field) => <td key={field.id}>{field.type === 'currency' || field.key === 'nilai_bantuan' ? formatBudget(record.values[field.key]) : Array.isArray(record.values[field.key]) ? record.values[field.key].join(', ') : record.values[field.key] || '-'}</td>)}<td><span className={`status status-${record.status.toLowerCase()}`}>{record.status}</span>{verification && <small className={`verification-inline-status verification-${verification.status.toLowerCase().replace(/\s/g, '-')}`}>{verification.status}</small>}</td></tr>
  })}</tbody></table>{!records.length && <div className="empty-state">Belum ada data hibah.</div>}</div>
}

function RecordForm({ fields, record, onClose, onSave }) { const [values, setValues] = useState(record?.values || Object.fromEntries(fields.map((field) => [field.key, field.type === 'checklist' ? [] : '']))); const update = (key, value) => setValues((current) => ({ ...current, [key]: value })); const submit = (event) => { event.preventDefault(); onSave(values) }; return <div className="modal-backdrop"><div className="modal large-modal"><div className="modal-head"><div><p className="eyebrow">{record ? 'EDIT DATA' : 'DATA BARU'}</p><h2>{record ? 'Perbarui pengajuan' : 'Tambah pengajuan hibah'}</h2></div><button className="close-btn" onClick={onClose}><X size={19} /></button></div><form onSubmit={submit}><div className="dynamic-form">{fields.map((field) => <DynamicInput key={field.id} field={field} value={values[field.key]} onChange={(value) => update(field.key, value)} />)}</div><div className="modal-foot"><button type="button" className="secondary-btn" onClick={onClose}>Batal</button><button type="submit" className="primary-btn"><Check size={16} /> Simpan pengajuan</button></div></form></div></div> }

function DynamicInputBase({ field, value, onChange }) { const options = field.options.split(';').filter(Boolean); if (field.type === 'checklist') return <fieldset className="field-group"><legend>{field.label} {field.required && <b>*</b>}</legend><div className="check-grid">{options.map((option) => <label className="check-option" key={option}><input type="checkbox" checked={(value || []).includes(option)} onChange={(event) => onChange(event.target.checked ? [...(value || []), option] : (value || []).filter((item) => item !== option))} /><span>{option}</span></label>)}</div></fieldset>; return <label className="field-group">{field.label} {field.required && <b>*</b>}{field.type === 'paragraph' ? <textarea rows="5" value={value || ''} onChange={(event) => onChange(event.target.value)} required={field.required} /> : field.type === 'list' ? <select value={value || ''} onChange={(event) => onChange(event.target.value)} required={field.required}><option value="">Pilih opsi</option>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input type={field.type === 'number' ? 'number' : field.type} value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder || ''} required={field.required} />}</label> }

function CurrencyInput({ field, value, onChange }) { return <label className="field-group">{field.label} {field.required && <b>*</b>}{field.type === 'currency' ? <input inputMode="numeric" value={formatBudget(value)} onChange={(event) => onChange(parseBudget(event.target.value))} placeholder="Rp 0" required={field.required} /> : <input type={field.type === 'number' ? 'number' : field.type} value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder || ''} required={field.required} />}</label> }

function DynamicInput({ field, value, onChange }) { return field.type === 'currency' ? <CurrencyInput field={field} value={value} onChange={onChange} /> : <DynamicInputBase field={field} value={value} onChange={onChange} /> }

function DynamicInputProfessional({ field, value, onChange }) { const options = field.options.split(';').filter(Boolean); const hint = field.description && <small className="field-description">{field.description}</small>; if (field.type === 'header') return <div className="form-section-header"><h3>{field.label}</h3>{hint}</div>; if (field.type === 'separator') return <div className="form-section-separator" role="separator" aria-label={field.label || 'Pembatas formulir'} />; if (field.type === 'checklist') return <fieldset className="field-group"><legend>{field.label} {field.required && <b>*</b>}</legend>{hint}<div className="check-grid">{options.map((option) => <label className="check-option" key={option}><input type="checkbox" checked={(value || []).includes(option)} onChange={(event) => onChange(event.target.checked ? [...(value || []), option] : (value || []).filter((item) => item !== option))} /><span>{option}</span></label>)}</div></fieldset>; if (field.type === 'currency') return <label className="field-group">{field.label} {field.required && <b>*</b>}{hint}<input inputMode="numeric" value={formatBudget(value)} onChange={(event) => onChange(parseBudget(event.target.value))} placeholder={field.placeholder || 'Rp 0'} required={field.required} /></label>; return <label className="field-group">{field.label} {field.required && <b>*</b>}{hint}{field.type === 'paragraph' ? <textarea rows="5" value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder || ''} required={field.required} /> : field.type === 'list' ? <select value={value || ''} onChange={(event) => onChange(event.target.value)} required={field.required}><option value="">{field.placeholder || 'Pilih opsi'}</option>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input type={field.type === 'number' ? 'number' : field.type} value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder || ''} required={field.required} />}</label> }

function DetailModal({ record, fields, onClose }) { return <div className="modal-backdrop"><div className="modal detail-modal"><div className="modal-head"><div><p className="eyebrow">DETAIL PENGAJUAN</p><h2>{record.values.nama_kelompok}</h2><strong className="detail-no-id">{record.noId || '-'}</strong></div><button className="close-btn" onClick={onClose}><X size={19} /></button></div><div className="detail-status"><span className={`status status-${record.status.toLowerCase()}`}>{record.status}</span><span>Dibuat {record.createdAt}</span></div><div className="detail-list">{fields.filter(isDataField).map((field) => <div key={field.id}><span>{field.label}</span><strong>{field.type === 'currency' ? formatBudget(record.values[field.key]) : Array.isArray(record.values[field.key]) ? record.values[field.key].join(', ') : record.values[field.key] || '-'}</strong></div>)}</div></div></div> }

function FieldsPage({ fields, setFields }) { const [showForm, setShowForm] = useState(false); const [editing, setEditing] = useState(null); const move = (index, direction) => { const next = [...fields]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; setFields(next.map((field, order) => ({ ...field, order }))) }; const save = (field) => { if (editing) setFields(fields.map((item) => item.id === editing.id ? { ...field, id: editing.id } : item)); else setFields([...fields, { ...field, id: `f${Date.now()}` }]); setShowForm(false); setEditing(null) }; const toggle = (id) => setFields(fields.map((field) => field.id === id ? { ...field, active: !field.active } : field)); return <><section className="page-heading compact-heading"><div><p className="eyebrow">KONFIGURASI SISTEM</p><h1>Config field</h1><p className="muted">Bentuk struktur data hibah tanpa mengubah kode aplikasi.</p></div><button className="primary-btn" onClick={() => { setEditing(null); setShowForm(true) }}><Plus size={16} /> Tambah field</button></section><div className="field-summary"><div><FileCog size={18} /><span><strong>{fields.length}</strong> Total field</span></div><div><Check size={18} /><span><strong>{fields.filter((field) => field.active).length}</strong> Field aktif</span></div><div><Activity size={18} /><span><strong>Live</strong> Sinkronisasi</span></div></div><div className="panel fields-panel"><div className="panel-head"><div><h2>Struktur field database</h2><p className="muted">Field aktif akan otomatis tampil di tabel dan form pengajuan.</p></div><button className="secondary-btn"><SlidersHorizontal size={16} /> Preview form</button></div><div className="field-list">{fields.map((field, index) => <div className={`field-row ${!field.active ? 'inactive' : ''} ${dragOverId === field.id ? 'drag-over' : ''}`} key={field.id}><div className="drag-handle"><span /><span /><span /></div><div className="field-order">{String(index + 1).padStart(2, '0')}</div><div className="field-info"><strong>{field.label}</strong><small>{field.key} · {typeLabels[field.type]}</small></div><span className="field-type">{typeLabels[field.type]}</span>{field.required && <span className="required-tag">Wajib</span>}<button className={`toggle ${field.active ? 'on' : ''}`} onClick={() => toggle(field.id)} aria-label={`${field.active ? 'Nonaktifkan' : 'Aktifkan'} ${field.label}`}><span /></button><div className="field-actions"><button onClick={() => move(index, -1)} title="Naikkan" aria-label={`Naikkan ${field.label}`}><ChevronUp size={14} /></button><button onClick={() => move(index, 1)} title="Turunkan" aria-label={`Turunkan ${field.label}`}><ChevronDown size={14} /></button><button onClick={() => { setEditing(field); setShowForm(true) }} title="Edit" aria-label={`Edit ${field.label}`}><Pencil size={15} /></button><button onClick={() => setDeleteTarget(field)} title="Hapus" aria-label={`Hapus ${field.label}`}><Trash2 size={15} /></button></div></div>)}</div></div>{showForm && <FieldFormLegacy field={editing} onClose={() => setShowForm(false)} onSave={save} />}</>
}

function FieldFormLegacy({ field, onClose, onSave }) { const [value, setValue] = useState(field || { label: '', key: '', type: 'text', required: false, active: true, options: '' }); const update = (key, next) => setValue((current) => ({ ...current, [key]: next })); const submit = (event) => { event.preventDefault(); onSave(value) }; return <div className="modal-backdrop"><div className="modal field-modal"><div className="modal-head"><div><p className="eyebrow">CONFIG FIELD</p><h2>{field ? 'Edit field' : 'Field baru'}</h2></div><button className="close-btn" onClick={onClose}><X size={19} /></button></div><form onSubmit={submit}><div className="dynamic-form"><label className="field-group">Label field <b>*</b><input required value={value.label} onChange={(event) => update('label', event.target.value)} placeholder="Contoh: Nama penerima" /></label><label className="field-group">Field key <b>*</b><input required value={value.key} onChange={(event) => update('key', event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))} placeholder="nama_penerima" /></label><label className="field-group">Tipe field <b>*</b><select value={value.type} onChange={(event) => update('type', event.target.value)}>{Object.entries(typeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>{['checklist', 'list'].includes(value.type) && <label className="field-group full-span">Daftar opsi <b>*</b><textarea rows="5" required value={value.options} onChange={(event) => update('options', event.target.value)} placeholder="Pisahkan opsi dengan titik koma (;)" /><small className="field-hint">Contoh: Sapi;Kambing;Domba;Ayam</small></label>}<label className="switch-label"><input type="checkbox" checked={value.required} onChange={(event) => update('required', event.target.checked)} /><span>Field wajib diisi</span></label></div><div className="modal-foot"><button type="button" className="secondary-btn" onClick={onClose}>Batal</button><button type="submit" className="primary-btn"><Check size={16} /> Simpan field</button></div></form></div></div> }

function SettingsPage({ user, onEditAccount, theme, setTheme, language, setLanguage }) {
  const themes = [
    { id: 'green', label: 'Green Pastel', color: '#236b48', description: 'Tenang dan natural' },
    { id: 'light', label: 'Light', color: '#2c5d7c', description: 'Bersih dan fokus' },
    { id: 'dark', label: 'Dark', color: '#202a25', description: 'Nyaman untuk malam' },
    { id: 'blue', label: 'Blue Sky', color: '#19718d', description: 'Segar dan profesional' },
  ]
  return <><section className="page-heading compact-heading"><div><p className="eyebrow">PREFERENSI AKUN</p><h1>Pengaturan</h1><p className="muted">Sesuaikan pengalaman kerja sesuai kebutuhan Anda.</p></div><span className="saved-badge"><Check size={14} /> Tersimpan otomatis</span></section><div className="settings-grid"><section className="panel settings-panel"><div className="panel-head"><div><h2>Bahasa aplikasi</h2><p className="muted">Pilih bahasa untuk label dan navigasi utama.</p></div><BookOpen size={19} /></div><div className="language-options"><button className={language === 'id' ? 'selected' : ''} onClick={() => setLanguage('id')}><span className="flag-badge">ID</span><span><strong>Bahasa Indonesia</strong><small>Bahasa default sistem</small></span>{language === 'id' && <Check size={16} />}</button><button className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')}><span className="flag-badge flag-en">EN</span><span><strong>English</strong><small>Use English interface</small></span>{language === 'en' && <Check size={16} />}</button></div></section><section className="panel settings-panel"><div className="panel-head"><div><h2>Tema tampilan</h2><p className="muted">Preferensi ini hanya berlaku pada akun Anda.</p></div><Sparkles size={19} /></div><div className="theme-options">{themes.map((item) => <button key={item.id} className={theme === item.id ? 'selected' : ''} onClick={() => setTheme(item.id)}><span className="theme-swatch" style={{ background: item.color }} /><span><strong>{item.label}</strong><small>{item.description}</small></span>{theme === item.id && <Check size={16} />}</button>)}</div></section></div><section className="panel settings-account"><div className="account-avatar">AS</div><div><p className="eyebrow">AKUN AKTIF</p><h2>Admin Sistem</h2><p className="muted">admin@dinas.go.id · Superadmin</p></div><button className="secondary-btn">Edit profil</button></section></>
}

function UsersPage({ users, setUsers }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const save = (user) => { if (editing) setUsers(users.map((item) => item.id === editing.id ? { ...user, id: editing.id } : item)); else setUsers([...users, { ...user, id: `u${Date.now()}` }]); setShowForm(false); setEditing(null) }
  const remove = (id) => { if (users.length > 1 && window.confirm('Nonaktifkan pengguna ini?')) setUsers(users.map((user) => user.id === id ? { ...user, status: 'Nonaktif' } : user)) }
  return <><section className="page-heading compact-heading"><div><p className="eyebrow">AKSES DAN PERAN</p><h1>Manajemen user</h1><p className="muted">Kelola akun yang dapat mengakses workspace hibah.</p></div><button className="primary-btn" onClick={() => { setEditing(null); setShowForm(true) }}><Plus size={16} /> Tambah user</button></section><div className="user-summary"><span><strong>{users.length}</strong> Total akun</span><span><strong>{users.filter((user) => user.status === 'Aktif').length}</strong> Aktif</span><span><strong>{users.filter((user) => user.role === 'superadmin').length}</strong> Superadmin</span></div><section className="panel users-panel"><div className="panel-head"><div><h2>Daftar pengguna</h2><p className="muted">Perubahan role berlaku pada login berikutnya.</p></div><ShieldCheck size={19} /></div><div className="user-list">{users.map((user) => <div className="user-row" key={user.id}><span className="user-avatar">{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div className="user-info"><strong>{user.name}</strong><small>{user.email}</small><small>{user.contactWhatsapp || 'Kontak WhatsApp belum diisi'}</small></div><span className={`role-pill ${user.role}`}>{user.role === 'superadmin' ? 'Superadmin' : 'User'}</span><span className={`user-status ${user.status.toLowerCase()}`}>{user.status}</span><div className="row-actions"><button title="Edit" onClick={() => { setEditing(user); setShowForm(true) }}><Pencil size={15} /></button><button title="Nonaktifkan" onClick={() => remove(user.id)}><Trash2 size={15} /></button></div></div>)}</div></section>{showForm && <UserForm user={editing} onClose={() => setShowForm(false)} onSave={save} />}</>
}

function UserForm({ user, onClose, onSave }) {
  const [value, setValue] = useState(user || { name: '', username: '', email: '', contactWhatsapp: '', password: '', role: 'user', status: 'Aktif' })
  const [showPassword, setShowPassword] = useState(false)
  const update = (key, next) => setValue((current) => ({ ...current, [key]: next }))
  return <div className="modal-backdrop">
    <div className="modal user-modal">
      <div className="modal-head">
        <div><p className="eyebrow">MANAJEMEN USER</p><h2>{user ? 'Edit pengguna' : 'Tambah pengguna'}</h2></div>
        <button className="close-btn" onClick={onClose}><X size={19} /></button>
      </div>
      <form onSubmit={(event) => { event.preventDefault(); onSave(value) }}>
        <div className="dynamic-form">
          <label className="field-group">Nama lengkap <b>*</b><input required value={value.name} onChange={(event) => update('name', event.target.value)} placeholder="Nama pengguna" /></label>
          <label className="field-group">Username <b>*</b><input required value={value.username || ''} onChange={(event) => update('username', event.target.value.toLowerCase().replace(/\s/g, ''))} placeholder="username" /></label>
          <label className="field-group">Email <b>*</b><input required type="email" value={value.email} onChange={(event) => update('email', event.target.value)} placeholder="nama@dinas.go.id" /></label>
          <label className="field-group">Kontak person (WhatsApp)<input type="tel" inputMode="tel" autoComplete="tel" value={value.contactWhatsapp || ''} onChange={(event) => update('contactWhatsapp', event.target.value.replace(/[^0-9+]/g, ''))} placeholder="Contoh: 081234567890" /></label>
          <label className="field-group">Password <b>*</b><span className="user-password-wrap"><input required={!user} type={showPassword ? 'text' : 'password'} value={value.password || ''} onChange={(event) => update('password', event.target.value)} placeholder={user ? 'Biarkan jika tidak diubah' : 'Password pengguna'} /><button type="button" className="user-password-toggle" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>
          <label className="field-group">Role <b>*</b><select value={value.role} onChange={(event) => update('role', event.target.value)}><option value="user">User</option><option value="superadmin">Superadmin</option></select></label>
          <label className="field-group">Status <b>*</b><select value={value.status} onChange={(event) => update('status', event.target.value)}><option>Aktif</option><option>Nonaktif</option></select></label>
        </div>
        <div className="modal-foot"><button type="button" className="secondary-btn" onClick={onClose}>Batal</button><button className="primary-btn" type="submit"><Check size={16} /> Simpan pengguna</button></div>
      </form>
    </div>
  </div>
}

function RecordFormWithId({ fields, record, role, nextNoId, onClose, onSave }) {
  const [values, setValues] = useState(record?.values || Object.fromEntries(fields.map((field) => [field.key, field.type === 'checklist' ? [] : ''])))
  const [noId, setNoId] = useState(record?.noId || nextNoId)
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }))
  const submit = (event) => { event.preventDefault(); onSave(values, noId) }
  return <div className="modal-backdrop"><div className="modal large-modal"><div className="modal-head"><div><p className="eyebrow">{record ? 'EDIT DATA' : 'DATA BARU'}</p><h2>{record ? 'Perbarui pengajuan' : 'Tambah pengajuan hibah'}</h2></div><button className="close-btn" onClick={onClose}><X size={19} /></button></div><form onSubmit={submit}><div className="dynamic-form">{role === 'superadmin' ? <label className="field-group">No ID <b>*</b><input required pattern="ID-[0-9]{10}" value={noId} onChange={(event) => setNoId(event.target.value.toUpperCase())} placeholder="ID-0000000001" /><small className="field-hint">Format: ID-0000000001 sampai ID-9999999999</small></label> : <label className="field-group">No ID<input value={noId} readOnly /></label>}{fields.map((field) => <DynamicInputProfessional key={field.id} field={field} value={values[field.key]} onChange={(value) => update(field.key, value)} />)}</div><div className="modal-foot"><button type="button" className="secondary-btn" onClick={onClose}>Batal</button><button type="submit" className="primary-btn"><Check size={16} /> Simpan pengajuan</button></div></form></div></div>
}

function FieldsPageDnd({ fields, setFields }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const move = (index, direction) => { const next = [...fields]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; setFields(next.map((field, order) => ({ ...field, order }))) }
  const reorder = (targetId) => { if (!draggedId || draggedId === targetId) return; const next = [...fields]; const from = next.findIndex((field) => field.id === draggedId); const to = next.findIndex((field) => field.id === targetId); const [dragged] = next.splice(from, 1); next.splice(to, 0, dragged); setFields(next.map((field, order) => ({ ...field, order }))) }
  const save = (field) => { if (editing) setFields(fields.map((item) => item.id === editing.id ? { ...field, id: editing.id } : item)); else setFields([...fields, { ...field, id: `f${Date.now()}` }]); setShowForm(false); setEditing(null) }
  const duplicate = (field) => { const keyBase = `${field.key}_copy`; let key = keyBase; let suffix = 2; while (fields.some((item) => item.key === key)) key = `${keyBase}_${suffix++}`; const copy = { ...field, id: `f${Date.now()}`, key, label: `${field.label} (salinan)` }; const index = fields.findIndex((item) => item.id === field.id); const next = [...fields]; next.splice(index + 1, 0, copy); setFields(next.map((item, order) => ({ ...item, order }))) }
  const toggle = (id) => setFields(fields.map((field) => field.id === id ? { ...field, active: !field.active } : field))
  const remove = () => { if (!deleteTarget) return; setFields(fields.filter((field) => field.id !== deleteTarget.id).map((field, order) => ({ ...field, order }))); setDeleteTarget(null) }
  return <><section className="page-heading compact-heading"><div><p className="eyebrow">KONFIGURASI SISTEM</p><h1>Config field</h1><p className="muted">Bentuk struktur data hibah tanpa mengubah kode aplikasi.</p></div><button className="primary-btn" onClick={() => { setEditing(null); setShowForm(true) }}><Plus size={16} /> Tambah field</button></section><div className="field-summary"><div><FileCog size={18} /><span><strong>{fields.length}</strong> Total field</span></div><div><Check size={18} /><span><strong>{fields.filter((field) => field.active).length}</strong> Field aktif</span></div><div><Activity size={18} /><span><strong>Live</strong> Sinkronisasi</span></div></div><div className="panel fields-panel"><div className="panel-head"><div><h2>Struktur field database</h2><p className="muted">Seret handle di kiri untuk mengubah urutan field.</p></div><button className="secondary-btn"><SlidersHorizontal size={16} /> Preview form</button></div><div className="field-list">{fields.map((field, index) => <div className={`field-row ${!field.active ? 'inactive' : ''} ${dragOverId === field.id ? 'drag-over' : ''}`} key={field.id} draggable onDragStart={() => setDraggedId(field.id)} onDragOver={(event) => { event.preventDefault(); setDragOverId(field.id) }} onDragEnd={() => { reorder(dragOverId); setDraggedId(null); setDragOverId(null) }}><div className="drag-handle" title="Seret untuk mengubah urutan" aria-label={`Seret ${field.label}`}><span /><span /><span /></div><div className="field-order">{String(index + 1).padStart(2, '0')}</div><div className="field-info"><strong>{field.label}</strong><small>{field.key} · {typeLabels[field.type]}</small></div><span className="field-type">{typeLabels[field.type]}</span>{field.active && <span className="required-tag">Wajib</span>}<button className={`toggle ${field.active ? 'on' : ''}`} onClick={() => toggle(field.id)} aria-label={`${field.active ? 'Nonaktifkan' : 'Aktifkan'} ${field.label}`}><span /></button><div className="field-actions"><button onClick={() => move(index, -1)} disabled={index === 0} title="Naikkan" aria-label={`Naikkan ${field.label}`}><ChevronUp size={14} /></button><button onClick={() => move(index, 1)} disabled={index === fields.length - 1} title="Turunkan" aria-label={`Turunkan ${field.label}`}><ChevronDown size={14} /></button><button onClick={() => duplicate(field)} title="Duplikat" aria-label={`Duplikat ${field.label}`}><Copy size={15} /></button><button onClick={() => { setEditing(field); setShowForm(true) }} title="Edit" aria-label={`Edit ${field.label}`}><Pencil size={15} /></button><button onClick={() => setDeleteTarget(field)} title="Hapus" aria-label={`Hapus ${field.label}`}><Trash2 size={15} /></button></div></div>)}</div></div>{showForm && <FieldFormLegacy field={editing} onClose={() => setShowForm(false)} onSave={save} />}{deleteTarget && <DeleteFieldConfirm field={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={remove} />}</>
}

function FieldsPageDelete({ fields, setFields }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const move = (index, direction) => { const next = [...fields]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; setFields(next.map((field, order) => ({ ...field, order }))) }
  const reorder = (targetId) => { if (!draggedId || draggedId === targetId) return; const next = [...fields]; const from = next.findIndex((field) => field.id === draggedId); const to = next.findIndex((field) => field.id === targetId); const [dragged] = next.splice(from, 1); next.splice(to, 0, dragged); setFields(next.map((field, order) => ({ ...field, order }))) }
  const save = (field) => { if (editing) setFields(fields.map((item) => item.id === editing.id ? { ...field, id: editing.id } : item)); else setFields([...fields, { ...field, id: `f${Date.now()}` }]); setShowForm(false); setEditing(null) }
  const duplicate = (field) => { const keyBase = `${field.key}_copy`; let key = keyBase; let suffix = 2; while (fields.some((item) => item.key === key)) key = `${keyBase}_${suffix++}`; const copy = { ...field, id: `f${Date.now()}`, key, label: `${field.label} (salinan)` }; const index = fields.findIndex((item) => item.id === field.id); const next = [...fields]; next.splice(index + 1, 0, copy); setFields(next.map((item, order) => ({ ...item, order }))) }
  const toggle = (id) => setFields(fields.map((field) => field.id === id ? { ...field, active: !field.active } : field))
  const remove = () => { if (!deleteTarget) return; setFields(fields.filter((field) => field.id !== deleteTarget.id).map((field, order) => ({ ...field, order }))); setDeleteTarget(null) }
  return <><section className="page-heading compact-heading"><div><p className="eyebrow">KONFIGURASI SISTEM</p><h1>Config field</h1><p className="muted">Bentuk struktur data hibah tanpa mengubah kode aplikasi.</p></div><button className="primary-btn" onClick={() => { setEditing(null); setShowForm(true) }}><Plus size={16} /> Tambah field</button></section><div className="field-summary"><div><FileCog size={18} /><span><strong>{fields.length}</strong> Total field</span></div><div><Check size={18} /><span><strong>{fields.filter((field) => field.active).length}</strong> Field aktif</span></div><div><Activity size={18} /><span><strong>Live</strong> Sinkronisasi</span></div></div><div className="panel fields-panel"><div className="panel-head"><div><h2>Struktur field database</h2><p className="muted">Seret handle di kiri untuk mengubah urutan field.</p></div><button className="secondary-btn"><SlidersHorizontal size={16} /> Preview form</button></div><div className="field-list">{fields.map((field, index) => <div className={`field-row ${!field.active ? 'inactive' : ''} ${dragOverId === field.id ? 'drag-over' : ''}`} key={field.id} draggable onDragStart={() => setDraggedId(field.id)} onDragOver={(event) => { event.preventDefault(); setDragOverId(field.id) }} onDragEnd={() => { reorder(dragOverId); setDraggedId(null); setDragOverId(null) }}><div className="drag-handle" title="Seret untuk mengubah urutan" aria-label={`Seret ${field.label}`}><span /><span /><span /></div><div className="field-order">{String(index + 1).padStart(2, '0')}</div><div className="field-info"><strong>{field.label}</strong><small>{field.key} · {typeLabels[field.type]}</small></div><span className="field-type">{typeLabels[field.type]}</span>{field.active && <span className="required-tag">Wajib</span>}<button className={`toggle ${field.active ? 'on' : ''}`} onClick={() => toggle(field.id)} aria-label={`${field.active ? 'Nonaktifkan' : 'Aktifkan'} ${field.label}`}><span /></button><div className="field-actions"><button onClick={() => move(index, -1)} disabled={index === 0} title="Naikkan" aria-label={`Naikkan ${field.label}`}><ChevronUp size={14} /></button><button onClick={() => move(index, 1)} disabled={index === fields.length - 1} title="Turunkan" aria-label={`Turunkan ${field.label}`}><ChevronDown size={14} /></button><button onClick={() => duplicate(field)} title="Duplikat" aria-label={`Duplikat ${field.label}`}><Copy size={15} /></button><button onClick={() => { setEditing(field); setShowForm(true) }} title="Edit" aria-label={`Edit ${field.label}`}><Pencil size={15} /></button><button onClick={() => setDeleteTarget(field)} title="Hapus" aria-label={`Hapus ${field.label}`}><Trash2 size={15} /></button></div></div>)}</div></div>{showForm && <FieldFormProfessional field={editing} onClose={() => setShowForm(false)} onSave={save} />}{deleteTarget && <DeleteFieldConfirm field={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={remove} />}</>
}

function FieldsPageDuplicate({ fields, setFields }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const move = (index, direction) => { const next = [...fields]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; setFields(next.map((field, order) => ({ ...field, order }))) }
  const reorder = (targetId) => { if (!draggedId || draggedId === targetId) return; const next = [...fields]; const from = next.findIndex((field) => field.id === draggedId); const to = next.findIndex((field) => field.id === targetId); const [dragged] = next.splice(from, 1); next.splice(to, 0, dragged); setFields(next.map((field, order) => ({ ...field, order }))) }
  const save = (field) => { if (editing) setFields(fields.map((item) => item.id === editing.id ? { ...field, id: editing.id } : item)); else setFields([...fields, { ...field, id: `f${Date.now()}` }]); setShowForm(false); setEditing(null) }
  const duplicate = (field) => { const keyBase = `${field.key}_copy`; let key = keyBase; let suffix = 2; while (fields.some((item) => item.key === key)) key = `${keyBase}_${suffix++}`; const copy = { ...field, id: `f${Date.now()}`, key, label: `${field.label} (salinan)` }; const index = fields.findIndex((item) => item.id === field.id); const next = [...fields]; next.splice(index + 1, 0, copy); setFields(next.map((item, order) => ({ ...item, order }))) }
  const toggle = (id) => setFields(fields.map((field) => field.id === id ? { ...field, active: !field.active } : field))
  const remove = () => { if (!deleteTarget) return; setFields(fields.filter((field) => field.id !== deleteTarget.id).map((field, order) => ({ ...field, order }))); setDeleteTarget(null) }
  return <><section className="page-heading compact-heading"><div><p className="eyebrow">KONFIGURASI SISTEM</p><h1>Config field</h1><p className="muted">Bentuk struktur data hibah tanpa mengubah kode aplikasi.</p></div><button className="primary-btn" onClick={() => { setEditing(null); setShowForm(true) }}><Plus size={16} /> Tambah field</button></section><div className="field-summary"><div><FileCog size={18} /><span><strong>{fields.length}</strong> Total field</span></div><div><Check size={18} /><span><strong>{fields.filter((field) => field.active).length}</strong> Field aktif</span></div><div><Activity size={18} /><span><strong>Live</strong> Sinkronisasi</span></div></div><div className="panel fields-panel"><div className="panel-head"><div><h2>Struktur field database</h2><p className="muted">Seret handle di kiri untuk mengubah urutan field.</p></div><button className="secondary-btn"><SlidersHorizontal size={16} /> Preview form</button></div><div className="field-list">{fields.map((field, index) => <div className={`field-row ${!field.active ? 'inactive' : ''} ${dragOverId === field.id ? 'drag-over' : ''}`} key={field.id} draggable onDragStart={() => setDraggedId(field.id)} onDragOver={(event) => { event.preventDefault(); setDragOverId(field.id) }} onDragEnd={() => { reorder(dragOverId); setDraggedId(null); setDragOverId(null) }}><div className="drag-handle" title="Seret untuk mengubah urutan" aria-label={`Seret ${field.label}`}><span /><span /><span /></div><div className="field-order">{String(index + 1).padStart(2, '0')}</div><div className="field-info"><strong>{field.label}</strong><small>{field.key} · {typeLabels[field.type]}</small></div><span className="field-type">{typeLabels[field.type]}</span>{field.active && <span className="required-tag">Wajib</span>}<button className={`toggle ${field.active ? 'on' : ''}`} onClick={() => toggle(field.id)} aria-label={`${field.active ? 'Nonaktifkan' : 'Aktifkan'} ${field.label}`}><span /></button><div className="field-actions"><button onClick={() => move(index, -1)} disabled={index === 0} title="Naikkan" aria-label={`Naikkan ${field.label}`}><ChevronUp size={14} /></button><button onClick={() => move(index, 1)} disabled={index === fields.length - 1} title="Turunkan" aria-label={`Turunkan ${field.label}`}><ChevronDown size={14} /></button><button onClick={() => duplicate(field)} title="Duplikat" aria-label={`Duplikat ${field.label}`}><Copy size={15} /></button><button onClick={() => { setEditing(field); setShowForm(true) }} title="Edit" aria-label={`Edit ${field.label}`}><Pencil size={15} /></button><button onClick={() => setDeleteTarget(field)} title="Hapus" aria-label={`Hapus ${field.label}`}><Trash2 size={15} /></button></div></div>)}</div></div>{showForm && <FieldFormProfessional field={editing} onClose={() => setShowForm(false)} onSave={save} />}{deleteTarget && <DeleteFieldConfirm field={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={remove} />}</>
}

function FieldsPageBackup({ fields, setFields }) {
  const [panelTarget, setPanelTarget] = useState(null)
  const exportConfig = () => { const payload = { app: 'E-Hibah', type: 'field-configuration', version: 1, exportedAt: new Date().toISOString(), fields }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `e-hibah-field-config-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url) }
  const importConfig = (event) => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const payload = JSON.parse(String(reader.result)); const imported = Array.isArray(payload) ? payload : payload.fields; const valid = Array.isArray(imported) && imported.length > 0 && imported.every((field) => field && typeof field.label === 'string' && typeof field.key === 'string' && typeLabels[field.type]); if (!valid) throw new Error('Format konfigurasi tidak valid.'); if (!window.confirm('Impor konfigurasi ini dan mengganti konfigurasi field saat ini?')) return; setFields(imported.map((field, index) => ({ ...field, id: field.id || `f${Date.now()}_${index}`, order: index }))) } catch (error) { window.alert(error.message || 'File konfigurasi tidak dapat dibaca.') } }; reader.readAsText(file) }
  useEffect(() => { setPanelTarget(document.querySelector('.fields-panel .panel-head > div')) }, [fields.length])
  const actions = <div className="field-page-actions"><input id="field-config-import" className="visually-hidden" type="file" accept="application/json,.json" onChange={importConfig} /><button className="secondary-btn" onClick={() => document.getElementById('field-config-import').click()}><Upload size={16} /> Import</button><button className="secondary-btn" onClick={exportConfig}><ArrowDownToLine size={16} /> Export</button></div>
  return <><FieldsPageDuplicate fields={fields} setFields={setFields} />{panelTarget && createPortal(actions, panelTarget)}</>
}

function DeleteFieldConfirm({ field, onCancel, onConfirm }) { return <div className="logout-backdrop" role="presentation" onClick={onCancel}><section className="logout-modal delete-field-modal" role="dialog" aria-modal="true" aria-labelledby="delete-field-title" onClick={(event) => event.stopPropagation()}><div className="logout-icon"><Trash2 size={21} /></div><h2 id="delete-field-title">Apakah anda yakin untuk menghapus field ini?</h2><p>Field <strong>{field.label}</strong> akan dihapus dari konfigurasi.</p><div className="logout-actions"><button className="cancel-logout" onClick={onCancel}>Batal</button><button className="confirm-logout" onClick={onConfirm}>Hapus field</button></div></section></div> }

function AccessDenied({ onBack }) { return <div className="access-denied"><ShieldCheck size={40} /><h2>Akses terbatas</h2><p>Halaman ini hanya tersedia untuk Superadmin.</p><button className="primary-btn" onClick={onBack}>Kembali ke ringkasan</button></div> }

const root = window.__hibahRoot || createRoot(document.getElementById('root'))
window.__hibahRoot = root
root.render(<StrictMode><App /></StrictMode>)
