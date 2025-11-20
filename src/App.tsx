import React, { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { ProfileForm } from './components/ProfileForm';
import { AvatarSelection } from './components/AvatarSelection';
import { QuizGame } from './components/QuizGame';
import { QuizGamePhaseOne } from './components/QuizGamePhaseOne';
import { QuizGamePhaseTwo } from './components/QuizGamePhaseTwo';
import { ResultScreen } from './components/ResultScreen';
import { ResultScreenPhaseTwo } from './components/ResultScreenPhaseTwo';
import { MainMenu } from './components/MainMenu';
import { Community } from './components/Community';
import { Library } from './components/Library';
import { LocalsPE } from './components/LocalsPE';
import { Stories } from './components/Stories';
import { Support } from './components/Support';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomeFemale from './pages/homeFemale';
import HomeMale from './pages/homeMale';
import AdminPage from './pages/admin';
import Landpage from './pages/landpage';

export type UserData = {
  name: string;
  age: number;
  avatar: string;
  email?: string;
};

export type GameStep = 'auth' | 'profile' | 'avatar' | 'quizPhaseOne' | 'quizPhaseTwo' | 'quiz' | 'result' | 'resultPhaseTwo' | 'resultPhaseOne' | 'menu' | 'community' | 'library' | 'locals' | 'stories' | 'support';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<GameStep>('auth');
  const [userData, setUserData] = useState<UserData>({ name: '', age: 0, avatar: '', email: '' });
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(15);
  const [phaseTwoScore, setPhaseTwoScore] = useState(0);
  const [totalAccumulatedScore, setTotalAccumulatedScore] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Sync currentStep with URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/app') {
      // Default to menu if just /app
      if (isUserAuthenticated && currentStep !== 'auth' && currentStep !== 'profile' && currentStep !== 'avatar' && currentStep !== 'quizPhaseOne' && currentStep !== 'quizPhaseTwo' && currentStep !== 'quiz' && currentStep !== 'result' && currentStep !== 'resultPhaseTwo' && currentStep !== 'resultPhaseOne') {
        navigate('/app/menu', { replace: true });
      }
    } else if (path.startsWith('/app/')) {
      const step = path.split('/').pop();
      // Only sync URL to currentStep if not in auth-related steps and not in result screens
      if (step && ['menu', 'community', 'library', 'locals', 'stories', 'support', 'quizPhaseTwo'].includes(step) && currentStep !== 'auth' && currentStep !== 'resultPhaseOne' && currentStep !== 'resultPhaseTwo') {
        setCurrentStep(step as GameStep);
      }
    }
  }, [location, isUserAuthenticated, currentStep, navigate]);

  // Monitorar mudanças de autenticação
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    console.log('🔐 App - Auth state changed:', currentUser ? 'LOGGED_IN' : 'LOGGED_OUT');
    
    // Não interferir com a página admin - ela tem sua própria autenticação
    if (location.pathname.startsWith('/admin')) {
      console.log('🔐 App - Skipping auth navigation for admin page');
      return;
    }
    
    if (currentUser) {
      console.log('🔐 App - User logged in:', currentUser.uid);
      setUserId(currentUser.uid);
      setUserData((prev) => ({ ...prev, email: currentUser.email || '' }));
      setIsUserAuthenticated(true);

      try {
        const userDocRef = doc(db, 'users', currentUser.uid)
        const charDocRef = doc(db, 'characters', currentUser.uid)

        const [userDoc, charDoc] = await Promise.all([
          getDoc(userDocRef),
          getDoc(charDocRef)
        ]);

        if (userDoc.exists()) {
          const userDataFromDB = userDoc.data();
          setUserData((prev) => ({
            ...prev,
            name: userDataFromDB.name || '',
            age: userDataFromDB.age || 0,
            email: currentUser.email || '',
          }));

          if (charDoc.exists()) {
            const charData = charDoc.data();
            setUserData((prev) => ({
              ...prev,
              avatar: `${charData.gender}-${charData.hairId}`,
            }));

            const hasCompletedQuiz = userDataFromDB?.quizStats?.lastQuizDate;
            const hasCompletedPhaseOne = userDataFromDB?.quizStats?.phaseOneCompleted;

            if (hasCompletedQuiz) {
              navigate('/app/menu');
            } else if (hasCompletedPhaseOne) {
              navigate('/app/menu');
            } else {
              setCurrentStep('quizPhaseOne');
            }
          } else {
            setCurrentStep('avatar');
          }
        } else {
          setCurrentStep('profile');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        setCurrentStep('profile');
      }
    } else {
      console.log('🔐 App - User logged out, redirecting to auth');
      setIsUserAuthenticated(false);
      setCurrentStep('auth');
      setUserId(null);
      // Não navegar para '/', pois o AuthForm deve aparecer na rota atual quando currentStep === 'auth'
    }
  });

  return unsubscribe;
}, []);

  const handleAuthComplete = (userId: string) => {
    setUserId(userId);
    setCurrentStep('profile');
  };

  const handleProfileComplete = (profileData: { name: string; age: number }) => {
    setUserData((prev) => ({ ...prev, ...profileData }));
    setCurrentStep('avatar');
  };

  const handleAvatarComplete = (avatar: string) => {
    setUserData({ ...userData, avatar });
    setCurrentStep('quizPhaseOne');
  };

  const handlePhaseOneComplete = (score: number, total: number) => {
    setScore(score);
    setTotalQuestions(total);
    setCurrentStep('resultPhaseOne');
  };

  const handlePhaseTwoComplete = (totalScore: number, phaseTwoScore: number, phaseTwoQuestions: number) => {
    // totalScore is the accumulated score (Phase 1 + Phase 2)
    // phaseTwoScore is only the Phase 2 score (0-12)
    // phaseTwoQuestions is the number of Phase 2 questions (12)
    setTotalAccumulatedScore(totalScore);
    setPhaseTwoScore(phaseTwoScore);
    setTotalQuestions(phaseTwoQuestions); // This will be 12
    setCurrentStep('resultPhaseTwo');
  };

  const handleQuizComplete = (finalScore: number, total: number = 15) => {
    setScore(finalScore);
    setTotalQuestions(total);
    setCurrentStep('result');
  };

  const handleResultContinue = () => {
    navigateTo('menu');
  };

  const handleRestart = async () => {
    await signOut(auth);
    setCurrentStep('auth');
    setUserData({ name: '', age: 0, avatar: '', email: '' });
    setScore(0);
    setUserId(null);
  };


