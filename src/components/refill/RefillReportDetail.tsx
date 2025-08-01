
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Droplets, 
  Calendar, 
  User, 
  DollarSign, 
  Truck, 
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react';
import { RefillReport, Site, User as UserType } from '../../types';

interface RefillReportDetailProps {
  report: RefillReport;
  site: Site;
  currentUser: UserType;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export default function RefillReportDetail({ 
  report, 
  site, 
  currentUser, 
  onEdit, 
  onDelete, 
  onBack 
}: RefillReportDetailProps) {
  const canEdit = currentUser.role === 'ADMIN' || 
                  (currentUser.role === 'SECTOR_MANAGER' && report.reportedById === currentUser.id);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'Non spécifié';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculateEfficiency = () => {
    if (!report.cost || !report.volumeRefilled) return null;
    return (report.cost / report.volumeRefilled).toFixed(3);
  };

  const calculateLevelIncrease = () => {
    if (report.previousLevel === null) return null;
    return (report.currentLevel - report.previousLevel).toFixed(1);
  };

  const calculateVolumePercentage = () => {
    return ((report.volumeRefilled / site.reservoirCapacity) * 100).toFixed(1);
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action est irréversible.')) {
      onDelete();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </button>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Droplets className="h-6 w-6 text-blue-600" />
              Rapport de Recharge
            </h1>
            <p className="text-gray-600 mt-1">
              {site.name} • {formatDate(report.refillDate)}
            </p>
          </div>
          
          {canEdit && (
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Détails de la recharge */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-600" />
              Détails de la Recharge
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Volume rechargé
                  </label>
                  <div className="text-2xl font-bold text-blue-600">
                    {report.volumeRefilled.toLocaleString()} L
                  </div>
                  <div className="text-sm text-gray-500">
                    {calculateVolumePercentage()}% de la capacité totale
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Niveau après recharge
                  </label>
                  <div className="text-xl font-semibold text-green-600">
                    {report.currentLevel}%
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Niveau précédent
                  </label>
                  <div className="text-xl font-semibold text-gray-700">
                    {report.previousLevel !== null ? `${report.previousLevel}%` : 'Non spécifié'}
                  </div>
                </div>
                
                {calculateLevelIncrease() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Augmentation du niveau
                    </label>
                    <div className="text-xl font-semibold text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      +{calculateLevelIncrease()}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informations financières et logistiques */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Informations Financières et Logistiques
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Coût total
                  </label>
                  <div className="text-xl font-semibold text-gray-900">
                    {formatCurrency(report.cost)}
                  </div>
                </div>
                
                {calculateEfficiency() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Coût par litre
                    </label>
                    <div className="text-lg font-medium text-gray-700">
                      {calculateEfficiency()} €/L
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Fournisseur
                  </label>
                  <div className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    {report.supplier || 'Non spécifié'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {report.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Notes Additionnelles
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{report.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar avec informations contextuelles */}
        <div className="space-y-6">
          {/* Informations du site */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informations du Site
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Nom du site
                </label>
                <div className="text-gray-900">{site.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Adresse
                </label>
                <div className="text-gray-900">{site.address}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Capacité du réservoir
                </label>
                <div className="text-gray-900">{site.reservoirCapacity.toLocaleString()} L</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Niveau actuel du site
                </label>
                <div className="text-gray-900">{site.currentLevel}%</div>
              </div>
            </div>
          </div>

          {/* Informations du rapport */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600" />
              Informations du Rapport
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Rapporté par
                </label>
                <div className="text-gray-900">
                  {report.reportedBy?.name || 'Utilisateur inconnu'}
                </div>
                {report.reportedBy?.email && (
                  <div className="text-sm text-gray-500">
                    {report.reportedBy.email}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Date de recharge
                </label>
                <div className="text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  {formatDate(report.refillDate)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Créé le
                </label>
                <div className="text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  {formatDate(report.createdAt)}
                </div>
              </div>
              
              {report.updatedAt !== report.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Dernière modification
                  </label>
                  <div className="text-gray-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    {formatDate(report.updatedAt)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Métriques rapides */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Métriques Rapides
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Volume/Capacité</span>
                <span className="font-semibold text-blue-900">
                  {calculateVolumePercentage()}%
                </span>
              </div>
              
              {report.cost && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Coût/Litre</span>
                  <span className="font-semibold text-blue-900">
                    {calculateEfficiency()} €/L
                  </span>
                </div>
              )}
              
              {calculateLevelIncrease() && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Augmentation</span>
                  <span className="font-semibold text-green-700">
                    +{calculateLevelIncrease()}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
