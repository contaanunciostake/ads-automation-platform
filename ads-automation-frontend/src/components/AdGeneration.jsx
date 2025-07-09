import React, { useState, useEffect } from 'react';

const AdGeneration = () => {
  // Estados principais com valores padrão seguros
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
  const [error, setError] = useState(null);

  // Função auxiliar para verificar se um valor é válido
  const isValidValue = (value) => {
    return value !== null && value !== undefined && value !== '';
  };

  // Função auxiliar para verificar se um array é válido
  const isValidArray = (arr) => {
    return Array.isArray(arr) && arr.length > 0;
  };

  // Função auxiliar para extrair dados de forma segura
  const safeExtract = (obj, path, defaultValue = '') => {
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
    } catch (error) {
      console.log('🛡️ DEBUG: Erro ao extrair', path, ':', error);
      return defaultValue;
    }
  };

  // Buscar páginas REAIS da API
  const fetchPages = async () => {
    console.log('🔍 DEBUG Frontend: Iniciando fetchPages...');
    setLoadingPages(true);
    setError(null);
    
    try {
      const url = `${process.env.REACT_APP_API_URL || 'https://ads-automation-backend-otpl.onrender.com'}/api/facebook/pages`;
      console.log('🔍 DEBUG Frontend: URL da requisição:', url);
      
      const response = await fetch(url);
      console.log('🔍 DEBUG Frontend: Status da resposta:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 DEBUG Frontend: Dados recebidos:', data);
        
        // ULTRA DEFENSIVO: Verificar múltiplas estruturas possíveis
        let pagesData = [];
        
        try {
          if (data && typeof data === 'object') {
            if (safeExtract(data, 'success') && isValidArray(safeExtract(data, 'pages'))) {
              pagesData = data.pages;
            } else if (safeExtract(data, 'success') && isValidArray(safeExtract(data, 'data'))) {
              pagesData = data.data;
            } else if (isValidArray(data)) {
              pagesData = data;
            } else if (isValidArray(safeExtract(data, 'data'))) {
              pagesData = data.data;
            }
          }
        } catch (extractError) {
          console.log('🛡️ DEBUG: Erro ao extrair páginas:', extractError);
          pagesData = [];
        }
        
        if (isValidArray(pagesData)) {
          const realPages = pagesData.map((page, index) => {
            try {
              return {
                id: safeExtract(page, 'id') || safeExtract(page, 'page_id') || `page_${index}`,
                name: safeExtract(page, 'name') || safeExtract(page, 'page_name') || `Página ${index + 1}`,
                category: safeExtract(page, 'category') || safeExtract(page, 'category_list.0.name') || 'Categoria não informada',
                access_token: safeExtract(page, 'access_token') || safeExtract(page, 'page_access_token') || ''
              };
            } catch (pageError) {
              console.log('🛡️ DEBUG: Erro ao processar página:', pageError);
              return {
                id: `page_${index}`,
                name: `Página ${index + 1}`,
                category: 'Categoria não informada',
                access_token: ''
              };
            }
          }).filter(page => isValidValue(page.id));
          
          console.log('🔍 DEBUG Frontend: Páginas extraídas:', realPages);
          console.log('🔍 DEBUG Frontend: Número de páginas:', realPages.length);
          
          setPages(realPages || []);
          
          if (realPages.length > 0) {
            console.log('✅ DEBUG Frontend: Páginas carregadas com sucesso!');
            realPages.forEach((page, index) => {
              console.log(`  ${index + 1}. ${page.name} (ID: ${page.id})`);
            });
          } else {
            console.log('⚠️ DEBUG Frontend: Nenhuma página válida encontrada');
          }
        } else {
          console.log('⚠️ DEBUG Frontend: Resposta sem páginas válidas');
          setPages([]);
        }
      } else {
        console.log('❌ DEBUG Frontend: Erro na resposta:', response.status);
        setError(`Erro ${response.status}: Falha ao carregar páginas`);
        setPages([]);
      }
    } catch (error) {
      console.log('💥 DEBUG Frontend: Erro ao buscar páginas:', error);
      setError(`Erro de conexão: ${error.message}`);
      setPages([]);
    } finally {
      setLoadingPages(false);
      console.log('🔍 DEBUG Frontend: fetchPages finalizado');
    }
  };

  // Buscar publicações existentes da página selecionada
  const fetchExistingPosts = async (pageId) => {
    if (!isValidValue(pageId)) {
      console.log('⚠️ DEBUG: Nenhuma página selecionada para buscar publicações');
      return;
    }

    console.log('🔍 DEBUG: Iniciando busca de publicações para página:', pageId);
    setLoadingPosts(true);
    setExistingPosts([]);

    try {
      // Buscar posts do Facebook
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
        try {
          const facebookData = await facebookResponse.json();
          console.log('📘 DEBUG: Dados Facebook recebidos:', facebookData);
          
          // ULTRA DEFENSIVO: Verificar múltiplas estruturas possíveis
          let postsData = [];
          
          if (facebookData && typeof facebookData === 'object') {
            if (safeExtract(facebookData, 'success') && isValidArray(safeExtract(facebookData, 'posts'))) {
              postsData = facebookData.posts;
            } else if (safeExtract(facebookData, 'success') && isValidArray(safeExtract(facebookData, 'data'))) {
              postsData = facebookData.data;
            } else if (isValidArray(facebookData)) {
              postsData = facebookData;
            } else if (isValidArray(safeExtract(facebookData, 'data'))) {
              postsData = facebookData.data;
            }
          }
          
          if (isValidArray(postsData)) {
            facebookPosts = postsData.map((post, index) => {
              try {
                return {
                  id: safeExtract(post, 'id') || `fb_${Date.now()}_${index}`,
                  message: safeExtract(post, 'message') || safeExtract(post, 'text') || safeExtract(post, 'content') || 'Publicação sem texto',
                  created_time: safeExtract(post, 'created_time') || safeExtract(post, 'timestamp') || new Date().toISOString(),
                  full_picture: safeExtract(post, 'full_picture') || safeExtract(post, 'image') || safeExtract(post, 'picture') || null,
                  permalink_url: safeExtract(post, 'permalink_url') || safeExtract(post, 'url') || safeExtract(post, 'link') || '#',
                  platform: 'facebook',
                  likes: parseInt(safeExtract(post, 'likes') || safeExtract(post, 'like_count') || '0') || 0,
                  comments: parseInt(safeExtract(post, 'comments') || safeExtract(post, 'comment_count') || '0') || 0,
                  shares: parseInt(safeExtract(post, 'shares') || safeExtract(post, 'share_count') || '0') || 0
                };
              } catch (postError) {
                console.log('🛡️ DEBUG: Erro ao processar post Facebook:', postError);
                return {
                  id: `fb_error_${index}`,
                  message: 'Erro ao carregar publicação',
                  created_time: new Date().toISOString(),
                  full_picture: null,
                  permalink_url: '#',
                  platform: 'facebook',
                  likes: 0,
                  comments: 0,
                  shares: 0
                };
              }
            }).filter(post => isValidValue(post.id));
            console.log('📘 DEBUG: Posts Facebook processados:', facebookPosts.length);
          }
        } catch (parseError) {
          console.log('🛡️ DEBUG: Erro ao processar resposta Facebook:', parseError);
        }
      } else {
        console.log('📘 DEBUG: Erro na API Facebook:', facebookResponse.status);
      }

      // Buscar posts do Instagram (similar ao Facebook, mas mais defensivo)
      console.log('📷 DEBUG: Buscando posts do Instagram...');
      let instagramPosts = [];
      
      try {
        const instagramResponse = await fetch(`${process.env.REACT_APP_API_URL || 'https://ads-automation-backend-otpl.onrender.com'}/api/facebook/instagram-posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ page_id: pageId })
        });

        console.log('📷 DEBUG: Status resposta Instagram:', instagramResponse.status);

        if (instagramResponse.ok) {
          try {
            const instagramData = await instagramResponse.json();
            console.log('📷 DEBUG: Dados Instagram recebidos:', instagramData);
            
            // Processar dados do Instagram de forma similar ao Facebook
            let postsData = [];
            
            if (instagramData && typeof instagramData === 'object') {
              if (safeExtract(instagramData, 'success') && isValidArray(safeExtract(instagramData, 'posts'))) {
                postsData = instagramData.posts;
              } else if (safeExtract(instagramData, 'success') && isValidArray(safeExtract(instagramData, 'data'))) {
                postsData = instagramData.data;
              } else if (isValidArray(instagramData)) {
                postsData = instagramData;
              } else if (isValidArray(safeExtract(instagramData, 'data'))) {
                postsData = instagramData.data;
              }
            }
            
            if (isValidArray(postsData)) {
              instagramPosts = postsData.map((post, index) => {
                try {
                  return {
                    id: safeExtract(post, 'id') || `ig_${Date.now()}_${index}`,
                    message: safeExtract(post, 'message') || safeExtract(post, 'caption') || safeExtract(post, 'text') || 'Publicação sem texto',
                    created_time: safeExtract(post, 'created_time') || safeExtract(post, 'timestamp') || new Date().toISOString(),
                    full_picture: safeExtract(post, 'full_picture') || safeExtract(post, 'media_url') || safeExtract(post, 'image') || null,
                    permalink_url: safeExtract(post, 'permalink_url') || safeExtract(post, 'url') || safeExtract(post, 'link') || '#',
                    platform: 'instagram',
                    likes: parseInt(safeExtract(post, 'likes') || safeExtract(post, 'like_count') || '0') || 0,
                    comments: parseInt(safeExtract(post, 'comments') || safeExtract(post, 'comment_count') || '0') || 0,
                    shares: parseInt(safeExtract(post, 'shares') || safeExtract(post, 'share_count') || '0') || 0
                  };
                } catch (postError) {
                  console.log('🛡️ DEBUG: Erro ao processar post Instagram:', postError);
                  return {
                    id: `ig_error_${index}`,
                    message: 'Erro ao carregar publicação',
                    created_time: new Date().toISOString(),
                    full_picture: null,
                    permalink_url: '#',
                    platform: 'instagram',
                    likes: 0,
                    comments: 0,
                    shares: 0
                  };
                }
              }).filter(post => isValidValue(post.id));
              console.log('📷 DEBUG: Posts Instagram processados:', instagramPosts.length);
            }
          } catch (parseError) {
            console.log('🛡️ DEBUG: Erro ao processar resposta Instagram:', parseError);
          }
        } else {
          console.log('📷 DEBUG: Erro na API Instagram:', instagramResponse.status);
        }
      } catch (instagramError) {
        console.log('🛡️ DEBUG: Erro na requisição Instagram:', instagramError);
      }

      // Combinar posts de forma segura
      const allPosts = [...(facebookPosts || []), ...(instagramPosts || [])];
      console.log('📊 DEBUG: Total de posts encontrados:', allPosts.length);

      if (allPosts.length > 0) {
        setExistingPosts(allPosts);
        console.log('✅ DEBUG: Posts carregados com sucesso!');
        allPosts.forEach((post, index) => {
          console.log(`  ${index + 1}. [${post.platform.toUpperCase()}] ${safeExtract(post, 'message', '').substring(0, 50)}...`);
        });
      } else {
        console.log('⚠️ DEBUG: Nenhuma publicação encontrada para esta página');
        
        // Criar dados de exemplo baseados na página real selecionada
        const selectedPage = (pages || []).find(p => safeExtract(p, 'id') === pageId);
        const examplePosts = createExamplePostsForPage(selectedPage);
        setExistingPosts(examplePosts || []);
        console.log('🧪 DEBUG: Usando dados de exemplo para demonstração');
      }

    } catch (error) {
      console.log('💥 DEBUG: Erro ao buscar publicações:', error);
      
      // Fallback para dados de exemplo
      try {
        const selectedPage = (pages || []).find(p => safeExtract(p, 'id') === pageId);
        const examplePosts = createExamplePostsForPage(selectedPage);
        setExistingPosts(examplePosts || []);
        console.log('🧪 DEBUG: Usando dados de exemplo devido ao erro');
      } catch (fallbackError) {
        console.log('🛡️ DEBUG: Erro no fallback:', fallbackError);
        setExistingPosts([]);
      }
    } finally {
      setLoadingPosts(false);
    }
  };

  // Criar posts de exemplo baseados na página real
  const createExamplePostsForPage = (page) => {
    if (!page || !isValidValue(safeExtract(page, 'id'))) return [];

    try {
      const pageName = (safeExtract(page, 'name') || '').toLowerCase();
      const pageId = safeExtract(page, 'id');
      let posts = [];

      if (pageName.includes('monte castelo') || pageName.includes('comercio') || pageName.includes('carne') || pageName.includes('mercearia')) {
        posts = [
          {
            id: `${pageId}_post1`,
            message: 'Carnes frescas e de qualidade! Venha conferir nossos cortes especiais. #CarnesFrescas #QualidadeGarantida',
            created_time: '2025-01-07T10:00:00+0000',
            full_picture: null,
            permalink_url: `https://facebook.com/${pageId}/posts/post1`,
            platform: 'facebook',
            likes: 45,
            comments: 12,
            shares: 8
          },
          {
            id: `${pageId}_post2`,
            message: 'Promoção especial em produtos de mercearia! Não perca essa oportunidade. #Promocao #Mercearia',
            created_time: '2025-01-06T15:30:00+0000',
            full_picture: null,
            permalink_url: `https://facebook.com/${pageId}/posts/post2`,
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
            id: `${pageId}_post1`,
            message: `Confira as novidades da ${safeExtract(page, 'name')}! Estamos sempre inovando para você. #Novidades #Qualidade`,
            created_time: '2025-01-07T12:00:00+0000',
            full_picture: null,
            permalink_url: `https://facebook.com/${pageId}/posts/post1`,
            platform: 'facebook',
            likes: 56,
            comments: 14,
            shares: 9
          },
          {
            id: `${pageId}_post2`,
            message: `Excelência em atendimento é o nosso compromisso. ${safeExtract(page, 'name')} - sempre ao seu lado! #Atendimento #Compromisso`,
            created_time: '2025-01-06T13:15:00+0000',
            full_picture: null,
            permalink_url: `https://instagram.com/p/post2`,
            platform: 'instagram',
            likes: 73,
            comments: 11,
            shares: 6
          }
        ];
      }

      return posts;
    } catch (error) {
      console.log('🛡️ DEBUG: Erro ao criar posts de exemplo:', error);
      return [];
    }
  };

  // Filtrar posts por plataforma de forma segura
  const filteredPosts = (existingPosts || []).filter(post => {
    try {
      if (platformFilter === 'all') return true;
      return safeExtract(post, 'platform') === platformFilter;
    } catch (error) {
      console.log('🛡️ DEBUG: Erro ao filtrar posts:', error);
      return false;
    }
  });

  // useEffect para carregar páginas ao montar o componente
  useEffect(() => {
    try {
      fetchPages();
    } catch (error) {
      console.log('🛡️ DEBUG: Erro no useEffect de páginas:', error);
      setError('Erro ao inicializar componente');
    }
  }, []);

  // useEffect para buscar publicações quando página muda
  useEffect(() => {
    try {
      if (isValidValue(safeExtract(formData, 'page_id')) && creativeType === 'existing') {
        console.log('🔄 DEBUG: Página mudou para:', formData.page_id, '- Buscando publicações automaticamente...');
        fetchExistingPosts(formData.page_id);
      }
    } catch (error) {
      console.log('🛡️ DEBUG: Erro no useEffect de publicações:', error);
    }
  }, [safeExtract(formData, 'page_id'), creativeType, pages]);

  const handleInputChange = (e) => {
    try {
      if (!e || !e.target) return;
      
      const { name, value } = e.target;
      setFormData(prev => ({
        ...(prev || {}),
        [name]: value
      }));

      // Se mudou a página, buscar publicações automaticamente
      if (name === 'page_id' && creativeType === 'existing') {
        console.log('🔄 DEBUG: Página selecionada:', value);
        if (isValidValue(value)) {
          fetchExistingPosts(value);
        } else {
          setExistingPosts([]);
          setSelectedPost(null);
        }
      }
    } catch (error) {
      console.log('🛡️ DEBUG: Erro no handleInputChange:', error);
    }
  };

  const handleCreativeTypeChange = (type) => {
    try {
      console.log('🔄 DEBUG: Mudando para', type === 'new' ? 'criar novo anúncio' : 'usar publicação existente');
      setCreativeType(type);
      setSelectedPost(null);
      
      if (type === 'existing' && isValidValue(safeExtract(formData, 'page_id'))) {
        console.log('🔄 DEBUG: Página já selecionada, buscando publicações...');
        fetchExistingPosts(formData.page_id);
      } else if (type === 'new') {
        setExistingPosts([]);
      }
    } catch (error) {
      console.log('🛡️ DEBUG: Erro no handleCreativeTypeChange:', error);
    }
  };

  const handlePostSelect = (post) => {
    try {
      if (!post) return;
      setSelectedPost(post);
      console.log('📱 DEBUG: Post selecionado:', safeExtract(post, 'id'), '-', safeExtract(post, 'message', '').substring(0, 50));
    } catch (error) {
      console.log('🛡️ DEBUG: Erro no handlePostSelect:', error);
    }
  };

  const handleReloadPosts = () => {
    try {
      if (isValidValue(safeExtract(formData, 'page_id'))) {
        console.log('🔄 DEBUG: Recarregando publicações manualmente...');
        fetchExistingPosts(formData.page_id);
      }
    } catch (error) {
      console.log('🛡️ DEBUG: Erro no handleReloadPosts:', error);
    }
  };

  // Renderização com tratamento de erro
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
              value={safeExtract(formData, 'page_id') || ''}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingPages}
            >
              <option value="">
                {loadingPages ? 'Carregando páginas...' : 'Selecione uma página'}
              </option>
              {isValidArray(pages) && pages.map((page) => (
                <option key={safeExtract(page, 'id')} value={safeExtract(page, 'id')}>
                  {safeExtract(page, 'name') || 'Página sem nome'}
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
              value={safeExtract(formData, 'product_name') || ''}
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
            value={safeExtract(formData, 'product_description') || ''}
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
                checked={safeExtract(formData, 'platforms.facebook') || false}
                onChange={(e) => setFormData(prev => ({
                  ...(prev || {}),
                  platforms: { 
                    ...(safeExtract(prev, 'platforms') || {}), 
                    facebook: e.target.checked 
                  }
                }))}
                className="mr-2"
              />
              <span className="text-blue-600">📘</span>
              <span className="ml-1">Facebook</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={safeExtract(formData, 'platforms.instagram') || false}
                onChange={(e) => setFormData(prev => ({
                  ...(prev || {}),
                  platforms: { 
                    ...(safeExtract(prev, 'platforms') || {}), 
                    instagram: e.target.checked 
                  }
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
                disabled={loadingPosts || !isValidValue(safeExtract(formData, 'page_id'))}
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

            {!isValidValue(safeExtract(formData, 'page_id')) ? (
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
                  {isValidArray(existingPosts) && existingPosts.some(post => safeExtract(post, 'id', '').includes('_post')) && (
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                      Dados de Exemplo
                    </span>
                  )}
                </p>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredPosts.map((post, index) => {
                    const postId = safeExtract(post, 'id') || `post_${index}`;
                    const postMessage = safeExtract(post, 'message') || 'Publicação sem texto';
                    const postPlatform = safeExtract(post, 'platform') || 'unknown';
                    const postCreatedTime = safeExtract(post, 'created_time');
                    const postFullPicture = safeExtract(post, 'full_picture');
                    const postLikes = safeExtract(post, 'likes') || 0;
                    const postComments = safeExtract(post, 'comments') || 0;
                    const postShares = safeExtract(post, 'shares') || 0;
                    
                    return (
                      <div
                        key={postId}
                        onClick={() => handlePostSelect(post)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          safeExtract(selectedPost, 'id') === postId
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <span className={`text-lg mr-2 ${
                              postPlatform === 'facebook' ? 'text-blue-600' : 'text-pink-600'
                            }`}>
                              {postPlatform === 'facebook' ? '📘' : '📷'}
                            </span>
                            <span className="font-medium text-gray-800 capitalize">
                              {postPlatform}
                            </span>
                            {safeExtract(selectedPost, 'id') === postId && (
                              <span className="ml-2 text-blue-500">✓</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {postCreatedTime ? 
                              (() => {
                                try {
                                  return new Date(postCreatedTime).toLocaleDateString('pt-BR');
                                } catch {
                                  return 'Data inválida';
                                }
                              })() : 
                              'Data não disponível'
                            }
                          </span>
                        </div>

                        {postFullPicture && (
                          <img
                            src={postFullPicture}
                            alt="Post"
                            className="w-full h-32 object-cover rounded mb-2"
                            onError={(e) => {
                              if (e && e.target) {
                                e.target.style.display = 'none';
                              }
                            }}
                          />
                        )}

                        <p className="text-gray-700 text-sm mb-2 line-clamp-3">
                          {postMessage}
                        </p>

                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <span>👍 {postLikes}</span>
                          <span>💬 {postComments}</span>
                          <span>🔄 {postShares}</span>
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
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={
            !isValidValue(safeExtract(formData, 'page_id')) || 
            (creativeType === 'existing' && !selectedPost) || 
            !isValidValue(safeExtract(formData, 'product_name')) || 
            !isValidValue(safeExtract(formData, 'product_description'))
          }
        >
          🤖 Gerar com IA
        </button>
      </div>
    </div>
  );
};

export default AdGeneration;

