from flask import Blueprint, request, jsonify
from src.services.facebook_data_service import facebook_data_service
from datetime import datetime, timedelta

# Imports dos serviços de IA com fallback
try:
    from src.services.ai_ad_generation_service import AIAdGenerationService
    ai_ad_service = AIAdGenerationService()
    print("✅ ai_ad_service importado com sucesso")
except ImportError as e:
    print(f"⚠️ WARNING: ai_ad_generation_service não encontrado: {e}")
    ai_ad_service = None

try:
    from src.services.facebook_ai_integration import facebook_ai_integration
    print("✅ facebook_ai_integration importado com sucesso")
except ImportError as e:
    print(f"⚠️ WARNING: facebook_ai_integration não encontrado: {e}")
    facebook_ai_integration = None

facebook_data_bp = Blueprint('facebook_data', __name__)

@facebook_data_bp.route('/facebook/account-info', methods=['GET'])
def get_account_info():
    """Buscar informações da conta de anúncios do Facebook"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        result = facebook_data_service.get_ad_account_info()
        
        if "error" in result:
            return jsonify({'success': False, 'error': result['error']}), 500
        
        return jsonify({'success': True, 'data': result})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/dashboard-summary', methods=['GET'])
def get_dashboard_summary():
    """Buscar resumo para o dashboard principal"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        result = facebook_data_service.get_dashboard_summary()
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/dashboard', methods=['GET'])
def get_dashboard():
    """Buscar dados do dashboard no formato esperado pelo frontend"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        # Buscar dados do dashboard
        dashboard_summary = facebook_data_service.get_dashboard_summary()
        
        if not dashboard_summary.get("success"):
            return jsonify({
                'success': False, 
                'error': dashboard_summary.get("error", "Erro ao buscar dados do dashboard")
            }), 500
        
        summary_data = dashboard_summary.get("data", {})
        performance_7d = summary_data.get("performance_7d", {})
        campaign_stats = summary_data.get("campaign_stats", {})
        
        # Formatar dados no formato esperado pelo frontend
        dashboard_data = {
            "impressions": performance_7d.get("impressions", 0),
            "clicks": performance_7d.get("clicks", 0),
            "spent": performance_7d.get("spend", 0),  # Converter 'spend' para 'spent'
            "active_campaigns": campaign_stats.get("active", 0),
            "ctr": performance_7d.get("ctr", 0),
            "cpc": performance_7d.get("cpc", 0),
            "cpm": performance_7d.get("cpm", 0)
        }
        
        return jsonify({
            'success': True,
            'data': dashboard_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/campaigns', methods=['GET'])
def get_campaigns():
    """Buscar campanhas da conta de anúncios"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        limit = request.args.get('limit', 50, type=int)
        result = facebook_data_service.get_campaigns(limit)
        
        if "error" in result:
            return jsonify({'success': False, 'error': result['error']}), 500
        
        return jsonify({'success': True, 'data': result})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/adsets', methods=['GET'])
def get_adsets():
    """Buscar conjuntos de anúncios"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        campaign_id = request.args.get('campaign_id')
        limit = request.args.get('limit', 50, type=int)
        
        result = facebook_data_service.get_adsets(campaign_id, limit)
        
        if "error" in result:
            return jsonify({'success': False, 'error': result['error']}), 500
        
        return jsonify({'success': True, 'data': result})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/ads', methods=['GET'])
def get_ads():
    """Buscar anúncios"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        adset_id = request.args.get('adset_id')
        limit = request.args.get('limit', 50, type=int)
        
        result = facebook_data_service.get_ads(adset_id, limit)
        
        if "error" in result:
            return jsonify({'success': False, 'error': result['error']}), 500
        
        return jsonify({'success': True, 'data': result})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/insights/campaign/<campaign_id>', methods=['GET'])
def get_campaign_insights(campaign_id):
    """Buscar insights de performance de uma campanha"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        date_preset = request.args.get('date_preset', 'last_7_days')
        result = facebook_data_service.get_campaign_insights(campaign_id, date_preset)
        
        if "error" in result:
            return jsonify({'success': False, 'error': result['error']}), 500
        
        return jsonify({'success': True, 'data': result})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/insights/account', methods=['GET'])
def get_account_insights():
    """Buscar insights de performance da conta"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        date_preset = request.args.get('date_preset', 'last_7_days')
        result = facebook_data_service.get_account_insights(date_preset)
        
        if "error" in result:
            return jsonify({'success': False, 'error': result['error']}), 500
        
        return jsonify({'success': True, 'data': result})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/chart-data', methods=['GET'])
