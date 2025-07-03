import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Wand2, Copy, RefreshCw, Sparkles, Image, FileText, Target, Eye, MousePointer, DollarSign, Activity, TrendingUp, AlertCircle } from 'lucide-react';

const AdGeneration = () => {
  // Estados para geração de anúncios
  const [formData, setFormData] = useState({
    company_name: '',
    product_description: '',
    target_audience: '',
    platform: 'facebook',
    ad_objective: 'conversions',
    num_variations: 3,
    provider: 'local'
  })
  
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [generatedAds, setGeneratedAds] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageAnalysis, setImageAnalysis] = useState(null)
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

  // Estados para campanhas detalhadas
  const [campaigns, setCampaigns] = useState([])
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false)

  const platforms = [
    { value: 'facebook', label: 'Facebook Ads' },
    { value: 'google', label: 'Google Ads' },
    { value: 'linkedin', label: 'LinkedIn Ads' },
    { value: 'instagram', label: 'Instagram Ads' }
  ]

  const objectives = [
    { value: 'conversions', label: 'Conversões' },
    { value: 'traffic', label: 'Tráfego' },
    { value: 'brand_awareness', label: 'Reconhecimento de Marca' },
    { value: 'engagement', label: 'Engajamento' },
    { value: 'lead_generation', label: 'Geração de Leads' }
  ]

  const providers = [
    { value: 'local', label: 'Demonstração Local' },
    { value: 'openai', label: 'OpenAI GPT-4' },
    { value: 'huggingface', label: 'Hugging Face' }
  ]

  // Função para buscar dados do dashboard
  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true)
    setDashboardError(null)

    try {
      // Buscar dados dos gráficos que têm os valores reais
      const chartResponse = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook/chart-data?days=7', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const chartResult = await chartResponse.json()

      // Buscar dados de campanhas para contagem de ativas
      const summaryResponse = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook/dashboard-summary', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const summaryResult = await summaryResponse.json()

      if (chartResult.success && summaryResult.success) {
        // Calcular totais dos últimos 7 dias a partir dos dados do gráfico
        const chartData = chartResult.data || []
        
        const totals = chartData.reduce((acc, day) => {
          acc.impressions += day.impressions || 0
          acc.clicks += day.clicks || 0
          acc.spend += day.spend || 0
          return acc
        }, { impressions: 0, clicks: 0, spend: 0 })

        // Calcular métricas derivadas
        const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
        const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0
        const cpm = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0

        // Obter contagem de campanhas ativas
        const campaign_stats = summaryResult.data?.campaign_stats || {}
        
        // Formatar dados no formato esperado pelo componente
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

  // Função para buscar campanhas detalhadas
  const fetchCampaigns = async () => {
    setIsLoadingCampaigns(true)

    try {
      const response = await fetch('https://ads-automation-backend-otpl.onrender.com/api/facebook/campaigns', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        setCampaigns(result.data || [])
      } else {
        console.error('Erro ao carregar campanhas:', result.error)
      }
    } catch (error) {
      console.error('Erro na conexão:', error.message)
    } finally {
      setIsLoadingCampaigns(false)
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    fetchDashboardData()
    fetchCampaigns()
  }, [])

  // Funções para geração de anúncios (mantidas originais)
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedImage(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateAds = async () => {
    if (!formData.company_name) {
      alert('Nome da empresa é obrigatório')
      return
    }

    setIsGenerating(true)
    setGeneratedAds([])
    setImageAnalysis(null)

    try {
      const formDataToSend = new FormData()
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key])
      })
      
      if (selectedImage) {
        formDataToSend.append('creative_image', selectedImage)
      }

      const response = await fetch('https://ads-automation-backend-otpl.onrender.com/api/ad-generation/generate', {
        method: 'POST',
        body: formDataToSend
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedAds(result.variations || [])
        setImageAnalysis(result.image_analysis)
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

  const getPlatformColor = (platform) => {
    const colors = {
      facebook: 'bg-blue-500',
      google: 'bg-red-500',
      linkedin: 'bg-blue-700',
      instagram: 'bg-pink-500'
    }
    return colors[platform] || 'bg-gray-500'
  }

  const getPlatformLimits = (platform) => {
    const limits = {
      facebook: { headline: 125, description: 125 },
      google: { headline: 30, description: 90 },
      linkedin: { headline: 150, description: 600 },
      instagram: { headline: 125, description: 2200 }
    }
    return limits[platform] || limits.facebook
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
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

        {/* Campanhas Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Campanhas Detalhadas
              </CardTitle>
              <CardDescription>
                Visualize o desempenho detalhado de cada campanha
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCampaigns ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Impressões</p>
                            <p className="text-lg font-bold">{formatNumber(campaign.impressions || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Cliques</p>
                            <p className="text-lg font-bold">{formatNumber(campaign.clicks || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Gasto</p>
                            <p className="text-lg font-bold">{formatCurrency(campaign.spent || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">CTR</p>
                            <p className="text-lg font-bold">{formatPercentage(campaign.ctr || 0)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma campanha encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário de Entrada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informações da Campanha
                </CardTitle>
                <CardDescription>
                  Forneça as informações básicas para gerar textos de anúncios personalizados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company_name">Nome da Empresa *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Ex: TechSolutions"
                  />
                </div>

                <div>
                  <Label htmlFor="product_description">Descrição do Produto/Serviço</Label>
                  <Textarea
                    id="product_description"
                    value={formData.product_description}
                    onChange={(e) => handleInputChange('product_description', e.target.value)}
                    placeholder="Descreva brevemente seu produto ou serviço..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="target_audience">Público-Alvo</Label>
                  <Input
                    id="target_audience"
                    value={formData.target_audience}
                    onChange={(e) => handleInputChange('target_audience', e.target.value)}
                    placeholder="Ex: Empresários de 25-45 anos"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Plataforma</Label>
                    <Select value={formData.platform} onValueChange={(value) => handleInputChange('platform', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map(platform => (
                          <SelectItem key={platform.value} value={platform.value}>
                            {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Objetivo</Label>
                    <Select value={formData.ad_objective} onValueChange={(value) => handleInputChange('ad_objective', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {objectives.map(objective => (
                          <SelectItem key={objective.value} value={objective.value}>
                            {objective.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Número de Variações</Label>
                    <Select value={formData.num_variations.toString()} onValueChange={(value) => handleInputChange('num_variations', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 variação</SelectItem>
                        <SelectItem value="2">2 variações</SelectItem>
                        <SelectItem value="3">3 variações</SelectItem>
                        <SelectItem value="5">5 variações</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Modelo de IA</Label>
                    <Select value={formData.provider} onValueChange={(value) => handleInputChange('provider', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map(provider => (
                          <SelectItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Upload de Imagem */}
                <div>
                  <Label>Criativo (Imagem) - Opcional</Label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto rounded" />
                        <p className="text-sm text-gray-600">Clique para alterar a imagem</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">Clique para fazer upload de uma imagem</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <Button 
                  onClick={generateAds} 
                  disabled={isGenerating || !formData.company_name}
                  className="w-full"
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

            {/* Resultados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Anúncios Gerados
                </CardTitle>
                <CardDescription>
                  Textos de anúncios criados pela IA baseados nas suas informações
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imageAnalysis && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Análise do Criativo
                    </h4>
                    <p className="text-sm text-blue-800">{imageAnalysis}</p>
                  </div>
                )}

                {generatedAds.length > 0 ? (
                  <div className="space-y-4">
                    {generatedAds.map((ad, index) => (
                      <Card key={index} className="border-l-4 border-l-purple-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Variação {ad.id}</Badge>
                              <Badge className={getPlatformColor(formData.platform)}>
                                {platforms.find(p => p.value === formData.platform)?.label}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(ad.full_text)}
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
                                  <p className="text-xs text-gray-500">
                                    {ad.headline.length}/{getPlatformLimits(formData.platform).headline} caracteres
                                  </p>
                                </div>
                              )}
                              
                              {ad.description && (
                                <div>
                                  <Label className="text-xs text-gray-500">DESCRIÇÃO</Label>
                                  <p className="text-sm">{ad.description}</p>
                                  <p className="text-xs text-gray-500">
                                    {ad.description.length}/{getPlatformLimits(formData.platform).description} caracteres
                                  </p>
                                </div>
                              )}
                              
                              <div>
                                <Label className="text-xs text-gray-500">TEXTO COMPLETO</Label>
                                <p className="text-sm bg-gray-50 p-2 rounded">{ad.full_text}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Total: {ad.character_count} caracteres
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Wand2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Preencha as informações e clique em "Gerar Anúncios" para ver os resultados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dicas e Informações */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">📝 Descrição Clara</h4>
              <p className="text-sm text-gray-600">
                Seja específico sobre seu produto ou serviço. Inclua benefícios principais e diferenciais.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🎯 Público Definido</h4>
              <p className="text-sm text-gray-600">
                Defina claramente seu público-alvo com idade, interesses e características demográficas.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🖼️ Criativo Relevante</h4>
              <p className="text-sm text-gray-600">
                Use imagens que representem bem seu produto. A IA analisará o visual para criar textos alinhados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default AdGeneration;

