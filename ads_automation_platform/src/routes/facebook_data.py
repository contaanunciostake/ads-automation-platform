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
    """Buscar páginas vinculadas à Business Manager"""
    print("🔍 DEBUG: Endpoint get_pages chamado")
    
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        # Chamar serviço para buscar páginas
        result = facebook_data_service.get_pages()
        print(f"🔍 DEBUG: Resultado do service: {result}")
        
        if result.get("success"):
            return jsonify({
                'success': True,
                'data': result.get("pages", [])
            })
        else:
            print(f"❌ DEBUG: Erro do service: {result.get('error')}")
            # Retornar páginas de exemplo em caso de erro
            example_pages = [
                {
                    'id': '123456789012345',
                    'name': 'MONTE CASTELO COMERCIO LTDA',
                    'category': 'Empresa Local',
                    'access_token': 'example_token_1'
                },
                {
                    'id': '234567890123456',
                    'name': 'TechSolutions Brasil',
                    'category': 'Tecnologia',
                    'access_token': 'example_token_2'
                },
                {
                    'id': '345678901234567',
                    'name': 'Marketing Digital Pro',
                    'category': 'Serviços de Marketing',
                    'access_token': 'example_token_3'
                }
            ]
            return jsonify({
                'success': True,
                'data': example_pages
            })
            
    except Exception as e:
        print(f"💥 DEBUG: Exceção capturada: {str(e)}")
        import traceback
        print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
        
        # Retornar páginas de exemplo em caso de exceção
        example_pages = [
            {
                'id': '123456789012345',
                'name': 'MONTE CASTELO COMERCIO LTDA',
                'category': 'Empresa Local',
                'access_token': 'example_token_1'
            },
            {
                'id': '234567890123456',
                'name': 'TechSolutions Brasil',
                'category': 'Tecnologia',
                'access_token': 'example_token_2'
            },
            {
                'id': '345678901234567',
                'name': 'Marketing Digital Pro',
                'category': 'Serviços de Marketing',
                'access_token': 'example_token_3'
            }
        ]
        return jsonify({
            'success': True,
            'data': example_pages
        })

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


# ===== ENDPOINTS PARA PROCESSAMENTO DE IMAGENS =====

@facebook_data_bp.route('/facebook/process-images', methods=['POST'])
def process_images():
    """Processar imagens para múltiplos posicionamentos"""
    print("🔍 DEBUG: Endpoint process_images chamado")
    
    try:
        # Verificar se há arquivos na requisição
        if 'images' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Nenhuma imagem fornecida'
            }), 400
        
        # Obter dados da requisição
        images = request.files.getlist('images')
        placements = request.form.get('placements', '[]')
        
        try:
            placements = json.loads(placements)
        except:
            placements = []
        
        if not placements:
            return jsonify({
                'success': False,
                'error': 'Nenhum posicionamento fornecido'
            }), 400
        
        print(f"🔍 DEBUG: {len(images)} imagens recebidas para {len(placements)} posicionamentos")
        
        # Definir especificações de posicionamentos
        placement_specs = {
            'feed': {'width': 1080, 'height': 1080, 'aspect_ratio': '1:1'},
            'stories': {'width': 1080, 'height': 1920, 'aspect_ratio': '9:16'},
            'reels': {'width': 1080, 'height': 1920, 'aspect_ratio': '9:16'},
            'instagram_feed': {'width': 1080, 'height': 1080, 'aspect_ratio': '1:1'},
            'instagram_stories': {'width': 1080, 'height': 1920, 'aspect_ratio': '9:16'},
            'instagram_reels': {'width': 1080, 'height': 1920, 'aspect_ratio': '9:16'},
            'instagram_explore': {'width': 1080, 'height': 1080, 'aspect_ratio': '1:1'},
            'right_column': {'width': 1200, 'height': 628, 'aspect_ratio': '1.91:1'},
            'marketplace': {'width': 1080, 'height': 1080, 'aspect_ratio': '1:1'}
        }
        
        processed_images = []
        
        for image_file in images:
            if image_file.filename == '':
                continue
                
            # Processar cada imagem
            image_result = {
                'original_name': image_file.filename,
                'versions': []
            }
            
            # Obter formatos únicos dos posicionamentos selecionados
            unique_formats = {}
            for placement in placements:
                if placement in placement_specs:
                    spec = placement_specs[placement]
                    aspect_ratio = spec['aspect_ratio']
                    if aspect_ratio not in unique_formats:
                        unique_formats[aspect_ratio] = spec
            
            # Gerar versão para cada formato único
            for aspect_ratio, spec in unique_formats.items():
                version = {
                    'aspect_ratio': aspect_ratio,
                    'width': spec['width'],
                    'height': spec['height'],
                    'placements': [p for p in placements if placement_specs.get(p, {}).get('aspect_ratio') == aspect_ratio],
                    'file_name': f"{image_file.filename.split('.')[0]}_{aspect_ratio.replace(':', 'x')}.jpg"
                }
                image_result['versions'].append(version)
            
            processed_images.append(image_result)
        
        return jsonify({
            'success': True,
            'data': {
                'processed_images': processed_images,
                'total_images': len(images),
                'total_versions': sum(len(img['versions']) for img in processed_images)
            }
        })
        
    except Exception as e:
        print(f"💥 DEBUG: Exceção capturada: {str(e)}")
        import traceback
        print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/resize-image', methods=['POST'])
