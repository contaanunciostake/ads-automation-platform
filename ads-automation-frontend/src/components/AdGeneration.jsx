import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Upload, Wand2, Copy, RefreshCw, Sparkles, Image, FileText, Target } from 'lucide-react'

const AdGeneration = () => {
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
      
      // Criar preview da imagem
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
      
      // Adicionar dados do formulário
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key])
      })
      
      // Adicionar imagem se selecionada
      if (selectedImage) {
        formDataToSend.append('creative_image', selectedImage)
      }

      const response = await fetch('http://localhost:5000/api/ad-generation/generate', {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-8 w-8 text-purple-600" />
        <div>
          <h2 className="text-2xl font-bold">Geração de Anúncios com IA</h2>
          <p className="text-gray-600">Crie textos de anúncios persuasivos baseados em seu criativo e informações da empresa</p>
        </div>
      </div>

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

      {/* Dicas e Informações */}
      <Card>
        <CardHeader>
          <CardTitle>Dicas para Melhores Resultados</CardTitle>
        </CardHeader>
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
  )
}

export default AdGeneration

