import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { X, Save, Calendar, DollarSign, Target, Users, Image, Settings, AlertCircle } from 'lucide-react'

const CampaignSettings = ({ campaign, isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [campaignDetails, setCampaignDetails] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    status: '',
    daily_budget: '',
    lifetime_budget: '',
    start_time: '',
    stop_time: '',
    objective: '',
    bid_strategy: '',
    special_ad_categories: []
  })

  const API_BASE_URL = 'https://ads-automation-backend-otpl.onrender.com/api'

  // Buscar detalhes da campanha quando o modal abrir
  useEffect(() => {
    if (isOpen && campaign?.id) {
      fetchCampaignDetails()
    }
  }, [isOpen, campaign?.id])

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/facebook/campaigns/${campaign.id}/details`)
      const data = await response.json()

      if (data.success) {
        setCampaignDetails(data.campaign)
        const basicInfo = data.campaign.basic_info
        
        // Preencher formulário com dados da campanha
        setFormData({
          name: basicInfo.name || '',
          status: basicInfo.status || '',
          daily_budget: basicInfo.daily_budget ? (basicInfo.daily_budget / 100).toFixed(2) : '',
          lifetime_budget: basicInfo.lifetime_budget ? (basicInfo.lifetime_budget / 100).toFixed(2) : '',
          start_time: basicInfo.start_time ? basicInfo.start_time.split('T')[0] : '',
          stop_time: basicInfo.stop_time ? basicInfo.stop_time.split('T')[0] : '',
          objective: basicInfo.objective || '',
          bid_strategy: basicInfo.bid_strategy || '',
          special_ad_categories: basicInfo.special_ad_categories || []
        })
      } else {
        alert(`Erro ao carregar detalhes: ${data.error}`)
      }
    } catch (err) {
      alert('Erro de conexão ao carregar detalhes da campanha')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      // Preparar dados para envio
      const updateData = { ...formData }
      
      // Converter orçamentos para números
      if (updateData.daily_budget) {
        updateData.daily_budget = parseFloat(updateData.daily_budget)
      }
      if (updateData.lifetime_budget) {
        updateData.lifetime_budget = parseFloat(updateData.lifetime_budget)
      }

      await onSave(campaign.id, updateData)
      onClose()
    } catch (err) {
      console.error('Erro ao salvar:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Configurações da Campanha</h2>
              <p className="text-sm text-gray-600">{campaign?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando configurações...</p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="basic" className="p-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="budget">Orçamento</TabsTrigger>
                <TabsTrigger value="schedule">Cronograma</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
              </TabsList>

              {/* Aba Básico */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Informações Básicas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="campaign-name">Nome da Campanha</Label>
                      <Input
                        id="campaign-name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Digite o nome da campanha"
                      />
                    </div>

                    <div>
                      <Label htmlFor="campaign-status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Ativa</SelectItem>
                          <SelectItem value="PAUSED">Pausada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="campaign-objective">Objetivo</Label>
                      <Input
                        id="campaign-objective"
                        value={formData.objective}
                        onChange={(e) => handleInputChange('objective', e.target.value)}
                        placeholder="Objetivo da campanha"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">O objetivo não pode ser alterado após a criação</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Orçamento */}
              <TabsContent value="budget" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Configurações de Orçamento</span>
                    </CardTitle>
                    <CardDescription>
                      Configure como você quer gastar seu orçamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="daily-budget">Orçamento Diário (R$)</Label>
                      <Input
                        id="daily-budget"
                        type="number"
                        step="0.01"
                        min="1"
                        value={formData.daily_budget}
                        onChange={(e) => handleInputChange('daily_budget', e.target.value)}
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">Valor mínimo: R$ 1,00</p>
                    </div>

                    <div>
                      <Label htmlFor="lifetime-budget">Orçamento Vitalício (R$)</Label>
                      <Input
                        id="lifetime-budget"
                        type="number"
                        step="0.01"
                        min="1"
                        value={formData.lifetime_budget}
                        onChange={(e) => handleInputChange('lifetime_budget', e.target.value)}
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">Orçamento total para toda a campanha</p>
                    </div>

                    <div>
                      <Label htmlFor="bid-strategy">Estratégia de Lance</Label>
                      <Select value={formData.bid_strategy} onValueChange={(value) => handleInputChange('bid_strategy', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a estratégia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOWEST_COST_WITHOUT_CAP">Custo mais baixo</SelectItem>
                          <SelectItem value="LOWEST_COST_WITH_BID_CAP">Custo mais baixo com limite</SelectItem>
                          <SelectItem value="TARGET_COST">Custo alvo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Cronograma */}
              <TabsContent value="schedule" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Cronograma da Campanha</span>
                    </CardTitle>
                    <CardDescription>
                      Defina quando sua campanha deve ser executada
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="start-date">Data de Início</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={formData.start_time}
                        onChange={(e) => handleInputChange('start_time', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="end-date">Data de Término (Opcional)</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={formData.stop_time}
                        onChange={(e) => handleInputChange('stop_time', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Deixe em branco para executar indefinidamente</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Avançado */}
              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5" />
                      <span>Configurações Avançadas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Categorias Especiais de Anúncio</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.special_ad_categories.length > 0 ? (
                          formData.special_ad_categories.map((category, index) => (
                            <Badge key={index} variant="secondary">{category}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">Nenhuma categoria especial</p>
                        )}
                      </div>
                    </div>

                    {campaignDetails && (
                      <div>
                        <Label>AdSets da Campanha</Label>
                        <div className="space-y-2 mt-2">
                          {campaignDetails.adsets.map((adset) => (
                            <div key={adset.id} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <p className="font-medium">{adset.name}</p>
                                <p className="text-sm text-gray-600">Status: {adset.status}</p>
                              </div>
                              <Badge variant={adset.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {adset.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {campaignDetails && (
                      <div>
                        <Label>Anúncios da Campanha</Label>
                        <div className="space-y-2 mt-2">
                          {campaignDetails.ads.map((ad) => (
                            <div key={ad.id} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <p className="font-medium">{ad.name}</p>
                                <p className="text-sm text-gray-600">Status: {ad.status}</p>
                              </div>
                              <Badge variant={ad.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {ad.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CampaignSettings

