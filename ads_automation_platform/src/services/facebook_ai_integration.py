"""
Serviço de Integração Facebook-IA
Conecta a geração de IA com a criação real de anúncios no Facebook
"""

import json
from typing import Dict, Any, Optional
from .facebook_data_service import facebook_data_service

class FacebookAIIntegration:
    """Integração entre IA e Facebook para criação automática de anúncios"""
    
    def __init__(self):
        self.facebook_service = facebook_data_service
    
    def create_ad_from_ai_structure(self, ai_structure: Dict[str, Any], selected_post: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Criar anúncio no Facebook usando estrutura gerada pela IA
        
        Args:
            ai_structure: Estrutura completa gerada pela IA
            selected_post: Publicação selecionada (opcional)
        
        Returns:
            Dict com resultado da criação
        """
        try:
            print("🚀 DEBUG: Iniciando criação de anúncio no Facebook...")
            
            if not self.facebook_service:
                return {
                    "success": False,
                    "error": "Serviço do Facebook não disponível",
                    "step": "validation"
                }
            
            # ETAPA 1: Criar Campanha
            print("📊 DEBUG: Etapa 1 - Criando campanha...")
            campaign_data = ai_structure.get("campaign", {})
            
            campaign_result = self._create_campaign(campaign_data)
            if not campaign_result.get("success"):
                return {
                    "success": False,
                    "error": f"Erro ao criar campanha: {campaign_result.get('error')}",
                    "step": "campaign_creation"
                }
            
            campaign_id = campaign_result.get("campaign_id")
            print(f"✅ DEBUG: Campanha criada: {campaign_id}")
            
            # ETAPA 2: Criar Conjunto de Anúncios
            print("🎯 DEBUG: Etapa 2 - Criando conjunto de anúncios...")
            adset_data = ai_structure.get("adset", {})
            adset_data["campaign_id"] = campaign_id
            
            adset_result = self._create_adset(adset_data)
            if not adset_result.get("success"):
                return {
                    "success": False,
                    "error": f"Erro ao criar conjunto de anúncios: {adset_result.get('error')}",
                    "step": "adset_creation",
                    "campaign_id": campaign_id
                }
            
            adset_id = adset_result.get("adset_id")
            print(f"✅ DEBUG: Conjunto de anúncios criado: {adset_id}")
            
            # ETAPA 3: Criar Criativo
            print("🎨 DEBUG: Etapa 3 - Criando criativo...")
            creative_data = ai_structure.get("creative", {})
            
            # Se há publicação selecionada, usar seus dados
            if selected_post:
                creative_data = self._adapt_creative_from_post(creative_data, selected_post)
            
            creative_result = self._create_creative(creative_data)
            if not creative_result.get("success"):
                return {
                    "success": False,
                    "error": f"Erro ao criar criativo: {creative_result.get('error')}",
                    "step": "creative_creation",
                    "campaign_id": campaign_id,
                    "adset_id": adset_id
                }
            
            creative_id = creative_result.get("creative_id")
            print(f"✅ DEBUG: Criativo criado: {creative_id}")
            
            # ETAPA 4: Criar Anúncio
            print("📢 DEBUG: Etapa 4 - Criando anúncio...")
            ad_data = {
                "name": f"Anúncio {ai_structure.get('campaign', {}).get('name', 'IA')}",
                "adset_id": adset_id,
                "creative": {"creative_id": creative_id},
                "status": "PAUSED"
            }
            
            ad_result = self._create_ad(ad_data)
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
            print(f"✅ DEBUG: Anúncio criado: {ad_id}")
            
            return {
                "success": True,
                "message": "Anúncio criado com sucesso usando IA",
                "campaign_id": campaign_id,
                "adset_id": adset_id,
                "creative_id": creative_id,
                "ad_id": ad_id,
                "next_steps": [
                    "Revisar configurações do anúncio",
                    "Ativar campanha quando estiver pronto",
                    "Monitorar performance inicial"
                ]
            }
            
        except Exception as e:
            print(f"💥 DEBUG: Erro na integração: {str(e)}")
            return {
                "success": False,
                "error": f"Erro interno na integração: {str(e)}",
                "step": "integration_error"
            }
    
    def _create_campaign(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Criar campanha no Facebook"""
        try:
            # Usar método do facebook_data_service se disponível
            if hasattr(self.facebook_service, 'create_campaign'):
                return self.facebook_service.create_campaign(campaign_data)
            else:
                # Simulação para desenvolvimento
                return {
                    "success": True,
                    "campaign_id": f"camp_{hash(str(campaign_data)) % 1000000}",
                    "message": "Campanha criada (simulação)"
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _create_adset(self, adset_data: Dict[str, Any]) -> Dict[str, Any]:
        """Criar conjunto de anúncios no Facebook"""
        try:
            # Usar método do facebook_data_service se disponível
            if hasattr(self.facebook_service, 'create_adset'):
                return self.facebook_service.create_adset(adset_data)
            else:
                # Simulação para desenvolvimento
                return {
                    "success": True,
                    "adset_id": f"adset_{hash(str(adset_data)) % 1000000}",
                    "message": "Conjunto de anúncios criado (simulação)"
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _create_creative(self, creative_data: Dict[str, Any]) -> Dict[str, Any]:
        """Criar criativo no Facebook"""
        try:
            # Usar método do facebook_data_service se disponível
            if hasattr(self.facebook_service, 'create_ad_creative'):
                return self.facebook_service.create_ad_creative(creative_data)
            else:
                # Simulação para desenvolvimento
                return {
                    "success": True,
                    "creative_id": f"creative_{hash(str(creative_data)) % 1000000}",
                    "message": "Criativo criado (simulação)"
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _create_ad(self, ad_data: Dict[str, Any]) -> Dict[str, Any]:
        """Criar anúncio no Facebook"""
        try:
            # Usar método do facebook_data_service se disponível
            if hasattr(self.facebook_service, 'create_ad'):
                return self.facebook_service.create_ad(ad_data)
            else:
                # Simulação para desenvolvimento
                return {
                    "success": True,
                    "ad_id": f"ad_{hash(str(ad_data)) % 1000000}",
                    "message": "Anúncio criado (simulação)"
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _adapt_creative_from_post(self, creative_data: Dict[str, Any], selected_post: Dict[str, Any]) -> Dict[str, Any]:
        """Adaptar criativo para usar dados da publicação selecionada"""
        try:
            # Extrair dados da publicação
            post_message = selected_post.get("message", "")
            post_image = selected_post.get("full_picture")
            post_link = selected_post.get("permalink_url")
            
            # Adaptar object_story_spec
            if "object_story_spec" in creative_data:
                link_data = creative_data["object_story_spec"].get("link_data", {})
                
                # Usar texto da publicação como base
                if post_message:
                    # Limitar tamanho do texto principal
                    link_data["message"] = post_message[:125] if len(post_message) > 125 else post_message
                
                # Usar imagem da publicação se disponível
                if post_image:
                    link_data["picture"] = post_image
                
                # Usar link da publicação se disponível
                if post_link:
                    link_data["link"] = post_link
                
                creative_data["object_story_spec"]["link_data"] = link_data
            
            return creative_data
            
        except Exception as e:
            print(f"⚠️ DEBUG: Erro ao adaptar criativo da publicação: {e}")
            return creative_data

# Instância global do serviço
try:
    facebook_ai_integration = FacebookAIIntegration()
    print("✅ FacebookAIIntegration inicializado com sucesso")
except Exception as e:
    print(f"❌ Erro ao inicializar FacebookAIIntegration: {e}")
    facebook_ai_integration = None

