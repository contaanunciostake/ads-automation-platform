import React, { useState, useEffect } from 'react'

const AdGeneration = ({ selectedBM }) => {
  const API_BASE_URL = 'https://ads-automation-backend-otpl.onrender.com/api'
  
  // Estados principais
  const [formData, setFormData] = useState({
    page_id: '',
    product_name: '',
    product_description: '',
    platforms: [],
    audience: {
      age_min: 18,
      age_max: 65,
      gender: 'all',
      interests: [],
      behaviors: [],
      custom_audiences: []
    },
    budget_type: 'daily',
    budget_amount: '',
    start_date: '',
    end_date: '',
    creative_type: 'image',
    placements: [],
    locations: []
  })

  // Estados para upload de imagens - SIMPLIFICADO
  const [uploadedImages, setUploadedImages] = useState([])
  const [isProcessingImages, setIsProcessingImages] = useState(false)

  // Estados para páginas
  const [pages, setPages] = useState([])
  const [isLoadingPages, setIsLoadingPages] = useState(false)

  // Estados para geração de anúncio
  const [isGeneratingAd, setIsGeneratingAd] = useState(false)
  const [adGenerationResult, setAdGenerationResult] = useState(null)
  const [adGenerationError, setAdGenerationError] = useState(null)

  // Estados para público-alvo
  const [isGeneratingAudience, setIsGeneratingAudience] = useState(false)

  // Estados para localização
  const [citySearch, setCitySearch] = useState('')
  const [cityResults, setCityResults] = useState([])
  const [isSearchingCities, setIsSearchingCities] = useState(false)
  const [selectedCities, setSelectedCities] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: -23.5505, lng: -46.6333 }) // São Paulo
  const [mapRadius, setMapRadius] = useState(10)

  // Estados para publicações existentes
  const [creativeType, setCreativeType] = useState('new') // 'new' ou 'existing'
  const [existingPosts, setExistingPosts] = useState([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [postPlatformFilter, setPostPlatformFilter] = useState('all') // 'all', 'facebook', 'instagram'

  // Posicionamentos disponíveis
  const availablePlacements = [
    // Facebook
    { 
      value: 'facebook_feed', 
      label: 'Feed do Facebook', 
      platform: 'facebook', 
      description: 'Anúncios no feed principal', 
      category: 'Feeds',
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
      recommended: '1080x1080 (1:1)'
    },
    { 
      value: 'facebook_stories', 
      label: 'Stories do Facebook', 
      platform: 'facebook', 
      description: 'Anúncios em stories (9:16)', 
      category: 'Stories & Reels',
      aspectRatio: '9:16',
      width: 1080,
      height: 1920,
      recommended: '1080x1920 (9:16)'
    },
    { 
      value: 'reels', 
      label: 'Reels do Facebook', 
      platform: 'facebook', 
      description: 'Anúncios em reels (9:16)', 
      category: 'Stories & Reels',
      aspectRatio: '9:16',
      width: 1080,
      height: 1920,
      recommended: '1080x1920 (9:16)'
    },
    { 
      value: 'right_column', 
      label: 'Coluna Direita', 
      platform: 'facebook', 
      description: 'Anúncios na lateral direita', 
      category: 'Feeds',
      aspectRatio: '1.91:1',
      width: 1200,
      height: 628,
      recommended: '1200x628 (1.91:1)'
    },
    { 
      value: 'marketplace', 
      label: 'Marketplace', 
      platform: 'facebook', 
      description: 'Anúncios no Marketplace', 
      category: 'Feeds',
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
      recommended: '1080x1080 (1:1)'
    },
    
    // Instagram
    { 
      value: 'instagram_feed', 
      label: 'Feed do Instagram', 
      platform: 'instagram', 
      description: 'Anúncios no feed do Instagram', 
      category: 'Feeds',
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
      recommended: '1080x1080 (1:1)'
    },
    { 
      value: 'instagram_stories', 
      label: 'Stories do Instagram', 
      platform: 'instagram', 
      description: 'Anúncios em stories do Instagram (9:16)', 
      category: 'Stories & Reels',
      aspectRatio: '9:16',
      width: 1080,
      height: 1920,
      recommended: '1080x1920 (9:16)'
    },
    { 
      value: 'instagram_reels', 
      label: 'Reels do Instagram', 
      platform: 'instagram', 
      description: 'Anúncios em reels do Instagram (9:16)', 
      category: 'Stories & Reels',
      aspectRatio: '9:16',
      width: 1080,
      height: 1920,
      recommended: '1080x1920 (9:16)'
    },
    { 
      value: 'instagram_explore', 
      label: 'Explorar do Instagram', 
      platform: 'instagram', 
      description: 'Anúncios na aba Explorar', 
      category: 'Feeds',
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
      recommended: '1080x1080 (1:1)'
    }
  ]

  // Tipos de criativo
  const creativeTypes = [
    { 
      value: 'image', 
      label: 'Imagem', 
      description: 'Anúncios com imagens estáticas',
      specs: {
        formats: ['JPG', 'PNG'],
        maxSize: '30MB',
        ratios: ['1:1 (Quadrado)', '4:5 (Vertical)', '1.91:1 (Paisagem)', '9:16 (Stories/Reels)'],
        recommended: 'Automático baseado nos posicionamentos'
      }
    },
    { 
      value: 'video', 
      label: 'Vídeo', 
      description: 'Anúncios com vídeos',
      specs: {
        formats: ['MP4', 'MOV', 'GIF'],
        maxSize: '4GB',
        ratios: ['1:1 (Quadrado)', '4:5 (Vertical)', '9:16 (Stories/Reels)'],
        recommended: 'Automático baseado nos posicionamentos',
        duration: '1 segundo a 241 minutos'
      }
    },
    { 
      value: 'carousel', 
      label: 'Carrossel', 
      description: 'Múltiplas imagens ou vídeos (2-10 cards)',
      specs: {
        formats: ['JPG', 'PNG', 'MP4', 'MOV'],
        maxSize: '30MB por imagem, 4GB por vídeo',
        ratios: ['1:1 (Quadrado)', '4:5 (Vertical)'],
        recommended: 'Automático baseado nos posicionamentos',
        cards: '2 a 10 cards'
      }
    }
  ]

  const budgetTypes = [
    { value: 'daily', label: 'Orçamento Diário', description: 'Valor gasto por dia' },
    { value: 'lifetime', label: 'Orçamento Vitalício', description: 'Valor total da campanha' }
  ]

  const genderOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Feminino' }
  ]

  // Função para buscar cidades
  const searchCities = async (query) => {
    if (query.length < 2) {
      setCityResults([])
      return
    }

    setIsSearchingCities(true)
    try {
      const response = await fetch(`${API_BASE_URL}/facebook/cities/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (data.success) {
        setCityResults(data.cities || [])
      } else {
        setCityResults([])
      }
    } catch (error) {
      console.error('Erro na busca de cidades:', error)
      setCityResults([])
    } finally {
      setIsSearchingCities(false)
    }
  }

  // Debounce para busca de cidades
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCities(citySearch)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [citySearch])

  // Função para adicionar cidade selecionada
  const addSelectedCity = (city) => {
    if (!selectedCities.find(c => c.name === city.name)) {
      const newCities = [...selectedCities, city]
      setSelectedCities(newCities)
      setFormData(prev => ({
        ...prev,
        locations: newCities.map(c => c.name)
      }))
      setCitySearch('')
      setCityResults([])
      
      // Centralizar mapa na cidade selecionada
      if (city.coordinates) {
        setMapCenter({
          lat: city.coordinates.lat,
          lng: city.coordinates.lng
        })
      }
    }
  }

  // Função para remover cidade selecionada
  const removeSelectedCity = (cityName) => {
    const newCities = selectedCities.filter(c => c.name !== cityName)
    setSelectedCities(newCities)
    setFormData(prev => ({
      ...prev,
      locations: newCities.map(c => c.name)
    }))
  }

  // Função para buscar páginas
  const fetchPages = async () => {
    console.log('🔍 DEBUG Frontend: Iniciando fetchPages...')
    setIsLoadingPages(true)
    try {
      const url = `${API_BASE_URL}/facebook/pages`
      console.log('🔍 DEBUG Frontend: URL da requisição:', url)
      
      const response = await fetch(url)
      console.log('🔍 DEBUG Frontend: Status da resposta:', response.status)
      
      const data = await response.json()
      console.log('🔍 DEBUG Frontend: Dados recebidos:', data)
      
      if (data.success) {
        const pages = data.data || []
        console.log('🔍 DEBUG Frontend: Páginas extraídas:', pages)
        console.log('🔍 DEBUG Frontend: Número de páginas:', pages.length)
        setPages(pages)
        
        if (pages.length > 0) {
          console.log('✅ DEBUG Frontend: Páginas carregadas com sucesso!')
          pages.forEach((page, index) => {
            console.log(`  ${index + 1}. ${page.name} (ID: ${page.id})`)
          })
        } else {
          console.log('⚠️ DEBUG Frontend: Array de páginas está vazio')
        }
      } else {
        console.log('❌ DEBUG Frontend: Resposta indica falha:', data.error || 'Erro desconhecido')
      }
    } catch (error) {
      console.error('💥 DEBUG Frontend: Erro na requisição:', error)
    } finally {
      setIsLoadingPages(false)
      console.log('🔍 DEBUG Frontend: fetchPages finalizado')
    }
  }

  // Função para buscar publicações existentes
  const fetchExistingPosts = async () => {
    if (!formData.page_id) {
      console.warn('⚠️ Página não selecionada')
      return
    }

    setIsLoadingPosts(true)
    setExistingPosts([]) // Limpar posts anteriores
    
    try {
      console.log('🔍 DEBUG: Buscando publicações existentes para página:', formData.page_id)
      
      // Buscar publicações do Facebook
      const facebookResponse = await fetch(`${API_BASE_URL}/facebook/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_id: formData.page_id,
          limit: 20
        })
      })
      
      let facebookPosts = []
      if (facebookResponse.ok) {
        const facebookData = await facebookResponse.json()
        facebookPosts = facebookData.posts || []
        console.log('📘 DEBUG: Posts do Facebook:', facebookPosts.length)
      } else {
        console.warn('⚠️ Erro ao buscar posts do Facebook:', facebookResponse.status)
      }
      
      // Buscar publicações do Instagram (se a página tem Instagram conectado)
      const instagramResponse = await fetch(`${API_BASE_URL}/facebook/instagram-posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_id: formData.page_id,
          limit: 20
        })
      })
      
      let instagramPosts = []
      if (instagramResponse.ok) {
        const instagramData = await instagramResponse.json()
        instagramPosts = instagramData.posts || []
        console.log('📷 DEBUG: Posts do Instagram:', instagramPosts.length)
      } else {
        console.warn('⚠️ Erro ao buscar posts do Instagram:', instagramResponse.status)
      }
      
      // Combinar e formatar posts
      const allPosts = [
        ...facebookPosts.map(post => ({
          ...post,
          platform: 'facebook',
          platform_name: 'Facebook',
          icon: '📘'
        })),
        ...instagramPosts.map(post => ({
          ...post,
          platform: 'instagram', 
          platform_name: 'Instagram',
          icon: '📷'
        }))
      ].sort((a, b) => new Date(b.created_time) - new Date(a.created_time)) // Mais recentes primeiro
      
      console.log('📊 DEBUG: Total de publicações encontradas:', allPosts.length)
      setExistingPosts(allPosts)
      
      if (allPosts.length === 0) {
        console.log('ℹ️ Nenhuma publicação encontrada para esta página')
      }
      
    } catch (error) {
      console.error('💥 DEBUG: Erro ao buscar publicações:', error)
      
      // Dados de exemplo para desenvolvimento/teste
      const mockPosts = [
        {
          id: 'fb_123456789',
          platform: 'facebook',
          platform_name: 'Facebook',
          icon: '📘',
          message: 'Confira nossa nova promoção! Descontos de até 50% em todos os produtos.',
          created_time: '2024-01-15T10:30:00Z',
          engagement: { likes: 45, comments: 12, shares: 8 },
          media: {
            type: 'image',
            url: 'https://via.placeholder.com/400x300/1877f2/white?text=Facebook+Post'
          }
        },
        {
          id: 'ig_987654321',
          platform: 'instagram',
          platform_name: 'Instagram', 
          icon: '📷',
          message: 'Momento especial capturado! ✨ #momentos #especiais',
          created_time: '2024-01-14T15:45:00Z',
          engagement: { likes: 128, comments: 23, shares: 15 },
          media: {
            type: 'image',
            url: 'https://via.placeholder.com/400x400/E4405F/white?text=Instagram+Post'
          }
        },
        {
          id: 'fb_555666777',
          platform: 'facebook',
          platform_name: 'Facebook',
          icon: '📘',
          message: 'Novidades chegando em breve! Fique ligado nas nossas redes sociais.',
          created_time: '2024-01-13T09:15:00Z',
          engagement: { likes: 67, comments: 8, shares: 12 },
          media: {
            type: 'video',
            url: 'https://via.placeholder.com/400x300/1877f2/white?text=Facebook+Video'
          }
        }
      ]
      
      console.log('🧪 DEBUG: Usando dados de exemplo devido ao erro')
      setExistingPosts(mockPosts)
      
    } finally {
      setIsLoadingPosts(false)
    }
  }

  // Função para filtrar posts por plataforma
  const getFilteredPosts = () => {
    if (postPlatformFilter === 'all') {
      return existingPosts
    }
    return existingPosts.filter(post => post.platform === postPlatformFilter)
  }

  // Função para gerar anúncio
  const generateAd = async () => {
    console.log('🚀 DEBUG: Iniciando geração de anúncio...')
    
    // Validações
    if (!formData.page_id) {
      alert('Selecione uma página primeiro')
      return
    }
    
    if (!formData.product_name.trim()) {
      alert('Preencha o nome do produto/serviço')
      return
    }
    
    if (!formData.product_description.trim()) {
      alert('Preencha a descrição do produto/serviço')
      return
    }
    
    if (formData.platforms.length === 0) {
      alert('Selecione pelo menos uma plataforma')
      return
    }

    // Validação específica para tipo de criativo
    if (creativeType === 'existing') {
      if (!selectedPost) {
        alert('Selecione uma publicação existente')
        return
      }
    } else {
      if (uploadedImages.length === 0) {
        alert('Faça upload de pelo menos uma imagem')
        return
      }
    }

    setIsGeneratingAd(true)
    setAdGenerationResult(null)
    setAdGenerationError(null)

    try {
      console.log('🚀 DEBUG: Preparando dados para envio...')
      
      const requestData = {
        ...formData,
        creative_type: creativeType,
        ...(creativeType === 'existing' ? {
          existing_post_id: selectedPost.id,
          existing_post_platform: selectedPost.platform
        } : {
          uploaded_images: uploadedImages.map(img => ({
            name: img.name,
            size: img.size
          }))
        })
      }
      
      console.log('🚀 DEBUG: Dados da requisição:', requestData)

      const response = await fetch(`${API_BASE_URL}/facebook/generate-ad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      console.log('🚀 DEBUG: Status da resposta:', response.status)
      
      const data = await response.json()
      console.log('🚀 DEBUG: Dados da resposta:', data)

      if (data.success) {
        setAdGenerationResult(data)
        console.log('✅ DEBUG: Anúncio gerado com sucesso!')
      } else {
        setAdGenerationError(data.message || 'Erro desconhecido')
        console.log('❌ DEBUG: Erro na geração:', data.message)
      }
    } catch (error) {
      console.error('💥 DEBUG: Erro na requisição:', error)
      setAdGenerationError(`Erro de conexão: ${error.message}`)
      alert(`Erro de conexão: ${error.message}`)
    } finally {
      setIsGeneratingAd(false)
      console.log('🚀 DEBUG: Geração de anúncio finalizada')
    }
  }

  // Função para gerar público-alvo com IA
  const generateAudienceWithAI = async () => {
    if (!formData.product_description.trim()) {
      alert('Preencha a descrição do produto primeiro')
      return
    }

    setIsGeneratingAudience(true)
    try {
      const response = await fetch(`${API_BASE_URL}/facebook/generate-audience`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_description: formData.product_description
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          audience: {
            ...prev.audience,
            ...data.audience
          }
        }))
        alert('Público-alvo gerado com sucesso!')
      } else {
        alert('Erro ao gerar público-alvo: ' + (data.message || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Erro ao gerar público-alvo:', error)
      alert('Erro ao gerar público-alvo: ' + error.message)
    } finally {
      setIsGeneratingAudience(false)
    }
  }

  // FUNÇÃO DE UPLOAD SIMPLIFICADA
  const handleFileUpload = (event) => {
    try {
      const files = Array.from(event.target.files)
      
      // Validações básicas
      if (!files || files.length === 0) {
        alert('Nenhum arquivo selecionado')
        return
      }

      // Validar tipos de arquivo
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'))
      if (invalidFiles.length > 0) {
        alert(`Arquivos inválidos detectados: ${invalidFiles.map(f => f.name).join(', ')}. Apenas imagens são aceitas.`)
        return
      }

      // Validar tamanho dos arquivos (30MB por arquivo)
      const maxSize = 30 * 1024 * 1024 // 30MB
      const oversizedFiles = files.filter(file => file.size > maxSize)
      if (oversizedFiles.length > 0) {
        alert(`Arquivos muito grandes: ${oversizedFiles.map(f => f.name).join(', ')}. Tamanho máximo: 30MB por arquivo.`)
        return
      }

      // Limitar número de arquivos para carrossel
      if (formData.creative_type === 'carousel' && files.length > 10) {
        alert('Máximo de 10 arquivos para carrossel')
        return
      }

      console.log(`Processando ${files.length} arquivo(s)`)
      
      // PROCESSAMENTO SIMPLIFICADO - apenas criar preview
      const processedFiles = files.map((file, index) => {
        const imageUrl = URL.createObjectURL(file)
        
        // Criar uma imagem para obter dimensões
        const img = new Image()
        img.onload = function() {
          console.log(`Imagem ${index + 1}: ${this.width}x${this.height}`)
        }
        img.src = imageUrl
        
        return {
          id: Date.now() + index,
          file: file,
          name: file.name,
          size: file.size,
          preview: imageUrl,
          originalDimensions: null, // Será preenchido quando a imagem carregar
          versions: [] // Versões redimensionadas serão criadas sob demanda
        }
      })

      setUploadedImages(processedFiles)
      
    } catch (error) {
      console.error('Erro no upload de arquivos:', error)
      alert('Erro ao processar arquivos: ' + error.message)
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    fetchPages()
  }, [])

  // ✅ CORREÇÃO: useEffect para buscar publicações quando página muda
  useEffect(() => {
    if (formData.page_id && creativeType === 'existing') {
      console.log('🔄 DEBUG: Página mudou, buscando publicações automaticamente...')
      fetchExistingPosts()
    }
  }, [formData.page_id, creativeType])

  // Funções auxiliares
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }))
  }

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  // Agrupar posicionamentos por categoria
  const groupedPlacements = availablePlacements.reduce((acc, placement) => {
    if (!acc[placement.category]) {
      acc[placement.category] = []
    }
    acc[placement.category].push(placement)
    return acc
  }, {})

  // Estilos CSS inline
  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    card: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    cardHeader: {
      marginBottom: '16px',
      borderBottom: '1px solid #f3f4f6',
      paddingBottom: '16px'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      margin: '0 0 8px 0',
      color: '#111827'
    },
    cardDescription: {
      fontSize: '14px',
      color: '#6b7280',
      margin: 0
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px'
    },
    gridCols2: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px'
    },
    gridCols3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px'
    },
    gridCols4: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '8px',
      color: '#374151'
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white',
      boxSizing: 'border-box'
    },
    button: {
      padding: '8px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    buttonSecondary: {
      padding: '8px 16px',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    buttonSuccess: {
      padding: '8px 16px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    buttonDanger: {
      padding: '8px 16px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    buttonLarge: {
      width: '100%',
      padding: '12px 24px',
      background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    toggleButton: {
      padding: '12px 24px',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    toggleButtonActive: {
      backgroundColor: '#dbeafe',
      color: '#1d4ed8',
      borderColor: '#3b82f6'
    },
    metricCard: {
      textAlign: 'center',
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: '#f8fafc'
    },
    metricValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '8px 0'
    },
    metricLabel: {
      fontSize: '12px',
      color: '#6b7280'
    },
    checkbox: {
      marginRight: '8px'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      marginBottom: '8px',
      cursor: 'pointer'
    },
    badge: {
      display: 'inline-block',
      padding: '4px 8px',
      backgroundColor: '#e5e7eb',
      color: '#374151',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      marginRight: '8px'
    },
    uploadArea: {
      border: '2px dashed #d1d5db',
      borderRadius: '8px',
      padding: '32px',
      textAlign: 'center',
      backgroundColor: '#f9fafb'
    },
    imagePreview: {
      width: '96px',
      height: '96px',
      objectFit: 'cover',
      borderRadius: '8px'
    },
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '12px'
    },
    postGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '16px'
    },
    postCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    postCardSelected: {
      borderColor: '#3b82f6',
      backgroundColor: '#dbeafe'
    },
    postImage: {
      width: '100%',
      height: '150px',
      objectFit: 'cover',
      borderRadius: '6px',
      marginBottom: '12px'
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      color: '#6b7280'
    },
    error: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      color: '#dc2626'
    },
    success: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      color: '#059669',
      backgroundColor: '#d1fae5',
      borderRadius: '8px',
      marginTop: '16px'
    },
    cityTag: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 8px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      fontSize: '12px',
      margin: '4px'
    },
    cityTagClose: {
      marginLeft: '4px',
      cursor: 'pointer',
      color: '#6b7280'
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      maxHeight: '200px',
      overflowY: 'auto',
      zIndex: 10
    },
    dropdownItem: {
      padding: '12px',
      cursor: 'pointer',
      borderBottom: '1px solid #f3f4f6'
    }
  }

  return (
    <div style={styles.container}>
      {/* Formulário Principal */}
      <div style={styles.grid}>
        {/* Coluna Esquerda */}
        <div>
          {/* Informações Básicas */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>ℹ️ Informações Básicas</h3>
              <p style={styles.cardDescription}>
                Configure as informações principais da campanha
              </p>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Página da Business Manager</label>
              <select 
                style={styles.select}
                value={formData.page_id} 
                onChange={(e) => handleInputChange('page_id', e.target.value)}
              >
                <option value="">{isLoadingPages ? "Carregando páginas..." : "Selecione uma página"}</option>
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name} - {page.category}
                  </option>
                ))}
              </select>
              
              {/* Botão de teste para forçar páginas */}
              <button
                style={{...styles.buttonDanger, marginTop: '8px'}}
                onClick={() => {
                  console.log('🧪 TESTE: Forçando páginas de exemplo')
                  const testPages = [
                    { id: 'page_123', name: 'Cergrand', category: 'Empresa Local' },
                    { id: 'page_456', name: 'Arts Das Massas', category: 'Restaurante' },
                    { id: 'page_789', name: 'Monte Castello Casa de Carne e Mercearia', category: 'Empresa Local' }
                  ]
                  setPages(testPages)
                  console.log('✅ TESTE: Páginas de exemplo carregadas')
                }}
              >
                🧪 TESTE: Forçar Páginas
              </button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nome do Produto/Serviço</label>
              <input
                style={styles.input}
                type="text"
                value={formData.product_name}
                onChange={(e) => handleInputChange('product_name', e.target.value)}
                placeholder="Ex: Smartphone Galaxy S24"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Descrição do Produto/Serviço</label>
              <textarea
                style={styles.textarea}
                value={formData.product_description}
                onChange={(e) => handleInputChange('product_description', e.target.value)}
                placeholder="Descreva detalhadamente seu produto ou serviço..."
                rows={4}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Plataformas</label>
              <div style={{display: 'flex', gap: '16px'}}>
                <label style={{display: 'flex', alignItems: 'center'}}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={formData.platforms.includes('facebook')}
                    onChange={() => handleArrayToggle('platforms', 'facebook')}
                  />
                  📘 Facebook
                </label>
                <label style={{display: 'flex', alignItems: 'center'}}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={formData.platforms.includes('instagram')}
                    onChange={() => handleArrayToggle('platforms', 'instagram')}
                  />
                  📷 Instagram
                </label>
              </div>
            </div>
          </div>

          {/* Público-Alvo */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <h3 style={styles.cardTitle}>👥 Público-Alvo</h3>
                  <p style={styles.cardDescription}>
                    Configure o público-alvo ou use IA para gerar automaticamente
                  </p>
                </div>
                <button
                  style={{...styles.button, background: 'linear-gradient(to right, #8b5cf6, #ec4899)'}}
                  onClick={generateAudienceWithAI}
                  disabled={!formData.product_description.trim() || isGeneratingAudience}
                >
                  {isGeneratingAudience ? '⏳' : '⚡'} Gerar com IA
                </button>
              </div>
            </div>
            
            <div style={styles.gridCols2}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Idade Mínima</label>
                <input
                  style={styles.input}
                  type="number"
                  min="13"
                  max="65"
                  value={formData.audience.age_min}
                  onChange={(e) => handleNestedInputChange('audience', 'age_min', parseInt(e.target.value))}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Idade Máxima</label>
                <input
                  style={styles.input}
                  type="number"
                  min="13"
                  max="65"
                  value={formData.audience.age_max}
                  onChange={(e) => handleNestedInputChange('audience', 'age_max', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Gênero</label>
              <select 
                style={styles.select}
                value={formData.audience.gender} 
                onChange={(e) => handleNestedInputChange('audience', 'gender', e.target.value)}
              >
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Interesses</label>
              <textarea
                style={styles.textarea}
                value={formData.audience.interests.join(', ')}
                onChange={(e) => handleNestedInputChange('audience', 'interests', e.target.value.split(', ').filter(i => i.trim()))}
                placeholder="Ex: tecnologia, smartphones, eletrônicos"
                rows={2}
              />
            </div>
          </div>

          {/* Localização */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>📍 Localização</h3>
              <p style={styles.cardDescription}>
                Configure a localização geográfica do público-alvo
              </p>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Buscar Cidades</label>
              <div style={{position: 'relative'}}>
                <input
                  style={styles.input}
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Digite o nome da cidade..."
                />
                {isSearchingCities && (
                  <div style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)'}}>
                    ⏳
                  </div>
                )}

                {/* Dropdown de Resultados */}
                {cityResults.length > 0 && (
                  <div style={styles.dropdown}>
                    {cityResults.map((city, index) => (
                      <div
                        key={index}
                        style={styles.dropdownItem}
                        onClick={() => addSelectedCity(city)}
                      >
                        <div style={{fontWeight: '500'}}>{city.name}</div>
                        <div style={{fontSize: '12px', color: '#6b7280'}}>{city.state}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cidades Selecionadas */}
            {selectedCities.length > 0 && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Cidades Selecionadas</label>
                <div>
                  {selectedCities.map((city, index) => (
                    <span key={index} style={styles.cityTag}>
                      {city.name}
                      <span
                        style={styles.cityTagClose}
                        onClick={() => removeSelectedCity(city.name)}
                      >
                        ✕
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mapa Visual */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Mapa de Localização</label>
              <div style={{
                ...styles.metricCard, 
                padding: '24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{fontSize: '32px', marginBottom: '8px'}}>🗺️</div>
                <div style={{fontSize: '14px', marginBottom: '4px'}}>
                  Centro: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                </div>
                <div style={{fontSize: '14px', marginBottom: '8px'}}>
                  Raio: {mapRadius}km
                </div>
                <div style={{fontSize: '12px', opacity: 0.8}}>
                  {selectedCities.length} cidade(s) selecionada(s)
                </div>
                
                {/* Indicadores visuais das cidades */}
                {selectedCities.slice(0, 3).map((city, index) => (
                  <div key={index} style={{
                    position: 'absolute',
                    top: `${20 + index * 15}%`,
                    left: `${30 + index * 20}%`,
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#fbbf24',
                    borderRadius: '50%',
                    boxShadow: '0 0 10px rgba(251, 191, 36, 0.6)'
                  }} />
                ))}
              </div>
              
              <div style={{marginTop: '12px'}}>
                <label style={styles.label}>Raio de Alcance: {mapRadius}km</label>
                <input
                  style={styles.input}
                  type="range"
                  min="1"
                  max="100"
                  value={mapRadius}
                  onChange={(e) => setMapRadius(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita */}
        <div>
          {/* Orçamento */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>💰 Orçamento e Cronograma</h3>
              <p style={styles.cardDescription}>
                Configure o orçamento e período da campanha
              </p>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Tipo de Orçamento</label>
              <select 
                style={styles.select}
                value={formData.budget_type} 
                onChange={(e) => handleInputChange('budget_type', e.target.value)}
              >
                {budgetTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Valor do Orçamento (R$)</label>
              <input
                style={styles.input}
                type="number"
                min="1"
                step="0.01"
                value={formData.budget_amount}
                onChange={(e) => handleInputChange('budget_amount', e.target.value)}
                placeholder="Ex: 100.00"
              />
            </div>

            <div style={styles.gridCols2}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Data de Início</label>
                <input
                  style={styles.input}
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Data de Fim</label>
                <input
                  style={styles.input}
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tipo de Criativo */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>🎨 Tipo de Criativo</h3>
              <p style={styles.cardDescription}>
                Escolha entre criar novo anúncio ou usar publicação existente
              </p>
            </div>
            
            {/* Toggle entre Novo e Existente */}
            <div style={{...styles.gridCols2, marginBottom: '24px'}}>
              <button
                style={{
                  ...styles.toggleButton,
                  ...(creativeType === 'new' ? styles.toggleButtonActive : {})
                }}
                onClick={() => {
                  setCreativeType('new')
                  setSelectedPost(null)
                }}
              >
                ✨ Criar Novo Anúncio
              </button>
              <button
                style={{
                  ...styles.toggleButton,
                  ...(creativeType === 'existing' ? styles.toggleButtonActive : {})
                }}
                onClick={() => {
                  setCreativeType('existing')
                  if (formData.page_id && existingPosts.length === 0) {
                    fetchExistingPosts()
                  }
                }}
              >
                📱 Usar Publicação Existente
              </button>
            </div>

            {/* Conteúdo baseado no tipo selecionado */}
            {creativeType === 'existing' && (
              <div>
                {/* Filtros de Plataforma */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Filtrar por Plataforma</label>
                  <div style={styles.gridCols3}>
                    <button
                      style={{
                        ...styles.toggleButton,
                        ...(postPlatformFilter === 'all' ? styles.toggleButtonActive : {})
                      }}
                      onClick={() => setPostPlatformFilter('all')}
                    >
                      🌐 Todas
                    </button>
                    <button
                      style={{
                        ...styles.toggleButton,
                        ...(postPlatformFilter === 'facebook' ? styles.toggleButtonActive : {})
                      }}
                      onClick={() => setPostPlatformFilter('facebook')}
                    >
                      📘 Facebook
                    </button>
                    <button
                      style={{
                        ...styles.toggleButton,
                        ...(postPlatformFilter === 'instagram' ? styles.toggleButtonActive : {})
                      }}
                      onClick={() => setPostPlatformFilter('instagram')}
                    >
                      📷 Instagram
                    </button>
                  </div>
                </div>

                {/* Botão para recarregar publicações */}
                <div style={{marginBottom: '16px'}}>
                  <button
                    style={styles.buttonSecondary}
                    onClick={fetchExistingPosts}
                    disabled={isLoadingPosts || !formData.page_id}
                  >
                    {isLoadingPosts ? '⏳' : '🔄'} Recarregar Publicações
                  </button>
                </div>

                {/* Lista de Publicações */}
                {isLoadingPosts ? (
                  <div style={styles.loading}>
                    ⏳ Carregando publicações...
                  </div>
                ) : (
                  <>
                    {!isLoadingPosts && existingPosts.length === 0 && formData.page_id && (
                      <div style={{...styles.error, backgroundColor: '#fef3c7', color: '#92400e'}}>
                        ⚠️ Nenhuma publicação encontrada para esta página
                      </div>
                    )}
                    
                    {!formData.page_id && (
                      <div style={{...styles.error, backgroundColor: '#fef3c7', color: '#92400e'}}>
                        ⚠️ Selecione uma página primeiro
                      </div>
                    )}

                    {getFilteredPosts().length > 0 && (
                      <div>
                        <div style={{marginBottom: '16px'}}>
                          <span style={styles.badge}>
                            {getFilteredPosts().length} publicação(ões) encontrada(s)
                          </span>
                        </div>
                        
                        <div style={styles.postGrid}>
                          {getFilteredPosts().map((post) => (
                            <div
                              key={post.id}
                              style={{
                                ...styles.postCard,
                                ...(selectedPost?.id === post.id ? styles.postCardSelected : {})
                              }}
                              onClick={() => setSelectedPost(post)}
                            >
                              {/* Header do Post */}
                              <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
                                <span style={{fontSize: '20px', marginRight: '8px'}}>{post.icon}</span>
                                <div>
                                  <div style={{fontWeight: '500', fontSize: '14px'}}>{post.platform_name}</div>
                                  <div style={{fontSize: '12px', color: '#6b7280'}}>
                                    {new Date(post.created_time).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                              </div>

                              {/* Imagem do Post */}
                              {post.media && post.media.url && (
                                <img
                                  src={post.media.url}
                                  alt="Post"
                                  style={styles.postImage}
                                />
                              )}

                              {/* Texto do Post */}
                              <div style={{fontSize: '14px', marginBottom: '12px', lineHeight: '1.4'}}>
                                {post.message ? (
                                  post.message.length > 100 
                                    ? post.message.substring(0, 100) + '...'
                                    : post.message
                                ) : (
                                  <em style={{color: '#6b7280'}}>Sem texto</em>
                                )}
                              </div>

                              {/* Engajamento */}
                              {post.engagement && (
                                <div style={{display: 'flex', gap: '12px', fontSize: '12px', color: '#6b7280'}}>
                                  <span>👍 {post.engagement.likes || 0}</span>
                                  <span>💬 {post.engagement.comments || 0}</span>
                                  <span>🔄 {post.engagement.shares || 0}</span>
                                </div>
                              )}

                              {/* Indicador de Seleção */}
                              {selectedPost?.id === post.id && (
                                <div style={{
                                  position: 'absolute',
                                  top: '8px',
                                  right: '8px',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  borderRadius: '50%',
                                  width: '24px',
                                  height: '24px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px'
                                }}>
                                  ✓
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Tipos de criativo para novos anúncios */}
            {creativeType === 'new' && (
              <div>
                {creativeTypes.map((type) => (
                  <div
                    key={type.value}
                    style={{
                      ...styles.checkboxLabel,
                      backgroundColor: formData.creative_type === type.value ? '#dbeafe' : 'white',
                      borderColor: formData.creative_type === type.value ? '#3b82f6' : '#e5e7eb'
                    }}
                    onClick={() => handleInputChange('creative_type', type.value)}
                  >
                    <input
                      type="radio"
                      name="creative_type"
                      checked={formData.creative_type === type.value}
                      onChange={() => handleInputChange('creative_type', type.value)}
                      style={{marginRight: '12px'}}
                    />
                    <div>
                      <div style={{fontWeight: '500', marginBottom: '4px'}}>{type.label}</div>
                      <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '8px'}}>{type.description}</div>
                      <div style={{fontSize: '11px', color: '#9ca3af'}}>
                        <div>Formatos: {type.specs.formats.join(', ')}</div>
                        <div>Tamanho máx: {type.specs.maxSize}</div>
                        <div>Proporções: {type.specs.ratios.join(', ')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Posicionamentos */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>📱 Posicionamentos</h3>
              <p style={styles.cardDescription}>
                Selecione onde seus anúncios aparecerão
              </p>
            </div>
            
            {Object.entries(groupedPlacements).map(([category, placements]) => (
              <div key={category} style={{marginBottom: '16px'}}>
                <h4 style={{fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px'}}>
                  {category}
                </h4>
                {placements.map((placement) => (
                  <label
                    key={placement.value}
                    style={styles.checkboxLabel}
                  >
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={formData.placements.includes(placement.value)}
                      onChange={() => handleArrayToggle('placements', placement.value)}
                    />
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}>
                        <span style={{fontWeight: '500'}}>{placement.label}</span>
                        <span style={styles.badge}>{placement.recommended}</span>
                      </div>
                      <div style={{fontSize: '12px', color: '#6b7280'}}>{placement.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            ))}
          </div>

          {/* Upload de Imagens - apenas para novos anúncios */}
          {creativeType === 'new' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>📤 Upload de Imagens</h3>
                <p style={styles.cardDescription}>
                  Faça upload das suas imagens
                  {formData.placements.length === 0 && (
                    <div style={{display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: '#f59e0b'}}>
                      ⚠️ <span style={{fontSize: '12px'}}>Selecione posicionamentos primeiro!</span>
                    </div>
                  )}
                </p>
              </div>
              
              {/* Input de Upload */}
              <div style={styles.uploadArea}>
                <div style={{fontSize: '32px', marginBottom: '8px'}}>📤</div>
                <div style={{fontSize: '14px', color: '#6b7280', marginBottom: '12px'}}>
                  Clique para selecionar imagens ou arraste aqui
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{display: 'none'}}
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  style={{...styles.button, display: 'inline-flex'}}
                >
                  Selecionar Imagens
                </label>
                <div style={{fontSize: '12px', color: '#9ca3af', marginTop: '8px'}}>
                  JPG, PNG até 30MB cada
                </div>
              </div>

              {/* Preview das Imagens Carregadas */}
              {uploadedImages.length > 0 && (
                <div style={{marginTop: '24px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                    <h4 style={{fontSize: '16px', fontWeight: '500', margin: 0}}>Imagens Carregadas</h4>
                    <span style={styles.badge}>{uploadedImages.length} imagem(ns)</span>
                  </div>
                  
                  <div style={styles.imageGrid}>
                    {uploadedImages.map((image) => (
                      <div key={image.id} style={{border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px'}}>
                        <img
                          src={image.preview}
                          alt={image.name}
                          style={styles.imagePreview}
                        />
                        <div style={{fontSize: '12px', marginTop: '8px', fontWeight: '500'}}>{image.name}</div>
                        <div style={{fontSize: '11px', color: '#6b7280'}}>
                          {(image.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Botão de Gerar Anúncio */}
      <div style={styles.card}>
        <button 
          style={{
            ...styles.buttonLarge,
            backgroundColor: isGeneratingAd ? '#9ca3af' : undefined,
            cursor: isGeneratingAd ? 'not-allowed' : 'pointer'
          }}
          onClick={generateAd}
          disabled={isGeneratingAd}
        >
          {isGeneratingAd ? '⏳ Gerando Anúncio...' : '⚡ Gerar Anúncio'}
        </button>

        {/* Resultado da Geração */}
        {adGenerationResult && (
          <div style={styles.success}>
            ✅ Anúncio gerado com sucesso! ID: {adGenerationResult.ad_id || 'N/A'}
          </div>
        )}

        {adGenerationError && (
          <div style={{...styles.error, backgroundColor: '#fee2e2'}}>
            ❌ Erro: {adGenerationError}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdGeneration

