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
                        "content": "Você é um especialista em marketing digital e criação de anúncios no Facebook e Instagram. Sua tarefa é analisar informações de produtos/serviços e gerar automaticamente a estrutura completa e otimizada de anúncios."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            print(f"✅ DEBUG: Resposta recebida da IA")
            
            # Extrair resposta
            ai_response = response.choices[0].message.content
            
            # Parsear resposta JSON da IA
            try:
                ad_structure = json.loads(ai_response)
                print(f"✅ DEBUG: Estrutura do anúncio gerada com sucesso")
                
                return {
                    "success": True,
                    "ad_structure": ad_structure,
                    "ai_analysis": "Estrutura gerada automaticamente pela IA"
                }
                
            except json.JSONDecodeError:
                print(f"❌ DEBUG: Erro ao parsear JSON da IA")
                return {
                    "success": False,
                    "error": "Erro ao processar resposta da IA",
                    "raw_response": ai_response
                }
                
        except Exception as e:
            print(f"❌ DEBUG: Erro na geração com IA: {str(e)}")
            return {
                "success": False,
                "error": f"Erro na API da IA: {str(e)}"
            }
    
    def _create_ad_generation_prompt(self, product_data: Dict[str, Any]) -> str:
        """Criar prompt otimizado para a IA gerar a estrutura do anúncio"""
        
        product_name = product_data.get("product_name", "")
        product_description = product_data.get("product_description", "")
        platforms = product_data.get("platforms", [])
        page_name = product_data.get("page_name", "")
        
        prompt = f"""
Analise as seguintes informações e gere uma estrutura completa e otimizada de anúncio para Facebook/Instagram:

**INFORMAÇÕES DO PRODUTO/SERVIÇO:**
- Nome: {product_name}
- Descrição: {product_description}
- Empresa/Página: {page_name}
- Plataformas: {', '.join(platforms)}

**TAREFA:**
Com base nessas informações, calcule automaticamente e retorne um JSON com a estrutura completa do anúncio, incluindo:

1. **Segmentação de Público-Alvo** (baseada no produto/serviço)
2. **Localização Geográfica** (baseada no tipo de negócio)
3. **Orçamento Recomendado** (diário em reais)
4. **Configurações de Campanha** (objetivo, otimização, etc.)
5. **Configurações de Conjunto de Anúncios**
6. **Texto do Anúncio** (call-to-action, headline, etc.)

**FORMATO DE RESPOSTA (JSON):**
```json
{{
  "campaign": {{
    "name": "Nome da campanha gerado automaticamente",
    "objective": "CONVERSIONS|REACH|TRAFFIC|etc",
    "special_ad_categories": []
  }},
  "adset": {{
    "name": "Nome do conjunto de anúncios",
    "daily_budget": 50.00,
    "optimization_goal": "CONVERSIONS|REACH|etc",
    "billing_event": "IMPRESSIONS|CLICKS",
    "targeting": {{
      "geo_locations": {{
        "countries": ["BR"],
        "regions": [{{
          "key": "3448",
          "name": "São Paulo"
        }}],
        "cities": [{{
          "key": "2418151",
          "name": "São Paulo, São Paulo, Brazil"
        }}]
      }},
      "age_min": 25,
      "age_max": 55,
      "genders": [1, 2],
      "interests": [
        {{
          "id": "6003107902433",
          "name": "Interesse relevante 1"
        }},
        {{
          "id": "6003139266461", 
          "name": "Interesse relevante 2"
        }}
      ],
      "behaviors": [
        {{
          "id": "6002714895372",
          "name": "Comportamento relevante"
        }}
      ]
    }}
  }},
  "creative": {{
    "headline": "Título chamativo gerado pela IA",
    "primary_text": "Texto principal do anúncio gerado pela IA",
    "description": "Descrição complementar",
    "call_to_action_type": "LEARN_MORE|SHOP_NOW|CONTACT_US|etc"
  }},
  "analysis": {{
    "target_audience_reasoning": "Explicação da escolha do público-alvo",
    "location_reasoning": "Explicação da escolha de localização", 
    "budget_reasoning": "Explicação do orçamento recomendado",
    "strategy_summary": "Resumo da estratégia de marketing"
  }}
}}
```

**INSTRUÇÕES IMPORTANTES:**
- Use IDs reais de interesses e comportamentos do Facebook
- Calcule orçamento baseado no tipo de produto/serviço
- Escolha localização baseada no negócio (local vs nacional)
- Gere textos persuasivos e relevantes
- Considere as melhores práticas de marketing digital
- Retorne APENAS o JSON, sem texto adicional

Gere a estrutura completa agora:
"""
        
        return prompt
    
    def optimize_existing_campaign(self, campaign_data: Dict[str, Any], performance_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Otimizar campanha existente baseada em dados de performance
        
        Args:
            campaign_data: Dados atuais da campanha
            performance_data: Métricas de performance (CTR, CPC, conversões, etc.)
        
        Returns:
            Dict com sugestões de otimização geradas pela IA
        """
        try:
            print("🤖 DEBUG: Iniciando otimização de campanha com IA...")
            
            # Preparar prompt para otimização
            prompt = self._create_optimization_prompt(campaign_data, performance_data)
            
            # Chamar API do ChatGPT
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um especialista em otimização de campanhas de anúncios digitais. Analise dados de performance e sugira melhorias específicas."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.5,
                max_tokens=1500
            )
            
            # Extrair e processar resposta
            ai_response = response.choices[0].message.content
            
            try:
                optimization_suggestions = json.loads(ai_response)
                
                return {
                    "success": True,
                    "optimizations": optimization_suggestions,
                    "ai_analysis": "Otimizações geradas automaticamente pela IA"
                }
                
            except json.JSONDecodeError:
                return {
                    "success": False,
                    "error": "Erro ao processar sugestões de otimização",
                    "raw_response": ai_response
                }
                
        except Exception as e:
            print(f"❌ DEBUG: Erro na otimização com IA: {str(e)}")
            return {
                "success": False,
                "error": f"Erro na API da IA: {str(e)}"
            }
    
    def _create_optimization_prompt(self, campaign_data: Dict[str, Any], performance_data: Dict[str, Any]) -> str:
        """Criar prompt para otimização de campanhas"""
        
        prompt = f"""
Analise os dados de performance da campanha e sugira otimizações específicas:

**DADOS DA CAMPANHA:**
{json.dumps(campaign_data, indent=2)}

**DADOS DE PERFORMANCE:**
{json.dumps(performance_data, indent=2)}

**TAREFA:**
Baseado nos dados de performance, sugira otimizações específicas em formato JSON:

```json
{{
  "priority_optimizations": [
    {{
      "type": "budget|targeting|creative|bidding",
      "action": "increase|decrease|change|add|remove",
      "current_value": "valor atual",
      "suggested_value": "valor sugerido",
      "reasoning": "explicação da otimização",
      "expected_impact": "impacto esperado"
    }}
  ],
  "performance_analysis": {{
    "strengths": ["pontos fortes da campanha"],
    "weaknesses": ["pontos fracos identificados"],
    "opportunities": ["oportunidades de melhoria"]
  }},
  "next_steps": [
    "ação 1 prioritária",
    "ação 2 prioritária"
  ]
}}
```

Retorne APENAS o JSON:
"""
        
        return prompt
    
    def generate_ad_copy_variations(self, base_copy: str, product_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Gerar variações de copy para testes A/B
        
        Args:
            base_copy: Texto base do anúncio
            product_info: Informações do produto/serviço
        
        Returns:
            Dict com múltiplas variações de copy
        """
        try:
            print("🤖 DEBUG: Gerando variações de copy com IA...")
            
            prompt = f"""
Baseado no copy base e informações do produto, gere 5 variações diferentes para teste A/B:

**COPY BASE:**
{base_copy}

**INFORMAÇÕES DO PRODUTO:**
{json.dumps(product_info, indent=2)}

**TAREFA:**
Gere 5 variações do copy, cada uma com abordagem diferente:
1. Foco em benefícios
2. Foco em urgência/escassez
3. Foco em prova social
4. Foco em problema/solução
5. Foco em call-to-action direto

Retorne em formato JSON:
```json
{{
  "variations": [
    {{
      "type": "benefits_focused",
      "headline": "título da variação",
      "primary_text": "texto principal",
      "description": "descrição",
      "cta": "call to action"
    }}
  ]
}}
```
"""
            
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um copywriter especialista em anúncios digitais. Crie variações persuasivas e testáveis."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.8,
                max_tokens=1500
            )
            
            ai_response = response.choices[0].message.content
            
            try:
                copy_variations = json.loads(ai_response)
                
                return {
                    "success": True,
                    "variations": copy_variations,
                    "total_variations": len(copy_variations.get("variations", []))
                }
                
            except json.JSONDecodeError:
                return {
                    "success": False,
                    "error": "Erro ao processar variações de copy",
                    "raw_response": ai_response
                }
                
        except Exception as e:
            print(f"❌ DEBUG: Erro na geração de variações: {str(e)}")
            return {
                "success": False,
                "error": f"Erro na API da IA: {str(e)}"
            }


# Instanciar o serviço
ai_ad_service = None

try:
    ai_ad_service = AIAdGenerationService()
    print("✅ Serviço de IA para geração de anúncios inicializado com sucesso")
except Exception as e:
    print(f"❌ Erro ao inicializar serviço de IA: {e}")

