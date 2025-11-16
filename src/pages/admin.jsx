import React, { useEffect, useState } from 'react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { auth, db } from '../firebase/firebase'
import { FiUsers, FiUser, FiRefreshCw, FiShield, FiChevronRight } from 'react-icons/fi'
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  orderBy,
  limit,
} from 'firebase/firestore'
import styles from './admin.module.css'

export default function AdminPage() {
  const MASTER_EMAIL = 'transforme-se@edu.pe.senac.br'
  const MASTER_PASSWORD = 'adminsenactransformese'

  const [adminAuthenticated, setAdminAuthenticated] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // User login fields (separate from master login)
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [showUserLoginForm, setShowUserLoginForm] = useState(false)

  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const [activeTab, setActiveTab] = useState('users')

  // filters
  const [filterName, setFilterName] = useState('')
  const [filterAge, setFilterAge] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [filterQuiz, setFilterQuiz] = useState('')
  const [filterInfractions, setFilterInfractions] = useState('')

  const [selectedUser, setSelectedUser] = useState(null)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [newAdminLevel, setNewAdminLevel] = useState(0)

  const [quizModalUser, setQuizModalUser] = useState(null)
  const [quizDetails, setQuizDetails] = useState(null)

  const [infractionsModalUser, setInfractionsModalUser] = useState(null)
  const [infractionsDetails, setInfractionsDetails] = useState([])

  // stats
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (adminAuthenticated) fetchUsers()
  }, [adminAuthenticated])

  const tryMasterLogin = async (e) => {
    e?.preventDefault()
    setLoadingAuth(true)
    try {
      if (email === MASTER_EMAIL && password === MASTER_PASSWORD) {
        setAdminAuthenticated(true)
      } else {
        // also allow signed-in firebase users with adminLevel=1 to be admins
        alert('Credenciais inválidas')
      }
    } catch (e) {
      console.error(e)
      alert('Erro ao autenticar')
    } finally {
      setLoadingAuth(false)
    }
  }

  const tryUserAsAdmin = async (e) => {
    e?.preventDefault()
    setLoadingAuth(true)
    
    try {
      // NÃO usa Firebase Auth aqui — consulta direta no Firestore por email.
      // Assumption: admin users are identified by their document field `adminLevel === 1`.
      const rawEmail = (userEmail || '')
      // normalize entered email (trim, unicode normalize, remove zero-width, lowercase)
      const cleanEmail = (s) => String(s || '')
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
        .toLowerCase()

      const trimmedEmail = cleanEmail(rawEmail)
      console.info('tryUserAsAdmin: attempting lookup for', { rawEmail, trimmedEmail })
      const q = query(collection(db, 'users'), where('email', '==', rawEmail.trim()), limit(1))
      let snap = await getDocs(q)

      // Fallback: tentar busca case-insensitive se a busca direta não retornou nada
      let userDoc = null
      if (snap.empty) {
        // busca simples (pode ser custosa em grandes coleções) — tentamos localizar por email ignorando case
        const allUsersSnap = await getDocs(collection(db, 'users'))
        // try direct email-like fields first, then any string field that contains an @
  // target is the normalized form we compare against candidate emails
  const target = trimmedEmail
        // Recursively collect any string values that look like emails from nested objects
        const collectEmailStrings = (obj, out = []) => {
          if (obj == null) return out
          if (typeof obj === 'string') {
            if (obj.includes('@')) out.push(obj)
            return out
          }
          if (Array.isArray(obj)) {
            for (const v of obj) collectEmailStrings(v, out)
            return out
          }
          if (typeof obj === 'object') {
            for (const [, v] of Object.entries(obj)) collectEmailStrings(v, out)
          }
          return out
        }

        for (const d of allUsersSnap.docs) {
          const data = d.data() || {}
          const candidates = []
          if (data.email) candidates.push(String(data.email))
          if (data.mail) candidates.push(String(data.mail))
          if (data.emailAddress) candidates.push(String(data.emailAddress))
          // collect nested strings that contain '@'
          const nested = collectEmailStrings(data)
          for (const n of nested) candidates.push(String(n))

          let matched = false
          for (const c of candidates) {
            if (!c) continue
            // normalize stored candidate similarly to entered target
            const clean = cleanEmail(c.toString())
            // require exact normalized match to avoid false positives
            if (clean === target) {
              userDoc = d
              matched = true
              break
            }
          }
          if (matched) {
            const infoEmails = candidates.map(c => String(c).trim()).filter(Boolean)
            console.info('tryUserAsAdmin: matched doc', d.id, 'adminLevel:', d.data()?.adminLevel, 'candidates:', infoEmails, 'normalizedTarget:', target)
            break
          }
        }

        if (!userDoc) {
          // diagnostic: print first few docs and their email-like candidates to console to help debugging
          const sample = allUsersSnap.docs.slice(0, 10).map(d => ({ id: d.id, emails: collectEmailStrings(d.data() || {}).map(e => ({ raw: e, normalized: cleanEmail(e) })) }))
          console.info('tryUserAsAdmin: searched', allUsersSnap.size, 'users — none matched', { rawSearched: rawEmail, normalizedSearched: trimmedEmail, sample })
          alert('❌ Usuário não encontrado no banco de dados.\n\nAcesso negado.')
          setLoadingAuth(false)
          return
        }
      } else {
        userDoc = snap.docs[0]
      }
  const userData = userDoc.data()
      const adminLevel = userData?.adminLevel ?? 0

      if (Number(adminLevel) !== 1) {
        alert('❌ Este usuário não tem permissão de admin.\n\nNível: ' + (adminLevel ?? 'indefinido') + '\n\nAcesso negado.')
        setLoadingAuth(false)
        return
      }

      // Sucesso: usuário com adminLevel 1 — autentica no painel (não altera auth global)
      setAdminAuthenticated(true)
      setShowUserLoginForm(false)
      setUserEmail('')
      setUserPassword('')

    } catch (err) {
      console.error('Erro ao verificar usuário admin:', err)
      alert('❌ Erro ao verificar usuário: ' + (err.message || err))
    } finally {
      setLoadingAuth(false)
    }
  }

  async function fetchUsers() {
    setLoadingUsers(true)
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('name')))
      const usersList = []
      for (const u of usersSnap.docs) {
        const data = u.data()
        const uid = u.id
        // get character
        const charDoc = await getDoc(doc(db, 'characters', uid))
        const char = charDoc.exists() ? charDoc.data() : null
        // get infractions count
        const violSnap = await getDocs(query(collection(db, 'violations'), where('userId', '==', uid)))
        const infractions = violSnap.size || violSnap.docs.length || 0
        // quiz info: Get ALL quiz results (Phase 1 + Phase 2) and combine them
        let quizInfo = null
        try {
          // Get ALL documents from quizResults, not just the latest one
          const quizSnap = await getDocs(query(collection(db, 'users', uid, 'quizResults'), orderBy('timestamp', 'desc')))
          
          if (quizSnap.docs && quizSnap.docs.length > 0) {
            // Combine ALL phases into one result
            let totalCorrect = 0
            let totalQuestions = 0
            let allAnswers = []
            let latestTimestamp = null
            
            quizSnap.docs.forEach(docSnap => {
              const qdoc = docSnap.data()
              
              // Add up the scores from each phase
              totalCorrect += (qdoc.correctAnswers ?? qdoc.totalCorrect ?? qdoc.correct ?? 0)
              totalQuestions += (qdoc.totalQuestions ?? qdoc.total ?? 0)
              
              // Combine answers from all phases
              if (Array.isArray(qdoc.answers)) {
                const normalizedAnswers = qdoc.answers.map(a => {
                  const isCorrect = (a.isCorrect != null)
                    ? Boolean(a.isCorrect)
                    : (a.selected != null && a.correct != null ? a.selected === a.correct : null)
                  return {
                    questionId: a.questionId ?? null,
                    selected: a.selected ?? null,
                    correctIndex: a.correct ?? null,
                    isCorrect,
                    correct: isCorrect,
                  }
                })
                allAnswers = [...allAnswers, ...normalizedAnswers]
              }
              
              // Keep the latest timestamp
              const docTimestamp = qdoc.timestamp ?? qdoc.completedAt ?? null
              if (!latestTimestamp || (docTimestamp && docTimestamp > latestTimestamp)) {
                latestTimestamp = docTimestamp
              }
            })

            quizInfo = {
              totalCorrect: totalCorrect,
              totalQuestions: totalQuestions,
              answers: allAnswers.length > 0 ? allAnswers : null,
              timestamp: latestTimestamp,
            }
          } else if (data.quizStats) {
            // fallback to aggregated stats stored on the user document
            const qs = data.quizStats
            quizInfo = {
              totalCorrect: qs.correct ?? null,
              totalQuestions: qs.total ?? null,
              answers: null,
              timestamp: qs.lastQuizDate ?? null,
            }
          }
        } catch (e) {
          console.warn('Erro ao buscar quizResults subcollection:', e)
          // fallback
          if (data.quizStats) {
            const qs = data.quizStats
            quizInfo = {
              totalCorrect: qs.correct ?? null,
              totalQuestions: qs.total ?? null,
              answers: null,
              timestamp: qs.lastQuizDate ?? null,
            }
          }
        }

        usersList.push({ uid, ...data, character: char, infractions, quizInfo })
      }
      setUsers(usersList)
      computeStats(usersList)
    } catch (e) {
      console.error('Erro ao buscar usuários:', e)
      alert('Erro ao buscar usuários')
    } finally {
      setLoadingUsers(false)
    }
  }

  const openAdminModal = (user) => {
    setSelectedUser(user)
    setNewAdminLevel(user.adminLevel || 0)
    setShowAdminModal(true)
  }

  const saveAdminLevel = async () => {
    if (!selectedUser) return
    try {
      console.info('saveAdminLevel: saving', selectedUser.uid, '->', Number(newAdminLevel))
      // Try update first; if document doesn't exist, fallback to set with merge
      try {
        await updateDoc(doc(db, 'users', selectedUser.uid), { adminLevel: Number(newAdminLevel) })
      } catch (innerErr) {
        console.warn('saveAdminLevel: updateDoc failed, trying setDoc with merge', innerErr)
        await setDoc(doc(db, 'users', selectedUser.uid), { adminLevel: Number(newAdminLevel) }, { merge: true })
      }

      // Verify saved by reading the document back
      try {
        const fresh = await getDoc(doc(db, 'users', selectedUser.uid))
        console.info('saveAdminLevel: fresh doc:', fresh.exists() ? fresh.data() : null)
      } catch (readErr) {
        console.warn('saveAdminLevel: could not read back doc after save', readErr)
      }

      // update local state and UI
      setUsers(prev => prev.map(u => u.uid === selectedUser.uid ? { ...u, adminLevel: Number(newAdminLevel) } : u))
      setShowAdminModal(false)
      alert('✅ Nível de admin salvo com sucesso.')

      // refresh the users from server so stats and UI reflect persisted changes
      fetchUsers()
    } catch (e) {
      console.error('Erro ao salvar nível:', e)
      alert('Erro ao salvar nível de admin: ' + (e.message || e))
    }
  }

  const openQuizModal = (user) => {
    setQuizModalUser(user)
    // derive quiz details if available
    const q = user.quizInfo
    if (!q) {
      setQuizDetails(null)
      return
    }
    // expected shape: { totalCorrect, totalQuestions, answers: [{questionId, correct}] }
    setQuizDetails(q)
  }

  const deleteUser = async () => {
    if (!selectedUser) return
    const confirmDelete = window.confirm(
      `⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\n` +
      `Você está prestes a DELETAR PERMANENTEMENTE:\n` +
      `• Usuário: ${selectedUser.name}\n` +
      `• Email: ${selectedUser.email}\n` +
      `• Personagem associado\n` +
      `• Todos os resultados de quiz\n` +
      `• Todas as infrações\n\n` +
      `Tem certeza que deseja continuar?`
    )
    
    if (!confirmDelete) return

    try {
      const uid = selectedUser.uid
      
      // Delete character
      try {
        await setDoc(doc(db, 'characters', uid), { deleted: true, deletedAt: new Date().toISOString() })
      } catch (e) {
        console.warn('Erro ao deletar personagem:', e)
      }

      // Delete quiz results
      try {
        const quizResultsSnap = await getDocs(collection(db, 'users', uid, 'quizResults'))
        for (const qDoc of quizResultsSnap.docs) {
          await setDoc(doc(db, 'users', uid, 'quizResults', qDoc.id), { deleted: true })
        }
      } catch (e) {
        console.warn('Erro ao deletar resultados de quiz:', e)
      }

      // Delete quiz progress
      try {
        await setDoc(doc(db, 'users', uid, 'quizProgress', 'phase2'), { deleted: true })
      } catch (e) {
        console.warn('Erro ao deletar progresso:', e)
      }

      // Delete violations
      try {
        const violSnap = await getDocs(query(collection(db, 'violations'), where('userId', '==', uid)))
        for (const vDoc of violSnap.docs) {
          await setDoc(doc(db, 'violations', vDoc.id), { deleted: true })
        }
      } catch (e) {
        console.warn('Erro ao deletar infrações:', e)
      }

      // Delete user document
      await setDoc(doc(db, 'users', uid), { deleted: true, deletedAt: new Date().toISOString() })

      setShowAdminModal(false)
      alert('✅ Usuário deletado com sucesso!')
      fetchUsers()
    } catch (e) {
      console.error('Erro ao deletar usuário:', e)
      alert('❌ Erro ao deletar usuário: ' + (e.message || e))
    }
  }

  const resetQuiz = async () => {
    if (!selectedUser) return
    const confirmReset = window.confirm(
      `Resetar quiz do usuário ${selectedUser.name}?\n\n` +
      `Isso vai:\n` +
      `• Deletar todos os resultados salvos\n` +
      `• Resetar estatísticas (quizStats)\n` +
      `• Deletar progresso não finalizado\n\n` +
      `O usuário terá que fazer o quiz novamente desde o início.`
    )
    
    if (!confirmReset) return

    try {
      const uid = selectedUser.uid

      // Delete all quiz results
      const quizResultsSnap = await getDocs(collection(db, 'users', uid, 'quizResults'))
      for (const qDoc of quizResultsSnap.docs) {
        await setDoc(doc(db, 'users', uid, 'quizResults', qDoc.id), { deleted: true })
      }

      // Delete quiz progress
      await setDoc(doc(db, 'users', uid, 'quizProgress', 'phase2'), { deleted: true })

      // Reset quizStats
      await setDoc(doc(db, 'users', uid), {
        quizStats: {
          total: 0,
          correct: 0,
          wrong: 0,
          phaseOneCompleted: false,
          phaseTwoCompleted: false,
          lastQuizDate: null
        }
      }, { merge: true })

      alert('✅ Quiz resetado com sucesso!')
      fetchUsers()
    } catch (e) {
      console.error('Erro ao resetar quiz:', e)
      alert('❌ Erro ao resetar quiz: ' + (e.message || e))
    }
  }

  const openInfractionsModal = async (user) => {
    setInfractionsModalUser(user)
    
    try {
      const violSnap = await getDocs(query(collection(db, 'violations'), where('userId', '==', user.uid)))
      const violations = violSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
      setInfractionsDetails(violations)
    } catch (e) {
      console.error('Erro ao buscar infrações:', e)
      setInfractionsDetails([])
    }
  }

  function computeStats(usersList) {
    // characters: count by skinColor categories and gender
    const raceCounts = { preta: 0, parda: 0, indigena: 0, branca: 0, amarela: 0, unknown: 0 }
    let male = 0, female = 0, genderTotal = 0
    let totalCorrect = 0, totalQuestions = 0
    // helper to normalize skin codes like 'skin1' to 'preto'
    const skinCodeMap = { skin1: 'preto', skin2: 'pardo', skin3: 'indigena', skin4: 'amarelo', skin5: 'branco' }

    // count only users that have a character for race percentages
    const usersWithCharacter = usersList.filter(u => u.character)

    for (const u of usersList) {
      const ch = u.character || {}
      // prefer normalized skinColor, then skinCode, then other fallbacks
      let rawSkin = ''
      if (ch.skinColor) rawSkin = String(ch.skinColor)
      else if (ch.skinCode) rawSkin = String(ch.skinCode)
      else if (ch.skin) rawSkin = String(ch.skin)
      else if (ch.skinTone) rawSkin = String(ch.skinTone)

      let skin = rawSkin.toString().toLowerCase()
      // map old code format like 'skin1'
      if (skinCodeMap[skin]) skin = skinCodeMap[skin]
      // also accept uppercase names like 'PRETO'
      skin = skin.trim()

      if (skin) {
        if (skin.includes('preta') || skin.includes('negra') || skin.includes('preto') || skin.includes('negro')) {
          raceCounts.preta++
        } else if (skin.includes('parda') || skin.includes('pardo')) {
          raceCounts.parda++
        } else if (skin.includes('indig') || skin.includes('índ') || skin.includes('indígena') || skin.includes('indigena')) {
          raceCounts.indigena++
        } else if (skin.includes('branc') || skin.includes('clara') || skin.includes('branco') || skin.includes('branca')) {
          raceCounts.branca++
        } else if (skin.includes('amarel') || skin.includes('amare') || skin.includes('amarela') || skin.includes('amarelo')) {
          raceCounts.amarela++
        } else {
          raceCounts.unknown++
        }
      } else {
        // no skin info on this character
        // only count as unknown if user has a character doc but no skin fields
        if (u.character) raceCounts.unknown++
      }

      const g = (ch.gender || '').toString().toLowerCase()
      if (g === 'male' || g === 'masculino' ) male++
      else if (g === 'female' || g === 'feminino') female++
      genderTotal++

      const qi = u.quizInfo
      if (qi) {
        // flexible shapes
        if (qi.totalCorrect != null && qi.totalQuestions != null) {
          totalCorrect += Number(qi.totalCorrect)
          totalQuestions += Number(qi.totalQuestions)
        } else if (Array.isArray(qi.answers)) {
          const correct = qi.answers.filter(a => a.correct).length
          totalCorrect += correct
          totalQuestions += qi.answers.length
        }
      }
    }

  // Use only users with a character document as denominator for race percentages
  const totalCharacters = usersWithCharacter.length || 0
  const denom = totalCharacters || 1
  const racePercent = Object.fromEntries(Object.entries(raceCounts).map(([k,v]) => [k, Math.round((v/denom)*100)]))
    const femalePct = genderTotal ? Math.round((female/genderTotal)*100) : 0
    const malePct = genderTotal ? Math.round((male/genderTotal)*100) : 0
    const overallCorrectPct = totalQuestions ? Math.round((totalCorrect/totalQuestions)*100) : 0
    const overallErrorPct = totalQuestions ? 100 - overallCorrectPct : 0

    setStats({ racePercent, femalePct, malePct, overallCorrectPct, overallErrorPct })
  }

  function getFilteredUsers() {
    return users.filter(u => {
      // filter by name
      if (filterName && !u.name?.toLowerCase().includes(filterName.toLowerCase())) return false
      
      // filter by age
      if (filterAge && u.age !== Number(filterAge)) return false
      
      // filter by gender
      if (filterGender) {
        const userGender = u.character?.gender?.toLowerCase() || ''
        if (filterGender === 'M' && !['male', 'masculino'].includes(userGender)) return false
        if (filterGender === 'F' && !['female', 'feminino'].includes(userGender)) return false
      }
      
      // filter by quiz (correct/error)
      if (filterQuiz) {
        if (!u.quizInfo) return false
        const totalCorrect = u.quizInfo.totalCorrect ?? (Array.isArray(u.quizInfo.answers) ? u.quizInfo.answers.filter(a=>a.correct).length : 0)
        const totalQuestions = u.quizInfo.totalQuestions ?? (Array.isArray(u.quizInfo.answers) ? u.quizInfo.answers.length : 0)
        
        if (filterQuiz === 'correct' && totalCorrect < totalQuestions) return false
        if (filterQuiz === 'error' && totalCorrect === totalQuestions) return false
      }
      
      // filter by infractions
      if (filterInfractions) {
        if (filterInfractions === 'yes' && u.infractions === 0) return false
        if (filterInfractions === 'no' && u.infractions > 0) return false
      }
      
      return true
    })
  }

  return (
    <div className={`p-8 ${styles.container}`}>
      <Card className={`p-6 mb-6 ${styles.headerCard}`}>
        {!adminAuthenticated ? (
          <div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FiShield className="w-6 h-6 text-amber-500" />
                <h2 className="text-lg font-semibold">Painel de Administração</h2>
              </div>
              <div className="text-sm text-gray-500">Credenciais mestre: <span className="font-mono">{MASTER_EMAIL}</span></div>
            </div>
            {!showUserLoginForm ? (
              <form onSubmit={tryMasterLogin} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center mt-4">
                <Input className="sm:col-span-1" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
                <Input className="sm:col-span-1" placeholder="senha" value={password} onChange={e => setPassword(e.target.value)} type="password" />
                <Button className="sm:col-span-1" type="submit" disabled={loadingAuth}>
                  {loadingAuth ? 'Entrando...' : <><FiUser className="inline mr-2" />Entrar</>}
                </Button>
                <Button className="sm:col-span-1" variant="ghost" onClick={() => setShowUserLoginForm(true)}><FiUsers className="inline mr-2" />Entrar como usuário</Button>
              </form>
            ) : (
              <form onSubmit={tryUserAsAdmin} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center mt-4">
                <Input className="sm:col-span-1" placeholder="email de usuário" value={userEmail} onChange={e => setUserEmail(e.target.value)} disabled={loadingAuth} />
                <Input className="sm:col-span-1" placeholder="senha do usuário" value={userPassword} onChange={e => setUserPassword(e.target.value)} type="password" disabled={loadingAuth} />
                <Button className="sm:col-span-1" type="submit" disabled={loadingAuth}>
                  {loadingAuth ? 'Entrando...' : <><FiUser className="inline mr-2" />Entrar como usuário</>}
                </Button>
                <Button className="sm:col-span-1" variant="ghost" onClick={() => { setShowUserLoginForm(false); setUserEmail(''); setUserPassword('') }} disabled={loadingAuth}>Voltar</Button>
              </form>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <FiShield className="w-6 h-6 text-amber-500" />
              <h2 className="text-lg font-semibold">Painel de Administração</h2>
              <span className="ml-2 text-sm text-gray-500">(Área restrita)</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => { setAdminAuthenticated(false); setUsers([]); setFilterName(''); setFilterAge(''); setFilterGender(''); setFilterQuiz(''); setFilterInfractions('') }}><FiUser className="inline mr-2" />Sair</Button>
              <Button onClick={fetchUsers}><FiRefreshCw className="inline mr-2" />Atualizar</Button>
            </div>
          </div>
        )}
      </Card>

      {adminAuthenticated && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Button variant={activeTab === 'users' ? 'default' : 'ghost'} onClick={() => setActiveTab('users')}>
                <FiUsers className="inline mr-2" />Usuários
              </Button>
              <Button variant={activeTab === 'stats' ? 'default' : 'ghost'} onClick={() => setActiveTab('stats')}>
                <FiUser className="inline mr-2" />Estatísticas
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2"><FiUsers className="text-amber-500" /> <span><span className="font-bold text-gray-900">{users.length}</span><span className="text-xs text-gray-400"> usuários</span></span></div>
              <div className="flex items-center gap-2"><FiUser className="text-green-500" /> <span><span className="font-bold text-gray-900">{users.filter(u=>u.character).length}</span><span className="text-xs text-gray-400"> personagens</span></span></div>
              <div className="flex items-center gap-2"><FiRefreshCw className="text-red-500" /> <span><span className="font-bold text-gray-900">{users.reduce((acc,u)=>acc + (u.infractions||0),0)}</span><span className="text-xs text-gray-400"> infrações</span></span></div>
            </div>
          </div>

          {activeTab === 'users' && (
            <Card className={`p-6 ${styles.card}`}>
              {loadingUsers ? (
                <div className="text-center py-8 text-gray-500">Carregando usuários...</div>
              ) : (
                <div>
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-bold mb-3 text-gray-700">Filtros</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                      <Input 
                        placeholder="🔍 Filtrar por Nome..." 
                        value={filterName} 
                        onChange={e => setFilterName(e.target.value)}
                        className="text-sm"
                      />
                      <Input 
                        placeholder="🔍 Filtrar por Idade..." 
                        type="number"
                        value={filterAge} 
                        onChange={e => setFilterAge(e.target.value)}
                        className="text-sm"
                      />
                      <select 
                        value={filterGender} 
                        onChange={e => setFilterGender(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">🔍 Todos os Gêneros</option>
                        <option value="M">👨 Masculino</option>
                        <option value="F">👩 Feminino</option>
                      </select>
                      <select 
                        value={filterQuiz} 
                        onChange={e => setFilterQuiz(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">🔍 Todos os Quiz</option>
                        <option value="correct">✅ Acertos</option>
                        <option value="error">❌ Erros</option>
                      </select>
                      <select 
                        value={filterInfractions} 
                        onChange={e => setFilterInfractions(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">🔍 Todas as Infrações</option>
                        <option value="yes">⚠️ Com Infrações</option>
                        <option value="no">✨ Sem Infrações</option>
                      </select>
                    </div>
                    {(filterName || filterAge || filterGender || filterQuiz || filterInfractions) && (
                      <button 
                        onClick={() => { setFilterName(''); setFilterAge(''); setFilterGender(''); setFilterQuiz(''); setFilterInfractions('') }}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>

                  <div className={`overflow-x-auto ${styles.tableWrapper}`}>
                    <table className={`w-full text-left ${styles.table}`}>
                      <thead>
                        <tr>
                          <th className={`p-3 ${styles.th}`}>Nome</th>
                          <th className={`p-3 ${styles.th}`}>Idade</th>
                          <th className={`p-3 ${styles.th}`}>Email</th>
                          <th className={`p-3 ${styles.th}`}>Gênero</th>
                          <th className={`p-3 ${styles.th}`}>Quiz</th>
                          <th className={`p-3 ${styles.th}`}>Infrações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredUsers().map(u => (
                          <tr key={u.uid} className={`border-t hover:bg-amber-50 transition ${styles.tr}`}>
                            <td className={`p-3 ${styles.td}`}>
                              <button className="text-blue-600 hover:underline font-medium" onClick={() => openAdminModal(u)}>
                                {u.name || '(sem nome)'}
                              </button>
                            </td>
                            <td className={`p-3 ${styles.td}`}>{u.age || '-'}</td>
                            <td className={`p-3 ${styles.td} text-sm`}>
                              <button className="text-blue-600 hover:underline break-all" onClick={() => openAdminModal(u)}>
                                {u.email}
                              </button>
                            </td>
                            <td className={`p-3 ${styles.td}`}>
                              {u.character ? (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                                  {u.character.gender === 'female' ? '👩 F' : u.character.gender === 'male' ? '👨 M' : '❓'}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className={`p-3 ${styles.td}`}>
                              <button 
                                className="text-blue-600 hover:underline font-semibold" 
                                onClick={() => openQuizModal(u)}
                              >
                                {u.quizInfo ? (
                                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                                    {u.quizInfo.totalCorrect ?? (Array.isArray(u.quizInfo.answers) ? u.quizInfo.answers.filter(a=>a.correct).length : '-') }
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </button>
                            </td>
                            <td className={`p-3 ${styles.td}`}>
                              {u.infractions > 0 ? (
                                <button 
                                  className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 transition"
                                  onClick={() => openInfractionsModal(u)}
                                >
                                  {u.infractions}
                                </button>
                              ) : (
                                <span className="text-gray-400">0</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {getFilteredUsers().length === 0 && (
                    <div className="text-center py-8 text-gray-500">Nenhum usuário encontrado com esses filtros.</div>
                  )}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'stats' && (
            <Card className="p-6">
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <FiUser className="text-purple-500 w-5 h-5" />
                      <h3 className="text-lg font-bold">Distribuição Racial</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: '🖤 Pretas', key: 'preta' },
                        { label: '🟤 Pardas', key: 'parda' },
                        { label: '🟠 Indígenas', key: 'indigena' },
                        { label: '💛 Amarelas', key: 'amarela' },
                        { label: '⚪ Brancas', key: 'branca' },
                        { label: '❓ Desconhecidas', key: 'unknown' }
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition" 
                                style={{ width: `${stats.racePercent[item.key]}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 w-8 text-right">{stats.racePercent[item.key]}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <FiUsers className="text-blue-500 w-5 h-5" />
                        <h3 className="text-lg font-bold">Gênero</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">👩 Feminino</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-pink-500 h-2 rounded-full transition" 
                                style={{ width: `${stats.femalePct}%` }}
                              />
                            </div>
                            <span className="font-bold text-gray-900 w-8 text-right">{stats.femalePct}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">👨 Masculino</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition" 
                                style={{ width: `${stats.malePct}%` }}
                              />
                            </div>
                            <span className="font-bold text-gray-900 w-8 text-right">{stats.malePct}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <FiRefreshCw className="text-green-500 w-5 h-5" />
                        <h3 className="text-lg font-bold">Desempenho do Quiz</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">✅ Taxa de acerto</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition" 
                                style={{ width: `${stats.overallCorrectPct}%` }}
                              />
                            </div>
                            <span className="font-bold text-gray-900 w-8 text-right">{stats.overallCorrectPct}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">❌ Taxa de erro</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full transition" 
                                style={{ width: `${stats.overallErrorPct}%` }}
                              />
                            </div>
                            <span className="font-bold text-gray-900 w-8 text-right">{stats.overallErrorPct}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiRefreshCw className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  Carregue os usuários para gerar estatísticas.
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Admin level modal */}
      {showAdminModal && selectedUser && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${styles.modalOverlay}`}>
          <div className={`absolute inset-0 bg-black/60 ${styles.modalBackdrop}`} onClick={() => setShowAdminModal(false)} />
          <Card className={`z-50 p-6 w-full max-w-md mx-4 ${styles.modalCard}`}>
            <div className="flex items-center gap-3 mb-4">
              <FiShield className="text-amber-500 w-6 h-6" />
              <h3 className="text-lg font-bold">Editar Nível de Admin</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded">
              Usuário: <span className="font-semibold">{selectedUser.name}</span> <br /> 
              Email: <span className="font-mono text-xs">{selectedUser.email}</span>
            </p>
            <div className="flex items-center gap-3 mb-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-sm font-medium text-gray-700">Nível de acesso:</span>
              <select value={newAdminLevel} onChange={e => setNewAdminLevel(Number(e.target.value))} className="px-3 py-2 border-2 border-amber-300 rounded-lg font-semibold">
                <option value={0}>0 - Sem acesso</option>
                <option value={1}>1 - Admin</option>
              </select>
            </div>
            <div className="flex justify-between gap-2">
              <Button 
                variant="destructive" 
                onClick={deleteUser}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                🗑️ Deletar Conta
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={resetQuiz}
                  className="border-orange-500 text-orange-700 hover:bg-orange-50"
                >
                  🔄 Resetar Quiz
                </Button>
                <Button variant="ghost" onClick={() => setShowAdminModal(false)}>Cancelar</Button>
                <Button onClick={saveAdminLevel} className="bg-amber-500 hover:bg-amber-600"><FiShield className="inline mr-2" />Salvar</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Infractions modal */}
      {infractionsModalUser && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${styles.modalOverlay}`}>
          <div className={`absolute inset-0 bg-black/60 ${styles.modalBackdrop}`} onClick={() => { setInfractionsModalUser(null); setInfractionsDetails([]) }} />
          <Card className={`z-50 p-6 w-full max-w-3xl max-h-[80vh] overflow-auto mx-4 ${styles.modalCardLarge}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-bold">Infrações</h3>
              <span className="text-gray-600">— {infractionsModalUser.name}</span>
            </div>
            {infractionsDetails.length > 0 ? (
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>{infractionsDetails.length}</strong> infração(ões) registrada(s)
                  </p>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {infractionsDetails.map((infraction, idx) => (
                    <div 
                      key={infraction.id || idx}
                      className="p-4 bg-white border-l-4 border-red-500 rounded-lg shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">🚫</span>
                            <span className="font-bold text-red-700">Infração #{idx + 1}</span>
                          </div>
                          {infraction.message && (
                            <p className="text-gray-700 mb-2">
                              <strong>Mensagem:</strong> {infraction.message}
                            </p>
                          )}
                          {infraction.reason && (
                            <p className="text-gray-700 mb-2">
                              <strong>Motivo:</strong> {infraction.reason}
                            </p>
                          )}
                          {infraction.type && (
                            <p className="text-gray-600 text-sm mb-1">
                              <strong>Tipo:</strong> {infraction.type}
                            </p>
                          )}
                          {infraction.timestamp && (
                            <p className="text-gray-500 text-xs">
                              <strong>Data:</strong> {new Date(infraction.timestamp).toLocaleString('pt-BR')}
                            </p>
                          )}
                          {infraction.createdAt && !infraction.timestamp && (
                            <p className="text-gray-500 text-xs">
                              <strong>Data:</strong> {new Date(infraction.createdAt).toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl mb-3 block">✨</span>
                Nenhuma infração registrada para este usuário.
              </div>
            )}
            <div className="flex justify-end mt-6">
              <Button variant="ghost" onClick={() => { setInfractionsModalUser(null); setInfractionsDetails([]) }}>Fechar</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Quiz modal */}
      {quizModalUser && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${styles.modalOverlay}`}>
          <div className={`absolute inset-0 bg-black/60 ${styles.modalBackdrop}`} onClick={() => { setQuizModalUser(null); setQuizDetails(null) }} />
          <Card className={`z-50 p-6 w-full max-w-2xl max-h-[80vh] overflow-auto mx-4 ${styles.modalCardLarge}`}>
            <div className="flex items-center gap-3 mb-4">
              <FiRefreshCw className="text-blue-500 w-6 h-6" />
              <h3 className="text-lg font-bold">Detalhes do Quiz</h3>
              <span className="text-gray-600">— {quizModalUser.name}</span>
            </div>
            {quizDetails ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="text-sm text-gray-600">Respostas corretas</p>
                    <p className="text-2xl font-bold text-green-600">{quizDetails.totalCorrect ?? (Array.isArray(quizDetails.answers) ? quizDetails.answers.filter(a=>a.correct).length : '-') }</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total de perguntas</p>
                    <p className="text-2xl font-bold text-blue-600">{quizDetails.totalQuestions ?? (Array.isArray(quizDetails.answers) ? quizDetails.answers.length : '-') }</p>
                  </div>
                </div>
                {Array.isArray(quizDetails.answers) && quizDetails.answers.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-3 flex items-center gap-2"><FiChevronRight /> Respostas por pergunta</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {quizDetails.answers.map((a, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${
                            a.correct 
                              ? 'bg-green-50 border-green-500 text-green-700' 
                              : 'bg-red-50 border-red-500 text-red-700'
                          }`}
                        >
                          <span className="font-bold text-lg">{a.correct ? '✅' : '❌'}</span>
                          <span>
                            <strong>Pergunta {a.questionId ?? idx+1}:</strong> {a.correct ? 'Correta' : 'Errada'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FiUser className="w-12 h-12 mx-auto mb-3 opacity-30" />
                Detalhes do quiz não disponíveis para este usuário.
              </div>
            )}
            <div className="flex justify-end mt-6">
              <Button variant="ghost" onClick={() => { setQuizModalUser(null); setQuizDetails(null) }}>Fechar</Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  )
}