def get_chart_data():
    """Buscar dados para gráficos de performance"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        days = request.args.get('days', 7, type=int)
        result = facebook_data_service.get_campaign_performance_chart_data(days)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/business-managers', methods=['GET'])
def get_business_managers():
    """Buscar Business Managers conectados (simulado por enquanto)"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        # Por enquanto, retornamos apenas a BM atual configurada
        account_info = facebook_data_service.get_ad_account_info()
        
        if "error" in account_info:
            return jsonify({'success': False, 'error': account_info['error']}), 500
        
        # Simular lista de BMs (por enquanto apenas uma)
        business_managers = [
            {
                "id": facebook_data_service.ad_account_id,
                "name": account_info.get("name", "Conta de Anúncios"),
                "business_name": account_info.get("business_name", "Monte Castello"),
                "currency": account_info.get("currency", "BRL"),
                "status": account_info.get("account_status", "ACTIVE"),
                "is_connected": True,
                "last_sync": datetime.now().isoformat()
            }
        ]
        
        return jsonify({
            'success': True, 
            'data': business_managers,
            'total': len(business_managers)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/sync-data', methods=['POST'])
def sync_facebook_data():
    """Sincronizar dados do Facebook (forçar atualização)"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        # Buscar dados atualizados
        dashboard_summary = facebook_data_service.get_dashboard_summary()
        
        if dashboard_summary.get("success"):
            return jsonify({
                'success': True, 
                'message': 'Dados sincronizados com sucesso',
                'last_sync': datetime.now().isoformat(),
                'data': dashboard_summary.get("data")
            })
        else:
            return jsonify({
                'success': False, 
                'error': dashboard_summary.get("error", "Erro na sincronização")
            }), 500
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/campaigns/<campaign_id>/pause', methods=['POST'])
def pause_campaign(campaign_id):
    """Pausar uma campanha específica"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        result = facebook_data_service.pause_campaign(campaign_id)
        
        if result.get("success"):
            return jsonify({
                'success': True,
                'message': 'Campanha pausada com sucesso',
                'campaign_id': campaign_id,
                'new_status': 'PAUSED'
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get("error", "Erro ao pausar campanha")
            }), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/campaigns/<campaign_id>/activate', methods=['POST'])
def activate_campaign(campaign_id):
    """Ativar uma campanha específica"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        result = facebook_data_service.activate_campaign(campaign_id)
        
        if result.get("success"):
            return jsonify({
                'success': True,
                'message': 'Campanha ativada com sucesso',
                'campaign_id': campaign_id,
                'new_status': 'ACTIVE'
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get("error", "Erro ao ativar campanha")
            }), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/test-endpoint', methods=['POST'])
def test_endpoint():
    """Endpoint de teste para verificar se POST funciona"""
    print("🔍 DEBUG: Endpoint de teste chamado!")
    print(f"🔍 DEBUG: Método: {request.method}")
    return jsonify({
        'success': True,
        'message': 'Endpoint de teste funcionando',
        'method': request.method
    })

@facebook_data_bp.route('/facebook/campaigns/<campaign_id>/toggle', methods=['POST'])
def toggle_campaign_status(campaign_id):
    """Alternar status da campanha (pausar se ativa, ativar se pausada)"""
    print(f"🔍 DEBUG: Endpoint toggle chamado para campaign_id: {campaign_id}")
    print(f"🔍 DEBUG: Método da requisição: {request.method}")
    print(f"🔍 DEBUG: Headers da requisição: {dict(request.headers)}")
    
    if not facebook_data_service:
        print("❌ DEBUG: facebook_data_service não configurado")
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        print("🔍 DEBUG: Tentando obter dados da requisição...")
        # Obter dados da requisição
        data = request.get_json() or {}
        current_status = data.get('current_status', '')
        
        print(f"🔍 DEBUG: Dados recebidos: {data}")
        print(f"🔍 DEBUG: Status atual: {current_status}")
        
        if not current_status:
            print("❌ DEBUG: Status atual não fornecido")
            return jsonify({
                'success': False,
                'error': 'Status atual da campanha é obrigatório'
            }), 400
        
        print(f"🔍 DEBUG: Chamando toggle_campaign_status no service...")
        result = facebook_data_service.toggle_campaign_status(campaign_id, current_status)
        print(f"🔍 DEBUG: Resultado do service: {result}")
        
        if result.get("success"):
            new_status = "PAUSED" if current_status.upper() == "ACTIVE" else "ACTIVE"
            print(f"✅ DEBUG: Sucesso! Novo status: {new_status}")
            return jsonify({
                'success': True,
                'message': result.get("message"),
                'campaign_id': campaign_id,
                'old_status': current_status.upper(),
                'new_status': new_status
            })
        else:
            print(f"❌ DEBUG: Erro do service: {result.get('error')}")
            return jsonify({
                'success': False,
                'error': result.get("error", "Erro ao alterar status da campanha")
            }), 500
            
    except Exception as e:
        print(f"💥 DEBUG: Exceção capturada: {str(e)}")
        import traceback
        print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'error': str(e)}), 500


@facebook_data_bp.route('/facebook/campaigns/<campaign_id>/update', methods=['PUT'])
def update_campaign(campaign_id):
    """Atualizar configurações de uma campanha"""
    print(f"🔍 DEBUG: Endpoint update_campaign chamado para campaign_id: {campaign_id}")
    
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        # Obter dados do corpo da requisição
        data = request.get_json()
        print(f"🔍 DEBUG: Dados recebidos: {data}")
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados não fornecidos'
            }), 400
        
        # Chamar serviço para atualizar campanha
        result = facebook_data_service.update_campaign(campaign_id, data)
        print(f"🔍 DEBUG: Resultado do service: {result}")
        
        if result.get("success"):
            return jsonify({
                'success': True,
                'message': 'Campanha atualizada com sucesso',
                'campaign': result.get("campaign", {})
            })
        else:
            print(f"❌ DEBUG: Erro do service: {result.get('error')}")
            return jsonify({
                'success': False,
                'error': result.get("error", "Erro ao atualizar campanha")
            }), 500
            
    except Exception as e:
        print(f"💥 DEBUG: Exceção capturada: {str(e)}")
        import traceback
        print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/campaigns/<campaign_id>/details', methods=['GET'])
def get_campaign_details(campaign_id):
    """Buscar detalhes completos de uma campanha para edição"""
    print(f"🔍 DEBUG: Endpoint get_campaign_details chamado para campaign_id: {campaign_id}")
    
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        # Chamar serviço para buscar detalhes da campanha
        result = facebook_data_service.get_campaign_details(campaign_id)
        print(f"🔍 DEBUG: Resultado do service: {result}")
        
        if result.get("success"):
            return jsonify({
                'success': True,
                'campaign': result.get("campaign", {})
            })
        else:
            print(f"❌ DEBUG: Erro do service: {result.get('error')}")
            return jsonify({
                'success': False,
                'error': result.get("error", "Erro ao buscar detalhes da campanha")
            }), 500
            
    except Exception as e:
        print(f"💥 DEBUG: Exceção capturada: {str(e)}")
        import traceback
        print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ===== NOVOS ENDPOINTS PARA MELHORIAS =====

@facebook_data_bp.route('/facebook/pages', methods=['GET'])
def get_pages():
    """Buscar páginas disponíveis do usuário usando o fluxo correto da Graph API"""
    print("🔍 DEBUG: Endpoint get_pages chamado")
    
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        # Usar o novo método que implementa o fluxo correto
        result = facebook_data_service.get_paginas_disponiveis()
        print(f"🔍 DEBUG: Resultado do service: {result}")
        
        if result.get("success"):
            return jsonify({
                'success': True,
                'data': result.get("data", []),
                'total': result.get("total", 0),
                'message': result.get("message", "")
            })
        else:
            print(f"❌ DEBUG: Erro do service: {result.get('error')}")
            # NÃO RETORNAR PÁGINAS FAKE - Retornar erro real
            return jsonify({
                'success': False,
                'error': result.get('error', 'Erro ao buscar páginas'),
                'data': [],
                'total': 0
            }), 500
            
    except Exception as e:
        print(f"💥 DEBUG: Exceção capturada: {str(e)}")
        import traceback
        print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
        
        # NÃO RETORNAR PÁGINAS FAKE - Retornar erro real
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}',
            'data': [],
            'total': 0
        }), 500

@facebook_data_bp.route('/facebook/posts', methods=['POST'])
def get_facebook_posts():
    """Buscar publicações do Facebook de uma página específica usando o fluxo correto da Graph API"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        data = request.get_json()
        page_id = data.get('page_id')
        page_access_token = data.get('page_access_token')  # Opcional
        limit = data.get('limit', 20)
        
        print(f"🔍 DEBUG: Rota /facebook/posts chamada")
        print(f"🔍 DEBUG: page_id: {page_id}")
        print(f"🔍 DEBUG: page_access_token fornecido: {'Sim' if page_access_token else 'Não'}")
        print(f"🔍 DEBUG: limit: {limit}")
        
        if not page_id:
            return jsonify({
                'success': False,
                'error': 'page_id é obrigatório'
            }), 400
        
        # Usar o novo método que implementa o fluxo correto
        result = facebook_data_service.get_publicacoes_pagina(page_id, page_access_token, limit)
        
        print(f"🔍 DEBUG: Resultado do serviço: {result.get('success', False)}")
        if result.get('success'):
            print(f"🔍 DEBUG: {len(result.get('data', []))} posts retornados")
        else:
            print(f"🔍 DEBUG: Erro: {result.get('error', 'Erro desconhecido')}")
        
        # Ajustar formato de resposta para compatibilidade com frontend
        if result.get('success'):
            return jsonify({
                'success': True,
                'posts': result.get('data', []),
                'total': result.get('total', 0),
                'page_id': result.get('page_id', page_id),
                'message': result.get('message', '')
            })
        else:
            return jsonify(result)
        
    except Exception as e:
        print(f"💥 DEBUG: Exceção na rota: {str(e)}")
        import traceback
        print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/instagram-posts', methods=['POST'])
def get_instagram_posts():
    """Buscar publicações do Instagram conectado a uma página do Facebook"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        data = request.get_json()
        page_id = data.get('page_id')
        limit = data.get('limit', 20)
        
        if not page_id:
            return jsonify({
                'success': False,
                'error': 'page_id é obrigatório'
            }), 400
        
        result = facebook_data_service.get_instagram_posts(page_id, limit)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/create-ad-from-post', methods=['POST'])
def create_ad_from_existing_post():
    """Criar anúncio a partir de uma publicação existente"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['post_id', 'campaign_name', 'budget', 'target_audience']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'{field} é obrigatório'
                }), 400
        
        result = facebook_data_service.create_ad_from_post(data)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== ENDPOINTS DE IA PARA GERAÇÃO AUTOMÁTICA DE ANÚNCIOS =====

