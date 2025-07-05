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

  // Função para criar versão redimensionada sob demanda
  const createResizedVersion = async (imageData, targetFormat) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = function() {
        const placement = availablePlacements.find(p => p.aspectRatio === targetFormat)
        if (!placement) {
          reject(new Error('Formato não encontrado'))
          return
        }
        
        const targetWidth = placement.width
        const targetHeight = placement.height
        
        // Calcular dimensões mantendo proporção
        const sourceAspectRatio = this.width / this.height
        const targetAspectRatio = targetWidth / targetHeight
        
        let sourceX = 0, sourceY = 0, sourceWidth = this.width, sourceHeight = this.height
        
        if (sourceAspectRatio > targetAspectRatio) {
          sourceWidth = this.height * targetAspectRatio
          sourceX = (this.width - sourceWidth) / 2
        } else {
          sourceHeight = this.width / targetAspectRatio
          sourceY = (this.height - sourceHeight) / 2
        }
        
        canvas.width = targetWidth
        canvas.height = targetHeight
        
        ctx.drawImage(
          this,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, targetWidth, targetHeight
        )
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            resolve({
              format: targetFormat,
              width: targetWidth,
              height: targetHeight,
              blob: blob,
              url: url,
              placements: availablePlacements.filter(p => p.aspectRatio === targetFormat).map(p => p.label)
            })
          } else {
            reject(new Error('Falha ao gerar versão redimensionada'))
          }
        }, 'image/jpeg', 0.9)
      }
      
      img.onerror = () => reject(new Error('Erro ao carregar imagem'))
      img.src = imageData.preview
    })
  }

  // Função para gerar versões para posicionamentos selecionados
  const generateVersionsForPlacements = async (imageData) => {
    if (formData.placements.length === 0) {
      alert('Selecione posicionamentos primeiro')
      return
    }

    setIsProcessingImages(true)
    
    try {
      // Obter formatos únicos dos posicionamentos selecionados
      const selectedPlacements = availablePlacements.filter(p => formData.placements.includes(p.value))
      const uniqueFormats = [...new Set(selectedPlacements.map(p => p.aspectRatio))]
      
      const versions = []
      
      for (const format of uniqueFormats) {
        try {
          const version = await createResizedVersion(imageData, format)
          versions.push(version)
        } catch (error) {
          console.error(`Erro ao criar versão ${format}:`, error)
        }
      }
      
      // Atualizar a imagem com as versões geradas
      setUploadedImages(prev => prev.map(img => 
        img.id === imageData.id 
          ? { ...img, versions: versions }
          : img
      ))
      
    } catch (error) {
      console.error('Erro ao gerar versões:', error)
      alert('Erro ao gerar versões: ' + error.message)
    } finally {
      setIsProcessingImages(false)
    }
  }

  // Função para download de versão
  const downloadVersion = (version, imageName) => {
    const link = document.createElement('a')
    link.href = version.url
    link.download = `${imageName}_${version.format.replace(':', 'x')}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

    // Função para buscar cidades usando API do IBGE (mais precisa para Brasil)
  const searchCities = async (query) => {
    if (query.length < 2) {
      setCityResults([])
      return
    }

    setIsSearchingCities(true)
    try {
      console.log('🔍 DEBUG: Buscando cidades para:', query)
      
      // Primeira tentativa: API do IBGE (oficial do Brasil)
      const ibgeResponse = await fetch(
        'https://servicodados.ibge.gov.br/api/v1/localidades/municipios'
      )
      
      if (!ibgeResponse.ok) {
        throw new Error(`Erro na API do IBGE: ${ibgeResponse.status}`)
      }
      
      const ibgeData = await ibgeResponse.json()
      console.log('🔍 DEBUG: Dados do IBGE carregados:', ibgeData.length, 'municípios')
      
      // Filtrar municípios que contêm o termo de busca
      const filteredCities = ibgeData
        .filter(city => 
          city.nome.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8) // Limitar a 8 resultados
        .map(city => ({
          name: city.nome,
          state: city.microrregiao.mesorregiao.UF.sigla,
          state_name: city.microrregiao.mesorregiao.UF.nome,
          country: 'Brasil',
          ibge_code: city.id,
          coordinates: null, // Será preenchido depois se necessário
          full_name: `${city.nome}, ${city.microrregiao.mesorregiao.UF.sigla}`
        }))
      
      console.log('🔍 DEBUG: Cidades filtradas do IBGE:', filteredCities)
      
      // Se encontrou resultados no IBGE, tentar obter coordenadas do OpenStreetMap
      if (filteredCities.length > 0) {
        const citiesWithCoordinates = await Promise.all(
          filteredCities.map(async (city) => {
            try {
              // Buscar coordenadas no OpenStreetMap
              const osmQuery = `${city.name}, ${city.state}, Brasil`
              const osmResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(osmQuery)}&countrycodes=br&limit=1`,
                {
                  headers: {
                    'User-Agent': 'AdsAutomationPlatform/1.0'
                  }
                }
              )
              
              if (osmResponse.ok) {
                const osmData = await osmResponse.json()
                if (osmData.length > 0) {
                  city.coordinates = {
                    lat: parseFloat(osmData[0].lat),
                    lng: parseFloat(osmData[0].lon)
                  }
                }
              }
            } catch (error) {
              console.warn('⚠️ Não foi possível obter coordenadas para:', city.name)
            }
            
            // Se não conseguiu coordenadas, usar coordenadas aproximadas baseadas no estado
            if (!city.coordinates) {
              const stateCoordinates = {
                'AC': { lat: -9.0238, lng: -70.8120 },
                'AL': { lat: -9.5713, lng: -36.7820 },
                'AP': { lat: 1.4118, lng: -51.7739 },
                'AM': { lat: -3.4168, lng: -65.8561 },
                'BA': { lat: -12.5797, lng: -41.7007 },
                'CE': { lat: -5.4984, lng: -39.3206 },
                'DF': { lat: -15.7942, lng: -47.8822 },
                'ES': { lat: -19.1834, lng: -40.3089 },
                'GO': { lat: -15.827, lng: -49.8362 },
                'MA': { lat: -4.9609, lng: -45.2744 },
                'MT': { lat: -12.6819, lng: -56.9211 },
                'MS': { lat: -20.7722, lng: -54.7852 },
                'MG': { lat: -18.5122, lng: -44.5550 },
                'PA': { lat: -3.9014, lng: -52.4858 },
                'PB': { lat: -7.2399, lng: -36.7819 },
                'PR': { lat: -24.89, lng: -51.55 },
                'PE': { lat: -8.8137, lng: -36.9541 },
                'PI': { lat: -8.5735, lng: -42.7654 },
                'RJ': { lat: -22.9068, lng: -43.1729 },
                'RN': { lat: -5.4026, lng: -36.9541 },
                'RS': { lat: -30.0346, lng: -51.2177 },
                'RO': { lat: -11.5057, lng: -63.5806 },
                'RR': { lat: 2.7376, lng: -62.0751 },
                'SC': { lat: -27.2423, lng: -50.2189 },
                'SP': { lat: -23.5505, lng: -46.6333 },
                'SE': { lat: -10.5741, lng: -37.3857 },
                'TO': { lat: -10.1753, lng: -48.2982 }
              }
              
              city.coordinates = stateCoordinates[city.state] || { lat: -15.7942, lng: -47.8822 }
            }
            
            return city
          })
        )
        
        setCityResults(citiesWithCoordinates)
        
      } else {
        // Se não encontrou no IBGE, usar fallback com cidades principais
        console.log('🔍 DEBUG: Nenhuma cidade encontrada no IBGE, usando fallback')
        const fallbackCities = [
          { name: 'São Paulo', state: 'SP', coordinates: { lat: -23.5505, lng: -46.6333 } },
          { name: 'Rio de Janeiro', state: 'RJ', coordinates: { lat: -22.9068, lng: -43.1729 } },
          { name: 'Belo Horizonte', state: 'MG', coordinates: { lat: -19.9167, lng: -43.9345 } },
          { name: 'Salvador', state: 'BA', coordinates: { lat: -12.9714, lng: -38.5014 } },
          { name: 'Brasília', state: 'DF', coordinates: { lat: -15.7942, lng: -47.8822 } },
          { name: 'Fortaleza', state: 'CE', coordinates: { lat: -3.7319, lng: -38.5267 } },
          { name: 'Manaus', state: 'AM', coordinates: { lat: -3.1190, lng: -60.0217 } },
          { name: 'Curitiba', state: 'PR', coordinates: { lat: -25.4284, lng: -49.2733 } }
        ].filter(city => 
          city.name.toLowerCase().includes(query.toLowerCase()) ||
          city.state.toLowerCase().includes(query.toLowerCase())
        )
        
        setCityResults(fallbackCities)
      }
      
    } catch (error) {
      console.error('💥 DEBUG: Erro na busca de cidades:', error)
      
      // Fallback final com cidades principais
      const fallbackCities = [
        { name: 'São Paulo', state: 'SP', coordinates: { lat: -23.5505, lng: -46.6333 } },
        { name: 'Rio de Janeiro', state: 'RJ', coordinates: { lat: -22.9068, lng: -43.1729 } },
        { name: 'Belo Horizonte', state: 'MG', coordinates: { lat: -19.9167, lng: -43.9345 } },
        { name: 'Salvador', state: 'BA', coordinates: { lat: -12.9714, lng: -38.5014 } },
        { name: 'Brasília', state: 'DF', coordinates: { lat: -15.7942, lng: -47.8822 } }
      ].filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.state.toLowerCase().includes(query.toLowerCase())
      )
      
      setCityResults(fallbackCities)
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

  // Função para gerar anúncio
  const generateAd = async () => {
    console.log('🚀 DEBUG: Iniciando geração de anúncio...')
    
    // Validações básicas
    if (!formData.page_id) {
      alert('Por favor, selecione uma página da Business Manager')
      return
    }
    
    if (!formData.product_name.trim()) {
      alert('Por favor, preencha o nome do produto/serviço')
      return
    }
    
    if (!formData.product_description.trim()) {
      alert('Por favor, preencha a descrição do produto/serviço')
      return
    }
    
    if (formData.platforms.length === 0) {
      alert('Por favor, selecione pelo menos uma plataforma')
      return
    }
    
    setIsGeneratingAd(true)
    setAdGenerationError(null)
    setAdGenerationResult(null)
    
    try {
      console.log('🚀 DEBUG: Dados do formulário:', formData)
      
      const response = await fetch(`${API_BASE_URL}/facebook/generate-ad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      console.log('🚀 DEBUG: Status da resposta:', response.status)
      
      const data = await response.json()
      console.log('🚀 DEBUG: Resposta da API:', data)
      
      if (data.success) {
        setAdGenerationResult(data)
        console.log('✅ DEBUG: Anúncio gerado com sucesso!')
        alert('Anúncio gerado com sucesso! Verifique o resultado abaixo.')
      } else {
        setAdGenerationError(data.error || 'Erro desconhecido')
        console.log('❌ DEBUG: Erro na geração:', data.error)
        alert(`Erro na geração do anúncio: ${data.error || 'Erro desconhecido'}`)
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

  // Função para buscar publicações existentes
  const fetchExistingPosts = async () => {
    if (!selectedBM || !formData.page_id) {
      console.warn('⚠️ Business Manager ou página não selecionada')
      return
    }

    setIsLoadingPosts(true)
    try {
      console.log('🔍 DEBUG: Buscando publicações existentes...')
      
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
      
      console.log('📊 DEBUG: Total de publicações:', allPosts.length)
      setExistingPosts(allPosts)
      
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
          message: 'Vídeo exclusivo mostrando nossos bastidores. Não perca!',
          created_time: '2024-01-13T09:15:00Z',
          engagement: { likes: 89, comments: 34, shares: 22 },
          media: {
            type: 'video',
            url: 'https://via.placeholder.com/400x300/1877f2/white?text=Facebook+Video'
          }
        }
      ]
      
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

  // Função para formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  const testPages = () => {
    console.log('🧪 TESTE: Forçando páginas de exemplo...')
    const testPagesData = [
      { id: '647746025290224', name: 'Cergrand', category: 'Empresa Local' },
      { id: '620850088063473', name: 'Arts Das Massas', category: 'Empresa Local' },
      { id: '274934483000591', name: 'Monte Castello Casa de Carne e Mercearia', category: 'Empresa Local' }
    ]
    setPages(testPagesData)
    console.log('🧪 TESTE: Páginas definidas:', testPagesData)
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

  // Carregar dados iniciais
  useEffect(() => {
    fetchPages()
  }, [])

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
    toggleButton: {
      padding: '12px 20px',
      border: '2px solid #e1e8ed',
      borderRadius: '8px',
      backgroundColor: 'white',
      color: '#666',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      flex: 1
    },
    
    toggleButtonActive: {
      borderColor: '#1da1f2',
      backgroundColor: '#1da1f2',
      color: 'white'
    },
    
    buttonLarge: {
      width: '100%',
      padding: '12px 24px',
      backgroundColor: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
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
    versionCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      padding: '12px',
      textAlign: 'center'
    },
    versionImage: {
      width: '100%',
      height: '64px',
      objectFit: 'cover',
      borderRadius: '4px',
      marginBottom: '8px'
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
              
              {/* Botão de teste temporário */}
              <button 
                onClick={testPages}
                style={{
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🧪 TESTE: Forçar Páginas
              </button>
              
              <select 
                style={styles.select}
                value={formData.page_id} 
                onChange={(e) => {
                  console.log('🔍 DEBUG: Página selecionada:', e.target.value)
                  handleInputChange('page_id', e.target.value)
                }}
              >
                <option value="">{isLoadingPages ? "Carregando páginas..." : "Selecione uma página"}</option>
                {(() => {
                  console.log('🔍 DEBUG: Renderizando dropdown com pages:', pages)
                  console.log('🔍 DEBUG: pages.length:', pages.length)
                  console.log('🔍 DEBUG: Array.isArray(pages):', Array.isArray(pages))
                  return pages.map((page, index) => {
                    console.log(`🔍 DEBUG: Renderizando página ${index}:`, page)
                    return (
                      <option key={page.id} value={page.id}>
                        {page.name} - {page.category}
                      </option>
                    )
                  })
                })()}
              </select>
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

                {/* Dropdown de Resultados Melhorado */}
                {cityResults.length > 0 && (
                  <div style={{
                    ...styles.dropdown,
                    maxHeight: '300px',
                    overflowY: 'auto',
                    border: '2px solid #2196f3',
                    borderRadius: '8px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }}>
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: '#f5f5f5',
                      borderBottom: '1px solid #e0e0e0',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#666'
                    }}>
                      🔍 {cityResults.length} cidade(s) encontrada(s)
                    </div>
                    {cityResults.map((city, index) => (
                      <div
                        key={index}
                        style={{
                          ...styles.dropdownItem,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          borderBottom: index < cityResults.length - 1 ? '1px solid #f0f0f0' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          ':hover': {
                            backgroundColor: '#e3f2fd'
                          }
                        }}
                        onClick={() => addSelectedCity(city)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#e3f2fd'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'white'
                        }}
                      >
                        <div style={{
                          fontSize: '18px',
                          flexShrink: 0
                        }}>
                          📍
                        </div>
                        <div style={{flex: 1}}>
                          <div style={{
                            fontWeight: '500',
                            fontSize: '14px',
                            color: '#333',
                            marginBottom: '2px'
                          }}>
                            {city.name}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#666'
                          }}>
                            {city.state} • {city.coordinates ? 
                              `${city.coordinates.lat.toFixed(4)}, ${city.coordinates.lng.toFixed(4)}` : 
                              'Coordenadas não disponíveis'
                            }
                          </div>
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#2196f3',
                          fontWeight: '500'
                        }}>
                          Selecionar →
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cidades Selecionadas Melhoradas */}
            {selectedCities.length > 0 && (
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  🏙️ Cidades Selecionadas ({selectedCities.length})
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  minHeight: '60px'
                }}>
                  {selectedCities.map((city, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '500',
                        boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>📍</span>
                      <span>{city.name}, {city.state}</span>
                      <button
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: 'white',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => removeSelectedCity(city.name)}
                        title={`Remover ${city.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {/* Botão para limpar todas */}
                  {selectedCities.length > 1 && (
                    <button
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => {
                        setSelectedCities([])
                        setFormData(prev => ({ ...prev, locations: [] }))
                        setMapCenter({ lat: -23.5505, lng: -46.6333 }) // Voltar para São Paulo
                      }}
                    >
                      🗑️ Limpar Todas
                    </button>
                  )}
                </div>
                
                {/* Estatísticas */}
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#666',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>
                    📊 Alcance estimado: {selectedCities.length * mapRadius * 1000} pessoas
                  </span>
                  <span>
                    🎯 Raio total: {mapRadius}km por cidade
                  </span>
                </div>
              </div>
            )}

            {/* Mapa Interativo */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Mapa de Localização</label>
              <div style={{
                ...styles.metricCard, 
                padding: '0',
                height: '300px',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                border: '2px solid #2196f3'
              }}>
                {/* Mapa Base */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    radial-gradient(circle at 30% 20%, rgba(33, 150, 243, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 70% 80%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
                    linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)
                  `,
                  backgroundSize: '100px 100px, 150px 150px, 100% 100%'
                }}>
                  {/* Grid do mapa */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
                      linear-gradient(rgba(33, 150, 243, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(33, 150, 243, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }} />
                </div>
                
                {/* Marcador Central */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '32px',
                  filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                  animation: 'pulse 2s infinite'
                }}>
                  📍
                </div>
                
                {/* Círculo de Raio */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: `${Math.min(mapRadius * 4, 200)}px`,
                  height: `${Math.min(mapRadius * 4, 200)}px`,
                  border: '3px solid #2196f3',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  animation: 'pulse-ring 3s infinite'
                }} />
                
                {/* Cidades Selecionadas */}
                {selectedCities.map((city, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      top: `${20 + (index * 15)}%`,
                      left: `${20 + (index * 20)}%`,
                      fontSize: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      border: '1px solid #2196f3',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#1976d2',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    📍 {city.name}
                  </div>
                ))}
                
                {/* Informações do Mapa */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  fontSize: '12px'
                }}>
                  <div style={{fontWeight: '500', marginBottom: '4px'}}>
                    📍 Centro: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                  </div>
                  <div style={{color: '#666'}}>
                    🎯 Raio de alcance: {mapRadius}km | 
                    🏙️ Cidades: {selectedCities.length}
                  </div>
                </div>
              </div>
              
              <div style={{marginTop: '12px'}}>
                <label style={styles.label}>Raio de Alcance: {mapRadius}km</label>
                <input
                  style={{
                    ...styles.input,
                    background: 'linear-gradient(to right, #2196f3, #21cbf3)',
                    height: '8px',
                    borderRadius: '4px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  type="range"
                  min="1"
                  max="100"
                  value={mapRadius}
                  onChange={(e) => setMapRadius(parseInt(e.target.value))}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  <span>1km</span>
                  <span>50km</span>
                  <span>100km</span>
                </div>
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

          {/* Seleção de Tipo de Criativo */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          🎨 Tipo de Criativo
        </h3>
        <p style={styles.cardDescription}>
          Escolha como criar seu anúncio
        </p>
        
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
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
        
        {creativeType === 'existing' && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Filtrar por:</span>
              
              <select
                value={postPlatformFilter}
                onChange={(e) => setPostPlatformFilter(e.target.value)}
                style={styles.select}
              >
                <option value="all">📱 Todas as Plataformas</option>
                <option value="facebook">📘 Facebook</option>
                <option value="instagram">📷 Instagram</option>
              </select>
              
              <button
                onClick={fetchExistingPosts}
                disabled={isLoadingPosts || !formData.page_id}
                style={{
                  ...styles.button,
                  backgroundColor: isLoadingPosts ? '#ccc' : '#4267B2',
                  cursor: isLoadingPosts || !formData.page_id ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoadingPosts ? '🔄 Carregando...' : '🔄 Atualizar'}
              </button>
            </div>
            
            {!formData.page_id && (
              <div style={{
                padding: '15px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '8px',
                color: '#856404'
              }}>
                ⚠️ Selecione uma página primeiro para carregar as publicações
              </div>
            )}
            
            {isLoadingPosts && (
              <div style={{
                padding: '30px',
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
                Carregando publicações...
              </div>
            )}
            
            {!isLoadingPosts && existingPosts.length === 0 && formData.page_id && (
              <div style={{
                padding: '30px',
                textAlign: 'center',
                color: '#666',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '2px dashed #dee2e6'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
                <h4 style={{ margin: '0 0 10px 0' }}>Nenhuma publicação encontrada</h4>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Não foram encontradas publicações para esta página.
                  <br />Verifique se a página tem posts públicos ou tente atualizar.
                </p>
              </div>
            )}
            
            {!isLoadingPosts && getFilteredPosts().length > 0 && (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '15px',
                  maxHeight: '500px',
                  overflowY: 'auto',
                  padding: '10px',
                  border: '1px solid #e1e8ed',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa'
                }}>
                  {getFilteredPosts().map((post) => (
                    <div
                      key={post.id}
                      style={{
                        border: selectedPost?.id === post.id ? '2px solid #1da1f2' : '1px solid #e1e8ed',
                        borderRadius: '12px',
                        padding: '15px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: selectedPost?.id === post.id ? '0 4px 12px rgba(29, 161, 242, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      onClick={() => setSelectedPost(post)}
                    >
                      {/* Header do Post */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px' }}>{post.icon}</span>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: post.platform === 'facebook' ? '#1877f2' : '#E4405F'
                          }}>
                            {post.platform_name}
                          </span>
                        </div>
                        
                        <span style={{
                          fontSize: '11px',
                          color: '#666',
                          backgroundColor: '#f0f0f0',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {formatDate(post.created_time)}
                        </span>
                      </div>
                      
                      {/* Mídia do Post */}
                      {post.media && (
                        <div style={{
                          marginBottom: '12px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#f0f0f0'
                        }}>
                          {post.media.type === 'image' ? (
                            <img
                              src={post.media.url}
                              alt="Post media"
                              style={{
                                width: '100%',
                                height: '150px',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '150px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#000',
                              color: 'white',
                              fontSize: '24px'
                            }}>
                              ▶️ Vídeo
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Texto do Post */}
                      <div style={{
                        fontSize: '13px',
                        lineHeight: '1.4',
                        color: '#333',
                        marginBottom: '12px',
                        maxHeight: '60px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {post.message || 'Sem texto'}
                      </div>
                      
                      {/* Engajamento */}
                      {post.engagement && (
                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          fontSize: '11px',
                          color: '#666'
                        }}>
                          <span>👍 {post.engagement.likes}</span>
                          <span>💬 {post.engagement.comments}</span>
                          <span>🔄 {post.engagement.shares}</span>
                        </div>
                      )}
                      
                      {/* Indicador de Seleção */}
                      {selectedPost?.id === post.id && (
                        <div style={{
                          marginTop: '10px',
                          padding: '8px',
                          backgroundColor: '#e3f2fd',
                          borderRadius: '6px',
                          textAlign: 'center',
                          fontSize: '12px',
                          color: '#1976d2',
                          fontWeight: 'bold'
                        }}>
                          ✅ Selecionado para anúncio
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div style={{
                  marginTop: '15px',
                  padding: '10px',
                  backgroundColor: '#e8f5e8',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#2e7d32'
                }}>
                  📊 {getFilteredPosts().length} publicação(ões) encontrada(s)
                  {selectedPost && ` • ${selectedPost.platform_name} selecionado`}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>🎨 Tipo de Criativo</h3>
              <p style={styles.cardDescription}>
                Escolha o formato do seu anúncio
              </p>
            </div>
            
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

          {/* Upload de Imagens - SIMPLIFICADO */}
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
                
                {uploadedImages.map((image, index) => (
                  <div key={image.id} style={{border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px'}}>
                    <div style={{display: 'flex', gap: '16px'}}>
                      {/* Preview da Imagem Original */}
                      <div style={{flexShrink: 0}}>
                        <img
                          src={image.preview}
                          alt={image.name}
                          style={styles.imagePreview}
                        />
                      </div>
                      
                      {/* Informações da Imagem */}
                      <div style={{flex: 1}}>
                        <div style={{fontWeight: '500', marginBottom: '4px'}}>{image.name}</div>
                        <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '12px'}}>
                          Tamanho: {(image.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                        
                        {/* Botão para Gerar Versões */}
                        {formData.placements.length > 0 && (
                          <button
                            style={styles.buttonSuccess}
                            onClick={() => generateVersionsForPlacements(image)}
                            disabled={isProcessingImages}
                          >
                            {isProcessingImages ? '⏳' : '🔄'} Gerar Versões
                          </button>
                        )}
                        
                        {/* Versões Geradas */}
                        {image.versions.length > 0 && (
                          <div style={{marginTop: '16px'}}>
                            <div style={{fontSize: '14px', fontWeight: '500', marginBottom: '8px'}}>Versões Geradas:</div>
                            <div style={styles.imageGrid}>
                              {image.versions.map((version, vIndex) => (
                                <div key={vIndex} style={styles.versionCard}>
                                  <img
                                    src={version.url}
                                    alt={`${version.format}`}
                                    style={styles.versionImage}
                                  />
                                  <div style={{fontSize: '11px', marginBottom: '8px'}}>
                                    <div style={{fontWeight: '500'}}>{version.format}</div>
                                    <div style={{color: '#6b7280'}}>
                                      {version.width}x{version.height}
                                    </div>
                                    <div style={{color: '#6b7280'}}>
                                      Para: {version.placements.join(', ')}
                                    </div>
                                  </div>
                                  <button
                                    style={{...styles.buttonSecondary, width: '100%', fontSize: '11px', padding: '6px 8px'}}
                                    onClick={() => downloadVersion(version, image.name)}
                                  >
                                    💾 Download
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botão de Gerar Anúncio */}
      <div style={styles.card}>
        <button 
          style={{
            ...styles.buttonLarge,
            backgroundColor: isGeneratingAd ? '#6b7280' : '#3b82f6',
            cursor: isGeneratingAd ? 'not-allowed' : 'pointer',
            opacity: isGeneratingAd ? 0.7 : 1
          }}
          onClick={generateAd}
          disabled={isGeneratingAd}
        >
          {isGeneratingAd ? '⏳ Gerando Anúncio...' : '⚡ Gerar Anúncio'}
        </button>
        
        {/* Resultado da geração */}
        {adGenerationResult && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '8px'
          }}>
            <h3 style={{color: '#0ea5e9', marginBottom: '10px'}}>✅ Anúncio Gerado com Sucesso!</h3>
            <pre style={{
              backgroundColor: '#ffffff',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              {JSON.stringify(adGenerationResult, null, 2)}
            </pre>
          </div>
        )}
        
        {/* Erro na geração */}
        {adGenerationError && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#fef2f2',
            border: '1px solid #ef4444',
            borderRadius: '8px'
          }}>
            <h3 style={{color: '#ef4444', marginBottom: '10px'}}>❌ Erro na Geração</h3>
            <p style={{color: '#dc2626', fontSize: '14px'}}>
              {adGenerationError}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdGeneration

