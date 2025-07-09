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

    # ===== NOVOS MÉTODOS PARA MELHORIAS =====
    
    def get_paginas_disponiveis(self) -> Dict[str, Any]:
        """
        Buscar páginas disponíveis usando o fluxo correto da Graph API
        
        Endpoint: GET /me/accounts
        Permissões necessárias: pages_show_list, pages_read_engagement
        
        Returns:
            Dict com lista de páginas REAIS e seus access_tokens
        """
        try:
            print("🔍 DEBUG: Iniciando busca de páginas disponíveis...")
            
            # Endpoint correto para buscar páginas do usuário
            url = f"{self.base_url}/me/accounts"
            
            # Parâmetros da requisição
            params = {
                "access_token": self.access_token,  # Token de usuário
                "fields": "id,name,access_token,category,category_list,tasks"
            }
            
            print(f"🔍 DEBUG: URL: {url}")
            print(f"🔍 DEBUG: Campos solicitados: {params['fields']}")
            print(f"🔍 DEBUG: Usando token de usuário: {self.access_token[:20]}...")
            
            # Fazer requisição
            response = requests.get(url, params=params, timeout=30)
            
            print(f"📥 DEBUG: Status da resposta: {response.status_code}")
            
            # Verificar se a requisição foi bem-sucedida
            response.raise_for_status()
            
            # Parsear resposta JSON
            data = response.json()
            pages = data.get('data', [])
            
            print(f"📊 DEBUG: {len(pages)} páginas REAIS encontradas")
            
            # Log das páginas encontradas
            for i, page in enumerate(pages, 1):
                page_name = page.get('name', 'Sem nome')
                page_id = page.get('id', 'Sem ID')
                category = page.get('category', 'Sem categoria')
                has_token = 'Sim' if page.get('access_token') else 'Não'
                print(f"  📄 Página REAL {i}: {page_name} (ID: {page_id}) - Categoria: {category} - Token: {has_token}")
            
            # Verificar se encontrou páginas reais
            if not pages:
                return {
                    "success": False,
                    "error": "Nenhuma página encontrada na Business Manager. Verifique se o token tem as permissões corretas.",
                    "data": [],
                    "total": 0
                }
            
            # Retornar APENAS páginas reais
            return {
                "success": True,
                "data": pages,
                "total": len(pages),
                "message": f"Encontradas {len(pages)} páginas reais da Business Manager"
            }
            
        except requests.exceptions.HTTPError as e:
            # Erro HTTP (4xx, 5xx)
            error_msg = f'Erro HTTP na Graph API: {e.response.status_code}'
            print(f"❌ DEBUG: {error_msg}")
            
            try:
                error_data = e.response.json()
                if 'error' in error_data:
                    error_msg += f" - {error_data['error'].get('message', 'Erro desconhecido')}"
                    print(f"❌ DEBUG: Detalhes do erro: {error_data['error']}")
            except:
                pass
                
            return {
                "success": False,
                "error": error_msg,
                "data": [],
                "total": 0
            }
            
        except requests.exceptions.Timeout:
            # Timeout
            error_msg = 'Timeout na requisição à Graph API'
            print(f"⏰ DEBUG: {error_msg}")
            
            return {
                "success": False,
                "error": error_msg,
                "data": [],
                "total": 0
            }
            
        except requests.exceptions.RequestException as e:
            # Outros erros de requisição
            error_msg = f'Erro de conexão com a Graph API: {str(e)}'
            print(f"🌐 DEBUG: {error_msg}")
            
            return {
                "success": False,
                "error": error_msg,
                "data": [],
                "total": 0
            }
            
        except Exception as e:
            # Erro geral
            error_msg = f'Erro interno ao buscar páginas: {str(e)}'
            print(f"💥 DEBUG: {error_msg}")
            import traceback
            print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
            
            return {
                "success": False,
                "error": error_msg,
                "data": [],
                "total": 0
            }
    
    def get_publicacoes_pagina(self, pagina_id: str, token_pagina: str = None, limit: int = 20) -> Dict[str, Any]:
        """
        Buscar publicações de uma página específica usando o fluxo correto da Graph API
        
        Endpoint: GET /{page_id}/posts
        Token: page_access_token (obtido via /me/accounts)
        
        Args:
            pagina_id (str): ID da página do Facebook
            token_pagina (str): Token de acesso da página (opcional, será buscado se não fornecido)
            limit (int): Número máximo de publicações a retornar
        
        Returns:
            Dict com lista de publicações da página
        """
        try:
            print(f"🔍 DEBUG: Iniciando busca de publicações para página {pagina_id}")
            
            # Se token da página não foi fornecido, buscar via get_paginas_disponiveis
            if not token_pagina:
                print("🔍 DEBUG: Token da página não fornecido, buscando via /me/accounts...")
                
                pages_response = self.get_paginas_disponiveis()
                
                if not pages_response.get('success'):
                    return {
                        "success": False,
                        "error": f"Erro ao buscar páginas: {pages_response.get('error')}",
                        "data": [],
                        "total": 0
                    }
                
                # Encontrar a página específica
                target_page = None
                for page in pages_response.get('data', []):
                    if page.get('id') == pagina_id:
                        target_page = page
                        break
                
                if not target_page:
                    return {
                        "success": False,
                        "error": f"Página {pagina_id} não encontrada nas páginas disponíveis",
                        "data": [],
                        "total": 0
                    }
                
                token_pagina = target_page.get('access_token')
                if not token_pagina:
                    return {
                        "success": False,
                        "error": f"Token de acesso não encontrado para a página {pagina_id}",
                        "data": [],
                        "total": 0
                    }
                
                print(f"✅ DEBUG: Token da página obtido com sucesso")
            
            # Buscar publicações usando o token da página
            print(f"📝 DEBUG: Buscando publicações usando token da página...")
            
            # URL da Graph API para buscar posts da página
            url = f"{self.base_url}/{pagina_id}/posts"
            
            # Parâmetros da requisição - USAR TOKEN DA PÁGINA
            params = {
                'access_token': token_pagina,  # 🎯 SACADA: Token específico da página
                'fields': 'id,message,created_time',
                'limit': limit
            }
            
            print(f"🔍 DEBUG: URL: {url}")
            print(f"🔍 DEBUG: Campos solicitados: {params['fields']}")
            print(f"🔍 DEBUG: Usando token da página: {token_pagina[:20]}...")
            
            # Fazer requisição para a Graph API
            response = requests.get(url, params=params, timeout=30)
            
            print(f"📥 DEBUG: Status da resposta: {response.status_code}")
            
            # Verificar se a requisição foi bem-sucedida
            response.raise_for_status()
            
            # Parsear resposta JSON
            data = response.json()
            posts = data.get('data', [])
            
            print(f"📊 DEBUG: {len(posts)} publicações encontradas")
            
            # Estruturar dados para o frontend
            structured_posts = []
            
            for i, post in enumerate(posts, 1):
                # Estruturar cada post
                structured_post = {
                    'id': post.get('id', ''),
                    'message': post.get('message', post.get('story', '')),  # Usar story se message não existir
                    'created_time': post.get('created_time', ''),
                    'full_picture': post.get('full_picture', ''),
                    'permalink_url': post.get('permalink_url', ''),
                    'type': post.get('type', ''),
                    'platform': 'facebook',
                    'platform_name': 'Facebook',
                    'icon': '📘'
                }


                # 🖼️ BUSCAR THUMBNAIL DA IMAGEM (adicionar após structured_post)