@facebook_data_bp.route('/facebook/generate-ad-with-ai', methods=['POST'])
def generate_ad_with_ai():
    """
    Gerar anúncio completo usando IA
    
    Body JSON:
    {
        "product_name": "Açougue",
        "product_description": "Encarte Digital Açougue",
        "page_id": "274934483000591",
        "platforms": ["facebook"],
        "selected_post": {...}  // Opcional
    }
    
    Returns:
        JSON com anúncio criado automaticamente pela IA
    """
    try:
        print("🤖📘 DEBUG: Endpoint /facebook/generate-ad-with-ai chamado")
        
        # Verificar se os serviços estão disponíveis
        if not ai_ad_service:
            print("❌ DEBUG: ai_ad_service não disponível")
            return jsonify({
                "success": False,
                "error": "Serviço de IA não está disponível. Verifique OPENAI_API_KEY."
            }), 500
        
        if not facebook_data_service:
            print("❌ DEBUG: facebook_data_service não disponível")
            return jsonify({
                "success": False,
                "error": "Serviço do Facebook não está disponível. Verifique tokens."
            }), 500
        
        # Obter dados do request
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Dados não fornecidos"
            }), 400
        
        # Validar campos obrigatórios
        required_fields = ["product_name", "product_description", "page_id", "platforms"]
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                "success": False,
                "error": f"Campos obrigatórios ausentes: {', '.join(missing_fields)}"
            }), 400
        
        print(f"🤖 DEBUG: Dados recebidos:")
        print(f"  📦 Produto: {data.get('product_name')}")
        print(f"  📝 Descrição: {data.get('product_description')}")
        print(f"  📄 Página ID: {data.get('page_id')}")
        print(f"  📱 Plataformas: {data.get('platforms')}")
        
        # Buscar informações da página selecionada
        pages_result = facebook_data_service.get_paginas_disponiveis()
        
        if not pages_result.get("success"):
            return jsonify({
                "success": False,
                "error": "Erro ao buscar páginas disponíveis"
            }), 500
        
        # Encontrar a página selecionada
        selected_page = None
        for page in pages_result.get("data", []):
            if page.get("id") == data.get("page_id"):
                selected_page = page
                break
        
        if not selected_page:
            return jsonify({
                "success": False,
                "error": f"Página {data.get('page_id')} não encontrada"
            }), 400
        
        page_name = selected_page.get("name", "Página")
        print(f"📄 DEBUG: Página encontrada: {page_name}")
        
        # Preparar dados para a IA
        ai_input_data = {
            "product_name": data.get("product_name"),
            "product_description": data.get("product_description"),
            "platforms": data.get("platforms"),
            "page_name": page_name,
            "page_id": data.get("page_id"),
            "selected_post": data.get("selected_post")
        }
        
        # ETAPA 1: Gerar estrutura com IA
        print("🤖 DEBUG: Etapa 1 - Gerando estrutura com IA...")
        
        ai_result = ai_ad_service.generate_ad_structure(ai_input_data)
        
        if not ai_result.get("success"):
            return jsonify({
                "success": False,
                "error": f"Erro na geração com IA: {ai_result.get('error')}",
                "stage": "ai_generation"
            }), 500
        
        ai_structure = ai_result.get("ad_structure")
        print("✅ DEBUG: Estrutura gerada pela IA com sucesso")
        
        # ETAPA 2: Criar anúncio no Facebook (simulado por enquanto)
        print("📘 DEBUG: Etapa 2 - Preparando criação no Facebook...")
        
        # Por enquanto, retornar apenas a estrutura gerada pela IA
        # TODO: Implementar criação real no Facebook quando estiver pronto
        
        return jsonify({
            "success": True,
            "message": "Estrutura de anúncio gerada automaticamente pela IA",
            "ai_structure": ai_structure,
            "ai_analysis": ai_result.get("ai_analysis"),
            "page_info": {
                "id": selected_page.get("id"),
                "name": selected_page.get("name"),
                "category": selected_page.get("category")
            },
            "next_steps": [
                "Revisar estrutura gerada pela IA",
                "Ajustar configurações se necessário",
                "Confirmar criação do anúncio no Facebook"
            ],
            "preview": {
                "campaign_name": ai_structure.get("campaign", {}).get("name"),
                "daily_budget": f"R$ {ai_structure.get('adset', {}).get('daily_budget', 0):.2f}",
                "target_audience": ai_structure.get("analysis", {}).get("target_audience_reasoning", ""),
                "ad_copy": {
                    "headline": ai_structure.get("creative", {}).get("object_story_spec", {}).get("link_data", {}).get("name", ""),
                    "primary_text": ai_structure.get("creative", {}).get("object_story_spec", {}).get("link_data", {}).get("message", ""),
                    "cta": ai_structure.get("creative", {}).get("object_story_spec", {}).get("link_data", {}).get("call_to_action", {}).get("type", "")
                }
            }
        }), 200
        
    except Exception as e:
        print(f"💥 DEBUG: Exceção no endpoint: {str(e)}")
        import traceback
        print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
        
        return jsonify({
            "success": False,
            "error": f"Erro interno do servidor: {str(e)}"
        }), 500

