import os
import requests
from datetime import datetime, timedelta
import json

class FacebookDataService:
    def __init__(self):
        self.access_token = os.getenv('FACEBOOK_ACCESS_TOKEN')
        self.ad_account_id = os.getenv('FACEBOOK_AD_ACCOUNT_ID')
        self.business_manager_id = os.getenv('FACEBOOK_BUSINESS_MANAGER_ID')
        self.app_id = os.getenv('FACEBOOK_APP_ID')
        self.app_secret = os.getenv('FACEBOOK_APP_SECRET')
        self.base_url = 'https://graph.facebook.com/v18.0'
        
        print(f"🔧 FacebookDataService inicializado")
        print(f"📊 Access Token: {'✅ Configurado' if self.access_token else '❌ Não configurado'}")
        print(f"📊 Ad Account ID: {'✅ Configurado' if self.ad_account_id else '❌ Não configurado'}")
        print(f"📊 Business Manager ID: {'✅ Configurado' if self.business_manager_id else '❌ Não configurado'}")

    def _make_request(self, endpoint, params=None, method='GET'):
        """Fazer requisição para a API do Facebook"""
        if not self.access_token:
            return {'error': 'Access token não configurado'}
        
        url = f"{self.base_url}/{endpoint}"
        
        if params is None:
            params = {}
        
        params['access_token'] = self.access_token
        
        try:
            if method == 'GET':
                response = requests.get(url, params=params, timeout=30)
            elif method == 'POST':
                response = requests.post(url, data=params, timeout=30)
            else:
                return {'error': f'Método HTTP não suportado: {method}'}
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.Timeout:
            return {'error': 'Timeout na requisição para Facebook API'}
        except requests.exceptions.RequestException as e:
            return {'error': f'Erro na requisição: {str(e)}'}
        except json.JSONDecodeError:
            return {'error': 'Resposta inválida da API do Facebook'}

    def get_ad_account_info(self):
        """Buscar informações da conta de anúncios"""
        if not self.ad_account_id:
            return {'error': 'Ad Account ID não configurado'}
        
        endpoint = f"act_{self.ad_account_id}"
        params = {
            'fields': 'name,account_status,balance,currency,timezone_name,business'
        }
        
        result = self._make_request(endpoint, params)
        
        if 'error' in result:
            return result
        
        return {
            'account_id': result.get('id'),
            'name': result.get('name'),
            'status': result.get('account_status'),
            'balance': result.get('balance'),
            'currency': result.get('currency'),
            'timezone': result.get('timezone_name'),
            'business': result.get('business')
        }

    def get_dashboard_summary(self):
        """Buscar resumo para o dashboard"""
        try:
            # Buscar estatísticas da conta
            account_stats = self.get_account_insights()
            
            # Buscar estatísticas de campanhas
            campaigns = self.get_campaigns()
            
            if 'error' in account_stats:
                return {'success': False, 'error': account_stats['error']}
            
            # Contar campanhas ativas
            active_campaigns = 0
            if campaigns and 'data' in campaigns:
                active_campaigns = len([c for c in campaigns['data'] if c.get('status') == 'ACTIVE'])
            
            return {
                'success': True,
                'data': {
                    'account_stats': account_stats,
                    'campaign_stats': {
                        'total': len(campaigns.get('data', [])) if campaigns else 0,
                        'active': active_campaigns,
                        'paused': len(campaigns.get('data', [])) - active_campaigns if campaigns else 0
                    }
                }
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_dashboard_data(self):
        """Buscar dados completos do dashboard"""
        return self.get_dashboard_summary()

    def get_campaigns(self):
        """Buscar campanhas da conta"""
        if not self.ad_account_id:
            return {'error': 'Ad Account ID não configurado'}
        
        endpoint = f"act_{self.ad_account_id}/campaigns"
        params = {
            'fields': 'id,name,status,objective,created_time,updated_time,start_time,stop_time,budget_remaining,daily_budget,lifetime_budget',
            'limit': 100
        }
        
        return self._make_request(endpoint, params)

    def get_adsets(self):
        """Buscar conjuntos de anúncios"""
        if not self.ad_account_id:
            return {'error': 'Ad Account ID não configurado'}
        
        endpoint = f"act_{self.ad_account_id}/adsets"
        params = {
            'fields': 'id,name,status,campaign_id,created_time,updated_time,start_time,end_time,daily_budget,lifetime_budget,targeting',
            'limit': 100
        }
        
        return self._make_request(endpoint, params)

    def get_ads(self):
        """Buscar anúncios"""
        if not self.ad_account_id:
            return {'error': 'Ad Account ID não configurado'}
        
        endpoint = f"act_{self.ad_account_id}/ads"
        params = {
            'fields': 'id,name,status,adset_id,campaign_id,created_time,updated_time,creative',
            'limit': 100
        }
        
        return self._make_request(endpoint, params)

    def get_campaign_insights(self, campaign_id):
        """Buscar insights de uma campanha específica"""
        endpoint = f"{campaign_id}/insights"
        params = {
            'fields': 'impressions,clicks,spend,ctr,cpc,cpm,reach,frequency',
            'date_preset': 'last_7_days'
        }
        
        return self._make_request(endpoint, params)

    def get_account_insights(self):
        """Buscar insights da conta"""
        if not self.ad_account_id:
            return {'error': 'Ad Account ID não configurado'}
        
        endpoint = f"act_{self.ad_account_id}/insights"
        params = {
            'fields': 'impressions,clicks,spend,ctr,cpc,cpm,reach,frequency',
            'date_preset': 'last_7_days'
        }
        
        result = self._make_request(endpoint, params)
        
        if 'error' in result:
            return result
        
        # Se há dados, retornar o primeiro item (dados agregados)
        if 'data' in result and len(result['data']) > 0:
            return result['data'][0]
        
        # Se não há dados, retornar zeros
        return {
            'impressions': '0',
            'clicks': '0',
            'spend': '0.00',
            'ctr': '0.00',
            'cpc': '0.00',
            'cpm': '0.00',
            'reach': '0',
            'frequency': '0.00'
        }

    def get_chart_data(self, days=7):
        """Buscar dados para gráficos"""
        if not self.ad_account_id:
            return {'success': False, 'error': 'Ad Account ID não configurado'}
        
        endpoint = f"act_{self.ad_account_id}/insights"
        params = {
            'fields': 'impressions,clicks,spend,date_start',
            'date_preset': f'last_{days}_days',
            'time_increment': 1  # Dados diários
        }
        
        result = self._make_request(endpoint, params)
        
        if 'error' in result:
            return {'success': False, 'error': result['error']}
        
        # Formatar dados para o gráfico
        chart_data = []
        if 'data' in result:
            for item in result['data']:
                chart_data.append({
                    'date': item.get('date_start'),
                    'impressions': int(item.get('impressions', 0)),
                    'clicks': int(item.get('clicks', 0)),
                    'spend': float(item.get('spend', 0))
                })
        
        return {'success': True, 'data': chart_data}

    def get_business_managers(self):
        """Buscar Business Managers disponíveis"""
        endpoint = "me/businesses"
        params = {
            'fields': 'id,name,verification_status,created_time'
        }
        
        return self._make_request(endpoint, params)

    # ===== CORREÇÃO: MÉTODO PARA BUSCAR PÁGINAS REAIS DA BUSINESS MANAGER =====
    def get_business_manager_pages(self):
        """Buscar páginas reais da Business Manager"""
        print("🔍 Buscando páginas reais da Business Manager...")
        
        if not self.business_manager_id:
            print("⚠️ Business Manager ID não configurado")
            return {'success': False, 'error': 'Business Manager ID não configurado'}
        
        try:
            # Tentar buscar páginas através da Business Manager
            endpoint = f"{self.business_manager_id}/owned_pages"
            params = {
                'fields': 'id,name,category,verification_status,followers_count,access_token,is_verified,about,website,phone,emails'
            }
            
            result = self._make_request(endpoint, params)
            
            if 'error' in result:
                print(f"❌ Erro ao buscar páginas da BM: {result['error']}")
                
                # Fallback: tentar buscar páginas do usuário
                print("🔄 Tentando buscar páginas do usuário...")
                endpoint = "me/accounts"
                params = {
                    'fields': 'id,name,category,verification_status,followers_count,access_token,is_verified'
                }
                
                user_result = self._make_request(endpoint, params)
                
                if 'error' in user_result:
                    print(f"❌ Erro ao buscar páginas do usuário: {user_result['error']}")
                    return {'success': False, 'error': user_result['error']}
                
                result = user_result
            
            if 'data' in result:
                pages = []
                for page_data in result['data']:
                    page = {
                        'id': page_data.get('id'),
                        'name': page_data.get('name'),
                        'category': page_data.get('category', 'Página'),
                        'access_token': page_data.get('access_token'),
                        'is_verified': page_data.get('is_verified', False),
                        'verification_status': page_data.get('verification_status', 'not_verified'),
                        'followers_count': page_data.get('followers_count', 0),
                        'about': page_data.get('about', ''),
                        'website': page_data.get('website', ''),
                        'phone': page_data.get('phone', ''),
                        'emails': page_data.get('emails', [])
                    }
                    pages.append(page)
                
                print(f"✅ {len(pages)} páginas reais encontradas")
                return {'success': True, 'pages': pages}
            else:
                print("⚠️ Nenhuma página encontrada na resposta")
                return {'success': False, 'error': 'Nenhuma página encontrada'}
                
        except Exception as e:
            print(f"❌ Exceção ao buscar páginas: {str(e)}")
            return {'success': False, 'error': f'Erro interno: {str(e)}'}

    def get_pages(self):
        """Método legado - redireciona para get_business_manager_pages"""
        return self.get_business_manager_pages()

    def sync_data(self, business_manager_id):
        """Sincronizar dados de uma Business Manager específica"""
        try:
            # Atualizar Business Manager ID
            self.business_manager_id = business_manager_id
            
            # Buscar dados atualizados
            pages = self.get_business_manager_pages()
            campaigns = self.get_campaigns()
            insights = self.get_account_insights()
            
            return {
                'success': True,
                'data': {
                    'pages': pages,
                    'campaigns': campaigns,
                    'insights': insights,
                    'synced_at': datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def pause_campaign(self, campaign_id):
        """Pausar uma campanha"""
        endpoint = f"{campaign_id}"
        params = {
            'status': 'PAUSED'
        }
        
        result = self._make_request(endpoint, params, method='POST')
        
        if 'error' in result:
            return {'success': False, 'error': result['error']}
        
        return {'success': True, 'message': 'Campanha pausada com sucesso'}

    def activate_campaign(self, campaign_id):
        """Ativar uma campanha"""
        endpoint = f"{campaign_id}"
        params = {
            'status': 'ACTIVE'
        }
        
        result = self._make_request(endpoint, params, method='POST')
        
        if 'error' in result:
            return {'success': False, 'error': result['error']}
        
        return {'success': True, 'message': 'Campanha ativada com sucesso'}

    def update_campaign(self, campaign_id, data):
        """Atualizar configurações de uma campanha"""
        endpoint = f"{campaign_id}"
        
        # Mapear campos permitidos
        allowed_fields = ['name', 'status', 'daily_budget', 'lifetime_budget']
        params = {}
        
        for field in allowed_fields:
            if field in data:
                params[field] = data[field]
        
        if not params:
            return {'success': False, 'error': 'Nenhum campo válido para atualizar'}
        
        result = self._make_request(endpoint, params, method='POST')
        
        if 'error' in result:
            return {'success': False, 'error': result['error']}
        
        return {'success': True, 'message': 'Campanha atualizada com sucesso'}

    def get_campaign_details(self, campaign_id):
        """Buscar detalhes completos de uma campanha"""
        endpoint = f"{campaign_id}"
        params = {
            'fields': 'id,name,status,objective,created_time,updated_time,start_time,stop_time,budget_remaining,daily_budget,lifetime_budget,bid_strategy,optimization_goal'
        }
        
        result = self._make_request(endpoint, params)
        
        if 'error' in result:
            return {'success': False, 'error': result['error']}
        
        # Buscar insights da campanha
        insights = self.get_campaign_insights(campaign_id)
        
        return {
            'success': True,
            'data': {
                'campaign': result,
                'insights': insights
            }
        }

# Instância global do serviço
try:
    facebook_data_service = FacebookDataService()
except Exception as e:
    print(f"❌ Erro ao inicializar FacebookDataService: {str(e)}")
    facebook_data_service = None

