import React, { useState, useEffect } from 'react';

// Componente AdEditor simples
const AdEditor = ({ adData, onSave, onCancel }) => {
  const [editedAd, setEditedAd] = useState(adData);

  const handleSave = () => {
    onSave(editedAd);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">✏️ Editar Anúncio</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Informações da Campanha */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">📊 Informações da Campanha</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome da Campanha</label>
                <input
                  type="text"
                  value={editedAd?.campaign?.name || ''}
                  onChange={(e) => setEditedAd(prev => ({
                    ...prev,
                    campaign: { ...prev.campaign, name: e.target.value }
                  }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Orçamento Diário (R$)</label>
                <input
                  type="number"
                  value={editedAd?.adset?.daily_budget || ''}
                  onChange={(e) => setEditedAd(prev => ({
                    ...prev,
                    adset: { ...prev.adset, daily_budget: parseFloat(e.target.value) }
                  }))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Criativo */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">🎨 Criativo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título Principal</label>
                <input
                  type="text"
                  value={editedAd?.creative?.object_story_spec?.link_data?.name || ''}
                  onChange={(e) => setEditedAd(prev => ({
                    ...prev,
                    creative: {
                      ...prev.creative,
                      object_story_spec: {
                        ...prev.creative?.object_story_spec,
                        link_data: {
                          ...prev.creative?.object_story_spec?.link_data,
                          name: e.target.value
                        }
                      }
                    }
                  }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Texto Principal</label>
                <textarea
                  value={editedAd?.creative?.object_story_spec?.link_data?.message || ''}
                  onChange={(e) => setEditedAd(prev => ({
                    ...prev,
                    creative: {
                      ...prev.creative,
                      object_story_spec: {
                        ...prev.creative?.object_story_spec,
                        link_data: {
                          ...prev.creative?.object_story_spec?.link_data,
                          message: e.target.value
                        }
                      }
                    }
                  }))}
                  rows="3"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(editedAd, 'draft')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              💾 Salvar Rascunho
            </button>
            <button
              onClick={() => onSave(editedAd, 'publish')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              🚀 Publicar Anúncio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdGeneration = () => {
  // Estados principais
  const [formData, setFormData] = useState({
    page_id: '',
    product_name: '',
    product_description: '',
    budget: '',
    start_date: '',
    end_date: '',
    min_age: 18,
    max_age: 65,
    gender: 'all',
    platforms: {
      facebook: true,
      instagram: false
    }
  });

  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [creativeType, setCreativeType] = useState('new');
  const [existingPosts, setExistingPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [platformFilter, setPlatformFilter] = useState('all');
  
  // Estados para IA
  const [aiResult, setAiResult] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

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

  // Buscar páginas disponíveis
  const fetchPages = async () => {
    setLoadingPages(true);
    try {
      console.log('🔄 DEBUG: Buscando páginas...');
      const response = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook/pages');
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
    setLoadingPosts(true);
    try {
      console.log(`🔄 DEBUG: Buscando publicações da página ${pageId}...`);
      
      const response = await fetch("https://ads-automation-backend-otpl.onrender.com/api/facebook/posts", {
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
  const handleGenerateWithAI = async () => {
    setLoadingAI(true);
    try {
      console.log('🤖 DEBUG: Gerando anúncio com IA...');
      
      const response = await fetch("https://ads-automation-backend-otpl.onrender.com/api/facebook/generate-ad-with-ai", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_name: formData.product_name,
          product_description: formData.product_description,
          page_id: formData.page_id,
          platforms: Object.keys(formData.platforms).filter(p => formData.platforms[p]),
          selected_post: creativeType === 'existing' ? selectedPost : null
        })
      });

      const result = await response.json();
      console.log('🤖 DEBUG: Resultado da IA:', result);

      if (result.success) {
        setAiResult(result);
        console.log('✅ DEBUG: Anúncio gerado com sucesso pela IA');
      } else {
        console.error('❌ DEBUG: Erro na geração com IA:', result.error);
        alert('❌ Erro ao gerar anúncio: ' + result.error);
      }
    } catch (error) {
      console.error('💥 DEBUG: Erro na requisição de IA:', error);
      alert('❌ Erro ao gerar anúncio: ' + error.message);
    } finally {
      setLoadingAI(false);
    }
  };

  // Salvar rascunho
  const handleSaveDraft = async (editedAd) => {
    try {
      console.log('💾 DEBUG: Salvando rascunho:', editedAd);
      
      const response = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook/save-ad-draft', {
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
        alert('✅ Rascunho salvo com sucesso!');
        setShowEditor(false);
      } else {
        alert('❌ Erro ao salvar rascunho: ' + result.error);
      }
    } catch (error) {
      console.error('💥 DEBUG: Erro ao salvar rascunho:', error);
      alert('❌ Erro ao salvar rascunho: ' + error.message);
    }
  };

  // Publicar anúncio
  const handlePublishAd = async (editedAd) => {
    try {
      console.log('🚀 DEBUG: Publicando anúncio:', editedAd);
      
      const response = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook/publish-ad', {
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
        alert('🎉 Anúncio publicado com sucesso no Facebook!');
        setShowEditor(false);
        setAiResult(null); // Limpar resultado da IA
      } else {
        alert('❌ Erro ao publicar: ' + result.error);
      }
    } catch (error) {
      console.error('💥 DEBUG: Erro ao publicar:', error);
      alert('❌ Erro ao publicar: ' + error.message);
    }
  };

  // Função unificada para salvar (compatibilidade)
  const handleSaveAd = async (editedAd, action = 'draft') => {
    if (action === 'publish') {
      await handlePublishAd(editedAd);
    } else {
      await handleSaveDraft(editedAd);
    }
  };

  // Outras funções auxiliares
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreativeTypeChange = (type) => {
    setCreativeType(type);
    setSelectedPost(null);
    setExistingPosts([]);
  };

  const handlePostSelect = (post) => {
    setSelectedPost(post);
  };

  // Filtrar publicações por plataforma
  const filteredPosts = existingPosts.filter(post => {
    if (platformFilter === 'all') return true;
    return post.platform === platformFilter;
  });

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🤖 Geração de Anúncios com IA</h1>
        <p className="text-gray-600">Configure os parâmetros e deixe a IA criar anúncios otimizados automaticamente</p>
      </div>

      {/* Configuração Básica */}
      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <div className="flex items-center mb-4">
          <span className="text-blue-500 text-xl mr-2">⚙️</span>
          <h3 className="text-lg font-semibold text-gray-800">Configuração Básica</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Página do Facebook
            </label>
            {loadingPages ? (
              <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                <span className="text-gray-500">🔄 Carregando páginas...</span>
              </div>
            ) : (
              <select
                name="page_id"
                value={formData.page_id}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione uma página</option>
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name} ({page.category})
                  </option>
                ))}
              </select>
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
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="all">Todas</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </select>
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
                </p>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => handlePostSelect(post)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPost?.id === post.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <span className={`text-lg mr-2 ${
                            post.platform === 'facebook' ? 'text-blue-600' : 'text-pink-600'
                          }`}>
                            {post.platform === 'facebook' ? '📘' : '📷'}
                          </span>
                          <span className="font-medium text-gray-800 capitalize">
                            {post.platform}
                          </span>
                          {selectedPost?.id === post.id && (
                            <span className="ml-2 text-blue-500">✓</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(post.created_time).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {post.full_picture && (
                        <img
                          src={post.full_picture}
                          alt="Post"
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                      )}
                      <p className="text-gray-700 text-sm mb-2 line-clamp-3">
                        {post.message || 'Publicação sem texto'}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>👍 {post.likes || 0}</span>
                        <span>💬 {post.comments || 0}</span>
                        <span>🔄 {post.shares || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botão Gerar com IA */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleGenerateWithAI}
          disabled={!formData.page_id || (creativeType === 'existing' && !selectedPost) || loadingAI}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loadingAI ? '🔄 Gerando...' : '🤖 Gerar com IA'}
        </button>
      </div>

      {/* Resultado da IA */}
      {aiResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-800">✅ Anúncio Gerado com IA</h3>
            <button
              onClick={() => setShowEditor(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ✏️ Editar Detalhes
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">📊 Informações da Campanha</h4>
              <p><strong>Nome:</strong> {aiResult.preview?.campaign_name}</p>
              <p><strong>Orçamento Diário:</strong> {aiResult.preview?.daily_budget}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">🎯 Público-Alvo</h4>
              <p>{aiResult.preview?.target_audience}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium text-gray-800 mb-2">📝 Texto do Anúncio</h4>
            <p><strong>Título:</strong> {aiResult.preview?.ad_copy?.headline}</p>
            <p><strong>Texto:</strong> {aiResult.preview?.ad_copy?.primary_text}</p>
            <p><strong>CTA:</strong> {aiResult.preview?.ad_copy?.cta}</p>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && aiResult && (
        <AdEditor
          adData={aiResult.ai_structure}
          onSave={handleSaveAd}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};

export default AdGeneration;