@facebook_data_bp.route('/facebook/create-ad-from-ai', methods=['POST'])
def create_ad_from_ai_structure():
    """
    Criar anúncio no Facebook a partir de estrutura gerada pela IA
    
    Body JSON:
    {
        "ai_structure": {...},  // Estrutura gerada pela IA
        "page_id": "274934483000591",
        "selected_post": {...}  // Opcional
    }
    
    Returns:
        JSON com resultado da criação do anúncio no Facebook
    """
    try:
        print("📘🤖 DEBUG: Endpoint /facebook/create-ad-from-ai chamado")
        
        if not facebook_ai_integration:
            print("❌ DEBUG: facebook_ai_integration não disponível")
            return jsonify({
                "success": False,
                "error": "Integração IA-Facebook não está disponível"
            }), 500
        
        data = request.get_json()
        
        if not data or not data.get("ai_structure"):
            return jsonify({
                "success": False,
                "error": "Estrutura da IA é obrigatória"
            }), 400
        
        # Criar anúncio usando a integração
        result = facebook_ai_integration.create_ad_from_ai_structure(
            data.get("ai_structure"),
            data.get("selected_post")
        )
        
        if result.get("success"):
            return jsonify({
                "success": True,
                "message": "Anúncio criado com sucesso no Facebook",
                "campaign_id": result.get("campaign_id"),
                "adset_id": result.get("adset_id"),
                "creative_id": result.get("creative_id"),
                "ad_id": result.get("ad_id"),
                "next_steps": result.get("next_steps")
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error"),
                "step": result.get("step")
            }), 500
            
    except Exception as e:
        print(f"💥 DEBUG: Erro na criação: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Erro interno: {str(e)}"
        }), 500

