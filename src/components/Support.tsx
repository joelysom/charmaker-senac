import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Heart, 
  Phone,
  Mail,
  MessageCircle,
  AlertCircle,
  Shield,
  Users,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserData } from '../App';

type SupportProps = {
  userData: UserData;
  onBack: () => void;
};

type SupportResource = {
  id: number;
  name: string;
  category: string;
  description: string;
  services: string[];
  phone?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  hours?: string;
  website?: string;
  urgent?: boolean;
};

const resources: SupportResource[] = [
  {
    id: 1,
    name: 'Centro de Valorização da Vida (CVV)',
    category: 'Apoio Emocional',
    description: 'Apoio emocional e prevenção do suicídio. Atendimento gratuito e sigiloso 24 horas.',
    services: ['Apoio emocional', 'Escuta ativa', 'Prevenção ao suicídio'],
    phone: '188',
    email: 'atendimento@cvv.org.br',
    website: 'www.cvv.org.br',
    hours: '24 horas, todos os dias',
    urgent: true
  },
  {
    id: 2,
    name: 'Disque 100 - Direitos Humanos',
    category: 'Denúncia',
    description: 'Canal para denunciar violações de direitos humanos, incluindo racismo e discriminação.',
    services: ['Denúncias de racismo', 'Violações de direitos', 'Orientação jurídica'],
    phone: '100',
    hours: '24 horas, todos os dias',
    urgent: true
  },
  {
    id: 3,
    name: 'CEERT - Centro de Estudos das Relações de Trabalho e Desigualdades',
    category: 'Orientação Jurídica',
    description: 'Organização que combate discriminação racial e promove equidade no trabalho.',
    services: ['Orientação jurídica', 'Combate ao racismo', 'Educação'],
    phone: '(11) 3815-4000',
    email: 'ceert@ceert.org.br',
    website: 'www.ceert.org.br',
    address: 'São Paulo - SP'
  },
  {
    id: 4,
    name: 'Instituto Luiz Gama',
    category: 'Assistência Jurídica',
    description: 'Advocacia racial e combate ao racismo institucional.',
    services: ['Assistência jurídica gratuita', 'Defesa de vítimas de racismo', 'Educação antirracista'],
    email: 'contato@institutoluizgama.org.br',
    website: 'www.institutoluizgama.org.br',
    address: 'São Paulo - SP'
  },
  {
    id: 5,
    name: 'CAPS - Centro de Atenção Psicossocial',
    category: 'Saúde Mental',
    description: 'Atendimento público de saúde mental. Procure a unidade mais próxima.',
    services: ['Atendimento psicológico', 'Atendimento psiquiátrico', 'Grupos terapêuticos'],
    phone: '136 (Disque Saúde)',
    hours: 'Varia por unidade'
  },
  {
    id: 6,
    name: 'Educafro',
    category: 'Educação e Apoio',
    description: 'Rede que promove inclusão de negros e pobres nas universidades.',
    services: ['Cursos pré-vestibular', 'Orientação educacional', 'Apoio para cotas'],
    phone: '(21) 3882-5984',
    email: 'contato@educafro.org.br',
    website: 'www.educafro.org.br'
  },
  {
    id: 7,
    name: 'Geledés - Instituto da Mulher Negra',
    category: 'Apoio à Mulher Negra',
    description: 'Organização política de mulheres negras que atua contra racismo e sexismo.',
    services: ['Assistência jurídica', 'Apoio psicológico', 'Orientação'],
    phone: '(11) 3207-7015',
    email: 'geledes@geledes.org.br',
    website: 'www.geledes.org.br',
    address: 'São Paulo - SP'
  },
  {
    id: 8,
    name: 'Defensoria Pública - Núcleo de Combate à Discriminação',
    category: 'Assistência Jurídica',
    description: 'Atendimento jurídico gratuito para vítimas de discriminação racial.',
    services: ['Assistência jurídica gratuita', 'Acompanhamento de casos', 'Denúncias'],
    phone: '(81) 3181-5810 (PE)',
    address: 'Defensoria Pública do Estado',
    hours: 'Segunda a sexta, horário comercial'
  },
  {
    id: 9,
    name: 'Movimento Negro Unificado (MNU)',
    category: 'Apoio Comunitário',
    description: 'Organização que luta pelos direitos da população negra no Brasil.',
    services: ['Apoio comunitário', 'Orientação', 'Articulação política'],
    email: 'mnu@movimentonegrounificado.org.br',
    website: 'www.mnu.org.br'
  },
  {
    id: 10,
    name: 'Safernet Brasil',
    category: 'Crimes na Internet',
    description: 'Canal para denunciar crimes de ódio, racismo e discriminação na internet.',
    services: ['Denúncia de racismo online', 'Apoio psicológico', 'Orientação'],
    website: 'new.safernet.org.br',
    email: 'helpline@safernet.org.br'
  }
];

