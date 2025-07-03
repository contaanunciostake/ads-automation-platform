"""
Módulo de automação e otimização de campanhas.
Este módulo contém a lógica para executar regras de automação e algoritmos de otimização.
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from src.models.campaign import Campaign, AutomationRule
from src.models.performance import PerformanceData
from src.services.api_integrations import APIIntegrationService, create_api_instance
from src.models.performance import PlatformAccount
from sqlalchemy import and_, func

class AutomationEngine:
    """Motor de automação para executar regras e otimizações"""
    
    def __init__(self, db_session):
        self.db = db_session
        self.api_service = APIIntegrationService()
    
    def execute_automation_rules(self, user_id: int = None) -> List[Dict[str, Any]]:
        """Executar todas as regras de automação ativas"""
        results = []
        
        # Buscar todas as regras ativas
        query = AutomationRule.query.filter_by(is_active=True)
        if user_id:
            query = query.join(Campaign).filter(Campaign.user_id == user_id)
        
        rules = query.all()
        
        for rule in rules:
            try:
                result = self._execute_single_rule(rule)
                results.append({
                    'rule_id': rule.id,
                    'rule_name': rule.name,
                    'campaign_id': rule.campaign_id,
                    'success': result.get('success', False),
                    'actions_taken': result.get('actions_taken', []),
                    'message': result.get('message', '')
                })
            except Exception as e:
                results.append({
                    'rule_id': rule.id,
                    'rule_name': rule.name,
                    'campaign_id': rule.campaign_id,
                    'success': False,
                    'error': str(e)
                })
        
        return results
    
    def _execute_single_rule(self, rule: AutomationRule) -> Dict[str, Any]:
        """Executar uma regra de automação específica"""
        conditions = json.loads(rule.conditions)
        actions = json.loads(rule.actions)
        
        # Verificar se as condições são atendidas
        if not self._check_conditions(rule.campaign_id, conditions):
            return {
                'success': True,
                'actions_taken': [],
                'message': 'Condições não atendidas'
            }
        
        # Executar ações
        actions_taken = []
        for action in actions:
            action_result = self._execute_action(rule.campaign_id, action)
            if action_result.get('success'):
                actions_taken.append(action_result.get('description', 'Ação executada'))
        
        return {
            'success': True,
            'actions_taken': actions_taken,
            'message': f'{len(actions_taken)} ações executadas'
        }
    
    def _check_conditions(self, campaign_id: int, conditions: List[Dict[str, Any]]) -> bool:
        """Verificar se as condições de uma regra são atendidas"""
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return False
        
        # Buscar dados de performance recentes
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=7)  # Últimos 7 dias
        
        performance_data = PerformanceData.query.filter(
            and_(
                PerformanceData.campaign_id == campaign_id,
                PerformanceData.date >= start_date,
                PerformanceData.date <= end_date
            )
        ).all()
        
        if not performance_data:
            return False
        
        # Calcular métricas agregadas
        total_impressions = sum(p.impressions for p in performance_data)
        total_clicks = sum(p.clicks for p in performance_data)
        total_conversions = sum(p.conversions for p in performance_data)
        total_cost = sum(p.cost for p in performance_data)
        total_revenue = sum(p.revenue for p in performance_data)
        
        avg_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        avg_cpc = (total_cost / total_clicks) if total_clicks > 0 else 0
        avg_roas = (total_revenue / total_cost) if total_cost > 0 else 0
        
        metrics = {
            'ctr': avg_ctr,
            'cpc': avg_cpc,
            'roas': avg_roas,
            'conversions': total_conversions,
            'cost': total_cost,
            'impressions': total_impressions,
            'clicks': total_clicks
        }
        
        # Verificar cada condição
        for condition in conditions:
            metric = condition.get('metric')
            operator = condition.get('operator')
            value = condition.get('value')
            days = condition.get('days', 1)
            
            if metric not in metrics:
                continue
            
            metric_value = metrics[metric]
            
            # Aplicar operador
            if operator == 'less_than' and metric_value >= value:
                return False
            elif operator == 'greater_than' and metric_value <= value:
                return False
            elif operator == 'equals' and metric_value != value:
                return False
            elif operator == 'less_than_or_equal' and metric_value > value:
                return False
            elif operator == 'greater_than_or_equal' and metric_value < value:
                return False
        
        return True
    
    def _execute_action(self, campaign_id: int, action: Dict[str, Any]) -> Dict[str, Any]:
        """Executar uma ação específica"""
        action_type = action.get('type')
        
        try:
            if action_type == 'pause_campaign':
                return self._pause_campaign(campaign_id)
            elif action_type == 'resume_campaign':
                return self._resume_campaign(campaign_id)
            elif action_type == 'adjust_budget':
                return self._adjust_budget(campaign_id, action.get('adjustment'))
            elif action_type == 'adjust_bid':
                return self._adjust_bid(campaign_id, action.get('adjustment'))
            elif action_type == 'send_notification':
                return self._send_notification(campaign_id, action.get('message'))
            else:
                return {'success': False, 'error': f'Tipo de ação desconhecido: {action_type}'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _pause_campaign(self, campaign_id: int) -> Dict[str, Any]:
        """Pausar uma campanha"""
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return {'success': False, 'error': 'Campanha não encontrada'}
        
        # Atualizar status local
        campaign.status = 'paused'
        self.db.commit()
        
        # Pausar na plataforma externa se sincronizada
        if campaign.platform_campaign_id:
            # Buscar credenciais da plataforma
            platform_account = PlatformAccount.query.filter_by(
                user_id=campaign.user_id,
                platform=campaign.platform,
                is_active=True
            ).first()
            
            if platform_account:
                api_instance = create_api_instance(campaign.platform, {
                    'access_token': platform_account.access_token,
                    'account_id': platform_account.account_id
                })
                
                if api_instance:
                    api_instance.pause_campaign(campaign.platform_campaign_id)
        
        return {
            'success': True,
            'description': f'Campanha {campaign.name} pausada'
        }
    
    def _resume_campaign(self, campaign_id: int) -> Dict[str, Any]:
        """Reativar uma campanha"""
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return {'success': False, 'error': 'Campanha não encontrada'}
        
        campaign.status = 'active'
        self.db.commit()
        
        if campaign.platform_campaign_id:
            platform_account = PlatformAccount.query.filter_by(
                user_id=campaign.user_id,
                platform=campaign.platform,
                is_active=True
            ).first()
            
            if platform_account:
                api_instance = create_api_instance(campaign.platform, {
                    'access_token': platform_account.access_token,
                    'account_id': platform_account.account_id
                })
                
                if api_instance:
                    api_instance.resume_campaign(campaign.platform_campaign_id)
        
        return {
            'success': True,
            'description': f'Campanha {campaign.name} reativada'
        }
    
    def _adjust_budget(self, campaign_id: int, adjustment: Dict[str, Any]) -> Dict[str, Any]:
        """Ajustar orçamento de uma campanha"""
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return {'success': False, 'error': 'Campanha não encontrada'}
        
        adjustment_type = adjustment.get('type')  # 'percentage' ou 'fixed'
        adjustment_value = adjustment.get('value')
        
        if adjustment_type == 'percentage':
            new_budget = campaign.budget * (1 + adjustment_value / 100)
        elif adjustment_type == 'fixed':
            new_budget = campaign.budget + adjustment_value
        else:
            return {'success': False, 'error': 'Tipo de ajuste inválido'}
        
        # Aplicar limites mínimos e máximos
        min_budget = adjustment.get('min_budget', 10)
        max_budget = adjustment.get('max_budget', 50000)
        new_budget = max(min_budget, min(max_budget, new_budget))
        
        old_budget = campaign.budget
        campaign.budget = new_budget
        self.db.commit()
        
        return {
            'success': True,
            'description': f'Orçamento da campanha {campaign.name} ajustado de R$ {old_budget} para R$ {new_budget}'
        }
    
    def _adjust_bid(self, campaign_id: int, adjustment: Dict[str, Any]) -> Dict[str, Any]:
        """Ajustar lances de grupos de anúncios"""
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return {'success': False, 'error': 'Campanha não encontrada'}
        
        adjustment_type = adjustment.get('type')
        adjustment_value = adjustment.get('value')
        
        adjusted_count = 0
        for ad_group in campaign.ad_groups:
            if ad_group.bid_amount:
                if adjustment_type == 'percentage':
                    new_bid = ad_group.bid_amount * (1 + adjustment_value / 100)
                elif adjustment_type == 'fixed':
                    new_bid = ad_group.bid_amount + adjustment_value
                else:
                    continue
                
                # Aplicar limites
                min_bid = adjustment.get('min_bid', 0.10)
                max_bid = adjustment.get('max_bid', 50.00)
                new_bid = max(min_bid, min(max_bid, new_bid))
                
                ad_group.bid_amount = new_bid
                adjusted_count += 1
        
        self.db.commit()
        
        return {
            'success': True,
            'description': f'Lances ajustados em {adjusted_count} grupos de anúncios da campanha {campaign.name}'
        }
    
    def _send_notification(self, campaign_id: int, message: str) -> Dict[str, Any]:
        """Enviar notificação (placeholder - implementar integração com sistema de notificações)"""
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return {'success': False, 'error': 'Campanha não encontrada'}
        
        # Aqui seria implementada a lógica de envio de notificação
        # (email, SMS, webhook, etc.)
        
        return {
            'success': True,
            'description': f'Notificação enviada para campanha {campaign.name}: {message}'
        }

class OptimizationEngine:
    """Motor de otimização baseado em machine learning e análise de dados"""
    
    def __init__(self, db_session):
        self.db = db_session
    
    def optimize_campaigns(self, user_id: int = None, days_back: int = 30) -> List[Dict[str, Any]]:
        """Analisar campanhas e sugerir otimizações"""
        recommendations = []
        
        # Buscar campanhas ativas
        query = Campaign.query.filter_by(status='active')
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        campaigns = query.all()
        
        for campaign in campaigns:
            campaign_recommendations = self._analyze_campaign_performance(campaign, days_back)
            if campaign_recommendations:
                recommendations.extend(campaign_recommendations)
        
        return recommendations
    
    def _analyze_campaign_performance(self, campaign: Campaign, days_back: int) -> List[Dict[str, Any]]:
        """Analisar performance de uma campanha e gerar recomendações"""
        recommendations = []
        
        # Buscar dados de performance
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days_back)
        
        performance_data = PerformanceData.query.filter(
            and_(
                PerformanceData.campaign_id == campaign.id,
                PerformanceData.date >= start_date,
                PerformanceData.date <= end_date
            )
        ).all()
        
        if not performance_data:
            return recommendations
        
        # Calcular métricas
        total_impressions = sum(p.impressions for p in performance_data)
        total_clicks = sum(p.clicks for p in performance_data)
        total_conversions = sum(p.conversions for p in performance_data)
        total_cost = sum(p.cost for p in performance_data)
        total_revenue = sum(p.revenue for p in performance_data)
        
        if total_impressions == 0:
            return recommendations
        
        ctr = (total_clicks / total_impressions) * 100
        cpc = total_cost / total_clicks if total_clicks > 0 else 0
        roas = total_revenue / total_cost if total_cost > 0 else 0
        conversion_rate = (total_conversions / total_clicks) * 100 if total_clicks > 0 else 0
        
        # Gerar recomendações baseadas em thresholds
        
        # CTR baixo
        if ctr < 1.0:
            recommendations.append({
                'campaign_id': campaign.id,
                'campaign_name': campaign.name,
                'type': 'improve_ctr',
                'priority': 'high',
                'current_value': round(ctr, 2),
                'benchmark': 1.0,
                'recommendation': 'CTR abaixo da média. Considere melhorar os textos dos anúncios e segmentação.',
                'suggested_actions': [
                    'Testar novos headlines e descrições',
                    'Refinar segmentação de público',
                    'Adicionar extensões de anúncios'
                ]
            })
        
        # ROAS baixo
        if roas < 2.0 and total_cost > 100:
            recommendations.append({
                'campaign_id': campaign.id,
                'campaign_name': campaign.name,
                'type': 'improve_roas',
                'priority': 'high',
                'current_value': round(roas, 2),
                'benchmark': 2.0,
                'recommendation': 'ROAS abaixo do ideal. Foque em conversões de maior valor.',
                'suggested_actions': [
                    'Otimizar landing pages',
                    'Ajustar estratégia de lances',
                    'Pausar palavras-chave de baixo desempenho'
                ]
            })
        
        # CPC alto
        if cpc > 2.0:
            recommendations.append({
                'campaign_id': campaign.id,
                'campaign_name': campaign.name,
                'type': 'reduce_cpc',
                'priority': 'medium',
                'current_value': round(cpc, 2),
                'benchmark': 2.0,
                'recommendation': 'CPC acima da média. Otimize lances e qualidade dos anúncios.',
                'suggested_actions': [
                    'Melhorar Quality Score',
                    'Usar lances automáticos',
                    'Adicionar palavras-chave negativas'
                ]
            })
        
        # Taxa de conversão baixa
        if conversion_rate < 2.0 and total_clicks > 100:
            recommendations.append({
                'campaign_id': campaign.id,
                'campaign_name': campaign.name,
                'type': 'improve_conversion_rate',
                'priority': 'medium',
                'current_value': round(conversion_rate, 2),
                'benchmark': 2.0,
                'recommendation': 'Taxa de conversão baixa. Otimize a experiência pós-clique.',
                'suggested_actions': [
                    'Melhorar landing page',
                    'Simplificar processo de conversão',
                    'Testar diferentes ofertas'
                ]
            })
        
        # Oportunidade de escala (bom desempenho, baixo volume)
        if roas > 3.0 and total_impressions < 10000:
            recommendations.append({
                'campaign_id': campaign.id,
                'campaign_name': campaign.name,
                'type': 'scale_campaign',
                'priority': 'low',
                'current_value': total_impressions,
                'benchmark': 10000,
                'recommendation': 'Campanha com bom desempenho e baixo volume. Considere aumentar orçamento.',
                'suggested_actions': [
                    'Aumentar orçamento diário',
                    'Expandir palavras-chave',
                    'Ampliar segmentação de público'
                ]
            })
        
        return recommendations