@facebook_data_bp.route('/facebook/ai-health', methods=['GET'])
def check_ai_integration_health():
    """Verificar status da integração com IA"""
    try:
        status = {
            "ai_service": bool(ai_ad_service),
            "facebook_service": bool(facebook_data_service),
            "integration": bool(facebook_ai_integration),
            "openai_configured": False,
            "facebook_configured": False
        }
        
        if ai_ad_service and hasattr(ai_ad_service, 'openai_api_key'):
            status["openai_configured"] = bool(ai_ad_service.openai_api_key)
        
        if facebook_data_service and hasattr(facebook_data_service, 'access_token'):
            status["facebook_configured"] = bool(facebook_data_service.access_token)
        
        all_ready = all([
            status["ai_service"],
            status["facebook_service"], 
            status["integration"],
            status["openai_configured"],
            status["facebook_configured"]
        ])
        
        return jsonify({
            "success": True,
            "status": "Todos os serviços prontos" if all_ready else "Alguns serviços não estão configurados",
            "services": status,
            "ready_for_ai_ads": all_ready
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro ao verificar status: {str(e)}"
        }), 500

# ===== ENDPOINTS AUXILIARES PARA GERAÇÃO DE ANÚNCIOS =====

@facebook_data_bp.route('/facebook/generate-audience', methods=['POST'])
def generate_audience():
    """Gerar público-alvo automaticamente baseado na descrição do produto"""
    print("🔍 DEBUG: Endpoint generate_audience chamado")
    
    try:
        # Obter dados da requisição
        data = request.get_json()
        print(f"🔍 DEBUG: Dados recebidos: {data}")
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados não fornecidos'
            }), 400
        
        product_description = data.get('product_description', '')
        objective = data.get('objective', 'conversions')
        
        if not product_description:
            return jsonify({
                'success': False,
                'error': 'Descrição do produto é obrigatória'
            }), 400
        
        # Gerar público-alvo baseado na descrição
        audience = generate_smart_audience(product_description, objective)
        
        return jsonify({
            'success': True,
            'data': audience
        })
        
    except Exception as e:
        print(f"💥 DEBUG: Exceção capturada: {str(e)}")
        import traceback
        print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'error': str(e)}), 500

