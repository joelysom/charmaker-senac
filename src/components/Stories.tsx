import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserData } from '../App';

type StoriesProps = {
  userData: UserData;
  onBack: () => void;
};

type Story = {
  id: number;
  name: string;
  title: string;
  period: string;
  area: string;
  summary: string;
  fullStory: string;
  achievements: string[];
  quote: string;
};

const stories: Story[] = [
  {
    id: 1,
    name: 'Dandara dos Palmares',
    title: 'Guerreira do Quilombo dos Palmares',
    period: 'Século XVII (? - 1694)',
    area: 'Resistência e Liderança',
    summary: 'Guerreira negra que lutou bravamente pela liberdade no Quilombo dos Palmares ao lado de Zumbi.',
    fullStory: 'Dandara foi uma das lideranças femininas mais importantes do Quilombo dos Palmares, o maior quilombo das Américas. Exímia capoeirista e estrategista militar, ela participou ativamente das batalhas contra as investidas coloniais portuguesas. Dandara defendia que a liberdade conquistada deveria ser mantida com luta e resistência ativa, opondo-se a acordos de paz que pudessem comprometer a autonomia do quilombo. Sua coragem e determinação inspiram até hoje a luta das mulheres negras brasileiras.',
    achievements: [
      'Liderança militar no Quilombo dos Palmares',
      'Defensora da liberdade e autonomia quilombola',
      'Símbolo da resistência feminina negra',
      'Estrategista das batalhas contra invasores'
    ],
    quote: 'Prefiro morrer livre do que viver escrava.'
  },
  {
    id: 2,
    name: 'Machado de Assis',
    title: 'Fundador da Academia Brasileira de Letras',
    period: '1839 - 1908',
    area: 'Literatura',
    summary: 'Maior escritor brasileiro, fundador e primeiro presidente da Academia Brasileira de Letras.',
    fullStory: 'Joaquim Maria Machado de Assis nasceu no Rio de Janeiro, filho de um pintor de paredes negro e uma lavadeira açoriana. Apesar das origens humildes e da pouca escolaridade formal, tornou-se o maior escritor da literatura brasileira. Autodidata, trabalhou como tipógrafo, revisor e jornalista antes de se dedicar à literatura. Escreveu romances imortais como "Dom Casmurro", "Memórias Póstumas de Brás Cubas" e "Quincas Borba". Foi o fundador e primeiro presidente da Academia Brasileira de Letras, quebrando barreiras raciais numa sociedade extremamente hierarquizada.',
    achievements: [
      'Fundador da Academia Brasileira de Letras (1897)',
      'Autor de obras-primas da literatura universal',
      'Pioneiro do Realismo no Brasil',
      'Reconhecimento internacional de sua obra'
    ],
    quote: 'A vida é uma ópera e uma grande ópera. O tenor e o barítono lutam pelo soprano, em presença do baixo e dos comprimários, quando não são o soprano e o contralto que lutam pelo tenor.'
  },
  {
    id: 3,
    name: 'Carolina Maria de Jesus',
    title: 'Escritora e Ativista Social',
    period: '1914 - 1977',
    area: 'Literatura e Ativismo',
    summary: 'Catadora de papel que se tornou escritora best-seller, revelando a realidade da favela brasileira.',
    fullStory: 'Carolina Maria de Jesus nasceu em Minas Gerais e mudou-se para São Paulo, onde viveu na favela do Canindé trabalhando como catadora de papel. Com apenas dois anos de escolaridade, escrevia diários sobre sua vida na favela em cadernos que encontrava no lixo. Descoberta pelo jornalista Audálio Dantas, publicou "Quarto de Despejo" em 1960, que se tornou um fenômeno editorial, sendo traduzido para 13 idiomas. Sua obra deu voz aos invisibilizados e continua sendo fundamental para compreender a desigualdade social brasileira.',
    achievements: [
      'Best-seller internacional com "Quarto de Despejo"',
      'Primeira escritora negra favelada a ter reconhecimento literário',
      'Obra traduzida para mais de 13 idiomas',
      'Símbolo da resistência e superação'
    ],
    quote: 'Quem inventou a fome são os que comem.'
  },
  {
    id: 4,
    name: 'Milton Santos',
    title: 'Geógrafo e Intelectual',
    period: '1926 - 2001',
    area: 'Geografia e Ciências Sociais',
    summary: 'Maior geógrafo brasileiro, revolucionou o pensamento geográfico mundial.',
    fullStory: 'Milton Santos nasceu na Bahia e tornou-se o geógrafo mais influente do Brasil e um dos mais importantes do mundo. Doutor em Geografia, foi perseguido pela ditadura militar e exilado, lecionando em diversas universidades pelo mundo. Desenvolveu teorias inovadoras sobre espaço geográfico, globalização e território. Foi o único brasileiro a receber o Prêmio Vautrin Lud, considerado o Nobel da Geografia. Sua obra transcende a geografia, abordando questões sociais, raciais e de cidadania.',
    achievements: [
      'Prêmio Vautrin Lud (1994) - Nobel da Geografia',
      'Mais de 40 livros publicados',
      'Professor titular da USP',
      'Reconhecimento internacional como pensador social'
    ],
    quote: 'Há cidadãos de classes diversas, há os que são mais cidadãos, os que são menos cidadãos e os que nem mesmo ainda o são.'
  },
  {
    id: 5,
    name: 'Lélia Gonzalez',
    title: 'Filósofa e Ativista',
    period: '1935 - 1994',
    area: 'Filosofia e Feminismo Negro',
    summary: 'Intelectual pioneira do feminismo negro e dos estudos sobre racismo no Brasil.',
    fullStory: 'Lélia Gonzalez foi uma das principais intelectuais brasileiras do século XX. Filósofa, antropóloga e professora, dedicou sua vida a combater o racismo e o sexismo. Foi uma das fundadoras do Movimento Negro Unificado (MNU) em 1978 e co-fundadora do Instituto de Pesquisas das Culturas Negras (IPCN). Desenvolveu conceitos fundamentais para entender a interseccionalidade entre raça, gênero e classe no Brasil. Sua obra é referência internacional nos estudos sobre feminismo negro e relações raciais.',
    achievements: [
      'Fundadora do Movimento Negro Unificado',
      'Pioneira do feminismo negro no Brasil',
      'Professora e pesquisadora renomada',
      'Influência internacional nos estudos de raça e gênero'
    ],
    quote: 'A gente não nasce negro, a gente se torna negro. É uma conquista dura, cruel e que se desenvolve pela vida da gente afora.'
  },
  {
    id: 6,
    name: 'Luiz Gama',
    title: 'Abolicionista e Jurista',
    period: '1830 - 1882',
    area: 'Direito e Abolicionismo',
    summary: 'Ex-escravizado que se tornou advogado e libertou mais de 500 pessoas da escravidão.',
    fullStory: 'Luiz Gama nasceu livre, mas foi vendido ilegalmente como escravo pelo próprio pai aos 10 anos. Autodidata, aprendeu a ler e escrever e conquistou sua liberdade aos 18 anos. Tornou-se escrivão, jornalista e, mesmo sem diploma formal, atuou como advogado provisionado, especializando-se em causas de liberdade. Utilizou a lei de 1831 que proibia o tráfico de escravos para libertar centenas de pessoas escravizadas ilegalmente. Foi poeta, intelectual e um dos maiores abolicionistas brasileiros, sendo chamado de "Apóstolo Negro da Liberdade".',
    achievements: [
      'Libertou mais de 500 pessoas escravizadas',
      'Advogado provisionado sem diploma formal',
      'Poeta e jornalista influente',
      'Símbolo da luta abolicionista no Brasil'
    ],
    quote: 'Não há mais desgraçados, não há mais miseráveis: acabaram-se as distinções, já não há senhores nem escravos; os homens recobraram os seus direitos.'
  },
  {
    id: 7,
    name: 'Grande Otelo',
    title: 'Ator e Comediante',
    period: '1915 - 1993',
    area: 'Cinema e Teatro',
    summary: 'Um dos maiores atores brasileiros, quebrou barreiras raciais no cinema nacional.',
    fullStory: 'Sebastião Bernardes de Souza Prata, conhecido como Grande Otelo, foi um dos mais importantes atores do cinema, teatro e televisão brasileiros. Iniciou sua carreira ainda criança e tornou-se reconhecido internacionalmente. Atuou em mais de 100 filmes, incluindo clássicos como "Macunaíma". Apesar do talento extraordinário, enfrentou discriminação racial constante na indústria cinematográfica, frequentemente escalado para papéis estereotipados. Sua luta pela valorização do artista negro abriu portas para as gerações seguintes.',
    achievements: [
      'Mais de 100 filmes realizados',
      'Reconhecimento internacional',
      'Pioneiro negro no cinema brasileiro',
      'Ícone da cultura popular brasileira'
    ],
    quote: 'O que eu sempre quis foi ser tratado como gente, como artista, não como um negro fazendo papel de negro.'
  },
  {
    id: 8,
    name: 'Conceição Evaristo',
    title: 'Escritora Contemporânea',
    period: '1946 - Presente',
    area: 'Literatura',
    summary: 'Uma das mais importantes escritoras brasileiras contemporâneas, criadora do conceito de "escrevivência".',
    fullStory: 'Conceição Evaristo nasceu em uma favela em Belo Horizonte e trabalhou como empregada doméstica para custear seus estudos. Doutora em Literatura Comparada, é autora de romances, contos e poesias que abordam questões raciais, de gênero e classe. Criou o conceito de "escrevivência", escrita que nasce das vivências de mulheres negras. Suas obras como "Ponciá Vicêncio" e "Olhos D\'água" são referências da literatura afro-brasileira contemporânea. É cotada para a Academia Brasileira de Letras e tem reconhecimento internacional.',
    achievements: [
      'Doutora em Literatura Comparada',
      'Criadora do conceito de "escrevivência"',
      'Obras traduzidas para vários idiomas',
      'Referência da literatura afro-brasileira contemporânea'
    ],
    quote: 'Escrever é uma maneira de sangrar.'
  }
];

