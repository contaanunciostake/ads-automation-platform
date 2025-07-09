from flask import Blueprint, request, jsonify
from src.services.facebook_data_service import facebook_data_service
from datetime import datetime, timedelta

# Imports dos serviços de IA com fallback MELHORADO
try:
    from src.services.ai_ad_generation_service import AIAdGenerationService
    ai_ad_service = AIAdGenerationService()
    print("✅ ai_ad_service importado com sucesso")
except ImportError as e:
    print(f"⚠️ WARNING: ai_ad_generation_service não encontrado: {e}")
    ai_ad_service = None

# CORREÇÃO: Import da integração IA com múltiplos fallbacks
facebook_ai_integration = None
try:
    # Tentar import do local padrão
    from src.services.facebook_ai_integration import facebook_ai_integration
    print("✅ facebook_ai_integration importado com sucesso (src.services)")
except ImportError:
    try:
        # Fallback: tentar import direto
        from facebook_ai_integration import facebook_ai_integration
        print("✅ facebook_ai_integration importado com sucesso (direto)")
    except ImportError:
        try:
            # Fallback: tentar instanciar classe diretamente
            from facebook_ai_integration import FacebookAIIntegration
            facebook_ai_integration = FacebookAIIntegration()
            print("✅ facebook_ai_integration instanciado com sucesso")
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

# ===== ENDPOINT PRINCIPAL: PUBLICAR ANÚNCIO COM CRIAÇÃO REAL =====

