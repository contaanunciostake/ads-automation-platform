import React, { useState, useEffect } from 'react';

const AdCreationWizard = ({ onClose, onAdCreated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    creationType: '', // 'new' ou 'existing'
    productDescription: '',
    businessName: '',
    businessType: 'local',
    targetLocation: 'Brasil',
    budgetRange: 'medium',
    pageId: ''
  });
  const [generatedOptions, setGeneratedOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [pages, setPages] = useState([]);

  // Carregar páginas disponíveis
  useEffect(() => {
    loadPages();
    loadTemplates();
  }, []);

  const loadPages = async () => {
    try {
      const response = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook/pages');
      const result = await response.json();
      
      if (result.success) {
        setPages(result.data || []);
        if (result.data && result.data.length > 0) {
          setFormData(prev => ({ ...prev, pageId: result.data[0].id }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar páginas:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook/get-automation-templates');
      const result = await response.json();
      
      if (result.success) {
        setTemplates(result.templates || []);
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      businessType: template.id,
      productDescription: template.example_description
    }));
  };

  const generateAdOptions = async () => {
    setLoading(true);
    
    try {
      console.log('🤖 DEBUG: Gerando opções de anúncio...', formData);
      
      const response = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook/create-ad-with-full-automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_description: formData.productDescription,
          page_id: formData.pageId,
          budget_range: formData.budgetRange,
          target_location: formData.targetLocation,
          business_type: formData.businessType
        })
      });

      const result = await response.json();
      console.log('🤖 DEBUG: Resultado da geração:', result);

      if (result.success) {
        setGeneratedOptions(result.ad_options || []);
        setCurrentStep(3);
      } else {
        alert('❌ Erro ao gerar opções: ' + result.error);
      }
    } catch (error) {
      console.error('💥 DEBUG: Erro na geração:', error);
      alert('❌ Erro ao gerar opções: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const publishSelectedOption = async () => {
    if (!selectedOption) {
      alert('Selecione uma opção primeiro');
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 DEBUG: Publicando opção selecionada...', selectedOption);

      const response = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook/publish-selected-option', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_option: selectedOption,
          page_id: formData.pageId,
          customizations: {} // Pode ser expandido para permitir edições
        })
      });

      const result = await response.json();
      console.log('🚀 DEBUG: Resultado da publicação:', result);

      if (result.success) {
        alert('🎉 Anúncio criado com sucesso!');
        if (onAdCreated) {
          onAdCreated(result);
        }
        onClose();
      } else {
        alert('❌ Erro ao publicar: ' + result.error);
      }
    } catch (error) {
      console.error('💥 DEBUG: Erro na publicação:', error);
      alert('❌ Erro ao publicar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎯 Tipo de Criativo
        </h2>
        <p className="text-gray-600">
          Escolha entre criar novo anúncio ou usar publicação existente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => {
            handleInputChange('creationType', 'new');
            setCurrentStep(2);
          }}
          className="p-6 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 text-center"
        >
          <div className="text-4xl mb-3">✨</div>
          <h3 className="text-lg font-semibold text-orange-600 mb-2">
            Criar Novo Anúncio
          </h3>
          <p className="text-gray-600 text-sm">
            Gere anúncio automaticamente com IA a partir de uma descrição
          </p>
        </button>

        <button
          onClick={() => {
            handleInputChange('creationType', 'existing');
            // Redirecionar para seleção de post existente
            alert('Funcionalidade de post existente será implementada');
          }}
          className="p-6 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-center"
        >
          <div className="text-4xl mb-3">📘</div>
          <h3 className="text-lg font-semibold text-blue-600 mb-2">
            Usar Publicação Existente
          </h3>
          <p className="text-gray-600 text-sm">
            Transforme uma publicação existente em anúncio
          </p>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🤖 Automação Completa com IA
        </h2>
        <p className="text-gray-600">
          Descreva seu produto/serviço e deixe a IA criar tudo automaticamente
        </p>
      </div>

      {/* Templates Rápidos */}
      <div>
        <h3 className="text-lg font-semibold mb-3">⚡ Templates Rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`p-3 border rounded-lg text-center transition-all duration-200 ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{template.icon}</div>
              <div className="text-sm font-medium">{template.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Formulário Principal */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 Descrição do Produto/Serviço *
          </label>
          <textarea
            value={formData.productDescription}
            onChange={(e) => handleInputChange('productDescription', e.target.value)}
            placeholder="Ex: Açougue com carnes premium, cortes especiais, atendimento personalizado, localizado no centro da cidade..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Seja específico: tipo de negócio, produtos, diferenciais, localização
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏢 Nome do Negócio
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              placeholder="Ex: Açougue do João"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 Localização
            </label>
            <input
              type="text"
              value={formData.targetLocation}
              onChange={(e) => handleInputChange('targetLocation', e.target.value)}
              placeholder="Ex: São Paulo, SP"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 Faixa de Orçamento
            </label>
            <select
              value={formData.budgetRange}
              onChange={(e) => handleInputChange('budgetRange', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">💚 Econômico (R$ 20-50/dia)</option>
              <option value="medium">💙 Equilibrado (R$ 50-100/dia)</option>
              <option value="high">💜 Agressivo (R$ 100-300/dia)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📄 Página do Facebook *
            </label>
            <select
              value={formData.pageId}
              onChange={(e) => handleInputChange('pageId', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Voltar
        </button>
        <button
          onClick={generateAdOptions}
          disabled={!formData.productDescription || !formData.pageId || loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Gerando com IA...
            </>
          ) : (
            '🤖 Gerar Opções com IA'
          )}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎯 Escolha sua Estratégia
        </h2>
        <p className="text-gray-600">
          A IA gerou {generatedOptions.length} opções otimizadas para seu negócio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {generatedOptions.map((option, index) => (
          <div
            key={option.option_id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              selectedOption?.option_id === option.option_id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedOption(option)}
          >
            <div className="text-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {option.name}
              </h3>
              <div className="text-sm text-gray-600">
                {option.ad_structure?.option_metadata?.recommended_for}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Orçamento:</span>
                <span className="font-medium">{option.preview?.daily_budget}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Risco:</span>
                <span className={`font-medium ${
                  option.ad_structure?.option_metadata?.risk_level === 'Baixo' ? 'text-green-600' :
                  option.ad_structure?.option_metadata?.risk_level === 'Médio' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {option.ad_structure?.option_metadata?.risk_level}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Alcance:</span>
                <span className="font-medium">{option.ad_structure?.option_metadata?.expected_reach}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Título:</div>
              <div className="text-sm font-medium text-gray-900 line-clamp-2">
                {option.preview?.headline}
              </div>
            </div>

            <div className="mt-2">
              <div className="text-xs text-gray-600 mb-1">Público:</div>
              <div className="text-xs text-gray-700">
                {option.preview?.target_summary}
              </div>
            </div>

            {selectedOption?.option_id === option.option_id && (
              <div className="mt-3 p-2 bg-blue-100 rounded text-center">
                <span className="text-blue-700 text-sm font-medium">✓ Selecionado</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedOption && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">📋 Preview do Anúncio Selecionado:</h4>
          <div className="bg-white rounded border p-3 space-y-2">
            <div className="font-medium">{selectedOption.preview?.headline}</div>
            <div className="text-sm text-gray-600">{selectedOption.preview?.description}</div>
            <div className="text-xs text-blue-600">
              💰 {selectedOption.preview?.daily_budget}/dia • 🎯 {selectedOption.preview?.target_summary}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Voltar
        </button>
        <button
          onClick={publishSelectedOption}
          disabled={!selectedOption || loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Publicando...
            </>
          ) : (
            '🚀 Publicar Anúncio'
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🎯 Criar Novo Anúncio
              </h1>
              <div className="flex items-center mt-2">
                <div className="flex space-x-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= currentStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step}
                    </div>
                  ))}
                </div>
                <div className="ml-3 text-sm text-gray-600">
                  Etapa {currentStep} de 3
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
};

export default AdCreationWizard;

