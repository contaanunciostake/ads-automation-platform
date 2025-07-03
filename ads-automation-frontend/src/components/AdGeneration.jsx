import React, { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select'
import { Badge } from '../ui/badge'
import { 
  Image, 
  Video, 
  Copy, 
  Zap, 
  MapPin, 
  Search, 
  X, 
  Download,
  Resize,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  MousePointer,
  BarChart3
} from 'lucide-react'

const AdGeneration = () => {
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

  // Estados para dashboard
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false)
  const [dashboardError, setDashboardError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState('')

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
      icon: Image, 
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
      icon: Video, 
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
      icon: Copy, 
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
      const response = await fetch(`https://ads-automation-backend-otpl.onrender.com/api/facebook-data/cities/search?q=${encodeURIComponent(query)}`)
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

  // Função para buscar dados do dashboard
  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true)
    setDashboardError(null)

    try {
      const chartResponse = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook-data/chart-data?days=7')
      const chartResult = await chartResponse.json()

      const summaryResponse = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook-data/dashboard-summary')
      const summaryResult = await summaryResponse.json()

      if (chartResult.success && summaryResult.success) {
        const chartData = chartResult.data || []
        
        const totals = chartData.reduce((acc, day) => {
          acc.impressions += day.impressions || 0
          acc.clicks += day.clicks || 0
          acc.spend += day.spend || 0
          return acc
        }, { impressions: 0, clicks: 0, spend: 0 })

        const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
        const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0
        const cpm = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0

        const campaign_stats = summaryResult.data?.campaign_stats || {}
        
        const formattedData = {
          impressions: totals.impressions,
          clicks: totals.clicks,
          spent: totals.spend,
          active_campaigns: campaign_stats.active || 0,
          ctr: parseFloat(ctr.toFixed(2)),
          cpc: parseFloat(cpc.toFixed(2)),
          cpm: parseFloat(cpm.toFixed(2))
        }
        
        setDashboardData(formattedData)
        setLastUpdated(new Date().toLocaleString('pt-BR'))
      } else {
        setDashboardError('Erro ao carregar dados do dashboard')
      }
    } catch (error) {
      setDashboardError(`Erro na conexão: ${error.message}`)
    } finally {
      setIsLoadingDashboard(false)
    }
  }

  // Função para buscar páginas
  const fetchPages = async () => {
    setIsLoadingPages(true)
    try {
      const response = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook-data/pages')
      const data = await response.json()
      
      if (data.success) {
        setPages(data.pages || [])
      }
    } catch (error) {
      console.error('Erro ao buscar páginas:', error)
    } finally {
      setIsLoadingPages(false)
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
      const response = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook-data/generate-audience', {
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
    fetchDashboardData()
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

  const handleArrayInputChange = (field, value) => {
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

  return (
    <div className="space-y-6">
      {/* Dashboard de Métricas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Dashboard de Performance
          </CardTitle>
          <CardDescription>
            Métricas dos últimos 7 dias
            {lastUpdated && (
              <span className="text-xs text-muted-foreground ml-2">
                Atualizado: {lastUpdated}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDashboard ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Carregando métricas...
            </div>
          ) : dashboardError ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              {dashboardError}
            </div>
          ) : dashboardData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Eye className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData.impressions.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Impressões</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <MousePointer className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">
                  {dashboardData.clicks.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Cliques</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">
                  R$ {dashboardData.spent.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Gasto</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">
                  {dashboardData.active_campaigns}
                </div>
                <div className="text-sm text-gray-600">Campanhas Ativas</div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Formulário Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda */}
        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Configure as informações principais da campanha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Página da Business Manager */}
              <div className="space-y-2">
                <Label htmlFor="page_id">Página da Business Manager</Label>
                <Select 
                  value={formData.page_id} 
                  onValueChange={(value) => handleInputChange('page_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingPages ? "Carregando páginas..." : "Selecione uma página"} />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.name} - {page.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nome do Produto */}
              <div className="space-y-2">
                <Label htmlFor="product_name">Nome do Produto/Serviço</Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) => handleInputChange('product_name', e.target.value)}
                  placeholder="Ex: Smartphone Galaxy S24"
                />
              </div>

              {/* Descrição do Produto */}
              <div className="space-y-2">
                <Label htmlFor="product_description">Descrição do Produto/Serviço</Label>
                <Textarea
                  id="product_description"
                  value={formData.product_description}
                  onChange={(e) => handleInputChange('product_description', e.target.value)}
                  placeholder="Descreva detalhadamente seu produto ou serviço..."
                  rows={4}
                />
              </div>

              {/* Plataformas */}
              <div className="space-y-2">
                <Label>Plataformas</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.platforms.includes('facebook')}
                      onChange={() => handleArrayToggle('platforms', 'facebook')}
                    />
                    <span>📘 Facebook</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.platforms.includes('instagram')}
                      onChange={() => handleArrayToggle('platforms', 'instagram')}
                    />
                    <span>📷 Instagram</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Público-Alvo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Público-Alvo
                </span>
                <Button
                  onClick={generateAudienceWithAI}
                  disabled={!formData.product_description.trim() || isGeneratingAudience}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isGeneratingAudience ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Gerar com IA
                </Button>
              </CardTitle>
              <CardDescription>
                Configure o público-alvo ou use IA para gerar automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Idade */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age_min">Idade Mínima</Label>
                  <Input
                    id="age_min"
                    type="number"
                    min="13"
                    max="65"
                    value={formData.audience.age_min}
                    onChange={(e) => handleNestedInputChange('audience', 'age_min', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age_max">Idade Máxima</Label>
                  <Input
                    id="age_max"
                    type="number"
                    min="13"
                    max="65"
                    value={formData.audience.age_max}
                    onChange={(e) => handleNestedInputChange('audience', 'age_max', parseInt(e.target.value))}
                  />
                </div>
              </div>

              {/* Gênero */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gênero</Label>
                <Select 
                  value={formData.audience.gender} 
                  onValueChange={(value) => handleNestedInputChange('audience', 'gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Interesses */}
              <div className="space-y-2">
                <Label htmlFor="interests">Interesses</Label>
                <Textarea
                  id="interests"
                  value={formData.audience.interests.join(', ')}
                  onChange={(e) => handleNestedInputChange('audience', 'interests', e.target.value.split(', ').filter(i => i.trim()))}
                  placeholder="Ex: tecnologia, smartphones, eletrônicos"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Localização */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localização
              </CardTitle>
              <CardDescription>
                Configure a localização geográfica do público-alvo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Busca de Cidades */}
              <div className="space-y-2">
                <Label htmlFor="city_search">Buscar Cidades</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="city_search"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Digite o nome da cidade..."
                    className="pl-10"
                  />
                  {isSearchingCities && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>

                {/* Dropdown de Resultados */}
                {cityResults.length > 0 && (
                  <div className="border rounded-md bg-white shadow-lg max-h-48 overflow-y-auto">
                    {cityResults.map((city, index) => (
                      <button
                        key={index}
                        onClick={() => addSelectedCity(city)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                      >
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm text-gray-500">{city.state}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cidades Selecionadas */}
              {selectedCities.length > 0 && (
                <div className="space-y-2">
                  <Label>Cidades Selecionadas</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCities.map((city, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {city.name}
                        <button
                          onClick={() => removeSelectedCity(city.name)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Mapa Simulado */}
              <div className="space-y-2">
                <Label>Mapa de Localização</Label>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-sm text-gray-600">
                    Centro: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Raio: {mapRadius}km
                  </div>
                </div>
                
                {/* Controle de Raio */}
                <div className="space-y-2">
                  <Label htmlFor="radius">Raio de Alcance (km)</Label>
                  <Input
                    id="radius"
                    type="range"
                    min="1"
                    max="100"
                    value={mapRadius}
                    onChange={(e) => setMapRadius(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 text-center">
                    {mapRadius} km
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita */}
        <div className="space-y-6">
          {/* Orçamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Orçamento e Cronograma
              </CardTitle>
              <CardDescription>
                Configure o orçamento e período da campanha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo de Orçamento */}
              <div className="space-y-2">
                <Label htmlFor="budget_type">Tipo de Orçamento</Label>
                <Select 
                  value={formData.budget_type} 
                  onValueChange={(value) => handleInputChange('budget_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de orçamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Valor do Orçamento */}
              <div className="space-y-2">
                <Label htmlFor="budget_amount">
                  Valor do Orçamento (R$)
                </Label>
                <Input
                  id="budget_amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.budget_amount}
                  onChange={(e) => handleInputChange('budget_amount', e.target.value)}
                  placeholder="Ex: 100.00"
                />
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Data de Início</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Data de Fim</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tipo de Criativo */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Criativo</CardTitle>
              <CardDescription>
                Escolha o formato do seu anúncio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {creativeTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      formData.creative_type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInputChange('creative_type', type.value)}
                  >
                    <div className="flex items-start gap-3">
                      <type.icon className="h-5 w-5 mt-1 text-blue-500" />
                      <div className="flex-1">
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-600 mb-2">{type.description}</div>
                        <div className="text-xs text-gray-500">
                          <div>Formatos: {type.specs.formats.join(', ')}</div>
                          <div>Tamanho máx: {type.specs.maxSize}</div>
                          <div>Proporções: {type.specs.ratios.join(', ')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Posicionamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Posicionamentos</CardTitle>
              <CardDescription>
                Selecione onde seus anúncios aparecerão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(groupedPlacements).map(([category, placements]) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                    <div className="space-y-2">
                      {placements.map((placement) => (
                        <label
                          key={placement.value}
                          className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.placements.includes(placement.value)}
                            onChange={() => handleArrayToggle('placements', placement.value)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{placement.label}</span>
                              <Badge variant="outline" className="text-xs">
                                {placement.recommended}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">{placement.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upload de Imagens - SIMPLIFICADO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload de Imagens
              </CardTitle>
              <CardDescription>
                Faça upload das suas imagens
                {formData.placements.length === 0 && (
                  <div className="flex items-center gap-1 mt-2 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Selecione posicionamentos primeiro!</span>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Input de Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm text-gray-600 mb-2">
                    Clique para selecionar imagens ou arraste aqui
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
                  >
                    Selecionar Imagens
                  </label>
                  <div className="text-xs text-gray-500 mt-2">
                    JPG, PNG até 30MB cada
                  </div>
                </div>

                {/* Preview das Imagens Carregadas */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Imagens Carregadas</h4>
                      <Badge variant="secondary">
                        {uploadedImages.length} imagem(ns)
                      </Badge>
                    </div>
                    
                    {uploadedImages.map((image, index) => (
                      <div key={image.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          {/* Preview da Imagem Original */}
                          <div className="flex-shrink-0">
                            <img
                              src={image.preview}
                              alt={image.name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          </div>
                          
                          {/* Informações da Imagem */}
                          <div className="flex-1">
                            <div className="font-medium">{image.name}</div>
                            <div className="text-sm text-gray-500">
                              Tamanho: {(image.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                            
                            {/* Botão para Gerar Versões */}
                            {formData.placements.length > 0 && (
                              <div className="mt-2">
                                <Button
                                  onClick={() => generateVersionsForPlacements(image)}
                                  disabled={isProcessingImages}
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  {isProcessingImages ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Resize className="h-4 w-4 mr-2" />
                                  )}
                                  Gerar Versões
                                </Button>
                              </div>
                            )}
                            
                            {/* Versões Geradas */}
                            {image.versions.length > 0 && (
                              <div className="mt-3">
                                <div className="text-sm font-medium mb-2">Versões Geradas:</div>
                                <div className="grid grid-cols-2 gap-2">
                                  {image.versions.map((version, vIndex) => (
                                    <div key={vIndex} className="border rounded p-2">
                                      <img
                                        src={version.url}
                                        alt={`${version.format}`}
                                        className="w-full h-16 object-cover rounded mb-2"
                                      />
                                      <div className="text-xs">
                                        <div className="font-medium">{version.format}</div>
                                        <div className="text-gray-500">
                                          {version.width}x{version.height}
                                        </div>
                                        <div className="text-gray-500">
                                          Para: {version.placements.join(', ')}
                                        </div>
                                      </div>
                                      <Button
                                        onClick={() => downloadVersion(version, image.name)}
                                        size="sm"
                                        variant="outline"
                                        className="w-full mt-2"
                                      >
                                        <Download className="h-3 w-3 mr-1" />
                                        Download
                                      </Button>
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botão de Gerar Anúncio */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3"
            size="lg"
          >
            <Zap className="h-5 w-5 mr-2" />
            Gerar Anúncio
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdGeneration

