"""
Serviço para buscar dados reais da Facebook Marketing API.
Este módulo fornece funcionalidades para coletar campanhas, conjuntos de anúncios, anúncios e insights de performance.
"""

import requests
import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

class FacebookDataService:
    """Serviço para buscar dados reais da Facebook Marketing API"""
    
    def __init__(self, access_token: str, ad_account_id: str):
        self.access_token = access_token
        self.ad_account_id = ad_account_id
        self.base_url = "https://graph.facebook.com/v23.0"
        self.account_prefix = f"act_{ad_account_id}"
    
    def _make_request(self, endpoint: str, params: dict = None) -> Dict[str, Any]:
        """Fazer requisição para a Facebook API"""
        url = f"{self.base_url}/{endpoint}"
        
        default_params = {"access_token": self.access_token}
        if params:
            default_params.update(params)
        
        try:
            response = requests.get(url, params=default_params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Erro na requisição à Facebook API: {e}")
            return {"error": str(e)}
    
    def _make_post_request(self, endpoint: str, data: dict = None) -> Dict[str, Any]:
        """Fazer requisição POST para a Facebook API"""
        url = f"{self.base_url}/{endpoint}"
        
        # Preparar dados para envio
        post_data = {"access_token": self.access_token}
        if data:
            post_data.update(data)
        
        try:
            response = requests.post(url, data=post_data)
            response.raise_for_status()
            
            # Verificar se a resposta tem conteúdo JSON
            if response.content:
                return response.json()
            else:
                # Se não há conteúdo, assumir sucesso
                return {"success": True}
                
        except requests.exceptions.RequestException as e:
            print(f"Erro na requisição POST à Facebook API: {e}")
            return {"error": str(e)}
    
    def get_ad_account_info(self) -> Dict[str, Any]:
        """Buscar informações da conta de anúncios"""
        endpoint = self.account_prefix
        params = {
            "fields": "id,name,account_status,currency,timezone_name,business_name,business"
        }
        return self._make_request(endpoint, params)
    
    def get_campaigns(self, limit: int = 50) -> Dict[str, Any]:
        """Buscar campanhas da conta de anúncios"""
        endpoint = f"{self.account_prefix}/campaigns"
        params = {
            "fields": "id,name,status,objective,created_time,updated_time,start_time,stop_time,daily_budget,lifetime_budget",
            "limit": limit
        }
        return self._make_request(endpoint, params)
    
    def get_adsets(self, campaign_id: str = None, limit: int = 50) -> Dict[str, Any]:
        """Buscar conjuntos de anúncios"""
        if campaign_id:
            endpoint = f"{campaign_id}/adsets"
        else:
            endpoint = f"{self.account_prefix}/adsets"
        
        params = {
            "fields": "id,name,status,campaign_id,created_time,updated_time,start_time,end_time,daily_budget,lifetime_budget,targeting,optimization_goal,billing_event",
            "limit": limit
        }
        return self._make_request(endpoint, params)
    
    def get_ads(self, adset_id: str = None, limit: int = 50) -> Dict[str, Any]:
        """Buscar anúncios"""
        if adset_id:
            endpoint = f"{adset_id}/ads"
        else:
            endpoint = f"{self.account_prefix}/ads"
        
        params = {
            "fields": "id,name,status,adset_id,campaign_id,created_time,updated_time,creative",
            "limit": limit
        }
        return self._make_request(endpoint, params)
    
    def get_campaign_insights(self, campaign_id: str, date_preset: str = "last_7_days") -> Dict[str, Any]:
        """Buscar insights de performance de uma campanha"""
        endpoint = f"{campaign_id}/insights"
        params = {
            "fields": "impressions,clicks,ctr,cpc,cpm,spend,reach,frequency,actions,cost_per_action_type,video_views,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p100_watched_actions",
            "date_preset": date_preset
        }
        return self._make_request(endpoint, params)
    
    def get_adset_insights(self, adset_id: str, date_preset: str = "last_7_days") -> Dict[str, Any]:
        """Buscar insights de performance de um conjunto de anúncios"""
        endpoint = f"{adset_id}/insights"
        params = {
            "fields": "impressions,clicks,ctr,cpc,cpm,spend,reach,frequency,actions,cost_per_action_type",
            "date_preset": date_preset
        }
        return self._make_request(endpoint, params)
    
    def get_ad_insights(self, ad_id: str, date_preset: str = "last_7_days") -> Dict[str, Any]:
        """Buscar insights de performance de um anúncio"""
        endpoint = f"{ad_id}/insights"
        params = {
            "fields": "impressions,clicks,ctr,cpc,cpm,spend,reach,frequency,actions,cost_per_action_type",
            "date_preset": date_preset
        }
        return self._make_request(endpoint, params)
    
    def get_account_insights(self, date_preset: str = "last_7_days") -> Dict[str, Any]:
        """Buscar insights de performance da conta de anúncios"""
        endpoint = f"{self.account_prefix}/insights"
        params = {
            "fields": "impressions,clicks,ctr,cpc,cpm,spend,reach,frequency,actions,cost_per_action_type,account_currency,account_id,account_name",
            "date_preset": date_preset
        }
        return self._make_request(endpoint, params)
    
    def get_insights_with_date_range(self, object_id: str, object_type: str, start_date: str, end_date: str) -> Dict[str, Any]:
        """Buscar insights com intervalo de datas específico"""
        if object_type == "account":
            endpoint = f"{self.account_prefix}/insights"
        else:
            endpoint = f"{object_id}/insights"
        
        params = {
            "fields": "impressions,clicks,ctr,cpc,cpm,spend,reach,frequency,actions,cost_per_action_type",
            "time_range": json.dumps({
                "since": start_date,
                "until": end_date
            })
        }
        return self._make_request(endpoint, params)
    
    def get_campaign_budgets(self, campaigns: List[Dict]) -> Dict[str, float]:
        """Buscar orçamentos das campanhas através dos adsets"""
        campaign_budgets = {}
        
        try:
            for campaign in campaigns:
                campaign_id = campaign.get("id")
                if not campaign_id:
                    continue
                
                # Buscar adsets da campanha
                adsets_response = self.get_adsets(campaign_id)
                adsets = adsets_response.get("data", [])
                
                total_budget = 0
                for adset in adsets:
                    # Priorizar daily_budget, depois lifetime_budget
                    daily_budget = adset.get("daily_budget")
                    lifetime_budget = adset.get("lifetime_budget")
                    
                    if daily_budget:
                        total_budget += float(daily_budget) / 100  # Converter centavos para reais
                    elif lifetime_budget:
                        total_budget += float(lifetime_budget) / 100  # Converter centavos para reais
                
                campaign_budgets[campaign_id] = total_budget
                
        except Exception as e:
            print(f"Erro ao buscar orçamentos: {e}")
            
        return campaign_budgets
    
    def get_dashboard_summary(self) -> Dict[str, Any]:
        """Buscar resumo para dashboard com dados agregados"""
        try:
            # Buscar informações da conta
            account_info = self.get_ad_account_info()
            
            # Buscar campanhas ativas
            campaigns_response = self.get_campaigns()
            campaigns = campaigns_response.get("data", [])
            
            # Buscar insights da conta para os últimos 7 dias
            account_insights = self.get_account_insights("last_7_days")
            insights_data = account_insights.get("data", [{}])[0] if account_insights.get("data") else {}
            
            # Buscar insights para os últimos 30 dias para comparação
            account_insights_30d = self.get_account_insights("last_30_days")
            insights_30d = account_insights_30d.get("data", [{}])[0] if account_insights_30d.get("data") else {}
            
            # Contar campanhas por status
            campaign_stats = {
                "active": len([c for c in campaigns if c.get("status") == "ACTIVE"]),
                "paused": len([c for c in campaigns if c.get("status") == "PAUSED"]),
                "total": len(campaigns)
            }
            
            # Calcular métricas derivadas se os dados básicos existirem
            impressions_7d = int(insights_data.get("impressions", 0))
            clicks_7d = int(insights_data.get("clicks", 0))
            spend_7d = float(insights_data.get("spend", 0))
            
            # Calcular CTR, CPC e CPM se não estiverem disponíveis ou estiverem zerados
            ctr_7d = float(insights_data.get("ctr", 0))
            if ctr_7d == 0 and impressions_7d > 0 and clicks_7d > 0:
                ctr_7d = (clicks_7d / impressions_7d) * 100
            
            cpc_7d = float(insights_data.get("cpc", 0))
            if cpc_7d == 0 and clicks_7d > 0 and spend_7d > 0:
                cpc_7d = spend_7d / clicks_7d
            
            cpm_7d = float(insights_data.get("cpm", 0))
            if cpm_7d == 0 and impressions_7d > 0 and spend_7d > 0:
                cpm_7d = (spend_7d / impressions_7d) * 1000
            
            # Fazer o mesmo para 30 dias
            impressions_30d = int(insights_30d.get("impressions", 0))
            clicks_30d = int(insights_30d.get("clicks", 0))
            spend_30d = float(insights_30d.get("spend", 0))
            
            ctr_30d = float(insights_30d.get("ctr", 0))
            if ctr_30d == 0 and impressions_30d > 0 and clicks_30d > 0:
                ctr_30d = (clicks_30d / impressions_30d) * 100
            
            cpc_30d = float(insights_30d.get("cpc", 0))
            if cpc_30d == 0 and clicks_30d > 0 and spend_30d > 0:
                cpc_30d = spend_30d / clicks_30d
            
            cpm_30d = float(insights_30d.get("cpm", 0))
            if cpm_30d == 0 and impressions_30d > 0 and spend_30d > 0:
                cpm_30d = (spend_30d / impressions_30d) * 1000
            
            # Buscar orçamentos das campanhas através dos adsets
            campaign_budgets = self.get_campaign_budgets(campaigns)
            
            # Adicionar orçamentos às campanhas
            campaigns_with_budgets = []
            for campaign in campaigns[:10]:  # Primeiras 10 campanhas
                campaign_with_budget = campaign.copy()
                campaign_id = campaign.get("id")
                campaign_with_budget["budget"] = campaign_budgets.get(campaign_id, 0)
                campaigns_with_budgets.append(campaign_with_budget)
            
            # Preparar resumo
            summary = {
                "account_info": {
                    "id": account_info.get("id"),
                    "name": account_info.get("name"),
                    "currency": account_info.get("currency"),
                    "business_name": account_info.get("business_name"),
                    "status": account_info.get("account_status")
                },
                "campaign_stats": campaign_stats,
                "performance_7d": {
                    "impressions": impressions_7d,
                    "clicks": clicks_7d,
                    "spend": spend_7d,
                    "ctr": round(ctr_7d, 2),
                    "cpc": round(cpc_7d, 2),
                    "cpm": round(cpm_7d, 2),
                    "reach": int(insights_data.get("reach", 0))
                },
                "performance_30d": {
                    "impressions": impressions_30d,
                    "clicks": clicks_30d,
                    "spend": spend_30d,
                    "ctr": round(ctr_30d, 2),
                    "cpc": round(cpc_30d, 2),
                    "cpm": round(cpm_30d, 2),
                    "reach": int(insights_30d.get("reach", 0))
                },
                "campaigns": campaigns_with_budgets,
                "last_updated": datetime.now().isoformat()
            }
            
            return {"success": True, "data": summary}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_campaign_performance_chart_data(self, days: int = 7) -> Dict[str, Any]:
        """Buscar dados para gráficos de performance por dia"""
        try:
            # Calcular datas
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=days-1)
            
            # Buscar insights por dia
            endpoint = f"{self.account_prefix}/insights"
            params = {
                "fields": "impressions,clicks,spend,ctr,cpc,date_start",
                "time_range": json.dumps({
                    "since": start_date.strftime("%Y-%m-%d"),
                    "until": end_date.strftime("%Y-%m-%d")
                }),
                "time_increment": 1  # Dados diários
            }
            
            response = self._make_request(endpoint, params)
            
            if "data" in response:
                chart_data = []
                for day_data in response["data"]:
                    chart_data.append({
                        "date": day_data.get("date_start"),
                        "impressions": int(day_data.get("impressions", 0)),
                        "clicks": int(day_data.get("clicks", 0)),
                        "spend": float(day_data.get("spend", 0)),
                        "ctr": float(day_data.get("ctr", 0)),
                        "cpc": float(day_data.get("cpc", 0))
                    })
                
                return {"success": True, "data": chart_data}
            else:
                return {"success": False, "error": "Nenhum dado encontrado"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def pause_campaign(self, campaign_id: str) -> Dict[str, Any]:
        """Pausar uma campanha específica"""
        endpoint = campaign_id
        data = {"status": "PAUSED"}
        
        try:
            result = self._make_post_request(endpoint, data)
            if "error" not in result:
                return {"success": True, "message": "Campanha pausada com sucesso"}
            else:
                return {"success": False, "error": result["error"]}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def activate_campaign(self, campaign_id: str) -> Dict[str, Any]:
        """Ativar uma campanha específica"""
        endpoint = campaign_id
        data = {"status": "ACTIVE"}
        
        try:
            result = self._make_post_request(endpoint, data)
            if "error" not in result:
                return {"success": True, "message": "Campanha ativada com sucesso"}
            else:
                return {"success": False, "error": result["error"]}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def toggle_campaign_status(self, campaign_id: str, current_status: str) -> Dict[str, Any]:
        """Alternar status da campanha (ativar se pausada, pausar se ativa)"""
        if current_status.upper() == "ACTIVE":
            return self.pause_campaign(campaign_id)
        elif current_status.upper() == "PAUSED":
            return self.activate_campaign(campaign_id)
        else:
            return {"success": False, "error": f"Status inválido: {current_status}"}

# Instanciar o serviço usando variáveis de ambiente
FACEBOOK_ACCESS_TOKEN = os.getenv("FACEBOOK_ACCESS_TOKEN")
FACEBOOK_AD_ACCOUNT_ID = os.getenv("FACEBOOK_AD_ACCOUNT_ID")

facebook_data_service = None
if FACEBOOK_ACCESS_TOKEN and FACEBOOK_AD_ACCOUNT_ID:
    facebook_data_service = FacebookDataService(FACEBOOK_ACCESS_TOKEN, FACEBOOK_AD_ACCOUNT_ID)
else:
    print("ATENÇÃO: FACEBOOK_ACCESS_TOKEN ou FACEBOOK_AD_ACCOUNT_ID não configurados. O serviço de dados do Facebook não estará disponível.")

