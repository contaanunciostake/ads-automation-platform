"""
Rotas para buscar dados reais da Facebook Marketing API.
Este módulo fornece endpoints para coletar campanhas, conjuntos de anúncios, anúncios e insights de performance.
"""

from flask import Blueprint, request, jsonify
# IMPORTS CORRIGIDOS PARA O RENDER
from src.services.facebook_data_service import facebook_data_service
try:
    from src.services.ai_ad_generation_service import ai_ad_service
except ImportError:
    ai_ad_service = None
    print("⚠️ WARNING: ai_ad_generation_service não encontrado")

try:
    from src.services.facebook_ai_integration import facebook_ai_integration
except ImportError:
    facebook_ai_integration = None
    print("⚠️ WARNING: facebook_ai_integration não encontrado")

import json

facebook_data_bp = Blueprint('facebook_data', __name__)

@facebook_data_bp.route('/facebook/account-info', methods=['GET'])
def get_account_info():
    """Buscar informações da conta de anúncios"""
    if not facebook_data_service:
        return jsonify({
            "success": False,
            "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
        }), 500
    
    result = facebook_data_service.get_ad_account_info()
    
    if "error" in result:
        return jsonify({
            "success": False,
            "error": result["error"]
        }), 500
    
    return jsonify({
        "success": True,
        "account": result
    })

@facebook_data_bp.route('/facebook/campaigns', methods=['GET'])
def get_campaigns():
    """Buscar campanhas da conta de anúncios"""
    if not facebook_data_service:
        return jsonify({
            "success": False,
            "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
        }), 500
    
    limit = request.args.get('limit', 50, type=int)
    result = facebook_data_service.get_campaigns(limit)
    
    if "error" in result:
        return jsonify({
            "success": False,
            "error": result["error"]
        }), 500
    
    return jsonify({
        "success": True,
        "campaigns": result.get("data", []),
        "total": len(result.get("data", []))
    })

@facebook_data_bp.route('/facebook/adsets', methods=['GET'])
def get_adsets():
    """Buscar conjuntos de anúncios"""
    if not facebook_data_service:
        return jsonify({
            "success": False,
            "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
        }), 500
    
    campaign_id = request.args.get('campaign_id')
    limit = request.args.get('limit', 50, type=int)
    
    result = facebook_data_service.get_adsets(campaign_id, limit)
    
    if "error" in result:
        return jsonify({
            "success": False,
            "error": result["error"]
        }), 500
    
    return jsonify({
        "success": True,
        "adsets": result.get("data", []),
        "total": len(result.get("data", []))
    })

@facebook_data_bp.route('/facebook/ads', methods=['GET'])
def get_ads():
    """Buscar anúncios"""
    if not facebook_data_service:
        return jsonify({
            "success": False,
            "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
        }), 500
    
    adset_id = request.args.get('adset_id')
    limit = request.args.get('limit', 50, type=int)
    
    result = facebook_data_service.get_ads(adset_id, limit)
    
    if "error" in result:
        return jsonify({
            "success": False,
            "error": result["error"]
        }), 500
    
    return jsonify({
        "success": True,
        "ads": result.get("data", []),
        "total": len(result.get("data", []))
    })

@facebook_data_bp.route('/facebook/insights/campaign/<campaign_id>', methods=['GET'])
def get_campaign_insights(campaign_id):
    """Buscar insights de performance de uma campanha"""
    if not facebook_data_service:
        return jsonify({
            "success": False,
            "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
        }), 500
    
    date_preset = request.args.get('date_preset', 'last_7_days')
    result = facebook_data_service.get_campaign_insights(campaign_id, date_preset)
    
    if "error" in result:
        return jsonify({
            "success": False,
            "error": result["error"]
        }), 500
    
    return jsonify({
        "success": True,
        "insights": result.get("data", [])
    })

@facebook_data_bp.route('/facebook/insights/adset/<adset_id>', methods=['GET'])
def get_adset_insights(adset_id):
    """Buscar insights de performance de um conjunto de anúncios"""
    if not facebook_data_service:
        return jsonify({
            "success": False,
            "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
        }), 500
    
    date_preset = request.args.get('date_preset', 'last_7_days')
    result = facebook_data_service.get_adset_insights(adset_id, date_preset)
    
    if "error" in result:
        return jsonify({
            "success": False,
            "error": result["error"]
        }), 500
    
    return jsonify({
        "success": True,
        "insights": result.get("data", [])
    })

@facebook_data_bp.route('/facebook/insights/ad/<ad_id>', methods=['GET'])
def get_ad_insights(ad_id):
    """Buscar insights de performance de um anúncio"""
    if not facebook_data_service:
        return jsonify({
            "success": False,
            "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
        }), 500
    
    date_preset = request.args.get('date_preset', 'last_7_days')
    result = facebook_data_service.get_ad_insights(ad_id, date_preset)
    
    if "error" in result:
        return jsonify({
            "success": False,
            "error": result["error"]
        }), 500
    
    return jsonify({
        "success": True,
        "insights": result.get("data", [])
    })

@facebook_data_bp.route('/facebook/dashboard-summary', methods=['GET'])
def get_dashboard_summary():
    """Buscar resumo para dashboard com dados agregados"""
    if not facebook_data_service:
        return jsonify({
            "success": False,
            "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
        }), 500
    
    result = facebook_data_service.get_dashboard_summary()
    
    if not result.get("success"):
        return jsonify({
            "success": False,
            "error": result.get("error", "Erro desconhecido")
        }), 500
    
    return jsonify({
        "success": True,
        "summary": result["data"]
    })

@facebook_data_bp.route('/facebook/chart-data', methods=['GET'])
def get_chart_data():
    """Buscar dados para gráficos de performance"""
    if not facebook_data_service:
        return jsonify({
            "success": False,
            "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
        }), 500
    
    days = request.args.get('days', 7, type=int)
    result = facebook_data_service.get_campaign_performance_chart_data(days)
    
    if not result.get("success"):
        return jsonify({
            "success": False,
            "error": result.get("error", "Erro desconhecido")
        }), 500
    
    return jsonify({
        "success": True,
        "chart_data": result["data"]
    })

@facebook_data_bp.route('/facebook/campaign/<campaign_id>/toggle-status', methods=['POST'])
def toggle_campaign_status(campaign_id):
    """Alternar status da campanha (ativar/pausar)"""
    if not facebook_data_service:
        return jsonify({
            "success": False,
            "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
        }), 500
    
    data = request.get_json()
    current_status = data.get('current_status')
    
    if not current_status:
        return jsonify({
            "success": False,
            "error": "Status atual da campanha é obrigatório"
        }), 400
    
    result = facebook_data_service.toggle_campaign_status(campaign_id, current_status)
    
    if not result.get("success"):
        return jsonify({
            "success": False,
            "error": result.get("error", "Erro desconhecido")
        }), 500
    
    return jsonify(result)

@facebook_data_bp.route('/facebook/campaign/<campaign_id>/details', methods=['GET'])
def get_campaign_details(campaign_id):
    """Buscar detalhes completos de uma campanha para edição"""
    if not facebook_data_service:
        return jsonify({
            "success": False,
            "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
        }), 500
    
    result = facebook_data_service.get_campaign_details(campaign_id)
    
    if not result.get("success"):
        return jsonify({
            "success": False,
            "error": result.get("error", "Erro desconhecido")
        }), 500
    
    return jsonify(result)

