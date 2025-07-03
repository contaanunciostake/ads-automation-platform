import requests
import os
import json

class FacebookAdsAPI:
    def __init__(self, access_token: str, ad_account_id: str):
        self.access_token = access_token
        self.ad_account_id = ad_account_id
        self.base_url = "https://graph.facebook.com/v23.0" # Versão da API fornecida pelo usuário

    def _make_request(self, method: str, endpoint: str, data: dict = None):
        url = f"{self.base_url}/{endpoint}"
        
        files = None
        headers = {}

        if data and 'creative_file' in data: # Se houver um arquivo criativo para upload
            files = {'file': open(data['creative_file'], 'rb')}
            del data['creative_file'] # Remove do dicionário de dados para não ser enviado como JSON
        else:
            headers['Content-Type'] = 'application/json'

        params = {"access_token": self.access_token}

        try:
            if method.upper() == "POST":
                if files:
                    response = requests.post(url, params=params, data=data, files=files)
                else:
                    response = requests.post(url, params=params, json=data, headers=headers)
            elif method.upper() == "GET":
                response = requests.get(url, params=params, headers=headers)
            else:
                raise ValueError("Método HTTP não suportado")

            response.raise_for_status() # Levanta um erro para códigos de status HTTP ruins (4xx ou 5xx)
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Erro na requisição à Facebook API: {e}")
            if response:
                print(f"Resposta da API: {response.text}")
            return {"error": str(e), "api_response": response.text if response else None}

    def create_campaign(self, name: str, objective: str, status: str = "PAUSED"):
        """Cria uma nova campanha de anúncio."""
        endpoint = f"act_{self.ad_account_id}/campaigns"
        data = {
            "name": name,
            "objective": objective, # Ex: "LINK_CLICKS", "CONVERSIONS"
            "status": status,
        }
        return self._make_request("POST", endpoint, data=data)

    def create_ad_set(self, campaign_id: str, name: str, daily_budget: int, targeting: dict, status: str = "PAUSED"):
        """Cria um novo conjunto de anúncios."""
        endpoint = f"act_{self.ad_account_id}/adsets"
        data = {
            "name": name,
            "campaign_id": campaign_id,
            "daily_budget": daily_budget, # Em centavos
            "targeting": json.dumps(targeting), # O Facebook espera isso como string JSON
            "status": status,
            "optimization_goal": "IMPRESSIONS", # Exemplo, pode ser ajustado
            "billing_event": "IMPRESSIONS", # Exemplo, pode ser ajustado
        }
        return self._make_request("POST", endpoint, data=data)

    def create_ad_creative(self, name: str, object_story_spec: dict):
        """Cria um novo criativo de anúncio."""
        endpoint = f"act_{self.ad_account_id}/adcreatives"
        data = {
            "name": name,
            "object_story_spec": json.dumps(object_story_spec) # Detalhes do criativo como string JSON
        }
        return self._make_request("POST", endpoint, data=data)

    def create_ad(self, ad_set_id: str, creative_id: str, name: str, status: str = "ACTIVE"):
        """Cria um novo anúncio."""
        endpoint = f"act_{self.ad_account_id}/ads"
        data = {
            "name": name,
            "adset_id": ad_set_id,
            "creative": {"creative_id": creative_id},
            "status": status,
        }
        return self._make_request("POST", endpoint, data=data)


# --- Exemplo de uso e configuração (para ser usado em rotas ou serviços) ---

# Carregar credenciais de variáveis de ambiente (MELHOR PRÁTICA PARA PRODUÇÃO)
FACEBOOK_ACCESS_TOKEN = os.getenv("FACEBOOK_ACCESS_TOKEN")
FACEBOOK_AD_ACCOUNT_ID = os.getenv("FACEBOOK_AD_ACCOUNT_ID")

