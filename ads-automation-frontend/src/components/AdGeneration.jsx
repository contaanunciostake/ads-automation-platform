import React, { useState, useEffect } from 'react';

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

  // Buscar páginas REAIS da API
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
        
        // CORREÇÃO: Verificar múltiplas estruturas possíveis de resposta
        let pagesData = [];
        
        if (data.success && data.pages) {
          // Nova estrutura: { success: true, pages: [...] }
          pagesData = data.pages;
        } else if (data.success && data.data) {
          // Estrutura alternativa: { success: true, data: [...] }
          pagesData = data.data;
        } else if (Array.isArray(data)) {
          // Estrutura direta: [...]
          pagesData = data;
        } else if (data.data && Array.isArray(data.data)) {
          // Estrutura aninhada: { data: [...] }
          pagesData = data.data;
        }
        
        if (Array.isArray(pagesData) && pagesData.length > 0) {
          const realPages = pagesData.map(page => ({
            id: page.id || page.page_id || '',
            name: page.name || page.page_name || 'Página sem nome',
            category: page.category || page.category_list?.[0]?.name || 'Categoria não informada',
            access_token: page.access_token || page.page_access_token || ''
          }));
          
          console.log('🔍 DEBUG Frontend: Páginas extraídas:', realPages);
          console.log('🔍 DEBUG Frontend: Número de páginas:', realPages.length);
          
          setPages(realPages);
          
          console.log('✅ DEBUG Frontend: Páginas carregadas com sucesso!');
          realPages.forEach((page, index) => {
            console.log(`  ${index + 1}. ${page.name} (ID: ${page.id})`);
          });
        } else {
          console.log('⚠️ DEBUG Frontend: Resposta sem páginas válidas');
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

  // Buscar publicações existentes da página selecionada
  const fetchExistingPosts = async (pageId) => {
    if (!pageId) {
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
        const facebookData = await facebookResponse.json();
        console.log('📘 DEBUG: Dados Facebook recebidos:', facebookData);
        
        // CORREÇÃO: Verificar múltiplas estruturas possíveis de resposta
        let postsData = [];
        
        if (facebookData.success && facebookData.posts) {
          // Nova estrutura: { success: true, posts: [...] }
          postsData = facebookData.posts;
        } else if (facebookData.success && facebookData.data) {
          // Estrutura alternativa: { success: true, data: [...] }
          postsData = facebookData.data;
        } else if (Array.isArray(facebookData)) {
          // Estrutura direta: [...]
          postsData = facebookData;
        } else if (facebookData.data && Array.isArray(facebookData.data)) {
          // Estrutura aninhada: { data: [...] }
          postsData = facebookData.data;
        }
        
        if (Array.isArray(postsData)) {
          facebookPosts = postsData.map(post => ({
            id: post.id || `fb_${Date.now()}_${Math.random()}`,
            message: post.message || post.text || post.content || 'Publicação sem texto',
            created_time: post.created_time || post.timestamp || new Date().toISOString(),
            full_picture: post.full_picture || post.image || post.picture || null,
            permalink_url: post.permalink_url || post.url || post.link || '#',
            platform: 'facebook',
            likes: post.likes || post.like_count || 0,
            comments: post.comments || post.comment_count || 0,
            shares: post.shares || post.share_count || 0
          }));
          console.log('📘 DEBUG: Posts Facebook processados:', facebookPosts.length);
        }
      } else {
        console.log('📘 DEBUG: Erro na API Facebook:', facebookResponse.status);
      }

      // Buscar posts do Instagram
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
        
        // CORREÇÃO: Verificar múltiplas estruturas possíveis de resposta
        let postsData = [];
        
        if (instagramData.success && instagramData.posts) {
          // Nova estrutura: { success: true, posts: [...] }
          postsData = instagramData.posts;
        } else if (instagramData.success && instagramData.data) {
          // Estrutura alternativa: { success: true, data: [...] }
          postsData = instagramData.data;
        } else if (Array.isArray(instagramData)) {
          // Estrutura direta: [...]
          postsData = instagramData;
        } else if (instagramData.data && Array.isArray(instagramData.data)) {
          // Estrutura aninhada: { data: [...] }
          postsData = instagramData.data;
        }
        
        if (Array.isArray(postsData)) {
          instagramPosts = postsData.map(post => ({
            id: post.id || `ig_${Date.now()}_${Math.random()}`,
            message: post.message || post.caption || post.text || post.content || 'Publicação sem texto',
            created_time: post.created_time || post.timestamp || new Date().toISOString(),
            full_picture: post.full_picture || post.media_url || post.image || post.picture || null,
            permalink_url: post.permalink_url || post.url || post.link || '#',
            platform: 'instagram',
            likes: post.likes || post.like_count || 0,
            comments: post.comments || post.comment_count || 0,
            shares: post.shares || post.share_count || 0
          }));
          console.log('📷 DEBUG: Posts Instagram processados:', instagramPosts.length);
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

  // Criar posts de exemplo baseados na página real
  const createExamplePostsForPage = (page) => {
    if (!page) return [];

    const pageName = (page.name || '').toLowerCase();
    let posts = [];

    if (pageName.includes('monte castelo') || pageName.includes('comercio') || pageName.includes('carne') || pageName.includes('mercearia')) {
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
    } else if (pageName.includes('tech') || pageName.includes('solutions') || pageName.includes('rodrigo') || pageName.includes('acabamentos')) {
      posts = [
        {
          id: `${page.id}_post1`,
          message: 'Desenvolvimento de software personalizado para sua empresa. Entre em contato! #Desenvolvimento #Software',
          created_time: '2025-01-07T09:00:00+0000',
          full_picture: '/api/placeholder/400/300',
          permalink_url: `https://facebook.com/${page.id}/posts/post1`,
          platform: 'facebook',
          likes: 67,
          comments: 15,
          shares: 12
        },
        {
          id: `${page.id}_post2`,
          message: 'Soluções em tecnologia que transformam negócios. Conheça nossos serviços! #Tecnologia #Inovacao',
          created_time: '2025-01-06T14:00:00+0000',
          full_picture: '/api/placeholder/400/300',
          permalink_url: `https://instagram.com/p/post2`,
          platform: 'instagram',
          likes: 89,
          comments: 23,
          shares: 18
        }
      ];
    } else if (pageName.includes('marketing') || pageName.includes('digital') || pageName.includes('cergrand')) {
      posts = [
        {
          id: `${page.id}_post1`,
          message: 'Estratégias de marketing digital que geram resultados reais. Vamos conversar? #MarketingDigital #Resultados',
          created_time: '2025-01-07T11:30:00+0000',
          full_picture: '/api/placeholder/400/300',
          permalink_url: `https://facebook.com/${page.id}/posts/post1`,
          platform: 'facebook',
          likes: 124,
          comments: 34,
          shares: 28
        },
        {
          id: `${page.id}_post2`,
          message: 'Aumente suas vendas com campanhas otimizadas. Solicite uma consultoria gratuita! #Vendas #Consultoria',
          created_time: '2025-01-06T16:45:00+0000',
          full_picture: '/api/placeholder/400/300',
          permalink_url: `https://instagram.com/p/post2`,
          platform: 'instagram',
          likes: 98,
          comments: 19,
          shares: 15
        }
      ];
    } else if (pageName.includes('arts') || pageName.includes('massas') || pageName.includes('padaria')) {
      posts = [
        {
          id: `${page.id}_post1`,
          message: 'Massas artesanais feitas com amor e ingredientes selecionados! #MassasArtesanais #Qualidade',
          created_time: '2025-01-07T08:00:00+0000',
          full_picture: '/api/placeholder/400/300',
          permalink_url: `https://facebook.com/${page.id}/posts/post1`,
          platform: 'facebook',
          likes: 78,
          comments: 21,
          shares: 14
        },
        {
          id: `${page.id}_post2`,
          message: 'Pães fresquinhos saindo do forno! Venha experimentar nossos sabores únicos. #PaesFrescos #Padaria',
          created_time: '2025-01-06T17:00:00+0000',
          full_picture: '/api/placeholder/400/300',
          permalink_url: `https://instagram.com/p/post2`,
          platform: 'instagram',
          likes: 65,
          comments: 18,
          shares: 11
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

  // Filtrar posts por plataforma
  const filteredPosts = existingPosts.filter(post => {
    if (platformFilter === 'all') return true;
    return post.platform === platformFilter;
  });

  // useEffect para carregar páginas ao montar o componente
  useEffect(() => {
    fetchPages();
  }, []);

  // useEffect para buscar publicações quando página muda
  useEffect(() => {
    if (formData.page_id && creativeType === 'existing') {
      console.log('🔄 DEBUG: Página mudou para:', formData.page_id, '- Buscando publicações automaticamente...');
      fetchExistingPosts(formData.page_id);
    }
  }, [formData.page_id, creativeType, pages]); // Adicionado 'pages' como dependência

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
    
    if (type === 'existing' && formData.page_id) {
      console.log('🔄 DEBUG: Página já selecionada, buscando publicações...');
      fetchExistingPosts(formData.page_id);
    } else if (type === 'new') {
      setExistingPosts([]);
    }
  };

  const handlePostSelect = (post) => {
    setSelectedPost(post);
    console.log('📱 DEBUG: Post selecionado:', post.id, '-', post.message?.substring(0, 50));
  };

  const handleReloadPosts = () => {
    if (formData.page_id) {
      console.log('🔄 DEBUG: Recarregando publicações manualmente...');
      fetchExistingPosts(formData.page_id);
    }
  };

  // NOVA FUNÇÃO: Gerar anúncio com IA
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

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://ads-automation-backend-otpl.onrender.com'}/api/facebook/generate-ad-with-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('🤖 DEBUG: Status da resposta:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('🤖 DEBUG: Resultado da IA:', result);
        
        if (result.success) {
          alert(`✅ Anúncio gerado com sucesso!\n\nCampanha: ${result.preview?.campaign_name}\nOrçamento: ${result.preview?.daily_budget}\n\nVerifique o console para mais detalhes.`);
        } else {
          alert(`❌ Erro na geração: ${result.error}`);
        }
      } else {
        const errorData = await response.json();
        console.log('🤖 DEBUG: Erro da API:', errorData);
        alert(`❌ Erro na API: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.log('💥 DEBUG: Erro na requisição:', error);
      alert(`💥 Erro na requisição: ${error.message}`);
    }
  };

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
                <option key={page.id} value={page.id}>
                  {page.name}
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
                  {existingPosts.some(post => post.id && post.id.includes('_post')) && (
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                      Dados de Exemplo
                    </span>
                  )}
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
                          {post.created_time ? new Date(post.created_time).toLocaleDateString('pt-BR') : 'Data não disponível'}
                        </span>
                      </div>

                      {post.full_picture && (
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

      {/* Botão de Gerar com IA */}
      <div className="flex justify-end">
        <button
          onClick={handleGenerateWithAI}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!formData.page_id || (creativeType === 'existing' && !selectedPost) || !formData.product_name || !formData.product_description}
        >
          🤖 Gerar com IA
        </button>
      </div>
    </div>
  );
};

export default AdGeneration;