@facebook_data_bp.route('/facebook/campaign/<campaign_id>/update', methods=['PUT'])
def update_campaign(campaign_id):
    """Atualizar configurações de uma campanha"""
    if not facebook_data_service:
        return jsonify({
            "success": False,
            "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
        }), 500
    
    data = request.get_json()
    
    if not data:
        return jsonify({
            "success": False,
            "error": "Dados de atualização são obrigatórios"
        }), 400
    
    result = facebook_data_service.update_campaign(campaign_id, data)
    
    if not result.get("success"):
        return jsonify({
            "success": False,
            "error": result.get("error", "Erro desconhecido")
        }), 500
    
    return jsonify(result)

@facebook_data_bp.route('/facebook/pages', methods=['GET'])
def get_pages():
    """Buscar páginas disponíveis na Business Manager"""
    try:
        print("🔍 DEBUG: Endpoint get_pages chamado")
        
        if not facebook_data_service:
            print("💥 DEBUG: facebook_data_service não configurado")
            return jsonify({
                "success": False,
                "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
            }), 500
        
        # Chamar método para buscar páginas REAIS
        result = facebook_data_service.get_paginas_disponiveis()
        
        print(f"🔍 DEBUG: Resultado do serviço: {result.get('success')}")
        
        if result.get("success"):
            return jsonify({
                "success": True,
                "pages": result.get("data", []),
                "total": result.get("total", 0),
                "message": result.get("message", "Páginas encontradas")
            }), 200
        else:
            print(f"🔍 DEBUG: Erro: {result.get('error')}")
            return jsonify({
                "success": False,
                "error": result.get("error", "Erro desconhecido ao buscar páginas")
            }), 500
            
    except Exception as e:
        print(f"💥 DEBUG: Exceção capturada: {str(e)}")
        import traceback
        print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
        
        return jsonify({
            "success": False,
            "error": f"Erro interno do servidor: {str(e)}"
        }), 500

@facebook_data_bp.route('/facebook/posts', methods=['POST'])
def get_facebook_posts():
    """Buscar publicações de uma página do Facebook"""
    try:
        print("📘🔍 DEBUG: Endpoint get_facebook_posts chamado")
        
        if not facebook_data_service:
            print("💥 DEBUG: facebook_data_service não configurado")
            return jsonify({
                "success": False,
                "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
            }), 500
        
        # Obter dados do request
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Dados não fornecidos"
            }), 400
        
        page_id = data.get('page_id')
        page_access_token = data.get('page_access_token')  # Opcional
        limit = data.get('limit', 20)
        
        if not page_id:
            return jsonify({
                "success": False,
                "error": "page_id é obrigatório"
            }), 400
        
        print(f"📘 DEBUG: Buscando posts para página: {page_id}")
        print(f"📘 DEBUG: Token fornecido: {'Sim' if page_access_token else 'Não'}")
        print(f"📘 DEBUG: Limite: {limit}")
        
        # Chamar método para buscar publicações REAIS
        result = facebook_data_service.get_publicacoes_pagina(page_id, page_access_token, limit)
        
        print(f"🔍 DEBUG: Resultado do serviço: {result.get('success')}")
        print(f"🔍 DEBUG: Erro: {result.get('error')}")
        
        if result.get("success"):
            return jsonify({
                "success": True,
                "posts": result.get("data", []),
                "total": result.get("total", 0),
                "page_id": result.get("page_id"),
                "message": result.get("message", "Publicações encontradas")
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Erro desconhecido ao buscar publicações"),
                "posts": [],
                "total": 0
            }), 200  # Retornar 200 para não quebrar o frontend
            
    except Exception as e:
        print(f"💥 DEBUG: Exceção no endpoint: {str(e)}")
        import traceback
        print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
        
        return jsonify({
            "success": False,
            "error": f"Erro interno do servidor: {str(e)}",
            "posts": [],
            "total": 0
        }), 200  # Retornar 200 para não quebrar o frontend

