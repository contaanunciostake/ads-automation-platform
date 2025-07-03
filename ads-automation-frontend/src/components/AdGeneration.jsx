import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Wand2, Copy, RefreshCw, Sparkles, Image, FileText, Target, Eye, MousePointer, DollarSign, Activity, TrendingUp, AlertCircle, Video, Users, MapPin, Calendar, Clock, Zap, Settings, Play, Instagram, Facebook, Heart, Smartphone, ShoppingCart } from 'lucide-react';

const AdGeneration = () => {
  // Estados para geração de anúncios
  const [formData, setFormData] = useState({
    page_id: '',
    product_description: '',
    target_audience: '',
    platforms: ['facebook'], // Array para múltiplas plataformas
    ad_objective: 'sales',
    num_variations: 3,
    creative_type: 'image', // image, video, carousel, collection
    placements: ['feed'], // Array para múltiplos posicionamentos
    budget_type: 'daily',
    budget_amount: 50,
    schedule_start: '',
    schedule_end: '',
    age_min: 18,
    age_max: 65,
    gender: 'all',
    interests: [],
    behaviors: [],
    locations: ['Brasil']
  })
  
  const [selectedFiles, setSelectedFiles] = useState([])
  const [filePreviews, setFilePreviews] = useState([])
  const [generatedAds, setGeneratedAds] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingAudience, setIsGeneratingAudience] = useState(false)
  const [pages, setPages] = useState([])
  const [isLoadingPages, setIsLoadingPages] = useState(false)
  const fileInputRef = useRef(null)

  // Estados para dashboard de métricas
  const [dashboardData, setDashboardData] = useState({
    impressions: 0,
    clicks: 0,
    spent: 0,
    active_campaigns: 0,
    ctr: 0,
    cpc: 0,
    cpm: 0
  })
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false)
  const [dashboardError, setDashboardError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Novos objetivos de campanha (2025)
  const objectives = [
    { value: 'awareness', label: 'Reconhecimento', description: 'Aumentar conhecimento da marca', icon: Eye },
    { value: 'traffic', label: 'Tráfego', description: 'Direcionar pessoas para seu site', icon: MousePointer },
    { value: 'engagement', label: 'Engajamento', description: 'Aumentar curtidas, comentários e compartilhamentos', icon: Heart },
    { value: 'leads', label: 'Geração de Leads', description: 'Coletar informações de contato', icon: Users },
    { value: 'app_promotion', label: 'Promoção de App', description: 'Promover downloads do aplicativo', icon: Smartphone },
    { value: 'sales', label: 'Vendas', description: 'Otimizar para vendas e conversões', icon: ShoppingCart }
  ]

  // Posicionamentos completos baseados na pesquisa
  const placements = [
    // Facebook
    { value: 'feed', label: 'Feed do Facebook', platform: 'facebook', description: 'Anúncios no feed principal', category: 'Feeds' },
    { value: 'stories', label: 'Stories do Facebook', platform: 'facebook', description: 'Anúncios em stories (9:16)', category: 'Stories & Reels' },
    { value: 'reels', label: 'Reels do Facebook', platform: 'facebook', description: 'Anúncios em reels (9:16)', category: 'Stories & Reels' },
    { value: 'right_column', label: 'Coluna Direita', platform: 'facebook', description: 'Anúncios na lateral direita', category: 'Feeds' },
    { value: 'marketplace', label: 'Marketplace', platform: 'facebook', description: 'Anúncios no Marketplace', category: 'Feeds' },
    { value: 'video_feeds', label: 'Feeds de Vídeo', platform: 'facebook', description: 'Anúncios em vídeos', category: 'In-Stream' },
    { value: 'search_results', label: 'Resultados de Busca', platform: 'facebook', description: 'Anúncios nos resultados de busca', category: 'Search' },
    
    // Instagram
    { value: 'instagram_feed', label: 'Feed do Instagram', platform: 'instagram', description: 'Anúncios no feed do Instagram', category: 'Feeds' },
    { value: 'instagram_stories', label: 'Stories do Instagram', platform: 'instagram', description: 'Anúncios em stories do Instagram (9:16)', category: 'Stories & Reels' },
    { value: 'instagram_reels', label: 'Reels do Instagram', platform: 'instagram', description: 'Anúncios em reels do Instagram (9:16)', category: 'Stories & Reels' },
    { value: 'instagram_explore', label: 'Explorar do Instagram', platform: 'instagram', description: 'Anúncios na aba Explorar', category: 'Feeds' },
    { value: 'instagram_search', label: 'Busca do Instagram', platform: 'instagram', description: 'Anúncios nos resultados de busca', category: 'Search' },
    
    // Messenger
    { value: 'messenger_inbox', label: 'Caixa de Entrada do Messenger', platform: 'messenger', description: 'Anúncios no Messenger', category: 'Messages' },
    { value: 'messenger_stories', label: 'Stories do Messenger', platform: 'messenger', description: 'Anúncios em stories do Messenger (9:16)', category: 'Stories & Reels' }
  ]

  // Tipos de criativo com especificações detalhadas
  const creativeTypes = [
    { 
      value: 'image', 
      label: 'Imagem', 
      icon: Image, 
      description: 'Anúncios com imagens estáticas',
      specs: {
        formats: ['JPG', 'PNG'],
        maxSize: '30MB',
        ratios: ['1:1 (Quadrado)', '4:5 (Vertical)', '1.91:1 (Paisagem)'],
        recommended: '1440x1440 pixels (1:1)'
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
        recommended: '1440x1440 pixels (1:1)',
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
        recommended: '1440x1440 pixels (1:1)',
        cards: '2 a 10 cards'
      }
    },
    { 
      value: 'collection', 
      label: 'Coleção', 
      icon: Target, 
      description: 'Vitrine de produtos com imagem principal + produtos',
      specs: {
        formats: ['JPG', 'PNG', 'MP4', 'MOV'],
        maxSize: '30MB por imagem, 4GB por vídeo',
        ratios: ['1:1 (Quadrado)', '4:5 (Vertical)'],
        recommended: '1440x1440 pixels (1:1)',
        note: 'Ideal para e-commerce'
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

  // Função para buscar dados do dashboard
  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true)
    setDashboardError(null)

    try {
      const chartResponse = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook/chart-data?days=7', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const chartResult = await chartResponse.json()

      const summaryResponse = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook/dashboard-summary', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

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

  // Função para buscar páginas da Business Manager
  const fetchPages = async () => {
    setIsLoadingPages(true)
    try {
      const response = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook/pages', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        setPages(result.data || [])
      } else {
        console.error('Erro ao carregar páginas:', result.error)
        // Páginas de exemplo para demonstração
        setPages([
          { id: '123456789012345', name: 'MONTE CASTELO COMERCIO LTDA', category: 'Empresa Local' },
          { id: '234567890123456', name: 'TechSolutions Brasil', category: 'Tecnologia' },
          { id: '345678901234567', name: 'Marketing Digital Pro', category: 'Serviços de Marketing' }
        ])
      }
    } catch (error) {
      console.error('Erro na conexão:', error.message)
      // Páginas de exemplo para demonstração
      setPages([
        { id: '123456789012345', name: 'MONTE CASTELO COMERCIO LTDA', category: 'Empresa Local' },
        { id: '234567890123456', name: 'TechSolutions Brasil', category: 'Tecnologia' },
        { id: '345678901234567', name: 'Marketing Digital Pro', category: 'Serviços de Marketing' }
      ])
    } finally {
      setIsLoadingPages(false)
    }
  }

  // Função para gerar público-alvo automaticamente
  const generateTargetAudience = async () => {
    if (!formData.product_description) {
      alert('Descreva seu produto/serviço primeiro para gerar o público-alvo')
      return
    }

    setIsGeneratingAudience(true)
    try {
      const response = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook/generate-audience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_description: formData.product_description,
          objective: formData.ad_objective
        })
      })

      const result = await response.json()

      if (result.success) {
        const audience = result.data
        setFormData(prev => ({
          ...prev,
          target_audience: audience.description,
          age_min: audience.age_min || 18,
          age_max: audience.age_max || 65,
          gender: audience.gender || 'all',
          interests: audience.interests || [],
          behaviors: audience.behaviors || [],
          locations: audience.locations || ['Brasil']
        }))
      } else {
        alert(`Erro ao gerar público-alvo: ${result.error}`)
      }
    } catch (error) {
      console.error('Erro ao gerar público-alvo:', error)
      alert(`Erro na conexão: ${error.message}`)
    } finally {
      setIsGeneratingAudience(false)
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    fetchDashboardData()
    fetchPages()
  }, [])

  // Funções para manipulação do formulário
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }))
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    setSelectedFiles(files)
    
    // Gerar previews
    const previews = []
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        previews.push({
          file,
          preview: e.target.result,
          type: file.type.startsWith('video/') ? 'video' : 'image'
        })
        if (previews.length === files.length) {
          setFilePreviews(previews)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const generateAds = async () => {
    if (!formData.page_id) {
      alert('Selecione uma página da empresa')
      return
    }

    if (!formData.product_description) {
      alert('Descrição do produto/serviço é obrigatória')
      return
    }

    if (formData.placements.length === 0) {
      alert('Selecione pelo menos um posicionamento')
      return
    }

    setIsGenerating(true)
    setGeneratedAds([])

    try {
      const formDataToSend = new FormData()
      
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          formDataToSend.append(key, JSON.stringify(formData[key]))
        } else {
          formDataToSend.append(key, formData[key])
        }
      })
      
      selectedFiles.forEach((file, index) => {
        formDataToSend.append(`creative_files`, file)
      })

      const response = await fetch('https://ads-automation-backend-otpl.onrender.com/api/ad-generation/generate-advanced', {
        method: 'POST',
        body: formDataToSend
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedAds(result.variations || [])
      } else {
        alert(`Erro: ${result.error}`)
      }
    } catch (error) {
      alert(`Erro na requisição: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Texto copiado para a área de transferência!')
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`
  }

  // Filtrar posicionamentos baseado nas plataformas selecionadas
  const getAvailablePlacements = () => {
    return placements.filter(placement => 
      formData.platforms.includes(placement.platform) || 
      (placement.platform === 'messenger' && (formData.platforms.includes('facebook') || formData.platforms.includes('instagram')))
    )
  }

  // Agrupar posicionamentos por categoria
  const getPlacementsByCategory = () => {
    const availablePlacements = getAvailablePlacements()
    const grouped = {}
    
    availablePlacements.forEach(placement => {
      if (!grouped[placement.category]) {
        grouped[placement.category] = []
      }
      grouped[placement.category].push(placement)
    })
    
    return grouped
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold">Dashboard de Campanhas & Geração de Anúncios</h2>
            <p className="text-gray-600">Monitore suas campanhas e crie novos anúncios com IA</p>
          </div>
        </div>
        <Button 
          onClick={fetchDashboardData} 
          disabled={isLoadingDashboard}
          variant="outline"
        >
          {isLoadingDashboard ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="generate">Gerar Anúncios</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {dashboardError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Erro ao carregar dados</span>
                </div>
                <p className="text-red-600 mt-2">{dashboardError}</p>
              </CardContent>
            </Card>
          )}

          {/* Métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impressões (7d)</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingDashboard ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                  ) : (
                    formatNumber(dashboardData.impressions)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Total de visualizações</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cliques (7d)</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingDashboard ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                  ) : (
                    formatNumber(dashboardData.clicks)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Total de cliques</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gasto (7d)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingDashboard ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                  ) : (
                    formatCurrency(dashboardData.spent)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Total investido</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingDashboard ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                  ) : (
                    dashboardData.active_campaigns
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Campanhas em execução</p>
              </CardContent>
            </Card>
          </div>

          {/* Métricas secundárias */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CTR (Taxa de Clique)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingDashboard ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    formatPercentage(dashboardData.ctr)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Cliques / Impressões</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPC (Custo por Clique)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingDashboard ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    formatCurrency(dashboardData.cpc)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Gasto / Cliques</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPM (Custo por Mil)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingDashboard ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    formatCurrency(dashboardData.cpm)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Custo por 1000 impressões</p>
              </CardContent>
            </Card>
          </div>

          {lastUpdated && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Última atualização: {lastUpdated}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Generate Tab - Formulário Avançado */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário de Configuração */}
            <div className="space-y-6">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
                  <CardDescription>
                    Configure as informações fundamentais da sua campanha
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="page_id">Página da Empresa *</Label>
                    <Select value={formData.page_id} onValueChange={(value) => handleInputChange('page_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma página..." />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingPages ? (
                          <SelectItem value="loading" disabled>Carregando páginas...</SelectItem>
                        ) : pages.length > 0 ? (
                          pages.map(page => (
                            <SelectItem key={page.id} value={page.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{page.name}</span>
                                <span className="text-xs text-gray-500">{page.category}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-pages" disabled>Nenhuma página encontrada</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="product_description">Descrição do Produto/Serviço *</Label>
                    <Textarea
                      id="product_description"
                      value={formData.product_description}
                      onChange={(e) => handleInputChange('product_description', e.target.value)}
                      placeholder="Descreva detalhadamente seu produto ou serviço, incluindo benefícios e diferenciais..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Plataformas de Publicação</Label>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="facebook"
                          checked={formData.platforms.includes('facebook')}
                          onCheckedChange={(checked) => handleArrayChange('platforms', 'facebook', checked)}
                        />
                        <Label htmlFor="facebook" className="flex items-center gap-2">
                          <Facebook className="h-4 w-4 text-blue-600" />
                          Facebook
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="instagram"
                          checked={formData.platforms.includes('instagram')}
                          onCheckedChange={(checked) => handleArrayChange('platforms', 'instagram', checked)}
                        />
                        <Label htmlFor="instagram" className="flex items-center gap-2">
                          <Instagram className="h-4 w-4 text-pink-600" />
                          Instagram
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Objetivo da Campanha</Label>
                    <Select value={formData.ad_objective} onValueChange={(value) => handleInputChange('ad_objective', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {objectives.map(objective => {
                          const Icon = objective.icon
                          return (
                            <SelectItem key={objective.value} value={objective.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <div className="flex flex-col">
                                  <span className="font-medium">{objective.label}</span>
                                  <span className="text-xs text-gray-500">{objective.description}</span>
                                </div>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Público-Alvo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Público-Alvo
                  </CardTitle>
                  <CardDescription>
                    Defina quem verá seus anúncios (gerado automaticamente com IA)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="target_audience">Descrição do Público</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateTargetAudience}
                        disabled={isGeneratingAudience || !formData.product_description}
                      >
                        {isGeneratingAudience ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4 mr-2" />
                        )}
                        Gerar com IA
                      </Button>
                    </div>
                    <Textarea
                      id="target_audience"
                      value={formData.target_audience}
                      onChange={(e) => handleInputChange('target_audience', e.target.value)}
                      placeholder="Ex: Empresários de 25-45 anos interessados em tecnologia..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Idade Mínima</Label>
                      <Select value={formData.age_min.toString()} onValueChange={(value) => handleInputChange('age_min', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 47}, (_, i) => i + 18).map(age => (
                            <SelectItem key={age} value={age.toString()}>{age} anos</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Idade Máxima</Label>
                      <Select value={formData.age_max.toString()} onValueChange={(value) => handleInputChange('age_max', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 47}, (_, i) => i + 18).map(age => (
                            <SelectItem key={age} value={age.toString()}>{age} anos</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Gênero</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Localização</Label>
                    <Input
                      value={formData.locations.join(', ')}
                      onChange={(e) => handleInputChange('locations', e.target.value.split(', '))}
                      placeholder="Brasil, São Paulo, Rio de Janeiro..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Orçamento e Cronograma */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Orçamento e Cronograma
                  </CardTitle>
                  <CardDescription>
                    Configure investimento e período da campanha
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Tipo de Orçamento</Label>
                    <Select value={formData.budget_type} onValueChange={(value) => handleInputChange('budget_type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{type.label}</span>
                              <span className="text-xs text-gray-500">{type.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Valor do Orçamento (R$)</Label>
                    <Input
                      type="number"
                      value={formData.budget_amount}
                      onChange={(e) => handleInputChange('budget_amount', parseFloat(e.target.value))}
                      placeholder="50.00"
                      min="1"
                      step="0.01"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data de Início</Label>
                      <Input
                        type="date"
                        value={formData.schedule_start}
                        onChange={(e) => handleInputChange('schedule_start', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Data de Término (Opcional)</Label>
                      <Input
                        type="date"
                        value={formData.schedule_end}
                        onChange={(e) => handleInputChange('schedule_end', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Criativo e Posicionamentos */}
            <div className="space-y-6">
              {/* Tipo de Criativo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Criativo
                  </CardTitle>
                  <CardDescription>
                    Configure o tipo e conteúdo visual dos seus anúncios
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Tipo de Criativo</Label>
                    <div className="grid grid-cols-1 gap-3 mt-2">
                      {creativeTypes.map(type => {
                        const Icon = type.icon
                        return (
                          <div
                            key={type.value}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              formData.creative_type === type.value 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleInputChange('creative_type', type.value)}
                          >
                            <div className="flex items-start gap-3">
                              <Icon className="h-5 w-5 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{type.label}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                                <div className="text-xs text-gray-500 space-y-1">
                                  <div><strong>Formatos:</strong> {type.specs.formats.join(', ')}</div>
                                  <div><strong>Tamanho máx:</strong> {type.specs.maxSize}</div>
                                  <div><strong>Proporções:</strong> {type.specs.ratios.join(', ')}</div>
                                  <div><strong>Recomendado:</strong> {type.specs.recommended}</div>
                                  {type.specs.duration && <div><strong>Duração:</strong> {type.specs.duration}</div>}
                                  {type.specs.cards && <div><strong>Cards:</strong> {type.specs.cards}</div>}
                                  {type.specs.note && <div><strong>Nota:</strong> {type.specs.note}</div>}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <Label>Upload de Arquivos</Label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {filePreviews.length > 0 ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {filePreviews.slice(0, 4).map((preview, index) => (
                              <div key={index} className="relative">
                                {preview.type === 'video' ? (
                                  <video src={preview.preview} className="w-full h-20 object-cover rounded" />
                                ) : (
                                  <img src={preview.preview} alt={`Preview ${index}`} className="w-full h-20 object-cover rounded" />
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">
                            {filePreviews.length} arquivo(s) selecionado(s). Clique para alterar.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-gray-400" />
                          <p className="text-sm text-gray-600">Clique para fazer upload</p>
                          <p className="text-xs text-gray-500">
                            {formData.creative_type === 'video' 
                              ? 'MP4, MOV até 4GB' 
                              : formData.creative_type === 'carousel'
                              ? 'JPG, PNG, MP4, MOV (2-10 arquivos)'
                              : 'JPG, PNG até 30MB'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={formData.creative_type === 'video' ? 'video/*' : formData.creative_type === 'carousel' ? 'image/*,video/*' : 'image/*'}
                      multiple={formData.creative_type === 'carousel'}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Posicionamentos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Posicionamentos
                  </CardTitle>
                  <CardDescription>
                    Escolha onde seus anúncios aparecerão (Stories e Reels são 9:16)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(getPlacementsByCategory()).map(([category, categoryPlacements]) => (
                      <div key={category}>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                        <div className="space-y-2 ml-4">
                          {categoryPlacements.map(placement => (
                            <div key={placement.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={placement.value}
                                checked={formData.placements.includes(placement.value)}
                                onCheckedChange={(checked) => handleArrayChange('placements', placement.value, checked)}
                              />
                              <Label htmlFor={placement.value} className="flex-1">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{placement.label}</span>
                                    {placement.value.includes('stories') || placement.value.includes('reels') ? (
                                      <Badge variant="secondary" className="text-xs">9:16</Badge>
                                    ) : null}
                                  </div>
                                  <span className="text-xs text-gray-500">{placement.description}</span>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Configurações Avançadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configurações Avançadas
                  </CardTitle>
                  <CardDescription>
                    Opções adicionais para otimização
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Número de Variações de Texto</Label>
                    <Select value={formData.num_variations.toString()} onValueChange={(value) => handleInputChange('num_variations', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 variação</SelectItem>
                        <SelectItem value="2">2 variações</SelectItem>
                        <SelectItem value="3">3 variações</SelectItem>
                        <SelectItem value="5">5 variações</SelectItem>
                        <SelectItem value="10">10 variações</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={generateAds} 
                    disabled={isGenerating || !formData.page_id || !formData.product_description}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Gerando Anúncios...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Gerar Anúncios com IA
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Resultados */}
          {generatedAds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Anúncios Gerados
                </CardTitle>
                <CardDescription>
                  Textos de anúncios criados pela IA baseados nas suas configurações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedAds.map((ad, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Variação {ad.id || index + 1}</Badge>
                            {formData.platforms.map(platform => (
                              <Badge key={platform} className={platform === 'facebook' ? 'bg-blue-500' : 'bg-pink-500'}>
                                {platform === 'facebook' ? 'Facebook' : 'Instagram'}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(ad.full_text || ad.text)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copiar
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {ad.error ? (
                          <p className="text-red-600">Erro: {ad.error}</p>
                        ) : (
                          <div className="space-y-3">
                            {ad.headline && (
                              <div>
                                <Label className="text-xs text-gray-500">HEADLINE</Label>
                                <p className="font-medium">{ad.headline}</p>
                              </div>
                            )}
                            
                            {ad.description && (
                              <div>
                                <Label className="text-xs text-gray-500">DESCRIÇÃO</Label>
                                <p className="text-sm">{ad.description}</p>
                              </div>
                            )}
                            
                            <div>
                              <Label className="text-xs text-gray-500">TEXTO COMPLETO</Label>
                              <p className="text-sm bg-gray-50 p-2 rounded">{ad.full_text || ad.text}</p>
                            </div>

                            {formData.placements.length > 0 && (
                              <div>
                                <Label className="text-xs text-gray-500">POSICIONAMENTOS SELECIONADOS</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {formData.placements.map(placementValue => {
                                    const placement = placements.find(p => p.value === placementValue)
                                    return placement ? (
                                      <Badge key={placementValue} variant="secondary" className="text-xs">
                                        {placement.label}
                                      </Badge>
                                    ) : null
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dicas e Informações */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">📝 Descrição Clara</h4>
              <p className="text-sm text-gray-600">
                Seja específico sobre seu produto ou serviço. Inclua benefícios principais e diferenciais.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🎯 Público Automático</h4>
              <p className="text-sm text-gray-600">
                Use a IA para gerar automaticamente o público-alvo ideal baseado no seu produto.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🖼️ Criativo Relevante</h4>
              <p className="text-sm text-gray-600">
                Escolha o tipo certo: imagem para simplicidade, vídeo para engajamento, carrossel para variedade.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">📱 Posicionamentos</h4>
              <p className="text-sm text-gray-600">
                Stories e Reels usam formato 9:16 (vertical). Feed usa 1:1 (quadrado) ou 4:5 (vertical).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdGeneration;

