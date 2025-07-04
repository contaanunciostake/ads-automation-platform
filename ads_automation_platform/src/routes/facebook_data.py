from flask import Blueprint, request, jsonify
from src.services.facebook_data_service import facebook_data_service
from datetime import datetime, timedelta
import os
import json

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
        result = facebook_data_service.get_dashboard_data()
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/campaigns', methods=['GET'])
def get_campaigns():
    """Buscar campanhas do Facebook"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        result = facebook_data_service.get_campaigns()
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/adsets', methods=['GET'])
def get_adsets():
    """Buscar conjuntos de anúncios do Facebook"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        result = facebook_data_service.get_adsets()
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/ads', methods=['GET'])
def get_ads():
    """Buscar anúncios do Facebook"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        result = facebook_data_service.get_ads()
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/insights/campaign/<campaign_id>', methods=['GET'])
def get_campaign_insights(campaign_id):
    """Buscar insights de uma campanha específica"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        result = facebook_data_service.get_campaign_insights(campaign_id)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/insights/account', methods=['GET'])
def get_account_insights():
    """Buscar insights da conta de anúncios"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        result = facebook_data_service.get_account_insights()
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/chart-data', methods=['GET'])
def get_chart_data():
    """Buscar dados para gráficos"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        days = request.args.get('days', 7, type=int)
        result = facebook_data_service.get_chart_data(days)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/business-managers', methods=['GET'])
def get_business_managers():
    """Buscar Business Managers disponíveis"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        result = facebook_data_service.get_business_managers()
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/sync-data', methods=['POST'])
def sync_facebook_data():
    """Sincronizar dados do Facebook"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        data = request.get_json()
        business_manager_id = data.get('business_manager_id')
        
        if not business_manager_id:
            return jsonify({
                'success': False, 
                'error': 'business_manager_id é obrigatório'
            }), 400
        
        result = facebook_data_service.sync_data(business_manager_id)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/campaigns/<campaign_id>/pause', methods=['POST'])
def pause_campaign(campaign_id):
    """Pausar uma campanha"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        result = facebook_data_service.pause_campaign(campaign_id)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/campaigns/<campaign_id>/activate', methods=['POST'])
def activate_campaign(campaign_id):
    """Ativar uma campanha"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        result = facebook_data_service.activate_campaign(campaign_id)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/test-endpoint', methods=['POST'])
def test_endpoint():
    """Endpoint de teste para verificar conectividade"""
    return jsonify({
        'success': True,
        'message': 'Endpoint funcionando corretamente',
        'timestamp': datetime.now().isoformat()
    })

@facebook_data_bp.route('/facebook/campaigns/<campaign_id>/toggle', methods=['POST'])
def toggle_campaign(campaign_id):
    """Alternar status de uma campanha (pausar/ativar)"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        data = request.get_json()
        action = data.get('action')  # 'pause' ou 'activate'
        
        if action == 'pause':
            result = facebook_data_service.pause_campaign(campaign_id)
        elif action == 'activate':
            result = facebook_data_service.activate_campaign(campaign_id)
        else:
            return jsonify({
                'success': False, 
                'error': 'Ação inválida. Use "pause" ou "activate"'
            }), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/campaigns/<campaign_id>/update', methods=['PUT'])
def update_campaign(campaign_id):
    """Atualizar configurações de uma campanha"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['name', 'objective', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False, 
                    'error': f'Campo obrigatório ausente: {field}'
                }), 400
        
        result = facebook_data_service.update_campaign(campaign_id, data)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/campaigns/<campaign_id>/details', methods=['GET'])
def get_campaign_details(campaign_id):
    """Buscar detalhes completos de uma campanha"""
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        result = facebook_data_service.get_campaign_details(campaign_id)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== CORREÇÃO 1: PÁGINAS REAIS DA BUSINESS MANAGER =====
@facebook_data_bp.route('/facebook/pages', methods=['GET'])
def get_pages():
    """Buscar páginas reais da Business Manager"""
    print("🔍 DEBUG: Endpoint get_pages chamado")
    
    if not facebook_data_service:
        return jsonify({
            'success': False, 
            'error': 'Serviço do Facebook não configurado. Verifique as variáveis de ambiente.'
        }), 500
    
    try:
        # Tentar buscar páginas reais da Business Manager
        result = facebook_data_service.get_business_manager_pages()
        
        if result and result.get("success"):
            print(f"✅ DEBUG: Páginas reais encontradas: {len(result.get('pages', []))}")
            return jsonify({
                'success': True,
                'data': result.get("pages", [])
            })
        else:
            print("⚠️ DEBUG: Falha ao buscar páginas reais, usando fallback")
            # Fallback para páginas de exemplo apenas se a API falhar
            example_pages = [
                {
                    'id': 'real_page_1',
                    'name': 'Sua Empresa Principal',
                    'category': 'Empresa Local',
                    'access_token': 'page_token_1',
                    'is_verified': True,
                    'followers_count': 1250
                },
                {
                    'id': 'real_page_2', 
                    'name': 'Filial Secundária',
                    'category': 'Loja de Varejo',
                    'access_token': 'page_token_2',
                    'is_verified': False,
                    'followers_count': 890
                }
            ]
            
            return jsonify({
                'success': True,
                'data': example_pages,
                'note': 'Páginas de exemplo - Configure a integração com Business Manager'
            })
            
    except Exception as e:
        print(f"❌ DEBUG: Erro ao buscar páginas: {str(e)}")
        # Em caso de erro, retornar páginas de exemplo
        example_pages = [
            {
                'id': 'demo_page_1',
                'name': 'Página Demo 1',
                'category': 'Empresa Local',
                'access_token': 'demo_token_1',
                'is_verified': False,
                'followers_count': 500
            },
            {
                'id': 'demo_page_2',
                'name': 'Página Demo 2', 
                'category': 'Tecnologia',
                'access_token': 'demo_token_2',
                'is_verified': False,
                'followers_count': 300
            }
        ]
        
        return jsonify({
            'success': True,
            'data': example_pages,
            'error': f'Erro na API: {str(e)}',
            'note': 'Usando páginas de demonstração'
        })

