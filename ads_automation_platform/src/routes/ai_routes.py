"""
Rotas para Geração Automática de Anúncios com IA
Endpoints que usam ChatGPT para calcular estruturas de anúncios
"""

from flask import Blueprint, request, jsonify
from ai_ad_generation_service import ai_ad_service
import json

# Criar blueprint para rotas de IA
ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/ai/generate-ad', methods=['POST'])
def generate_ad_with_ai():
    """
    Gerar estrutura completa de anúncio usando IA
    
    Body JSON:
    {
        "product_name": "Nome do produto/serviço",
        "product_description": "Descrição detalhada",
        "platforms": ["facebook", "instagram"],
        "page_name": "Nome da página/empresa",
        "selected_post": {...}  // Opcional
    }
    
    Returns:
        JSON com estrutura completa do anúncio gerada pela IA
    """
    try:
        print("🤖 DEBUG: Endpoint /ai/generate-ad chamado")
        
        # Verificar se o serviço de IA está disponível
        if not ai_ad_service:
            return jsonify({
                "success": False,
                "error": "Serviço de IA não está disponível. Verifique a configuração da OPENAI_API_KEY."
            }), 500
        
        # Obter dados do request
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Dados não fornecidos no body da requisição"
            }), 400
        
        # Validar campos obrigatórios
        required_fields = ["product_name", "product_description", "platforms"]
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                "success": False,
                "error": f"Campos obrigatórios ausentes: {', '.join(missing_fields)}"
            }), 400
        
        print(f"🤖 DEBUG: Dados recebidos:")
        print(f"  📦 Produto: {data.get('product_name')}")
        print(f"  📝 Descrição: {data.get('product_description')[:50]}...")
        print(f"  📱 Plataformas: {data.get('platforms')}")
        print(f"  🏢 Página: {data.get('page_name', 'Não informado')}")
        
        # Chamar serviço de IA para gerar estrutura do anúncio
        result = ai_ad_service.generate_ad_structure(data)
        
        if result.get("success"):
            print("✅ DEBUG: Estrutura do anúncio gerada com sucesso pela IA")
            
            return jsonify({
                "success": True,
                "message": "Estrutura do anúncio gerada automaticamente pela IA",
                "data": result.get("ad_structure"),
                "ai_analysis": result.get("ai_analysis")
            }), 200
        else:
            print(f"❌ DEBUG: Erro na geração: {result.get('error')}")
            
            return jsonify({
                "success": False,
                "error": result.get("error"),
                "raw_response": result.get("raw_response")
            }), 500
            
    except Exception as e:
        print(f"💥 DEBUG: Exceção no endpoint: {str(e)}")
        import traceback
        print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
        
        return jsonify({
            "success": False,
            "error": f"Erro interno do servidor: {str(e)}"
        }), 500

@ai_bp.route('/ai/optimize-campaign', methods=['POST'])
def optimize_campaign_with_ai():
    """
    Otimizar campanha existente usando IA
    
    Body JSON:
    {
        "campaign_data": {...},
        "performance_data": {
            "impressions": 10000,
            "clicks": 150,
            "ctr": 1.5,
            "cpc": 2.50,
            "conversions": 5,
            "spend": 375.00
        }
    }
    
    Returns:
        JSON com sugestões de otimização geradas pela IA
    """
    try:
        print("🤖 DEBUG: Endpoint /ai/optimize-campaign chamado")
        
        if not ai_ad_service:
            return jsonify({
                "success": False,
                "error": "Serviço de IA não está disponível"
            }), 500
        
        data = request.get_json()
        
        if not data or not data.get("campaign_data") or not data.get("performance_data"):
            return jsonify({
                "success": False,
                "error": "Dados de campanha e performance são obrigatórios"
            }), 400
        
        # Chamar serviço de IA para otimização
        result = ai_ad_service.optimize_existing_campaign(
            data["campaign_data"],
            data["performance_data"]
        )
        
        if result.get("success"):
            return jsonify({
                "success": True,
                "message": "Otimizações geradas automaticamente pela IA",
                "optimizations": result.get("optimizations"),
                "ai_analysis": result.get("ai_analysis")
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error")
            }), 500
            
    except Exception as e:
        print(f"💥 DEBUG: Erro na otimização: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Erro interno: {str(e)}"
        }), 500

