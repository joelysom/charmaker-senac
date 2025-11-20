import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  Music, 
  BookOpen, 
  Film,
  Search,
  ExternalLink,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserData } from '../App';

type LibraryProps = {
  userData: UserData;
  onBack: () => void;
};

type LibraryItem = {
  id: number;
  title: string;
  creator: string;
  description: string;
  year?: string;
  genre: string;
  rating: number;
  link?: string;
};

const musicData: LibraryItem[] = [
  {
    id: 1,
    title: 'AmarElo',
    creator: 'Emicida',
    description: 'Álbum que celebra a negritude e aborda questões sociais e raciais no Brasil',
    year: '2019',
    genre: 'Rap/Hip-Hop',
    rating: 5,
    link: 'https://open.spotify.com/intl-pt/album/5cUY5chmS86cdonhoFdn8h'
  },
  {
    id: 2,
    title: 'Elza Canta e Dança',
    creator: 'Elza Soares',
    description: 'Obra icônica de uma das maiores vozes do Brasil',
    year: '1967',
    genre: 'MPB/Samba',
    rating: 5,
    link: 'https://open.spotify.com/intl-pt/artist/4cn4gMq0KXORHeYA45PcBi'
  },
  {
    id: 3,
    title: 'Negro Drama',
    creator: 'Racionais MC\'s',
    description: 'Música emblemática sobre a realidade da população negra periférica',
    year: '2002',
    genre: 'Rap',
    rating: 5,
    link: 'https://open.spotify.com/intl-pt/track/3ytXzEJFeVydFfmUhHvti8'
  },
  {
    id: 4,
    title: 'Bluesman',
    creator: 'Baco Exu do Blues',
    description: 'Álbum que mistura blues, rap e reflexões sobre negritude',
    year: '2018',
    genre: 'Rap/Blues',
    rating: 5,
    link: 'https://open.spotify.com/intl-pt/album/0QMVSKhzT4u2DEd8qdlz4I'
  },
  {
    id: 5,
    title: 'Sobrevivendo no Inferno',
    creator: 'Racionais MC\'s',
    description: 'Um dos álbuns mais importantes do rap brasileiro',
    year: '1997',
    genre: 'Rap',
    rating: 5,
    link: 'https://open.spotify.com/intl-pt/album/1UzrzuOmZfBgXyS3pgKD10'
  }
];

const booksData: LibraryItem[] = [
  {
    id: 1,
    title: 'Pequeno Manual Antirracista',
    creator: 'Djamila Ribeiro',
    description: 'Guia essencial para entender e combater o racismo estrutural',
    year: '2019',
    genre: 'Não-ficção',
    rating: 5,
    link: 'https://www.amazon.com.br/Pequeno-manual-antirracista-Djamila-Ribeiro/dp/8535932879'
  },
  {
    id: 2,
    title: 'Torto Arado',
    creator: 'Itamar Vieira Junior',
    description: 'Romance sobre duas irmãs negras e a luta pela terra',
    year: '2019',
    genre: 'Ficção',
    rating: 5,
    link: 'https://www.amazon.com.br/Torto-arado-Itamar-Vieira-Junior/dp/6580309318'
  },
  {
    id: 3,
    title: 'Quarto de Despejo',
    creator: 'Carolina Maria de Jesus',
    description: 'Diário de uma mulher negra na favela do Canindé',
    year: '1960',
    genre: 'Autobiografia',
    rating: 5,
    link: 'https://www.amazon.com.br/Quarto-Despejo-Diário-Uma-Favelada/dp/8508171277'
  },
  {
    id: 4,
    title: 'O Perigo de Uma História Única',
    creator: 'Chimamanda Ngozi Adichie',
    description: 'Reflexão sobre estereótipos e a importância de múltiplas narrativas',
    year: '2009',
    genre: 'Ensaio',
    rating: 5,
    link: 'https://a.co/d/8wIKXwc'
  },
  {
    id: 5,
    title: 'Memórias de uma Plantação',
    creator: 'Grada Kilomba',
    description: 'Episódios de racismo cotidiano e trauma colonial',
    year: '2008',
    genre: 'Não-ficção',
    rating: 5,
    link: 'https://a.co/d/eh1Ne4h'
  },
  {
    id: 6,
    title: 'Olhos D\'água',
    creator: 'Conceição Evaristo',
    description: 'Contos sobre mulheres negras e suas vivências',
    year: '2014',
    genre: 'Contos',
    rating: 5,
    link: 'https://a.co/d/c1zEkJZ'
  }
];