@facebook_data_bp.route('/facebook/generate-audience', methods=['POST'])
def generate_audience():
    """Gerar público-alvo automaticamente com IA"""
    print("🔍 DEBUG: Endpoint generate_audience chamado")
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados JSON não fornecidos'
            }), 400
        
        product_description = data.get('product_description', '')
        objective = data.get('objective', 'sales')
        
        if not product_description:
            return jsonify({
                'success': False,
                'error': 'Descrição do produto é obrigatória'
            }), 400
        
        print(f"📝 DEBUG: Gerando público para: {product_description[:50]}...")
        
        # Gerar público-alvo inteligente
        audience = generate_smart_audience(product_description, objective)
        
        return jsonify({
            'success': True,
            'data': audience
        })
        
    except Exception as e:
        print(f"❌ DEBUG: Erro ao gerar público: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }), 500

def generate_smart_audience(product_description, objective):
    """Gerar público-alvo inteligente baseado na descrição do produto"""
    
    # Análise de palavras-chave para categorização
    description_lower = product_description.lower()
    
    # Categorias e seus públicos-alvo
    categories = {
        'tecnologia': {
            'age_min': 25, 'age_max': 45, 'gender': 'all',
            'interests': ['Tecnologia', 'Inovação', 'Gadgets', 'Software'],
            'behaviors': ['Usuários de tecnologia', 'Early adopters'],
            'locations': ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília']
        },
        'moda': {
            'age_min': 18, 'age_max': 35, 'gender': 'female',
            'interests': ['Moda', 'Estilo', 'Beleza', 'Tendências'],
            'behaviors': ['Compradores de moda online', 'Seguidores de influencers'],
            'locations': ['São Paulo', 'Rio de Janeiro', 'Curitiba', 'Porto Alegre']
        },
        'fitness': {
            'age_min': 20, 'age_max': 40, 'gender': 'all',
            'interests': ['Fitness', 'Saúde', 'Academia', 'Exercícios'],
            'behaviors': ['Praticantes de exercícios', 'Interessados em saúde'],
            'locations': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Fortaleza']
        },
        'gastronomia': {
            'age_min': 25, 'age_max': 55, 'gender': 'all',
            'interests': ['Culinária', 'Restaurantes', 'Gastronomia', 'Comida'],
            'behaviors': ['Amantes da gastronomia', 'Frequentadores de restaurantes'],
            'locations': ['São Paulo', 'Rio de Janeiro', 'Salvador', 'Recife']
        },
        'educacao': {
            'age_min': 18, 'age_max': 50, 'gender': 'all',
            'interests': ['Educação', 'Cursos', 'Aprendizado', 'Desenvolvimento'],
            'behaviors': ['Interessados em educação', 'Profissionais em desenvolvimento'],
            'locations': ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília']
        },
        'saude': {
            'age_min': 30, 'age_max': 60, 'gender': 'all',
            'interests': ['Saúde', 'Medicina', 'Bem-estar', 'Cuidados médicos'],
            'behaviors': ['Preocupados com saúde', 'Usuários de serviços médicos'],
            'locations': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Curitiba']
        },
        'casa': {
            'age_min': 25, 'age_max': 55, 'gender': 'all',
            'interests': ['Decoração', 'Casa', 'Móveis', 'Design de interiores'],
            'behaviors': ['Proprietários de imóveis', 'Interessados em decoração'],
            'locations': ['São Paulo', 'Rio de Janeiro', 'Curitiba', 'Goiânia']
        },
        'automotivo': {
            'age_min': 25, 'age_max': 50, 'gender': 'male',
            'interests': ['Carros', 'Automóveis', 'Veículos', 'Mecânica'],
            'behaviors': ['Proprietários de veículos', 'Interessados em carros'],
            'locations': ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre']
        },
        'beleza': {
            'age_min': 18, 'age_max': 45, 'gender': 'female',
            'interests': ['Beleza', 'Cosméticos', 'Cuidados pessoais', 'Maquiagem'],
            'behaviors': ['Compradoras de cosméticos', 'Interessadas em beleza'],
            'locations': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador']
        }
    }
    
    # Detectar categoria baseada em palavras-chave
    detected_category = 'tecnologia'  # padrão
    
    keywords = {
        'tecnologia': ['tech', 'software', 'app', 'digital', 'sistema', 'tecnologia', 'inovação'],
        'moda': ['moda', 'roupa', 'vestido', 'estilo', 'fashion', 'look'],
        'fitness': ['fitness', 'academia', 'treino', 'exercício', 'saúde', 'corpo'],
        'gastronomia': ['comida', 'restaurante', 'culinária', 'chef', 'prato', 'gastronomia'],
        'educacao': ['curso', 'educação', 'ensino', 'aprender', 'escola', 'universidade'],
        'saude': ['saúde', 'médico', 'clínica', 'tratamento', 'medicina', 'hospital'],
        'casa': ['casa', 'móveis', 'decoração', 'design', 'interiores', 'lar'],
        'automotivo': ['carro', 'auto', 'veículo', 'mecânica', 'automóvel'],
        'beleza': ['beleza', 'cosmético', 'maquiagem', 'skincare', 'estética']
    }
    
    for category, words in keywords.items():
        if any(word in description_lower for word in words):
            detected_category = category
            break
    
    # Obter configuração da categoria detectada
    audience_config = categories[detected_category]
    
    # Ajustar baseado no objetivo
    if objective == 'awareness':
        audience_config['age_min'] = max(18, audience_config['age_min'] - 5)
        audience_config['age_max'] = min(65, audience_config['age_max'] + 10)
    elif objective == 'leads':
        audience_config['age_min'] = max(25, audience_config['age_min'])
        audience_config['age_max'] = min(55, audience_config['age_max'])
    
    # Gerar descrição do público
    description = f"Pessoas de {audience_config['age_min']} a {audience_config['age_max']} anos interessadas em {', '.join(audience_config['interests'][:3]).lower()}"
    
    if audience_config['gender'] != 'all':
        gender_text = 'mulheres' if audience_config['gender'] == 'female' else 'homens'
        description = f"{gender_text.capitalize()} de {audience_config['age_min']} a {audience_config['age_max']} anos interessadas em {', '.join(audience_config['interests'][:3]).lower()}"
    
    return {
        'description': description,
        'category': detected_category,
        'age_min': audience_config['age_min'],
        'age_max': audience_config['age_max'],
        'gender': audience_config['gender'],
        'interests': audience_config['interests'],
        'behaviors': audience_config['behaviors'],
        'locations': audience_config['locations']
    }

# ===== CORREÇÃO 2: ROTA DE GERAÇÃO DE ANÚNCIOS =====
@facebook_data_bp.route('/ad-generation/generate-advanced', methods=['POST'])
def generate_advanced_ads():
    """Gerar anúncios avançados com IA - ROTA CORRIGIDA"""
    print("🚀 DEBUG: Endpoint generate_advanced_ads chamado")
    
    try:
        # Verificar se é multipart/form-data (com arquivos)
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Extrair dados do formulário
            form_data = {}
            for key in request.form.keys():
                value = request.form[key]
                # Tentar fazer parse de JSON para arrays
                if value.startswith('[') and value.endswith(']'):
                    try:
                        form_data[key] = json.loads(value)
                    except:
                        form_data[key] = value
                else:
                    form_data[key] = value
            
            # Extrair arquivos
            files = request.files.getlist('creative_files')
            print(f"📁 DEBUG: {len(files)} arquivos recebidos")
            
        else:
            # Dados JSON normais
            form_data = request.get_json() or {}
            files = []
        
        # Validar dados obrigatórios
        required_fields = ['page_id', 'product_description', 'placements']
        for field in required_fields:
            if field not in form_data or not form_data[field]:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório ausente: {field}'
                }), 400
        
        print(f"📝 DEBUG: Gerando anúncios para página: {form_data['page_id']}")
        print(f"📝 DEBUG: Produto: {form_data['product_description'][:50]}...")
        print(f"📝 DEBUG: Posicionamentos: {form_data['placements']}")
        
        # Gerar variações de anúncios
        num_variations = int(form_data.get('num_variations', 3))
        variations = []
        
        for i in range(num_variations):
            variation = generate_ad_variation(
                form_data['product_description'],
                form_data.get('target_audience', ''),
                form_data.get('ad_objective', 'sales'),
                i + 1
            )
            variations.append(variation)
        
        print(f"✅ DEBUG: {len(variations)} variações geradas com sucesso")
        
        return jsonify({
            'success': True,
            'variations': variations,
            'total_generated': len(variations),
            'placements_used': form_data['placements'],
            'files_processed': len(files)
        })
        
    except Exception as e:
        print(f"❌ DEBUG: Erro ao gerar anúncios: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }), 500

def generate_ad_variation(product_description, target_audience, objective, variation_number):
    """Gerar uma variação de anúncio com IA"""
    
    # Templates baseados no objetivo
    templates = {
        'awareness': {
            'headlines': [
                f"Descubra {product_description.split()[0] if product_description else 'Nossa Novidade'}!",
                f"Conheça a Revolução em {product_description.split()[-1] if product_description else 'Produtos'}",
                f"Você Precisa Ver Isso: {product_description.split()[0] if product_description else 'Inovação'}"
            ],
            'descriptions': [
                "Uma nova forma de ver o mundo. Descubra agora!",
                "Inovação que vai mudar sua vida. Saiba mais!",
                "A solução que você estava esperando chegou!"
            ]
        },
        'traffic': {
            'headlines': [
                f"Visite Nosso Site e Descubra {product_description.split()[0] if product_description else 'Mais'}",
                f"Clique e Conheça {product_description.split()[-1] if product_description else 'Nossa Oferta'}",
                f"Acesse Agora: {product_description.split()[0] if product_description else 'Novidades'}"
            ],
            'descriptions': [
                "Clique para descobrir ofertas exclusivas no nosso site!",
                "Visite nossa página e encontre exatamente o que procura!",
                "Acesse agora e aproveite condições especiais!"
            ]
        },
        'engagement': {
            'headlines': [
                f"❤️ Curta se Você Ama {product_description.split()[0] if product_description else 'Qualidade'}!",
                f"💬 Comente: O Que Você Acha de {product_description.split()[-1] if product_description else 'Nossa Ideia'}?",
                f"🔄 Compartilhe com Quem Precisa de {product_description.split()[0] if product_description else 'Isso'}!"
            ],
            'descriptions': [
                "Marque seus amigos que vão adorar isso! 👥",
                "Deixe seu comentário e participe da conversa! 💭",
                "Compartilhe se você concorda! 🚀"
            ]
        },
        'leads': {
            'headlines': [
                f"📧 Cadastre-se e Receba Mais Sobre {product_description.split()[0] if product_description else 'Nossos Produtos'}",
                f"🎁 Oferta Exclusiva: {product_description.split()[-1] if product_description else 'Cadastro Grátis'}",
                f"📋 Preencha o Formulário e Ganhe {product_description.split()[0] if product_description else 'Benefícios'}"
            ],
            'descriptions': [
                "Cadastre-se gratuitamente e receba ofertas exclusivas!",
                "Preencha seus dados e ganhe acesso a conteúdo premium!",
                "Formulário rápido para você não perder nenhuma novidade!"
            ]
        },
        'app_promotion': {
            'headlines': [
                f"📱 Baixe o App e Tenha {product_description.split()[0] if product_description else 'Tudo'} na Palma da Mão",
                f"⬇️ Download Grátis: {product_description.split()[-1] if product_description else 'Nosso App'}",
                f"🚀 App Revolucionário para {product_description.split()[0] if product_description else 'Você'}"
            ],
            'descriptions': [
                "Baixe grátis na App Store e Google Play!",
                "Aplicativo gratuito com funcionalidades incríveis!",
                "Download rápido e fácil. Experimente agora!"
            ]
        },
        'sales': {
            'headlines': [
                f"🛒 Compre Agora: {product_description.split()[0] if product_description else 'Oferta Especial'}!",
                f"💰 Promoção Limitada em {product_description.split()[-1] if product_description else 'Produtos Selecionados'}",
                f"🔥 Últimas Unidades de {product_description.split()[0] if product_description else 'Nosso Best-Seller'}"
            ],
            'descriptions': [
                "Aproveite nossa promoção especial por tempo limitado!",
                "Compre agora e ganhe frete grátis + desconto exclusivo!",
                "Oferta imperdível! Não deixe para depois!"
            ]
        }
    }
    
    # Selecionar template baseado no objetivo
    template = templates.get(objective, templates['sales'])
    
    # Selecionar elementos baseado no número da variação
    headline_index = (variation_number - 1) % len(template['headlines'])
    description_index = (variation_number - 1) % len(template['descriptions'])
    
    headline = template['headlines'][headline_index]
    description = template['descriptions'][description_index]
    
    # Gerar texto completo
    full_text = f"{headline}\n\n{description}\n\n{product_description[:100]}..."
    
    # Adicionar call-to-action baseado no objetivo
    ctas = {
        'awareness': 'Saiba Mais',
        'traffic': 'Visite o Site',
        'engagement': 'Curta e Compartilhe',
        'leads': 'Cadastre-se Grátis',
        'app_promotion': 'Baixar App',
        'sales': 'Comprar Agora'
    }
    
    cta = ctas.get(objective, 'Saiba Mais')
    
    return {
        'id': variation_number,
        'headline': headline,
        'description': description,
        'full_text': full_text,
        'call_to_action': cta,
        'objective': objective,
        'target_audience': target_audience,
        'created_at': datetime.now().isoformat()
    }

# Manter todas as outras rotas existentes...
@facebook_data_bp.route('/facebook/ad-formats', methods=['GET'])
def get_ad_formats():
    """Buscar formatos de anúncios disponíveis"""
    try:
        formats = [
            {
                'id': 'single_image',
                'name': 'Imagem Única',
                'description': 'Anúncio com uma única imagem',
                'specs': {
                    'image_ratio': '1.91:1',
                    'image_size': '1200x628',
                    'file_size_max': '30MB',
                    'formats': ['JPG', 'PNG']
                },
                'placements': ['feed', 'right_column', 'marketplace'],
                'recommended_for': ['Produtos', 'Serviços', 'Eventos']
            },
            {
                'id': 'single_video',
                'name': 'Vídeo Único',
                'description': 'Anúncio com um único vídeo',
                'specs': {
                    'video_ratio': '16:9',
                    'video_length': '1-240 segundos',
                    'file_size_max': '4GB',
                    'formats': ['MP4', 'MOV']
                },
                'placements': ['feed', 'stories', 'reels'],
                'recommended_for': ['Demonstrações', 'Tutoriais', 'Entretenimento']
            },
            {
                'id': 'carousel',
                'name': 'Carrossel',
                'description': 'Múltiplas imagens ou vídeos em sequência',
                'specs': {
                    'cards_min': 2,
                    'cards_max': 10,
                    'image_ratio': '1:1',
                    'image_size': '1080x1080',
                    'file_size_max': '30MB por card'
                },
                'placements': ['feed', 'marketplace'],
                'recommended_for': ['Catálogo', 'Múltiplos produtos', 'Storytelling']
            },
            {
                'id': 'collection',
                'name': 'Coleção',
                'description': 'Imagem principal + produtos em grade',
                'specs': {
                    'cover_image': '1200x628',
                    'product_images': '600x600',
                    'products_max': 50,
                    'file_size_max': '30MB'
                },
                'placements': ['feed', 'stories'],
                'recommended_for': ['E-commerce', 'Catálogos', 'Varejo']
            },
            {
                'id': 'slideshow',
                'name': 'Slideshow',
                'description': 'Vídeo criado a partir de imagens',
                'specs': {
                    'images_min': 3,
                    'images_max': 10,
                    'image_ratio': '1:1',
                    'duration': '5-15 segundos',
                    'file_size_max': '30MB'
                },
                'placements': ['feed', 'stories'],
                'recommended_for': ['Baixa conexão', 'Múltiplos produtos', 'Antes/depois']
            },
            {
                'id': 'instant_experience',
                'name': 'Experiência Instantânea',
                'description': 'Experiência imersiva em tela cheia',
                'specs': {
                    'components': ['Imagens', 'Vídeos', 'Texto', 'Botões'],
                    'load_time': 'Instantâneo',
                    'mobile_optimized': True
                },
                'placements': ['feed', 'stories'],
                'recommended_for': ['Branding', 'Storytelling', 'Experiências ricas']
            }
        ]
        
        return jsonify({
            'success': True,
            'data': formats
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/placements', methods=['GET'])
def get_placements():
    """Buscar posicionamentos disponíveis"""
    try:
        placements = [
            {
                'id': 'facebook_feed',
                'name': 'Feed do Facebook',
                'platform': 'facebook',
                'description': 'Anúncios no feed principal do Facebook',
                'specs': {
                    'image_ratio': '1.91:1',
                    'recommended_size': '1200x628',
                    'video_ratio': '16:9'
                },
                'audience_reach': 'Alto',
                'cost_level': 'Médio'
            },
            {
                'id': 'facebook_stories',
                'name': 'Stories do Facebook',
                'platform': 'facebook',
                'description': 'Anúncios em stories do Facebook',
                'specs': {
                    'image_ratio': '9:16',
                    'recommended_size': '1080x1920',
                    'video_ratio': '9:16'
                },
                'audience_reach': 'Médio',
                'cost_level': 'Baixo'
            },
            {
                'id': 'facebook_reels',
                'name': 'Reels do Facebook',
                'platform': 'facebook',
                'description': 'Anúncios em reels do Facebook',
                'specs': {
                    'video_ratio': '9:16',
                    'recommended_size': '1080x1920',
                    'duration': '15-30 segundos'
                },
                'audience_reach': 'Alto',
                'cost_level': 'Baixo'
            },
            {
                'id': 'facebook_right_column',
                'name': 'Coluna Direita',
                'platform': 'facebook',
                'description': 'Anúncios na coluna direita (desktop)',
                'specs': {
                    'image_ratio': '1.91:1',
                    'recommended_size': '1200x628',
                    'device': 'Desktop apenas'
                },
                'audience_reach': 'Baixo',
                'cost_level': 'Muito Baixo'
            },
            {
                'id': 'facebook_marketplace',
                'name': 'Marketplace',
                'platform': 'facebook',
                'description': 'Anúncios no Facebook Marketplace',
                'specs': {
                    'image_ratio': '1:1',
                    'recommended_size': '1080x1080',
                    'category': 'E-commerce'
                },
                'audience_reach': 'Médio',
                'cost_level': 'Médio'
            },
            {
                'id': 'instagram_feed',
                'name': 'Feed do Instagram',
                'platform': 'instagram',
                'description': 'Anúncios no feed do Instagram',
                'specs': {
                    'image_ratio': '1:1',
                    'recommended_size': '1080x1080',
                    'video_ratio': '4:5'
                },
                'audience_reach': 'Alto',
                'cost_level': 'Médio'
            },
            {
                'id': 'instagram_stories',
                'name': 'Stories do Instagram',
                'platform': 'instagram',
                'description': 'Anúncios em stories do Instagram',
                'specs': {
                    'image_ratio': '9:16',
                    'recommended_size': '1080x1920',
                    'video_ratio': '9:16'
                },
                'audience_reach': 'Alto',
                'cost_level': 'Baixo'
            },
            {
                'id': 'instagram_reels',
                'name': 'Reels do Instagram',
                'platform': 'instagram',
                'description': 'Anúncios em reels do Instagram',
                'specs': {
                    'video_ratio': '9:16',
                    'recommended_size': '1080x1920',
                    'duration': '15-30 segundos'
                },
                'audience_reach': 'Muito Alto',
                'cost_level': 'Baixo'
            },
            {
                'id': 'instagram_explore',
                'name': 'Explorar do Instagram',
                'platform': 'instagram',
                'description': 'Anúncios na aba Explorar',
                'specs': {
                    'image_ratio': '1:1',
                    'recommended_size': '1080x1080',
                    'discovery': True
                },
                'audience_reach': 'Médio',
                'cost_level': 'Médio'
            },
            {
                'id': 'messenger_inbox',
                'name': 'Caixa de Entrada do Messenger',
                'platform': 'messenger',
                'description': 'Anúncios na caixa de entrada',
                'specs': {
                    'image_ratio': '1.91:1',
                    'recommended_size': '1200x628',
                    'interactive': True
                },
                'audience_reach': 'Baixo',
                'cost_level': 'Baixo'
            },
            {
                'id': 'messenger_stories',
                'name': 'Stories do Messenger',
                'platform': 'messenger',
                'description': 'Anúncios em stories do Messenger',
                'specs': {
                    'image_ratio': '9:16',
                    'recommended_size': '1080x1920',
                    'video_ratio': '9:16'
                },
                'audience_reach': 'Muito Baixo',
                'cost_level': 'Muito Baixo'
            }
        ]
        
        return jsonify({
            'success': True,
            'data': placements
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/objectives', methods=['GET'])
def get_objectives():
    """Buscar objetivos de campanha disponíveis"""
    try:
        objectives = [
            {
                'id': 'awareness',
                'name': 'Reconhecimento',
                'description': 'Aumentar o conhecimento sobre sua marca',
                'category': 'Awareness',
                'optimization': 'Impressões',
                'billing': 'CPM',
                'best_for': ['Lançamentos', 'Branding', 'Novos produtos'],
                'placements_recommended': ['feed', 'stories', 'reels']
            },
            {
                'id': 'reach',
                'name': 'Alcance',
                'description': 'Mostrar seu anúncio para o máximo de pessoas',
                'category': 'Awareness',
                'optimization': 'Alcance',
                'billing': 'CPM',
                'best_for': ['Eventos locais', 'Promoções', 'Anúncios importantes'],
                'placements_recommended': ['feed', 'stories', 'right_column']
            },
            {
                'id': 'traffic',
                'name': 'Tráfego',
                'description': 'Direcionar pessoas para seu site ou app',
                'category': 'Consideration',
                'optimization': 'Cliques no link',
                'billing': 'CPC',
                'best_for': ['Sites', 'Blogs', 'Landing pages'],
                'placements_recommended': ['feed', 'stories', 'marketplace']
            },
            {
                'id': 'engagement',
                'name': 'Engajamento',
                'description': 'Aumentar curtidas, comentários e compartilhamentos',
                'category': 'Consideration',
                'optimization': 'Engajamento',
                'billing': 'CPE',
                'best_for': ['Conteúdo viral', 'Comunidade', 'Interação'],
                'placements_recommended': ['feed', 'stories', 'reels']
            },
            {
                'id': 'app_installs',
                'name': 'Instalações do App',
                'description': 'Promover downloads do seu aplicativo',
                'category': 'Consideration',
                'optimization': 'Instalações',
                'billing': 'CPI',
                'best_for': ['Apps móveis', 'Jogos', 'Aplicativos'],
                'placements_recommended': ['feed', 'stories', 'reels']
            },
            {
                'id': 'video_views',
                'name': 'Visualizações de Vídeo',
                'description': 'Promover visualizações dos seus vídeos',
                'category': 'Consideration',
                'optimization': 'ThruPlay',
                'billing': 'CPV',
                'best_for': ['Conteúdo em vídeo', 'Tutoriais', 'Entretenimento'],
                'placements_recommended': ['feed', 'stories', 'reels']
            },
            {
                'id': 'lead_generation',
                'name': 'Geração de Leads',
                'description': 'Coletar informações de contato',
                'category': 'Conversion',
                'optimization': 'Leads',
                'billing': 'CPL',
                'best_for': ['B2B', 'Serviços', 'Cadastros'],
                'placements_recommended': ['feed', 'stories']
            },
            {
                'id': 'messages',
                'name': 'Mensagens',
                'description': 'Iniciar conversas no Messenger',
                'category': 'Conversion',
                'optimization': 'Mensagens',
                'billing': 'CPM',
                'best_for': ['Atendimento', 'Vendas', 'Suporte'],
                'placements_recommended': ['feed', 'messenger']
            },
            {
                'id': 'conversions',
                'name': 'Conversões',
                'description': 'Promover ações específicas no seu site',
                'category': 'Conversion',
                'optimization': 'Conversões',
                'billing': 'CPC',
                'best_for': ['E-commerce', 'Vendas online', 'Cadastros'],
                'placements_recommended': ['feed', 'stories', 'marketplace']
            },
            {
                'id': 'catalog_sales',
                'name': 'Vendas do Catálogo',
                'description': 'Promover produtos do seu catálogo',
                'category': 'Conversion',
                'optimization': 'Valor de conversão',
                'billing': 'CPC',
                'best_for': ['E-commerce', 'Varejo', 'Produtos múltiplos'],
                'placements_recommended': ['feed', 'marketplace', 'instagram_shopping']
            },
            {
                'id': 'store_traffic',
                'name': 'Tráfego na Loja',
                'description': 'Direcionar pessoas para sua loja física',
                'category': 'Conversion',
                'optimization': 'Impressões',
                'billing': 'CPM',
                'best_for': ['Lojas físicas', 'Restaurantes', 'Serviços locais'],
                'placements_recommended': ['feed', 'stories', 'marketplace']
            }
        ]
        
        return jsonify({
            'success': True,
            'data': objectives
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Continuar com as outras rotas existentes...
@facebook_data_bp.route('/facebook/process-images', methods=['POST'])
def process_images():
    """Processar imagens para diferentes posicionamentos"""
    try:
        if 'images' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Nenhuma imagem fornecida'
            }), 400
        
        files = request.files.getlist('images')
        placements = request.form.getlist('placements')
        
        if not placements:
            return jsonify({
                'success': False,
                'error': 'Nenhum posicionamento especificado'
            }), 400
        
        processed_images = []
        
        for file in files:
            if file and file.filename:
                # Aqui você implementaria o processamento real da imagem
                # Por enquanto, retornamos dados simulados
                processed_images.append({
                    'original_name': file.filename,
                    'processed_versions': [
                        {
                            'placement': placement,
                            'url': f'/processed/{file.filename}_{placement}',
                            'dimensions': get_placement_dimensions(placement)
                        }
                        for placement in placements
                    ]
                })
        
        return jsonify({
            'success': True,
            'data': processed_images
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def get_placement_dimensions(placement):
    """Obter dimensões recomendadas para um posicionamento"""
    dimensions = {
        'facebook_feed': {'width': 1200, 'height': 628},
        'facebook_stories': {'width': 1080, 'height': 1920},
        'facebook_reels': {'width': 1080, 'height': 1920},
        'instagram_feed': {'width': 1080, 'height': 1080},
        'instagram_stories': {'width': 1080, 'height': 1920},
        'instagram_reels': {'width': 1080, 'height': 1920},
        'marketplace': {'width': 1080, 'height': 1080}
    }
    return dimensions.get(placement, {'width': 1200, 'height': 628})

@facebook_data_bp.route('/facebook/resize-image', methods=['POST'])
def resize_image():
    """Redimensionar uma imagem específica"""
    try:
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Nenhuma imagem fornecida'
            }), 400
        
        file = request.files['image']
        width = request.form.get('width', type=int)
        height = request.form.get('height', type=int)
        
        if not width or not height:
            return jsonify({
                'success': False,
                'error': 'Largura e altura são obrigatórias'
            }), 400
        
        # Aqui você implementaria o redimensionamento real
        # Por enquanto, retornamos dados simulados
        
        return jsonify({
            'success': True,
            'data': {
                'original_name': file.filename,
                'resized_url': f'/resized/{file.filename}_{width}x{height}',
                'dimensions': {'width': width, 'height': height}
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/placement-specs', methods=['GET'])
def get_placement_specs():
    """Buscar especificações detalhadas de posicionamentos"""
    try:
        specs = {
            'facebook_feed': {
                'name': 'Feed do Facebook',
                'image_specs': {
                    'ratio': '1.91:1',
                    'recommended_size': '1200x628',
                    'min_size': '600x314',
                    'max_size': '1200x628'
                },
                'video_specs': {
                    'ratio': '16:9 ou 1:1',
                    'recommended_size': '1280x720',
                    'duration': '1-240 segundos',
                    'file_size': 'Máx 4GB'
                },
                'text_limits': {
                    'headline': '40 caracteres',
                    'description': '125 caracteres',
                    'link_description': '30 caracteres'
                }
            },
            'facebook_stories': {
                'name': 'Stories do Facebook',
                'image_specs': {
                    'ratio': '9:16',
                    'recommended_size': '1080x1920',
                    'min_size': '600x1067',
                    'max_size': '1080x1920'
                },
                'video_specs': {
                    'ratio': '9:16',
                    'recommended_size': '1080x1920',
                    'duration': '1-15 segundos',
                    'file_size': 'Máx 4GB'
                },
                'text_limits': {
                    'headline': '40 caracteres',
                    'description': 'Não aplicável'
                }
            },
            'instagram_feed': {
                'name': 'Feed do Instagram',
                'image_specs': {
                    'ratio': '1:1 ou 4:5',
                    'recommended_size': '1080x1080',
                    'min_size': '600x600',
                    'max_size': '1080x1080'
                },
                'video_specs': {
                    'ratio': '4:5 ou 1:1',
                    'recommended_size': '1080x1350',
                    'duration': '1-60 segundos',
                    'file_size': 'Máx 4GB'
                },
                'text_limits': {
                    'headline': '40 caracteres',
                    'description': '125 caracteres'
                }
            },
            'instagram_stories': {
                'name': 'Stories do Instagram',
                'image_specs': {
                    'ratio': '9:16',
                    'recommended_size': '1080x1920',
                    'min_size': '600x1067',
                    'max_size': '1080x1920'
                },
                'video_specs': {
                    'ratio': '9:16',
                    'recommended_size': '1080x1920',
                    'duration': '1-15 segundos',
                    'file_size': 'Máx 4GB'
                },
                'text_limits': {
                    'headline': '40 caracteres',
                    'description': 'Não aplicável'
                }
            }
        }
        
        return jsonify({
            'success': True,
            'data': specs
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/validate-images', methods=['POST'])
def validate_images():
    """Validar imagens para posicionamentos específicos"""
    try:
        if 'images' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Nenhuma imagem fornecida'
            }), 400
        
        files = request.files.getlist('images')
        placements = request.form.getlist('placements')
        
        validation_results = []
        
        for file in files:
            if file and file.filename:
                # Aqui você implementaria a validação real
                # Por enquanto, retornamos dados simulados
                
                file_validation = {
                    'filename': file.filename,
                    'valid': True,
                    'warnings': [],
                    'errors': [],
                    'placement_compatibility': {}
                }
                
                # Simular validação para cada posicionamento
                for placement in placements:
                    file_validation['placement_compatibility'][placement] = {
                        'compatible': True,
                        'recommended_changes': []
                    }
                
                validation_results.append(file_validation)
        
        return jsonify({
            'success': True,
            'data': validation_results
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/facebook/optimize-images', methods=['POST'])
def optimize_images():
    """Otimizar imagens para melhor performance"""
    try:
        if 'images' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Nenhuma imagem fornecida'
            }), 400
        
        files = request.files.getlist('images')
        quality = request.form.get('quality', 85, type=int)
        
        optimized_images = []
        
        for file in files:
            if file and file.filename:
                # Aqui você implementaria a otimização real
                # Por enquanto, retornamos dados simulados
                
                optimized_images.append({
                    'original_name': file.filename,
                    'optimized_url': f'/optimized/{file.filename}',
                    'original_size': '2.5MB',
                    'optimized_size': '850KB',
                    'compression_ratio': '66%',
                    'quality': quality
                })
        
        return jsonify({
            'success': True,
            'data': optimized_images
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/cities/search', methods=['GET'])
def search_cities():
    """Buscar cidades brasileiras"""
    try:
        query = request.args.get('q', '').strip()
        
        if not query or len(query) < 2:
            return jsonify({
                'success': False,
                'error': 'Query deve ter pelo menos 2 caracteres'
            }), 400
        
        # Simulação de busca de cidades
        # Em produção, isso viria de uma base de dados real
        all_cities = [
            {
                'id': 'sp_sao_paulo',
                'name': 'São Paulo',
                'state': 'SP',
                'full_name': 'São Paulo, SP',
                'population': 12396372,
                'lat': -23.5505,
                'lng': -46.6333
            },
            {
                'id': 'rj_rio_de_janeiro',
                'name': 'Rio de Janeiro',
                'state': 'RJ',
                'full_name': 'Rio de Janeiro, RJ',
                'population': 6775561,
                'lat': -22.9068,
                'lng': -43.1729
            },
            {
                'id': 'mg_belo_horizonte',
                'name': 'Belo Horizonte',
                'state': 'MG',
                'full_name': 'Belo Horizonte, MG',
                'population': 2530701,
                'lat': -19.9167,
                'lng': -43.9345
            },
            {
                'id': 'df_brasilia',
                'name': 'Brasília',
                'state': 'DF',
                'full_name': 'Brasília, DF',
                'population': 3094325,
                'lat': -15.7801,
                'lng': -47.9292
            },
            {
                'id': 'pr_curitiba',
                'name': 'Curitiba',
                'state': 'PR',
                'full_name': 'Curitiba, PR',
                'population': 1963726,
                'lat': -25.4284,
                'lng': -49.2733
            },
            {
                'id': 'rs_porto_alegre',
                'name': 'Porto Alegre',
                'state': 'RS',
                'full_name': 'Porto Alegre, RS',
                'population': 1492530,
                'lat': -30.0346,
                'lng': -51.2177
            },
            {
                'id': 'ba_salvador',
                'name': 'Salvador',
                'state': 'BA',
                'full_name': 'Salvador, BA',
                'population': 2900319,
                'lat': -12.9714,
                'lng': -38.5014
            },
            {
                'id': 'ce_fortaleza',
                'name': 'Fortaleza',
                'state': 'CE',
                'full_name': 'Fortaleza, CE',
                'population': 2703391,
                'lat': -3.7319,
                'lng': -38.5267
            },
            {
                'id': 'pe_recife',
                'name': 'Recife',
                'state': 'PE',
                'full_name': 'Recife, PE',
                'population': 1661017,
                'lat': -8.0476,
                'lng': -34.8770
            },
            {
                'id': 'go_goiania',
                'name': 'Goiânia',
                'state': 'GO',
                'full_name': 'Goiânia, GO',
                'population': 1555626,
                'lat': -16.6869,
                'lng': -49.2648
            },
            {
                'id': 'am_manaus',
                'name': 'Manaus',
                'state': 'AM',
                'full_name': 'Manaus, AM',
                'population': 2255903,
                'lat': -3.1190,
                'lng': -60.0217
            },
            {
                'id': 'pa_belem',
                'name': 'Belém',
                'state': 'PA',
                'full_name': 'Belém, PA',
                'population': 1506420,
                'lat': -1.4558,
                'lng': -48.5044
            },
            {
                'id': 'sc_florianopolis',
                'name': 'Florianópolis',
                'state': 'SC',
                'full_name': 'Florianópolis, SC',
                'population': 508826,
                'lat': -27.5954,
                'lng': -48.5480
            },
            {
                'id': 'es_vitoria',
                'name': 'Vitória',
                'state': 'ES',
                'full_name': 'Vitória, ES',
                'population': 365855,
                'lat': -20.3155,
                'lng': -40.3128
            },
            {
                'id': 'mt_cuiaba',
                'name': 'Cuiabá',
                'state': 'MT',
                'full_name': 'Cuiabá, MT',
                'population': 650912,
                'lat': -15.6014,
                'lng': -56.0979
            }
        ]
        
        # Filtrar cidades baseado na query
        query_lower = query.lower()
        filtered_cities = [
            city for city in all_cities
            if query_lower in city['name'].lower() or query_lower in city['state'].lower()
        ]
        
        # Limitar a 10 resultados
        filtered_cities = filtered_cities[:10]
        
        return jsonify({
            'success': True,
            'cities': filtered_cities,
            'total': len(filtered_cities)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/cities/coordinates', methods=['POST'])
def get_city_coordinates():
    """Buscar coordenadas de uma cidade"""
    try:
        data = request.get_json()
        
        if not data or 'city_name' not in data:
            return jsonify({
                'success': False,
                'error': 'Nome da cidade é obrigatório'
            }), 400
        
        city_name = data['city_name']
        
        # Simulação de busca de coordenadas
        # Em produção, isso usaria uma API de geocoding
        coordinates = {
            'São Paulo': {'lat': -23.5505, 'lng': -46.6333},
            'Rio de Janeiro': {'lat': -22.9068, 'lng': -43.1729},
            'Belo Horizonte': {'lat': -19.9167, 'lng': -43.9345},
            'Brasília': {'lat': -15.7801, 'lng': -47.9292},
            'Curitiba': {'lat': -25.4284, 'lng': -49.2733}
        }
        
        if city_name in coordinates:
            return jsonify({
                'success': True,
                'data': {
                    'city': city_name,
                    'coordinates': coordinates[city_name]
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Cidade não encontrada'
            }), 404
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@facebook_data_bp.route('/location/radius-cities', methods=['POST'])
def get_cities_in_radius():
    """Buscar cidades dentro de um raio específico"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados JSON não fornecidos'
            }), 400
        
        required_fields = ['lat', 'lng', 'radius']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório ausente: {field}'
                }), 400
        
        center_lat = float(data['lat'])
        center_lng = float(data['lng'])
        radius = float(data['radius'])  # em km
        
        # Simulação de busca de cidades no raio
        # Em produção, isso usaria cálculos de distância real
        nearby_cities = [
            {
                'id': 'nearby_1',
                'name': 'Cidade Próxima 1',
                'state': 'SP',
                'distance': radius * 0.3,
                'population': 150000,
                'lat': center_lat + 0.1,
                'lng': center_lng + 0.1
            },
            {
                'id': 'nearby_2',
                'name': 'Cidade Próxima 2',
                'state': 'SP',
                'distance': radius * 0.7,
                'population': 89000,
                'lat': center_lat - 0.05,
                'lng': center_lng + 0.15
            },
            {
                'id': 'nearby_3',
                'name': 'Cidade Próxima 3',
                'state': 'SP',
                'distance': radius * 0.9,
                'population': 45000,
                'lat': center_lat + 0.08,
                'lng': center_lng - 0.12
            }
        ]
        
        return jsonify({
            'success': True,
            'cities': nearby_cities,
            'center': {'lat': center_lat, 'lng': center_lng},
            'radius': radius,
            'total': len(nearby_cities)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

