import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  Users, 
  BookOpen, 
  MapPin, 
  Sparkles, 
  Heart,
  Trophy,
  ArrowRight,
  LogOut,
  Bell,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserData, GameStep } from '../App';
import Avatar3D from './Avatar3D';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

type MainMenuProps = {
  userData: UserData;
  onNavigate: (step: GameStep, options?: {force ?: boolean}) => void;
};

type MenuOption = {
  id: GameStep;
  title: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
};

const menuOptions: MenuOption[] = [
  {
    id: 'community',
    title: 'Comunidade',
    description: 'Conecte-se, compartilhe experiências e aprenda com outras pessoas',
    icon: Users,
    color: 'text-gray-900',
    gradient: 'from-amber-400 to-yellow-500'
  },
  {
    id: 'library',
    title: 'Biblioteca Cultural',
    description: 'Descubra músicas, livros, filmes e artistas negros incríveis',
    icon: BookOpen,
    color: 'text-gray-900',
    gradient: 'from-yellow-400 to-amber-500'
  },
  {
    id: 'locals',
    title: 'Locais em PE',
    description: 'Encontre espaços e atividades culturais em Pernambuco',
    icon: MapPin,
    color: 'text-gray-900',
    gradient: 'from-amber-300 to-orange-400'
  },
  {
    id: 'stories',
    title: 'Histórias de Resistência',
    description: 'Conheça pessoas negras que transformaram a história',
    icon: Sparkles,
    color: 'text-gray-900',
    gradient: 'from-yellow-300 to-amber-400'
  },
  {
    id: 'support',
    title: 'Centro de Apoio',
    description: 'Encontre ajuda, acolhimento e recursos para quem precisa',
    icon: Heart,
    color: 'text-gray-900',
    gradient: 'from-orange-400 to-red-500'
  }
];