export function Stories({ userData, onBack }: StoriesProps) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenStory = (story: Story) => {
    setSelectedStory(story);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-purple-800">Histórias de Resistência</h1>
            <p className="text-gray-600">Conheça pessoas negras que transformaram a história</p>
          </div>
        </div>

        {/* Intro */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-purple-800 mb-2">Inspiração e Resistência</h3>
              <p className="text-gray-700">
                Estas são histórias de pessoas negras que, apesar de todas as barreiras do racismo 
                estrutural, conquistaram posições de destaque e transformaram a sociedade. 
                Suas lutas e conquistas inspiram novas gerações a continuar resistindo e construindo 
                um futuro mais justo e igualitário.
              </p>
            </div>
          </div>
        </Card>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full hover:shadow-xl transition-shadow cursor-pointer group">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <Badge className="mb-3">{story.area}</Badge>
                    <h3 className="text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                      {story.name}
                    </h3>
                    <p className="text-purple-600 mb-2">
                      {story.title}
                    </p>
                    <p className="text-gray-500 text-sm mb-3">{story.period}</p>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 flex-grow">
                    {story.summary}
                  </p>

                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-purple-600 group-hover:text-white transition-colors"
                    onClick={() => handleOpenStory(story)}
                  >
                    Ler História Completa
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Story Modal */}
      {isDialogOpen && selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 z-40"
            onClick={() => setIsDialogOpen(false)}
            style={{
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)'
            }}
          />
          <div className="relative z-50 w-full h-full bg-white overflow-y-auto">
            {/* Header com botão de fechar */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm">
              <div className="flex-1">
                <h1 className="text-purple-800 text-xl font-bold">
                  {selectedStory.name}
                </h1>
                <p className="text-gray-600 text-sm">
                  {selectedStory.title} • {selectedStory.period}
                </p>
              </div>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4"
                aria-label="Fechar"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo */}
            <div className="px-4 py-6 space-y-6">
              {/* Badge da área */}
              <div className="flex justify-center">
                <Badge className="text-sm px-3 py-1">{selectedStory.area}</Badge>
              </div>

              {/* História completa */}
              <div>
                <h2 className="text-gray-800 text-lg font-semibold mb-3">História</h2>
                <p className="text-gray-700 leading-relaxed text-base">
                  {selectedStory.fullStory}
                </p>
              </div>

              {/* Conquistas */}
              <div>
                <h2 className="text-gray-800 text-lg font-semibold mb-3">Principais Conquistas</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {selectedStory.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700">
                        <span className="text-purple-600 mt-1 flex-shrink-0">✓</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Citação */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-l-4 border-purple-600">
                <div className="flex items-start gap-3">
                  <span className="text-3xl text-purple-600">"</span>
                  <div className="flex-1">
                    <p className="text-gray-700 italic text-base leading-relaxed">
                      {selectedStory.quote}
                    </p>
                    <p className="text-purple-600 mt-3 font-medium">
                      — {selectedStory.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reflexão */}
              <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-xl">
                <h2 className="text-amber-800 text-lg font-semibold mb-3">Reflexão</h2>
                <p className="text-gray-700 text-base leading-relaxed">
                  A história de {selectedStory.name} nos mostra que, mesmo diante das maiores
                  adversidades, a resistência, o conhecimento e a determinação podem transformar
                  não apenas vidas individuais, mas toda a sociedade. Cada conquista representa
                  uma porta aberta para as próximas gerações.
                </p>
              </div>

              {/* Botão de fechar no final */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  Fechar História
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}