@facebook_data_bp.route('/facebook/publish-ad', methods=['POST'])
def publish_ad():
    """
    Publicar anúncio no Facebook - VERSÃO COM CRIAÇÃO REAL ATIVADA
    
    Esta versão:
    1. Cria campanha real no Facebook
    2. Cria adset real com targeting
    3. Cria criativo real
    4. Cria anúncio real
    5. Retorna IDs reais do Facebook
    """
    try:
        print("🚀 DEBUG: Endpoint publish-ad chamado (CRIAÇÃO REAL ATIVADA)")
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados não fornecidos'
            }), 400
        
        print(f"🚀 DEBUG: Dados recebidos: {data}")
        
        ai_structure = data.get('ai_structure')
        page_id = data.get('page_id')
        selected_post = data.get('selected_post')
        
        if not ai_structure:
            return jsonify({
                'success': False,
                'error': 'Estrutura do anúncio é obrigatória'
            }), 400
        
        if not page_id:
            return jsonify({
                'success': False,
                'error': 'ID da página é obrigatório'
            }), 400
        
        if not facebook_data_service:
            return jsonify({
                'success': False,
                'error': 'Serviço do Facebook não configurado'
            }), 500
        
        # EXTRAIR DADOS DA ESTRUTURA DA IA
        campaign_data = ai_structure.get("campaign", {})
        adset_data = ai_structure.get("adset", {})
        creative_data = ai_structure.get("creative", {})
        
        print(f"📊 DEBUG: Dados extraídos:")
        print(f"  📈 Campanha: {campaign_data.get('name', 'N/A')}")
        print(f"  🎯 AdSet: {adset_data.get('name', 'N/A')}")
        print(f"  🎨 Criativo: {creative_data.get('name', 'N/A')}")
        
        # DETECTAR TIPO DE PUBLICAÇÃO
        is_existing_post = bool(selected_post and selected_post.get('id'))
        print(f"📝 DEBUG: Tipo de publicação: {'Existente' if is_existing_post else 'Nova'}")
        
        # ETAPA 1: CRIAR CAMPANHA REAL
        print("📈 DEBUG: ETAPA 1 - Criando campanha real no Facebook...")
        
        campaign_create_data = {
            "name": campaign_data.get("name", f"Campanha IA - {datetime.now().strftime('%d/%m/%Y %H:%M')}"),
            "objective": "LINK_CLICKS",  # Usar LINK_CLICKS como padrão mais simples
            "status": "PAUSED",  # Sempre criar pausada para revisão
            "special_ad_categories": campaign_data.get("special_ad_categories", [])
        }
        
        print(f"📈 DEBUG: Dados da campanha: {campaign_create_data}")
        
        try:
            campaign_result = facebook_data_service.create_campaign(campaign_create_data)
            print(f"📈 DEBUG: Resultado da campanha: {campaign_result}")
            
            if not campaign_result.get("success"):
                return jsonify({
                    'success': False,
                    'error': f'Erro ao criar campanha: {campaign_result.get("error")}',
                    'stage': 'campaign_creation',
                    'details': campaign_result
                }), 500
            
            campaign_id = campaign_result.get("campaign_id")
            print(f"✅ DEBUG: Campanha criada com sucesso! ID: {campaign_id}")
            
        except Exception as e:
            print(f"💥 DEBUG: Erro na criação da campanha: {str(e)}")
            return jsonify({
                'success': False,
                'error': f'Erro na criação da campanha: {str(e)}',
                'stage': 'campaign_creation'
            }), 500
        
        # ETAPA 2: CRIAR ADSET REAL
        print("🎯 DEBUG: ETAPA 2 - Criando adset real no Facebook...")
        
        # Preparar targeting (simplificar se necessário)
        targeting = adset_data.get("targeting", {})
        
        # Simplificar targeting para evitar erros
        simplified_targeting = {
            "age_min": targeting.get("age_min", 18),
            "age_max": targeting.get("age_max", 65),
            "genders": targeting.get("genders", [1, 2]),  # 1=masculino, 2=feminino, 0=todos
            "geo_locations": targeting.get("geo_locations", {
                "countries": ["BR"],
                "location_types": ["home", "recent"]
            })
        }
        
        # Adicionar interesses apenas se existirem
        if targeting.get("interests"):
            simplified_targeting["interests"] = targeting.get("interests")[:3]  # Máximo 3 interesses
        
        # Adicionar comportamentos apenas se existirem
        if targeting.get("behaviors"):
            simplified_targeting["behaviors"] = targeting.get("behaviors")[:2]  # Máximo 2 comportamentos
        
        adset_create_data = {
            "name": adset_data.get("name", f"AdSet - {datetime.now().strftime('%d/%m/%Y')}"),
            "campaign_id": campaign_id,
            "daily_budget": min(adset_data.get("daily_budget", 5000), 10000),  # Máximo R$ 100/dia
            "billing_event": "IMPRESSIONS",
            "optimization_goal": "LINK_CLICKS",  # Simplificar para LINK_CLICKS
            "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
            "targeting": simplified_targeting,
            "status": "PAUSED"
        }
        
        print(f"🎯 DEBUG: Dados do adset: {adset_create_data}")
        
        try:
            adset_result = facebook_data_service.create_adset(adset_create_data)
            print(f"🎯 DEBUG: Resultado do adset: {adset_result}")
            
            if not adset_result.get("success"):
                return jsonify({
                    'success': False,
                    'error': f'Erro ao criar adset: {adset_result.get("error")}',
                    'stage': 'adset_creation',
                    'campaign_id': campaign_id,
                    'details': adset_result
                }), 500
            
            adset_id = adset_result.get("adset_id")
            print(f"✅ DEBUG: AdSet criado com sucesso! ID: {adset_id}")
            
        except Exception as e:
            print(f"💥 DEBUG: Erro na criação do adset: {str(e)}")
            return jsonify({
                'success': False,
                'error': f'Erro na criação do adset: {str(e)}',
                'stage': 'adset_creation',
                'campaign_id': campaign_id
            }), 500
        
        # ETAPA 3: CRIAR CRIATIVO REAL
        print("🎨 DEBUG: ETAPA 3 - Criando criativo real no Facebook...")
        
        # Preparar dados do criativo
        object_story_spec = creative_data.get("object_story_spec", {})
        link_data = object_story_spec.get("link_data", {})
        
        if is_existing_post:
            print("📄 DEBUG: Usando publicação existente como criativo")
            
            # Para publicação existente, usar dados da publicação original
            creative_create_data = {
                "name": creative_data.get("name", f"Criativo - Post Existente - {datetime.now().strftime('%d/%m/%Y')}"),
                "object_story_spec": {
                    "page_id": page_id,
                    "instagram_actor_id": page_id,  # Opcional
                    "link_data": {
                        "message": selected_post.get("message", ""),
                        "name": link_data.get("name", selected_post.get("message", "")[:25] + "..."),
                        "description": link_data.get("description", "Promover publicação existente"),
                        "link": link_data.get("link", selected_post.get("permalink_url", "https://facebook.com")),
                        "call_to_action": {
                            "type": link_data.get("call_to_action", {}).get("type", "LEARN_MORE")
                        }
                    }
                }
            }
        else:
            print("🆕 DEBUG: Criando nova publicação como criativo")
            
            # Para publicação nova, usar dados gerados pela IA
            creative_create_data = {
                "name": creative_data.get("name", f"Criativo - IA - {datetime.now().strftime('%d/%m/%Y')}"),
                "object_story_spec": {
                    "page_id": page_id,
                    "instagram_actor_id": page_id,  # Opcional
                    "link_data": {
                        "message": link_data.get("message", ""),
                        "name": link_data.get("name", ""),
                        "description": link_data.get("description", ""),
                        "link": link_data.get("link", "https://facebook.com"),
                        "call_to_action": {
                            "type": link_data.get("call_to_action", {}).get("type", "LEARN_MORE")
                        }
                    }
                }
            }
        
        print(f"🎨 DEBUG: Dados do criativo: {creative_create_data}")
        
        try:
            creative_result = facebook_data_service.create_ad_creative(creative_create_data)
            print(f"🎨 DEBUG: Resultado do criativo: {creative_result}")
            
            if not creative_result.get("success"):
                return jsonify({
                    'success': False,
                    'error': f'Erro ao criar criativo: {creative_result.get("error")}',
                    'stage': 'creative_creation',
                    'campaign_id': campaign_id,
                    'adset_id': adset_id,
                    'details': creative_result
                }), 500
            
            creative_id = creative_result.get("creative_id")
            print(f"✅ DEBUG: Criativo criado com sucesso! ID: {creative_id}")
            
        except Exception as e:
            print(f"💥 DEBUG: Erro na criação do criativo: {str(e)}")
            return jsonify({
                'success': False,
                'error': f'Erro na criação do criativo: {str(e)}',
                'stage': 'creative_creation',
                'campaign_id': campaign_id,
                'adset_id': adset_id
            }), 500
        
        # ETAPA 4: CRIAR ANÚNCIO REAL
        print("📢 DEBUG: ETAPA 4 - Criando anúncio real no Facebook...")
        
        ad_create_data = {
            "name": f"Anúncio - {datetime.now().strftime('%d/%m/%Y %H:%M')}",
            "adset_id": adset_id,
            "creative": {
                "creative_id": creative_id
            },
            "status": "PAUSED"
        }
        
        print(f"📢 DEBUG: Dados do anúncio: {ad_create_data}")
        
        try:
            ad_result = facebook_data_service.create_ad(ad_create_data)
            print(f"📢 DEBUG: Resultado do anúncio: {ad_result}")
            
            if not ad_result.get("success"):
                return jsonify({
                    'success': False,
                    'error': f'Erro ao criar anúncio: {ad_result.get("error")}',
                    'stage': 'ad_creation',
                    'campaign_id': campaign_id,
                    'adset_id': adset_id,
                    'creative_id': creative_id,
                    'details': ad_result
                }), 500
            
            ad_id = ad_result.get("ad_id")
            print(f"✅ DEBUG: Anúncio criado com sucesso! ID: {ad_id}")
            
        except Exception as e:
            print(f"💥 DEBUG: Erro na criação do anúncio: {str(e)}")
            return jsonify({
                'success': False,
                'error': f'Erro na criação do anúncio: {str(e)}',
                'stage': 'ad_creation',
                'campaign_id': campaign_id,
                'adset_id': adset_id,
                'creative_id': creative_id
            }), 500
        
        # SUCESSO! ANÚNCIO CRIADO COMPLETAMENTE
        print(f"🎉 DEBUG: ANÚNCIO CRIADO COM SUCESSO!")
        print(f"  📈 Campanha ID: {campaign_id}")
        print(f"  🎯 AdSet ID: {adset_id}")
        print(f"  🎨 Criativo ID: {creative_id}")
        print(f"  📢 Anúncio ID: {ad_id}")
        
        # PREPARAR RESPOSTA DETALHADA
        response_data = {
            "success": True,
            "message": "🎉 Anúncio criado com sucesso no Facebook!",
            "mode": "real_creation",
            "post_type": "existing" if is_existing_post else "new",
            "campaign_id": campaign_id,
            "adset_id": adset_id,
            "creative_id": creative_id,
            "ad_id": ad_id,
            "created_at": datetime.now().isoformat(),
            "campaign_details": {
                "name": campaign_create_data["name"],
                "objective": campaign_create_data["objective"],
                "daily_budget": adset_create_data["daily_budget"] / 100,  # Converter centavos para reais
                "status": "PAUSED"
            },
            "facebook_urls": {
                "campaign_url": f"https://business.facebook.com/adsmanager/manage/campaigns/detail?act={facebook_data_service.ad_account_id}&campaign_id={campaign_id}",
                "adset_url": f"https://business.facebook.com/adsmanager/manage/adsets/detail?act={facebook_data_service.ad_account_id}&adset_id={adset_id}",
                "ad_url": f"https://business.facebook.com/adsmanager/manage/ads/detail?act={facebook_data_service.ad_account_id}&ad_id={ad_id}"
            },
            "targeting_summary": {
                "age_range": f"{simplified_targeting['age_min']}-{simplified_targeting['age_max']} anos",
                "location": "Brasil",
                "interests": len(targeting.get("interests", [])),
                "behaviors": len(targeting.get("behaviors", []))
            }
        }
        
        # ADICIONAR INFORMAÇÕES ESPECÍFICAS PARA PUBLICAÇÃO EXISTENTE
        if is_existing_post:
            response_data["original_post"] = {
                "id": selected_post.get('id'),
                "message": selected_post.get('message', ''),
                "created_time": selected_post.get('created_time', ''),
                "permalink": selected_post.get('permalink_url', '')
            }
            response_data["note"] = "✅ Anúncio criado baseado na publicação existente."
        else:
            response_data["note"] = "✅ Anúncio criado com conteúdo gerado pela IA."
        
        response_data["next_steps"] = [
            "✅ Anúncio criado e pausado para revisão",
            "🔍 Revise as configurações no Gerenciador de Anúncios",
            "▶️ Ative o anúncio quando estiver satisfeito",
            "📊 Monitore a performance regularmente"
        ]
        
        response_data["important_notes"] = [
            "⚠️ Anúncio criado em status PAUSADO",
            "💰 Orçamento diário configurado",
            "🎯 Segmentação aplicada conforme IA",
            "📱 Compatível com Facebook e Instagram"
        ]
        
        return jsonify(response_data)
            
    except Exception as e:
        print(f"💥 DEBUG: Erro geral no endpoint: {str(e)}")
        import traceback
        print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}',
            'stage': 'general_error'
        }), 500

