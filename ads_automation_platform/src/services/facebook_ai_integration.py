"""
Integração entre IA e Sistema de Criação de Anúncios do Facebook
Conecta a estrutura gerada pela IA com a API do Facebook para criar anúncios reais
"""

from facebook_data_service import facebook_data_service
from ai_ad_generation_service import ai_ad_service
import json
from typing import Dict, Any

class FacebookAIIntegration:
    """Classe que integra IA com criação de anúncios no Facebook"""
    
    def __init__(self):
        self.facebook_service = facebook_data_service
        self.ai_service = ai_ad_service
    
    def create_ad_from_ai_structure(self, ai_structure: Dict[str, Any], selected_post: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Criar anúncio no Facebook usando estrutura gerada pela IA
        
        Args:
            ai_structure: Estrutura completa gerada pela IA
            selected_post: Publicação selecionada (opcional)
        
        Returns:
            Dict com resultado da criação do anúncio
        """
        try:
            print("🤖➡️📘 DEBUG: Iniciando criação de anúncio com estrutura da IA...")
            
            if not self.facebook_service:
                return {
                    "success": False,
                    "error": "Serviço do Facebook não está disponível"
                }
            
            if not ai_structure:
                return {
                    "success": False,
                    "error": "Estrutura da IA não fornecida"
                }
            
            # Extrair dados da estrutura da IA
            campaign_data = ai_structure.get("campaign", {})
            adset_data = ai_structure.get("adset", {})
            creative_data = ai_structure.get("creative", {})
            
            print(f"📊 DEBUG: Estrutura da IA:")
            print(f"  📈 Campanha: {campaign_data.get('name')}")
            print(f"  🎯 Objetivo: {campaign_data.get('objective')}")
            print(f"  💰 Orçamento: R$ {adset_data.get('daily_budget', 0)}")
            
            # PASSO 1: Criar Campanha
            print("🔄 DEBUG: Passo 1 - Criando campanha...")
            
            campaign_result = self.facebook_service.create_campaign({
                "name": campaign_data.get("name"),
                "objective": campaign_data.get("objective", "CONVERSIONS"),
                "status": "PAUSED",  # Criar pausada para configurar primeiro
                "special_ad_categories": campaign_data.get("special_ad_categories", [])
            })
            
            if not campaign_result.get("success"):
                return {
                    "success": False,
                    "error": f"Erro ao criar campanha: {campaign_result.get('error')}",
                    "step": "campaign_creation"
                }
            
            campaign_id = campaign_result.get("campaign_id")
            print(f"✅ DEBUG: Campanha criada - ID: {campaign_id}")
            
            # PASSO 2: Criar Conjunto de Anúncios (AdSet)
            print("🔄 DEBUG: Passo 2 - Criando conjunto de anúncios...")
            
            adset_result = self.facebook_service.create_adset({
                "name": adset_data.get("name"),
                "campaign_id": campaign_id,
                "daily_budget": adset_data.get("daily_budget"),
                "optimization_goal": adset_data.get("optimization_goal", "CONVERSIONS"),
                "billing_event": adset_data.get("billing_event", "IMPRESSIONS"),
                "targeting": adset_data.get("targeting", {}),
                "status": "PAUSED"
            })
            
            if not adset_result.get("success"):
                return {
                    "success": False,
                    "error": f"Erro ao criar conjunto de anúncios: {adset_result.get('error')}",
                    "step": "adset_creation",
                    "campaign_id": campaign_id
                }
            
            adset_id = adset_result.get("adset_id")
            print(f"✅ DEBUG: Conjunto de anúncios criado - ID: {adset_id}")
            
            # PASSO 3: Criar Criativo
            print("🔄 DEBUG: Passo 3 - Criando criativo...")
            
            # Se há publicação selecionada, usar ela; senão, criar criativo novo
            if selected_post:
                print("📱 DEBUG: Usando publicação existente como criativo")
                
                creative_spec = {
                    "object_story_id": selected_post.get("id")
                }
            else:
                print("🎨 DEBUG: Criando novo criativo com dados da IA")
                
                # Criar criativo novo baseado nos dados da IA
                creative_spec = {
                    "object_story_spec": {
                        "page_id": "PÁGINA_ID_AQUI",  # Será preenchido dinamicamente
                        "link_data": {
                            "message": creative_data.get("primary_text"),
                            "name": creative_data.get("headline"),
                            "description": creative_data.get("description"),
                            "call_to_action": {
                                "type": creative_data.get("call_to_action_type", "LEARN_MORE")
                            }
                        }
                    }
                }
            
            creative_result = self.facebook_service.create_ad_creative({
                "name": f"{campaign_data.get('name')} - Criativo",
                "object_story_spec": creative_spec
            })
            
            if not creative_result.get("success"):
                return {
                    "success": False,
                    "error": f"Erro ao criar criativo: {creative_result.get('error')}",
                    "step": "creative_creation",
                    "campaign_id": campaign_id,
                    "adset_id": adset_id
                }
            
            creative_id = creative_result.get("creative_id")
            print(f"✅ DEBUG: Criativo criado - ID: {creative_id}")
            
            # PASSO 4: Criar Anúncio
            print("🔄 DEBUG: Passo 4 - Criando anúncio...")
            
            ad_result = self.facebook_service.create_ad({
                "name": f"{campaign_data.get('name')} - Anúncio",
                "adset_id": adset_id,
                "creative_id": creative_id,
                "status": "PAUSED"
            })
            
            if not ad_result.get("success"):
                return {
                    "success": False,
                    "error": f"Erro ao criar anúncio: {ad_result.get('error')}",
                    "step": "ad_creation",
                    "campaign_id": campaign_id,
                    "adset_id": adset_id,
                    "creative_id": creative_id
                }
            
            ad_id = ad_result.get("ad_id")
            print(f"✅ DEBUG: Anúncio criado - ID: {ad_id}")
            
            # SUCESSO: Retornar todos os IDs criados
            return {
                "success": True,
                "message": "Anúncio criado com sucesso usando estrutura da IA",
                "campaign_id": campaign_id,
                "adset_id": adset_id,
                "creative_id": creative_id,
                "ad_id": ad_id,
                "ai_structure": ai_structure,
                "next_steps": [
                    "Revisar configurações do anúncio",
                    "Ativar campanha quando estiver pronto",
                    "Monitorar performance inicial"
                ]
            }
            
        except Exception as e:
            print(f"💥 DEBUG: Erro na integração IA-Facebook: {str(e)}")
            import traceback
            print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
            
            return {
                "success": False,
                "error": f"Erro interno na integração: {str(e)}"
            }
    
    def generate_and_create_ad(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processo completo: Gerar estrutura com IA + Criar anúncio no Facebook
        
        Args:
            product_data: Dados do produto/serviço
        
        Returns:
            Dict com resultado completo do processo
        """
        try:
            print("🤖🔄📘 DEBUG: Iniciando processo completo IA → Facebook...")
            
            # ETAPA 1: Gerar estrutura com IA
            print("🤖 DEBUG: Etapa 1 - Gerando estrutura com IA...")
            
            ai_result = self.ai_service.generate_ad_structure(product_data)
            
            if not ai_result.get("success"):
                return {
                    "success": False,
                    "error": f"Erro na geração com IA: {ai_result.get('error')}",
                    "stage": "ai_generation"
                }
            
            ai_structure = ai_result.get("ad_structure")
            print("✅ DEBUG: Estrutura gerada pela IA com sucesso")
            
            # ETAPA 2: Criar anúncio no Facebook
            print("📘 DEBUG: Etapa 2 - Criando anúncio no Facebook...")
            
            selected_post = product_data.get("selected_post")
            
            facebook_result = self.create_ad_from_ai_structure(ai_structure, selected_post)
            
            if not facebook_result.get("success"):
                return {
                    "success": False,
                    "error": f"Erro na criação no Facebook: {facebook_result.get('error')}",
                    "stage": "facebook_creation",
                    "ai_structure": ai_structure
                }
            
            print("✅ DEBUG: Anúncio criado no Facebook com sucesso")
            
            # SUCESSO COMPLETO
            return {
                "success": True,
                "message": "Anúncio gerado automaticamente pela IA e criado no Facebook",
                "ai_analysis": ai_result.get("ai_analysis"),
                "facebook_result": facebook_result,
                "summary": {
                    "campaign_name": ai_structure.get("campaign", {}).get("name"),
                    "daily_budget": ai_structure.get("adset", {}).get("daily_budget"),
                    "target_audience": ai_structure.get("analysis", {}).get("target_audience_reasoning"),
                    "strategy": ai_structure.get("analysis", {}).get("strategy_summary")
                }
            }
            
        except Exception as e:
            print(f"💥 DEBUG: Erro no processo completo: {str(e)}")
            
            return {
                "success": False,
                "error": f"Erro no processo completo: {str(e)}"
            }
    
    def optimize_existing_ad_with_ai(self, campaign_id: str) -> Dict[str, Any]:
        """
        Otimizar anúncio existente usando análise da IA
        
        Args:
            campaign_id: ID da campanha a ser otimizada
        
        Returns:
            Dict com sugestões de otimização e aplicação automática
        """
        try:
            print(f"🤖🔧 DEBUG: Iniciando otimização da campanha {campaign_id}...")
            
            # Buscar dados atuais da campanha
            campaign_details = self.facebook_service.get_campaign_details(campaign_id)
            
            if not campaign_details.get("success"):
                return {
                    "success": False,
                    "error": "Erro ao buscar dados da campanha"
                }
            
            # Buscar dados de performance
            performance_data = self.facebook_service.get_campaign_insights(campaign_id)
            
            # Gerar otimizações com IA
            optimization_result = self.ai_service.optimize_existing_campaign(
                campaign_details.get("campaign"),
                performance_data
            )
            
            if optimization_result.get("success"):
                # Aplicar otimizações automaticamente (opcional)
                optimizations = optimization_result.get("optimizations")
                
                return {
                    "success": True,
                    "message": "Otimizações geradas pela IA",
                    "optimizations": optimizations,
                    "ai_analysis": optimization_result.get("ai_analysis")
                }
            else:
                return {
                    "success": False,
                    "error": optimization_result.get("error")
                }
                
        except Exception as e:
            print(f"💥 DEBUG: Erro na otimização: {str(e)}")
            return {
                "success": False,
                "error": f"Erro na otimização: {str(e)}"
            }


# Instanciar integração
facebook_ai_integration = None

try:
    if facebook_data_service and ai_ad_service:
        facebook_ai_integration = FacebookAIIntegration()
        print("✅ Integração IA-Facebook inicializada com sucesso")
    else:
        print("⚠️ Integração IA-Facebook não pode ser inicializada - serviços não disponíveis")
except Exception as e:
    print(f"❌ Erro ao inicializar integração IA-Facebook: {e}")

