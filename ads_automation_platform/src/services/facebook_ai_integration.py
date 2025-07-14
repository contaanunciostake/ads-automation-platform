"""
Integração entre IA e Sistema de Criação de Anúncios do Facebook - VERSÃO CORRIGIDA
Conecta a estrutura gerada pela IA com a API do Facebook para criar anúncios reais
"""

import json
import requests
from typing import Dict, Any
from datetime import datetime, timedelta

class FacebookAIIntegration:
    """Classe que integra IA com criação de anúncios no Facebook - VERSÃO CORRIGIDA"""
    
    def __init__(self):
        # Importar serviços dinamicamente para evitar problemas de import
        try:
            from src.services.facebook_data_service import facebook_data_service
            self.facebook_service = facebook_data_service
        except ImportError:
            self.facebook_service = None
    
    def create_ad_from_ai_structure(self, ai_structure: Dict[str, Any], selected_post: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Criar anúncio no Facebook usando estrutura gerada pela IA - VERSÃO SIMPLIFICADA
        
        Args:
            ai_structure: Estrutura completa gerada pela IA
            selected_post: Publicação selecionada (opcional)
        
        Returns:
            Dict com resultado da criação do anúncio
        """
        try:
            print("🤖➡️📘 DEBUG: Iniciando criação de anúncio com estrutura da IA (VERSÃO CORRIGIDA)...")
            
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
            
            # VERSÃO SIMPLIFICADA: Criar apenas campanha por enquanto
            print("🔄 DEBUG: Criando campanha simplificada...")
            
            # Dados mínimos obrigatórios para campanha
            campaign_create_data = {
                "name": campaign_data.get("name", f"Campanha IA - {datetime.now().strftime('%Y%m%d_%H%M%S')}"),
                "objective": "LINK_CLICKS",  # Objetivo mais simples e comum
                "status": "PAUSED"  # Sempre criar pausada
            }
            
            print(f"📤 DEBUG: Dados da campanha: {campaign_create_data}")
            
            # Tentar criar campanha
            campaign_result = self._create_campaign_direct(campaign_create_data)
            
            if campaign_result.get("success"):
                campaign_id = campaign_result.get("campaign_id")
                print(f"✅ DEBUG: Campanha criada com sucesso - ID: {campaign_id}")
                
                return {
                    "success": True,
                    "message": "Campanha criada com sucesso! (Versão simplificada)",
                    "campaign_id": campaign_id,
                    "note": "Por enquanto, apenas a campanha foi criada. Conjunto de anúncios e criativos serão implementados em próximas versões.",
                    "next_steps": [
                        "Campanha criada e pausada",
                        "Acesse o Facebook Ads Manager para configurar conjunto de anúncios",
                        "Adicione criativos e configure segmentação",
                        "Ative a campanha quando estiver pronta"
                    ]
                }
            else:
                error_msg = campaign_result.get("error", "Erro desconhecido")
                print(f"❌ DEBUG: Erro ao criar campanha: {error_msg}")
                
                # Tentar diagnóstico do erro
                if "400" in str(error_msg):
                    return {
                        "success": False,
                        "error": "Erro 400: Dados inválidos ou permissões insuficientes",
                        "details": error_msg,
                        "suggestions": [
                            "Verifique se o token tem permissões ads_management",
                            "Confirme se a conta de anúncios está ativa",
                            "Verifique se há limites de gastos configurados"
                        ]
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Erro ao criar campanha: {error_msg}",
                        "step": "campaign_creation"
                    }
            
        except Exception as e:
            print(f"💥 DEBUG: Exceção na integração: {str(e)}")
            import traceback
            print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
            
            return {
                "success": False,
                "error": f"Erro interno na integração: {str(e)}"
            }
    
    def _create_campaign_direct(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Criar campanha diretamente via API do Facebook com tratamento de erros melhorado"""
        try:
            if not self.facebook_service:
                return {
                    "success": False,
                    "error": "Serviço do Facebook não disponível"
                }
            
            # Verificar se temos acesso token e account ID
            if not hasattr(self.facebook_service, 'access_token') or not self.facebook_service.access_token:
                return {
                    "success": False,
                    "error": "Token de acesso não configurado"
                }
            
            if not hasattr(self.facebook_service, 'ad_account_id') or not self.facebook_service.ad_account_id:
                return {
                    "success": False,
                    "error": "ID da conta de anúncios não configurado"
                }
            
            # Usar método do serviço existente
            print("🔄 DEBUG: Chamando create_campaign do facebook_data_service...")
            result = self.facebook_service.create_campaign(campaign_data)
            
            print(f"📥 DEBUG: Resultado do create_campaign: {result}")
            
            return result
            
        except Exception as e:
            print(f"💥 DEBUG: Erro em _create_campaign_direct: {str(e)}")
            return {
                "success": False,
                "error": f"Erro interno: {str(e)}"
            }
    
    def check_permissions(self) -> Dict[str, Any]:
        """Verificar permissões necessárias para criação de anúncios"""
        try:
            if not self.facebook_service:
                return {
                    "success": False,
                    "error": "Serviço do Facebook não disponível"
                }
            
            # Tentar buscar informações da conta para verificar permissões
            account_info = self.facebook_service.get_ad_account_info()
            
            if account_info.get("error"):
                return {
                    "success": False,
                    "error": f"Erro ao verificar conta: {account_info.get('error')}",
                    "permissions_ok": False
                }
            
            return {
                "success": True,
                "message": "Permissões verificadas com sucesso",
                "account_info": account_info,
                "permissions_ok": True
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Erro ao verificar permissões: {str(e)}",
                "permissions_ok": False
            }

# Instância global para uso nos endpoints
try:
    facebook_ai_integration = FacebookAIIntegration()
    print("✅ FacebookAIIntegration inicializado com sucesso")
except Exception as e:
    print(f"❌ Erro ao inicializar FacebookAIIntegration: {e}")
    facebook_ai_integration = None

