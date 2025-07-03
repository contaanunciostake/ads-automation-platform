import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Eye, MousePointer, Target, Settings, Plus, Play, Pause, BarChart3, Sparkles, RefreshCw, AlertCircle } from 'lucide-react'
import AdGeneration from './components/AdGeneration.jsx'
import './App.css'

function App() {
  const [campaigns, setCampaigns] = useState([])
  const [performanceData, setPerformanceData] = useState({})
  const [chartData, setChartData] = useState([])
  const [businessManagers, setBusinessManagers] = useState([])
  const [selectedBM, setSelectedBM] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastSync, setLastSync] = useState(null)

  const API_BASE_URL = 'https://ads-automation-backend-otpl.onrender.com/api'

  // Buscar Business Managers conectados
  const fetchBusinessManagers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/facebook/business-managers`)
      const data = await response.json()
      
      if (data.success) {
        setBusinessManagers(data.data)
        if (data.data.length > 0 && !selectedBM) {
          setSelectedBM(data.data[0].id)
        }
      } else {
        setError(data.error || 'Erro ao buscar Business Managers')
      }
    } catch (err) {
      setError('Erro de conexão ao buscar Business Managers')
      console.error('Erro:', err)
    }
  }

  // Buscar dados do dashboard
  const fetchDashboardData = async () => {
    if (!selectedBM) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Buscar dados dos gráficos que têm os valores reais
      const chartResponse = await fetch(`${API_BASE_URL}/facebook/chart-data?days=7`)
      const chartData = await chartResponse.json()
      
      // Buscar dados de campanhas para contagem de ativas
      const summaryResponse = await fetch(`${API_BASE_URL}/facebook/dashboard-summary`)
      const summaryData = await summaryResponse.json()
      
      if (chartData.success && summaryData.success) {
        // Calcular totais dos últimos 7 dias a partir dos dados do gráfico
        const dailyData = chartData.data || []
        
        const totals = dailyData.reduce((acc, day) => {
          acc.impressions += day.impressions || 0
          acc.clicks += day.clicks || 0
          acc.spend += day.spend || 0
          return acc
        }, { impressions: 0, clicks: 0, spend: 0 })

        // Calcular métricas derivadas
        const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
        const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0
        const reach = totals.impressions // Aproximação: reach ≈ impressions para dados agregados

        // Obter dados de campanhas
        const summary = summaryData.data
        const campaign_stats = summary?.campaign_stats || {}
        
        // Atualizar dados de performance
        setPerformanceData({
          impressions: totals.impressions,
          clicks: totals.clicks,
          spend: totals.spend,
          ctr: parseFloat(ctr.toFixed(2)),
          cpc: parseFloat(cpc.toFixed(2)),
          reach: reach,
          campaigns_active: campaign_stats.active || 0,
          campaigns_total: campaign_stats.total || 0
        })
        
        // Atualizar campanhas
        const campaigns = summary?.campaigns || []
        setCampaigns(campaigns.map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          platform: "facebook_ads",
          status: campaign.status.toLowerCase(),
          budget: parseFloat(campaign.daily_budget || campaign.lifetime_budget || 0) / 100,
          objective: campaign.objective,
          created_time: campaign.created_time,
          updated_time: campaign.updated_time
        })))
        
        setLastSync(new Date().toLocaleString())
      } else {
        setError('Erro ao buscar dados do dashboard')
      }
    } catch (err) {
      setError('Erro de conexão ao buscar dados do dashboard')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  // Buscar dados para gráficos
  const fetchChartData = async () => {
    if (!selectedBM) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/facebook/chart-data?days=7`)
      const data = await response.json()
      
      if (data.success) {
        setChartData(data.data.map(item => ({
          date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          impressions: item.impressions,
          clicks: item.clicks,
          spend: item.spend,
          ctr: item.ctr,
          cpc: item.cpc
        })))
      }
    } catch (err) {
      console.error('Erro ao buscar dados do gráfico:', err)
    }
  }

  // Sincronizar dados
  const syncData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/facebook/sync-data`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        await fetchDashboardData()
        await fetchChartData()
        setLastSync(new Date().toLocaleString())
      } else {
        setError(data.error || 'Erro na sincronização')
      }
    } catch (err) {
      setError('Erro de conexão na sincronização')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    fetchBusinessManagers()
  }, [])

  useEffect(() => {
    if (selectedBM) {
      fetchDashboardData()
      fetchChartData()
    }
  }, [selectedBM])

  // Dados para gráfico de pizza (distribuição de gastos por status de campanha)
  const pieData = [
    { name: 'Ativas', value: performanceData.campaigns_active || 0, color: '#10b981' },
    { name: 'Pausadas', value: (performanceData.campaigns_total || 0) - (performanceData.campaigns_active || 0), color: '#f59e0b' }
  ]

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plataforma de Automação de Anúncios</h1>
            <p className="text-gray-600 mt-2">Gerencie suas campanhas com inteligência artificial</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Seletor de Business Manager */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Business Manager:</label>
              <Select value={selectedBM} onValueChange={setSelectedBM}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Selecione uma BM" />
                </SelectTrigger>
                <SelectContent>
                  {businessManagers.map((bm) => (
                    <SelectItem key={bm.id} value={bm.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${bm.is_connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span>{bm.business_name || bm.name}</span>
                        <Badge variant="outline" className="text-xs">{bm.currency}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Botão de sincronização */}
            <Button onClick={syncData} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
            
            {lastSync && (
              <span className="text-xs text-gray-500">
                Última sync: {lastSync}
              </span>
            )}
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs principais */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="automation">Automação</TabsTrigger>
            <TabsTrigger value="ad-generation">Gerar Anúncios</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando dados reais...</span>
              </div>
            ) : (
              <>
                {/* Cards de métricas principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Impressões (7d)</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(performanceData.impressions || 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        <TrendingUp className="inline h-3 w-3 mr-1" />
                        Últimos 7 dias
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Cliques (7d)</CardTitle>
                      <MousePointer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(performanceData.clicks || 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        CTR: {(performanceData.ctr || 0).toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Gasto (7d)</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(performanceData.spend || 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        CPC: {formatCurrency(performanceData.cpc || 0)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{performanceData.campaigns_active || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        de {performanceData.campaigns_total || 0} total
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Diária (7 dias)</CardTitle>
                      <CardDescription>Impressões e cliques por dia</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="impressions" stroke="#3b82f6" name="Impressões" />
                          <Line type="monotone" dataKey="clicks" stroke="#10b981" name="Cliques" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição de Campanhas</CardTitle>
                      <CardDescription>Status das campanhas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Campanhas Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Campanhas</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Campanha
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Suas Campanhas</CardTitle>
                <CardDescription>Gerencie todas as suas campanhas publicitárias</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Carregando campanhas...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Nenhuma campanha encontrada</p>
                    ) : (
                      campaigns.map((campaign) => (
                        <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold">{campaign.name}</h3>
                              <p className="text-sm text-gray-600">
                                {campaign.objective} • Orçamento: {formatCurrency(campaign.budget)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                            </Badge>
                            <Button size="sm" variant="outline">
                              {campaign.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Análises Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Análises</h2>
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Gasto Diário (7 dias)</CardTitle>
                <CardDescription>Evolução dos gastos por dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Gasto']} />
                    <Bar dataKey="spend" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automação Tab */}
          <TabsContent value="automation" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Automação</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Regras de Automação</CardTitle>
                <CardDescription>Configure regras para otimizar suas campanhas automaticamente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma regra de automação configurada</p>
                  <Button className="mt-4">Criar Primeira Regra</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Geração de Anúncios Tab */}
          <TabsContent value="ad-generation" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerar Anúncios com IA</h2>
              <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by AI
              </Badge>
            </div>

            <AdGeneration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