const navigateTo = (step: GameStep, options?: { force?: boolean }) => {
  const forceNavigation = options?.force || false;

  // Bloquear tentativa de navegar para quiz se já foi respondido
  if (step === 'quiz' && !forceNavigation) { 
    // Verificar se o usuário já respondeu o quiz
    const userDocRef = doc(db, 'users', userId || '');
    getDoc(userDocRef).then((userDoc) => {
      const hasCompletedQuiz = userDoc.data()?.quizStats?.lastQuizDate;
      if (hasCompletedQuiz) {
        console.warn('Usuário já respondeu o quiz. Acesso bloqueado.');
        return; // Bloqueia o acesso
      } else {
        setCurrentStep(step);
      }
    }).catch((error) => {
      console.error('Erro ao verificar quiz:', error);
      setCurrentStep(step);
    });
  } else {
    setCurrentStep(step);
    if (['menu', 'community', 'library', 'locals', 'stories', 'support', 'quizPhaseTwo'].includes(step)) {
      navigate(`/app/${step}`);
    }
  }
};

  // Keep the existing app UI as the root element for the default route
  const appMain = (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {currentStep === 'auth' && (
          <AuthForm onAuthComplete={handleAuthComplete} />
        )}
        {currentStep === 'profile' && userId && (
          <ProfileForm userId={userId} userEmail={userData.email || ''} onComplete={handleProfileComplete} />
        )}
        {currentStep === 'avatar' && (
          <AvatarSelection userName={userData.name} onComplete={handleAvatarComplete} />
        )}
        {currentStep === 'quizPhaseOne' && userId && (
          <QuizGamePhaseOne 
            userId={userId}
            userData={userData} 
            onComplete={handlePhaseOneComplete} 
          />
        )}
        {currentStep === 'quizPhaseTwo' && userId && (
          <QuizGamePhaseTwo 
            userId={userId}
            userData={userData} 
            onComplete={handlePhaseTwoComplete}
            onExit={() => navigateTo('menu')}
          />
        )}
        {currentStep === 'quiz' && userId && ( // Adicionada verificação '&& userId', aumentar segurança.
          <QuizGame 
            userId={userId}
            userData={userData} 
            onComplete={handleQuizComplete} 
          />
        )}
        {currentStep === 'resultPhaseOne' && (
          <ResultScreen 
            userData={userData} 
            score={score} 
            totalQuestions={totalQuestions}
            onRestart={handleRestart}
            onContinue={handleResultContinue}
          />
        )}
        {currentStep === 'result' && (
          <ResultScreen 
            userData={userData} 
            score={score} 
            totalQuestions={totalQuestions}
            onRestart={handleRestart}
            onContinue={handleResultContinue}
          />
        )}
        {currentStep === 'resultPhaseTwo' && (
          <ResultScreenPhaseTwo 
            userData={userData} 
            phaseTwoScore={phaseTwoScore} 
            totalPhaseTwoQuestions={totalQuestions}
            totalAccumulatedScore={totalAccumulatedScore}
            onContinue={handleResultContinue}
          />
        )}
        {currentStep === 'menu' && (
          <MainMenu userData={userData} onNavigate={navigateTo} />
        )}
        {currentStep === 'community' && (
          <Community userData={userData} onBack={() => navigateTo('menu')} />
        )}
        {currentStep === 'library' && (
          <Library userData={userData} onBack={() => navigateTo('menu')} />
        )}
        {currentStep === 'locals' && (
          <LocalsPE userData={userData} onBack={() => navigateTo('menu')} />
        )}
        {currentStep === 'stories' && (
          <Stories userData={userData} onBack={() => navigateTo('menu')} />
        )}
        {currentStep === 'support' && (
          <Support userData={userData} onBack={() => navigateTo('menu')} />
        )}
      </div>
    </div>
  )

  return (
    <>
      <ScrollToTopButton />
      <Routes>
        <Route path="/" element={<Landpage />} />
        <Route path="/app/*" element={appMain} />
        <Route
          path="/home-female"
          element={React.createElement(HomeFemale as any, { onDone: (data: { avatar?: string }) => { 
            if (data?.avatar) {
              setUserData(prev => ({ ...prev, avatar: data.avatar as string }));
            }
            // Redireciona para /app após salvar o personagem
            window.location.href = '/app';
          } })}
        />
        <Route
          path="/Female"
          element={React.createElement(HomeFemale as any, { onDone: (data: { avatar?: string }) => { 
            if (data?.avatar) {
              setUserData(prev => ({ ...prev, avatar: data.avatar as string }));
            }
            window.location.href = '/app';
          } })}
        />
        <Route
          path="/home-male"
          element={React.createElement(HomeMale as any, { onDone: (data: { avatar?: string }) => { 
            if (data?.avatar) {
              setUserData(prev => ({ ...prev, avatar: data.avatar as string }));
            }
            window.location.href = '/app';
          } })}
        />
        <Route
          path="/Male"
          element={React.createElement(HomeMale as any, { onDone: (data: { avatar?: string }) => { 
            if (data?.avatar) {
              setUserData(prev => ({ ...prev, avatar: data.avatar as string }));
            }
            window.location.href = '/app';
          } })}
        />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