# Verificação para garantir que as variáveis foram carregadas
if not FACEBOOK_ACCESS_TOKEN or not FACEBOOK_AD_ACCOUNT_ID:
    print("ATENÇÃO: FACEBOOK_ACCESS_TOKEN ou FACEBOOK_AD_ACCOUNT_ID não configurados como variáveis de ambiente. A funcionalidade de anúncios do Facebook pode não funcionar.")
    # Em um ambiente de produção, você pode querer levantar uma exceção ou lidar com isso de forma mais robusta.

# Instanciar a API do Facebook apenas se as credenciais estiverem disponíveis
facebook_ads_api = None
if FACEBOOK_ACCESS_TOKEN and FACEBOOK_AD_ACCOUNT_ID:
    facebook_ads_api = FacebookAdsAPI(FACEBOOK_ACCESS_TOKEN, FACEBOOK_AD_ACCOUNT_ID)

# Exemplo de como você chamaria isso de uma rota (comentado para não interferir na execução)
# from flask import Blueprint, request, jsonify
# from ads_automation_platform.src.services.api_integrations import facebook_ads_api

# facebook_bp = Blueprint("facebook", __name__)

# @facebook_bp.route("/create_facebook_ad", methods=["POST"])
# def create_facebook_ad_endpoint():
#     data = request.json
#     campaign_name = data.get("campaign_name", "Nova Campanha via API")
#     ad_set_name = data.get("ad_set_name", "Novo Conjunto de Anúncios via API")
#     ad_name = data.get("ad_name", "Novo Anúncio via API")
#     image_hash = data.get("image_hash") # Hash da imagem previamente carregada
#     page_id = data.get("page_id") # ID da página do Facebook
#     link_url = data.get("link_url") # URL de destino
#     message = data.get("message") # Texto principal do anúncio

#     if not all([image_hash, page_id, link_url, message]):
#         return jsonify({"error": "Dados incompletos para criar o anúncio."}), 400

#     try:
#         # 1. Criar Campanha
#         campaign_response = facebook_ads_api.create_campaign(name=campaign_name, objective="LINK_CLICKS")
#         if "error" in campaign_response:
#             return jsonify(campaign_response), 500
#         campaign_id = campaign_response["id"]

#         # 2. Criar Conjunto de Anúncios
#         # Exemplo de targeting simples para US
#         targeting = {"geo_locations": {"countries": ["US"]}}
#         ad_set_response = facebook_ads_api.create_ad_set(
#             campaign_id=campaign_id,
#             name=ad_set_name,
#             daily_budget=1000, # 10 USD
#             targeting=targeting
#         )
#         if "error" in ad_set_response:
#             return jsonify(ad_set_response), 500
#         ad_set_id = ad_set_response["id"]

#         # 3. Criar Criativo do Anúncio
#         object_story_spec = {
#             "page_id": page_id,
#             "link_data": {
#                 "image_hash": image_hash,
#                 "link": link_url,
#                 "message": message
#             }
#         }
#         creative_response = facebook_ads_api.create_ad_creative(name="Meu Criativo", object_story_spec=object_story_spec)
#         if "error" in creative_response:
#             return jsonify(creative_response), 500
#         creative_id = creative_response["id"]

#         # 4. Criar Anúncio
#         ad_response = facebook_ads_api.create_ad(
#             ad_set_id=ad_set_id,
#             creative_id=creative_id,
#             name=ad_name
#         )
#         if "error" in ad_response:
#             return jsonify(ad_response), 500

#         return jsonify({"message": "Anúncio do Facebook criado com sucesso!", "ad_id": ad_response["id"]}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# ===============================
# NOVOS COMPONENTES REQUERIDOS
# ===============================

class APIIntegrationService:
    def __init__(self):
        if not FACEBOOK_ACCESS_TOKEN or not FACEBOOK_AD_ACCOUNT_ID:
            raise ValueError("Variáveis de ambiente do Facebook não estão configuradas.")
        self.api = FacebookAdsAPI(FACEBOOK_ACCESS_TOKEN, FACEBOOK_AD_ACCOUNT_ID)

    def get_api(self):
        return self.api

def create_api_instance():
    return APIIntegrationService().get_api()