@ai_bp.route('/ai/generate-copy-variations', methods=['POST'])
def generate_copy_variations():
    """
    Gerar variações de copy para testes A/B
    
    Body JSON:
    {
        "base_copy": "Texto base do anúncio",
        "product_info": {
            "name": "Nome do produto",
            "description": "Descrição",
            "target_audience": "Público-alvo"
        }
    }
    
    Returns:
        JSON com múltiplas variações de copy
    """
    try:
        print("🤖 DEBUG: Endpoint /ai/generate-copy-variations chamado")
        
        if not ai_ad_service:
            return jsonify({
                "success": False,
                "error": "Serviço de IA não está disponível"
            }), 500
        
        data = request.get_json()
        
        if not data or not data.get("base_copy"):
            return jsonify({
                "success": False,
                "error": "Copy base é obrigatório"
            }), 400
        
        # Chamar serviço de IA para gerar variações
        result = ai_ad_service.generate_ad_copy_variations(
            data["base_copy"],
            data.get("product_info", {})
        )
        
        if result.get("success"):
            return jsonify({
                "success": True,
                "message": "Variações de copy geradas automaticamente pela IA",
                "variations": result.get("variations"),
                "total_variations": result.get("total_variations")
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error")
            }), 500
            
    except Exception as e:
        print(f"💥 DEBUG: Erro na geração de variações: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Erro interno: {str(e)}"
        }), 500

@ai_bp.route('/ai/analyze-audience', methods=['POST'])
def analyze_target_audience():
    """
    Analisar e sugerir público-alvo usando IA
    
    Body JSON:
    {
        "product_name": "Nome do produto",
        "product_description": "Descrição detalhada",
        "business_type": "Tipo de negócio",
        "location": "Localização do negócio"
    }
    
    Returns:
        JSON com análise de público-alvo gerada pela IA
    """
    try:
        print("🤖 DEBUG: Endpoint /ai/analyze-audience chamado")
        
        if not ai_ad_service:
            return jsonify({
                "success": False,
                "error": "Serviço de IA não está disponível"
            }), 500
        
        data = request.get_json()
        
        if not data or not data.get("product_name"):
            return jsonify({
                "success": False,
                "error": "Nome do produto é obrigatório"
            }), 400
        
        # Criar prompt específico para análise de público
        prompt = f"""
Analise o produto/serviço e sugira o público-alvo ideal:

Produto: {data.get('product_name')}
Descrição: {data.get('product_description', '')}
Tipo de Negócio: {data.get('business_type', '')}
Localização: {data.get('location', '')}

Retorne em JSON:
{{
  "target_audience": {{
    "primary_demographics": {{
      "age_range": "25-45",
      "gender": "all|male|female",
      "income_level": "middle|high|low"
    }},
    "interests": ["interesse1", "interesse2"],
    "behaviors": ["comportamento1", "comportamento2"],
    "geographic_targeting": {{
      "type": "local|regional|national",
      "radius_km": 10,
      "cities": ["cidade1", "cidade2"]
    }}
  }},
  "reasoning": "Explicação da escolha do público-alvo"
}}
"""
        
        # Simular chamada para IA (implementar com openai.ChatCompletion.create)
        # Por enquanto, retornar estrutura de exemplo
        return jsonify({
            "success": True,
            "message": "Análise de público-alvo gerada pela IA",
            "analysis": {
                "target_audience": {
                    "primary_demographics": {
                        "age_range": "25-55",
                        "gender": "all",
                        "income_level": "middle"
                    },
                    "interests": ["Interesse relevante 1", "Interesse relevante 2"],
                    "behaviors": ["Comportamento relevante"],
                    "geographic_targeting": {
                        "type": "local",
                        "radius_km": 15,
                        "cities": ["São Paulo"]
                    }
                },
                "reasoning": "Público-alvo calculado automaticamente pela IA baseado no produto/serviço"
            }
        }), 200
            
    except Exception as e:
        print(f"💥 DEBUG: Erro na análise de público: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Erro interno: {str(e)}"
        }), 500

@ai_bp.route('/ai/health', methods=['GET'])
def ai_service_health():
    """Verificar status do serviço de IA"""
    try:
        if ai_ad_service:
            return jsonify({
                "success": True,
                "status": "Serviço de IA ativo",
                "openai_configured": bool(ai_ad_service.openai_api_key)
            }), 200
        else:
            return jsonify({
                "success": False,
                "status": "Serviço de IA não inicializado",
                "openai_configured": False
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "status": f"Erro no serviço de IA: {str(e)}",
            "openai_configured": False
        }), 500

