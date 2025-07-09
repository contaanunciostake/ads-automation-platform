import React, { useState, useEffect, useCallback } from 'react';

const AdGeneration = () => {
  // Estados principais com inicialização segura
  const [formData, setFormData] = useState(() => ({
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
  }));

  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [creativeType, setCreativeType] = useState('new');
  const [existingPosts, setExistingPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Função auxiliar para verificação segura
  const isValid = useCallback((value) => {
    return value !== null && value !== undefined && value !== '';
  }, []);

  // Função auxiliar para arrays
  const isValidArray = useCallback((arr) => {
    return Array.isArray(arr) && arr.length > 0;
  }, []);

  // Função para acesso seguro a propriedades
  const safeGet = useCallback((obj, path, defaultValue = '') => {
    if (!obj || typeof obj !== 'object') return defaultValue;
    
    try {
      const keys = path.split('.');
      let result = obj;
      
      for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
          result = result[key];
        } else {
          return defaultValue;
        }
      }
      
      return result !== null && result !== undefined ? result : defaultValue;
    } catch {
      return defaultValue;
    }
  }, []);

  // Buscar páginas da API
  const fetchPages = useCallback(async () => {
    console.log('🔍 Iniciando busca de páginas...');
    setLoadingPages(true);
    setError(null);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://ads-automation-backend-otpl.onrender.com';
      const response = await fetch(`${apiUrl}/api/facebook/pages`);
      
      console.log('📡 Status da resposta:', response.status);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: Falha ao carregar páginas`);
      }
      
      const data = await response.json();
      console.log('📊 Dados recebidos:', data);
      
      // Extrair páginas de forma segura
      let pagesData = [];
      
      if (safeGet(data, 'success') && isValidArray(safeGet(data, 'pages'))) {
        pagesData = data.pages;
      } else if (safeGet(data, 'success') && isValidArray(safeGet(data, 'data'))) {
        pagesData = data.data;
      } else if (isValidArray(data)) {
        pagesData = data;
      } else if (isValidArray(safeGet(data, 'data'))) {
        pagesData = data.data;
      }
      
      if (isValidArray(pagesData)) {
        const processedPages = pagesData.map((page, index) => ({
          id: safeGet(page, 'id') || safeGet(page, 'page_id') || `page_${index}`,
          name: safeGet(page, 'name') || safeGet(page, 'page_name') || `Página ${index + 1}`,
          category: safeGet(page, 'category') || safeGet(page, 'category_list.0.name') || 'Categoria não informada',
          access_token: safeGet(page, 'access_token') || safeGet(page, 'page_access_token') || ''
        })).filter(page => isValid(page.id));
        
        setPages(processedPages);
        console.log(`✅ ${processedPages.length} páginas carregadas`);
      } else {
        console.log('⚠️ Nenhuma página encontrada');
        setPages([]);
      }
      
    } catch (err) {
      console.error('❌ Erro ao buscar páginas:', err);
      setError(`Erro ao carregar páginas: ${err.message}`);
      setPages([]);
    } finally {
      setLoadingPages(false);
    }
  }, [safeGet, isValid, isValidArray]);

  // Buscar publicações da página
  const fetchExistingPosts = useCallback(async (pageId) => {
    if (!isValid(pageId)) {
      console.log('⚠️ ID da página inválido');
      return;
    }

    console.log('🔍 Buscando publicações para página:', pageId);
    setLoadingPosts(true);
    setExistingPosts([]);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://ads-automation-backend-otpl.onrender.com';
      
      // Buscar posts do Facebook
      const facebookResponse = await fetch(`${apiUrl}/api/facebook/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_id: pageId })
      });

      let allPosts = [];

      if (facebookResponse.ok) {
        const facebookData = await facebookResponse.json();
        console.log('📘 Dados Facebook:', facebookData);
        
        let postsData = [];
        if (safeGet(facebookData, 'success') && isValidArray(safeGet(facebookData, 'posts'))) {
          postsData = facebookData.posts;
        } else if (safeGet(facebookData, 'success') && isValidArray(safeGet(facebookData, 'data'))) {
          postsData = facebookData.data;
        } else if (isValidArray(facebookData)) {
          postsData = facebookData;
        }
        
        if (isValidArray(postsData)) {
          const facebookPosts = postsData.map((post, index) => ({
            id: safeGet(post, 'id') || `fb_${Date.now()}_${index}`,
            message: safeGet(post, 'message') || safeGet(post, 'text') || 'Publicação sem texto',
            created_time: safeGet(post, 'created_time') || new Date().toISOString(),
            full_picture: safeGet(post, 'full_picture') || safeGet(post, 'image') || null,
            permalink_url: safeGet(post, 'permalink_url') || '#',
            platform: 'facebook',
            likes: parseInt(safeGet(post, 'likes') || '0') || 0,
            comments: parseInt(safeGet(post, 'comments') || '0') || 0,
            shares: parseInt(safeGet(post, 'shares') || '0') || 0
          }));
          
          allPosts = [...allPosts, ...facebookPosts];
        }
      }

      // Buscar posts do Instagram
      try {
        const instagramResponse = await fetch(`${apiUrl}/api/facebook/instagram-posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page_id: pageId })
        });

        if (instagramResponse.ok) {
          const instagramData = await instagramResponse.json();
          console.log('📷 Dados Instagram:', instagramData);
          
          let postsData = [];
          if (safeGet(instagramData, 'success') && isValidArray(safeGet(instagramData, 'posts'))) {
            postsData = instagramData.posts;
          } else if (safeGet(instagramData, 'success') && isValidArray(safeGet(instagramData, 'data'))) {
            postsData = instagramData.data;
          } else if (isValidArray(instagramData)) {
            postsData = instagramData;
          }
          
          if (isValidArray(postsData)) {
            const instagramPosts = postsData.map((post, index) => ({
              id: safeGet(post, 'id') || `ig_${Date.now()}_${index}`,
              message: safeGet(post, 'message') || safeGet(post, 'caption') || 'Publicação sem texto',
              created_time: safeGet(post, 'created_time') || new Date().toISOString(),
              full_picture: safeGet(post, 'full_picture') || safeGet(post, 'media_url') || null,
              permalink_url: safeGet(post, 'permalink_url') || '#',
              platform: 'instagram',
              likes: parseInt(safeGet(post, 'likes') || '0') || 0,
              comments: parseInt(safeGet(post, 'comments') || '0') || 0,
              shares: parseInt(safeGet(post, 'shares') || '0') || 0
            }));
            
            allPosts = [...allPosts, ...instagramPosts];
          }
        }
      } catch (instagramError) {
        console.log('⚠️ Erro Instagram (não crítico):', instagramError.message);
      }

      if (allPosts.length > 0) {
        setExistingPosts(allPosts);
        console.log(`✅ ${allPosts.length} publicações carregadas`);
      } else {
        // Criar dados de exemplo
        const selectedPage = pages.find(p => safeGet(p, 'id') === pageId);
        const examplePosts = createExamplePosts(selectedPage);
        setExistingPosts(examplePosts);
        console.log('🧪 Usando dados de exemplo');
      }

    } catch (err) {
      console.error('❌ Erro ao buscar publicações:', err);
      const selectedPage = pages.find(p => safeGet(p, 'id') === pageId);
      const examplePosts = createExamplePosts(selectedPage);
      setExistingPosts(examplePosts);
    } finally {
      setLoadingPosts(false);
    }
  }, [isValid, isValidArray, safeGet, pages]);

  // Criar posts de exemplo
  const createExamplePosts = useCallback((page) => {
    if (!page || !isValid(safeGet(page, 'id'))) return [];

    const pageName = (safeGet(page, 'name') || '').toLowerCase();
    const pageId = safeGet(page, 'id');

    const basePosts = [
      {
        id: `${pageId}_example_1`,
        message: `Confira as novidades da ${safeGet(page, 'name')}! Estamos sempre inovando para você. #Novidades #Qualidade`,
        created_time: '2025-01-07T12:00:00+0000',
        full_picture: null,
        permalink_url: '#',
        platform: 'facebook',
        likes: 45,
        comments: 12,
        shares: 8
      },
      {
        id: `${pageId}_example_2`,
        message: `Excelência em atendimento é o nosso compromisso. ${safeGet(page, 'name')} - sempre ao seu lado! #Atendimento #Compromisso`,
        created_time: '2025-01-06T15:30:00+0000',
        full_picture: null,
        permalink_url: '#',
        platform: 'instagram',
        likes: 32,
        comments: 7,
        shares: 5
      }
    ];

    return basePosts;
  }, [safeGet, isValid]);

  // Filtrar posts
  const filteredPosts = existingPosts.filter(post => {
    if (platformFilter === 'all') return true;
    return safeGet(post, 'platform') === platformFilter;
  });

  // Gerar anúncio com IA
  const handleGenerateWithAI = useCallback(async () => {
    if (!isValid(safeGet(formData, 'page_id'))) {
      alert('Por favor, selecione uma página primeiro.');
      return;
    }

    if (creativeType === 'existing' && !selectedPost) {
      alert('Por favor, selecione uma publicação existente.');
      return;
    }

    if (!isValid(safeGet(formData, 'product_name')) || !isValid(safeGet(formData, 'product_description'))) {
      alert('Por favor, preencha o nome e descrição do produto/serviço.');
      return;
    }

    const selectedPlatforms = Object.keys(safeGet(formData, 'platforms') || {}).filter(
      platform => safeGet(formData, `platforms.${platform}`)
    );

    if (selectedPlatforms.length === 0) {
      alert('Por favor, selecione pelo menos uma plataforma.');
      return;
    }

    setGenerating(true);

    try {
      console.log('🤖 Iniciando geração com IA...');
      
      const requestData = {
        product_name: safeGet(formData, 'product_name'),
        product_description: safeGet(formData, 'product_description'),
        page_id: safeGet(formData, 'page_id'),
        platforms: selectedPlatforms,
        selected_post: creativeType === 'existing' ? selectedPost : null
      };

      const apiUrl = process.env.REACT_APP_API_URL || 'https://ads-automation-backend-otpl.onrender.com';
      const response = await fetch(`${apiUrl}/api/facebook/generate-ad-with-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🤖 Resultado da IA:', result);
        
        if (safeGet(result, 'success')) {
          alert(`✅ Anúncio gerado com sucesso!\n\nCampanha: ${safeGet(result, 'preview.campaign_name')}\nOrçamento: ${safeGet(result, 'preview.daily_budget')}`);
        } else {
          alert(`❌ Erro na geração: ${safeGet(result, 'error')}`);
        }
      } else {
        const errorData = await response.json();
        alert(`❌ Erro na API: ${safeGet(errorData, 'error') || 'Erro desconhecido'}`);
      }
    } catch (err) {
      console.error('💥 Erro na geração:', err);
      alert(`💥 Erro na requisição: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  }, [formData, creativeType, selectedPost, safeGet, isValid]);

  // Event handlers
  const handleInputChange = useCallback((e) => {
    if (!e?.target) return;
    
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'page_id' && creativeType === 'existing') {
      if (isValid(value)) {
        fetchExistingPosts(value);
      } else {
        setExistingPosts([]);
        setSelectedPost(null);
      }
    }
  }, [creativeType, fetchExistingPosts, isValid]);

  const handleCreativeTypeChange = useCallback((type) => {
    setCreativeType(type);
    setSelectedPost(null);
    
    if (type === 'existing' && isValid(safeGet(formData, 'page_id'))) {
      fetchExistingPosts(safeGet(formData, 'page_id'));
    } else if (type === 'new') {
      setExistingPosts([]);
    }
  }, [formData, fetchExistingPosts, safeGet, isValid]);

  const handlePostSelect = useCallback((post) => {
    setSelectedPost(post);
    console.log('📱 Post selecionado:', safeGet(post, 'id'));
  }, [safeGet]);

  const handleReloadPosts = useCallback(() => {
    const pageId = safeGet(formData, 'page_id');
    if (isValid(pageId)) {
      fetchExistingPosts(pageId);
    }
  }, [formData, fetchExistingPosts, safeGet, isValid]);

  const handlePlatformChange = useCallback((platform, checked) => {
    setFormData(prev => ({
      ...prev,
      platforms: {
        ...safeGet(prev, 'platforms', {}),
        [platform]: checked
      }
    }));
  }, [safeGet]);

  // Effects
  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    const pageId = safeGet(formData, 'page_id');
    if (isValid(pageId) && creativeType === 'existing') {
      fetchExistingPosts(pageId);
    }
  }, [formData, creativeType, fetchExistingPosts, safeGet, isValid]);

  // Render error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-500 text-xl mr-2">❌</span>
            <div>
              <h3 className="text-red-800 font-medium">Erro no Sistema</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  fetchPages();
                }}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render
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
              value={safeGet(formData, 'page_id') || ''}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingPages}
            >
              <option value="">
                {loadingPages ? 'Carregando páginas...' : 'Selecione uma página'}
              </option>
              {isValidArray(pages) && pages.map((page) => (
                <option key={safeGet(page, 'id')} value={safeGet(page, 'id')}>
                  {safeGet(page, 'name') || 'Página sem nome'}
                </option>
              ))}
            </select>
            {isValidArray(pages) && (
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
              value={safeGet(formData, 'product_name') || ''}
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
            value={safeGet(formData, 'product_description') || ''}
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
                checked={safeGet(formData, 'platforms.facebook') || false}
                onChange={(e) => handlePlatformChange('facebook', e.target.checked)}
                className="mr-2"
              />
              <span className="text-blue-600">📘</span>
              <span className="ml-1">Facebook</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={safeGet(formData, 'platforms.instagram') || false}
                onChange={(e) => handlePlatformChange('instagram', e.target.checked)}
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
                disabled={loadingPosts || !isValid(safeGet(formData, 'page_id'))}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                🔄 Recarregar Publicações
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              {['all', 'facebook', 'instagram'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setPlatformFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    platformFilter === filter
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {filter === 'all' ? '🌐 Todas' : 
                   filter === 'facebook' ? '📘 Facebook' : '📷 Instagram'}
                </button>
              ))}
            </div>

            {!isValid(safeGet(formData, 'page_id')) ? (
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
            ) : !isValidArray(filteredPosts) ? (
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
                  {filteredPosts.map((post, index) => {
                    const postId = safeGet(post, 'id') || `post_${index}`;
                    const isSelected = safeGet(selectedPost, 'id') === postId;
                    
                    return (
                      <div
                        key={postId}
                        onClick={() => handlePostSelect(post)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
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
                              {safeGet(post, 'platform') || 'unknown'}
                            </span>
                            {isSelected && (
                              <span className="ml-2 text-blue-500">✓</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {(() => {
                              try {
                                const date = safeGet(post, 'created_time');
                                return date ? new Date(date).toLocaleDateString('pt-BR') : 'Data não disponível';
                              } catch {
                                return 'Data inválida';
                              }
                            })()}
                          </span>
                        </div>

                        {safeGet(post, 'full_picture') && (
                          <img
                            src={safeGet(post, 'full_picture')}
                            alt="Post"
                            className="w-full h-32 object-cover rounded mb-2"
                            onError={(e) => {
                              if (e?.target) e.target.style.display = 'none';
                            }}
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
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botão de Gerar com IA */}
      <div className="flex justify-end">
        <button
          onClick={handleGenerateWithAI}
          disabled={
            generating ||
            !isValid(safeGet(formData, 'page_id')) || 
            (creativeType === 'existing' && !selectedPost) || 
            !isValid(safeGet(formData, 'product_name')) || 
            !isValid(safeGet(formData, 'product_description'))
          }
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {generating ? '⏳ Gerando...' : '🤖 Gerar com IA'}
        </button>
      </div>
    </div>
  );
};

export default AdGeneration;

