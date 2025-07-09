import React, { useState, useEffect } from 'react';

const AdGeneration = () => {
  // ==========================================
  // ESTADOS (MANTIDOS EXATAMENTE COMO ORIGINAL)
  // ==========================================
  
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
  const [generating, setGenerating] = useState(false);

  // ==========================================
  // FUNÇÕES AUXILIARES (SEGURAS)
  // ==========================================

  const safeGet = (obj, path, defaultValue = null) => {
    try {
      if (!obj || typeof obj !== 'object') return defaultValue;
      
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
    } catch (error) {
      console.error('Erro em safeGet:', error);
      return defaultValue;
    }
  };

  const isValidArray = (arr) => {
    return Array.isArray(arr) && arr.length > 0;
  };

  // ==========================================
  // BUSCA DE PÁGINAS (MANTIDA COMO ORIGINAL)
  // ==========================================

  const fetchPages = async () => {
    console.log('🔍 DEBUG Frontend: Iniciando fetchPages...');
    setLoadingPages(true);
    
    try {
      const url = `${process.env.REACT_APP_API_URL || 'https://ads-automation-backend-otpl.onrender.com'}/api/facebook/pages`;
      console.log('🔍 DEBUG Frontend: URL da requisição:', url);
      
      const response = await fetch(url);
      console.log('🔍 DEBUG Frontend: Status da resposta:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 DEBUG Frontend: Dados recebidos:', data);
        
        // ESTRUTURA ORIGINAL MANTIDA
        if (safeGet(data, 'success') && safeGet(data, 'data')) {
          const pagesData = safeGet(data, 'data', []);
          
          if (isValidArray(pagesData)) {
            const realPages = pagesData.map(page => ({
              id: safeGet(page, 'id', ''),
              name: safeGet(page, 'name', 'Página sem nome'),
              category: safeGet(page, 'category', 'Categoria não informada'),
              access_token: safeGet(page, 'access_token', '')
            }));
            
            console.log('🔍 DEBUG Frontend: Páginas extraídas:', realPages);
            console.log('🔍 DEBUG Frontend: Número de páginas:', realPages.length);
            
            setPages(realPages);
            
            console.log('✅ DEBUG Frontend: Páginas carregadas com sucesso!');
            realPages.forEach((page, index) => {
              console.log(`  ${index + 1}. ${page.name} (ID: ${page.id})`);
            });
          } else {
            console.log('⚠️ DEBUG Frontend: Array de páginas inválido');
            setPages([]);
          }
        } else {
          console.log('⚠️ DEBUG Frontend: Resposta sem páginas válidas');
          console.log('🔍 DEBUG Frontend: Estrutura recebida:', Object.keys(data || {}));
          setPages([]);
        }
      } else {
        console.log('❌ DEBUG Frontend: Erro na resposta:', response.status);
        setPages([]);
      }
    } catch (error) {
      console.log('💥 DEBUG Frontend: Erro ao buscar páginas:', error);
      setPages([]);
    } finally {
      setLoadingPages(false);
      console.log('🔍 DEBUG Frontend: fetchPages finalizado');
    }
  };

  // ==========================================
  // BUSCA DE PUBLICAÇÕES (MANTIDA COMO ORIGINAL)
  // ==========================================

  const fetchExistingPosts = async (pageId) => {
    if (!pageId) {
      console.log('⚠️ DEBUG: Nenhuma página selecionada para buscar publicações');
      return;
    }

    console.log('🔍 DEBUG: Iniciando busca de publicações para página:', pageId);
    setLoadingPosts(true);
    setExistingPosts([]);

    try {
      // Buscar posts do Facebook (ESTRUTURA ORIGINAL)
      console.log('📘 DEBUG: Buscando posts do Facebook...');
      const facebookResponse = await fetch(`${process.env.REACT_APP_API_URL || 'https://ads-automation-backend-otpl.onrender.com'}/api/facebook/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_id: pageId })
      });

      console.log('📘 DEBUG: Status resposta Facebook:', facebookResponse.status);

      let facebookPosts = [];
      if (facebookResponse.ok) {
        const facebookData = await facebookResponse.json();
        console.log('📘 DEBUG: Dados Facebook recebidos:', facebookData);
        
        // ESTRUTURA ORIGINAL MANTIDA
        if (safeGet(facebookData, 'success') && safeGet(facebookData, 'posts')) {
          const postsData = safeGet(facebookData, 'posts', []);
          
          if (isValidArray(postsData)) {
            facebookPosts = postsData.map(post => ({
              id: safeGet(post, 'id', ''),
              message: safeGet(post, 'message', 'Publicação sem texto'),
              created_time: safeGet(post, 'created_time', ''),
              full_picture: safeGet(post, 'full_picture', ''),
              permalink_url: safeGet(post, 'permalink_url', ''),
              likes: safeGet(post, 'likes', 0),
              comments: safeGet(post, 'comments', 0),
              shares: safeGet(post, 'shares', 0),
              platform: 'facebook'
            }));
            console.log('📘 DEBUG: Posts Facebook processados:', facebookPosts.length);
          }
        }
      } else {
        console.log('📘 DEBUG: Erro na API Facebook:', facebookResponse.status);
      }

      // Buscar posts do Instagram (ESTRUTURA ORIGINAL)
      console.log('📷 DEBUG: Buscando posts do Instagram...');
      const instagramResponse = await fetch(`${process.env.REACT_APP_API_URL || 'https://ads-automation-backend-otpl.onrender.com'}/api/facebook/instagram-posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_id: pageId })
      });

      console.log('📷 DEBUG: Status resposta Instagram:', instagramResponse.status);

      let instagramPosts = [];
      if (instagramResponse.ok) {
        const instagramData = await instagramResponse.json();
        console.log('📷 DEBUG: Dados Instagram recebidos:', instagramData);
        
        // ESTRUTURA ORIGINAL MANTIDA
        if (safeGet(instagramData, 'success') && safeGet(instagramData, 'posts')) {
          const postsData = safeGet(instagramData, 'posts', []);
          
          if (isValidArray(postsData)) {
            instagramPosts = postsData.map(post => ({
              id: safeGet(post, 'id', ''),
              message: safeGet(post, 'message', 'Publicação sem texto'),
              created_time: safeGet(post, 'created_time', ''),
              full_picture: safeGet(post, 'full_picture', ''),
              permalink_url: safeGet(post, 'permalink_url', ''),
              likes: safeGet(post, 'likes', 0),
              comments: safeGet(post, 'comments', 0),
              shares: safeGet(post, 'shares', 0),
              platform: 'instagram'
            }));
            console.log('📷 DEBUG: Posts Instagram processados:', instagramPosts.length);
          }
        }
      } else {
        console.log('📷 DEBUG: Erro na API Instagram:', instagramResponse.status);
      }

      // Combinar posts
      const allPosts = [...facebookPosts, ...instagramPosts];
      console.log('📊 DEBUG: Total de posts encontrados:', allPosts.length);

      if (allPosts.length > 0) {
        setExistingPosts(allPosts);
        console.log('✅ DEBUG: Posts carregados com sucesso!');
        allPosts.forEach((post, index) => {
          console.log(`  ${index + 1}. [${post.platform.toUpperCase()}] ${post.message?.substring(0, 50)}...`);
        });
      } else {
        console.log('⚠️ DEBUG: Nenhuma publicação encontrada para esta página');
        
        // Criar dados de exemplo baseados na página real selecionada
        const selectedPage = pages.find(p => p.id === pageId);
        const examplePosts = createExamplePostsForPage(selectedPage);
        setExistingPosts(examplePosts);
        console.log('🧪 DEBUG: Usando dados de exemplo para demonstração');
      }

    } catch (error) {
      console.log('💥 DEBUG: Erro ao buscar publicações:', error);
      
      // Fallback para dados de exemplo
      const selectedPage = pages.find(p => p.id === pageId);
      const examplePosts = createExamplePostsForPage(selectedPage);
      setExistingPosts(examplePosts);
      console.log('🧪 DEBUG: Usando dados de exemplo devido ao erro');
    } finally {
      setLoadingPosts(false);
    }
  };

  // ==========================================
  // DADOS DE EXEMPLO (MANTIDOS COMO ORIGINAL)
  // ==========================================

  const createExamplePostsForPage = (page) => {
    if (!page) return [];

    const pageName = safeGet(page, 'name', '').toLowerCase();
    let posts = [];

    if (pageName.includes('monte castelo') || pageName.includes('comercio')) {
      posts = [
        {
          id: `${page.id}_post1`,
          message: 'Carnes frescas e de qualidade! Venha conferir nossos cortes especiais. #CarnesFrescas #QualidadeGarantida',
          created_time: '2025-01-07T10:00:00+0000',
          full_picture: '/api/placeholder/400/300',
          permalink_url: `https://facebook.com/${page.id}/posts/post1`,
          platform: 'facebook',
          likes: 45,
          comments: 12,
          shares: 8
        },
        {
          id: `${page.id}_post2`,
          message: 'Promoção especial em produtos de mercearia! Não perca essa oportunidade. #Promocao #Mercearia',
          created_time: '2025-01-06T15:30:00+0000',
          full_picture: '/api/placeholder/400/300',
          permalink_url: `https://facebook.com/${page.id}/posts/post2`,
          platform: 'facebook',
          likes: 32,
          comments: 7,
          shares: 5
        }
      ];
    } else {
      // Posts genéricos para outras páginas
      posts = [
        {
          id: `${page.id}_post1`,
          message: `Confira as novidades da ${page.name}! Estamos sempre inovando para você. #Novidades #Qualidade`,
          created_time: '2025-01-07T12:00:00+0000',
          full_picture: '/api/placeholder/400/300',
          permalink_url: `https://facebook.com/${page.id}/posts/post1`,
          platform: 'facebook',
          likes: 56,
          comments: 14,
          shares: 9
        },
        {
          id: `${page.id}_post2`,
          message: `Excelência em atendimento é o nosso compromisso. ${page.name} - sempre ao seu lado! #Atendimento #Compromisso`,
          created_time: '2025-01-06T13:15:00+0000',
          full_picture: '/api/placeholder/400/300',
          permalink_url: `https://instagram.com/p/post2`,
          platform: 'instagram',
          likes: 73,
          comments: 11,
          shares: 6
        }
      ];
    }

    return posts;
  };

  // ==========================================
  // NOVA FUNCIONALIDADE: IA (OPCIONAL)
  // ==========================================

  const handleGenerateWithAI = async () => {
    if (!formData.page_id) {
      alert('Por favor, selecione uma página primeiro.');
      return;
    }

    if (creativeType === 'existing' && !selectedPost) {
      alert('Por favor, selecione uma publicação existente.');
      return;
    }

    if (!formData.product_name || !formData.product_description) {
      alert('Por favor, preencha o nome e descrição do produto/serviço.');
      return;
    }

    const selectedPlatforms = Object.keys(formData.platforms).filter(
      platform => formData.platforms[platform]
    );

    if (selectedPlatforms.length === 0) {
      alert('Por favor, selecione pelo menos uma plataforma.');
      return;
    }

    setGenerating(true);

    try {
      console.log('🤖 DEBUG: Iniciando geração com IA...');
      
      const requestData = {
        product_name: formData.product_name,
        product_description: formData.product_description,
        page_id: formData.page_id,
        platforms: selectedPlatforms,
        selected_post: creativeType === 'existing' ? selectedPost : null
      };

      console.log('🤖 DEBUG: Dados da requisição:', requestData);

      const apiUrl = process.env.REACT_APP_API_URL || 'https://ads-automation-backend-otpl.onrender.com';
      const response = await fetch(`${apiUrl}/api/facebook/generate-ad-with-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      console.log('🤖 DEBUG: Status da resposta IA:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('🤖 DEBUG: Resultado da IA:', result);
        
        if (safeGet(result, 'success')) {
          const campaignName = safeGet(result, 'preview.campaign_name', 'Nome não disponível');
          const dailyBudget = safeGet(result, 'preview.daily_budget', 'Orçamento não disponível');
          
          alert(`✅ Anúncio gerado com sucesso!\n\nCampanha: ${campaignName}\nOrçamento: ${dailyBudget}`);
        } else {
          const errorMsg = safeGet(result, 'error', 'Erro desconhecido');
          alert(`❌ Erro na geração: ${errorMsg}`);
        }
      } else {
        const errorText = await response.text();
        console.log('🤖 DEBUG: Erro da API:', errorText);
        
        if (response.status === 503) {
          alert('⚠️ Funcionalidade de IA temporariamente indisponível. Tente novamente mais tarde.');
        } else {
          alert(`❌ Erro na API: ${response.status} - ${errorText}`);
        }
      }
    } catch (err) {
      console.error('💥 DEBUG: Erro na geração:', err);
      alert(`💥 Erro na requisição: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // ==========================================
  // FILTROS E HANDLERS (MANTIDOS COMO ORIGINAL)
  // ==========================================

  const filteredPosts = existingPosts.filter(post => {
    if (platformFilter === 'all') return true;
    return safeGet(post, 'platform') === platformFilter;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

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

  // ==========================================
  // EFFECTS (MANTIDOS COMO ORIGINAL)
  // ==========================================

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (formData.page_id && creativeType === 'existing') {
      console.log('🔄 DEBUG: Página mudou para:', formData.page_id, '- Buscando publicações automaticamente...');
      fetchExistingPosts(formData.page_id);
    }
  }, [formData.page_id, creativeType, pages]); // Adicionado 'pages' como dependência

  // ==========================================
  // RENDER (MANTIDO EXATAMENTE COMO ORIGINAL)
  // ==========================================

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
              {isValidArray(pages) && pages.map((page) => (
                <option key={safeGet(page, 'id')} value={safeGet(page, 'id')}>
                  {safeGet(page, 'name', 'Página sem nome')}
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
                            {safeGet(post, 'platform', 'unknown')}
                          </span>
                          {safeGet(selectedPost, 'id') === safeGet(post, 'id') && (
                            <span className="ml-2 text-blue-500">✓</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {safeGet(post, 'created_time') ? 
                            new Date(post.created_time).toLocaleDateString('pt-BR') : 
                            'Data não disponível'
                          }
                        </span>
                      </div>

                      {safeGet(post, 'full_picture') && (
                        <img
                          src={post.full_picture}
                          alt="Post"
                          className="w-full h-32 object-cover rounded mb-2"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}

                      <p className="text-gray-700 text-sm mb-2 line-clamp-3">
                        {safeGet(post, 'message', 'Publicação sem texto')}
                      </p>

                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>👍 {safeGet(post, 'likes', 0)}</span>
                        <span>💬 {safeGet(post, 'comments', 0)}</span>
                        <span>🔄 {safeGet(post, 'shares', 0)}</span>
                      </div>
                    </div>
                  ))}
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
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={
            generating ||
            !formData.page_id || 
            (creativeType === 'existing' && !selectedPost) || 
            !formData.product_name || 
            !formData.product_description
          }
        >
          {generating ? '⏳ Gerando...' : '🤖 Gerar com IA'}
        </button>
      </div>
    </div>
  );
};

export default AdGeneration;