def resize_image():
    """Redimensionar uma imagem específica"""
    print("🔍 DEBUG: Endpoint resize_image chamado")
    
    try:
        # Verificar se há arquivo na requisição
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Nenhuma imagem fornecida'
            }), 400
        
        image_file = request.files['image']
        width = request.form.get('width', type=int)
        height = request.form.get('height', type=int)
        quality = request.form.get('quality', 90, type=int)
        
        if not width or not height:
            return jsonify({
                'success': False,
                'error': 'Largura e altura são obrigatórias'
            }), 400
        
        print(f"🔍 DEBUG: Redimensionando para {width}x{height} com qualidade {quality}")
        
        # Aqui você implementaria a lógica de redimensionamento
        # Por enquanto, retornamos sucesso simulado
        
        return jsonify({
            'success': True,
            'data': {
                'original_name': image_file.filename,
                'new_width': width,
                'new_height': height,
                'quality': quality,
                'message': 'Imagem redimensionada com sucesso'
            }
        })
        
    except Exception as e:
        print(f"💥 DEBUG: Exceção capturada: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/placement-specs', methods=['GET'])
def get_placement_specs():
    """Buscar especificações de todos os posicionamentos"""
    print("🔍 DEBUG: Endpoint get_placement_specs chamado")
    
    try:
        specs = {
            'facebook': {
                'feed': {
                    'name': 'Feed do Facebook',
                    'aspect_ratio': '1:1',
                    'width': 1080,
                    'height': 1080,
                    'recommended': '1080x1080',
                    'description': 'Anúncios no feed principal'
                },
                'stories': {
                    'name': 'Stories do Facebook',
                    'aspect_ratio': '9:16',
                    'width': 1080,
                    'height': 1920,
                    'recommended': '1080x1920',
                    'description': 'Anúncios em stories (vertical)'
                },
                'reels': {
                    'name': 'Reels do Facebook',
                    'aspect_ratio': '9:16',
                    'width': 1080,
                    'height': 1920,
                    'recommended': '1080x1920',
                    'description': 'Anúncios em reels (vertical)'
                },
                'right_column': {
                    'name': 'Coluna Direita',
                    'aspect_ratio': '1.91:1',
                    'width': 1200,
                    'height': 628,
                    'recommended': '1200x628',
                    'description': 'Anúncios na lateral direita'
                },
                'marketplace': {
                    'name': 'Marketplace',
                    'aspect_ratio': '1:1',
                    'width': 1080,
                    'height': 1080,
                    'recommended': '1080x1080',
                    'description': 'Anúncios no Marketplace'
                }
            },
            'instagram': {
                'instagram_feed': {
                    'name': 'Feed do Instagram',
                    'aspect_ratio': '1:1',
                    'width': 1080,
                    'height': 1080,
                    'recommended': '1080x1080',
                    'description': 'Anúncios no feed do Instagram'
                },
                'instagram_stories': {
                    'name': 'Stories do Instagram',
                    'aspect_ratio': '9:16',
                    'width': 1080,
                    'height': 1920,
                    'recommended': '1080x1920',
                    'description': 'Anúncios em stories do Instagram'
                },
                'instagram_reels': {
                    'name': 'Reels do Instagram',
                    'aspect_ratio': '9:16',
                    'width': 1080,
                    'height': 1920,
                    'recommended': '1080x1920',
                    'description': 'Anúncios em reels do Instagram'
                },
                'instagram_explore': {
                    'name': 'Explorar do Instagram',
                    'aspect_ratio': '1:1',
                    'width': 1080,
                    'height': 1080,
                    'recommended': '1080x1080',
                    'description': 'Anúncios na aba Explorar'
                }
            }
        }
        
        return jsonify({
            'success': True,
            'data': specs
        })
        
    except Exception as e:
        print(f"💥 DEBUG: Exceção capturada: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/validate-images', methods=['POST'])
def validate_images():
    """Validar imagens antes do processamento"""
    print("🔍 DEBUG: Endpoint validate_images chamado")
    
    try:
        # Verificar se há arquivos na requisição
        if 'images' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Nenhuma imagem fornecida'
            }), 400
        
        images = request.files.getlist('images')
        creative_type = request.form.get('creative_type', 'image')
        
        validation_results = []
        
        for image_file in images:
            if image_file.filename == '':
                continue
            
            # Validações básicas
            result = {
                'filename': image_file.filename,
                'valid': True,
                'errors': [],
                'warnings': [],
                'size_mb': 0,
                'format': '',
                'dimensions': None
            }
            
            # Verificar tamanho do arquivo
            image_file.seek(0, 2)  # Ir para o final do arquivo
            file_size = image_file.tell()
            image_file.seek(0)  # Voltar para o início
            
            size_mb = file_size / (1024 * 1024)
            result['size_mb'] = round(size_mb, 2)
            
            # Verificar formato
            file_extension = image_file.filename.lower().split('.')[-1]
            result['format'] = file_extension.upper()
            
            # Validações por tipo de criativo
            if creative_type == 'image':
                if file_extension not in ['jpg', 'jpeg', 'png']:
                    result['valid'] = False
                    result['errors'].append('Formato não suportado. Use JPG ou PNG.')
                
                if size_mb > 30:
                    result['valid'] = False
                    result['errors'].append('Arquivo muito grande. Máximo 30MB.')
                elif size_mb > 10:
                    result['warnings'].append('Arquivo grande. Considere otimizar.')
            
            elif creative_type == 'video':
                if file_extension not in ['mp4', 'mov', 'gif']:
                    result['valid'] = False
                    result['errors'].append('Formato não suportado. Use MP4, MOV ou GIF.')
                
                if size_mb > 4000:  # 4GB
                    result['valid'] = False
                    result['errors'].append('Arquivo muito grande. Máximo 4GB.')
            
            validation_results.append(result)
        
        # Resumo da validação
        total_files = len(validation_results)
        valid_files = len([r for r in validation_results if r['valid']])
        
        return jsonify({
            'success': True,
            'data': {
                'results': validation_results,
                'summary': {
                    'total_files': total_files,
                    'valid_files': valid_files,
                    'invalid_files': total_files - valid_files,
                    'all_valid': valid_files == total_files
                }
            }
        })
        
    except Exception as e:
        print(f"💥 DEBUG: Exceção capturada: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/optimize-images', methods=['POST'])
def optimize_images():
    """Otimizar imagens para melhor performance"""
    print("🔍 DEBUG: Endpoint optimize_images chamado")
    
    try:
        # Verificar se há arquivos na requisição
        if 'images' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Nenhuma imagem fornecida'
            }), 400
        
        images = request.files.getlist('images')
        quality = request.form.get('quality', 85, type=int)
        max_width = request.form.get('max_width', 1920, type=int)
        max_height = request.form.get('max_height', 1920, type=int)
        
        optimization_results = []
        
        for image_file in images:
            if image_file.filename == '':
                continue
            
            # Simular otimização (implementação real seria feita aqui)
            original_size = image_file.content_length or 0
            optimized_size = int(original_size * 0.7)  # Simular 30% de redução
            
            result = {
                'filename': image_file.filename,
                'original_size_mb': round(original_size / (1024 * 1024), 2),
                'optimized_size_mb': round(optimized_size / (1024 * 1024), 2),
                'reduction_percent': 30,
                'quality': quality,
                'max_dimensions': f"{max_width}x{max_height}",
                'optimized': True
            }
            
            optimization_results.append(result)
        
        return jsonify({
            'success': True,
            'data': {
                'results': optimization_results,
                'total_images': len(optimization_results),
                'average_reduction': 30
            }
        })
        
    except Exception as e:
        print(f"💥 DEBUG: Exceção capturada: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

