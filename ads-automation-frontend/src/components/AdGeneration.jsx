import React, { useState, useEffect } from 'react';

const AdGeneration = ({ selectedBusinessManager, selectedAdAccount }) => {
  const [formData, setFormData] = useState({
    page_id: '',
    product_name: '',
    product_description: '',
    platforms: {
      facebook: true,
      instagram: false
    },
    budget_type: 'daily',
    budget_value: 100,
    start_date: '',
    end_date: '',
    min_age: 18,
    max_age: 65,
    gender: 'all',
    creative_type: 'new'
  });

  const [pages, setPages] = useState([]);
  const [existingPosts, setExistingPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showExistingPosts, setShowExistingPosts] = useState(false);

  // Dados de exemplo inteligentes baseados na página selecionada
  const generateSmartExampleData = (pageId) => {
    const pageExamples = {
      'page_123': {
        name: 'MONTE CASTELO COMERCIO LTDA',
        posts: [
          {
            id: 'page_123_post_1',
            platform: 'facebook',
            message: 'Ofertas especiais em carnes premium! Venha conferir nossos cortes selecionados com desconto de até 30%. Qualidade garantida para sua família.',
            created_time: '2025-07-05T10:30:00Z',
            full_picture: '/api/placeholder/400/300',
            permalink_url: 'https://facebook.com/page_123/posts/post_1',
            engagement: { likes: 45, comments: 12, shares: 8 }
          },
          {
            id: 'page_123_post_2',
            platform: 'facebook',
            message: 'Novidade na casa! Agora temos linha completa de produtos orgânicos. Alimentação saudável para toda família.',
            created_time: '2025-07-03T14:15:00Z',
            full_picture: '/api/placeholder/400/300',
            permalink_url: 'https://facebook.com/page_123/posts/post_2',
            engagement: { likes: 32, comments: 7, shares: 5 }
          }
        ]
      },
      'page_456': {
        name: 'TechSolutions Brasil',
        posts: [
          {
            id: 'page_456_post_1',
            platform: 'facebook',
            message: 'Transforme seu negócio com nossas soluções em tecnologia! Desenvolvimento de apps, sites e sistemas personalizados.',
            created_time: '2025-07-06T09:00:00Z',
            full_picture: '/api/placeholder/400/300',
            permalink_url: 'https://facebook.com/page_456/posts/post_1',
            engagement: { likes: 78, comments: 23, shares: 15 }
          },
          {
            id: 'page_456_post_2',
            platform: 'instagram',
            message: 'Case de sucesso: E-commerce que aumentou vendas em 300% com nossa plataforma! 🚀 #tecnologia #ecommerce',
            created_time: '2025-07-04T16:45:00Z',
            full_picture: '/api/placeholder/400/300',
            permalink_url: 'https://instagram.com/p/page_456_post_2',
            engagement: { likes: 156, comments: 34, shares: 28 }
          }
        ]
      },
      'page_789': {
        name: 'Marketing Digital Pro',
        posts: [
          {
            id: 'page_789_post_1',
            platform: 'facebook',
            message: 'Aumente suas vendas com estratégias de marketing digital comprovadas! Consultoria gratuita para novos clientes.',
            created_time: '2025-07-07T11:20:00Z',
            full_picture: '/api/placeholder/400/300',
            permalink_url: 'https://facebook.com/page_789/posts/post_1',
            engagement: { likes: 92, comments: 18, shares: 12 }
          },
          {
            id: 'page_789_post_2',
            platform: 'instagram',
            message: 'Dica do dia: Use stories para engajar mais com sua audiência! 📱✨ #marketingdigital #dicas',
            created_time: '2025-07-05T13:30:00Z',
            full_picture: '/api/placeholder/400/300',
            permalink_url: 'https://instagram.com/p/page_789_post_2',
            engagement: { likes: 203, comments: 45, shares: 31 }
          }
        ]
      }
    };

    return pageExamples[pageId] || {
      name: 'Página Selecionada',
      posts: [
        {
          id: `${pageId}_example_1`,
          platform: 'facebook',
          message: 'Esta é uma publicação de exemplo para demonstração da interface. Selecione uma página real para ver publicações reais.',
          created_time: '2025-07-08T12:00:00Z',
          full_picture: '/api/placeholder/400/300',
          permalink_url: `https://facebook.com/${pageId}/posts/example_1`,
          engagement: { likes: 25, comments: 5, shares: 3 }
        }
      ]
    };
  };

  // Buscar páginas (com fallback inteligente)
  const fetchPages = async () => {
    setLoadingPages(true);
    console.log('🔍 DEBUG Frontend: Iniciando fetchPages...');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/facebook/pages`);
      console.log('🔍 DEBUG Frontend: Status da resposta:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🔍 DEBUG Frontend: Dados recebidos:', result);
        
        if (result.success && result.pages && result.pages.length > 0) {
          setPages(result.pages);
          console.log('✅ DEBUG Frontend: Páginas carregadas com sucesso!');
          result.pages.forEach((page, index) => {
            console.log(`  ${index + 1}. ${page.name} (ID: ${page.id})`);
          });
          return;
        }
      }
      
      // Fallback para dados de exemplo
      console.log('⚠️ DEBUG Frontend: API falhou, usando dados de exemplo');
      throw new Error('API não retornou páginas válidas');
      
    } catch (error) {
      console.log('❌ DEBUG Frontend: Erro ao buscar páginas:', error.message);
      console.log('🧪 TESTE: Forçando páginas de exemplo');
      
      // Páginas de exemplo inteligentes
      const examplePages = [
        { id: 'page_123', name: 'MONTE CASTELO COMERCIO LTDA', category: 'Comércio Local' },
        { id: 'page_456', name: 'TechSolutions Brasil', category: 'Tecnologia' },
        { id: 'page_789', name: 'Marketing Digital Pro', category: 'Marketing' }
      ];
      
      setPages(examplePages);
      console.log('✅ TESTE: Páginas de exemplo carregadas');
    } finally {
      setLoadingPages(false);
      console.log('🔍 DEBUG Frontend: fetchPages finalizado');
    }
  };

  // Buscar publicações existentes (com dados inteligentes)
  const fetchExistingPosts = async (pageId) => {
    if (!pageId) {
      console.log('⚠️ DEBUG: Nenhuma página selecionada para buscar posts');
      return;
    }

    setLoadingPosts(true);
    console.log(`🔍 DEBUG: Iniciando busca de publicações para página: ${pageId}`);
    
    try {
      // Tentar buscar do Facebook
      console.log('📘 DEBUG: Buscando posts do Facebook...');
      const facebookResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/facebook/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_id: pageId, limit: 10 })
      });
      
      console.log('📘 DEBUG: Status resposta Facebook:', facebookResponse.status);
      
      let facebookPosts = [];
      if (facebookResponse.ok) {
        const fbResult = await facebookResponse.json();
        if (fbResult.success && fbResult.posts) {
          facebookPosts = fbResult.posts.map(post => ({ ...post, platform: 'facebook' }));
          console.log(`✅ DEBUG: ${facebookPosts.length} posts do Facebook encontrados`);
        }
      } else {
        console.log('⚠️ DEBUG: API do Facebook falhou, usando dados de exemplo');
      }

      // Tentar buscar do Instagram
      console.log('📸 DEBUG: Buscando posts do Instagram...');
      const instagramResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/facebook/instagram-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_id: pageId, limit: 10 })
      });
      
      console.log('📸 DEBUG: Status resposta Instagram:', instagramResponse.status);
      
      let instagramPosts = [];
      if (instagramResponse.ok) {
        const igResult = await instagramResponse.json();
        if (igResult.success && igResult.posts) {
          instagramPosts = igResult.posts.map(post => ({ ...post, platform: 'instagram' }));
          console.log(`✅ DEBUG: ${instagramPosts.length} posts do Instagram encontrados`);
        }
      } else {
        console.log('⚠️ DEBUG: API do Instagram falhou, usando dados de exemplo');
      }

      // Se ambas APIs falharam, usar dados inteligentes
      if (facebookPosts.length === 0 && instagramPosts.length === 0) {
        console.log('🧪 DEBUG: Usando dados de exemplo inteligentes para página:', pageId);
        const exampleData = generateSmartExampleData(pageId);
        const allPosts = exampleData.posts;
        setExistingPosts(allPosts);
        console.log(`✅ DEBUG: ${allPosts.length} posts de exemplo carregados`);
        return;
      }

      // Combinar posts reais
      const allPosts = [...facebookPosts, ...instagramPosts];
      setExistingPosts(allPosts);
      console.log(`✅ DEBUG: Total de ${allPosts.length} posts carregados (${facebookPosts.length} Facebook + ${instagramPosts.length} Instagram)`);
      
    } catch (error) {
      console.log('❌ DEBUG: Erro ao buscar posts:', error.message);
      console.log('🧪 DEBUG: Usando dados de exemplo como fallback');
      
      // Fallback para dados de exemplo
      const exampleData = generateSmartExampleData(pageId);
      setExistingPosts(exampleData.posts);
      console.log(`✅ DEBUG: ${exampleData.posts.length} posts de exemplo carregados como fallback`);
      
    } finally {
      setLoadingPosts(false);
      console.log('🔍 DEBUG: fetchExistingPosts finalizado');
    }
  };

  // Carregar páginas ao montar componente
  useEffect(() => {
    fetchPages();
  }, []);

  // Buscar publicações quando página muda e está usando publicação existente
  useEffect(() => {
    if (formData.page_id && formData.creative_type === 'existing') {
      console.log(`🔄 DEBUG: Página mudou para: ${formData.page_id} - Buscando publicações automaticamente...`);
      fetchExistingPosts(formData.page_id);
    } else if (!formData.page_id && formData.creative_type === 'existing') {
      console.log('🔄 DEBUG: Nenhuma página selecionada, limpando publicações');
      setExistingPosts([]);
      setSelectedPost(null);
    }
  }, [formData.page_id, formData.creative_type]);

  // Filtrar posts por plataforma
  const getFilteredPosts = () => {
    if (!existingPosts.length) return [];
    
    const { facebook, instagram } = formData.platforms;
    
    if (facebook && instagram) {
      return existingPosts; // Mostrar todos
    } else if (facebook) {
      return existingPosts.filter(post => post.platform === 'facebook');
    } else if (instagram) {
      return existingPosts.filter(post => post.platform === 'instagram');
    }
    
    return [];
  };

  const filteredPosts = getFilteredPosts();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'page_id') {
      console.log(`🔄 DEBUG: Página selecionada: ${value}`);
      setFormData(prev => ({ ...prev, [name]: value }));
      setSelectedPost(null); // Limpar post selecionado ao mudar página
    } else if (type === 'checkbox') {
      if (name.startsWith('platforms.')) {
        const platform = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          platforms: { ...prev.platforms, [platform]: checked }
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreativeTypeChange = (type) => {
    console.log(`🔄 DEBUG: Mudando para ${type === 'existing' ? 'usar publicação existente' : 'criar novo anúncio'}`);
    setFormData(prev => ({ ...prev, creative_type: type }));
    setShowExistingPosts(type === 'existing');
    setSelectedPost(null);
    
    if (type === 'existing' && formData.page_id) {
      console.log('🔄 DEBUG: Página já selecionada, buscando publicações...');
      fetchExistingPosts(formData.page_id);
    }
  };

  const handlePostSelect = (post) => {
    setSelectedPost(post);
    console.log('📝 DEBUG: Post selecionado:', post.id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatEngagement = (engagement) => {
    const { likes = 0, comments = 0, shares = 0 } = engagement || {};
    return { likes, comments, shares };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.creative_type === 'existing' && !selectedPost) {
      alert('Por favor, selecione uma publicação existente.');
      return;
    }
    
    console.log('🚀 DEBUG: Enviando dados do anúncio:', {
      ...formData,
      selectedPost: selectedPost?.id
    });
    
    // Aqui você implementaria a lógica de criação do anúncio
    alert('Anúncio criado com sucesso! (Simulação)');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-blue-600">ℹ️</span>
            <h3 className="text-lg font-semibold text-gray-800">Informações Básicas</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Configure as informações principais da campanha</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Página da Business Manager
              </label>
              <select
                name="page_id"
                value={formData.page_id}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione uma página</option>
                {pages.map(page => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
              {loadingPages && (
                <p className="text-sm text-blue-600 mt-1">🔄 Carregando páginas...</p>
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
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
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Plataformas</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="platforms.facebook"
                  checked={formData.platforms.facebook}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-blue-600">📘</span>
                <span className="ml-1">Facebook</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="platforms.instagram"
                  checked={formData.platforms.instagram}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-pink-600">📸</span>
                <span className="ml-1">Instagram</span>
              </label>
            </div>
          </div>
        </div>

        {/* Orçamento e Cronograma */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-600">💰</span>
            <h3 className="text-lg font-semibold text-gray-800">Orçamento e Cronograma</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Configure o orçamento e período da campanha</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Orçamento
              </label>
              <select
                name="budget_type"
                value={formData.budget_type}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="daily">Orçamento Diário - Valor gasto por dia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Orçamento (R$)
              </label>
              <input
                type="number"
                name="budget_value"
                value={formData.budget_value}
                onChange={handleInputChange}
                placeholder="Ex: 100.00"
                min="1"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Início
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Fim
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tipo de Criativo */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-purple-600">🎨</span>
            <h3 className="text-lg font-semibold text-gray-800">Tipo de Criativo</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Escolha entre criar novo anúncio ou usar publicação existente</p>
          
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => handleCreativeTypeChange('new')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                formData.creative_type === 'new'
                  ? 'border-purple-500 bg-purple-100 text-purple-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
              }`}
            >
              <span className="text-2xl mb-2 block">✨</span>
              <span className="font-medium">Criar Novo Anúncio</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleCreativeTypeChange('existing')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                formData.creative_type === 'existing'
                  ? 'border-purple-500 bg-purple-100 text-purple-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
              }`}
            >
              <span className="text-2xl mb-2 block">📱</span>
              <span className="font-medium">Usar Publicação Existente</span>
            </button>
          </div>

          {/* Publicações Existentes */}
          {formData.creative_type === 'existing' && (
            <div>
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">Filtrar por Plataforma</h4>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      platforms: { facebook: true, instagram: true } 
                    }))}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      formData.platforms.facebook && formData.platforms.instagram
                        ? 'border-blue-500 bg-blue-100 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <span className="mr-2">🌐</span>
                    Todas
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      platforms: { facebook: true, instagram: false } 
                    }))}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      formData.platforms.facebook && !formData.platforms.instagram
                        ? 'border-blue-500 bg-blue-100 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <span className="mr-2">📘</span>
                    Facebook
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      platforms: { facebook: false, instagram: true } 
                    }))}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      !formData.platforms.facebook && formData.platforms.instagram
                        ? 'border-pink-500 bg-pink-100 text-pink-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-pink-300'
                    }`}
                  >
                    <span className="mr-2">📸</span>
                    Instagram
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => formData.page_id && fetchExistingPosts(formData.page_id)}
                disabled={!formData.page_id || loadingPosts}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <span className="mr-2">🔄</span>
                Recarregar Publicações
              </button>

              {!formData.page_id ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <span className="mr-2">⚠️</span>
                    <span>Selecione uma página primeiro para ver as publicações</span>
                  </div>
                </div>
              ) : loadingPosts ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="mt-2 text-gray-600">Carregando publicações...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <span className="mr-2">⚠️</span>
                    <span>Nenhuma publicação encontrada para esta página</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4 text-sm text-gray-600">
                    <span className="font-medium">{filteredPosts.length} publicação(ões) encontrada(s)</span>
                    {existingPosts.some(post => post.id.includes('example')) && (
                      <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                        Dados de Exemplo
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredPosts.map(post => {
                      const engagement = formatEngagement(post.engagement);
                      const isSelected = selectedPost?.id === post.id;
                      
                      return (
                        <div
                          key={post.id}
                          onClick={() => handlePostSelect(post)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg ${
                                post.platform === 'facebook' ? 'text-blue-600' : 'text-pink-600'
                              }`}>
                                {post.platform === 'facebook' ? '📘' : '📸'}
                              </span>
                              <span className="font-medium text-gray-800 capitalize">
                                {post.platform}
                              </span>
                              {isSelected && (
                                <span className="text-purple-600">✓</span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(post.created_time)}
                            </span>
                          </div>
                          
                          {post.full_picture && (
                            <div className="mb-3">
                              <img
                                src={post.full_picture}
                                alt="Post"
                                className="w-full h-32 object-cover rounded"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          <p className="text-gray-700 mb-3 line-clamp-3">
                            {post.message || 'Sem texto na publicação'}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <span>👍</span>
                              <span>{engagement.likes}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span>💬</span>
                              <span>{engagement.comments}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span>🔄</span>
                              <span>{engagement.shares}</span>
                            </span>
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

        {/* Público-Alvo */}
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-green-600">👥</span>
            <h3 className="text-lg font-semibold text-gray-800">Público-Alvo</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Configure o público-alvo ou use IA para gerar automaticamente</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idade Mínima
              </label>
              <input
                type="number"
                name="min_age"
                value={formData.min_age}
                onChange={handleInputChange}
                min="18"
                max="65"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idade Máxima
              </label>
              <input
                type="number"
                name="max_age"
                value={formData.max_age}
                onChange={handleInputChange}
                min="18"
                max="65"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gênero
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Todos</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <span className="mr-2">🚀</span>
              Gerar com IA
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdGeneration;