def generate_smart_audience(product_description, objective):
    """Função para gerar público-alvo inteligente baseado na descrição do produto"""
    product_lower = product_description.lower()
    
    # Análise de palavras-chave para diferentes categorias
    if any(word in product_lower for word in ['tecnologia', 'software', 'app', 'digital', 'sistema', 'plataforma', 'saas']):
        return {
            'description': 'Profissionais de tecnologia, empresários e entusiastas de inovação entre 25-45 anos interessados em soluções digitais',
            'age_min': 25,
            'age_max': 45,
            'gender': 'all',
            'interests': ['Tecnologia', 'Inovação', 'Startups', 'Software', 'Empreendedorismo', 'Transformação Digital'],
            'behaviors': ['Usuários de tecnologia', 'Empreendedores', 'Tomadores de decisão'],
            'locations': ['Brasil', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília']
        }
    
    elif any(word in product_lower for word in ['moda', 'roupa', 'estilo', 'fashion', 'vestuário', 'acessório']):
        return {
            'description': 'Pessoas interessadas em moda e estilo, principalmente mulheres entre 18-40 anos que seguem tendências',
            'age_min': 18,
            'age_max': 40,
            'gender': 'female',
            'interests': ['Moda', 'Estilo', 'Compras', 'Tendências', 'Beleza', 'Lifestyle'],
            'behaviors': ['Compradores online', 'Seguidores de moda', 'Influenciados por tendências'],
            'locations': ['Brasil', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte']
        }
    
    elif any(word in product_lower for word in ['comida', 'restaurante', 'culinária', 'food', 'gastronomia', 'delivery', 'açougue', 'carne']):
        return {
            'description': 'Amantes da gastronomia e pessoas que gostam de experimentar novos sabores e experiências culinárias',
            'age_min': 25,
            'age_max': 55,
            'gender': 'all',
            'interests': ['Gastronomia', 'Culinária', 'Restaurantes', 'Comida', 'Delivery', 'Experiências gastronômicas'],
            'behaviors': ['Frequentadores de restaurantes', 'Amantes da culinária', 'Usuários de delivery'],
            'locations': ['Brasil', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador']
        }
    
    else:
        # Público geral para produtos não categorizados
        return {
            'description': 'Público geral interessado em produtos e serviços de qualidade, consumidores ativos entre 25-55 anos',
            'age_min': 25,
            'age_max': 55,
            'gender': 'all',
            'interests': ['Compras', 'Produtos de qualidade', 'Serviços', 'Lifestyle', 'Novidades'],
            'behaviors': ['Compradores online', 'Consumidores ativos', 'Interessados em novidades'],
            'locations': ['Brasil', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília']
        }

@facebook_data_bp.route('/facebook/ad-formats', methods=['GET'])
def get_ad_formats():
    """Buscar formatos de anúncios disponíveis com especificações"""
    print("🔍 DEBUG: Endpoint get_ad_formats chamado")
    
    try:
        formats = {
            'image': {
                'name': 'Imagem',
                'description': 'Anúncios com imagens estáticas',
                'icon': 'Image',
                'specs': {
                    'file_types': ['JPG', 'PNG'],
                    'max_file_size': '30MB',
                    'ratios': ['1:1', '4:5', '1.91:1'],
                    'min_resolution': '600x600',
                    'recommended_resolution': '1440x1440'
                },
                'placements': ['feed', 'stories', 'reels', 'right_column', 'marketplace']
            },
            'video': {
                'name': 'Vídeo',
                'description': 'Anúncios com vídeos',
                'icon': 'Video',
                'specs': {
                    'file_types': ['MP4', 'MOV', 'GIF'],
                    'max_file_size': '4GB',
                    'ratios': ['1:1', '4:5', '9:16'],
                    'min_resolution': '120x120',
                    'recommended_resolution': '1440x1440',
                    'duration': '1 segundo a 241 minutos'
                },
                'placements': ['feed', 'stories', 'reels', 'in_stream']
            },
            'carousel': {
                'name': 'Carrossel',
                'description': 'Múltiplas imagens ou vídeos',
                'icon': 'Copy',
                'specs': {
                    'file_types': ['JPG', 'PNG', 'MP4', 'MOV'],
                    'max_file_size': '30MB por imagem, 4GB por vídeo',
                    'ratios': ['1:1', '4:5'],
                    'min_resolution': '600x600',
                    'recommended_resolution': '1440x1440',
                    'cards': '2 a 10 cards'
                },
                'placements': ['feed', 'marketplace', 'instagram_explore']
            },
            'collection': {
                'name': 'Coleção',
                'description': 'Vitrine de produtos',
                'icon': 'Target',
                'specs': {
                    'file_types': ['JPG', 'PNG', 'MP4', 'MOV'],
                    'max_file_size': '30MB por imagem, 4GB por vídeo',
                    'ratios': ['1:1', '4:5'],
                    'min_resolution': '600x600',
                    'recommended_resolution': '1440x1440'
                },
                'placements': ['feed', 'instagram_explore']
            }
        }
        
        return jsonify({
            'success': True,
            'data': formats
        })
        
    except Exception as e:
        print(f"💥 DEBUG: Exceção capturada: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/objectives', methods=['GET'])
def get_objectives():
    """Buscar objetivos de campanha disponíveis"""
    print("🔍 DEBUG: Endpoint get_objectives chamado")
    
    try:
        objectives = [
            {
                'value': 'awareness',
                'label': 'Reconhecimento',
                'description': 'Aumentar conhecimento da marca',
                'icon': 'Eye',
                'recommended_for': ['Novas marcas', 'Lançamentos de produto']
            },
            {
                'value': 'traffic',
                'label': 'Tráfego',
                'description': 'Direcionar pessoas para seu site',
                'icon': 'MousePointer',
                'recommended_for': ['Sites', 'Blogs', 'Landing pages']
            },
            {
                'value': 'engagement',
                'label': 'Engajamento',
                'description': 'Aumentar curtidas, comentários e compartilhamentos',
                'icon': 'Heart',
                'recommended_for': ['Redes sociais', 'Conteúdo viral']
            },
            {
                'value': 'leads',
                'label': 'Geração de Leads',
                'description': 'Coletar informações de contato',
                'icon': 'Users',
                'recommended_for': ['B2B', 'Serviços', 'Consultoria']
            },
            {
                'value': 'app_promotion',
                'label': 'Promoção de App',
                'description': 'Promover downloads do aplicativo',
                'icon': 'Smartphone',
                'recommended_for': ['Apps móveis', 'Jogos']
            },
            {
                'value': 'sales',
                'label': 'Vendas',
                'description': 'Otimizar para vendas e conversões',
                'icon': 'ShoppingCart',
                'recommended_for': ['E-commerce', 'Produtos físicos']
            }
        ]
        
        return jsonify({
            'success': True,
            'data': objectives
        })
        
    except Exception as e:
        print(f"💥 DEBUG: Exceção capturada: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== NOVOS ENDPOINTS PARA SALVAR RASCUNHO E PUBLICAR ANÚNCIO =====

@facebook_data_bp.route('/facebook/save-ad-draft', methods=['POST'])
def save_ad_draft():
    """Salvar anúncio como rascunho"""
    try:
        print("💾 DEBUG: Endpoint save-ad-draft chamado")
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados não fornecidos'
            }), 400
        
        print(f"💾 DEBUG: Dados recebidos: {data}")
        
        # Aqui você pode implementar a lógica para salvar o rascunho
        # Por exemplo, salvar em banco de dados local ou arquivo
        
        # Por enquanto, apenas simular o salvamento
        draft_id = f"draft_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return jsonify({
            'success': True,
            'message': 'Rascunho salvo com sucesso!',
            'draft_id': draft_id,
            'saved_at': datetime.now().isoformat(),
            'data': {
                'ai_structure': data.get('ai_structure'),
                'page_id': data.get('page_id'),
                'selected_post': data.get('selected_post')
            }
        })
        
    except Exception as e:
        print(f"💥 DEBUG: Erro ao salvar rascunho: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }), 500

@facebook_data_bp.route('/facebook/publish-ad', methods=['POST'])
def publish_ad():
    """Publicar anúncio no Facebook"""
    try:
        print("🚀 DEBUG: Endpoint publish-ad chamado")
        
        if not facebook_ai_integration:
            print("❌ DEBUG: facebook_ai_integration não disponível")
            return jsonify({
                "success": False,
                "error": "Integração IA-Facebook não está disponível"
            }), 500
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados não fornecidos'
            }), 400
        
        print(f"🚀 DEBUG: Dados recebidos: {data}")
        
        ai_structure = data.get('ai_structure')
        if not ai_structure:
            return jsonify({
                'success': False,
                'error': 'Estrutura do anúncio é obrigatória'
            }), 400
        
        # Criar anúncio usando a integração IA-Facebook
        result = facebook_ai_integration.create_ad_from_ai_structure(
            ai_structure,
            data.get('selected_post')
        )
        
        if result.get("success"):
            return jsonify({
                "success": True,
                "message": "🎉 Anúncio publicado com sucesso no Facebook!",
                "campaign_id": result.get("campaign_id"),
                "adset_id": result.get("adset_id"),
                "creative_id": result.get("creative_id"),
                "ad_id": result.get("ad_id"),
                "published_at": datetime.now().isoformat(),
                "next_steps": [
                    "Monitorar performance do anúncio",
                    "Ajustar orçamento se necessário",
                    "Analisar métricas de engajamento"
                ]
            })
        else:
            return jsonify({
                "success": False,
                "error": f"Erro ao publicar anúncio: {result.get('error')}",
                "step": result.get("step")
            }), 500
            
    except Exception as e:
        print(f"💥 DEBUG: Erro ao publicar anúncio: {str(e)}")
        import traceback
        print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }), 500

