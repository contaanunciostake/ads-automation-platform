from flask import Blueprint, request, jsonify
from src.services.facebook_data_service import facebook_data_service
from datetime import datetime, timedelta

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
    
    elif any(word in product_lower for word in ['fitness', 'academia', 'saúde', 'exercício', 'treino', 'bem-estar']):
        return {
            'description': 'Pessoas interessadas em fitness, saúde e bem-estar entre 20-50 anos que praticam exercícios regularmente',
            'age_min': 20,
            'age_max': 50,
            'gender': 'all',
            'interests': ['Fitness', 'Saúde', 'Bem-estar', 'Exercícios', 'Vida saudável', 'Nutrição'],
            'behaviors': ['Entusiastas de fitness', 'Vida saudável', 'Frequentadores de academia'],
            'locations': ['Brasil', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre']
        }
    
    elif any(word in product_lower for word in ['comida', 'restaurante', 'culinária', 'food', 'gastronomia', 'delivery']):
        return {
            'description': 'Amantes da gastronomia e pessoas que gostam de experimentar novos sabores e experiências culinárias',
            'age_min': 25,
            'age_max': 55,
            'gender': 'all',
            'interests': ['Gastronomia', 'Culinária', 'Restaurantes', 'Comida', 'Delivery', 'Experiências gastronômicas'],
            'behaviors': ['Frequentadores de restaurantes', 'Amantes da culinária', 'Usuários de delivery'],
            'locations': ['Brasil', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador']
        }
    
    elif any(word in product_lower for word in ['educação', 'curso', 'ensino', 'aprendizado', 'treinamento', 'capacitação']):
        return {
            'description': 'Pessoas interessadas em educação e desenvolvimento pessoal, estudantes e profissionais em busca de capacitação',
            'age_min': 18,
            'age_max': 55,
            'gender': 'all',
            'interests': ['Educação', 'Cursos online', 'Desenvolvimento pessoal', 'Capacitação profissional', 'Aprendizado'],
            'behaviors': ['Estudantes', 'Profissionais em desenvolvimento', 'Interessados em educação'],
            'locations': ['Brasil', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília']
        }
    
    elif any(word in product_lower for word in ['casa', 'decoração', 'móveis', 'design', 'arquitetura', 'reforma']):
        return {
            'description': 'Pessoas interessadas em decoração, design de interiores e melhorias para casa entre 25-55 anos',
            'age_min': 25,
            'age_max': 55,
            'gender': 'all',
            'interests': ['Decoração', 'Design de interiores', 'Casa e jardim', 'Móveis', 'Arquitetura', 'DIY'],
            'behaviors': ['Proprietários de casa', 'Interessados em decoração', 'Compradores de móveis'],
            'locations': ['Brasil', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba']
        }
    
    elif any(word in product_lower for word in ['beleza', 'cosmético', 'skincare', 'maquiagem', 'cuidados']):
        return {
            'description': 'Pessoas interessadas em beleza, cuidados pessoais e cosméticos, principalmente mulheres entre 18-45 anos',
            'age_min': 18,
            'age_max': 45,
            'gender': 'female',
            'interests': ['Beleza', 'Skincare', 'Maquiagem', 'Cosméticos', 'Cuidados pessoais', 'Bem-estar'],
            'behaviors': ['Compradores de cosméticos', 'Interessados em beleza', 'Seguidores de influencers de beleza'],
            'locations': ['Brasil', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília']
        }
    
    elif any(word in product_lower for word in ['viagem', 'turismo', 'hotel', 'destino', 'férias', 'passeio']):
        return {
            'description': 'Pessoas interessadas em viagens, turismo e experiências de lazer entre 25-55 anos',
            'age_min': 25,
            'age_max': 55,
            'gender': 'all',
            'interests': ['Viagens', 'Turismo', 'Hotéis', 'Destinos', 'Férias', 'Experiências'],
            'behaviors': ['Viajantes frequentes', 'Planejadores de viagem', 'Interessados em turismo'],
            'locations': ['Brasil', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador']
        }
    
    elif any(word in product_lower for word in ['pet', 'animal', 'cachorro', 'gato', 'veterinário', 'ração']):
        return {
            'description': 'Donos de pets e amantes de animais interessados em produtos e serviços para seus companheiros',
            'age_min': 25,
            'age_max': 55,
            'gender': 'all',
            'interests': ['Pets', 'Animais de estimação', 'Cuidados com pets', 'Veterinária', 'Produtos para pets'],
            'behaviors': ['Donos de pets', 'Amantes de animais', 'Compradores de produtos para pets'],
            'locations': ['Brasil', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre']
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

@facebook_data_bp.route('/facebook/placements', methods=['GET'])
def get_placements():
    """Buscar posicionamentos disponíveis com especificações"""
    print("🔍 DEBUG: Endpoint get_placements chamado")
    
    try:
        placements = {
            'facebook': [
                {
                    'value': 'feed',
                    'label': 'Feed do Facebook',
                    'description': 'Anúncios no feed principal',
                    'formats': ['image', 'video', 'carousel', 'collection'],
                    'specs': {
                        'ratios': ['1:1', '4:5', '1.91:1'],
                        'recommended_ratio': '1:1'
                    }
                },
                {
                    'value': 'stories',
                    'label': 'Stories do Facebook',
                    'description': 'Anúncios em stories',
                    'formats': ['image', 'video'],
                    'specs': {
                        'ratios': ['9:16'],
                        'recommended_ratio': '9:16',
                        'safe_zones': {
                            'top': '14%',
                            'bottom': '20%'
                        }
                    }
                },
                {
                    'value': 'reels',
                    'label': 'Reels do Facebook',
                    'description': 'Anúncios em reels',
                    'formats': ['video'],
                    'specs': {
                        'ratios': ['9:16'],
                        'recommended_ratio': '9:16',
                        'duration': '0 segundos a 15 minutos',
                        'safe_zones': {
                            'top': '14%',
                            'bottom': '35%',
                            'sides': '6%'
                        }
                    }
                },
                {
                    'value': 'right_column',
                    'label': 'Coluna Direita',
                    'description': 'Anúncios na lateral direita',
                    'formats': ['image'],
                    'specs': {
                        'ratios': ['1.91:1'],
                        'recommended_ratio': '1.91:1'
                    }
                },
                {
                    'value': 'marketplace',
                    'label': 'Marketplace',
                    'description': 'Anúncios no Marketplace',
                    'formats': ['image', 'carousel'],
                    'specs': {
                        'ratios': ['1:1'],
                        'recommended_ratio': '1:1'
                    }
                },
                {
                    'value': 'video_feeds',
                    'label': 'Feeds de Vídeo',
                    'description': 'Anúncios em vídeos',
                    'formats': ['video'],
                    'specs': {
                        'ratios': ['1:1', '4:5'],
                        'recommended_ratio': '1:1'
                    }
                }
            ],
            'instagram': [
                {
                    'value': 'instagram_feed',
                    'label': 'Feed do Instagram',
                    'description': 'Anúncios no feed do Instagram',
                    'formats': ['image', 'video', 'carousel', 'collection'],
                    'specs': {
                        'ratios': ['1:1', '4:5'],
                        'recommended_ratio': '1:1'
                    }
                },
                {
                    'value': 'instagram_stories',
                    'label': 'Stories do Instagram',
                    'description': 'Anúncios em stories do Instagram',
                    'formats': ['image', 'video'],
                    'specs': {
                        'ratios': ['9:16'],
                        'recommended_ratio': '9:16',
                        'safe_zones': {
                            'top': '14%',
                            'bottom': '20%'
                        }
                    }
                },
                {
                    'value': 'instagram_reels',
                    'label': 'Reels do Instagram',
                    'description': 'Anúncios em reels do Instagram',
                    'formats': ['video'],
                    'specs': {
                        'ratios': ['9:16'],
                        'recommended_ratio': '9:16',
                        'duration': '0 segundos a 15 minutos',
                        'safe_zones': {
                            'top': '14%',
                            'bottom': '35%',
                            'sides': '6%'
                        }
                    }
                },
                {
                    'value': 'instagram_explore',
                    'label': 'Explorar do Instagram',
                    'description': 'Anúncios na aba Explorar',
                    'formats': ['image', 'video', 'carousel', 'collection'],
                    'specs': {
                        'ratios': ['1:1'],
                        'recommended_ratio': '1:1'
                    }
                }
            ],
            'messenger': [
                {
                    'value': 'messenger_inbox',
                    'label': 'Caixa de Entrada do Messenger',
                    'description': 'Anúncios no Messenger',
                    'formats': ['image', 'video'],
                    'specs': {
                        'ratios': ['1:1'],
                        'recommended_ratio': '1:1'
                    }
                },
                {
                    'value': 'messenger_stories',
                    'label': 'Stories do Messenger',
                    'description': 'Anúncios em stories do Messenger',
                    'formats': ['image', 'video'],
                    'specs': {
                        'ratios': ['9:16'],
                        'recommended_ratio': '9:16'
                    }
                }
            ]
        }
        
        return jsonify({
            'success': True,
            'data': placements
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

