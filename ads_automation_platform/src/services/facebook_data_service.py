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
        """Buscar orçamentos das campanhas através dos adsets - TESTADO COM DADOS REAIS"""
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
                    # Processar orçamentos (valores em centavos da API)
                    daily_budget = adset.get("daily_budget", "0")
                    lifetime_budget = adset.get("lifetime_budget", "0")
                    
                    # Converter strings para float e depois para reais
                    # Priorizar daily_budget, depois lifetime_budget
                    if daily_budget and daily_budget != "0":
                        total_budget += float(daily_budget) / 100  # Centavos para reais
                    elif lifetime_budget and lifetime_budget != "0":
                        total_budget += float(lifetime_budget) / 100  # Centavos para reais
                
                # Arredondar para 2 casas decimais
                campaign_budgets[campaign_id] = round(total_budget, 2)
                
        except Exception as e:
            print(f"Erro ao buscar orçamentos dos adsets: {e}")
            # Em caso de erro, retornar dicionário vazio (orçamentos zerados)
            
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
    
    def _make_post_request(self, endpoint: str, data: dict = None) -> Dict[str, Any]:
        """Fazer requisição POST para a Facebook API"""
        url = f"{self.base_url}/{endpoint}"
        
        # Preparar dados para envio (form data como na documentação oficial)
        post_data = {"access_token": self.access_token}
        if data:
            post_data.update(data)
        
        # Headers para form data (como no exemplo oficial do Facebook)
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        try:
            print(f"DEBUG: Fazendo POST para {url} com dados: {post_data}")
            response = requests.post(url, data=post_data, headers=headers)
            
            print(f"DEBUG: Status Code: {response.status_code}")
            print(f"DEBUG: Response Content: {response.text}")
            
            response.raise_for_status()
            
            # Verificar se a resposta tem conteúdo JSON
            if response.content:
                try:
                    result = response.json()
                    print(f"DEBUG: JSON Response: {result}")
                    return result
                except json.JSONDecodeError:
                    # Se não conseguir decodificar JSON, assumir sucesso
                    print("DEBUG: Não foi possível decodificar JSON, assumindo sucesso")
                    return {"success": True}
            else:
                # Se não há conteúdo, assumir sucesso
                print("DEBUG: Resposta vazia, assumindo sucesso")
                return {"success": True}
                
        except requests.exceptions.RequestException as e:
            print(f"Erro na requisição POST à Facebook API: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"DEBUG: Response Status: {e.response.status_code}")
                print(f"DEBUG: Response Text: {e.response.text}")
            return {"error": str(e)}
    
    def pause_campaign(self, campaign_id: str) -> Dict[str, Any]:
        """Pausar uma campanha específica"""
        endpoint = campaign_id
        data = {"status": "PAUSED"}
        
        try:
            result = self._make_post_request(endpoint, data)
            if "error" not in result:
                return {
                    "success": True, 
                    "message": "Campanha pausada com sucesso",
                    "new_status": "PAUSED"
                }
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
                return {
                    "success": True, 
                    "message": "Campanha ativada com sucesso",
                    "new_status": "ACTIVE"
                }
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

    def get_campaign_details(self, campaign_id: str) -> Dict[str, Any]:
        """Buscar detalhes completos de uma campanha para edição"""
        try:
            # Buscar dados básicos da campanha
            campaign_fields = [
                'id', 'name', 'status', 'objective', 'created_time', 'updated_time',
                'start_time', 'stop_time', 'daily_budget', 'lifetime_budget',
                'budget_remaining', 'bid_strategy', 'buying_type', 'special_ad_categories'
            ]
            
            campaign_url = f"/{campaign_id}"
            campaign_params = {
                'fields': ','.join(campaign_fields),
                'access_token': self.access_token
            }
            
            campaign_result = self._make_request(campaign_url, campaign_params)
            
            if "error" in campaign_result:
                return {"success": False, "error": campaign_result["error"]}
            
            # Buscar AdSets da campanha
            adsets_url = f"/{campaign_id}/adsets"
            adsets_params = {
                'fields': 'id,name,status,daily_budget,lifetime_budget,targeting,optimization_goal,bid_amount',
                'access_token': self.access_token
            }
            
            adsets_result = self._make_request(adsets_url, adsets_params)
            
            # Buscar Ads da campanha
            ads_url = f"/{campaign_id}/ads"
            ads_params = {
                'fields': 'id,name,status,creative',
                'access_token': self.access_token
            }
            
            ads_result = self._make_request(ads_url, ads_params)
            
            return {
                "success": True,
                "campaign": {
                    "basic_info": campaign_result,
                    "adsets": adsets_result.get("data", []),
                    "ads": ads_result.get("data", [])
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    def update_campaign(self, campaign_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Atualizar configurações de uma campanha"""
        try:
            # Preparar dados para atualização
            update_params = {}
            
            # Mapear campos do frontend para a API do Facebook
            field_mapping = {
                'name': 'name',
                'status': 'status',
                'daily_budget': 'daily_budget',
                'lifetime_budget': 'lifetime_budget',
                'start_time': 'start_time',
                'stop_time': 'stop_time',
                'bid_strategy': 'bid_strategy',
                'special_ad_categories': 'special_ad_categories'
            }
            
            for frontend_field, api_field in field_mapping.items():
                if frontend_field in update_data:
                    value = update_data[frontend_field]
                    
                    # Converter valores de orçamento para centavos se necessário
                    if frontend_field in ['daily_budget', 'lifetime_budget'] and value:
                        # Se o valor está em reais, converter para centavos
                        if isinstance(value, (int, float)) and value < 1000:
                            value = int(value * 100)
                    
                    update_params[api_field] = value
            
            if not update_params:
                return {"success": False, "error": "Nenhum campo válido para atualizar"}
            
            # Fazer requisição de atualização
            update_params['access_token'] = self.access_token
            result = self._make_post_request(f"/{campaign_id}", update_params)
            
            if "error" in result:
                return {"success": False, "error": result["error"]}
            
            # Buscar dados atualizados da campanha
            updated_campaign = self.get_campaign_details(campaign_id)
            
            return {
                "success": True,
                "message": "Campanha atualizada com sucesso",
                "campaign": updated_campaign.get("campaign", {})
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

# Instanciar o serviço usando variáveis de ambiente
FACEBOOK_ACCESS_TOKEN = os.getenv("FACEBOOK_ACCESS_TOKEN")
FACEBOOK_AD_ACCOUNT_ID = os.getenv("FACEBOOK_AD_ACCOUNT_ID")

facebook_data_service = None
if FACEBOOK_ACCESS_TOKEN and FACEBOOK_AD_ACCOUNT_ID:
    facebook_data_service = FacebookDataService(FACEBOOK_ACCESS_TOKEN, FACEBOOK_AD_ACCOUNT_ID)
else:
    print("ATENÇÃO: FACEBOOK_ACCESS_TOKEN ou FACEBOOK_AD_ACCOUNT_ID não configurados. O serviço de dados do Facebook não estará disponível.")


    # ===== NOVOS MÉTODOS PARA MELHORIAS =====
    
    def get_pages(self) -> Dict[str, Any]:
        """Buscar páginas vinculadas à Business Manager"""
        try:
            # Primeiro, tentar buscar páginas através da conta de anúncios
            endpoint = f"{self.account_prefix}/pages"
            params = {
                "fields": "id,name,category,access_token"
            }
            
            result = self._make_request(endpoint, params)
            
            if "data" in result and result["data"]:
                return {
                    "success": True,
                    "pages": result["data"]
                }
            
            # Se não encontrar páginas através da conta, tentar através do usuário
            endpoint = "me/accounts"
            params = {
                "fields": "id,name,category,access_token"
            }
            
            result = self._make_request(endpoint, params)
            
            if "data" in result:
                return {
                    "success": True,
                    "pages": result["data"]
                }
            else:
                return {
                    "success": False,
                    "error": "Nenhuma página encontrada"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_business_managers(self) -> Dict[str, Any]:
        """Buscar Business Managers do usuário"""
        try:
            endpoint = "me/businesses"
            params = {
                "fields": "id,name,created_time,updated_time,verification_status"
            }
            
            result = self._make_request(endpoint, params)
            
            if "data" in result:
                return {
                    "success": True,
                    "businesses": result["data"]
                }
            else:
                return {
                    "success": False,
                    "error": "Nenhuma Business Manager encontrada"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_ad_creatives(self, limit: int = 50) -> Dict[str, Any]:
        """Buscar criativos de anúncios"""
        try:
            endpoint = f"{self.account_prefix}/adcreatives"
            params = {
                "fields": "id,name,status,object_story_spec,image_url,video_id,thumbnail_url",
                "limit": limit
            }
            
            result = self._make_request(endpoint, params)
            
            if "data" in result:
                return {
                    "success": True,
                    "creatives": result["data"]
                }
            else:
                return {
                    "success": False,
                    "error": "Nenhum criativo encontrado"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def create_campaign(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Criar uma nova campanha"""
        try:
            endpoint = f"{self.account_prefix}/campaigns"
            
            # Preparar dados da campanha
            post_data = {
                "name": campaign_data.get("name"),
                "objective": campaign_data.get("objective", "CONVERSIONS"),
                "status": campaign_data.get("status", "PAUSED"),
                "special_ad_categories": campaign_data.get("special_ad_categories", [])
            }
            
            # Adicionar orçamento se fornecido
            if campaign_data.get("daily_budget"):
                post_data["daily_budget"] = int(float(campaign_data["daily_budget"]) * 100)  # Converter para centavos
            elif campaign_data.get("lifetime_budget"):
                post_data["lifetime_budget"] = int(float(campaign_data["lifetime_budget"]) * 100)  # Converter para centavos
            
            # Adicionar datas se fornecidas
            if campaign_data.get("start_time"):
                post_data["start_time"] = campaign_data["start_time"]
            if campaign_data.get("stop_time"):
                post_data["stop_time"] = campaign_data["stop_time"]
            
            result = self._make_post_request(endpoint, post_data)
            
            if "id" in result:
                return {
                    "success": True,
                    "campaign_id": result["id"],
                    "message": "Campanha criada com sucesso"
                }
            else:
                return {
                    "success": False,
                    "error": result.get("error", "Erro ao criar campanha")
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def create_adset(self, adset_data: Dict[str, Any]) -> Dict[str, Any]:
        """Criar um novo conjunto de anúncios"""
        try:
            endpoint = f"{self.account_prefix}/adsets"
            
            # Preparar dados do adset
            post_data = {
                "name": adset_data.get("name"),
                "campaign_id": adset_data.get("campaign_id"),
                "status": adset_data.get("status", "PAUSED"),
                "optimization_goal": adset_data.get("optimization_goal", "CONVERSIONS"),
                "billing_event": adset_data.get("billing_event", "IMPRESSIONS"),
                "targeting": json.dumps(adset_data.get("targeting", {}))
            }
            
            # Adicionar orçamento
            if adset_data.get("daily_budget"):
                post_data["daily_budget"] = int(float(adset_data["daily_budget"]) * 100)  # Converter para centavos
            elif adset_data.get("lifetime_budget"):
                post_data["lifetime_budget"] = int(float(adset_data["lifetime_budget"]) * 100)  # Converter para centavos
            
            # Adicionar datas
            if adset_data.get("start_time"):
                post_data["start_time"] = adset_data["start_time"]
            if adset_data.get("end_time"):
                post_data["end_time"] = adset_data["end_time"]
            
            result = self._make_post_request(endpoint, post_data)
            
            if "id" in result:
                return {
                    "success": True,
                    "adset_id": result["id"],
                    "message": "Conjunto de anúncios criado com sucesso"
                }
            else:
                return {
                    "success": False,
                    "error": result.get("error", "Erro ao criar conjunto de anúncios")
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def create_ad_creative(self, creative_data: Dict[str, Any]) -> Dict[str, Any]:
        """Criar um criativo de anúncio"""
        try:
            endpoint = f"{self.account_prefix}/adcreatives"
            
            # Preparar dados do criativo
            post_data = {
                "name": creative_data.get("name"),
                "object_story_spec": json.dumps(creative_data.get("object_story_spec", {}))
            }
            
            result = self._make_post_request(endpoint, post_data)
            
            if "id" in result:
                return {
                    "success": True,
                    "creative_id": result["id"],
                    "message": "Criativo criado com sucesso"
                }
            else:
                return {
                    "success": False,
                    "error": result.get("error", "Erro ao criar criativo")
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def create_ad(self, ad_data: Dict[str, Any]) -> Dict[str, Any]:
        """Criar um novo anúncio"""
        try:
            endpoint = f"{self.account_prefix}/ads"
            
            # Preparar dados do anúncio
            post_data = {
                "name": ad_data.get("name"),
                "adset_id": ad_data.get("adset_id"),
                "creative": json.dumps({"creative_id": ad_data.get("creative_id")}),
                "status": ad_data.get("status", "PAUSED")
            }
            
            result = self._make_post_request(endpoint, post_data)
            
            if "id" in result:
                return {
                    "success": True,
                    "ad_id": result["id"],
                    "message": "Anúncio criado com sucesso"
                }
            else:
                return {
                    "success": False,
                    "error": result.get("error", "Erro ao criar anúncio")
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def upload_image(self, image_path: str, image_name: str = None) -> Dict[str, Any]:
        """Fazer upload de uma imagem para a biblioteca de anúncios"""
        try:
            endpoint = f"{self.account_prefix}/adimages"
            
            # Preparar dados para upload
            files = {
                'filename': (image_name or 'uploaded_image.jpg', open(image_path, 'rb'), 'image/jpeg')
            }
            
            data = {
                'access_token': self.access_token
            }
            
            url = f"{self.base_url}/{endpoint}"
            response = requests.post(url, files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                if 'images' in result:
                    image_hash = list(result['images'].keys())[0]
                    return {
                        "success": True,
                        "image_hash": image_hash,
                        "message": "Imagem enviada com sucesso"
                    }
            
            return {
                "success": False,
                "error": "Erro ao fazer upload da imagem"
            }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_targeting_options(self, targeting_type: str, query: str = None) -> Dict[str, Any]:
        """Buscar opções de segmentação (interesses, comportamentos, etc.)"""
        try:
            endpoint = "search"
            params = {
                "type": targeting_type,  # interests, behaviors, demographics, etc.
                "class": "adTargetingCategory"
            }
            
            if query:
                params["q"] = query
            
            result = self._make_request(endpoint, params)
            
            if "data" in result:
                return {
                    "success": True,
                    "options": result["data"]
                }
            else:
                return {
                    "success": False,
                    "error": "Nenhuma opção encontrada"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_location_targeting(self, query: str, location_types: List[str] = None) -> Dict[str, Any]:
        """Buscar opções de segmentação geográfica"""
        try:
            endpoint = "search"
            params = {
                "type": "adgeolocation",
                "q": query
            }
            
            if location_types:
                params["location_types"] = json.dumps(location_types)
            
            result = self._make_request(endpoint, params)
            
            if "data" in result:
                return {
                    "success": True,
                    "locations": result["data"]
                }
            else:
                return {
                    "success": False,
                    "error": "Nenhuma localização encontrada"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