export function MainMenu({ userData, onNavigate }: MainMenuProps) {
  const [character, setCharacter] = useState<any>(null);
  const [loadingCharacter, setLoadingCharacter] = useState(true);
  const [phaseTwoProgress, setPhaseTwoProgress] = useState<number>(0);
  const [phaseTwoCompleted, setPhaseTwoCompleted] = useState<boolean>(false);
  const [totalCorrect, setTotalCorrect] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(15);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Load character data and notifications from Firestore
  useEffect(() => {
    const loadCharacter = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoadingCharacter(false);
          return;
        }
        const charDoc = await getDoc(doc(db, 'characters', user.uid));
        if (charDoc.exists()) {
          setCharacter(charDoc.data());
        }

        // Load phase two progress and quiz stats
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const isPhase2Completed = userData?.quizStats?.phaseTwoCompleted || false;
          setPhaseTwoCompleted(isPhase2Completed);
          
          // Get total correct answers and total questions
          const quizStats = userData?.quizStats;
          if (quizStats) {
            setTotalCorrect(quizStats.correct || 0);
            setTotalQuestions(quizStats.total || 15);
          }
          
          if (!isPhase2Completed) {
            // Check for saved progress
            const progressRef = doc(db, 'users', user.uid, 'quizProgress', 'phase2');
            const progressDoc = await getDoc(progressRef);
            
            if (progressDoc.exists() && !progressDoc.data().deleted) {
              const savedProgress = progressDoc.data();
              setPhaseTwoProgress(savedProgress.answers?.length || 0);
            } else {
              setPhaseTwoProgress(0);
            }
          } else {
            setPhaseTwoProgress(12); // All questions completed
          }
        }

        // Load notifications
        await loadNotifications();
      } catch (e) {
        console.error('Erro ao carregar personagem:', e);
      } finally {
        setLoadingCharacter(false);
      }
    }
    loadCharacter();
  }, []);

  const loadNotifications = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const notificationsSnapshot = await getDocs(notificationsQuery);
      const notificationsData = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setNotifications(notificationsData);
      const unread = notificationsData.filter((n: any) => !n.read).length;
      setUnreadCount(unread);
    } catch (e) {
      console.error('Erro ao carregar notificações:', e);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Erro ao marcar notificação como lida:', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n =>
          updateDoc(doc(db, 'notifications', n.id), { read: true })
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Erro ao marcar todas como lidas:', e);
    }
  };

  const formatNotificationTime = (timestamp: any) => {
    if (!timestamp) return 'agora';
    const date = timestamp.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onNavigate('auth');
    } catch (e) {
      console.error('Erro ao deslogar:', e);
    }
  };

  return (
    <div className="py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-lg border-2 border-amber-200 justify-between w-full max-w-4xl">
            <div className="flex items-center gap-4">
              {!loadingCharacter && character ? (
                <Avatar3D
                  gender={character.gender}
                  bodyType={character.bodyType}
                  skinColor={character.skinColor}
                  faceOption={character.faceOption}
                  hairId={character.hairId}
                  size={64}
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-3xl">{userData.avatar}</span>
                </div>
              )}
              <div className="text-left">
                <p className="text-gray-600 text-sm">Bem-vindo(a),</p>
                <h2 className="text-gray-800">{userData.name}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </div>

              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
        
        <h1 className="text-gray-900 mb-3">
          Raízes - Plataforma de Consciência Negra
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore recursos, conecte-se com a comunidade e continue sua jornada de aprendizado
        </p>

        {/* Notifications Modal */}
        {showNotifications && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
            <div
              className="absolute inset-0 bg-black/40 z-40"
              onClick={() => setShowNotifications(false)}
              style={{
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)'
              }}
            />
            <Card className="z-50 w-full max-w-md max-h-[600px] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notificações</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      Marcar todas como lidas
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowNotifications(false)}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-500">
                    <Bell className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm">Nenhuma notificação ainda</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-purple-50' : ''
                        }`}
                        onClick={() => {
                          markAsRead(notification.id);
                          setShowNotifications(false);
                          onNavigate('community');
                        }}
                      >
                        <div className="flex gap-3">
                          {notification.senderCharacter ? (
                            <Avatar3D
                              gender={notification.senderCharacter.gender}
                              bodyType={notification.senderCharacter.bodyType}
                              skinColor={notification.senderCharacter.skinColor}
                              faceOption={notification.senderCharacter.faceOption}
                              hairId={notification.senderCharacter.hairId}
                              size={40}
                              bgGradient="linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6d28d9 100%)"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">{notification.senderAvatar || '👤'}</span>
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                              <span className="font-semibold">{notification.senderName}</span>
                              {' '}
                              {notification.type === 'reply' && 'respondeu seu comentário'}
                              {notification.type === 'mention' && 'mencionou você'}
                              {notification.type === 'comment' && 'comentou no seu post'}
                            </p>
                            {notification.content && (
                              <p className="text-sm text-gray-600 truncate mt-1">
                                {notification.content}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {formatNotificationTime(notification.createdAt)}
                            </p>
                          </div>
                          
                          {!notification.read && (
                            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </motion.div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {menuOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group h-full"
                onClick={() => onNavigate(option.id)}
              >
                <div className="flex flex-col h-full">
                  <div className={`w-14 h-14 bg-gradient-to-br ${option.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-gray-900" />
                  </div>
                  
                  <h3 className="text-gray-800 mb-2">
                    {option.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 flex-grow">
                    {option.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-gray-900 group-hover:gap-3 transition-all">
                    <span className="text-sm">Explorar</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quiz Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="max-w-6xl mx-auto mt-8"
      >
        <Card
          className={`p-6 transition-all duration-300 bg-gradient-to-r from-gray-900 to-gray-800 text-amber-400 ${
            phaseTwoCompleted 
              ? 'cursor-default shadow-lg' 
              : 'cursor-pointer hover:shadow-xl group'
          }`}
          onClick={() => !phaseTwoCompleted ? onNavigate('quizPhaseTwo') : undefined}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 bg-amber-400/20 rounded-xl flex items-center justify-center ${
                !phaseTwoCompleted ? 'group-hover:scale-110' : ''
              } transition-transform`}>
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold">
                  {phaseTwoCompleted 
                    ? 'Parabéns! Quiz Completo! 🎉' 
                    : 'Continuar Aprendizado'
                  }
                </h3>
                <p className="text-amber-400/90 text-sm">
                  {phaseTwoCompleted 
                    ? `Você acertou ${totalCorrect}/${totalQuestions} perguntas! Sua pontuação foi: ${Math.round((totalCorrect / totalQuestions) * 100)}%`
                    : `Complete as 12 questões restantes (${phaseTwoProgress}/12)`
                  }
                </p>
              </div>
            </div>
            {!phaseTwoCompleted && (
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}