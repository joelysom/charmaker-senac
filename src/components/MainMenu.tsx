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
  LogOut
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserData, GameStep } from '../App';
import Avatar3D from './Avatar3D';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
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

  // Load character data from Firestore
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
      } catch (e) {
        console.error('Erro ao carregar personagem:', e);
      } finally {
        setLoadingCharacter(false);
      }
    }
    loadCharacter();
  }, []);

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
              <Button variant="ghost" onClick={() => onNavigate('profile')}>Perfil</Button>
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
          className="p-6 cursor-pointer transition-all duration-300 hover:shadow-xl bg-gradient-to-r from-gray-900 to-gray-800 text-amber-400 group"
          onClick={() => onNavigate('quiz', {force:true})}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-400/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <h3 className="mb-1">Fazer Quiz Novamente</h3>
                <p className="text-amber-400/90 text-sm">
                  Aprimore seus conhecimentos sobre consciência racial
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}