from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from src.services.llm_service import create_ad_copy_generator
from datetime import datetime

ad_generation_bp = Blueprint('ad_generation', __name__)

# Configuração para upload de arquivos
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Criar diretório de uploads se não existir
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Verificar se o arquivo tem extensão permitida"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@ad_generation_bp.route('/ad-generation/generate', methods=['POST'])
def generate_ad_copy():
    """Gerar textos de anúncios baseados em criativo e informações da empresa"""
    try:
        # Obter dados do formulário
        company_name = request.form.get('company_name')
        product_description = request.form.get('product_description', '')
        target_audience = request.form.get('target_audience', '')
        platform = request.form.get('platform', 'facebook')
        ad_objective = request.form.get('ad_objective', 'conversions')
        num_variations = int(request.form.get('num_variations', 3))
        provider_name = request.form.get('provider', 'local')
        
        if not company_name:
            return jsonify({
                'success': False,
                'error': 'Nome da empresa é obrigatório'
            }), 400
        
        # Processar upload de imagem se fornecida
        image_path = None
        if 'creative_image' in request.files:
            file = request.files['creative_image']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # Adicionar timestamp para evitar conflitos
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{timestamp}_{filename}"
                image_path = os.path.join(UPLOAD_FOLDER, filename)
                file.save(image_path)
        
        # Configurar gerador de copy
        config = {
            'openai_api_key': os.environ.get('OPENAI_API_KEY'),
            'huggingface_api_key': os.environ.get('HUGGINGFACE_API_KEY')
        }
        
        generator = create_ad_copy_generator(config)
        
        # Gerar variações de anúncio
        result = generator.generate_ad_variations(
            company_name=company_name,
            image_path=image_path,
            product_description=product_description,
            target_audience=target_audience,
            platform=platform,
            ad_objective=ad_objective,
            num_variations=num_variations,
            provider_name=provider_name
        )
        
        # Limpar arquivo temporário se foi criado
        if image_path and os.path.exists(image_path):
            try:
                os.remove(image_path)
            except:
                pass  # Ignorar erros de limpeza
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ad_generation_bp.route('/ad-generation/generate-campaign', methods=['POST'])
def generate_campaign_copy():
    """Gerar textos completos para uma campanha"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'company_name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Campo {field} é obrigatório'
                }), 400
        
        # Configurar gerador de copy
        config = {
            'openai_api_key': os.environ.get('OPENAI_API_KEY'),
            'huggingface_api_key': os.environ.get('HUGGINGFACE_API_KEY')
        }
        
        generator = create_ad_copy_generator(config)
        
        # Gerar copy para campanha
        result = generator.generate_campaign_copy(
            campaign_data=data,
            provider_name=data.get('provider', 'local')
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ad_generation_bp.route('/ad-generation/analyze-image', methods=['POST'])
def analyze_creative_image():
    """Analisar imagem criativa para extrair contexto"""
    try:
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Nenhuma imagem fornecida'
            }), 400
        
        file = request.files['image']
        if not file or not file.filename or not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': 'Formato de arquivo não suportado'
            }), 400
        
        # Salvar arquivo temporariamente
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        image_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(image_path)
        
        try:
            # Configurar gerador de copy
            config = {
                'openai_api_key': os.environ.get('OPENAI_API_KEY'),
                'huggingface_api_key': os.environ.get('HUGGINGFACE_API_KEY')
            }
            
            generator = create_ad_copy_generator(config)
            provider_name = request.form.get('provider', 'local')
            provider = generator.providers.get(provider_name)
            
            if not provider:
                return jsonify({
                    'success': False,
                    'error': f'Provedor {provider_name} não encontrado'
                }), 400
            
            # Analisar imagem
            result = provider.analyze_image(image_path)
            result['provider_used'] = provider_name
            result['analyzed_at'] = datetime.now().isoformat()
            
            return jsonify(result)
            
        finally:
            # Limpar arquivo temporário
            if os.path.exists(image_path):
                try:
                    os.remove(image_path)
                except:
                    pass
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ad_generation_bp.route('/ad-generation/providers', methods=['GET'])
def get_available_providers():
    """Listar provedores de LLM disponíveis"""
    try:
        config = {
            'openai_api_key': os.environ.get('OPENAI_API_KEY'),
            'huggingface_api_key': os.environ.get('HUGGINGFACE_API_KEY')
        }
        
        generator = create_ad_copy_generator(config)
        
        providers = []
        for name, provider in generator.providers.items():
            provider_info = {
                'name': name,
                'display_name': {
                    'local': 'Demonstração Local',
                    'openai': 'OpenAI GPT-4',
                    'huggingface': 'Hugging Face'
                }.get(name, name.title()),
                'is_default': name == generator.default_provider,
                'capabilities': {
                    'text_generation': True,
                    'image_analysis': True if name in ['openai', 'huggingface', 'local'] else False
                }
            }
            providers.append(provider_info)
        
        return jsonify({
            'success': True,
            'providers': providers,
            'default_provider': generator.default_provider
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ad_generation_bp.route('/ad-generation/templates', methods=['GET'])
def get_ad_templates():
    """Obter templates de anúncios por plataforma"""
    try:
        platform = request.args.get('platform', 'facebook')
        
        templates = {
            'facebook': {
                'headline_max_chars': 125,
                'description_max_chars': 125,
                'templates': [
                    {
                        'name': 'Oferta Especial',
                        'structure': '🎯 [Oferta] para [Público] | [Benefício Principal] | [CTA]',
                        'example': '🎯 50% OFF para novos clientes | Transforme seu negócio hoje | Clique aqui!'
                    },
                    {
                        'name': 'Problema-Solução',
                        'structure': 'Cansado de [Problema]? [Solução] é a resposta | [CTA]',
                        'example': 'Cansado de perder vendas? Nossa plataforma é a resposta | Teste grátis!'
                    },
                    {
                        'name': 'Benefício Direto',
                        'structure': '[Benefício] com [Produto/Serviço] | [Prova Social] | [CTA]',
                        'example': 'Aumente suas vendas em 300% com nossa ferramenta | +1000 clientes satisfeitos | Saiba mais!'
                    }
                ]
            },
            'google': {
                'headline_max_chars': 30,
                'description_max_chars': 90,
                'templates': [
                    {
                        'name': 'Palavra-chave + Benefício',
                        'structure': '[Palavra-chave] - [Benefício]',
                        'example': 'CRM Vendas - Aumente 50% Conversões'
                    },
                    {
                        'name': 'Pergunta + Solução',
                        'structure': '[Pergunta]? [Solução Rápida]',
                        'example': 'Precisa de Leads? Gere Mais em 30 Dias'
                    }
                ]
            },
            'linkedin': {
                'headline_max_chars': 150,
                'description_max_chars': 600,
                'templates': [
                    {
                        'name': 'B2B Profissional',
                        'structure': '[Resultado de Negócio] para [Tipo de Empresa] | [Método/Ferramenta] | [CTA Profissional]',
                        'example': 'Reduza custos operacionais em 40% para PMEs | Nossa consultoria especializada | Agende uma conversa'
                    },
                    {
                        'name': 'Case de Sucesso',
                        'structure': 'Como [Cliente] alcançou [Resultado] | [Sua Solução] pode fazer o mesmo | [CTA]',
                        'example': 'Como a Empresa X aumentou produtividade em 60% | Nossa plataforma pode fazer o mesmo | Veja o case completo'
                    }
                ]
            },
            'instagram': {
                'headline_max_chars': 125,
                'description_max_chars': 2200,
                'templates': [
                    {
                        'name': 'Visual + Emocional',
                        'structure': '✨ [Emoção/Sentimento] + [Produto] | [Hashtags] | [CTA]',
                        'example': '✨ Desperte sua criatividade com nossos cursos | #arte #criatividade #aprendizado | Link na bio!'
                    },
                    {
                        'name': 'Storytelling',
                        'structure': '[História Pessoal] + [Como o produto ajudou] | [CTA Engajamento]',
                        'example': 'Há 2 anos eu lutava para organizar minha agenda... Hoje, com este app, minha produtividade triplicou! | Conta pra mim: qual sua maior dificuldade?'
                    }
                ]
            }
        }
        
        return jsonify({
            'success': True,
            'platform': platform,
            'templates': templates.get(platform, templates['facebook'])
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ad_generation_bp.route('/ad-generation/optimize', methods=['POST'])
def optimize_ad_copy():
    """Otimizar texto de anúncio existente"""
    try:
        data = request.get_json()
        
        required_fields = ['original_text', 'optimization_goal']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Campo {field} é obrigatório'
                }), 400
        
        original_text = data['original_text']
        optimization_goal = data['optimization_goal']  # 'ctr', 'conversions', 'engagement'
        platform = data.get('platform', 'facebook')
        provider_name = data.get('provider', 'local')
        
        # Configurar gerador de copy
        config = {
            'openai_api_key': os.environ.get('OPENAI_API_KEY'),
            'huggingface_api_key': os.environ.get('HUGGINGFACE_API_KEY')
        }
        
        generator = create_ad_copy_generator(config)
        provider = generator.providers.get(provider_name)
        
        if not provider:
            return jsonify({
                'success': False,
                'error': f'Provedor {provider_name} não encontrado'
            }), 400
        
        # Construir prompt de otimização
        optimization_prompts = {
            'ctr': f"Otimize este texto de anúncio para {platform} para aumentar a taxa de cliques (CTR). Torne-o mais chamativo e irresistível:",
            'conversions': f"Otimize este texto de anúncio para {platform} para aumentar conversões. Torne-o mais persuasivo e focado em ação:",
            'engagement': f"Otimize este texto de anúncio para {platform} para aumentar engajamento. Torne-o mais envolvente e interativo:"
        }
        
        prompt = f"{optimization_prompts.get(optimization_goal, optimization_prompts['conversions'])}\n\nTexto original: {original_text}\n\nTexto otimizado:"
        
        result = provider.generate_ad_copy(prompt)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'original_text': original_text,
                'optimized_text': result['text'],
                'optimization_goal': optimization_goal,
                'platform': platform,
                'provider_used': provider_name,
                'optimized_at': datetime.now().isoformat(),
                'improvements': [
                    'Linguagem mais persuasiva',
                    'Call-to-action mais forte',
                    'Foco no benefício principal',
                    'Adequação à plataforma'
                ]
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Erro na otimização')
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