# ===== ENDPOINT PARA SALVAR RASCUNHO =====

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
        
        # Simular salvamento de rascunho
        draft_id = f"draft_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return jsonify({
            'success': True,
            'message': '✅ Rascunho salvo com sucesso!',
            'draft_id': draft_id,
            'saved_at': datetime.now().isoformat(),
            'note': 'Rascunho salvo localmente. Você pode editá-lo e publicar quando estiver pronto.',
            'data': {
                'ai_structure': data.get('ai_structure'),
                'page_id': data.get('page_id'),
                'selected_post': data.get('selected_post')
            }
        })
        
    except Exception as e:
        print(f"💥 DEBUG: Erro ao salvar rascunho: {str(e)}")
        import traceback
        print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }), 500

# ===== ENDPOINTS ADICIONAIS =====

@facebook_data_bp.route('/facebook/toggle-ad-status', methods=['POST'])
def toggle_ad_status():
    """Ativar ou pausar um anúncio específico"""
    try:
        print("🔄 DEBUG: Endpoint toggle-ad-status chamado")
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados não fornecidos'
            }), 400
        
        ad_id = data.get('ad_id')
        current_status = data.get('current_status', 'PAUSED')
        
        if not ad_id:
            return jsonify({
                'success': False,
                'error': 'ID do anúncio é obrigatório'
            }), 400
        
        if not facebook_data_service:
            return jsonify({
                'success': False,
                'error': 'Serviço do Facebook não configurado'
            }), 500
        
        # Determinar novo status
        new_status = "ACTIVE" if current_status.upper() == "PAUSED" else "PAUSED"
        
        print(f"🔄 DEBUG: Alterando status do anúncio {ad_id} de {current_status} para {new_status}")
        
        # Chamar serviço para alterar status
        result = facebook_data_service.update_ad_status(ad_id, new_status)
        
        if result.get("success"):
            return jsonify({
                'success': True,
                'message': f'Anúncio {"ativado" if new_status == "ACTIVE" else "pausado"} com sucesso',
                'ad_id': ad_id,
                'old_status': current_status.upper(),
                'new_status': new_status,
                'updated_at': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get("error", "Erro ao alterar status do anúncio")
            }), 500
            
    except Exception as e:
        print(f"💥 DEBUG: Erro ao alterar status: {str(e)}")
        import traceback
        print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }), 500

