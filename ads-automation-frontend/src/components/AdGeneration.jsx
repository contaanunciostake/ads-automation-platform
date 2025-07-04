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

  // Estados para público-alvo
  const [isGeneratingAudience, setIsGeneratingAudience] = useState(false)

  // Estados para localização
  const [citySearch, setCitySearch] = useState('')
  const [cityResults, setCityResults] = useState([])
  const [isSearchingCities, setIsSearchingCities] = useState(false)
  const [selectedCities, setSelectedCities] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: -23.5505, lng: -46.6333 }) // São Paulo
  const [mapRadius, setMapRadius] = useState(10)

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

  // Função de teste para forçar páginas (temporária para debug)
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

            {/* Mapa Simulado */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Mapa de Localização</label>
              <div style={{...styles.metricCard, padding: '24px'}}>
                <div style={{fontSize: '32px', marginBottom: '8px'}}>📍</div>
                <div style={{fontSize: '14px', color: '#6b7280'}}>
                  Centro: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                </div>
                <div style={{fontSize: '14px', color: '#6b7280'}}>
                  Raio: {mapRadius}km
                </div>
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
        <button style={styles.buttonLarge}>
          ⚡ Gerar Anúncio
        </button>
      </div>
    </div>
  )
}

export default AdGeneration

