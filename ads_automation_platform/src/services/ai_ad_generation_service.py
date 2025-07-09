"""
Serviço de IA Melhorado para Geração Automática de Anúncios
Gera múltiplas opções de anúncio a partir de uma descrição do produto
"""

import openai
import json
import os
from datetime import datetime
import re

class AIAdGenerationServiceMelhorado:
    def __init__(self):
        """Inicializar serviço de IA com configurações otimizadas"""
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY não configurada")
        
        openai.api_key = self.api_key
        self.model = "gpt-3.5-turbo"  # Modelo otimizado para geração de anúncios
        
        # Templates de prompts otimizados
        self.analysis_prompt_template = """
        Você é um especialista em marketing digital e análise de negócios.
        Analise a descrição do produto/serviço e extraia informações estruturadas.
        
        DESCRIÇÃO: "{description}"
        LOCALIZAÇÃO: "{location}"
        TIPO DE NEGÓCIO: "{business_type}"
        
        Retorne APENAS um JSON válido com esta estrutura:
        {{
            "product_category": "categoria específica (ex: alimentação, moda, serviços)",
            "business_name": "nome do negócio extraído ou sugerido",
            "key_benefits": ["benefício principal", "diferencial competitivo", "proposta de valor"],
            "target_audience": {{
                "primary": "público principal específico",
                "age_range": [idade_mínima, idade_máxima],
                "interests": ["interesse relevante 1", "interesse relevante 2", "interesse relevante 3"],
                "behaviors": ["comportamento de compra 1", "comportamento de compra 2"]
            }},
            "campaign_objectives": ["LINK_CLICKS", "CONVERSIONS"],
            "suggested_budget": {{
                "daily_min": valor_mínimo_em_reais,
                "daily_max": valor_máximo_em_reais,
                "reasoning": "justificativa baseada no tipo de negócio e localização"
            }},
            "ad_copy_suggestions": {{
                "headlines": ["título persuasivo 1", "título persuasivo 2", "título persuasivo 3"],
                "descriptions": ["descrição envolvente 1", "descrição envolvente 2"],
                "call_to_actions": ["LEARN_MORE", "SHOP_NOW", "CONTACT_US"]
            }},
            "targeting_suggestions": {{
                "locations": ["{location}"],
                "demographics": "perfil demográfico detalhado",
                "psychographics": "perfil psicográfico e motivações"
            }}
        }}
        """
        
        self.ad_generation_template = """
        Você é um especialista em criação de anúncios para Facebook Ads.
        Crie uma estrutura completa de anúncio baseada nas informações fornecidas.
        
        INFORMAÇÕES DO PRODUTO:
        - Descrição: {description}
        - Análise: {analysis}
        - Orçamento diário: R$ {budget}
        - Tipo de estratégia: {strategy_type}
        - Página ID: {page_id}
        
        Retorne APENAS um JSON válido com esta estrutura:
        {{
            "campaign": {{
                "name": "Nome da campanha específico e descritivo",
                "objective": "LINK_CLICKS",
                "status": "PAUSED",
                "special_ad_categories": []
            }},
            "adset": {{
                "name": "Nome do conjunto de anúncios",
                "daily_budget": {budget_centavos},
                "billing_event": "IMPRESSIONS",
                "optimization_goal": "LINK_CLICKS",
                "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
                "targeting": {{
                    "age_min": idade_mínima,
                    "age_max": idade_máxima,
                    "genders": [1, 2],
                    "geo_locations": {{
                        "countries": ["BR"],
                        "location_types": ["home", "recent"]
                    }},
                    "interests": [
                        {{"id": "6003139266461", "name": "interesse_1"}},
                        {{"id": "6003139266462", "name": "interesse_2"}}
                    ],
                    "behaviors": [
                        {{"id": "6002714895372", "name": "comportamento_1"}}
                    ]
                }},
                "status": "PAUSED"
            }},
            "creative": {{
                "name": "Nome do criativo",
                "object_story_spec": {{
                    "page_id": "{page_id}",
                    "link_data": {{
                        "message": "Texto principal persuasivo e envolvente",
                        "name": "Título/headline chamativo",
                        "description": "Descrição que gera curiosidade",
                        "link": "https://facebook.com",
                        "call_to_action": {{
                            "type": "LEARN_MORE"
                        }}
                    }}
                }}
            }},
            "analysis": {{
                "target_audience_reasoning": "Justificativa da segmentação escolhida",
                "budget_reasoning": "Justificativa do orçamento definido",
                "creative_reasoning": "Justificativa das escolhas criativas",
                "optimization_tips": ["dica 1", "dica 2", "dica 3"]
            }}
        }}
        """
    
    def generate_structured_analysis(self, prompt):
        """
        Gerar análise estruturada do produto via IA
        """
        try:
            print("🧠 DEBUG: Iniciando análise estruturada...")
            
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um especialista em marketing digital. Sempre retorne apenas JSON válido, sem texto adicional."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=1500,
                temperature=0.7
            )
            
            content = response.choices[0].message.content.strip()
            print(f"🧠 DEBUG: Resposta da IA recebida: {content[:200]}...")
            
            # Tentar extrair JSON da resposta
            try:
                # Remover possíveis caracteres extras
                json_start = content.find('{')
                json_end = content.rfind('}') + 1
                
                if json_start != -1 and json_end != -1:
                    json_content = content[json_start:json_end]
                    analysis = json.loads(json_content)
                    
                    print("✅ DEBUG: Análise estruturada gerada com sucesso")
                    return {
                        "success": True,
                        "analysis": analysis
                    }
                else:
                    raise ValueError("JSON não encontrado na resposta")
                    
            except json.JSONDecodeError as e:
                print(f"❌ DEBUG: Erro ao decodificar JSON: {e}")
                print(f"❌ DEBUG: Conteúdo recebido: {content}")
                
                # Fallback: criar análise básica
                return self._create_fallback_analysis()
        
        except Exception as e:
            print(f"💥 DEBUG: Erro na análise estruturada: {str(e)}")
            return {
                "success": False,
                "error": f"Erro na análise: {str(e)}"
            }
    
    def generate_ad_option(self, option_data):
        """
        Gerar uma opção específica de anúncio
        """
        try:
            print(f"🎨 DEBUG: Gerando opção de anúncio: {option_data.get('option_type', 'N/A')}")
            
            # Preparar prompt personalizado
            description = option_data.get('product_description', '')
            analysis = option_data.get('product_analysis', {})
            budget = option_data.get('budget_daily', 5000) // 100  # Converter centavos para reais
            strategy_type = option_data.get('option_type', 'equilibrado')
            page_id = option_data.get('page_id', '')
            
            prompt = self.ad_generation_template.format(
                description=description,
                analysis=json.dumps(analysis, ensure_ascii=False),
                budget=budget,
                strategy_type=strategy_type,
                page_id=page_id,
                budget_centavos=option_data.get('budget_daily', 5000)
            )
            
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um especialista em Facebook Ads. Sempre retorne apenas JSON válido, sem texto adicional."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=2000,
                temperature=0.8  # Mais criatividade para diferentes opções
            )
            
            content = response.choices[0].message.content.strip()
            print(f"🎨 DEBUG: Resposta da IA recebida: {content[:200]}...")
            
            # Extrair JSON da resposta
            try:
                json_start = content.find('{')
                json_end = content.rfind('}') + 1
                
                if json_start != -1 and json_end != -1:
                    json_content = content[json_start:json_end]
                    ad_structure = json.loads(json_content)
                    
                    # Validar e ajustar estrutura se necessário
                    ad_structure = self._validate_and_fix_structure(ad_structure, option_data)
                    
                    print("✅ DEBUG: Opção de anúncio gerada com sucesso")
                    return {
                        "success": True,
                        "ad_structure": ad_structure
                    }
                else:
                    raise ValueError("JSON não encontrado na resposta")
                    
            except json.JSONDecodeError as e:
                print(f"❌ DEBUG: Erro ao decodificar JSON: {e}")
                
                # Fallback: criar estrutura básica
                return self._create_fallback_ad_structure(option_data)
        
        except Exception as e:
            print(f"💥 DEBUG: Erro na geração da opção: {str(e)}")
            return {
                "success": False,
                "error": f"Erro na geração: {str(e)}"
            }
    
    def generate_multiple_options(self, base_data, num_options=3):
        """
        Gerar múltiplas opções de anúncio com diferentes estratégias
        """
        try:
            print(f"🎯 DEBUG: Gerando {num_options} opções de anúncio...")
            
            strategies = [
                {"type": "conservador", "budget_multiplier": 0.7, "targeting": "narrow"},
                {"type": "equilibrado", "budget_multiplier": 1.0, "targeting": "balanced"},
                {"type": "agressivo", "budget_multiplier": 1.5, "targeting": "broad"}
            ]
            
            options = []
            
            for i, strategy in enumerate(strategies[:num_options]):
                print(f"🎯 DEBUG: Gerando opção {i+1}: {strategy['type']}")
                
                # Ajustar dados para esta estratégia
                option_data = base_data.copy()
                option_data['option_type'] = strategy['type']
                option_data['budget_daily'] = int(base_data.get('budget_daily', 5000) * strategy['budget_multiplier'])
                option_data['targeting_strategy'] = strategy['targeting']
                
                # Gerar opção
                result = self.generate_ad_option(option_data)
                
                if result.get("success"):
                    options.append({
                        "option_id": f"option_{i+1}",
                        "strategy": strategy['type'],
                        "ad_structure": result.get("ad_structure"),
                        "metadata": {
                            "budget_multiplier": strategy['budget_multiplier'],
                            "targeting_strategy": strategy['targeting']
                        }
                    })
                    print(f"✅ DEBUG: Opção {i+1} gerada com sucesso")
                else:
                    print(f"❌ DEBUG: Falha ao gerar opção {i+1}: {result.get('error')}")
            
            return {
                "success": True,
                "options": options,
                "total_generated": len(options)
            }
        
        except Exception as e:
            print(f"💥 DEBUG: Erro na geração múltipla: {str(e)}")
            return {
                "success": False,
                "error": f"Erro na geração múltipla: {str(e)}"
            }
    
    def _validate_and_fix_structure(self, structure, option_data):
        """
        Validar e corrigir estrutura do anúncio se necessário
        """
        try:
            # Garantir que campos obrigatórios existam
            if 'campaign' not in structure:
                structure['campaign'] = {}
            
            if 'adset' not in structure:
                structure['adset'] = {}
            
            if 'creative' not in structure:
                structure['creative'] = {}
            
            # Corrigir campaign
            campaign = structure['campaign']
            campaign['objective'] = campaign.get('objective', 'LINK_CLICKS')
            campaign['status'] = campaign.get('status', 'PAUSED')
            campaign['special_ad_categories'] = campaign.get('special_ad_categories', [])
            
            if not campaign.get('name'):
                campaign['name'] = f"Campanha IA - {datetime.now().strftime('%d/%m/%Y')}"
            
            # Corrigir adset
            adset = structure['adset']
            adset['daily_budget'] = adset.get('daily_budget', option_data.get('budget_daily', 5000))
            adset['billing_event'] = adset.get('billing_event', 'IMPRESSIONS')
            adset['optimization_goal'] = adset.get('optimization_goal', 'LINK_CLICKS')
            adset['bid_strategy'] = adset.get('bid_strategy', 'LOWEST_COST_WITHOUT_CAP')
            adset['status'] = adset.get('status', 'PAUSED')
            
            if not adset.get('name'):
                adset['name'] = f"AdSet - {datetime.now().strftime('%d/%m/%Y')}"
            
            # Corrigir targeting
            if 'targeting' not in adset:
                adset['targeting'] = {}
            
            targeting = adset['targeting']
            targeting['age_min'] = targeting.get('age_min', 18)
            targeting['age_max'] = targeting.get('age_max', 65)
            targeting['genders'] = targeting.get('genders', [1, 2])
            
            if 'geo_locations' not in targeting:
                targeting['geo_locations'] = {
                    "countries": ["BR"],
                    "location_types": ["home", "recent"]
                }
            
            # Corrigir creative
            creative = structure['creative']
            if not creative.get('name'):
                creative['name'] = f"Criativo - {datetime.now().strftime('%d/%m/%Y')}"
            
            if 'object_story_spec' not in creative:
                creative['object_story_spec'] = {}
            
            object_story_spec = creative['object_story_spec']
            object_story_spec['page_id'] = option_data.get('page_id', 'PLACEHOLDER_PAGE_ID')
            
            if 'link_data' not in object_story_spec:
                object_story_spec['link_data'] = {}
            
            link_data = object_story_spec['link_data']
            link_data['message'] = link_data.get('message', 'Texto do anúncio gerado automaticamente')
            link_data['name'] = link_data.get('name', 'Título do anúncio')
            link_data['description'] = link_data.get('description', 'Descrição do anúncio')
            link_data['link'] = link_data.get('link', 'https://facebook.com')
            
            if 'call_to_action' not in link_data:
                link_data['call_to_action'] = {'type': 'LEARN_MORE'}
            
            return structure
        
        except Exception as e:
            print(f"⚠️ DEBUG: Erro na validação: {str(e)}")
            return structure
    
    def _create_fallback_analysis(self):
        """
        Criar análise básica como fallback
        """
        return {
            "success": True,
            "analysis": {
                "product_category": "negócio local",
                "business_name": "Negócio",
                "key_benefits": ["Qualidade", "Atendimento", "Preço justo"],
                "target_audience": {
                    "primary": "público local",
                    "age_range": [25, 55],
                    "interests": ["Compras locais", "Qualidade"],
                    "behaviors": ["Consumidores locais"]
                },
                "campaign_objectives": ["LINK_CLICKS"],
                "suggested_budget": {
                    "daily_min": 30,
                    "daily_max": 100,
                    "reasoning": "Orçamento padrão para negócio local"
                },
                "ad_copy_suggestions": {
                    "headlines": ["Conheça nossos produtos", "Qualidade garantida", "Venha nos visitar"],
                    "descriptions": ["Produtos de qualidade", "Atendimento especializado"],
                    "call_to_actions": ["LEARN_MORE", "CONTACT_US"]
                },
                "targeting_suggestions": {
                    "locations": ["Brasil"],
                    "demographics": "Adultos interessados em produtos locais",
                    "psychographics": "Valorizam qualidade e atendimento"
                }
            }
        }
    
    def _create_fallback_ad_structure(self, option_data):
        """
        Criar estrutura básica de anúncio como fallback
        """
        return {
            "success": True,
            "ad_structure": {
                "campaign": {
                    "name": f"Campanha IA - {datetime.now().strftime('%d/%m/%Y')}",
                    "objective": "LINK_CLICKS",
                    "status": "PAUSED",
                    "special_ad_categories": []
                },
                "adset": {
                    "name": f"AdSet - {datetime.now().strftime('%d/%m/%Y')}",
                    "daily_budget": option_data.get('budget_daily', 5000),
                    "billing_event": "IMPRESSIONS",
                    "optimization_goal": "LINK_CLICKS",
                    "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
                    "targeting": {
                        "age_min": 18,
                        "age_max": 65,
                        "genders": [1, 2],
                        "geo_locations": {
                            "countries": ["BR"],
                            "location_types": ["home", "recent"]
                        }
                    },
                    "status": "PAUSED"
                },
                "creative": {
                    "name": f"Criativo - {datetime.now().strftime('%d/%m/%Y')}",
                    "object_story_spec": {
                        "page_id": option_data.get('page_id', 'PLACEHOLDER_PAGE_ID'),
                        "link_data": {
                            "message": "Conheça nossos produtos e serviços de qualidade!",
                            "name": "Produtos de Qualidade",
                            "description": "Venha conhecer nossa loja e descobrir ofertas especiais.",
                            "link": "https://facebook.com",
                            "call_to_action": {
                                "type": "LEARN_MORE"
                            }
                        }
                    }
                },
                "analysis": {
                    "target_audience_reasoning": "Segmentação ampla para alcançar público geral",
                    "budget_reasoning": "Orçamento equilibrado para teste inicial",
                    "creative_reasoning": "Criativo genérico para validação",
                    "optimization_tips": [
                        "Monitore performance nos primeiros dias",
                        "Ajuste segmentação conforme resultados",
                        "Teste diferentes criativos"
                    ]
                }
            }
        }

# Instância global do serviço melhorado
try:
    ai_ad_service_melhorado = AIAdGenerationServiceMelhorado()
    print("✅ AIAdGenerationServiceMelhorado inicializado com sucesso")
except Exception as e:
    print(f"❌ Erro ao inicializar AIAdGenerationServiceMelhorado: {e}")
    ai_ad_service_melhorado = None