export function Support({ userData, onBack }: SupportProps) {
  const urgentResources = resources.filter(r => r.urgent);
  const otherResources = resources.filter(r => !r.urgent);

  const renderResource = (resource: SupportResource) => (
    <Card key={resource.id} className="p-6 hover:shadow-xl transition-shadow">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-gray-800 flex-grow pr-4">
              {resource.name}
            </h3>
            <Badge variant={resource.urgent ? 'destructive' : 'secondary'}>
              {resource.category}
            </Badge>
          </div>
          <p className="text-gray-600 text-sm mb-3">
            {resource.description}
          </p>
        </div>

        {/* Services */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Serviços:</p>
          <div className="flex flex-wrap gap-2">
            {resource.services.map((service, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {service}
              </Badge>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4 flex-grow">
          {resource.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <a href={`tel:${resource.phone}`} className="text-purple-600 hover:underline">
                {resource.phone}
              </a>
            </div>
          )}
          {resource.whatsapp && (
            <div className="flex items-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <a href={`https://wa.me/${resource.whatsapp}`} className="text-purple-600 hover:underline">
                WhatsApp
              </a>
            </div>
          )}
          {resource.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <a href={`mailto:${resource.email}`} className="text-purple-600 hover:underline break-all">
                {resource.email}
              </a>
            </div>
          )}
          {resource.hours && (
            <p className="text-sm text-gray-600">
              <strong>Horário:</strong> {resource.hours}
            </p>
          )}
          {resource.address && (
            <p className="text-sm text-gray-600">
              <strong>Local:</strong> {resource.address}
            </p>
          )}
        </div>

        {/* Website Button */}
        {resource.website && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open(`https://${resource.website}`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Visitar Site
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-purple-800">Centro de Apoio</h1>
          <p className="text-gray-600">Encontre ajuda, acolhimento e recursos</p>
        </div>
      </div>

      {/* Important Message */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-200">
        <div className="flex items-start gap-4">
          <Heart className="w-8 h-8 text-rose-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-rose-800 mb-2">Você Não Está Sozinho(a)</h3>
            <p className="text-gray-700 mb-3">
              Se você sofreu preconceito, discriminação racial, ou está passando por dificuldades 
              emocionais, saiba que existem pessoas e organizações prontas para ajudar. 
              Buscar apoio é um ato de coragem e cuidado consigo mesmo(a).
            </p>
            <p className="text-gray-700">
              <strong>Em caso de emergência, ligue 188 ou 190.</strong>
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 bg-purple-50">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-purple-800">Seus direitos</p>
              <p className="text-gray-600 text-sm">Racismo é crime inafiançável</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-blue-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-blue-800">Denuncie</p>
              <p className="text-gray-600 text-sm">Disque 100 - 24h gratuito</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-green-50">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-green-800">Comunidade</p>
              <p className="text-gray-600 text-sm">Apoio e acolhimento</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Urgent Resources */}
      {urgentResources.length > 0 && (
        <div className="mb-8">
          <h2 className="text-red-700 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Contatos de Emergência
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {urgentResources.map(resource => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {renderResource(resource)}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Other Resources */}
      <div>
        <h2 className="text-purple-800 mb-4">Organizações de Apoio</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {otherResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {renderResource(resource)}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Final Message */}
      <Card className="p-6 mt-8 bg-gradient-to-r from-purple-50 to-blue-50">
        <h3 className="text-purple-800 mb-3">Lembre-se</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">•</span>
            <span>Racismo é crime previsto na Constituição Federal (Lei 7.716/89)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">•</span>
            <span>Você tem direito a assistência jurídica gratuita através da Defensoria Pública</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">•</span>
            <span>Buscar apoio psicológico é fundamental para processar experiências de discriminação</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">•</span>
            <span>Sua saúde mental importa - não hesite em pedir ajuda</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