try:
    # Tentar buscar object_id (para fotos)
    object_url = f"{self.base_url}/{post_id}"
    object_params = {
        'access_token': token_pagina,
        'fields': 'object_id'
    }
    
    object_response = requests.get(object_url, params=object_params, timeout=5)
    
    if object_response.status_code == 200:
        object_data = object_response.json()
        object_id = object_data.get('object_id')
        
        if object_id:
            # Se tem object_id, é uma foto - construir URL da thumbnail
            thumbnail_url = f"https://graph.facebook.com/v23.0/{object_id}/picture?access_token={token_pagina}&type=normal"
            structured_post['full_picture'] = thumbnail_url
        else:
            # Tentar buscar via endpoint de picture do post
            picture_url = f"https://graph.facebook.com/v23.0/{post_id}/picture?access_token={token_pagina}&redirect=false"
            
            picture_response = requests.get(picture_url, timeout=5)
            if picture_response.status_code == 200:
                picture_data = picture_response.json()
                if picture_data.get('data', {}).get('url'):
                    structured_post['full_picture'] = picture_data['data']['url']
                    
except Exception:
    # Se falhar, continuar sem imagem
    pass
                
                # Adicionar à lista
                structured_posts.append(structured_post)
                
                # Log do post para debug
                message_preview = structured_post['message'][:50] if structured_post['message'] else 'Sem texto'
                created_date = structured_post['created_time'][:10] if structured_post['created_time'] else 'Data desconhecida'
                
                print(f"  📝 Post {i}: {message_preview}...")
                print(f"     📅 Data: {created_date}")
                print(f"     🔗 Link: {structured_post['permalink_url']}")
                if structured_post['full_picture']:
                    print(f"     🖼️ Imagem: Sim")
            
            # Retornar resposta estruturada
            return {
                'success': True,
                'data': structured_posts,
                'total': len(structured_posts),
                'page_id': pagina_id,
                'message': f'Encontradas {len(structured_posts)} publicações'
            }
            
        except requests.exceptions.HTTPError as e:
            # Erro HTTP (4xx, 5xx)
            error_msg = f'Erro HTTP na Graph API: {e.response.status_code}'
            print(f"❌ DEBUG: {error_msg}")
            
            try:
                error_data = e.response.json()
                if 'error' in error_data:
                    error_msg += f" - {error_data['error'].get('message', 'Erro desconhecido')}"
                    print(f"❌ DEBUG: Detalhes do erro: {error_data['error']}")
            except:
                pass
                
            return {
                'success': False,
                'error': error_msg,
                'data': [],
                'total': 0
            }
            
        except requests.exceptions.Timeout:
            # Timeout
            error_msg = 'Timeout na requisição à Graph API'
            print(f"⏰ DEBUG: {error_msg}")
            
            return {
                'success': False,
                'error': error_msg,
                'data': [],
                'total': 0
            }
            
        except requests.exceptions.RequestException as e:
            # Outros erros de requisição
            error_msg = f'Erro de conexão com a Graph API: {str(e)}'
            print(f"🌐 DEBUG: {error_msg}")
            
            return {
                'success': False,
                'error': error_msg,
                'data': [],
                'total': 0
            }
            
        except Exception as e:
            # Erro geral
            error_msg = f'Erro interno ao buscar publicações: {str(e)}'
            print(f"💥 DEBUG: {error_msg}")
            import traceback
            print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
            
            return {
                'success': False,
                'error': error_msg,
                'data': [],
                'total': 0
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

    def get_page_posts(self, page_id: str, limit: int = 20) -> Dict[str, Any]:
        """
        Buscar publicações de uma página do Facebook
        
        Args:
            page_id: ID da página do Facebook
            limit: Número máximo de posts a retornar
            
        Returns:
            Dict com lista de posts e metadados
        """
        try:
            # Buscar posts da página
            url = f"https://graph.facebook.com/v18.0/{page_id}/posts"
            params = {
                'access_token': self.access_token,
                'fields': 'id,message,created_time,full_picture,attachments{media,type,url},likes.summary(true),comments.summary(true),shares',
                'limit': limit
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            posts = data.get('data', [])
            
            # Formatar posts para o frontend
            formatted_posts = []
            for post in posts:
                formatted_post = {
                    'id': post.get('id'),
                    'message': post.get('message', ''),
                    'created_time': post.get('created_time'),
                    'engagement': {
                        'likes': post.get('likes', {}).get('summary', {}).get('total_count', 0),
                        'comments': post.get('comments', {}).get('summary', {}).get('total_count', 0),
                        'shares': post.get('shares', {}).get('count', 0)
                    }
                }
                
                # Adicionar mídia se existir
                if post.get('full_picture'):
                    formatted_post['media'] = {
                        'type': 'image',
                        'url': post['full_picture']
                    }
                elif post.get('attachments'):
                    attachments = post['attachments'].get('data', [])
                    if attachments:
                        attachment = attachments[0]
                        formatted_post['media'] = {
                            'type': attachment.get('type', 'unknown'),
                            'url': attachment.get('media', {}).get('image', {}).get('src', '')
                        }
                
                formatted_posts.append(formatted_post)
            
            return {
                'success': True,
                'posts': formatted_posts,
                'total': len(formatted_posts)
            }
            
        except requests.exceptions.RequestException as e:
            print(f"Erro ao buscar posts da página {page_id}: {e}")
            return {
                'success': False,
                'error': f'Erro na API do Facebook: {str(e)}',
                'posts': []
            }
        except Exception as e:
            print(f"Erro inesperado ao buscar posts: {e}")
            return {
                'success': False,
                'error': f'Erro interno: {str(e)}',
                'posts': []
            }

    def get_instagram_posts(self, page_id: str, limit: int = 20) -> Dict[str, Any]:
        """
        Buscar publicações do Instagram conectado a uma página do Facebook
        
        Args:
            page_id: ID da página do Facebook
            limit: Número máximo de posts a retornar
            
        Returns:
            Dict com lista de posts do Instagram e metadados
        """
        try:
            # Primeiro, buscar a conta do Instagram conectada à página
            url = f"https://graph.facebook.com/v18.0/{page_id}"
            params = {
                'access_token': self.access_token,
                'fields': 'instagram_business_account'
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            page_data = response.json()
            instagram_account = page_data.get('instagram_business_account')
            
            if not instagram_account:
                return {
                    'success': False,
                    'error': 'Esta página não tem uma conta do Instagram conectada',
                    'posts': []
                }
            
            instagram_account_id = instagram_account['id']
            
            # Buscar posts do Instagram
            url = f"https://graph.facebook.com/v18.0/{instagram_account_id}/media"
            params = {
                'access_token': self.access_token,
                'fields': 'id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count',
                'limit': limit
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            posts = data.get('data', [])
            
            # Formatar posts para o frontend
            formatted_posts = []
            for post in posts:
                formatted_post = {
                    'id': post.get('id'),
                    'message': post.get('caption', ''),
                    'created_time': post.get('timestamp'),
                    'engagement': {
                        'likes': post.get('like_count', 0),
                        'comments': post.get('comments_count', 0),
                        'shares': 0  # Instagram não tem shares públicos
                    }
                }
                
                # Adicionar mídia
                media_type = post.get('media_type', '').lower()
                if media_type in ['image', 'carousel_album']:
                    formatted_post['media'] = {
                        'type': 'image',
                        'url': post.get('media_url', '')
                    }
                elif media_type == 'video':
                    formatted_post['media'] = {
                        'type': 'video',
                        'url': post.get('thumbnail_url', post.get('media_url', ''))
                    }
                
                formatted_posts.append(formatted_post)
            
            return {
                'success': True,
                'posts': formatted_posts,
                'total': len(formatted_posts)
            }
            
        except requests.exceptions.RequestException as e:
            print(f"Erro ao buscar posts do Instagram para página {page_id}: {e}")
            return {
                'success': False,
                'error': f'Erro na API do Facebook/Instagram: {str(e)}',
                'posts': []
            }
        except Exception as e:
            print(f"Erro inesperado ao buscar posts do Instagram: {e}")
            return {
                'success': False,
                'error': f'Erro interno: {str(e)}',
                'posts': []
            }

    def create_ad_from_post(self, ad_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Criar anúncio a partir de uma publicação existente
        
        Args:
            ad_data: Dados do anúncio incluindo post_id, campaign_name, budget, etc.
            
        Returns:
            Dict com resultado da criação do anúncio
        """
        try:
            post_id = ad_data['post_id']
            campaign_name = ad_data['campaign_name']
            budget = ad_data['budget']
            target_audience = ad_data['target_audience']
            
            # 1. Criar campanha
            campaign_data = {
                'name': campaign_name,
                'objective': 'REACH',  # ou outro objetivo baseado no tipo de post
                'status': 'PAUSED',
                'access_token': self.access_token
            }
            
            campaign_url = f"https://graph.facebook.com/v18.0/act_{self.ad_account_id}/campaigns"
            campaign_response = requests.post(campaign_url, data=campaign_data)
            campaign_response.raise_for_status()
            
            campaign_result = campaign_response.json()
            campaign_id = campaign_result['id']
            
            # 2. Criar conjunto de anúncios
            adset_data = {
                'name': f"{campaign_name} - Conjunto",
                'campaign_id': campaign_id,
                'daily_budget': int(float(budget) * 100),  # Converter para centavos
                'billing_event': 'IMPRESSIONS',
                'optimization_goal': 'REACH',
                'bid_amount': 100,  # Valor em centavos
                'targeting': json.dumps(target_audience),
                'status': 'PAUSED',
                'access_token': self.access_token
            }
            
            adset_url = f"https://graph.facebook.com/v18.0/act_{self.ad_account_id}/adsets"
            adset_response = requests.post(adset_url, data=adset_data)
            adset_response.raise_for_status()
            
            adset_result = adset_response.json()
            adset_id = adset_result['id']
            
            # 3. Criar criativo usando o post existente
            creative_data = {
                'name': f"{campaign_name} - Criativo",
                'object_story_id': post_id,  # Usar o post existente
                'access_token': self.access_token
            }
            
            creative_url = f"https://graph.facebook.com/v18.0/act_{self.ad_account_id}/adcreatives"
            creative_response = requests.post(creative_url, data=creative_data)
            creative_response.raise_for_status()
            
            creative_result = creative_response.json()
            creative_id = creative_result['id']
            
            # 4. Criar anúncio
            ad_data_final = {
                'name': f"{campaign_name} - Anúncio",
                'adset_id': adset_id,
                'creative': json.dumps({'creative_id': creative_id}),
                'status': 'PAUSED',
                'access_token': self.access_token
            }
            
            ad_url = f"https://graph.facebook.com/v18.0/act_{self.ad_account_id}/ads"
            ad_response = requests.post(ad_url, data=ad_data_final)
            ad_response.raise_for_status()
            
            ad_result = ad_response.json()
            
            return {
                'success': True,
                'message': 'Anúncio criado com sucesso a partir da publicação existente',
                'campaign_id': campaign_id,
                'adset_id': adset_id,
                'creative_id': creative_id,
                'ad_id': ad_result['id']
            }
            
        except requests.exceptions.RequestException as e:
            print(f"Erro ao criar anúncio a partir do post {post_id}: {e}")
            return {
                'success': False,
                'error': f'Erro na API do Facebook: {str(e)}'
            }
        except Exception as e:
            print(f"Erro inesperado ao criar anúncio: {e}")
            return {
                'success': False,
                'error': f'Erro interno: {str(e)}'
            }


# Instanciar o serviço usando variáveis de ambiente
FACEBOOK_ACCESS_TOKEN = os.getenv("FACEBOOK_ACCESS_TOKEN")
FACEBOOK_AD_ACCOUNT_ID = os.getenv("FACEBOOK_AD_ACCOUNT_ID")

facebook_data_service = None
if FACEBOOK_ACCESS_TOKEN and FACEBOOK_AD_ACCOUNT_ID:
    facebook_data_service = FacebookDataService(FACEBOOK_ACCESS_TOKEN, FACEBOOK_AD_ACCOUNT_ID)
else:
    print("ATENÇÃO: FACEBOOK_ACCESS_TOKEN ou FACEBOOK_AD_ACCOUNT_ID não configurados. O serviço de dados do Facebook não estará disponível.")

