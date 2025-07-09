import React, { useState, useEffect } from 'react';

const AdEditor = ({ aiResult, onSave, onCancel }) => {
  // Estados para edição
  const [editedAd, setEditedAd] = useState({
    campaign: {
      name: '',
      objective: 'CONVERSIONS',
      status: 'PAUSED',
      special_ad_categories: []
    },
    adset: {
      name: '',
      optimization_goal: 'CONVERSIONS',
      billing_event: 'IMPRESSIONS',
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      daily_budget: 5000, // em centavos
      targeting: {
        geo_locations: {
          countries: ['BR'],
          location_types: ['home', 'recent'],
          cities: [],
          regions: []
        },
        age_min: 18,
        age_max: 65,
        genders: [0], // 0 = todos, 1 = masculino, 2 = feminino
        interests: [],
        behaviors: [],
        custom_audiences: [],
        excluded_custom_audiences: []
      },
      status: 'PAUSED',
      start_time: '',
      end_time: ''
    },
    creative: {
      name: '',
      object_story_spec: {
        page_id: '',
        link_data: {
          link: '',
          message: '',
          name: '',
          description: '',
          call_to_action: {
            type: 'LEARN_MORE'
          }
        }
      }
    }
  });

  // Estados de controle
  const [activeTab, setActiveTab] = useState('campaign');
  const [saving, setSaving] = useState(false);

  // Opções para dropdowns
  const objectives = [
    { value: 'AWARENESS', label: 'Reconhecimento da Marca' },
    { value: 'REACH', label: 'Alcance' },
    { value: 'TRAFFIC', label: 'Tráfego' },
    { value: 'ENGAGEMENT', label: 'Engajamento' },
    { value: 'APP_INSTALLS', label: 'Instalações do App' },
    { value: 'VIDEO_VIEWS', label: 'Visualizações de Vídeo' },
    { value: 'LEAD_GENERATION', label: 'Geração de Leads' },
    { value: 'MESSAGES', label: 'Mensagens' },
    { value: 'CONVERSIONS', label: 'Conversões' },
    { value: 'CATALOG_SALES', label: 'Vendas do Catálogo' },
    { value: 'STORE_VISITS', label: 'Visitas à Loja' }
  ];

  const optimizationGoals = [
    { value: 'REACH', label: 'Alcance' },
    { value: 'IMPRESSIONS', label: 'Impressões' },
    { value: 'CLICKS', label: 'Cliques no Link' },
    { value: 'UNIQUE_CLICKS', label: 'Cliques Únicos no Link' },
    { value: 'CONVERSIONS', label: 'Conversões' },
    { value: 'LINK_CLICKS', label: 'Cliques no Link' },
    { value: 'POST_ENGAGEMENT', label: 'Engajamento da Publicação' },
    { value: 'PAGE_LIKES', label: 'Curtidas da Página' },
    { value: 'VIDEO_VIEWS', label: 'Visualizações de Vídeo' },
    { value: 'LEAD_GENERATION', label: 'Geração de Leads' }
  ];

  const bidStrategies = [
    { value: 'LOWEST_COST_WITHOUT_CAP', label: 'Menor Custo (sem limite)' },
    { value: 'LOWEST_COST_WITH_BID_CAP', label: 'Menor Custo (com limite)' },
    { value: 'TARGET_COST', label: 'Custo Alvo' },
    { value: 'COST_CAP', label: 'Limite de Custo' }
  ];

  const callToActions = [
    { value: 'LEARN_MORE', label: 'Saiba Mais' },
    { value: 'SHOP_NOW', label: 'Compre Agora' },
    { value: 'BOOK_TRAVEL', label: 'Reserve Viagem' },
    { value: 'DOWNLOAD', label: 'Baixar' },
    { value: 'GET_QUOTE', label: 'Solicitar Orçamento' },
    { value: 'CONTACT_US', label: 'Entre em Contato' },
    { value: 'APPLY_NOW', label: 'Inscreva-se Agora' },
    { value: 'SIGN_UP', label: 'Cadastre-se' },
    { value: 'WATCH_MORE', label: 'Assistir Mais' },
    { value: 'PLAY_GAME', label: 'Jogar' },
    { value: 'INSTALL_APP', label: 'Instalar App' },
    { value: 'USE_APP', label: 'Usar App' },
    { value: 'CALL_NOW', label: 'Ligar Agora' },
    { value: 'MESSAGE_PAGE', label: 'Enviar Mensagem' }
  ];

  const genderOptions = [
    { value: 0, label: 'Todos os Gêneros' },
    { value: 1, label: 'Masculino' },
    { value: 2, label: 'Feminino' }
  ];

  // Inicializar com dados da IA
  useEffect(() => {
    if (aiResult && aiResult.ai_structure) {
      setEditedAd(aiResult.ai_structure);
    }
  }, [aiResult]);

  // Função para atualizar valores aninhados
  const updateNestedValue = (path, value) => {
    setEditedAd(prev => {
      const newAd = { ...prev };
      const keys = path.split('.');
      let current = newAd;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newAd;
    });
  };

  // Função para obter valor aninhado
  const getNestedValue = (path) => {
    const keys = path.split('.');
    let current = editedAd;
    
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        return '';
      }
    }
    
    return current;
  };

  // Função para salvar
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedAd);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar anúncio');
    } finally {
      setSaving(false);
    }
  };

  // Função para formatar orçamento
  const formatBudget = (centavos) => {
    return (centavos / 100).toFixed(2);
  };

  // Função para converter orçamento para centavos
  const parseBudget = (reais) => {
    return Math.round(parseFloat(reais) * 100);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Editor de Anúncio</h2>
          <p className="text-gray-600">Edite todos os parâmetros do seu anúncio antes de publicar</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
          >
            {saving ? (
              <>
                <span className="animate-spin mr-2">🔄</span>
                Salvando...
              </>
            ) : (
              '💾 Salvar Anúncio'
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'campaign', label: '📊 Campanha', icon: '📊' },
            { id: 'targeting', label: '🎯 Segmentação', icon: '🎯' },
            { id: 'budget', label: '💰 Orçamento', icon: '💰' },
            { id: 'creative', label: '🎨 Criativo', icon: '🎨' },
            { id: 'schedule', label: '📅 Programação', icon: '📅' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Aba Campanha */}
        {activeTab === 'campaign' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Campanha
              </label>
              <input
                type="text"
                value={getNestedValue('campaign.name')}
                onChange={(e) => updateNestedValue('campaign.name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Campanha Produto Verão 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objetivo da Campanha
              </label>
              <select
                value={getNestedValue('campaign.objective')}
                onChange={(e) => updateNestedValue('campaign.objective', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {objectives.map((obj) => (
                  <option key={obj.value} value={obj.value}>
                    {obj.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status da Campanha
              </label>
              <select
                value={getNestedValue('campaign.status')}
                onChange={(e) => updateNestedValue('campaign.status', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="PAUSED">Pausada</option>
                <option value="ACTIVE">Ativa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Conjunto de Anúncios
              </label>
              <input
                type="text"
                value={getNestedValue('adset.name')}
                onChange={(e) => updateNestedValue('adset.name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Conjunto Público Principal"
              />
            </div>
          </div>
        )}

        {/* Aba Segmentação */}
        {activeTab === 'targeting' && (
          <div className="space-y-6">
            {/* Localização */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-4">🌍 Localização</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Países
                  </label>
                  <input
                    type="text"
                    value={getNestedValue('adset.targeting.geo_locations.countries').join(', ')}
                    onChange={(e) => updateNestedValue('adset.targeting.geo_locations.countries', e.target.value.split(', '))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="BR, US, CA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidades (opcional)
                  </label>
                  <input
                    type="text"
                    value={getNestedValue('adset.targeting.geo_locations.cities').join(', ')}
                    onChange={(e) => updateNestedValue('adset.targeting.geo_locations.cities', e.target.value.split(', ').filter(c => c.trim()))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="São Paulo, Rio de Janeiro"
                  />
                </div>
              </div>
            </div>

            {/* Demografia */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-4">👥 Demografia</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idade Mínima
                  </label>
                  <input
                    type="number"
                    min="13"
                    max="65"
                    value={getNestedValue('adset.targeting.age_min')}
                    onChange={(e) => updateNestedValue('adset.targeting.age_min', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idade Máxima
                  </label>
                  <input
                    type="number"
                    min="13"
                    max="65"
                    value={getNestedValue('adset.targeting.age_max')}
                    onChange={(e) => updateNestedValue('adset.targeting.age_max', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gênero
                  </label>
                  <select
                    value={getNestedValue('adset.targeting.genders')[0] || 0}
                    onChange={(e) => updateNestedValue('adset.targeting.genders', [parseInt(e.target.value)])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {genderOptions.map((gender) => (
                      <option key={gender.value} value={gender.value}>
                        {gender.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Interesses */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-4">💡 Interesses</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interesses (separados por vírgula)
                </label>
                <textarea
                  value={getNestedValue('adset.targeting.interests').map(i => i.name || i).join(', ')}
                  onChange={(e) => {
                    const interests = e.target.value.split(', ').filter(i => i.trim()).map(name => ({ name }));
                    updateNestedValue('adset.targeting.interests', interests);
                  }}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Tecnologia, Marketing Digital, Empreendedorismo"
                />
              </div>
            </div>

            {/* Comportamentos */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-4">🎭 Comportamentos</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comportamentos (separados por vírgula)
                </label>
                <textarea
                  value={getNestedValue('adset.targeting.behaviors').map(b => b.name || b).join(', ')}
                  onChange={(e) => {
                    const behaviors = e.target.value.split(', ').filter(b => b.trim()).map(name => ({ name }));
                    updateNestedValue('adset.targeting.behaviors', behaviors);
                  }}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Compradores online, Usuários de dispositivos móveis"
                />
              </div>
            </div>
          </div>
        )}

        {/* Aba Orçamento */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-4">💰 Configurações de Orçamento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orçamento Diário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={formatBudget(getNestedValue('adset.daily_budget'))}
                    onChange={(e) => updateNestedValue('adset.daily_budget', parseBudget(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Valor mínimo: R$ 1,00 por dia
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estratégia de Lance
                  </label>
                  <select
                    value={getNestedValue('adset.bid_strategy')}
                    onChange={(e) => updateNestedValue('adset.bid_strategy', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {bidStrategies.map((strategy) => (
                      <option key={strategy.value} value={strategy.value}>
                        {strategy.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta de Otimização
                  </label>
                  <select
                    value={getNestedValue('adset.optimization_goal')}
                    onChange={(e) => updateNestedValue('adset.optimization_goal', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {optimizationGoals.map((goal) => (
                      <option key={goal.value} value={goal.value}>
                        {goal.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evento de Cobrança
                  </label>
                  <select
                    value={getNestedValue('adset.billing_event')}
                    onChange={(e) => updateNestedValue('adset.billing_event', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IMPRESSIONS">Impressões</option>
                    <option value="CLICKS">Cliques</option>
                    <option value="CONVERSIONS">Conversões</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Estimativa de Alcance */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">📊 Estimativa de Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 font-medium">Alcance Estimado</span>
                  <p className="text-blue-800">1.000 - 5.000 pessoas/dia</p>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Cliques Estimados</span>
                  <p className="text-blue-800">50 - 200 cliques/dia</p>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">CPC Estimado</span>
                  <p className="text-blue-800">R$ 0,25 - R$ 1,00</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba Criativo */}
        {activeTab === 'creative' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-4">🎨 Conteúdo do Anúncio</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Criativo
                  </label>
                  <input
                    type="text"
                    value={getNestedValue('creative.name')}
                    onChange={(e) => updateNestedValue('creative.name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Criativo Principal Produto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto Principal
                  </label>
                  <textarea
                    value={getNestedValue('creative.object_story_spec.link_data.message')}
                    onChange={(e) => updateNestedValue('creative.object_story_spec.link_data.message', e.target.value)}
                    rows="4"
                    maxLength="125"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Texto principal do anúncio (máximo 125 caracteres)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {getNestedValue('creative.object_story_spec.link_data.message').length}/125 caracteres
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={getNestedValue('creative.object_story_spec.link_data.name')}
                      onChange={(e) => updateNestedValue('creative.object_story_spec.link_data.name', e.target.value)}
                      maxLength="40"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Título chamativo (máximo 40 caracteres)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {getNestedValue('creative.object_story_spec.link_data.name').length}/40 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={getNestedValue('creative.object_story_spec.link_data.description')}
                      onChange={(e) => updateNestedValue('creative.object_story_spec.link_data.description', e.target.value)}
                      maxLength="30"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Descrição (máximo 30 caracteres)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {getNestedValue('creative.object_story_spec.link_data.description').length}/30 caracteres
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de Destino
                    </label>
                    <input
                      type="url"
                      value={getNestedValue('creative.object_story_spec.link_data.link')}
                      onChange={(e) => updateNestedValue('creative.object_story_spec.link_data.link', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Call-to-Action
                    </label>
                    <select
                      value={getNestedValue('creative.object_story_spec.link_data.call_to_action.type')}
                      onChange={(e) => updateNestedValue('creative.object_story_spec.link_data.call_to_action.type', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {callToActions.map((cta) => (
                        <option key={cta.value} value={cta.value}>
                          {cta.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview do Anúncio */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-4">👁️ Preview do Anúncio</h3>
              
              <div className="max-w-md mx-auto border border-gray-300 rounded-lg overflow-hidden">
                {/* Header do anúncio */}
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      P
                    </div>
                    <div className="ml-2">
                      <p className="font-medium text-sm">Sua Página</p>
                      <p className="text-xs text-gray-500">Patrocinado</p>
                    </div>
                  </div>
                </div>

                {/* Conteúdo do anúncio */}
                <div className="p-3">
                  <p className="text-sm mb-3">
                    {getNestedValue('creative.object_story_spec.link_data.message') || 'Texto principal do anúncio aparecerá aqui...'}
                  </p>
                  
                  {/* Imagem placeholder */}
                  <div className="w-full h-32 bg-gray-200 rounded mb-3 flex items-center justify-center">
                    <span className="text-gray-500">🖼️ Imagem do Anúncio</span>
                  </div>

                  {/* Link preview */}
                  <div className="border border-gray-200 rounded">
                    <div className="p-3">
                      <p className="font-medium text-sm">
                        {getNestedValue('creative.object_story_spec.link_data.name') || 'Título do anúncio'}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        {getNestedValue('creative.object_story_spec.link_data.description') || 'Descrição'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {getNestedValue('creative.object_story_spec.link_data.link') || 'exemplo.com'}
                      </p>
                    </div>
                    <div className="bg-gray-100 px-3 py-2 text-center">
                      <span className="text-sm font-medium text-blue-600">
                        {callToActions.find(cta => cta.value === getNestedValue('creative.object_story_spec.link_data.call_to_action.type'))?.label || 'Saiba Mais'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba Programação */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-4">📅 Programação da Campanha</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Início
                  </label>
                  <input
                    type="datetime-local"
                    value={getNestedValue('adset.start_time')}
                    onChange={(e) => updateNestedValue('adset.start_time', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe em branco para iniciar imediatamente
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Término (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={getNestedValue('adset.end_time')}
                    onChange={(e) => updateNestedValue('adset.end_time', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe em branco para executar continuamente
                  </p>
                </div>
              </div>
            </div>

            {/* Status Final */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-4">🚀 Status de Publicação</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Status da Campanha:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    getNestedValue('campaign.status') === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getNestedValue('campaign.status') === 'ACTIVE' ? 'Ativa' : 'Pausada'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Status do Conjunto:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    getNestedValue('adset.status') === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getNestedValue('adset.status') === 'ACTIVE' ? 'Ativo' : 'Pausado'}
                  </span>
                </div>

                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="text-sm text-gray-700">
                    <strong>💡 Dica:</strong> Recomendamos iniciar com status "Pausado" para revisar todas as configurações antes de ativar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdEditor;

