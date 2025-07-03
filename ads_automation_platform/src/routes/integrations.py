from flask import Blueprint, request, jsonify
from src.models.performance import db, PlatformAccount
from src.services.api_integrations import APIIntegrationService, create_api_instance
from datetime import datetime, timedelta
import json

integrations_bp = Blueprint('integrations', __name__)

@integrations_bp.route('/integrations/platforms', methods=['GET'])
def get_platform_accounts():
    """Listar contas de plataformas conectadas do usuário"""
    try:
        user_id = request.args.get('user_id', 1, type=int)  # Placeholder
        
        accounts = PlatformAccount.query.filter_by(user_id=user_id, is_active=True).all()
        return jsonify({
            'success': True,
            'accounts': [account.to_dict() for account in accounts]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@integrations_bp.route('/integrations/platforms', methods=['POST'])
def connect_platform():
    """Conectar uma nova conta de plataforma"""
    try:
        data = request.get_json()
        
        # Validação básica
        required_fields = ['platform', 'account_id', 'access_token']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Campo {field} é obrigatório'}), 400
        
        # Verificar se a conta já existe
        existing_account = PlatformAccount.query.filter_by(
            user_id=data.get('user_id', 1),
            platform=data['platform'],
            account_id=data['account_id']
        ).first()
        
        if existing_account:
            # Atualizar tokens existentes
            existing_account.access_token = data['access_token']
            existing_account.refresh_token = data.get('refresh_token')
            existing_account.token_expires_at = datetime.fromisoformat(data['token_expires_at']) if data.get('token_expires_at') else None
            existing_account.is_active = True
            account = existing_account
        else:
            # Criar nova conta
            account = PlatformAccount(
                user_id=data.get('user_id', 1),
                platform=data['platform'],
                account_id=data['account_id'],
                account_name=data.get('account_name'),
                access_token=data['access_token'],
                refresh_token=data.get('refresh_token'),
                token_expires_at=datetime.fromisoformat(data['token_expires_at']) if data.get('token_expires_at') else None,
                is_active=True
            )
            db.session.add(account)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'account': account.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@integrations_bp.route('/integrations/platforms/<int:account_id>', methods=['DELETE'])
def disconnect_platform(account_id):
    """Desconectar uma conta de plataforma"""
    try:
        account = PlatformAccount.query.get_or_404(account_id)
        account.is_active = False
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Conta desconectada com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@integrations_bp.route('/integrations/sync-campaign', methods=['POST'])
def sync_campaign_to_platform():
    """Sincronizar uma campanha local com a plataforma externa"""
    try:
        data = request.get_json()
        campaign_id = data.get('campaign_id')
        platform = data.get('platform')
        
        if not campaign_id or not platform:
            return jsonify({'success': False, 'error': 'campaign_id e platform são obrigatórios'}), 400
        
        # Buscar credenciais da plataforma
        user_id = data.get('user_id', 1)
        platform_account = PlatformAccount.query.filter_by(
            user_id=user_id,
            platform=platform,
            is_active=True
        ).first()
        
        if not platform_account:
            return jsonify({'success': False, 'error': f'Conta da plataforma {platform} não encontrada'}), 404
        
        # Criar instância da API
        credentials = {
            'access_token': platform_account.access_token,
            'account_id': platform_account.account_id,
            'developer_token': data.get('developer_token')  # Para Google Ads
        }
        
        api_instance = create_api_instance(platform, credentials)
        if not api_instance:
            return jsonify({'success': False, 'error': f'Plataforma {platform} não suportada'}), 400
        
        # Buscar dados da campanha local
        from src.models.campaign import Campaign
        campaign = Campaign.query.get_or_404(campaign_id)
        
        # Preparar dados para a API
        campaign_data = {
            'name': campaign.name,
            'status': campaign.status,
            'budget': campaign.budget,
            'objective': campaign.objective
        }
        
        # Criar ou atualizar campanha na plataforma
        if campaign.platform_campaign_id:
            # Atualizar campanha existente
            result = api_instance.update_campaign(campaign.platform_campaign_id, campaign_data)
        else:
            # Criar nova campanha
            result = api_instance.create_campaign(campaign_data)
            
            if result.get('success') and result.get('platform_campaign_id'):
                # Salvar ID da campanha na plataforma
                campaign.platform_campaign_id = result['platform_campaign_id']
                db.session.commit()
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@integrations_bp.route('/integrations/sync-performance', methods=['POST'])
def sync_performance_data():
    """Sincronizar dados de performance das plataformas"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 1)
        days_back = data.get('days_back', 7)
        
        # Calcular datas
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days_back)
        
        # Buscar todas as contas ativas do usuário
        platform_accounts = PlatformAccount.query.filter_by(user_id=user_id, is_active=True).all()
        
        sync_results = []
        
        for account in platform_accounts:
            try:
                # Criar instância da API
                credentials = {
                    'access_token': account.access_token,
                    'account_id': account.account_id,
                    'developer_token': data.get('developer_token')  # Para Google Ads
                }
                
                api_instance = create_api_instance(account.platform, credentials)
                if not api_instance:
                    continue
                
                # Buscar campanhas da plataforma
                from src.models.campaign import Campaign
                campaigns = Campaign.query.filter_by(
                    user_id=user_id,
                    platform=account.platform
                ).filter(Campaign.platform_campaign_id.isnot(None)).all()
                
                for campaign in campaigns:
                    # Sincronizar dados de performance
                    performance_result = api_instance.get_campaign_performance(
                        campaign.platform_campaign_id,
                        start_date.strftime('%Y-%m-%d'),
                        end_date.strftime('%Y-%m-%d')
                    )
                    
                    if performance_result.get('success'):
                        # Processar e salvar dados de performance
                        # (Implementação específica dependeria do formato de resposta de cada API)
                        sync_results.append({
                            'campaign_id': campaign.id,
                            'platform': account.platform,
                            'success': True,
                            'data_points': len(performance_result.get('data', []))
                        })
                    else:
                        sync_results.append({
                            'campaign_id': campaign.id,
                            'platform': account.platform,
                            'success': False,
                            'error': performance_result.get('error')
                        })
                        
            except Exception as e:
                sync_results.append({
                    'platform': account.platform,
                    'success': False,
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'sync_results': sync_results,
            'total_accounts': len(platform_accounts),
            'period': f'{start_date} to {end_date}'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@integrations_bp.route('/integrations/bulk-actions', methods=['POST'])
def execute_bulk_actions():
    """Executar ações em lote nas plataformas"""
    try:
        data = request.get_json()
        action = data.get('action')  # 'pause', 'resume', 'update_budget'
        campaign_ids = data.get('campaign_ids', [])
        user_id = data.get('user_id', 1)
        
        if not action or not campaign_ids:
            return jsonify({'success': False, 'error': 'action e campaign_ids são obrigatórios'}), 400
        
        # Buscar campanhas
        from src.models.campaign import Campaign
        campaigns = Campaign.query.filter(
            Campaign.id.in_(campaign_ids),
            Campaign.user_id == user_id
        ).all()
        
        # Agrupar por plataforma
        campaigns_by_platform = {}
        for campaign in campaigns:
            if campaign.platform not in campaigns_by_platform:
                campaigns_by_platform[campaign.platform] = []
            campaigns_by_platform[campaign.platform].append(campaign)
        
        results = []
        
        for platform, platform_campaigns in campaigns_by_platform.items():
            # Buscar credenciais da plataforma
            platform_account = PlatformAccount.query.filter_by(
                user_id=user_id,
                platform=platform,
                is_active=True
            ).first()
            
            if not platform_account:
                for campaign in platform_campaigns:
                    results.append({
                        'campaign_id': campaign.id,
                        'success': False,
                        'error': f'Conta da plataforma {platform} não encontrada'
                    })
                continue
            
            # Criar instância da API
            credentials = {
                'access_token': platform_account.access_token,
                'account_id': platform_account.account_id,
                'developer_token': data.get('developer_token')
            }
            
            api_instance = create_api_instance(platform, credentials)
            if not api_instance:
                for campaign in platform_campaigns:
                    results.append({
                        'campaign_id': campaign.id,
                        'success': False,
                        'error': f'Plataforma {platform} não suportada'
                    })
                continue
            
            # Executar ação para cada campanha
            for campaign in platform_campaigns:
                if not campaign.platform_campaign_id:
                    results.append({
                        'campaign_id': campaign.id,
                        'success': False,
                        'error': 'Campanha não sincronizada com a plataforma'
                    })
                    continue
                
                try:
                    if action == 'pause':
                        success = api_instance.pause_campaign(campaign.platform_campaign_id)
                        if success:
                            campaign.status = 'paused'
                    elif action == 'resume':
                        success = api_instance.resume_campaign(campaign.platform_campaign_id)
                        if success:
                            campaign.status = 'active'
                    elif action == 'update_budget':
                        budget_data = {'budget': data.get('new_budget')}
                        result = api_instance.update_campaign(campaign.platform_campaign_id, budget_data)
                        success = result.get('success', False)
                        if success:
                            campaign.budget = data.get('new_budget')
                    else:
                        success = False
                    
                    results.append({
                        'campaign_id': campaign.id,
                        'success': success
                    })
                    
                except Exception as e:
                    results.append({
                        'campaign_id': campaign.id,
                        'success': False,
                        'error': str(e)
                    })
        
        # Salvar alterações no banco
        db.session.commit()
        
        return jsonify({
            'success': True,
            'results': results,
            'total_campaigns': len(campaign_ids),
            'successful_actions': len([r for r in results if r.get('success')])
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500



@integrations_bp.route("/integrations/facebook/create_ad", methods=["POST"])
def create_facebook_ad_endpoint():
    """Cria uma campanha, conjunto de anúncios e anúncio no Facebook."""
    from src.services.api_integrations import facebook_ads_api
    data = request.json

    # Dados necessários para criar um anúncio completo
    campaign_name = data.get("campaign_name", "Nova Campanha via API")
    ad_set_name = data.get("ad_set_name", "Novo Conjunto de Anúncios via API")
    ad_name = data.get("ad_name", "Novo Anúncio via API")
    objective = data.get("objective", "LINK_CLICKS")
    daily_budget = data.get("daily_budget", 1000) # Em centavos, ex: 1000 = R$10.00
    targeting = data.get("targeting", {"geo_locations": {"countries": ["BR"]}}) # Exemplo: Brasil
    
    # Dados para o criativo
    page_id = data.get("page_id") # ID da página do Facebook
    link_url = data.get("link_url") # URL de destino
    message = data.get("message") # Texto principal do anúncio
    image_hash = data.get("image_hash") # Hash da imagem previamente carregada (se aplicável)
    image_url = data.get("image_url") # URL da imagem (se aplicável)

    if not all([page_id, link_url, message]):
        return jsonify({"error": "Dados incompletos para criar o anúncio (page_id, link_url, message são obrigatórios)."}), 400

    try:
        # 1. Criar Campanha
        campaign_response = facebook_ads_api.create_campaign(name=campaign_name, objective=objective)
        if "error" in campaign_response:
            return jsonify(campaign_response), 500
        campaign_id = campaign_response["id"]

        # 2. Criar Conjunto de Anúncios
        ad_set_response = facebook_ads_api.create_ad_set(
            campaign_id=campaign_id,
            name=ad_set_name,
            daily_budget=daily_budget,
            targeting=targeting
        )
        if "error" in ad_set_response:
            return jsonify(ad_set_response), 500
        ad_set_id = ad_set_response["id"]

        # 3. Criar Criativo do Anúncio
        object_story_spec = {
            "page_id": page_id,
            "link_data": {
                "link": link_url,
                "message": message
            }
        }
        if image_hash:
            object_story_spec["link_data"]["image_hash"] = image_hash
        elif image_url:
            object_story_spec["link_data"]["picture"] = image_url # Usar 'picture' para URL da imagem

        creative_response = facebook_ads_api.create_ad_creative(name=f"{ad_name} Creative", object_story_spec=object_story_spec)
        if "error" in creative_response:
            return jsonify(creative_response), 500
        creative_id = creative_response["id"]

        # 4. Criar Anúncio
        ad_response = facebook_ads_api.create_ad(
            ad_set_id=ad_set_id,
            creative_id=creative_id,
            name=ad_name
        )
        if "error" in ad_response:
            return jsonify(ad_response), 500

        return jsonify({"message": "Anúncio do Facebook criado com sucesso!", "ad_id": ad_response["id"]}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