const moviesData: LibraryItem[] = [
  {
    id: 1,
    title: 'Pantera Negra',
    creator: 'Ryan Coogler',
    description: 'Celebração da cultura africana e representatividade negra',
    year: '2018',
    genre: 'Ação/Ficção',
    rating: 5,
    link: 'https://www.imdb.com/title/tt1825683/'
  },
  {
    id: 2,
    title: 'Quanto Vale ou É Por Quilo?',
    creator: 'Sérgio Bianchi',
    description: 'Paralelo entre escravidão e desigualdade social no Brasil',
    year: '2005',
    genre: 'Drama',
    rating: 5,
    link: 'https://www.imdb.com/pt/title/tt0458074'
  },
  {
    id: 3,
    title: 'Besouro',
    creator: 'João Daniel Tikhomiroff',
    description: 'Baseado na vida de um lendário lutador de capoeira baiano, "Besouro" conta a fantástica história de um jovem brasileiro de ascendência africana em busca da sua missão.',
    year: '2009',
    genre: 'Drama/Biográfico',
    rating: 4,
    link: 'https://www.imdb.com/pt/title/tt1322277'
  },
  {
    id: 4,
    title: 'Cidade de Deus',
    creator: 'Fernando Meirelles',
    description: 'Retrato da realidade de jovens negros na periferia',
    year: '2002',
    genre: 'Drama/Crime',
    rating: 5,
    link: 'https://www.imdb.com/pt/title/tt0317248/?ref_=nv_sr_srsg_0_tt_8_nm_0_in_0_q_Cidade%2520de%2520Deus'
  },
  {
    id: 5,
    title: 'Histórias Cruzadas',
    creator: 'Tate Taylor',
    description: 'Uma aspirante a escritora durante o movimento dos direitos civis nos anos 60 nos Estados Unidos decide escrever um livro sobre as experiências das criadas negras que trabalhavam para as famílias brancas.',
    year: '2011',
    genre: 'Drama',
    rating: 5,
    link: 'https://www.imdb.com/pt/title/tt1454029'
  }
];

export function Library({ userData, onBack }: LibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleItemClick = (link?: string) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderItems = (items: LibraryItem[]) => {
    const filtered = items.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.creator.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 h-full hover:shadow-xl transition-shadow group">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="secondary">{item.genre}</Badge>
                  <div className="flex gap-1">
                    {renderStars(item.rating)}
                  </div>
                </div>
                
                <h3 className="text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-purple-600 mb-2">
                  {item.creator}
                </p>
                
                {item.year && (
                  <p className="text-gray-500 text-sm mb-3">{item.year}</p>
                )}
                
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  {item.description}
                </p>
                
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-purple-600 group-hover:text-white transition-colors"
                  onClick={() => handleItemClick(item.link)}
                  disabled={!item.link}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {item.link ? 'Ver mais' : 'Em breve'}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-purple-800">Biblioteca Cultural</h1>
          <p className="text-gray-600">Descubra e celebre a cultura negra através da arte</p>
        </div>
      </div>

      {/* Search */}
      <Card className="p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Buscar por título, artista, autor ou diretor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="music" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
          <TabsTrigger value="music">
            <Music className="w-4 h-4 mr-2" />
            Música
          </TabsTrigger>
          <TabsTrigger value="books">
            <BookOpen className="w-4 h-4 mr-2" />
            Literatura
          </TabsTrigger>
          <TabsTrigger value="movies">
            <Film className="w-4 h-4 mr-2" />
            Cinema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="music" className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl">
            <h3 className="text-purple-800 mb-2">Música Negra Brasileira</h3>
            <p className="text-gray-600">
              Explore a riqueza da música produzida por artistas negros, do samba ao rap, 
              do blues à MPB, celebrando a diversidade e potência da nossa cultura.
            </p>
          </div>
          {renderItems(musicData)}
        </TabsContent>

        <TabsContent value="books" className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl">
            <h3 className="text-purple-800 mb-2">Literatura Negra</h3>
            <p className="text-gray-600">
              Conheça obras fundamentais de escritores e escritoras negras que transformam 
              narrativas, questionam estruturas e celebram a negritude.
            </p>
          </div>
          {renderItems(booksData)}
        </TabsContent>

        <TabsContent value="movies" className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl">
            <h3 className="text-purple-800 mb-2">Cinema e Representatividade</h3>
            <p className="text-gray-600">
              Filmes que abordam questões raciais, celebram a cultura negra e apresentam 
              narrativas potentes sobre resistência e identidade.
            </p>
          </div>
          {renderItems(moviesData)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
