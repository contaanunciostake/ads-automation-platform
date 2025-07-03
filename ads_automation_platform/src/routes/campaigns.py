from flask import Blueprint, request, jsonify
from src.models.campaign import db, Campaign, AdGroup, Ad, AutomationRule
from src.models.user import User
import json

campaigns_bp = Blueprint('campaigns', __name__)

@campaigns_bp.route('/campaigns', methods=['GET'])
def get_campaigns():
    """Listar todas as campanhas do usuário"""
    try:
        # Em uma implementação real, você obteria o user_id da sessão/token
        user_id = request.args.get('user_id', 1)  # Placeholder
        
        campaigns = Campaign.query.filter_by(user_id=user_id).all()
        return jsonify({
            'success': True,
            'campaigns': [campaign.to_dict() for campaign in campaigns]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@campaigns_bp.route('/campaigns', methods=['POST'])
def create_campaign():
    """Criar uma nova campanha"""
    try:
        data = request.get_json()
        
        # Validação básica
        required_fields = ['name', 'platform']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Campo {field} é obrigatório'}), 400
        
        # Criar nova campanha
        campaign = Campaign(
            name=data['name'],
            platform=data['platform'],
            status=data.get('status', 'draft'),
            budget=data.get('budget'),
            budget_type=data.get('budget_type'),
            objective=data.get('objective'),
            target_audience=json.dumps(data.get('target_audience', {})),
            user_id=data.get('user_id', 1)  # Placeholder
        )
        
        db.session.add(campaign)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'campaign': campaign.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@campaigns_bp.route('/campaigns/<int:campaign_id>', methods=['GET'])
def get_campaign(campaign_id):
    """Obter detalhes de uma campanha específica"""
    try:
        campaign = Campaign.query.get_or_404(campaign_id)
        
        # Incluir grupos de anúncios e anúncios
        campaign_data = campaign.to_dict()
        campaign_data['ad_groups'] = []
        
        for ad_group in campaign.ad_groups:
            ad_group_data = ad_group.to_dict()
            ad_group_data['ads'] = [ad.to_dict() for ad in ad_group.ads]
            campaign_data['ad_groups'].append(ad_group_data)
        
        campaign_data['automation_rules'] = [rule.to_dict() for rule in campaign.automation_rules]
        
        return jsonify({
            'success': True,
            'campaign': campaign_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@campaigns_bp.route('/campaigns/<int:campaign_id>', methods=['PUT'])
def update_campaign(campaign_id):
    """Atualizar uma campanha"""
    try:
        campaign = Campaign.query.get_or_404(campaign_id)
        data = request.get_json()
        
        # Atualizar campos permitidos
        allowed_fields = ['name', 'status', 'budget', 'budget_type', 'objective', 'target_audience']
        for field in allowed_fields:
            if field in data:
                if field == 'target_audience':
                    setattr(campaign, field, json.dumps(data[field]))
                else:
                    setattr(campaign, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'campaign': campaign.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@campaigns_bp.route('/campaigns/<int:campaign_id>', methods=['DELETE'])
def delete_campaign(campaign_id):
    """Deletar uma campanha"""
    try:
        campaign = Campaign.query.get_or_404(campaign_id)
        db.session.delete(campaign)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Campanha deletada com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@campaigns_bp.route('/campaigns/<int:campaign_id>/ad-groups', methods=['POST'])
def create_ad_group(campaign_id):
    """Criar um novo grupo de anúncios"""
    try:
        campaign = Campaign.query.get_or_404(campaign_id)
        data = request.get_json()
        
        ad_group = AdGroup(
            name=data['name'],
            status=data.get('status', 'active'),
            bid_amount=data.get('bid_amount'),
            bid_strategy=data.get('bid_strategy'),
            keywords=json.dumps(data.get('keywords', [])),
            campaign_id=campaign_id
        )
        
        db.session.add(ad_group)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'ad_group': ad_group.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@campaigns_bp.route('/ad-groups/<int:ad_group_id>/ads', methods=['POST'])
def create_ad(ad_group_id):
    """Criar um novo anúncio"""
    try:
        ad_group = AdGroup.query.get_or_404(ad_group_id)
        data = request.get_json()
        
        ad = Ad(
            name=data['name'],
            status=data.get('status', 'active'),
            ad_type=data['ad_type'],
            headline=data.get('headline'),
            description=data.get('description'),
            creative_assets=json.dumps(data.get('creative_assets', [])),
            final_url=data.get('final_url'),
            ad_group_id=ad_group_id
        )
        
        db.session.add(ad)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'ad': ad.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@campaigns_bp.route('/campaigns/<int:campaign_id>/automation-rules', methods=['POST'])
def create_automation_rule(campaign_id):
    """Criar uma nova regra de automação"""
    try:
        campaign = Campaign.query.get_or_404(campaign_id)
        data = request.get_json()
        
        rule = AutomationRule(
            name=data['name'],
            rule_type=data['rule_type'],
            conditions=json.dumps(data['conditions']),
            actions=json.dumps(data['actions']),
            is_active=data.get('is_active', True),
            campaign_id=campaign_id
        )
        
        db.session.add(rule)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'automation_rule': rule.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

