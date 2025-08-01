import React, { useState, useEffect } from 'react';
import { Save, X, Droplets, Calendar, DollarSign, Truck, FileText } from 'lucide-react';
import { RefillReport, RefillReportFormData, Site, User } from '../../types';
import { createRefillReport, updateRefillReport } from '../../services/refillReportService';

interface RefillReportFormProps {
  site: Site;
  currentUser: User;
  report?: RefillReport;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RefillReportForm({ 
  site, 
  currentUser, 
  report, 
  onSuccess, 
  onCancel 
}: RefillReportFormProps) {
  const [formData, setFormData] = useState<RefillReportFormData>({
    volumeRefilled: 0,
    currentLevel: site.currentLevel,
    refillDate: new Date(),
    previousLevel: undefined,
    cost: undefined,
    supplier: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isEditing = !!report;

  useEffect(() => {
    if (report) {
      setFormData({
        volumeRefilled: report.volumeRefilled,
        currentLevel: report.currentLevel,
        refillDate: new Date(report.refillDate),
        previousLevel: report.previousLevel || undefined,
        cost: report.cost || undefined,
        supplier: report.supplier || '',
        notes: report.notes || ''
      });
    }
  }, [report]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Volume obligatoire et positif
    if (!formData.volumeRefilled || formData.volumeRefilled <= 0) {
      errors.volumeRefilled = 'Le volume rechargé doit être supérieur à 0';
    }

    // Niveau actuel obligatoire et entre 0-100
    if (formData.currentLevel < 0 || formData.currentLevel > 100) {
      errors.currentLevel = 'Le niveau actuel doit être entre 0 et 100%';
    }

    // Niveau précédent entre 0-100 si fourni
    if (formData.previousLevel !== undefined && 
        (formData.previousLevel < 0 || formData.previousLevel > 100)) {
      errors.previousLevel = 'Le niveau précédent doit être entre 0 et 100%';
    }

    // Coût positif si fourni
    if (formData.cost !== undefined && formData.cost < 0) {
      errors.cost = 'Le coût doit être positif';
    }

    // Date valide
    if (!formData.refillDate || formData.refillDate > new Date()) {
      errors.refillDate = 'La date de recharge ne peut pas être dans le futur';
    }

    // Logique métier : niveau actuel doit être supérieur au niveau précédent
    if (formData.previousLevel !== undefined && 
        formData.currentLevel <= formData.previousLevel) {
      errors.currentLevel = 'Le niveau actuel doit être supérieur au niveau précédent';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        // Nettoyer les valeurs optionnelles vides
        previousLevel: formData.previousLevel || null,
        cost: formData.cost || null,
        supplier: formData.supplier?.trim() || null,
        notes: formData.notes?.trim() || null
      };

      if (isEditing && report) {
        await updateRefillReport(site.id, report.id, submitData);
      } else {
        await createRefillReport(site.id, submitData);
      }

      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la sauvegarde du rapport');
      console.error('Error saving refill report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof RefillReportFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const calculateVolumeFromLevels = () => {
    if (formData.previousLevel !== undefined && formData.currentLevel > formData.previousLevel) {
      const levelDifference = formData.currentLevel - formData.previousLevel;
      const estimatedVolume = Math.round((levelDifference / 100) * site.reservoirCapacity);
      handleInputChange('volumeRefilled', estimatedVolume);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Droplets className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Modifier le rapport' : 'Nouveau rapport de recharge'}
                </h2>
                <p className="text-sm text-gray-600">
                  Site: {site.name} • Capacité: {site.reservoirCapacity.toLocaleString()} L
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Volume rechargé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Droplets className="inline h-4 w-4 mr-1" />
                Volume rechargé (L) *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.volumeRefilled || ''}
                onChange={(e) => handleInputChange('volumeRefilled', Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.volumeRefilled ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: 5000"
              />
              {validationErrors.volumeRefilled && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.volumeRefilled}</p>
              )}
            </div>

            {/* Date de recharge */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date de recharge
              </label>
              <input
                type="datetime-local"
                value={formData.refillDate ? 
                  new Date(formData.refillDate.getTime() - formData.refillDate.getTimezoneOffset() * 60000)
                    .toISOString().slice(0, 16) : ''
                }
                onChange={(e) => handleInputChange('refillDate', new Date(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.refillDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.refillDate && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.refillDate}</p>
              )}
            </div>
          </div>

          {/* Niveaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Niveau précédent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau précédent (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.previousLevel || ''}
                onChange={(e) => handleInputChange('previousLevel', e.target.value ? Number(e.target.value) : undefined)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.previousLevel ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: 45"
              />
              {validationErrors.previousLevel && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.previousLevel}</p>
              )}
            </div>

            {/* Niveau actuel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau après recharge (%) *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.currentLevel}
                  onChange={(e) => handleInputChange('currentLevel', Number(e.target.value))}
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.currentLevel ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 85"
                />
                <button
                  type="button"
                  onClick={calculateVolumeFromLevels}
                  className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  title="Calculer le volume à partir des niveaux"
                >
                  Calc
                </button>
              </div>
              {validationErrors.currentLevel && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.currentLevel}</p>
              )}
            </div>
          </div>

          {/* Informations financières et logistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coût */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Coût (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost || ''}
                onChange={(e) => handleInputChange('cost', e.target.value ? Number(e.target.value) : undefined)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.cost ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: 150.50"
              />
              {validationErrors.cost && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.cost}</p>
              )}
            </div>

            {/* Fournisseur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Truck className="inline h-4 w-4 mr-1" />
                Fournisseur
              </label>
              <input
                type="text"
                value={formData.supplier || ''}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Transport Aqua"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Notes additionnelles
            </label>
            <textarea
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Remarques, observations, problèmes rencontrés..."
            />
          </div>

          {/* Résumé calculé */}
          {formData.volumeRefilled > 0 && formData.cost && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-medium text-blue-900 mb-2">Résumé</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <span className="font-medium">Coût par litre:</span>
                  <span className="ml-2">
                    {(formData.cost / formData.volumeRefilled).toFixed(3)} €/L
                  </span>
                </div>
                {formData.previousLevel !== undefined && (
                  <div>
                    <span className="font-medium">Augmentation niveau:</span>
                    <span className="ml-2">
                      +{(formData.currentLevel - formData.previousLevel).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Sauvegarde...' : (isEditing ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
