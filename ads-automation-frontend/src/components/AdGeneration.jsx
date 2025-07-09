import React, { useState, useEffect } from 'react';
import AdEditor from './AdEditor';

const AdGeneration = () => {
  // Estados principais
  const [formData, setFormData] = useState({
    page_id: '',
    product_name: '',
    product_description: '',
    platforms: {
      facebook: true,
      instagram: false
    }
  });

  // Estados para dados externos
  const [pages, setPages] = useState([]);
  const [existingPosts, setExistingPosts] = useState([]);
  
  // Estados de controle
  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [generatingAd, setGeneratingAd] = useState(false);
  
  // Estados de UI
  const [creativeType, setCreativeType] = useState('existing');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Estados para IA e Editor
  const [aiResult, setAiResult] = useState(null);
  const [showAiPreview, setShowAiPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // Função para acesso seguro a propriedades
  const safeGet = (obj, path, defaultValue = '') => {
    try {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : defaultValue;
      }, obj);
    } catch {
      return defaultValue;
    }
  };

  // Buscar páginas disponíveis
  const fetchPages = async () => {
    setLoadingPages(true);
    try {
      console.log('🔄 DEBUG: Buscando páginas...');
      const response = await fetch('/api/facebook/pages');
      const result = await response.json();
      
      console.log('📄 DEBUG: Resultado das páginas:', result);
      
      if (result.success && Array.isArray(result.data)) {
        setPages(result.data);
        console.log(`✅ DEBUG: ${result.data.length} páginas carregadas`);
      } else {
        console.error('❌ DEBUG: Erro ao buscar páginas:', result.error);
        setPages([]);
      }
    } catch (error) {
      console.error('💥 DEBUG: Erro na requisição de páginas:', error);
      setPages([]);
    } finally {
      setLoadingPages(false);
    }
  };

  // Buscar publicações existentes
  const fetchExistingPosts = async (pageId) => {
    if (!pageId) {
      setExistingPosts([]);
      return;
    }

    setLoadingPosts(true);
    try {
      console.log(`🔄 DEBUG: Buscando publicações da página ${pageId}...`);
      
      const response = await fetch('/api/facebook/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_id: pageId,
          limit: 20
        })
      });

      const result = await response.json();
      console.log('📱 DEBUG: Resultado das publicações:', result);

      if (result.success && Array.isArray(result.posts)) {
        setExistingPosts(result.posts);
        console.log(`✅ DEBUG: ${result.posts.length} publicações carregadas`);
      } else {
        console.error('❌ DEBUG: Erro ao buscar publicações:', result.error);
        setExistingPosts([]);
      }
    } catch (error) {
      console.error('💥 DEBUG: Erro na requisição de publicações:', error);
      setExistingPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Gerar anúncio com IA
  const generateAdWithAI = async () => {
    // Validações
    if (!formData.page_id) {
      alert('Por favor, selecione uma página');
      return;
    }

    if (!formData.product_name || !formData.product_description) {
      alert('Por favor, preencha o nome e descrição do produto');
      return;
    }

    if (creativeType === 'existing' && !selectedPost) {
      alert('Por favor, selecione uma publicação existente');
      return;
    }

    setGeneratingAd(true);
    setAiResult(null);
    setShowAiPreview(false);

    try {
      console.log('🤖 DEBUG: Iniciando geração com IA...');
      
      // Preparar dados para envio
      const requestData = {
        product_name: formData.product_name,
        product_description: formData.product_description,
        page_id: formData.page_id,
        platforms: Object.keys(formData.platforms).filter(platform => formData.platforms[platform]),
        selected_post: creativeType === 'existing' ? selectedPost : null
      };

      console.log('🤖 DEBUG: Dados enviados:', requestData);

      const response = await fetch('/api/facebook/generate-ad-with-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      console.log('🤖 DEBUG: Resultado da IA:', result);

      if (result.success) {
        setAiResult(result);
        setShowAiPreview(true);
        console.log('✅ DEBUG: Anúncio gerado com sucesso pela IA');
      } else {
        console.error('❌ DEBUG: Erro na geração com IA:', result.error);
        alert(`Erro ao gerar anúncio com IA: ${result.error}`);
      }

    } catch (error) {
      console.error('💥 DEBUG: Erro na requisição de IA:', error);
      alert(`Erro na comunicação com a IA: ${error.message}`);
    } finally {
      setGeneratingAd(false);
    }
  };

  // Abrir editor para edição detalhada
  const openEditor = () => {
    setShowEditor(true);
  };

  // Salvar anúncio editado
  const handleSaveAd = async (editedAd) => {
    try {
      console.log('💾 DEBUG: Salvando anúncio editado:', editedAd);
      
      // Aqui você pode implementar a lógica para salvar o anúncio
      // Por exemplo, enviar para o backend para criar no Facebook
      
      const response = await fetch('/api/facebook/create-ad-from-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ai_structure: editedAd,
          page_id: formData.page_id,
          selected_post: creativeType === 'existing' ? selectedPost : null
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Anúncio criado com sucesso no Facebook!');
        setShowEditor(false);
        setShowAiPreview(false);
        setAiResult(null);
        
        // Reset form
        setFormData({
          page_id: '',
          product_name: '',
          product_description: '',
          platforms: { facebook: true, instagram: false }
        });
        setSelectedPost(null);
        
      } else {
        alert(`Erro ao criar anúncio: ${result.error}`);
      }
      
    } catch (error) {
      console.error('💥 DEBUG: Erro ao salvar:', error);
      alert(`Erro ao salvar anúncio: ${error.message}`);
    }
  };

  // Cancelar edição
  const handleCancelEdit = () => {
    setShowEditor(false);
  };

  // Filtrar publicações por plataforma
  const filteredPosts = existingPosts.filter(post => {
    if (platformFilter === 'all') return true;
    return safeGet(post, 'platform') === platformFilter;
  });

  // useEffect para buscar páginas na inicialização
  useEffect(() => {
    fetchPages();
  }, []);

  // useEffect para buscar publicações quando página muda
  useEffect(() => {
    if (formData.page_id && creativeType === 'existing') {
      console.log('🔄 DEBUG: Página mudou para:', formData.page_id, '- Buscando publicações automaticamente...');
      fetchExistingPosts(formData.page_id);
    }
  }, [formData.page_id, creativeType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Se mudou a página, buscar publicações automaticamente
    if (name === 'page_id' && creativeType === 'existing') {
      console.log('🔄 DEBUG: Página selecionada:', value);
      if (value) {
        fetchExistingPosts(value);
      } else {
        setExistingPosts([]);
        setSelectedPost(null);
      }
    }
  };

  const handleCreativeTypeChange = (type) => {
    console.log('🔄 DEBUG: Mudando para', type === 'new' ? 'criar novo anúncio' : 'usar publicação existente');
    setCreativeType(type);
    setSelectedPost(null);
    setAiResult(null);
    setShowAiPreview(false);
    setShowEditor(false);
    
    if (type === 'existing' && formData.page_id) {
      console.log('🔄 DEBUG: Página já selecionada, buscando publicações...');
      fetchExistingPosts(formData.page_id);
    } else if (type === 'new') {
      setExistingPosts([]);
    }
  };

  const handlePostSelect = (post) => {
    setSelectedPost(post);
    console.log('📱 DEBUG: Post selecionado:', safeGet(post, 'id'), '-', safeGet(post, 'message', '').substring(0, 50));
  };

  const handleReloadPosts = () => {
    if (formData.page_id) {
      console.log('🔄 DEBUG: Recarregando publicações manualmente...');
      fetchExistingPosts(formData.page_id);
    }
  };

  // Se o editor estiver aberto, mostrar apenas o editor
  if (showEditor) {
    return (
      <AdEditor
        aiResult={aiResult}
        onSave={handleSaveAd}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Informações Básicas */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="flex items-center mb-4">
          <span className="text-blue-500 text-xl mr-2">ℹ️</span>
          <h3 className="text-lg font-semibold text-gray-800">Informações Básicas</h3>
        </div>
        <p className="text-gray-600 mb-4">Configure as informações principais da campanha</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Página da Business Manager
            </label>
            <select
              name="page_id"
              value={formData.page_id}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingPages}
            >
              <option value="">
                {loadingPages ? 'Carregando páginas...' : 'Selecione uma página'}
              </option>
              {pages.map((page) => (
                <option key={safeGet(page, 'id')} value={safeGet(page, 'id')}>
                  {safeGet(page, 'name')}
                </option>
              ))}
            </select>
            {pages.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {pages.length} página(s) encontrada(s) na Business Manager
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Produto/Serviço
            </label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleInputChange}
              placeholder="Ex: Smartphone Galaxy S24"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição do Produto/Serviço
          </label>
          <textarea
            name="product_description"
            value={formData.product_description}
            onChange={handleInputChange}
            placeholder="Descreva detalhadamente seu produto ou serviço..."
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plataformas
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.platforms.facebook}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  platforms: { ...prev.platforms, facebook: e.target.checked }
                }))}
                className="mr-2"
              />
              <span className="text-blue-600">📘</span>
              <span className="ml-1">Facebook</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.platforms.instagram}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  platforms: { ...prev.platforms, instagram: e.target.checked }
                }))}
                className="mr-2"
              />
              <span className="text-pink-600">📷</span>
              <span className="ml-1">Instagram</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tipo de Criativo */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="flex items-center mb-4">
          <span className="text-orange-500 text-xl mr-2">🎨</span>
          <h3 className="text-lg font-semibold text-gray-800">Tipo de Criativo</h3>
        </div>
        <p className="text-gray-600 mb-4">Escolha entre criar novo anúncio ou usar publicação existente</p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleCreativeTypeChange('new')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              creativeType === 'new'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <span className="text-2xl mb-2 block">✨</span>
              <span className="font-medium">Criar Novo Anúncio</span>
            </div>
          </button>

          <button
            onClick={() => handleCreativeTypeChange('existing')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              creativeType === 'existing'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <span className="text-2xl mb-2 block">📱</span>
              <span className="font-medium">Usar Publicação Existente</span>
            </div>
          </button>
        </div>

        {/* Publicações Existentes */}
        {creativeType === 'existing' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800">Filtrar por Plataforma</h4>
              <button
                onClick={handleReloadPosts}
                disabled={loadingPosts || !formData.page_id}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                🔄 Recarregar Publicações
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPlatformFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  platformFilter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                🌐 Todas
              </button>
              <button
                onClick={() => setPlatformFilter('facebook')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  platformFilter === 'facebook'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                📘 Facebook
              </button>
              <button
                onClick={() => setPlatformFilter('instagram')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  platformFilter === 'instagram'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                📷 Instagram
              </button>
            </div>

            {!formData.page_id ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-yellow-500 text-xl mr-2">⚠️</span>
                  <span className="text-yellow-800">Selecione uma página para ver as publicações</span>
                </div>
              </div>
            ) : loadingPosts ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-blue-500 text-xl mr-2">🔄</span>
                  <span className="text-blue-800">Carregando publicações...</span>
                </div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-yellow-500 text-xl mr-2">⚠️</span>
                  <span className="text-yellow-800">Nenhuma publicação encontrada para esta página</span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  {filteredPosts.length} publicação(ões) encontrada(s)
                  {existingPosts.some(post => safeGet(post, 'id', '').includes('_post')) && (
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                      Dados de Exemplo
                    </span>
                  )}
                </p>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredPosts.map((post) => (
                    <div
                      key={safeGet(post, 'id')}
                      onClick={() => handlePostSelect(post)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        safeGet(selectedPost, 'id') === safeGet(post, 'id')
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <span className={`text-lg mr-2 ${
                            safeGet(post, 'platform') === 'facebook' ? 'text-blue-600' : 'text-pink-600'
                          }`}>
                            {safeGet(post, 'platform') === 'facebook' ? '📘' : '📷'}
                          </span>
                          <span className="font-medium text-gray-800 capitalize">
                            {safeGet(post, 'platform')}
                          </span>
                          {safeGet(selectedPost, 'id') === safeGet(post, 'id') && (
                            <span className="ml-2 text-blue-500">✓</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {safeGet(post, 'created_time') ? new Date(safeGet(post, 'created_time')).toLocaleDateString('pt-BR') : ''}
                        </span>
                      </div>

                      {safeGet(post, 'full_picture') && (
                        <img
                          src={safeGet(post, 'full_picture')}
                          alt="Post"
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                      )}

                      <p className="text-gray-700 text-sm mb-2 line-clamp-3">
                        {safeGet(post, 'message') || 'Publicação sem texto'}
                      </p>

                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>👍 {safeGet(post, 'likes') || 0}</span>
                        <span>💬 {safeGet(post, 'comments') || 0}</span>
                        <span>🔄 {safeGet(post, 'shares') || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview da IA */}
      {showAiPreview && aiResult && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg mb-6 border border-purple-200">
          <div className="flex items-center mb-4">
            <span className="text-purple-500 text-xl mr-2">🤖</span>
            <h3 className="text-lg font-semibold text-gray-800">Anúncio Gerado pela IA</h3>
            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
              Inteligência Artificial
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preview do Anúncio */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-800 mb-3">📱 Preview do Anúncio</h4>
              
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Título Principal</span>
                  <p className="font-medium text-gray-800">
                    {safeGet(aiResult, 'preview.ad_copy.headline') || 'Título gerado pela IA'}
                  </p>
                </div>
                
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Texto Principal</span>
                  <p className="text-gray-700 text-sm">
                    {safeGet(aiResult, 'preview.ad_copy.primary_text') || 'Texto principal gerado pela IA'}
                  </p>
                </div>
                
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Call-to-Action</span>
                  <span className="inline-block px-3 py-1 bg-blue-500 text-white text-sm rounded">
                    {safeGet(aiResult, 'preview.ad_copy.cta') || 'SAIBA_MAIS'}
                  </span>
                </div>
              </div>
            </div>

            {/* Configurações da Campanha */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-800 mb-3">⚙️ Configurações</h4>
              
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Nome da Campanha</span>
                  <p className="text-gray-800">
                    {safeGet(aiResult, 'preview.campaign_name') || 'Campanha gerada pela IA'}
                  </p>
                </div>
                
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Orçamento Diário</span>
                  <p className="text-gray-800 font-medium">
                    {safeGet(aiResult, 'preview.daily_budget') || 'R$ 50,00'}
                  </p>
                </div>
                
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Público-Alvo</span>
                  <p className="text-gray-700 text-sm">
                    {safeGet(aiResult, 'preview.target_audience') || 'Público definido pela IA'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Análise da IA */}
          {safeGet(aiResult, 'ai_analysis') && (
            <div className="mt-4 bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-800 mb-3">🧠 Análise da IA</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Segmentação</span>
                  <p className="text-gray-700">
                    {safeGet(aiResult, 'ai_analysis.target_audience_reasoning') || 'Análise de público'}
                  </p>
                </div>
                
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Orçamento</span>
                  <p className="text-gray-700">
                    {safeGet(aiResult, 'ai_analysis.budget_reasoning') || 'Análise de orçamento'}
                  </p>
                </div>
                
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Criativo</span>
                  <p className="text-gray-700">
                    {safeGet(aiResult, 'ai_analysis.creative_reasoning') || 'Análise do criativo'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Próximos Passos */}
          <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">📋 Próximos Passos</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {safeGet(aiResult, 'next_steps', []).map((step, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">•</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {/* Botões de Ação */}
          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowAiPreview(false);
                setAiResult(null);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              🔄 Gerar Novamente
            </button>
            <button
              onClick={openEditor}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              ✏️ Editar Detalhes
            </button>
          </div>
        </div>
      )}

      {/* Botão de Ação Principal */}
      {!showAiPreview && (
        <div className="flex justify-end">
          <button
            onClick={generateAdWithAI}
            disabled={!formData.page_id || (creativeType === 'existing' && !selectedPost) || generatingAd}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {generatingAd ? (
              <>
                <span className="animate-spin mr-2">🔄</span>
                Gerando com IA...
              </>
            ) : (
              <>
                🤖 Gerar com IA
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdGeneration;