@facebook_data_bp.route('/facebook/instagram-posts', methods=['POST'])
def get_instagram_posts():
    """Buscar publicações do Instagram conectado a uma página"""
    try:
        if not facebook_data_service:
            return jsonify({
                "success": False,
                "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
            }), 500
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Dados não fornecidos"
            }), 400
        
        page_id = data.get('page_id')
        limit = data.get('limit', 20)
        
        if not page_id:
            return jsonify({
                "success": False,
                "error": "page_id é obrigatório"
            }), 400
        
        result = facebook_data_service.get_instagram_posts(page_id, limit)
        
        if result.get("success"):
            return jsonify({
                "success": True,
                "posts": result.get("posts", []),
                "total": result.get("total", 0)
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Erro desconhecido ao buscar posts do Instagram"),
                "posts": [],
                "total": 0
            }), 200
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro interno do servidor: {str(e)}",
            "posts": [],
            "total": 0
        }), 200

@facebook_data_bp.route('/facebook/create-ad-from-post', methods=['POST'])
def create_ad_from_post():
    """Criar anúncio a partir de uma publicação existente"""
    try:
        if not facebook_data_service:
            return jsonify({
                "success": False,
                "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
            }), 500
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Dados não fornecidos"
            }), 400
        
        # Validar campos obrigatórios
        required_fields = ['post_id', 'campaign_name', 'budget', 'target_audience']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                "success": False,
                "error": f"Campos obrigatórios ausentes: {', '.join(missing_fields)}"
            }), 400
        
        result = facebook_data_service.create_ad_from_post(data)
        
        if result.get("success"):
            return jsonify(result), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Erro desconhecido ao criar anúncio")
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro interno do servidor: {str(e)}"
        }), 500

@facebook_data_bp.route('/facebook/business-managers', methods=['GET'])
def get_business_managers():
    """Buscar Business Managers do usuário"""
    try:
        if not facebook_data_service:
            return jsonify({
                "success": False,
                "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
            }), 500
        
        result = facebook_data_service.get_business_managers()
        
        if result.get("success"):
            return jsonify({
                "success": True,
                "businesses": result.get("businesses", [])
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Erro desconhecido ao buscar Business Managers")
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro interno do servidor: {str(e)}"
        }), 500

@facebook_data_bp.route('/facebook/ad-creatives', methods=['GET'])
def get_ad_creatives():
    """Buscar criativos de anúncios"""
    try:
        if not facebook_data_service:
            return jsonify({
                "success": False,
                "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
            }), 500
        
        limit = request.args.get('limit', 50, type=int)
        result = facebook_data_service.get_ad_creatives(limit)
        
        if result.get("success"):
            return jsonify({
                "success": True,
                "creatives": result.get("creatives", [])
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Erro desconhecido ao buscar criativos")
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro interno do servidor: {str(e)}"
        }), 500

@facebook_data_bp.route('/facebook/create-campaign', methods=['POST'])
def create_campaign():
    """Criar uma nova campanha"""
    try:
        if not facebook_data_service:
            return jsonify({
                "success": False,
                "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
            }), 500
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Dados da campanha não fornecidos"
            }), 400
        
        result = facebook_data_service.create_campaign(data)
        
        if result.get("success"):
            return jsonify(result), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Erro desconhecido ao criar campanha")
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro interno do servidor: {str(e)}"
        }), 500

@facebook_data_bp.route('/facebook/create-adset', methods=['POST'])
def create_adset():
    """Criar um novo conjunto de anúncios"""
    try:
        if not facebook_data_service:
            return jsonify({
                "success": False,
                "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
            }), 500
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Dados do conjunto de anúncios não fornecidos"
            }), 400
        
        result = facebook_data_service.create_adset(data)
        
        if result.get("success"):
            return jsonify(result), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Erro desconhecido ao criar conjunto de anúncios")
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro interno do servidor: {str(e)}"
        }), 500

@facebook_data_bp.route('/facebook/create-ad-creative', methods=['POST'])
def create_ad_creative():
    """Criar um criativo de anúncio"""
    try:
        if not facebook_data_service:
            return jsonify({
                "success": False,
                "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
            }), 500
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Dados do criativo não fornecidos"
            }), 400
        
        result = facebook_data_service.create_ad_creative(data)
        
        if result.get("success"):
            return jsonify(result), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Erro desconhecido ao criar criativo")
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro interno do servidor: {str(e)}"
        }), 500