@facebook_data_bp.route('/facebook/check-creation-status', methods=['GET'])
def check_creation_status():
    """Verificar se o sistema está pronto para criar anúncios reais"""
    try:
        print("🔍 DEBUG: Verificando status de criação real")
        
        status = {
            "facebook_service": bool(facebook_data_service),
            "ai_service": bool(ai_ad_service),
            "integration": bool(facebook_ai_integration),
            "real_creation_enabled": True,  # Agora habilitado
            "simulation_mode": False  # Modo simulação desabilitado
        }
        
        # Verificar permissões do token
        permissions_check = None
        if facebook_data_service:
            try:
                account_info = facebook_data_service.get_ad_account_info()
                if account_info and not account_info.get("error"):
                    permissions_check = "OK"
                else:
                    permissions_check = account_info.get("error", "Erro desconhecido")
            except Exception as e:
                permissions_check = f"Erro: {str(e)}"
        
        status["permissions_check"] = permissions_check
        status["account_access"] = permissions_check == "OK"
        
        # Verificar se pode criar campanhas
        can_create = (
            status["facebook_service"] and 
            status["ai_service"] and 
            status["account_access"]
        )
        
        return jsonify({
            "success": True,
            "status": "Pronto para criação real" if can_create else "Configuração incompleta",
            "services": status,
            "ready_for_real_creation": can_create,
            "mode": "real_creation",
            "note": "Sistema configurado para criar anúncios reais no Facebook"
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro ao verificar status: {str(e)}"
        }), 500

