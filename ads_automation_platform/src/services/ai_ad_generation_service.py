"""
Serviço de IA para Geração Automática de Anúncios
Usa a API do ChatGPT para calcular automaticamente toda a estrutura do anúncio
"""

import openai
import json
import os
from typing import Dict, Any, List

class AIAdGenerationService:
    """Serviço que usa IA para gerar automaticamente configurações de anúncios"""
    
    def __init__(self):
        # Configurar API do OpenAI
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY não configurada")
        
        openai.api_key = self.openai_api_key
    
    def generate_ad_structure(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Gerar estrutura completa do anúncio usando IA
        
        Args:
            product_data: {
                "product_name": "Nome do produto/serviço",
                "product_description": "Descrição detalhada",
                "platforms": ["facebook", "instagram"],
                "page_name": "Nome da página/empresa",
                "selected_post": {...}  # Publicação selecionada (opcional)
            }
        
        Returns:
            Dict com estrutura completa do anúncio calculada pela IA
        """
        try:
            print("🤖 DEBUG: Iniciando geração de anúncio com IA...")
            
            # Preparar prompt para a IA
            prompt = self._create_ad_generation_prompt(product_data)
            
            print(f"🤖 DEBUG: Enviando prompt para ChatGPT...")
            
            # Chamar API do ChatGPT
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um especialista em marketing digital e criação de anúncios para Facebook e Instagram. Sua tarefa é gerar estruturas completas de anúncios otimizadas para conversão."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            print("🤖 DEBUG: Resposta recebida do ChatGPT")
            
            # Extrair resposta
            ai_response = response.choices[0].message.content
            
            # Tentar parsear JSON da resposta
            try:
                ai_structure = json.loads(ai_response)
            except json.JSONDecodeError:
                # Se não conseguir parsear, criar estrutura baseada no texto
                ai_structure = self._parse_text_response(ai_response, product_data)
            
            print("✅ DEBUG: Estrutura de anúncio gerada com sucesso")
            
            return {
                "success": True,
                "ad_structure": ai_structure,
                "ai_analysis": {
                    "reasoning": "Estrutura gerada automaticamente pela IA baseada nas melhores práticas de marketing digital",
                    "target_audience_reasoning": ai_structure.get("analysis", {}).get("target_audience_reasoning", ""),
                    "budget_reasoning": ai_structure.get("analysis", {}).get("budget_reasoning", ""),
                    "creative_reasoning": ai_structure.get("analysis", {}).get("creative_reasoning", "")
                }
            }
            
        except Exception as e:
            print(f"💥 DEBUG: Erro na geração com IA: {str(e)}")
            return {
                "success": False,
                "error": f"Erro na geração com IA: {str(e)}"
            }
    
    def _create_ad_generation_prompt(self, product_data: Dict[str, Any]) -> str:
        """Criar prompt otimizado para a IA"""
        
        product_name = product_data.get("product_name", "")
        product_description = product_data.get("product_description", "")
        platforms = product_data.get("platforms", ["facebook"])
        page_name = product_data.get("page_name", "")
        selected_post = product_data.get("selected_post")
        
        prompt = f"""
Crie uma estrutura COMPLETA de anúncio para Facebook/Instagram com base nas seguintes informações:

PRODUTO/SERVIÇO:
- Nome: {product_name}
- Descrição: {product_description}
- Página/Empresa: {page_name}
- Plataformas: {', '.join(platforms)}

"""
        
        if selected_post:
            prompt += f"""
PUBLICAÇÃO EXISTENTE SELECIONADA:
- Texto: {selected_post.get('message', '')[:200]}...
- Plataforma: {selected_post.get('platform', '')}
- Data: {selected_post.get('created_time', '')}

"""
        
        prompt += """
Retorne um JSON com a seguinte estrutura EXATA:

{
  "campaign": {
    "name": "Nome da campanha otimizado",
    "objective": "CONVERSIONS",
    "status": "PAUSED",
    "special_ad_categories": []
  },
  "adset": {
    "name": "Nome do conjunto de anúncios",
    "optimization_goal": "CONVERSIONS",
    "billing_event": "IMPRESSIONS",
    "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
    "daily_budget": 5000,
    "targeting": {
      "geo_locations": {
        "countries": ["BR"],
        "location_types": ["home", "recent"]
      },
      "age_min": 18,
      "age_max": 65,
      "genders": [0],
      "interests": [
        {"id": "6003107902433", "name": "Interesse relevante 1"},
        {"id": "6003139266461", "name": "Interesse relevante 2"}
      ],
      "behaviors": [
        {"id": "6002714895372", "name": "Comportamento relevante"}
      ],
      "custom_audiences": [],
      "excluded_custom_audiences": []
    },
    "status": "PAUSED"
  },
  "creative": {
    "name": "Criativo otimizado",
    "object_story_spec": {
      "page_id": "PLACEHOLDER_PAGE_ID",
      "link_data": {
        "link": "https://exemplo.com",
        "message": "Texto principal persuasivo (máximo 125 caracteres)",
        "name": "Título chamativo (máximo 40 caracteres)",
        "description": "Descrição convincente (máximo 30 caracteres)",
        "call_to_action": {
          "type": "LEARN_MORE"
        }
      }
    },
    "degrees_of_freedom_spec": {
      "creative_features_spec": {
        "standard_enhancements": {
          "enroll_status": "OPT_IN"
        }
      }
    }
  },
  "analysis": {
    "target_audience_reasoning": "Explicação da segmentação escolhida",
    "budget_reasoning": "Justificativa do orçamento sugerido",
    "creative_reasoning": "Estratégia do criativo",
    "optimization_tips": [
      "Dica 1 de otimização",
      "Dica 2 de otimização"
    ]
  }
}

INSTRUÇÕES IMPORTANTES:
1. Use IDs reais de interesses e comportamentos do Facebook
2. Orçamento em centavos (ex: 5000 = R$ 50,00)
3. Textos otimizados para conversão
4. Segmentação específica para o produto/serviço
5. Call-to-action apropriado
6. Considere a publicação existente se fornecida

Retorne APENAS o JSON, sem texto adicional.
"""
        
        return prompt
    
    def _parse_text_response(self, ai_response: str, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parsear resposta em texto para estrutura JSON"""
        
        # Estrutura padrão caso não consiga parsear
        default_structure = {
            "campaign": {
                "name": f"Campanha {product_data.get('product_name', 'Produto')}",
                "objective": "CONVERSIONS",
                "status": "PAUSED",
                "special_ad_categories": []
            },
            "adset": {
                "name": f"Conjunto {product_data.get('product_name', 'Produto')}",
                "optimization_goal": "CONVERSIONS",
                "billing_event": "IMPRESSIONS",
                "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
                "daily_budget": 5000,
                "targeting": {
                    "geo_locations": {
                        "countries": ["BR"],
                        "location_types": ["home", "recent"]
                    },
                    "age_min": 18,
                    "age_max": 65,
                    "genders": [0],
                    "interests": [
                        {"id": "6003107902433", "name": "Compras online"},
                        {"id": "6003139266461", "name": "Tecnologia"}
                    ],
                    "behaviors": [
                        {"id": "6002714895372", "name": "Compradores frequentes"}
                    ]
                },
                "status": "PAUSED"
            },
            "creative": {
                "name": f"Criativo {product_data.get('product_name', 'Produto')}",
                "object_story_spec": {
                    "page_id": "PLACEHOLDER_PAGE_ID",
                    "link_data": {
                        "link": "https://exemplo.com",
                        "message": f"Descubra {product_data.get('product_name', 'nosso produto')}! Qualidade garantida e entrega rápida.",
                        "name": f"{product_data.get('product_name', 'Produto Incrível')}",
                        "description": "Aproveite agora!",
                        "call_to_action": {
                            "type": "LEARN_MORE"
                        }
                    }
                }
            },
            "analysis": {
                "target_audience_reasoning": "Segmentação baseada em interesses relacionados ao produto",
                "budget_reasoning": "Orçamento inicial conservador para testes",
                "creative_reasoning": "Criativo focado em conversão com call-to-action claro",
                "optimization_tips": [
                    "Teste diferentes públicos",
                    "Monitore métricas de conversão"
                ]
            }
        }
        
        return default_structure

# Instância global do serviço
try:
    ai_ad_service = AIAdGenerationService()
    print("✅ AIAdGenerationService inicializado com sucesso")
except Exception as e:
    print(f"❌ Erro ao inicializar AIAdGenerationService: {e}")
    ai_ad_service = None