@facebook_data_bp.route('/facebook/create-ad', methods=['POST'])
def create_ad():
    """Criar um novo anúncio"""
    try:
        if not facebook_data_service:
            return jsonify({
                "success": False,
                "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
            }), 500
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Dados do anúncio não fornecidos"
            }), 400
        
        result = facebook_data_service.create_ad(data)
        
        if result.get("success"):
            return jsonify(result), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Erro desconhecido ao criar anúncio")
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro interno do servidor: {str(e)}"
        }), 500

@facebook_data_bp.route('/facebook/upload-image', methods=['POST'])
def upload_image():
    """Fazer upload de uma imagem para a biblioteca de anúncios"""
    try:
        if not facebook_data_service:
            return jsonify({
                "success": False,
                "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
            }), 500
        
        # Verificar se há arquivo na requisição
        if 'image' not in request.files:
            return jsonify({
                "success": False,
                "error": "Nenhuma imagem fornecida"
            }), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                "success": False,
                "error": "Nenhuma imagem selecionada"
            }), 400
        
        # Salvar arquivo temporariamente
        import tempfile
        import os
        
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, file.filename)
        file.save(temp_path)
        
        try:
            result = facebook_data_service.upload_image(temp_path, file.filename)
            
            if result.get("success"):
                return jsonify(result), 200
            else:
                return jsonify({
                    "success": False,
                    "error": result.get("error", "Erro desconhecido ao fazer upload da imagem")
                }), 500
        finally:
            # Limpar arquivo temporário
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro interno do servidor: {str(e)}"
        }), 500

@facebook_data_bp.route('/facebook/targeting-options', methods=['GET'])
def get_targeting_options():
    """Buscar opções de segmentação"""
    try:
        if not facebook_data_service:
            return jsonify({
                "success": False,
                "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
            }), 500
        
        targeting_type = request.args.get('type', 'interests')
        query = request.args.get('q')
        
        result = facebook_data_service.get_targeting_options(targeting_type, query)
        
        if result.get("success"):
            return jsonify({
                "success": True,
                "options": result.get("options", [])
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Erro desconhecido ao buscar opções de segmentação")
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro interno do servidor: {str(e)}"
        }), 500

@facebook_data_bp.route('/facebook/location-targeting', methods=['GET'])
def get_location_targeting():
    """Buscar opções de segmentação geográfica"""
    try:
        if not facebook_data_service:
            return jsonify({
                "success": False,
                "error": "Serviço do Facebook não configurado. Verifique as variáveis de ambiente."
            }), 500
        
        query = request.args.get('q')
        location_types = request.args.getlist('location_types')
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Parâmetro 'q' (query) é obrigatório"
            }), 400
        
        result = facebook_data_service.get_location_targeting(query, location_types)
        
        if result.get("success"):
            return jsonify({
                "success": True,
                "locations": result.get("locations", [])
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Erro desconhecido ao buscar localizações")
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro interno do servidor: {str(e)}"
        }), 500

# ===== ROTAS DE IA PARA GERAÇÃO AUTOMÁTICA DE ANÚNCIOS =====

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
            return jsonify({
                "success": False,
                "error": "Serviço de IA não está disponível. Verifique OPENAI_API_KEY."
            }), 500
        
        if not facebook_data_service:
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
                    "headline": ai_structure.get("creative", {}).get("headline", ""),
                    "primary_text": ai_structure.get("creative", {}).get("primary_text", ""),
                    "cta": ai_structure.get("creative", {}).get("call_to_action_type", "")
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
        
        if ai_ad_service:
            status["openai_configured"] = bool(ai_ad_service.openai_api_key)
        
        if facebook_data_service:
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

