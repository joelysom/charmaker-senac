import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Phone,
  Clock,
  Globe,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserData } from '../App';

type LocalsPEProps = {
  userData: UserData;
  onBack: () => void;
};

type Local = {
  id: number;
  name: string;
  category: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  phone?: string;
  hours?: string;
  website?: string;
  activities: string[];
};

const locals: Local[] = [
  {
    id: 1,
    name: 'Centro Cultural Africano e Afro-Brasileiro',
    category: 'Centro Cultural',
    description: 'Espaço dedicado à preservação e difusão da cultura africana e afro-brasileira, com exposições, oficinas e eventos culturais.',
    address: 'Rua da Aurora, 463',
    neighborhood: 'Boa Vista',
    city: 'Recife',
    phone: '(81) 3355-9700',
    hours: 'Ter a Sex: 8h-17h',
    activities: ['Exposições', 'Oficinas', 'Shows', 'Palestras']
  },
  {
    id: 2,
    name: 'Museu do Homem do Nordeste',
    category: 'Museu',
    description: 'Museu que aborda a formação da cultura nordestina, incluindo contribuições africanas e indígenas.',
    address: 'Av. 17 de Agosto, 2187',
    neighborhood: 'Casa Forte',
    city: 'Recife',
    phone: '(81) 3073-6340',
    hours: 'Ter a Sex: 8h30-17h | Sáb e Dom: 13h-17h',
    website: 'www.muhne.org.br',
    activities: ['Exposições', 'Visitas guiadas', 'Acervo histórico']
  },
  {
    id: 3,
    name: 'Terreiro Xambá',
    category: 'Terreiro',
    description: 'Importante terreiro de candomblé com mais de 120 anos, patrimônio cultural de Pernambuco.',
    address: 'Rua Severino Alves da Silva, s/n',
    neighborhood: 'Portão do Gelo',
    city: 'Olinda',
    phone: '(81) 3439-0557',
    activities: ['Cerimônias religiosas', 'Cultura afro-brasileira', 'Acolhimento']
  },
  {
    id: 4,
    name: 'Pátio de São Pedro',
    category: 'Espaço Cultural',
    description: 'Centro histórico com forte presença da cultura negra pernambucana, com apresentações de maracatu e frevo.',
    address: 'Pátio de São Pedro',
    neighborhood: 'São José',
    city: 'Recife',
    activities: ['Shows', 'Feiras culturais', 'Maracatu', 'Capoeira']
  },
  {
    id: 5,
    name: 'Casa da Cultura Afro-Brasileira',
    category: 'Casa de Cultura',
    description: 'Espaço de promoção da cultura afro-brasileira com atividades educativas e artísticas.',
    address: 'Rua Imperial, 234',
    neighborhood: 'São José',
    city: 'Recife',
    phone: '(81) 3224-3098',
    activities: ['Aulas de dança', 'Capoeira', 'Percussão', 'Teatro']
  },
  {
    id: 6,
    name: 'Quilombo do Catucá',
    category: 'Comunidade Quilombola',
    description: 'Comunidade quilombola que oferece visitas culturais e atividades de preservação da memória ancestral.',
    address: 'Zona Rural',
    neighborhood: 'Catucá',
    city: 'Paulista',
    activities: ['Turismo cultural', 'Gastronomia', 'Artesanato', 'Histórias']
  },
  {
    id: 7,
    name: 'Biblioteca Pública do Estado',
    category: 'Biblioteca',
    description: 'Possui acervo significativo sobre cultura afro-brasileira e realiza eventos temáticos.',
    address: 'Rua João Lira, s/n',
    neighborhood: 'Boa Vista',
    city: 'Recife',
    phone: '(81) 3183-3444',
    hours: 'Seg a Sex: 8h-18h',
    activities: ['Acervo literário', 'Eventos', 'Rodas de leitura']
  },
  {
    id: 8,
    name: 'Mercado Eufrásio Barbosa (Casa Amarela)',
    category: 'Espaço Cultural',
    description: 'Mercado público que sedia eventos culturais afro-brasileiros e indígenas.',
    address: 'Praça Prof. Barreto Campelo',
    neighborhood: 'Casa Amarela',
    city: 'Recife',
    activities: ['Feiras culturais', 'Gastronomia', 'Artesanato', 'Shows']
  },
  {
    id: 9,
    name: 'Instituto Cultural Steve Biko',
    category: 'ONG',
    description: 'Organização que promove educação e cultura afro-brasileira com cursos pré-vestibulares e atividades culturais.',
    address: 'Rua Real da Torre, 1671',
    neighborhood: 'Madalena',
    city: 'Recife',
    phone: '(81) 3034-5166',
    website: 'www.stevebiko.org.br',
    activities: ['Educação', 'Cursos', 'Eventos culturais', 'Formação']
  },
  {
    id: 10,
    name: 'Centro de Cultura Luiz Freire',
    category: 'Centro Cultural',
    description: 'Organização que trabalha com direitos humanos e cultura popular, incluindo projetos voltados para comunidades negras.',
    address: 'Rua 27 de Janeiro, 181',
    neighborhood: 'Varadouro',
    city: 'Olinda',
    phone: '(81) 3429-4109',
    website: 'www.cclf.org.br',
    activities: ['Oficinas', 'Formação', 'Cultura popular', 'Direitos humanos']
  }
];

export function LocalsPE({ userData, onBack }: LocalsPEProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(locals.map(l => l.category)))];

  const filteredLocals = selectedCategory === 'all' 
    ? locals 
    : locals.filter(l => l.category === selectedCategory);

  const openInMaps = (local: Local) => {
    const address = `${local.address}, ${local.neighborhood}, ${local.city}, Pernambuco, Brasil`;
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-purple-800">Locais em Pernambuco</h1>
          <p className="text-gray-600">Espaços culturais e de acolhimento para pessoas pretas, pardas e indígenas</p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-start gap-4">
          <MapPin className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-purple-800 mb-2">Conecte-se com Sua Cultura</h3>
            <p className="text-gray-700">
              Pernambuco é rico em espaços que celebram e preservam a cultura afro-brasileira e indígena. 
              Visite esses locais para aprender, participar e fortalecer nossa comunidade.
            </p>
          </div>
        </div>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-purple-600 hover:text-white transition-colors"
            onClick={() => setSelectedCategory(category)}
          >
            {category === 'all' ? 'Todos' : category}
          </Badge>
        ))}
      </div>

      {/* Locals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLocals.map((local, index) => (
          <motion.div
            key={local.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 h-full hover:shadow-xl transition-shadow">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-gray-800 flex-grow pr-4">
                      {local.name}
                    </h3>
                    <Badge>{local.category}</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    {local.description}
                  </p>
                </div>

                {/* Info */}
                <div className="space-y-3 mb-4 flex-grow">
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-700">{local.address}</p>
                      <p className="text-gray-500">{local.neighborhood} - {local.city}</p>
                    </div>
                  </div>

                  {local.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <p className="text-gray-700">{local.phone}</p>
                    </div>
                  )}

                  {local.hours && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <p className="text-gray-700">{local.hours}</p>
                    </div>
                  )}

                  {local.website && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <a 
                        href={local.website.startsWith('http') ? local.website : `https://${local.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        {local.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Activities */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Atividades:</p>
                  <div className="flex flex-wrap gap-2">
                    {local.activities.map((activity, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full" onClick={() => openInMaps(local)}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver no Mapa
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
